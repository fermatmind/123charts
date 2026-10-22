import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { waitForLocalServices } from "./ready.mjs";
import {
  readLocalConfig,
  preflightEnvironment,
  inspectStack,
  rememberStack,
  assertPortAvailable,
  localDockerSocket,
} from "./config.mjs";
process.chdir(path.resolve(import.meta.dirname, "../.."));
const config = readLocalConfig();
preflightEnvironment(config);
localDockerSocket();
await assertPortAvailable(config.ports.web);
if (!fs.existsSync(".env.local")) {
  const r = spawnSync("npm", ["run", "local:setup"], { stdio: "inherit" });
  if (r.status) process.exit(r.status);
} else {
  inspectStack(config);
  const r = spawnSync(
    "npx",
    [
      "supabase",
      "start",
      "--network-id",
      config.network,
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
rememberStack(config);
const migration = spawnSync("npx", ["supabase", "migration", "up", "--local"], {
  stdio: "inherit",
});
if (migration.status) process.exit(migration.status);
const localEnv = preflightEnvironment(config);
await waitForLocalServices(
  localEnv.NEXT_PUBLIC_SUPABASE_URL,
  localEnv.SUPABASE_SERVICE_ROLE_KEY,
);

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
      String(config.ports.web),
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
function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = code;
  for (const c of children) {
    try {
      process.kill(-c.pid, "SIGTERM");
    } catch {
      c.kill("SIGTERM");
    }
  }
  if (
    fs.existsSync(".local/runtime.json") &&
    JSON.parse(fs.readFileSync(".local/runtime.json", "utf8")).parent ===
      process.pid
  )
    fs.rmSync(".local/runtime.json");
  setTimeout(() => process.exit(code), 1500).unref();
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
for (const c of children)
  c.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Local process exited: ${code}`);
      stop(code || 1);
    }
  });
