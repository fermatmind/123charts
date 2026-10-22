import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
process.chdir(path.resolve(import.meta.dirname, "../.."));
if (fs.existsSync(".local/runtime.json")) {
  const runtime = JSON.parse(fs.readFileSync(".local/runtime.json", "utf8"));
  let valid = false;
  try {
    const command = execFileSync(
      "ps",
      ["-p", String(runtime.parent), "-o", "command="],
      { encoding: "utf8" },
    );
    const cwd = execFileSync(
      "lsof",
      ["-a", "-p", String(runtime.parent), "-d", "cwd", "-Fn"],
      { encoding: "utf8" },
    );
    valid =
      command.includes("scripts/local/dev.mjs") &&
      cwd.split("\n").includes("n" + process.cwd());
  } catch {}
  if (valid) {
    const rows = execFileSync("ps", ["-axo", "pid=,ppid="], {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .map((s) => s.trim().split(/\s+/).map(Number));
    const tree = [runtime.parent];
    for (let i = 0; i < tree.length; i++)
      for (const [pid, ppid] of rows) if (ppid === tree[i]) tree.push(pid);
    for (const pid of tree.reverse()) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {}
    }
  }
  fs.rmSync(".local/runtime.json", { force: true });
}
// Default Supabase stop retains database/storage volumes; never use --no-backup.
const result = spawnSync("npx", ["supabase", "stop"], { stdio: "ignore" });
if (result.status) process.exit(result.status);
console.log("Local services stopped. Existing database and files retained.");
