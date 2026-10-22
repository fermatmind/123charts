// Supabase CLI/Docker Desktop can ignore a custom bridge's default host binding.
// Recreate only this project's published-port containers with explicit loopback
// bindings, preserving their exact configuration and all existing volume mounts.
import http from "node:http";
import { execFileSync } from "node:child_process";
const run = (args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
const endpoint = JSON.parse(run(["context", "inspect"]))[0].Endpoints.docker
  .Host;
if (!endpoint.startsWith("unix://"))
  throw new Error("Local setup requires a local Docker socket.");
function api(method, url, body) {
  return new Promise((resolve, reject) => {
    const json = body ? JSON.stringify(body) : "";
    const r = http.request(
      {
        socketPath: endpoint.slice(7),
        path: "/v1.44" + url,
        method,
        headers: json
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(json),
            }
          : {},
      },
      (res) => {
        let text = "";
        res.on("data", (x) => (text += x));
        res.on("end", () => {
          const parsed = text ? JSON.parse(text) : {};
          if ((res.statusCode ?? 500) >= 400)
            reject(
              new Error(parsed.message ?? `Docker HTTP ${res.statusCode}`),
            );
          else resolve(parsed);
        });
      },
    );
    r.on("error", reject);
    r.end(json);
  });
}
const names = run(["ps", "-a", "--format", "{{.Names}}"])
  .trim()
  .split("\n")
  .filter((n) => n.endsWith("_123charts-local"));
for (const name of names.sort(
  (a, b) => (a.includes("_db_") ? -1 : 0) - (b.includes("_db_") ? -1 : 0),
)) {
  const info = await api("GET", `/containers/${name}/json`);
  const bindings = info.HostConfig.PortBindings ?? {};
  const needsSmtp = name.includes("_inbucket_") && !bindings["1025/tcp"];
  if (
    !needsSmtp &&
    !Object.values(bindings).some((list) =>
      (list ?? []).some((x) => !["127.0.0.1", "::1"].includes(x.HostIp)),
    )
  )
    continue;
  if (needsSmtp)
    bindings["1025/tcp"] = [{ HostIp: "127.0.0.1", HostPort: "54325" }];
  if (!info.NetworkSettings.Networks["charts-local"])
    throw new Error(
      "Unexpected Docker network; local container was not modified.",
    );
  for (const list of Object.values(bindings))
    for (const binding of list ?? []) binding.HostIp = "127.0.0.1";
  const host = { ...info.HostConfig, PortBindings: bindings };
  delete host.Binds;
  host.Mounts = info.Mounts.map((m) => ({
    Type: m.Type,
    Source: m.Type === "volume" ? m.Name : m.Source,
    Target: m.Destination,
    ReadOnly: !m.RW,
  }));
  const endpoints = {};
  for (const [network, value] of Object.entries(info.NetworkSettings.Networks))
    endpoints[network] = { Aliases: value.Aliases };
  // Kong's declarative config/certificates are injected into its writable layer by the CLI.
  const runtimeFiles = name.includes("_kong_")
    ? execFileSync("docker", ["cp", `${name}:/home/kong/.`, "-"], {
        maxBuffer: 8 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      })
    : null;
  const backup = `${name}-loopback-backup`;
  await api("POST", `/containers/${name}/stop?t=20`);
  await api("POST", `/containers/${name}/rename?name=${backup}`);
  let created = false;
  try {
    await api("POST", `/containers/create?name=${name}`, {
      ...info.Config,
      HostConfig: host,
      NetworkingConfig: { EndpointsConfig: endpoints },
    });
    created = true;
    if (runtimeFiles)
      execFileSync("docker", ["cp", "-", `${name}:/home/kong`], {
        input: runtimeFiles,
        stdio: ["pipe", "ignore", "pipe"],
      });
    await api("POST", `/containers/${name}/start`);
    let ready = false;
    for (let i = 0; i < 45; i++) {
      const state = (await api("GET", `/containers/${name}/json`)).State;
      if (
        state.Running &&
        (!state.Health || state.Health.Status === "healthy")
      ) {
        ready = true;
        break;
      }
      if (state.Status === "exited") break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!ready) throw new Error(`Loopback container health failed: ${name}`);
    await api("DELETE", `/containers/${backup}`);
    console.log(`Bound ${name} to 127.0.0.1; volumes retained.`);
  } catch (error) {
    if (created) {
      try {
        await api("DELETE", `/containers/${name}?force=true`);
      } catch {}
    }
    await api("POST", `/containers/${backup}/rename?name=${name}`);
    await api("POST", `/containers/${name}/start`);
    throw error;
  }
}
