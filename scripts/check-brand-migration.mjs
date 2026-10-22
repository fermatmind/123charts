import fs from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const unexpected = [];
let migrations = 0, external = 0, compatibility = 0, historicalRepositories = 0;
const historicalRepositoryFiles = new Set([
  "docs/OPS0_REPO_STATE_AUDIT.md",
  "docs/infra/PRODUCTION_DEPLOY_GATE.md",
]);
for (const file of files) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
  const data = fs.readFileSync(file);
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(data); } catch { continue; }
  if (!/88cn/i.test(text)) continue;
  if (file.startsWith("supabase/migrations/")) { migrations++; continue; }
  if (["lib/legacy-identifiers.ts", "scripts/check-brand-migration.mjs", "docs/BRAND_MIGRATION.md"].includes(file)) { compatibility++; continue; }
  for (const line of text.split("\n")) {
    if (!/88cn/i.test(line)) continue;
    if (/88cn-index-data|88cn-scout-worker/i.test(line)) external++;
    else if (historicalRepositoryFiles.has(file) && /fermatmind\/88cn(?=$|[^a-z0-9_-])/i.test(line)) historicalRepositories++;
    else unexpected.push(file + ": " + line.slice(0, 140));
  }
}
assert.deepEqual(unexpected, [], "Unclassified old identifiers");
const changedMigrations = execFileSync("git", ["diff", "HEAD", "--name-only", "--", "supabase/migrations"], { encoding: "utf8" }).trim().split("\n").filter(Boolean).filter(file => { try { execFileSync("git", ["cat-file", "-e", "HEAD:" + file], { stdio: "ignore" }); return true; } catch { return false; } }).join("\n");
assert.equal(changedMigrations, "", "Applied migration files must remain byte-for-byte unchanged");
console.log(JSON.stringify({ result: "PASS", historicalMigrationFiles: migrations, historicalRepositoryReferences: historicalRepositories, externalResourceReferences: external, compatibilityFiles: compatibility }));
