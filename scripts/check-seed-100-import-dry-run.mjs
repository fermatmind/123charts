import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_ROOT = path.resolve(
  ROOT,
  process.env.INDEX_DATA_LOCAL_PATH || "../88cn-index-data"
);
const PROJECTS_DIR = path.join(DATA_ROOT, "data", "projects");
const SEED_MANIFEST = path.join(DATA_ROOT, "seed", "seed-100-manifest.json");
const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-seed-dry-run-"));
const OUT_DIR = path.join(TMP_ROOT, "compiled");
const requireFromScript = createRequire(import.meta.url);
const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertReason(label, classification, status, reason) {
  if (classification.status !== status || !classification.reasonCodes.includes(reason)) {
    fail(
      `${label} expected ${status}:${reason}, got ${classification.status}:${classification.reasonCodes.join(",") || "none"}`
    );
  }
}

function compileIndexDataHelpers() {
  const tscPath = path.join(ROOT, "node_modules", ".bin", "tsc");
  if (!fs.existsSync(tscPath)) {
    fail("Missing local TypeScript compiler. Run npm ci before seed dry-run.");
    return false;
  }

  const files = [
    "lib/index-data/forbidden-fields.ts",
    "lib/index-data/import-summary.ts",
    "lib/index-data/normalize.ts",
    "lib/index-data/quarantine.ts",
    "lib/index-data/types.ts",
    "lib/index-data/validate.ts",
  ];

  try {
    execFileSync(
      tscPath,
      [
        "--module",
        "commonjs",
        "--target",
        "es2022",
        "--moduleResolution",
        "node",
        "--esModuleInterop",
        "--skipLibCheck",
        "--outDir",
        OUT_DIR,
        ...files,
      ],
      { cwd: ROOT, stdio: "pipe" }
    );
    return true;
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : "";
    const stdout = error?.stdout ? String(error.stdout) : "";
    fail(`TypeScript helper compile failed: ${(stderr || stdout || "unknown error").trim()}`);
    return false;
  }
}

function loadHelpers() {
  const base = OUT_DIR;
  return {
    ...requireFromScript(path.join(base, "import-summary.js")),
    ...requireFromScript(path.join(base, "quarantine.js")),
  };
}

function classifyEntries(entries, helpers) {
  const summary = helpers.createImportQuarantineSummary();
  const batchSlugs = new Set();
  const batchFingerprints = new Set();
  const classifications = [];

  for (const entry of entries) {
    let classification = helpers.classifyIndexProject({
      project: entry.project,
      sourcePath: entry.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
      existingSlugs: new Set(),
      existingFingerprints: new Set(),
    });

    if (classification.status === "accepted" && classification.slug && classification.fingerprint) {
      if (batchFingerprints.has(classification.fingerprint)) {
        classification = {
          ...classification,
          status: "duplicate",
          reasonCodes: ["duplicate_fingerprint"],
          details: {
            ...classification.details,
            issue: "import fingerprint already exists in current batch",
          },
        };
      } else if (batchSlugs.has(classification.slug)) {
        classification = {
          ...classification,
          status: "duplicate",
          reasonCodes: ["duplicate_slug"],
          details: {
            ...classification.details,
            issue: "project slug already exists in current batch",
          },
        };
      } else {
        batchSlugs.add(classification.slug);
        batchFingerprints.add(classification.fingerprint);
      }
    }

    helpers.addClassificationToSummary(summary, classification.status, classification.reasonCodes);
    classifications.push(classification);
  }

  return { summary, classifications };
}

