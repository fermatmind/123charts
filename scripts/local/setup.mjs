import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
process.chdir(path.resolve(import.meta.dirname, "../.."));
const quiet = { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] };
function run(command, args) {
  return execFileSync(command, args, quiet);
}
try {
  run("docker", ["info"]);
} catch {
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
try {
  run("docker", ["network", "inspect", "charts-local"]);
} catch {
  run("docker", [
    "network",
    "create",
    "-o",
    "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
    "charts-local",
  ]);
}
console.log("Starting local database, auth, private storage and mail inbox…");
try {
  run("npx", [
    "supabase",
    "start",
    "--network-id",
    "charts-local",
    "--exclude",
    "realtime,imgproxy,edge-runtime,logflare,vector,supavisor",
  ]);
} catch (e) {
  console.error(e.stderr?.toString());
  throw new Error("Local Supabase startup failed.");
}
run("node", ["scripts/local/bind-local.mjs"]);
run("npx", ["supabase", "migration", "up", "--local"]);
const s = JSON.parse(run("npx", ["supabase", "status", "-o", "json"]));
if (!["127.0.0.1", "localhost"].includes(new URL(s.API_URL).hostname))
  throw new Error("Refusing non-local database.");
const env = {
  NEXT_PUBLIC_SUPABASE_URL: s.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: s.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: s.SERVICE_ROLE_KEY,
  APP_URL: "http://127.0.0.1:3100",
  CHARTS_LOCAL_PREVIEW: "true",
  CHARTS_SMTP_PORT: "54325",
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
fs.mkdirSync(".local/fonts", { recursive: true });
const systemFont = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";
if (fs.existsSync(systemFont))
  fs.copyFileSync(systemFont, ".local/fonts/preview-unicode.ttf");
// A healthy gateway process can briefly precede ready Auth/Storage upstreams after recreation.
let upstreamsReady = false;
for (let attempt = 0; attempt < 40; attempt++) {
  try {
    const response = await fetch(
      `${s.API_URL}/auth/v1/admin/users?page=1&per_page=1`,
      {
        headers: {
          apikey: s.SERVICE_ROLE_KEY,
          Authorization: `Bearer ${s.SERVICE_ROLE_KEY}`,
        },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (response.ok) {
      upstreamsReady = true;
      break;
    }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
if (!upstreamsReady)
  throw new Error(
    "Local Auth upstream is not ready; no seed data was changed.",
  );
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
  "Ready. Run npm run dev:local. Test credentials: .local/accounts.json. Mail inbox: http://127.0.0.1:54324",
);
