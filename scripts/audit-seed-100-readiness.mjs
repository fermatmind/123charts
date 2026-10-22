import fs from "node:fs";
import path from "node:path";
import { isIP } from "node:net";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const USER_AGENT = "123Charts-ReadinessAudit/0.1 (+https://123charts.com/geo-checker)";
const DEFAULTS = {
  dataRepo: process.env.SEED_DATA_REPO || path.resolve(ROOT, "../88cn-index-data"),
  outDir: path.join(ROOT, "data/audits/seed-100-readiness"),
  concurrency: 2,
  timeoutMs: 5000,
  maxBodyBytes: 262144,
  maxRedirects: 2,
};

const OUTCOMES = new Set([
  "ok",
  "invalid_url",
  "blocked_by_guard",
  "dns_error",
  "tls_error",
  "timeout",
  "redirect_limit",
  "http_4xx",
  "http_5xx",
  "fetch_error",
  "empty_html",
  "parse_error",
]);

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!value || !flag.startsWith("--")) continue;
    i += 1;
    if (flag === "--data-repo") args.dataRepo = path.resolve(value);
    if (flag === "--out") args.outDir = path.resolve(ROOT, value);
    if (flag === "--concurrency") args.concurrency = Math.min(2, Math.max(1, Number(value)));
    if (flag === "--timeout") args.timeoutMs = Math.max(1000, Number(value));
    if (flag === "--max-body") args.maxBodyBytes = Math.max(1024, Number(value));
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function gitSha(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

function guardUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || "").trim());
  } catch {
    return { ok: false, outcome: "invalid_url" };
  }

  if (parsed.protocol !== "https:") return { ok: false, outcome: "invalid_url" };
  if (parsed.username || parsed.password) return { ok: false, outcome: "blocked_by_guard" };
  if (parsed.port && parsed.port !== "443") return { ok: false, outcome: "blocked_by_guard" };

  const hostname = normalizeHostname(parsed.hostname);
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "test" ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid")
  ) {
    return { ok: false, outcome: "blocked_by_guard" };
  }

  if (isIP(hostname)) {
    return { ok: false, outcome: "blocked_by_guard" };
  }

  parsed.hash = "";
  parsed.search = "";
  return { ok: true, url: parsed.toString(), origin: parsed.origin, host: hostname };
}

function classifyFetchError(error) {
  if (error?.name === "AbortError" || error?.name === "TimeoutError") return "timeout";
  const code = error?.cause?.code || error?.code || "";
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) return "dns_error";
  if (["CERT_HAS_EXPIRED", "DEPTH_ZERO_SELF_SIGNED_CERT", "ERR_TLS_CERT_ALTNAME_INVALID", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"].includes(code)) {
    return "tls_error";
  }
  return "fetch_error";
}

