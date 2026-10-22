import type { HtmlAnalysis, ReadinessCheck, GeoCheckerResult, RobotsSitemapResult } from "./types";

const RELEVANT_SCHEMA_TYPES = new Set([
  "SoftwareApplication", "WebApplication", "Organization", "Product", "WebSite", "BreadcrumbList",
]);

export function computeScore(
  normalizedUrl: string,
  html: HtmlAnalysis,
  robotsSitemap: RobotsSitemapResult
): GeoCheckerResult {
  const checks: ReadinessCheck[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  let totalScore = 0;

  function addCheck(id: string, label: string, pass: boolean, score: number, summary: string, missingItem?: string, recommendation?: string) {
    checks.push({
      id, label,
      status: pass ? "pass" : "missing",
      score: pass ? score : 0,
      summary,
    });
    if (pass) totalScore += score;
    if (!pass && missingItem) missingItems.push(missingItem);
    if (!pass && recommendation) recommendations.push(recommendation);
  }

  // Title (10)
  addCheck("title", "Title tag",
    html.has_title, 10,
    html.has_title ? `"${html.title_text}"` : "No <title> tag found.",
    "Title tag", "Add a descriptive <title> tag to your page."
  );

  // Meta description (10)
  addCheck("meta_description", "Meta description",
    html.has_meta_description, 10,
    html.has_meta_description ? "Meta description present." : "No meta description found.",
    "Meta description", "Add a concise meta description."
  );

  // Canonical (10)
  addCheck("canonical", "Canonical URL",
    html.has_canonical, 10,
    html.has_canonical ? `Canonical: ${html.canonical_href}` : "No canonical link found.",
    "Canonical URL", "Add a canonical URL to avoid duplicate content signals."
  );

  // H1 (5)
  addCheck("h1", "H1 heading",
    html.has_h1, 5,
    html.has_h1 ? `"${html.h1_text?.slice(0, 60)}"` : "No <h1> heading found.",
    "H1 heading", "Add an <h1> heading to structure your page."
  );

  // First HTML text (15)
  const textOk = html.first_text_length > 50;
  checks.push({
    id: "first_text", label: "Readable first HTML text",
    status: textOk ? "pass" : html.first_text_length > 0 ? "partial" : "missing",
    score: textOk ? 15 : html.first_text_length > 0 ? 5 : 0,
    summary: textOk ? `${html.first_text_length}+ chars of readable text.` :
      html.first_text_length > 0 ? "Low text content detected." : "No readable text in first HTML response.",
  });
  if (textOk) totalScore += 15;
  else if (html.first_text_length > 0) totalScore += 5;
  else {
    missingItems.push("Readable first HTML text");
    recommendations.push("Ensure the first HTML response includes readable product text.");
  }

  // JSON-LD (15)
  checks.push({
    id: "jsonld", label: "JSON-LD structured data",
    status: html.jsonld_count > 0 ? "pass" : "missing",
    score: html.jsonld_count > 0 ? 15 : 0,
    summary: html.jsonld_count > 0
      ? `${html.jsonld_count} JSON-LD block(s) found, ${html.jsonld_parse_ok} valid.`
      : "No JSON-LD structured data found.",
  });
  if (html.jsonld_count > 0) totalScore += 15;
  else {
    missingItems.push("JSON-LD structured data");
    recommendations.push("Add JSON-LD structured data (e.g., SoftwareApplication, Organization).");
  }

  // Relevant schema (10)
  const hasRelevantSchema = html.schema_types.some((t) => RELEVANT_SCHEMA_TYPES.has(t));
  checks.push({
    id: "schema_type", label: "Relevant schema.org type",
    status: hasRelevantSchema ? "pass" : html.jsonld_count > 0 ? "partial" : "missing",
    score: hasRelevantSchema ? 10 : html.jsonld_count > 0 ? 3 : 0,
    summary: hasRelevantSchema
      ? `Schema types: ${html.schema_types.filter((t) => RELEVANT_SCHEMA_TYPES.has(t)).join(", ")}`
      : html.jsonld_count > 0 ? `Schema types present but not product-relevant: ${html.schema_types.join(", ")}`
        : "No relevant schema.org type found.",
  });
  if (hasRelevantSchema) totalScore += 10;
  else if (html.jsonld_count > 0) totalScore += 3;
  else {
    missingItems.push("SoftwareApplication or Organization JSON-LD");
    recommendations.push("Add a SoftwareApplication JSON-LD block for your product entity.");
  }

  // Open Graph (5)
  const hasOg = !!(html.og_title || html.og_description || html.og_image);
  addCheck("og", "Open Graph metadata",
    hasOg, 5,
    hasOg ? "OG metadata present." : "No Open Graph metadata found.",
    "Open Graph metadata", "Add Open Graph metadata for social sharing previews."
  );

  // Robots.txt reachable (5)
  addCheck("robots", "robots.txt reachable",
    robotsSitemap.robots_txt_accessible, 5,
    robotsSitemap.robots_txt_accessible ? "robots.txt is reachable." : "robots.txt not reachable or blocked.",
    undefined, "Ensure robots.txt is accessible at the site root."
  );

  // Sitemap.xml reachable (5)
  addCheck("sitemap", "sitemap.xml reachable",
    robotsSitemap.sitemap_xml_accessible, 5,
    robotsSitemap.sitemap_xml_accessible ? "sitemap.xml is reachable." : "sitemap.xml not reachable.",
    undefined, "Ensure sitemap.xml is accessible at the site root."
  );

  // Public source links (10)
  const sourceCount = html.public_source_links.length;
  const sourceOk = sourceCount > 0;
  checks.push({
    id: "public_sources", label: "Public source links",
    status: sourceOk ? "pass" : "missing",
    score: sourceOk ? Math.min(10, sourceCount * 3) : 0,
    summary: sourceOk ? `${sourceCount} public source link(s) found.` : "No public source links found.",
  });
  if (sourceOk) totalScore += Math.min(10, sourceCount * 3);
  else {
    missingItems.push("Public source links");
    recommendations.push("Expose docs, GitHub, pricing or launch pages as public source links.");
  }

  // Client-only shell risk (warning if true)
  if (html.client_only_shell_risk) {
    checks.push({
      id: "client_shell", label: "Client-only rendering risk",
      status: "warning",
      score: 0,
      summary: "Page appears to be client-rendered with minimal static HTML.",
      detail: "Search engines and AI crawlers may have difficulty indexing client-only pages.",
    });
    recommendations.push("Ensure key product information is available in static HTML.");
  }

  // Always recommend 123Charts profile
  recommendations.push("Create a free structured AI project profile on 123Charts.");

  // Grade
  totalScore = Math.min(100, Math.max(0, totalScore));
  let grade: string;
  if (totalScore >= 85) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 30) grade = "D";
  else grade = "F";

  return {
    normalized_url: normalizedUrl,
    readiness_score: totalScore,
    grade,
    checks,
    missing_items: missingItems,
    recommendations,
  };
}
