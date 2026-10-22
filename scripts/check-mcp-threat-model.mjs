import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.env.MCP_THREAT_MODEL_CHECK_ROOT ?? process.cwd();
const RUN_NEGATIVE_TESTS = !process.env.MCP_THREAT_MODEL_CHECK_ROOT;

function repoPath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(root, filePath, errors) {
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

function hasAll(values, required) {
  return required.every((value) => values.includes(value));
}

function validate(root) {
  const errors = [];
  const contractPath = path.join(root, "ops/contracts/mcp-boundary.json");
  const publicApiContractPath = path.join(
    root,
    "ops/contracts/public-api-boundary.json"
  );
  const docPath = path.join(root, "docs/66_MCP_THREAT_MODEL_TOOL_SPEC_V0.md");
  const packagePath = path.join(root, "package.json");

  if (!fs.existsSync(contractPath)) {
    errors.push("Missing ops/contracts/mcp-boundary.json");
  }

  const contract = fs.existsSync(contractPath)
    ? readJson(root, contractPath, errors)
    : null;

  if (contract) {
    if (contract.dependency_rule !== "public-api-only") {
      errors.push("MCP contract must state dependency_rule public-api-only");
    }
    if (contract.direct_database_access !== "forbidden") {
      errors.push("MCP contract must forbid direct database access");
    }
    if (contract.mutation_tools !== "forbidden") {
      errors.push("MCP contract must forbid mutation tools");
    }
    if (contract.server_runtime_implemented !== false) {
      errors.push("PR59 must not implement server runtime");
    }
    if (contract.endpoint_exposure !== "none") {
      errors.push("PR59 must not expose an MCP endpoint");
    }
    if (!Array.isArray(contract.allowed_tool_names) || contract.allowed_tool_names.length === 0) {
      errors.push("MCP contract must include allowed_tool_names");
    }
    if (!Array.isArray(contract.denied_tool_names) || contract.denied_tool_names.length === 0) {
      errors.push("MCP contract must include denied_tool_names");
    }
    if (!Array.isArray(contract.denied_output_fields) || contract.denied_output_fields.length === 0) {
      errors.push("MCP contract must include denied_output_fields");
    }
    if (!Array.isArray(contract.allowed_output_fields) || contract.allowed_output_fields.length === 0) {
      errors.push("MCP contract must include allowed_output_fields");
    }
    if (!Array.isArray(contract.private_field_denylist) || contract.private_field_denylist.length === 0) {
      errors.push("MCP contract must include private_field_denylist");
    }

    const requiredAllowedTools = [
      "search_ai_projects",
      "get_ai_project_profile",
      "list_ai_project_categories",
    ];
    if (
      Array.isArray(contract.allowed_tool_names) &&
      !hasAll(contract.allowed_tool_names, requiredAllowedTools)
    ) {
      errors.push(`MCP contract allowed tools must include: ${requiredAllowedTools.join(", ")}`);
    }

    const requiredDeniedTools = [
      "execute_query",
      "run_sql",
      "fetch_url",
      "submit_project",
      "claim_project",
      "update_project",
      "send_email",
      "create_checkout",
    ];
    if (
      Array.isArray(contract.denied_tool_names) &&
      !hasAll(contract.denied_tool_names, requiredDeniedTools)
    ) {
      errors.push(`MCP contract denied tools must include: ${requiredDeniedTools.join(", ")}`);
    }

    const deniedPrivateFields = [
      "founder_email",
      "submitter_email",
      "claim_email",
      "admin_notes",
      "review_comments",
      "payment_state",
      "raw_supabase_row",
      "source_confidence_internal",
      "signal_score_internal",
    ];
    if (
      Array.isArray(contract.denied_output_fields) &&
      !hasAll(contract.denied_output_fields, deniedPrivateFields)
    ) {
      errors.push(`MCP contract denied outputs must include: ${deniedPrivateFields.join(", ")}`);
    }

    const forbiddenAllowedToolNames = new Set(contract.denied_tool_names ?? []);
    for (const tool of contract.tool_specs ?? []) {
      if (forbiddenAllowedToolNames.has(tool.name)) {
        errors.push(`Denied tool must not appear in tool_specs: ${tool.name}`);
      }
      if (!contract.allowed_tool_names?.includes(tool.name)) {
        errors.push(`Tool spec must be listed in allowed_tool_names: ${tool.name}`);
      }
      if (tool.inputSchema?.additionalProperties !== false) {
        errors.push(`Tool schema must use additionalProperties:false: ${tool.name}`);
      }
      const serializedSchema = JSON.stringify(tool.inputSchema ?? {});
      for (const denied of contract.denied_input_fields ?? []) {
        if (serializedSchema.includes(denied)) {
          errors.push(`Tool schema includes denied input field ${denied}: ${tool.name}`);
        }
      }
      for (const output of tool.output_fields ?? []) {
        if (!contract.allowed_output_fields?.includes(output)) {
          errors.push(`Tool output is not allowlisted: ${tool.name}.${output}`);
        }
        if (contract.denied_output_fields?.includes(output)) {
          errors.push(`Tool output is denied: ${tool.name}.${output}`);
        }
      }
    }

    const forbiddenToolTerms = ["execute_query", "run_sql", "raw_sql", "fetch_url"];
    const serializedContract = JSON.stringify(contract);
    for (const term of forbiddenToolTerms) {
      const allowedOnlyAsDenylist =
        (contract.denied_tool_names ?? []).includes(term) ||
        (contract.denied_input_fields ?? []).includes(term);
      if (serializedContract.includes(term) && !allowedOnlyAsDenylist) {
        errors.push(`Forbidden tool capability appears outside denylist: ${term}`);
      }
    }
  }

  if (!fs.existsSync(publicApiContractPath)) {
    errors.push("Missing ops/contracts/public-api-boundary.json");
  }

  if (!fs.existsSync(docPath)) {
    errors.push("Missing docs/66_MCP_THREAT_MODEL_TOOL_SPEC_V0.md");
  } else {
    const doc = read(docPath);
    const requiredPhrases = [
      "PR59 does not implement or expose an MCP server endpoint",
      "MCP v0 must be read-only",
      "MCP must not bypass the Public API boundary",
      "no direct Supabase access",
      "Prompt injection risks",
      "Tool poisoning risks",
      "PR60 may proceed only after this spec passes",
    ];
    for (const phrase of requiredPhrases) {
      if (!doc.includes(phrase)) {
        errors.push(`MCP threat model doc missing phrase: ${phrase}`);
      }
    }
  }

  const appMcpFiles = scanDir(path.join(root, "app/api/mcp"));
  const libMcpFiles = scanDir(path.join(root, "lib/mcp"));

  for (const file of [...appMcpFiles, ...libMcpFiles]) {
    const content = read(file);
    if (/from\s+["'][^"']*supabase[^"']*["']/i.test(content) || /@\/lib\/supabase/i.test(content)) {
      errors.push(`${repoPath(root, file)} must not import Supabase`);
    }
    if (
      /from\s+["'][^"']*payments?[^"']*["']/i.test(content) ||
      /from\s+["'][^"']*stripe[^"']*["']/i.test(content) ||
      /@\/lib\/payments/i.test(content)
    ) {
      errors.push(`${repoPath(root, file)} must not import payment code`);
    }
  }

  if (fs.existsSync(packagePath)) {
    const pkg = readJson(root, packagePath, errors);
    if (pkg?.scripts?.["mcp-threat-model:check"] !== "node scripts/check-mcp-threat-model.mjs") {
      errors.push("package.json missing script: mcp-threat-model:check");
    }
  }

  return errors;
}

function writeFixture(root, overrides = {}) {
  const files = {
    "ops/contracts/public-api-boundary.json": JSON.stringify(
      { allowed_public_fields: ["slug", "name"] },
      null,
      2
    ),
    "ops/contracts/mcp-boundary.json": JSON.stringify(
      {
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [
          {
            name: "get_ai_project_profile",
            inputSchema: {
              type: "object",
              additionalProperties: false,
              required: ["slug"],
              properties: {
                slug: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{1,80}$" }
              }
            },
            output_fields: ["slug", "name"]
          }
        ]
      },
      null,
      2
    ),
    "docs/66_MCP_THREAT_MODEL_TOOL_SPEC_V0.md":
      "PR59 does not implement or expose an MCP server endpoint\nMCP v0 must be read-only\nMCP must not bypass the Public API boundary\nno direct Supabase access\nPrompt injection risks\nTool poisoning risks\nPR60 may proceed only after this spec passes\n",
    "package.json": JSON.stringify(
      { scripts: { "mcp-threat-model:check": "node scripts/check-mcp-threat-model.mjs" } },
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

function expectFailure(name, overrides, expectedText) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-pr59-"));
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
  expectFailure(
    "additionalProperties true",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: true }, output_fields: ["slug", "name"] }]
      }),
    },
    "additionalProperties:false"
  );
  expectFailure(
    "execute_query tool",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["execute_query"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "execute_query", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug"] }]
      }),
    },
    "Denied tool"
  );
  expectFailure(
    "run_sql input",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false, properties: { run_sql: { type: "string" } } }, output_fields: ["slug"] }]
      }),
    },
    "run_sql"
  );
  expectFailure(
    "email output",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug", "founder_email"] }]
      }),
    },
    "founder_email"
  );
  expectFailure(
    "payment_state output",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["get_ai_project_profile"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "get_ai_project_profile", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug", "payment_state"] }]
      }),
    },
    "payment_state"
  );
  expectFailure(
    "mcp supabase import",
    {
      "lib/mcp/server.ts": "import { getSupabaseClient } from '@/lib/supabase/server';\n",
    },
    "must not import Supabase"
  );
  expectFailure(
    "mutation tool",
    {
      "ops/contracts/mcp-boundary.json": JSON.stringify({
        dependency_rule: "public-api-only",
        direct_database_access: "forbidden",
        mutation_tools: "forbidden",
        server_runtime_implemented: false,
        endpoint_exposure: "none",
        allowed_tool_names: ["update_project"],
        denied_tool_names: ["execute_query", "run_sql", "fetch_url", "submit_project", "claim_project", "update_project", "send_email", "create_checkout"],
        denied_input_fields: ["sql", "raw_sql", "run_sql", "url", "email"],
        allowed_output_fields: ["slug", "name"],
        denied_output_fields: ["founder_email", "submitter_email", "claim_email", "admin_notes", "review_comments", "payment_state", "raw_supabase_row", "source_confidence_internal", "signal_score_internal"],
        private_field_denylist: ["email"],
        tool_specs: [{ name: "update_project", inputSchema: { type: "object", additionalProperties: false }, output_fields: ["slug"] }]
      }),
    },
    "Denied tool"
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
  console.error("mcp-threat-model:check failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("mcp-threat-model:check passed");
console.log(
  "Verified: Public API-only dependency, no direct Supabase access, read-only tool schemas, denied private/admin/payment fields, negative fixtures"
);
