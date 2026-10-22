import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function fail(msg) {
  errors.push(msg);
}

// 1. Docs exist
if (!fs.existsSync(path.join(ROOT, "docs/35_SUBMISSION_INTAKE_FIREWALL_V0.md"))) {
  fail("Missing docs/35_SUBMISSION_INTAKE_FIREWALL_V0.md");
}

// 2. Nginx config checks
const nginxPath = path.join(ROOT, "deploy/nginx/123charts.conf.example");
if (!fs.existsSync(nginxPath)) {
  fail("Missing deploy/nginx/123charts.conf.example");
} else {
  const nginx = fs.readFileSync(nginxPath, "utf8");
  if (!nginx.includes("project-submissions")) fail("Nginx: missing project-submissions");
  if (!nginx.includes("project-claims")) fail("Nginx: missing project-claims");
  if (!nginx.includes("limit_req")) fail("Nginx: missing limit_req");
  if (!nginx.includes("limit_req_status 429")) fail("Nginx: missing limit_req_status 429");
  if (!nginx.includes("client_max_body_size")) fail("Nginx: missing client_max_body_size");
  if (!nginx.includes("Retry-After")) fail("Nginx: missing Retry-After header");
}

// 3. Validation files contain honeypot field names
const sharedPath = path.join(ROOT, "lib/validation/shared.ts");
if (fs.existsSync(sharedPath)) {
  const shared = fs.readFileSync(sharedPath, "utf8");
  if (!shared.includes("company_homepage") && !shared.includes("homepage_url")) {
    fail("shared.ts: missing company_homepage or homepage_url honeypot field");
  }
  if (!shared.includes("contact_company") && !shared.includes("website_confirm")) {
    fail("shared.ts: missing contact_company or website_confirm honeypot field");
  }
}

// 4. Validation files contain hidden monetization field rejection
if (fs.existsSync(sharedPath)) {
  const shared = fs.readFileSync(sharedPath, "utf8");
  if (!shared.includes("FORBIDDEN_PAYLOAD_FIELDS")) fail("shared.ts: missing FORBIDDEN_PAYLOAD_FIELDS");
  if (!shared.includes("checkForbiddenFields")) fail("shared.ts: missing checkForbiddenFields");
}

// 5. API route or validation files contain body size guard
const subRoutePath = path.join(ROOT, "app/api/project-submissions/route.ts");
const claimRoutePath = path.join(ROOT, "app/api/project-claims/route.ts");
let hasBodyGuard = false;
for (const p of [subRoutePath, claimRoutePath, sharedPath]) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, "utf8");
    if (content.includes("content-length") || content.includes("MAX_BODY_SIZE_BYTES")) {
      hasBodyGuard = true;
      break;
    }
  }
}
if (!hasBodyGuard) fail("Missing Content-Length / body size guard in API routes or validation");

// 6. Migration 005 exists
const migPath = path.join(ROOT, "supabase/migrations/005_intake_indexes.sql");
if (!fs.existsSync(migPath)) {
  fail("Missing supabase/migrations/005_intake_indexes.sql");
} else {
  const mig = fs.readFileSync(migPath, "utf8");
  if (!mig.includes("project_submissions")) fail("Migration 005: missing project_submissions index");
  if (!mig.includes("project_claims")) fail("Migration 005: missing project_claims index");
  if (!mig.includes("projects")) fail("Migration 005: missing projects index");
  if (!mig.includes("idx_projects_public_slug")) fail("Migration 005: missing public slug partial index");
}

// 7. package.json has intake:check
const pkgPath = path.join(ROOT, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (!pkg.scripts?.["intake:check"]) fail("package.json missing script: intake:check");
}

// 8. Forms have honeypot fields
for (const [formPath, fields] of [
  [path.join(ROOT, "components/submit-form.tsx"), ["company_homepage", "fax_number"]],
  [path.join(ROOT, "components/claim-form.tsx"), ["contact_company", "website_confirm"]],
]) {
  if (fs.existsSync(formPath)) {
    const content = fs.readFileSync(formPath, "utf8");
    for (const f of fields) {
      if (!content.includes(f)) fail(`${path.basename(formPath)}: missing honeypot field ${f}`);
    }
  }
}

if (errors.length > 0) {
  console.error("intake:check failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("intake:check passed");
console.log("Verified: Nginx rate-limit, honeypot fields, monetization rejection, body size guard, DB indexes");
