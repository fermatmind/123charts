#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_REPO = path.resolve(ROOT, "../88cn-index-data");
const EXPORTER = path.join(ROOT, "scripts/export-alpha-feed-snapshot.mjs");
const OUT_DIR = path.join("/tmp", `123charts-alpha-snapshot-check-${process.pid}`);
const errors = [];
const deniedFragments = [
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
  errors.push(message);
}

function run(args) {
  return spawnSync(process.execPath, [EXPORTER, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function expectFailure(args, label) {
  const result = run(args);
  if (result.status === 0) {
    fail(`${label} should fail`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readNdjson(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function validateRecord(record) {
  if (record.published_status !== "published") {
    fail(`non-published status found: ${record.project_slug}`);
  }
  for (const key of Object.keys(record)) {
    const lower = key.toLowerCase();
    for (const fragment of deniedFragments) {
      if (lower.includes(fragment)) fail(`denied field found: ${key}`);
    }
  }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });

const success = run(["--dry-run", "--out", OUT_DIR, "--source", "local", "--no-external-write"]);
if (success.status !== 0) {
  fail(`dry-run exporter failed: ${success.stderr || success.stdout}`);
} else {
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  const ndjsonPath = path.join(OUT_DIR, "snapshot.ndjson");
  const csvPath = path.join(OUT_DIR, "snapshot.csv");

  for (const filePath of [manifestPath, ndjsonPath, csvPath]) {
    if (!fs.existsSync(filePath)) fail(`missing ${path.basename(filePath)}`);
  }

  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    if (manifest.dry_run !== true) fail("manifest must mark dry_run true");
    if (manifest.source !== "local") fail("manifest source must be local");
    if (manifest.record_count < 1) fail("manifest must report at least one record");
    if (!Array.isArray(manifest.written_files) || manifest.written_files.length < 2) {
      fail("manifest must list written files");
    }
  }

  if (fs.existsSync(ndjsonPath)) {
    const records = readNdjson(ndjsonPath);
    if (records.length < 1) fail("snapshot.ndjson must contain records");
    for (const record of records) validateRecord(record);
  }

  if (fs.existsSync(csvPath)) {
    const header = fs.readFileSync(csvPath, "utf8").split(/\r?\n/)[0] ?? "";
    for (const fragment of deniedFragments) {
      if (header.toLowerCase().includes(fragment)) fail(`CSV header contains denied fragment: ${fragment}`);
    }
  }
}

expectFailure(["--out", OUT_DIR], "missing --dry-run");
expectFailure(["--dry-run", "--out", path.join(ROOT, "123charts-alpha-snapshot-repo")], "repo output");
expectFailure(["--dry-run", "--out", path.join(DATA_REPO, "123charts-alpha-snapshot-data")], "data repo output");
expectFailure(["--dry-run", "--out", "https://example.com/snapshot"], "external destination");
expectFailure(["--dry-run", "--out", path.join(os.tmpdir(), "unsafe-alpha-snapshot")], "unsafe tmp name");
expectFailure(["--dry-run", "--out", OUT_DIR, "--source", "remote"], "remote source");

fs.rmSync(OUT_DIR, { recursive: true, force: true });

if (errors.length > 0) {
  console.error("alpha-feed-snapshot check failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("alpha-feed-snapshot check passed");
