import fs from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const envFile = process.env.CHARTS_COMPOSE_ENV;
if (!envFile) throw Error("CHARTS_COMPOSE_ENV is required; no default target database.");
const prefix = ["compose", "--env-file", envFile, "-f", "deploy/self-hosted/compose.yml", "exec", "-T", "db", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"];
const sql = (input) => execFileSync("docker", [...prefix, "-At"], { input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
sql("create table if not exists public.charts_deploy_migrations (name text primary key, sha256 text not null, applied_at timestamptz not null default now()); revoke all on public.charts_deploy_migrations from public,anon,authenticated;");
for (const name of fs.readdirSync("supabase/migrations").filter(x => /^\d+_[a-zA-Z0-9_-]+\.sql$/.test(x)).sort()) {
  const content = fs.readFileSync("supabase/migrations/" + name, "utf8");
  const hash = createHash("sha256").update(content).digest("hex");
  const old = sql(`select sha256 from public.charts_deploy_migrations where name='${name}';`);
  if (old && old !== hash) throw Error("Applied migration checksum mismatch: " + name);
  if (old) continue;
  sql(`begin;\n${content}\ninsert into public.charts_deploy_migrations(name,sha256) values ('${name}','${hash}');\ncommit;`);
  console.log("Applied " + name);
}
