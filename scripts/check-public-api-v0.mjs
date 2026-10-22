import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.env.PUBLIC_API_V0_CHECK_ROOT ?? process.cwd();
const RUN_NEGATIVE_TESTS = !process.env.PUBLIC_API_V0_CHECK_ROOT;

function repoPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(read(filePath));
  } catch (error) {
    errors.push(`Invalid JSON: ${repoPath(filePath)} (${error.message})`);
    return null;
  }
}

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDir(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function validate(root) {
  const errors = [];
  const contractPath = path.join(root, "ops/contracts/public-api-boundary.json");
  const flagPath = path.join(root, "lib/public-api/feature-flags.ts");
  const serializerPath = path.join(root, "lib/public-api/serializer.ts");
  const listRoutePath = path.join(root, "app/api/public/v0/projects/route.ts");
  const detailRoutePath = path.join(
    root,
    "app/api/public/v0/projects/[slug]/route.ts"
  );
  const docPath = path.join(root, "docs/65_PUBLIC_READ_ONLY_API_V0.md");
  const packagePath = path.join(root, "package.json");

  if (!fs.existsSync(contractPath)) {
    errors.push("Missing ops/contracts/public-api-boundary.json");
  } else {
    const contract = readJson(contractPath, errors);
    if (!Array.isArray(contract?.allowed_public_fields)) {
      errors.push("Public API boundary contract must include allowed_public_fields");
    }
    if (!Array.isArray(contract?.denied_fields)) {
      errors.push("Public API boundary contract must include denied_fields");
    }
  }

  if (!fs.existsSync(flagPath)) {
    errors.push("Missing lib/public-api/feature-flags.ts");
  } else {
    const flags = read(flagPath);
    if (!flags.includes("process.env.PUBLIC_API_ENABLED")) {
      errors.push("Feature flag helper must read PUBLIC_API_ENABLED");
    }
    if (!flags.includes('value === "true"')) {
      errors.push("Feature flag helper must enable only when value is exactly true");
    }
    if (!flags.includes("string | undefined")) {
      errors.push("Feature flag helper must treat missing env as disabled");
    }
  }

  const routeRoot = path.join(root, "app/api/public");
  const routeFiles = scanDir(routeRoot).filter((file) =>
    file.endsWith("route.ts")
  );
  const routeNames = routeFiles.map(repoPath).sort();
  const allowedRoutes = [
    "app/api/public/v0/projects/[slug]/route.ts",
    "app/api/public/v0/projects/route.ts",
  ];
  for (const required of allowedRoutes) {
    if (!routeNames.includes(required)) {
      errors.push(`Missing public API route: ${required}`);
    }
  }
  for (const file of routeNames) {
    if (!allowedRoutes.includes(file)) {
      errors.push(`Unexpected public API route: ${file}`);
    }
  }

  if (!fs.existsSync(serializerPath)) {
    errors.push("Missing lib/public-api/serializer.ts");
  } else {
    const serializer = read(serializerPath);
    if (!serializer.includes("allowed_public_fields")) {
      errors.push("Serializer must derive the explicit allowlist from the contract");
    }
    if (!serializer.includes('project.status !== "published"')) {
      errors.push("Serializer must fail closed unless status is published");
    }
    if (/\{\s*\.\.\./.test(serializer)) {
      errors.push("Serializer must not use raw object spreading");
    }

    const deniedFragments = [
      "email",
      "admin_notes",
      "review_comments",
      "payment_state",
      "featured_payment_state",
      "raw_payload",
      "quarantine_reason",
      "audit_events",
      "notification_state",
      "internal_score",
      "source_confidence_internal",
    ];
    const publicReturnBlock = serializer.slice(serializer.indexOf("return {"));
    for (const fragment of deniedFragments) {
      if (publicReturnBlock.includes(fragment)) {
        errors.push(`Serializer output must not include denied field: ${fragment}`);
      }
    }
  }

  const forbiddenRouteImports = [
    "@/lib/mcp",
    "@/lib/payments",
    "@/lib/score",
    "@/lib/source-confidence",
    "external_project_imports",
    "supabase",
    "stripe",
  ];
  const forbiddenRouteTerms = [
    ".insert(",
    ".update(",
    ".upsert(",
    ".delete(",
    "api key",
    "apikey",
    "metering",
    "laravel",
    "sitemap",
    "quarantined",
    "pending_review",
    "submitted",
    "scouted",
  ];

  for (const file of routeFiles) {
    const content = read(file);
    for (const item of forbiddenRouteImports) {
      if (content.toLowerCase().includes(item.toLowerCase())) {
        errors.push(`${repoPath(file)} must not import or reference ${item}`);
      }
    }
    for (const term of forbiddenRouteTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        errors.push(`${repoPath(file)} must not contain forbidden term ${term}`);
      }
    }
    if (!content.includes("isPublicApiEnabled")) {
      errors.push(`${repoPath(file)} must enforce the public API feature flag`);
    }
    if (!content.includes("publicApiDisabledProblem")) {
      errors.push(`${repoPath(file)} must return disabled Problem Details`);
    }
    if (!content.includes("serializePublicApi")) {
      errors.push(`${repoPath(file)} must use allowlist serialization`);
    }
  }

  if (!fs.existsSync(docPath)) {
    errors.push("Missing docs/65_PUBLIC_READ_ONLY_API_V0.md");
  } else {
    const doc = read(docPath);
    const requiredDocPhrases = [
      "PUBLIC_API_ENABLED=false",
      "Human checkpoint status: required",
      "No other public API route is introduced",
      "PR58 does not auto-merge",
    ];
    for (const phrase of requiredDocPhrases) {
      if (!doc.includes(phrase)) {
        errors.push(`Public API v0 doc missing phrase: ${phrase}`);
      }
    }
  }

  if (!fs.existsSync(packagePath)) {
    errors.push("Missing package.json");
  } else {
    const pkg = readJson(packagePath, errors);
    if (pkg?.scripts?.["public-api:v0:check"] !== "node scripts/check-public-api-v0.mjs") {
      errors.push("package.json missing script: public-api:v0:check");
    }
  }

  return errors;
}

function writeFixture(root, overrides = {}) {
  const files = {
    "ops/contracts/public-api-boundary.json": JSON.stringify(
      {
        allowed_public_fields: ["slug", "name"],
        denied_fields: ["founder_email", "payment_state"],
      },
      null,
      2
    ),
    "lib/public-api/feature-flags.ts":
      'export function isPublicApiEnabled(value: string | undefined = process.env.PUBLIC_API_ENABLED): boolean { return value === "true"; }\n',
    "lib/public-api/serializer.ts":
      'const boundary = { allowed_public_fields: ["slug", "name"] };\nexport const PUBLIC_API_ALLOWED_FIELDS = boundary.allowed_public_fields;\nexport function serializePublicApiProject(project) { if (project.status !== "published") return null; return { slug: project.slug, name: project.name }; }\n',
    "app/api/public/v0/projects/route.ts":
      'import { isPublicApiEnabled } from "@/lib/public-api/feature-flags";\nimport { publicApiDisabledProblem } from "@/lib/public-api/problem";\nimport { serializePublicApiProjects } from "@/lib/public-api/serializer";\nexport function GET() { if (!isPublicApiEnabled()) return publicApiDisabledProblem("/api/public/v0/projects", "test"); return serializePublicApiProjects([]); }\n',
    "app/api/public/v0/projects/[slug]/route.ts":
      'import { isPublicApiEnabled } from "@/lib/public-api/feature-flags";\nimport { publicApiDisabledProblem } from "@/lib/public-api/problem";\nimport { serializePublicApiProject } from "@/lib/public-api/serializer";\nexport function GET() { if (!isPublicApiEnabled()) return publicApiDisabledProblem("/api/public/v0/projects/x", "test"); return serializePublicApiProject({ status: "published", slug: "x", name: "x" }); }\n',
    "docs/65_PUBLIC_READ_ONLY_API_V0.md":
      "PUBLIC_API_ENABLED=false\nHuman checkpoint status: required\nNo other public API route is introduced\nPR58 does not auto-merge\n",
    "package.json": JSON.stringify(
      { scripts: { "public-api:v0:check": "node scripts/check-public-api-v0.mjs" } },
      null,
      2
    ),
    ...overrides,
  };

  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}

function expectFixtureFailure(name, overrides, expectedText) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-pr58-"));
  try {
    writeFixture(root, overrides);
    const errors = validate(root);
    if (!errors.some((error) => error.includes(expectedText))) {
      throw new Error(`${name} did not fail with expected text: ${expectedText}`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function runNegativeTests() {
  expectFixtureFailure(
    "serializer email",
    {
      "lib/public-api/serializer.ts":
        'const boundary = { allowed_public_fields: ["slug", "name"] };\nexport const PUBLIC_API_ALLOWED_FIELDS = boundary.allowed_public_fields;\nexport function serializePublicApiProject(project) { if (project.status !== "published") return null; return { slug: project.slug, name: project.name, email: project.email }; }\n',
    },
    "email"
  );
  expectFixtureFailure(
    "serializer payment_state",
    {
      "lib/public-api/serializer.ts":
        'const boundary = { allowed_public_fields: ["slug", "name"] };\nexport const PUBLIC_API_ALLOWED_FIELDS = boundary.allowed_public_fields;\nexport function serializePublicApiProject(project) { if (project.status !== "published") return null; return { slug: project.slug, name: project.name, payment_state: project.payment_state }; }\n',
    },
    "payment_state"
  );
  expectFixtureFailure(
    "serializer spread",
    {
      "lib/public-api/serializer.ts":
        'const boundary = { allowed_public_fields: ["slug", "name"] };\nexport const PUBLIC_API_ALLOWED_FIELDS = boundary.allowed_public_fields;\nexport function serializePublicApiProject(project) { if (project.status !== "published") return null; return { ...project }; }\n',
    },
    "raw object spreading"
  );
  expectFixtureFailure(
    "route mcp import",
    {
      "app/api/public/v0/projects/route.ts":
        'import "@/lib/mcp/server";\nimport { isPublicApiEnabled } from "@/lib/public-api/feature-flags";\nimport { publicApiDisabledProblem } from "@/lib/public-api/problem";\nimport { serializePublicApiProjects } from "@/lib/public-api/serializer";\nexport function GET() { if (!isPublicApiEnabled()) return publicApiDisabledProblem("/api/public/v0/projects", "test"); return serializePublicApiProjects([]); }\n',
    },
    "@/lib/mcp"
  );
  expectFixtureFailure(
    "route payment import",
    {
      "app/api/public/v0/projects/route.ts":
        'import "@/lib/payments/feature-flags";\nimport { isPublicApiEnabled } from "@/lib/public-api/feature-flags";\nimport { publicApiDisabledProblem } from "@/lib/public-api/problem";\nimport { serializePublicApiProjects } from "@/lib/public-api/serializer";\nexport function GET() { if (!isPublicApiEnabled()) return publicApiDisabledProblem("/api/public/v0/projects", "test"); return serializePublicApiProjects([]); }\n',
    },
    "@/lib/payments"
  );
  expectFixtureFailure(
    "route quarantined status",
    {
      "app/api/public/v0/projects/route.ts":
        'import { isPublicApiEnabled } from "@/lib/public-api/feature-flags";\nimport { publicApiDisabledProblem } from "@/lib/public-api/problem";\nimport { serializePublicApiProjects } from "@/lib/public-api/serializer";\nexport function GET() { const status = "quarantined"; if (!isPublicApiEnabled()) return publicApiDisabledProblem("/api/public/v0/projects", "test"); return serializePublicApiProjects([{ status }]); }\n',
    },
    "quarantined"
  );
  expectFixtureFailure(
    "env missing not disabled",
    {
      "lib/public-api/feature-flags.ts":
        'export function isPublicApiEnabled(value: string | undefined = process.env.PUBLIC_API_ENABLED): boolean { return value !== "false"; }\n',
    },
    "exactly true"
  );
}

const errors = validate(ROOT);
if (RUN_NEGATIVE_TESTS) {
  try {
    runNegativeTests();
  } catch (error) {
    errors.push(`Negative test failed: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error("public-api:v0:check failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("public-api:v0:check passed");
console.log(
  "Verified: feature flag default disabled, v0 routes only, allowlist serializer, denied private/admin/payment fields, no MCP/payment/score/source-confidence imports, no writes, negative fixtures"
);
