import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { build } from "esbuild";
const target = path.resolve("dist/release");
await fs.rm(target, { recursive: true, force: true });
await fs.mkdir(target, { recursive: true });
await fs.cp(".next-production/standalone", target, {
  recursive: true,
  filter: (p) => !path.basename(p).startsWith(".env"),
});
await fs.cp(".next-production/static", path.join(target, ".next-production/static"), { recursive: true });
await fs.cp("public", path.join(target, "public"), { recursive: true });
await fs.cp("supabase/migrations", path.join(target, "migrations"), { recursive: true });
await build({ entryPoints: ["scripts/local/worker.ts"], outfile: path.join(target, "worker.mjs"), bundle: true, platform: "node", format: "esm", banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' }, target: "node24", external: ["bufferutil", "utf-8-validate"] });
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const commit = process.env.CHARTS_SOURCE_COMMIT || git("rev-parse", "HEAD");
const dirty = process.env.CHARTS_SOURCE_COMMIT ? process.env.CHARTS_SOURCE_DIRTY === "true" : !!git("status", "--porcelain");
await fs.writeFile(path.join(target, "release.json"), JSON.stringify({ commit, dirty, built_at: new Date().toISOString(), node: process.version }, null, 2));
console.log("Local Web + worker artifact: dist/release (no environment files).");
