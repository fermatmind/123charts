import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function fail(msg) {
  errors.push(msg);
}

// 1. Core files exist
const files = [
  "app/geo-checker/page.tsx",
  "app/api/geo-checker/route.ts",
  "lib/geo-checker/ssrf-guard.ts",
  "lib/geo-checker/fetch-url.ts",
  "lib/geo-checker/analyze-html.ts",
  "lib/geo-checker/score.ts",
  "lib/geo-checker/types.ts",
  "lib/geo-checker/url-normalize.ts",
  "docs/39_AI_SEARCH_READINESS_CHECKER_V0.md",
];
for (const f of files) {
  if (!fs.existsSync(path.join(ROOT, f))) fail(`Missing: ${f}`);
}

// 2. Nginx includes /api/geo-checker
const nginxPath = path.join(ROOT, "deploy/nginx/123charts.conf.example");
if (fs.existsSync(nginxPath)) {
  if (!fs.readFileSync(nginxPath, "utf8").includes("geo-checker")) {
    fail("Nginx config missing /api/geo-checker rate limit");
  }
}

// 3. package.json has geo-checker:check
const pkgPath = path.join(ROOT, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (!pkg.scripts?.["geo-checker:check"]) fail("package.json missing geo-checker:check");
}

// 4. No forbidden public copy terms in geo-checker page or components
const publicFiles = [
  "app/geo-checker/page.tsx",
  "components/geo-checker-form.tsx",
];
const forbiddenTerms = [
  "dofollow", "SEO juice", "guaranteed ranking", "guaranteed traffic",
  "guaranteed AI citation", "trusted by OpenAI", "OpenAI approved",
  "Google approved",
];
for (const f of publicFiles) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, "utf8").toLowerCase();
  for (const term of forbiddenTerms) {
    if (content.includes(term.toLowerCase())) {
      fail(`${f} contains forbidden term: "${term}"`);
    }
  }
}

// 5. No Supabase imports in geo-checker lib or API
for (const f of [...files.filter((x) => x.startsWith("lib/geo-checker") || x.startsWith("app/api/geo-checker"))]) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, "utf8");
  if (content.includes("@supabase") || content.includes("supabase")) {
    fail(`${f} must not import Supabase`);
  }
  if (content.includes("openai") || content.includes("anthropic") || content.includes("google-ai")) {
    fail(`${f} must not import AI API clients`);
  }
  if (content.includes("playwright") || content.includes("puppeteer")) {
    fail(`${f} must not import browser automation`);
  }
}

// 6. API route or fetch helper includes timeout/AbortController
const fetchPath = path.join(ROOT, "lib/geo-checker/fetch-url.ts");
if (fs.existsSync(fetchPath)) {
  const content = fs.readFileSync(fetchPath, "utf8");
  if (!content.includes("AbortController") && !content.includes("abort")) {
    fail("fetch-url.ts missing AbortController/timeout");
  }
  if (!content.includes("MAX_BODY_SIZE") && !content.includes("max_body") && !content.includes("size limit")) {
    fail("fetch-url.ts missing response size guard");
  }
}

// 7. SSRF guard rejects localhost/private basics
const ssrfPath = path.join(ROOT, "lib/geo-checker/ssrf-guard.ts");
if (fs.existsSync(ssrfPath)) {
  const content = fs.readFileSync(ssrfPath, "utf8");
  if (!content.includes("localhost")) fail("ssrf-guard.ts missing localhost rejection");
  if (!content.includes("127.0.0.1")) fail("ssrf-guard.ts missing loopback rejection");
}

// 8. Sitemap includes geo-checker
const sitemapPath = path.join(ROOT, "app/sitemap.ts");
if (fs.existsSync(sitemapPath)) {
  if (!fs.readFileSync(sitemapPath, "utf8").includes("geo-checker")) {
    fail("sitemap.ts missing /geo-checker entry");
  }
}

if (errors.length > 0) {
  console.error("geo-checker:check failed");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log("geo-checker:check passed");
console.log("Verified: core files, no Supabase, no AI APIs, SSRF guard, timeout, sitemap");
