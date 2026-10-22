import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.env.READ_ONLY_MCP_CHECK_ROOT ?? process.cwd();
const RUN_NEGATIVE_TESTS = !process.env.READ_ONLY_MCP_CHECK_ROOT;

function repoPath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath, errors, root = ROOT) {
  try {
    return JSON.parse(read(filePath));
  } catch (error) {
    errors.push(`Invalid JSON: ${repoPath(root, filePath)} (${error.message})`);
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

function changedFiles(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return [];

  try {
    const base = execFileSync("git", ["merge-base", "HEAD", "origin/main"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const output = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
      cwd: root,
      encoding: "utf8",
    });
    const unstaged = execFileSync("git", ["diff", "--name-only"], {
      cwd: root,
      encoding: "utf8",
    });
    const staged = execFileSync("git", ["diff", "--name-only", "--cached"], {
      cwd: root,
      encoding: "utf8",
    });
    const untracked = execFileSync(
      "git",
      ["ls-files", "--others", "--exclude-standard"],
      { cwd: root, encoding: "utf8" }
    );

    return [...new Set(`${output}\n${unstaged}\n${staged}\n${untracked}`
      .split(/\r?\n/)
      .filter(Boolean))];
  } catch {
    return [];
  }
}

function includesAny(content, values) {
  return values.some((value) => content.includes(value));
}

function validate(root, options = {}) {
  const errors = [];
  const routePath = path.join(root, "app/api/mcp/route.ts");
  const flagsPath = path.join(root, "lib/mcp/feature-flags.ts");
  const toolsPath = path.join(root, "lib/mcp/tools.ts");
  const problemPath = path.join(root, "lib/mcp/problem.ts");
  const contractPath = path.join(root, "ops/contracts/mcp-boundary.json");
  const publicApiContractPath = path.join(
    root,
    "ops/contracts/public-api-boundary.json"
  );
  const docPath = path.join(root, "docs/67_READ_ONLY_MCP_SERVER_QA_V0.md");
  const packagePath = path.join(root, "package.json");

  for (const required of [
    routePath,
    flagsPath,
    toolsPath,
    problemPath,
    contractPath,
    publicApiContractPath,
    docPath,
    packagePath,
  ]) {
    if (!fs.existsSync(required)) {
      errors.push(`Missing ${repoPath(root, required)}`);
    }
  }

  const appMcpFiles = scanDir(path.join(root, "app/api/mcp"));
  const libMcpFiles = scanDir(path.join(root, "lib/mcp"));
  const mcpFiles = [...appMcpFiles, ...libMcpFiles];

  const routeFiles = appMcpFiles
    .filter((file) => file.endsWith("route.ts"))
    .map((file) => repoPath(root, file))
    .sort();
  const allowedRoutes = ["app/api/mcp/route.ts"];
  for (const route of allowedRoutes) {
    if (!routeFiles.includes(route)) {
      errors.push(`Missing MCP route: ${route}`);
    }
  }
  for (const route of routeFiles) {
    if (!allowedRoutes.includes(route)) {
      errors.push(`Unexpected MCP route: ${route}`);
    }
  }

  if (fs.existsSync(flagsPath)) {
    const flags = read(flagsPath);
    if (!flags.includes("process.env.MCP_SERVER_ENABLED")) {
      errors.push("MCP feature flags must read MCP_SERVER_ENABLED");
    }
    if (!flags.includes("process.env.MCP_LOCAL_ONLY")) {
      errors.push("MCP feature flags must read MCP_LOCAL_ONLY");
    }
    if (!flags.includes('value === "true"')) {
      errors.push("MCP_SERVER_ENABLED must default disabled unless value is exactly true");
    }
    if (!flags.includes('value !== "false"')) {
      errors.push("MCP_LOCAL_ONLY must default true unless value is exactly false");
    }
  }

  if (fs.existsSync(problemPath)) {
    const problem = read(problemPath);
    for (const phrase of [
      "https://123charts.com/problems/mcp-disabled",
      "MCP server is disabled",
      "The MCP server is not enabled for this environment.",
      "status: 503",
    ]) {
      if (!problem.includes(phrase)) {
        errors.push(`MCP problem helper missing phrase: ${phrase}`);
      }
    }
  }

  if (fs.existsSync(routePath)) {
    const route = read(routePath);
    for (const phrase of [
      "isMcpServerEnabled",
      "isMcpLocalOnly",
      "mcpDisabledProblem",
      "application/problem+json",
      "status: 503",
      "tools/list",
      "initialize",
      "MCP tool calls are not implemented in PR60 v0.",
    ]) {
      if (!route.includes(phrase)) {
        errors.push(`MCP route missing phrase: ${phrase}`);
      }
    }
    if (!route.includes("NextResponse.json(mcpDisabledProblem(INSTANCE)")) {
      errors.push("MCP route must return disabled Problem Details by default");
    }
  }

  const forbiddenImportPatterns = [
    /from\s+["'][^"']*supabase[^"']*["']/i,
    /from\s+["'][^"']*payments?[^"']*["']/i,
    /from\s+["'][^"']*stripe[^"']*["']/i,
    /from\s+["'][^"']*score[^"']*["']/i,
    /from\s+["'][^"']*source-confidence[^"']*["']/i,
    /@\/lib\/supabase/i,
    /@\/lib\/payments/i,
    /@\/lib\/score/i,
    /@\/lib\/source-confidence/i,
  ];
  const forbiddenTerms = [
    "create_checkout",
    "execute_query",
    "run_sql",
    "raw_sql",
    ".insert(",
    ".update(",
    ".upsert(",
    ".delete(",
  ];
  const forbiddenToolNames = [
    "execute_query",
    "run_sql",
    "fetch_url",
    "submit_project",
    "claim_project",
    "update_project",
    "delete_project",
    "send_email",
    "create_checkout",
    "create_payment",
    "admin_review_project",
    "sync_external_imports",
  ];
  const deniedInputFields = [
    "sql",
    "raw_sql",
    "query_raw",
    "url",
    "admin",
    "email",
    "payment_state",
    "to" + "ken",
    "api_key",
    "secret",
  ];
  const deniedOutputFields = [
    "email",
    "payment_state",
    "admin_notes",
    "review_comments",
    "raw_payload",
    "quarantine_internals",
    "source_confidence_internal",
    "signal_score_internal",
  ];

  for (const file of mcpFiles) {
    const content = read(file);
    for (const pattern of forbiddenImportPatterns) {
      if (pattern.test(content)) {
        errors.push(`${repoPath(root, file)} contains forbidden import pattern ${pattern}`);
      }
    }
    if (includesAny(content, forbiddenTerms)) {
      const term = forbiddenTerms.find((value) => content.includes(value));
      errors.push(`${repoPath(root, file)} contains forbidden runtime term ${term}`);
    }
    if (content.includes("additionalProperties: true")) {
      errors.push(`${repoPath(root, file)} contains schema with additionalProperties: true`);
    }
    if (includesAny(content, forbiddenToolNames)) {
      const term = forbiddenToolNames.find((value) => content.includes(value));
      errors.push(`${repoPath(root, file)} contains denied tool name ${term}`);
    }
    if (includesAny(content, deniedInputFields.map((field) => `${field}:`))) {
      const field = deniedInputFields.find((value) => content.includes(`${value}:`));
      errors.push(`${repoPath(root, file)} contains denied input field ${field}`);
    }
    if (includesAny(content, deniedOutputFields.map((field) => `"${field}"`))) {
      const field = deniedOutputFields.find((value) => content.includes(`"${value}"`));
      errors.push(`${repoPath(root, file)} contains denied output field ${field}`);
    }
  }

  if (fs.existsSync(contractPath)) {
    const contract = readJson(contractPath, errors, root);
    if (contract?.dependency_rule !== "public-api-only") {
      errors.push("MCP contract must remain public-api-only");
    }
    if (contract?.direct_database_access !== "forbidden") {
      errors.push("MCP contract must forbid direct database access");
    }
    if (contract?.mutation_tools !== "forbidden") {
      errors.push("MCP contract must forbid mutation tools");
    }
    for (const tool of contract?.tool_specs ?? []) {
      if (!contract.allowed_tool_names?.includes(tool.name)) {
        errors.push(`MCP tool is not allowlisted: ${tool.name}`);
      }
      if (contract.denied_tool_names?.includes(tool.name)) {
        errors.push(`MCP tool is denied: ${tool.name}`);
      }
      if (tool.inputSchema?.additionalProperties !== false) {
        errors.push(`MCP tool schema must use additionalProperties:false: ${tool.name}`);
      }
      const schema = JSON.stringify(tool.inputSchema ?? {});
      for (const field of contract.denied_input_fields ?? []) {
        if (schema.includes(`"${field}"`)) {
          errors.push(`MCP tool schema includes denied input field ${field}: ${tool.name}`);
        }
      }
      for (const output of tool.output_fields ?? []) {
        if (!contract.allowed_output_fields?.includes(output)) {
          errors.push(`MCP tool output is not allowlisted: ${tool.name}.${output}`);
        }
        if (contract.denied_output_fields?.includes(output)) {
          errors.push(`MCP tool output is denied: ${tool.name}.${output}`);
        }
      }
    }
  }

  const changed = options.changedFiles ?? changedFiles(root);
  const forbiddenChangedPrefixes = [
    "app/api/public/",
    "lib/public-api/",
    "lib/payments/",
    "lib/score/",
    "lib/source-confidence/",
    "deploy/",
    "public/",
  ];
  const forbiddenChangedExact = ["middleware.ts", "package-lock.json"];
  for (const file of changed) {
    if (
      forbiddenChangedPrefixes.some((prefix) => file.startsWith(prefix)) ||
      forbiddenChangedExact.includes(file) ||
      file.startsWith(".env")
    ) {
      errors.push(`PR60 must not modify forbidden path: ${file}`);
    }
  }

  if (fs.existsSync(docPath)) {
    const doc = read(docPath);
    const requiredDocPhrases = [
      "MCP_SERVER_ENABLED=false",
      "MCP_LOCAL_ONLY=true",
      "disabled by default",
      "no direct Supabase access",
      "no mutation tools",
      "payment/admin/scouted/quarantined leakage boundaries",
      "Human checkpoint status: required",
      "not externally released",
    ];
    for (const phrase of requiredDocPhrases) {
      if (!doc.includes(phrase)) {
        errors.push(`Read-only MCP doc missing phrase: ${phrase}`);
      }
    }
  }

  if (fs.existsSync(packagePath)) {
    const pkg = readJson(packagePath, errors, root);
    if (pkg?.scripts?.["read-only-mcp:check"] !== "node scripts/check-read-only-mcp-server.mjs") {
      errors.push("package.json missing script: read-only-mcp:check");
    }
  }

  return errors;
}

function writeFixture(root, overrides = {}) {
  const files = {
    "app/api/mcp/route.ts":
      'import { NextResponse } from "next/server";\nimport { isMcpServerEnabled, isMcpLocalOnly } from "@/lib/mcp/feature-flags";\nimport { mcpDisabledProblem } from "@/lib/mcp/problem";\nexport function GET() { if (!isMcpServerEnabled() || isMcpLocalOnly()) return NextResponse.json(mcpDisabledProblem("/api/mcp"), { status: 503, headers: { "Content-Type": "application/problem+json" } }); return NextResponse.json({ method: "initialize", tools: "tools/list", message: "MCP tool calls are not implemented in PR60 v0." }); }\n',
    "lib/mcp/feature-flags.ts":
      'export function isMcpServerEnabled(value = process.env.MCP_SERVER_ENABLED) { return value === "true"; }\nexport function isMcpLocalOnly(value = process.env.MCP_LOCAL_ONLY) { return value !== "false"; }\n',
    "lib/mcp/problem.ts":
      'export function mcpDisabledProblem(instance) { return { type: "https://123charts.com/problems/mcp-disabled", title: "MCP server is disabled", status: 503, detail: "The MCP server is not enabled for this environment.", instance }; }\n',
    "lib/mcp/tools.ts":
      'export const MCP_TOOL_SPECS = [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false, properties: { slug: { type: "string" } } }, output_fields: ["slug", "name"] }];\n',
    "ops/contracts/public-api-boundary.json": JSON.stringify(
      { allowed_public_fields: ["slug", "name"], denied_fields: ["email"] },
      null,
      2
    ),
    "ops/contracts/mcp-boundary.json": JSON.stringify(
      {
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "delete_project", "send_email", "create_checkout", "create_payment"],
        denied_input_fields: ["sql", "raw_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["email", "payment_state", "admin_notes", "review_comments", "raw_payload", "source_confidence_internal", "signal_score_internal"],
        tool_specs: [
          {
            name: "get_ai_project_profile",
            inputSchema: {
              type: "object",
              additionalProperties: false,
              properties: { slug: { type: "string" } },
            },
            output_fields: ["slug", "name"],
          },
        ],
      },
      null,
      2
    ),
    "docs/67_READ_ONLY_MCP_SERVER_QA_V0.md":
      "MCP_SERVER_ENABLED=false\nMCP_LOCAL_ONLY=true\ndisabled by default\nno direct Supabase access\nno mutation tools\npayment/admin/scouted/quarantined leakage boundaries\nHuman checkpoint status: required\nnot externally released\n",
    "package.json": JSON.stringify(
      { scripts: { "read-only-mcp:check": "node scripts/check-read-only-mcp-server.mjs" } },
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

function expectFailure(name, overrides, expectedText, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-pr60-"));
  try {
    writeFixture(root, overrides);
    const errors = validate(root, options);
    if (!errors.some((error) => error.includes(expectedText))) {
      throw new Error(`${name} did not fail with expected text: ${expectedText}`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function runNegativeTests() {
  expectFailure(
    "supabase import",
    { "lib/mcp/server.ts": "import { createClient } from '@/lib/supabase/server';\n" },
    "forbidden import"
  );
  expectFailure(
    "payment import",
    { "lib/mcp/server.ts": "import { createCheckout } from '@/lib/payments/checkout';\n" },
    "forbidden import"
  );
  expectFailure(
    "execute_query tool",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "execute_query", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug"] }];\n' },
    "execute_query"
  );
  expectFailure(
    "update_project tool",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "update_project", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug"] }];\n' },
    "update_project"
  );
  expectFailure(
    "sql input",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false, properties: { sql: { type: "string" } } }, output_fields: ["slug"] }];\n' },
    "sql"
  );
  expectFailure(
    "email output",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["email"] }];\n' },
    "email"
  );
  expectFailure(
    "payment_state output",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["payment_state"] }];\n' },
    "payment_state"
  );
  expectFailure(
    "additionalProperties true",
    { "lib/mcp/tools.ts": 'export const MCP_TOOL_SPECS = [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: true }, output_fields: ["slug"] }];\n' },
    "additionalProperties"
  );
  expectFailure(
    "deploy path changed",
    {},
    "forbidden path",
    { changedFiles: ["deploy/nginx.conf"] }
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
  console.error("read-only-mcp:check failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("read-only-mcp:check passed");
console.log(
  "Verified: disabled-by-default MCP shell, local-only default, strict static tools, no direct Supabase, no private/admin/payment fields, no forbidden path changes, negative fixtures"
);
