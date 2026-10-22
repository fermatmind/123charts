import type { IndexDataProject } from "./types";
import { acceptsProjectSchema } from "../legacy-identifiers";

const CATEGORY_SLUGS = new Set([
  "ai-agents", "ai-coding", "open-source-ai", "local-llm", "rag-tools",
  "ai-seo-tools", "ai-video-tools", "ai-design-tools", "ai-microsaas", "chinese-ai-builders",
]);

const PUBLIC_SOURCE_FIELDS = [
  "github_url", "docs_url", "product_hunt_url",
  "hacker_news_url", "founder_public_url", "launch_url",
] as const;

const VALID_LANGUAGES = new Set(["en", "zh", "ja", "de", "fr", "es", "ko", "other"]);

export interface ValidationError {
  slug?: string;
  field?: string;
  message: string;
}

export function validateIndexProject(project: IndexDataProject, sourcePath?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const s = project.slug || "unknown";

  function fail(field: string, message: string) {
    errors.push({ slug: s, field, message });
  }

  // Required fields
  if (!project.schema_version || !acceptsProjectSchema(project.schema_version)) {
    fail("schema_version", "Invalid or missing schema_version (expected 123charts-project-v1)");
  }
  if (!project.name || project.name.length > 120) fail("name", "Missing or too long name");
  if (!project.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) fail("slug", "Invalid slug format");
  if (!project.website_url || !project.website_url.startsWith("https://")) fail("website_url", "Missing or non-HTTPS website_url");
  if (!project.category_slug || !CATEGORY_SLUGS.has(project.category_slug)) fail("category_slug", "Unknown or missing category_slug");
  if (!project.one_liner || project.one_liner.length > 240) fail("one_liner", "Missing or too long one_liner");
  if (project.description && project.description.length > 1200) fail("description", "Description too long");
  if (!project.source_type) fail("source_type", "Missing source_type");
  if (!project.region) fail("region", "Missing region");
  if (!project.language || !VALID_LANGUAGES.has(project.language)) fail("language", "Invalid language code");

  // URL checks
  const urls = ["website_url", "github_url", "docs_url", "pricing_url", "product_hunt_url", "hacker_news_url", "founder_public_url", "launch_url"];
  for (const uf of urls) {
    const val = (project as unknown as Record<string, unknown>)[uf];
    if (val && typeof val === "string") {
      if (!val.startsWith("https://")) fail(uf, `URL must use https://`);
    }
  }

  // At least one public source
  const hasSource = PUBLIC_SOURCE_FIELDS.some((f) => {
    const v = (project as unknown as Record<string, unknown>)[f];
    return v && typeof v === "string" && v.trim().length > 0;
  });
  if (!hasSource) fail("public_sources", "At least one public source required beyond website_url");

  // Tags/tech_stack limits
  if (project.tags && project.tags.length > 8) fail("tags", "Max 8 tags");
  if (project.tech_stack && project.tech_stack.length > 12) fail("tech_stack", "Max 12 tech_stack entries");

  return errors;
}
