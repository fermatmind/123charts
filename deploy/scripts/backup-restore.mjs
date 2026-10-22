// Explicit targets only. Restore is restricted to a new 123charts-restore-* stack.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { execFileSync, spawnSync } from "node:child_process";
const action = process.argv[2], directory = process.argv[3];
if (!["backup", "restore"].includes(action) || !directory || !process.env.CHARTS_COMPOSE_ENV)
  throw Error("Usage: CHARTS_COMPOSE_ENV=<external env> CHARTS_WRITES_PAUSED=true node deploy/scripts/backup-restore.mjs backup|restore <directory>");
if (process.env.CHARTS_WRITES_PAUSED !== "true") throw Error("Stop Web and worker writes first; CHARTS_WRITES_PAUSED must be true.");
const prefix = ["compose", "--env-file", process.env.CHARTS_COMPOSE_ENV, "-f", "deploy/self-hosted/compose.yml"];
const run = (...args) => execFileSync("docker", [...prefix, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const model = JSON.parse(run("config", "--format", "json"));
if (!/^123charts-[a-z0-9-]+$/.test(model.name)) throw Error("Dedicated 123charts Compose project required.");
const destination = path.resolve(directory);
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function stream(args, file, input = false) {
  const fd = fs.openSync(file, input ? "r" : "wx", 0o600);
  try {
    const result = spawnSync("docker", [...prefix, ...args], { stdio: input ? [fd, "pipe", "pipe"] : ["ignore", fd, "pipe"], maxBuffer: 4 * 1024 * 1024 });
    if (result.status !== 0) throw Error("Backup/restore command failed: " + (result.stderr?.toString() || "unknown error"));
  } finally { fs.closeSync(fd); }
}
if (action === "backup") {
  fs.mkdirSync(destination, { recursive: false, mode: 0o700 });
  // Caller already stopped Web/worker; pausing all API writers makes files and SQL coherent.
  run("stop", "api-gw", "auth", "rest", "storage");
  try {
    stream(["exec", "-T", "db", "pg_dump", "-U", "supabase_admin", "-d", "postgres", "-Fc"], path.join(destination, "database.dump"));
    stream(["run", "--rm", "--no-deps", "-T", "--entrypoint", "tar", "storage", "-C", "/var/lib/storage", "-cpf", "-", "."], path.join(destination, "storage.tar"));
    stream(["run", "--rm", "--no-deps", "-T", "--entrypoint", "tar", "db", "-C", "/etc/postgresql-custom", "-cpf", "-", "."], path.join(destination, "database-config.tar"));
    fs.writeFileSync(path.join(destination, "privileges.json"), run("exec", "-T", "db", "psql", "-U", "supabase_admin", "-d", "postgres", "-qAt", "-c", fs.readFileSync("deploy/scripts/privileges.sql", "utf8")), { mode: 0o600 });
    fs.writeFileSync(path.join(destination, "data.json"), run("exec", "-T", "db", "psql", "-U", "supabase_admin", "-d", "postgres", "-qAt", "-c", fs.readFileSync("deploy/scripts/data-fingerprint.sql", "utf8")), { mode: 0o600 });
    fs.writeFileSync(path.join(destination, "manifest.json"), JSON.stringify({ project: model.name, created_at: new Date().toISOString(), images: Object.fromEntries(Object.entries(model.services).map(([k, v]) => [k, v.image])), files: Object.fromEntries(["database.dump", "storage.tar", "database-config.tar", "privileges.json", "data.json"].map(f => [f, hash(path.join(destination, f))])) }, null, 2), { mode: 0o600 });
  } finally { run("up", "-d"); }
  console.log("Backup complete; encrypt and copy off-node using independently provisioned storage.");
} else {
  if (!model.name.startsWith("123charts-restore-")) throw Error("Restore requires a NEW isolated 123charts-restore-* project; live stacks are refused.");
  const manifest = JSON.parse(fs.readFileSync(path.join(destination, "manifest.json"), "utf8"));
  for (const f of ["database.dump", "storage.tar", "database-config.tar", "privileges.json", "data.json"])
    if (manifest.files[f] !== hash(path.join(destination, f))) throw Error("Backup checksum mismatch: " + f);
  if (model.services.db.image !== manifest.images.db) throw Error("Restore requires the exact source PostgreSQL image.");
  const existing = run("exec", "-T", "db", "psql", "-U", "postgres", "-d", "postgres", "-Atc", "select to_regclass('public.charts_projects') is not null;");
  if (existing !== "f") throw Error("Target already contains application data; refusing restore.");
  const users = run("exec", "-T", "db", "psql", "-U", "postgres", "-d", "postgres", "-Atc", "select count(*) from auth.users;");
  if (users !== "0") throw Error("Target already has accounts; refusing restore.");
  const files = run("run", "--rm", "--no-deps", "-T", "--entrypoint", "find", "storage", "/var/lib/storage", "-type", "f");
  if (files) throw Error("Target storage is not empty; refusing restore.");
  run("stop", "api-gw", "auth", "rest", "storage");
  // On failure leave the target stopped for inspection; never start a partial restore.
  run("stop", "db");
  stream(["run", "--rm", "--no-deps", "-T", "--entrypoint", "tar", "db", "-C", "/etc/postgresql-custom", "-xpf", "-"], path.join(destination, "database-config.tar"), true);
  run("up", "-d", "--wait", "db");
  run("exec", "-T", "db", "psql", "-U", "supabase_admin", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", fs.readFileSync("deploy/scripts/clear-restore-defaults.sql", "utf8"));
  stream(["exec", "-T", "db", "pg_restore", "-U", "supabase_admin", "-d", "postgres", "--clean", "--if-exists", "--exit-on-error", "--single-transaction"], path.join(destination, "database.dump"), true);
  stream(["run", "--rm", "--no-deps", "-T", "--entrypoint", "tar", "storage", "-C", "/var/lib/storage", "-xpf", "-"], path.join(destination, "storage.tar"), true);
  const expected = JSON.parse(fs.readFileSync(path.join(destination, "privileges.json"), "utf8"));
  const actual = JSON.parse(run("exec", "-T", "db", "psql", "-U", "supabase_admin", "-d", "postgres", "-qAt", "-c", fs.readFileSync("deploy/scripts/privileges.sql", "utf8")));
  if (!isDeepStrictEqual(actual, expected)) {
    const changed = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].filter(k => !isDeepStrictEqual(actual[k], expected[k]));
    throw Error("Restored ACL/RLS mismatch; API remains stopped: " + changed.slice(0, 10).join(", "));
  }
  const expectedData = JSON.parse(fs.readFileSync(path.join(destination, "data.json"), "utf8"));
  const actualData = JSON.parse(run("exec", "-T", "db", "psql", "-U", "supabase_admin", "-d", "postgres", "-qAt", "-c", fs.readFileSync("deploy/scripts/data-fingerprint.sql", "utf8")));
  if (!isDeepStrictEqual(actualData, expectedData)) throw Error("Restored data fingerprints differ; API remains stopped.");
  run("up", "-d");
  console.log("Restored into isolated stack. ACL/RLS matched. Verify identities, records and private files before any traffic switch.");
}
