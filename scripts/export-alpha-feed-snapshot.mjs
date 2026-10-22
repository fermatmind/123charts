#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_REPO = path.resolve(ROOT, "../88cn-index-data");
const TMP_OUTPUT_ROOT = "/tmp";
const DEFAULT_OUT = path.join(
  TMP_OUTPUT_ROOT,
  `123charts-alpha-snapshot-${new Date().toISOString().replace(/[:.]/g, "-")}`
);
const SNAPSHOT_VERSION = "pr84-dry-run-v0";
const ALLOWED_FORMATS = new Set(["ndjson", "csv"]);
const DENIED_FIELD_FRAGMENTS = [
  "email",
  "admin",
  "reviewer",
  "review_",
  "payment",
  "stripe",
  "commercial_order",
  "api_key",
  "customer_key",
  "metering",
  "source_confidence_internal",
  "signal_score_internal",
  "hidden_score",
  "raw_payload",
  "raw_supabase_row",
  "private",
  "claim_secret",
  "telemetry",
  "quarantine",
];

function fail(message) {
  console.error(`alpha snapshot dry-run failed: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    out: DEFAULT_OUT,
    formats: new Set(["ndjson", "csv"]),
    source: "local",
    noExternalWrite: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--out") {
      args.out = argv[++index];
      if (!args.out) fail("--out requires a path");
    } else if (arg === "--format") {
      const format = argv[++index];
      if (!ALLOWED_FORMATS.has(format)) fail(`Unsupported format: ${format}`);
      if (args.formats.size === 2) args.formats = new Set();
      args.formats.add(format);
    } else if (arg === "--source") {
      args.source = argv[++index];
      if (!args.source) fail("--source requires a value");
    } else if (arg === "--no-external-write") {
      args.noExternalWrite = true;
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  if (!args.dryRun) fail("explicit --dry-run is required");
  if (args.source !== "local") fail("only --source local is allowed");
  return args;
}

function assertSafeOutDir(outPath) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(outPath)) {
    fail("external destinations are not allowed");
  }

  const resolved = path.resolve(outPath);
  const tmpRoots = [path.resolve(TMP_OUTPUT_ROOT), path.resolve(os.tmpdir())];
  const relativeToRepo = path.relative(ROOT, resolved);
  const relativeToDataRepo = path.relative(DATA_REPO, resolved);

  const isUnderAllowedTmpRoot = tmpRoots.some((tmpRoot) => {
    const relativeToTmp = path.relative(tmpRoot, resolved);
    return relativeToTmp === "" || (!relativeToTmp.startsWith("..") && !path.isAbsolute(relativeToTmp));
  });
  if (!isUnderAllowedTmpRoot) {
    fail("output must be under the OS temp directory");
  }
  if (!path.basename(resolved).startsWith("123charts-alpha-snapshot-")) {
    fail("output directory name must start with 123charts-alpha-snapshot-");
  }
  if (!relativeToRepo.startsWith("..") && !path.isAbsolute(relativeToRepo)) {
    fail("repo output paths are not allowed");
  }
  if (!relativeToDataRepo.startsWith("..") && !path.isAbsolute(relativeToDataRepo)) {
    fail("data repo output paths are not allowed");
  }

  return resolved;
}

function loadDemoProjects() {
  const sourcePath = path.join(ROOT, "lib/demo-projects.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const start = source.indexOf("export const demoProjects");
  if (start === -1) fail("missing demoProjects source");
  const arrayStart = source.indexOf("=", start);
  const arrayEnd = source.indexOf("];", arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) fail("could not parse demoProjects array");

  const expression = `const demoProjects ${source.slice(arrayStart, arrayEnd + 2)}\ndemoProjects;`;
  return vm.runInNewContext(expression, {}, { timeout: 1000 });
}

function toSnapshot(project) {
  return {
    snapshot_version: SNAPSHOT_VERSION,
    project_slug: project.slug,
    project_name: project.name,
    canonical_url: project.website,
    category: project.category,
    technology_tags: [],
    published_status: "published",
    public_source_links: project.publicSources,
    machine_readability_summary: project.tagline,
    last_reviewed_at: null,
    public_profile_url: `/projects/${project.slug}`,
    public_changelog_summary: null,
  };
}

function assertRecordBoundary(record) {
  for (const key of Object.keys(record)) {
    const lower = key.toLowerCase();
    for (const fragment of DENIED_FIELD_FRAGMENTS) {
      if (lower.includes(fragment)) fail(`denied field in output: ${key}`);
    }
  }
  if (record.published_status !== "published") {
    fail(`non-published record in output: ${record.project_slug}`);
  }
}

function csvEscape(value) {
  if (Array.isArray(value)) return csvEscape(value.join("|"));
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeNdjson(filePath, records) {
  fs.writeFileSync(
    filePath,
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
    "utf8"
  );
}

function writeCsv(filePath, records) {
  const fields = Object.keys(records[0] ?? toSnapshot({
    slug: "",
    name: "",
    website: "",
    category: "",
    publicSources: [],
    tagline: "",
  }));
  const lines = [
    fields.join(","),
    ...records.map((record) => fields.map((field) => csvEscape(record[field])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

const args = parseArgs(process.argv.slice(2));
const outDir = assertSafeOutDir(args.out);
const projects = loadDemoProjects();
const records = projects
  .filter((project) => project.status === "published")
  .map(toSnapshot);

for (const record of records) assertRecordBoundary(record);

fs.mkdirSync(outDir, { recursive: true });
const written = [];
if (args.formats.has("ndjson")) {
  const ndjsonPath = path.join(outDir, "snapshot.ndjson");
  writeNdjson(ndjsonPath, records);
  written.push(ndjsonPath);
}
if (args.formats.has("csv")) {
  const csvPath = path.join(outDir, "snapshot.csv");
  writeCsv(csvPath, records);
  written.push(csvPath);
}

const manifest = {
  snapshot_version: SNAPSHOT_VERSION,
  dry_run: true,
  source: "local",
  output_dir: outDir,
  record_count: records.length,
  formats: [...args.formats].sort(),
  written_files: written.map((filePath) => path.relative(outDir, filePath)),
  denied_runtime_surfaces: [
    "endpoint",
    "customer_access",
    "external_write",
    "data_repo_mutation",
    "api_key_runtime",
    "metering_runtime",
  ],
};
fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify(manifest, null, 2));