function main() {
  if (!fs.existsSync(SEED_MANIFEST)) {
    fail(`Missing Seed 100 manifest at ${SEED_MANIFEST}`);
  }
  if (!fs.existsSync(PROJECTS_DIR)) {
    fail(`Missing project data directory at ${PROJECTS_DIR}`);
  }
  if (errors.length > 0) return;

  const manifest = readJson(SEED_MANIFEST);
  if (!Array.isArray(manifest.items) || manifest.items.length !== 100) {
    fail("Seed manifest must contain exactly 100 items.");
  }

  const files = fs.readdirSync(PROJECTS_DIR).filter((file) => file.endsWith(".json")).sort();
  if (files.length < 100) {
    fail(`Expected at least 100 project JSON files, found ${files.length}.`);
  }

  if (!compileIndexDataHelpers()) return;
  const helpers = loadHelpers();

  const entries = files.map((file) => ({
    path: `data/projects/${file}`,
    project: readJson(path.join(PROJECTS_DIR, file)),
  }));

  const { summary, classifications } = classifyEntries(entries, helpers);
  const accepted = classifications.filter((item) => item.status === "accepted").length;
  const nonAccepted = classifications.filter((item) => item.status !== "accepted");

  if (summary.total !== files.length) fail(`Summary total ${summary.total} does not match file count ${files.length}.`);
  if (accepted < 100) fail(`Expected at least 100 accepted projects, found ${accepted}.`);
  if (nonAccepted.length > 0) {
    fail(`Expected local seed files to classify cleanly, found ${nonAccepted.length} non-accepted entries.`);
  }

  for (const reason of helpers.QUARANTINE_REASON_CODES) {
    if (!(reason in summary.reasons)) {
      fail(`Summary missing reason key: ${reason}`);
    }
  }

  const first = entries[0];
  const firstAccepted = helpers.classifyIndexProject({
    project: first.project,
    sourcePath: first.path,
    sourceRepo: "fermatmind/88cn-index-data",
    sourceCommit: "local-dev",
  });

  assertReason(
    "duplicate_slug",
    helpers.classifyIndexProject({
      project: first.project,
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
      existingSlugs: new Set([first.project.slug]),
    }),
    "duplicate",
    "duplicate_slug"
  );

  if (!firstAccepted.fingerprint) {
    fail("Accepted probe did not produce an import fingerprint.");
  } else {
    assertReason(
      "duplicate_fingerprint",
      helpers.classifyIndexProject({
        project: first.project,
        sourcePath: first.path,
        sourceRepo: "fermatmind/88cn-index-data",
        sourceCommit: "local-dev",
        existingFingerprints: new Set([firstAccepted.fingerprint]),
      }),
      "duplicate",
      "duplicate_fingerprint"
    );
  }

  assertReason(
    "invalid_url",
    helpers.classifyIndexProject({
      project: { ...first.project, website_url: "http://example.invalid" },
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
    }),
    "quarantined",
    "invalid_url"
  );

  assertReason(
    "invalid_category",
    helpers.classifyIndexProject({
      project: { ...first.project, category_slug: "not-a-category" },
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
    }),
    "quarantined",
    "invalid_category"
  );

  assertReason(
    "forbidden_field",
    helpers.classifyIndexProject({
      project: { ...first.project, private_dashboard: "https://example.invalid/private" },
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
    }),
    "quarantined",
    "forbidden_field"
  );

  assertReason(
    "privacy_risk",
    helpers.classifyIndexProject({
      project: { ...first.project, one_liner: "Private contact 15551234567." },
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
    }),
    "quarantined",
    "privacy_risk"
  );

  assertReason(
    "malformed_payload",
    helpers.classifyIndexProject({
      project: {},
      sourcePath: first.path,
      sourceRepo: "fermatmind/88cn-index-data",
      sourceCommit: "local-dev",
    }),
    "rejected",
    "malformed_payload"
  );

  console.log(
    JSON.stringify(
      {
        data_repo: DATA_ROOT,
        files: files.length,
        seed_manifest_items: manifest.items.length,
        accepted,
        summary,
        probes: {
          duplicate_slug: "PASS",
          duplicate_fingerprint: "PASS",
          invalid_url: "PASS",
          invalid_category: "PASS",
          forbidden_field: "PASS",
          privacy_risk: "PASS",
          malformed_payload: "PASS",
        },
      },
      null,
      2
    )
  );
}

try {
  main();
} finally {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error("external-import:seed-dry-run failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("external-import:seed-dry-run passed");
