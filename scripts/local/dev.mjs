import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
process.chdir(path.resolve(import.meta.dirname, "../.."));
if (!fs.existsSync(".env.local")) {
  const r = spawnSync("npm", ["run", "local:setup"], { stdio: "inherit" });
  if (r.status) process.exit(r.status);
} else {
  const r = spawnSync(
    "npx",
    [
      "supabase",
      "start",
      "--network-id",
      "charts-local",
      "--exclude",
      "realtime,imgproxy,edge-runtime,logflare,vector,supavisor",
    ],
    { stdio: "ignore" },
  );
  if (r.status) {
    console.error(
      "Local database startup failed. Run npm run local:setup for diagnostics.",
    );
    process.exit(r.status);
  }
}
const bound = spawnSync("node", ["scripts/local/bind-local.mjs"], {
  stdio: "inherit",
});
if (bound.status) process.exit(bound.status);
const migration = spawnSync("npx", ["supabase", "migration", "up", "--local"], {
  stdio: "inherit",
});
if (migration.status) process.exit(migration.status);

fs.mkdirSync(".local", { recursive: true });
const children = [
  spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3100",
    ],
    {
      stdio: "inherit",
      detached: true,
    },
  ),
  spawn(process.execPath, ["--import", "tsx", "scripts/local/worker.ts"], {
    stdio: "inherit",
    detached: true,
  }),
];
fs.writeFileSync(
  ".local/runtime.json",
  JSON.stringify({ parent: process.pid, children: children.map((x) => x.pid) }),
);
let shuttingDown = false;
function stop() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      process.kill(-c.pid, "SIGTERM");
    } catch {
      c.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const c of children)
  c.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Local process exited: ${code}`);
      stop();
    }
  });