async function fetchBounded(rawUrl, options) {
  const guarded = guardUrl(rawUrl);
  if (!guarded.ok) return { ok: false, outcome: guarded.outcome, status: null, redirectCount: 0, bodyBytes: 0, finalUrl: null };

  let currentUrl = guarded.url;
  let redirectCount = 0;
  while (redirectCount <= options.maxRedirects) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    let response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml,text/plain,application/xml",
          "User-Agent": USER_AGENT,
        },
      });
    } catch (error) {
      clearTimeout(timeout);
      return { ok: false, outcome: classifyFetchError(error), status: null, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
    }
    clearTimeout(timeout);

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) return { ok: false, outcome: "fetch_error", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
      const nextUrl = new URL(location, currentUrl).toString();
      const redirectGuard = guardUrl(nextUrl);
      if (!redirectGuard.ok) return { ok: false, outcome: "blocked_by_guard", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
      currentUrl = redirectGuard.url;
      redirectCount += 1;
      continue;
    }

    if (response.status >= 400 && response.status < 500) {
      await response.body?.cancel();
      return { ok: false, outcome: "http_4xx", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
    }
    if (response.status >= 500) {
      await response.body?.cancel();
      return { ok: false, outcome: "http_5xx", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
    }

    try {
      const reader = response.body?.getReader();
      if (!reader) return { ok: false, outcome: "empty_html", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
      const chunks = [];
      let total = 0;
      while (total <= options.maxBodyBytes) {
        const { value, done } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > options.maxBodyBytes) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
      const body = Buffer.concat(chunks).toString("utf8");
      return {
        ok: true,
        outcome: body.trim() ? "ok" : "empty_html",
        status: response.status,
        redirectCount,
        bodyBytes: Math.min(total, options.maxBodyBytes),
        finalUrl: currentUrl,
        body,
      };
    } catch {
      return { ok: false, outcome: "parse_error", status: response.status, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
    }
  }

  return { ok: false, outcome: "redirect_limit", status: null, redirectCount, bodyBytes: 0, finalUrl: currentUrl };
}

function stripText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textBucket(length) {
  if (length === 0) return "0";
  if (length < 500) return "1-499";
  if (length < 2000) return "500-1999";
  return "2000+";
}

function sanitizeSchemaType(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^https?:\/\/schema\.org\//i, "");
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,60}$/.test(trimmed)) return null;
  return trimmed;
}

function collectSchemaTypes(value, target) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaTypes(item, target);
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value;
  const typeValue = record["@type"];
  if (Array.isArray(typeValue)) {
    for (const item of typeValue) {
      const type = sanitizeSchemaType(item);
      if (type) target.add(type);
    }
  } else {
    const type = sanitizeSchemaType(typeValue);
    if (type) target.add(type);
  }
  for (const nested of Object.values(record)) {
    if (nested && typeof nested === "object") collectSchemaTypes(nested, target);
  }
}

function analyzeHtml(html) {
  const schemaTypes = new Set();
  let jsonldCount = 0;
  const jsonldRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonldRegex.exec(html)) !== null) {
    jsonldCount += 1;
    try {
      collectSchemaTypes(JSON.parse(match[1]), schemaTypes);
    } catch {
      // Invalid JSON-LD is represented by count without schema types.
    }
  }

  const textLength = stripText(html).length;
  const types = [...schemaTypes].sort().slice(0, 20);
  return {
    readableTextBucket: textBucket(textLength),
    titlePresent: /<title[^>]*>[\s\S]*?<\/title>/i.test(html),
    metaDescriptionPresent:
      /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html) ||
      /<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html),
    canonicalPresent:
      /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/i.test(html) ||
      /<link[^>]+href=["'][^"']+["'][^>]+rel=["']canonical["']/i.test(html),
    jsonldPresent: jsonldCount > 0,
    jsonldCount,
    schemaTypes: types,
    softwareApplicationSchemaPresent: types.includes("SoftwareApplication") || types.includes("WebApplication"),
    organizationSchemaPresent: types.includes("Organization"),
    openGraphPresent: /<meta[^>]+property=["']og:[^"']+["'][^>]+content=["'][^"']+["']/i.test(html),
  };
}

async function fetchStatus(url, options) {
  const result = await fetchBounded(url, options);
  return result.status ?? null;
}

function issueCodes(item) {
  const issues = [];
  if (item.audit_outcome !== "ok") issues.push(item.audit_outcome);
  if (item.audit_outcome === "ok" && item.readable_text_bucket === "0") issues.push("no_readable_text");
  if (item.audit_outcome === "ok" && item.readable_text_bucket === "1-499") issues.push("low_readable_text");
  if (item.audit_outcome === "ok" && !item.title_present) issues.push("missing_title");
  if (item.audit_outcome === "ok" && !item.meta_description_present) issues.push("missing_meta_description");
  if (item.audit_outcome === "ok" && !item.canonical_present) issues.push("missing_canonical");
  if (item.audit_outcome === "ok" && !item.jsonld_present) issues.push("missing_jsonld");
  if (item.audit_outcome === "ok" && !item.open_graph_present) issues.push("missing_open_graph");
  if (item.audit_outcome === "ok" && item.robots_status !== 200) issues.push("robots_unavailable");
  if (item.audit_outcome === "ok" && item.sitemap_status !== 200) issues.push("sitemap_unavailable");
  return [...new Set(issues)].sort();
}

