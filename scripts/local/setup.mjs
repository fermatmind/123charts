import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
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
const quiet = { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] };
function run(command, args) {
  return execFileSync(command, args, quiet);
}
try {
  run("docker", ["info"]);
} catch {
  if (process.platform !== "darwin")
    throw Error(
      "Start the local Docker Engine, confirm docker info succeeds, then retry npm run local:setup.",
    );
  spawnSync("open", ["-a", "Docker"]);
  console.log("Starting Docker…");
  let ready = false;
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      run("docker", ["info"]);
      ready = true;
      break;
    } catch {}
  }
  if (!ready)
    throw new Error("Docker did not become ready. Check Docker Desktop.");
}
if (!fs.existsSync("supabase/config.toml"))
  throw new Error("Missing local Supabase config.");
const existingStack = inspectStack(config);
if (!existingStack)
  for (const [name, port] of Object.entries(config.ports))
    if (name !== "web") await assertPortAvailable(port);
try {
  run("docker", ["network", "inspect", config.network]);
} catch {
  run("docker", [
    "network",
    "create",
    "-o",
    "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
    config.network,
  ]);
}
console.log("Starting local database, auth, private storage and mail inbox…");
try {
  run("npx", [
    "supabase",
    "start",
    "--network-id",
    config.network,
    "--exclude",
    "realtime,imgproxy,edge-runtime,logflare,vector,supavisor",
  ]);
} catch (e) {
  console.error(e.stderr?.toString());
  throw new Error("Local Supabase startup failed.");
}
console.log("Checking loopback bindings and applying local migrations…");
console.log(run("node", ["scripts/local/bind-local.mjs"]).trim());
rememberStack(config);
run("npx", ["supabase", "migration", "up", "--local"]);
const s = JSON.parse(run("npx", ["supabase", "status", "-o", "json"]));
if (!["127.0.0.1", "localhost"].includes(new URL(s.API_URL).hostname))
  throw new Error("Refusing non-local database.");
const env = {
  NEXT_PUBLIC_SUPABASE_URL: s.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: s.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: s.SERVICE_ROLE_KEY,
  APP_URL: config.siteUrl,
  CHARTS_LOCAL_PREVIEW: "true",
  CHARTS_SMTP_PORT: String(config.ports.smtp),
};
if (fs.existsSync(".env.local")) {
  const current = fs.readFileSync(".env.local", "utf8");
  const url = current.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1];
  if (url && !["localhost", "127.0.0.1"].includes(new URL(url).hostname))
    throw new Error(
      "Existing configuration points to a non-local database. It was not changed.",
    );
}
fs.writeFileSync(
  ".env.local",
  (fs.existsSync(".env.local")
    ? fs
        .readFileSync(".env.local", "utf8")
        .split("\n")
        .filter((line) => {
          const key = line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1];
          return !key || !(key in env);
        })
        .filter((line) => line.trim())
        .join("\n") + "\n"
    : "") +
    Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") +
    "\n",

  { mode: 0o600 },
);
await waitForLocalServices(s.API_URL, s.SERVICE_ROLE_KEY);
const seed = spawnSync("npx", ["tsx", "scripts/local/seed-discovery.ts"], {
  stdio: "inherit",
});
if (seed.status) process.exit(seed.status);
const navigationFacts = spawnSync(
  "npx",
  ["tsx", "scripts/local/refine-navigation-data.ts"],
  { stdio: "inherit" },
);
if (navigationFacts.status) process.exit(navigationFacts.status);
console.log(
  `Ready. Run npm run dev:local. Preview: ${config.siteUrl}/en. Test credentials: .local/accounts.json. Mail inbox: http://127.0.0.1:${config.ports.mail}`,
);