function statusClass(status) {
  if (typeof status !== "number") return "none";
  return `${Math.floor(status / 100)}xx`;
}

function summarize(items, metadata) {
  const outcomeCounts = {};
  const categoryCounts = {};
  const issueCounts = {};
  for (const item of items) {
    outcomeCounts[item.audit_outcome] = (outcomeCounts[item.audit_outcome] || 0) + 1;
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    for (const issue of item.issue_codes) {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }
  }
  return {
    total_projects: items.length,
    audited_projects: items.length,
    outcome_counts: sortObject(outcomeCounts),
    category_counts: sortObject(categoryCounts),
    jsonld_present_count: items.filter((item) => item.jsonld_present).length,
    software_application_schema_present_count: items.filter((item) => item.software_application_schema_present).length,
    canonical_present_count: items.filter((item) => item.canonical_present).length,
    meta_description_present_count: items.filter((item) => item.meta_description_present).length,
    robots_available_count: items.filter((item) => item.robots_status === 200).length,
    sitemap_available_count: items.filter((item) => item.sitemap_status === 200).length,
    html_fetch_failure_count: items.filter((item) => item.audit_outcome !== "ok").length,
    top_issue_codes: Object.entries(sortObject(issueCounts))
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
      .slice(0, 20),
    generated_at: metadata.generatedAt,
    data_repo_commit: metadata.dataRepoCommit,
    main_repo_commit: metadata.mainRepoCommit,
  };
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function auditProject(entry, options, auditedAt) {
  const { project } = entry;
  const guarded = guardUrl(project.website_url);
  const base = {
    slug: project.slug,
    category: project.category_slug,
    source_type: project.source_type,
    website_host: guarded.ok ? guarded.host : null,
    audit_outcome: guarded.ok ? "fetch_error" : guarded.outcome,
    http_status: null,
    status_class: "none",
    redirect_count: 0,
    final_url_same_origin: false,
    body_bytes: 0,
    readable_text_bucket: "0",
    title_present: false,
    meta_description_present: false,
    canonical_present: false,
    jsonld_present: false,
    jsonld_count: 0,
    schema_types: [],
    software_application_schema_present: false,
    organization_schema_present: false,
    open_graph_present: false,
    robots_status: null,
    sitemap_status: null,
    issue_codes: [],
    audited_at: auditedAt,
  };

  if (!guarded.ok) {
    base.issue_codes = issueCodes(base);
    return base;
  }

  const page = await fetchBounded(guarded.url, options);
  base.audit_outcome = OUTCOMES.has(page.outcome) ? page.outcome : "fetch_error";
  base.http_status = page.status;
  base.status_class = statusClass(page.status);
  base.redirect_count = page.redirectCount;
  base.final_url_same_origin = page.finalUrl ? new URL(page.finalUrl).origin === guarded.origin : false;
  base.body_bytes = page.bodyBytes;

  base.robots_status = await fetchStatus(new URL("/robots.txt", guarded.origin).toString(), options);
  base.sitemap_status = await fetchStatus(new URL("/sitemap.xml", guarded.origin).toString(), options);

  if (page.ok && page.body) {
    const analysis = analyzeHtml(page.body);
    base.readable_text_bucket = analysis.readableTextBucket;
    base.title_present = analysis.titlePresent;
    base.meta_description_present = analysis.metaDescriptionPresent;
    base.canonical_present = analysis.canonicalPresent;
    base.jsonld_present = analysis.jsonldPresent;
    base.jsonld_count = analysis.jsonldCount;
    base.schema_types = analysis.schemaTypes;
    base.software_application_schema_present = analysis.softwareApplicationSchemaPresent;
    base.organization_schema_present = analysis.organizationSchemaPresent;
    base.open_graph_present = analysis.openGraphPresent;
    if (base.audit_outcome === "empty_html" && analysis.readableTextBucket !== "0") base.audit_outcome = "ok";
  }

  base.issue_codes = issueCodes(base);
  return base;
}

function loadSeedEntries(dataRepo) {
  const manifestPath = path.join(dataRepo, "seed", "seed-100-manifest.json");
  const manifest = readJson(manifestPath);
  if (!Array.isArray(manifest.items) || manifest.items.length !== 100) {
    throw new Error("Seed 100 manifest must contain exactly 100 items.");
  }
  return manifest.items.map((item) => {
    const project = readJson(path.join(dataRepo, item.project_file));
    if (project.slug !== item.slug) throw new Error(`Manifest slug mismatch for ${item.project_file}`);
    return { manifest: item, project };
  });
}

function writeDataset(outDir, items, summary) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "items.ndjson"), `${items.map((item) => JSON.stringify(item)).join("\n")}\n`);
  fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const failures = items.filter((item) => item.audit_outcome !== "ok");
  fs.writeFileSync(path.join(outDir, "failures.ndjson"), failures.length ? `${failures.map((item) => JSON.stringify(item)).join("\n")}\n` : "");
  fs.writeFileSync(path.join(outDir, "schema.json"), `${JSON.stringify(createSchema(), null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, "README.md"), createReadme(summary));
}

function createSchema() {
  return {
    schema_version: "123charts-seed-readiness-audit-v1",
    format: "ndjson",
    item_fields: [
      "slug",
      "category",
      "source_type",
      "website_host",
      "audit_outcome",
      "http_status",
      "status_class",
      "redirect_count",
      "final_url_same_origin",
      "body_bytes",
      "readable_text_bucket",
      "title_present",
      "meta_description_present",
      "canonical_present",
      "jsonld_present",
      "jsonld_count",
      "schema_types",
      "software_application_schema_present",
      "organization_schema_present",
      "open_graph_present",
      "robots_status",
      "sitemap_status",
      "issue_codes",
      "audited_at",
    ],
    outcomes: [...OUTCOMES].sort(),
  };
}

function createReadme(summary) {
  return `# Seed 100 Machine-Readability Audit Dataset

This directory contains a sanitized local audit dataset for the Seed 100 project corpus.

Generated at: ${summary.generated_at}

Input data commit: ${summary.data_repo_commit}
Main repo commit: ${summary.main_repo_commit}

Files:

- summary.json: aggregate counts
- items.ndjson: one sanitized record per Seed 100 project
- failures.ndjson: records whose website fetch did not return a usable HTML page
- schema.json: dataset field contract

Network limits:

- concurrency max 2
- timeout 5000 ms
- max body 262144 bytes
- max redirects 2
- no JavaScript execution
- no browser automation
- no paid or AI APIs

Privacy:

The dataset stores structural booleans, status classes, reason codes, byte counts, same-origin redirect status, and website host only. It does not store raw HTML, raw headers, raw titles, raw descriptions, cookies, credentials, private contact data, or server addresses.

This dataset is internal input for the next report task. It is not a public ranking product and does not promise external visibility.
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = loadSeedEntries(args.dataRepo);
  const generatedAt = new Date().toISOString();
  const options = {
    timeoutMs: args.timeoutMs,
    maxBodyBytes: args.maxBodyBytes,
    maxRedirects: DEFAULTS.maxRedirects,
  };

  const items = await mapLimit(entries, args.concurrency, (entry) => auditProject(entry, options, generatedAt));
  const summary = summarize(items, {
    generatedAt,
    dataRepoCommit: gitSha(args.dataRepo),
    mainRepoCommit: gitSha(ROOT),
  });
  writeDataset(args.outDir, items, summary);
  console.log(`seed-audit:run wrote ${items.length} records to ${path.relative(ROOT, args.outDir)}`);
  console.log(JSON.stringify({
    total_projects: summary.total_projects,
    html_fetch_failure_count: summary.html_fetch_failure_count,
    outcome_counts: summary.outcome_counts,
  }, null, 2));
}

main().catch((error) => {
  console.error(`seed-audit:run failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
});
