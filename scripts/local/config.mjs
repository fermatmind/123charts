import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { execFileSync } from "node:child_process";

export function localDockerSocket() {
  if (process.env.DOCKER_HOST && !process.env.DOCKER_HOST.startsWith("unix://"))
    throw Error("Local commands refuse a remote DOCKER_HOST.");
  const contexts = JSON.parse(
    execFileSync("docker", ["context", "inspect"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  const endpoint = process.env.DOCKER_HOST || contexts[0].Endpoints.docker.Host;
  if (!endpoint.startsWith("unix://"))
    throw Error("Local commands require a local Docker Unix socket.");
  return endpoint;
}

export function readLocalConfig(root = process.cwd()) {
  const text = fs.readFileSync(path.join(root, "supabase/config.toml"), "utf8");
  const sections = { "": "" };
  let section = "";
  for (const line of text.split("\n")) {
    const heading = line.match(/^\s*\[([^\]]+)\]\s*(?:#.*)?$/);
    if (heading) section = heading[1];
    else sections[section] = (sections[section] || "") + line + "\n";
  }
  const value = (name, key) => {
    const match = sections[name]?.match(
      new RegExp(`^\\s*${key}\\s*=\\s*(?:"([^"]*)"|(\\d+))\\s*(?:#.*)?$`, "m"),
    );
    if (!match)
      throw Error(
        `Missing ${name ? name + "." : ""}${key} in supabase/config.toml.`,
      );
    return match[1] ?? Number(match[2]);
  };
  const projectId = value("", "project_id");
  if (!/^[a-z0-9][a-z0-9_-]{0,49}$/.test(projectId))
    throw Error("Use a lowercase, distinct local project_id.");
  const site = new URL(value("auth", "site_url"));
  if (
    site.protocol !== "http:" ||
    site.hostname !== "127.0.0.1" ||
    site.username ||
    site.password ||
    site.pathname !== "/" ||
    site.search ||
    site.hash
  )
    throw Error("Local auth.site_url must be http://127.0.0.1:<port>.");
  const ports = {
    web: Number(site.port || 80),
    api: value("api", "port"),
    db: value("db", "port"),
    shadow: value("db", "shadow_port"),
    studio: value("studio", "port"),
    mail: value("local_smtp", "port"),
    smtp: value("local_smtp", "smtp_port"),
  };
  if (
    Object.values(ports).some(
      (p) => !Number.isInteger(p) || p < 1024 || p > 65535,
    ) ||
    new Set(Object.values(ports)).size !== Object.values(ports).length
  )
    throw Error(
      "Local service ports must be distinct integers between 1024 and 65535.",
    );
  return {
    projectId,
    ports,
    siteUrl: site.origin,
    network:
      projectId === "123charts-local" ? "charts-local" : `${projectId}-network`,
  };
}

export function validateLocalEnvironment(config, env) {
  if (
    env.CHARTS_RUNTIME &&
    !["local", "development"].includes(env.CHARTS_RUNTIME)
  )
    throw Error(
      "Local commands refuse a deployed CHARTS_RUNTIME; use a separate checkout/configuration.",
    );
  if (env.CHARTS_LOCAL_PREVIEW && env.CHARTS_LOCAL_PREVIEW !== "true")
    throw Error("Local commands require CHARTS_LOCAL_PREVIEW=true.");
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_INTERNAL_URL",
    "CHARTS_DATABASE_ORIGIN",
    "APP_URL",
    "CHARTS_INTERNAL_WEB_URL",
  ]) {
    if (!env[key]) continue;
    const url = new URL(env[key]);
    const port =
      key === "APP_URL" || key === "CHARTS_INTERNAL_WEB_URL"
        ? config.ports.web
        : config.ports.api;
    if (
      url.protocol !== "http:" ||
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      Number(url.port || 80) !== port ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw Error(
        `${key} does not match this checkout's loopback service. Existing configuration was not changed.`,
      );
  }
}

export function preflightEnvironment(config) {
  const values = {};
  if (fs.existsSync(".env.local"))
    for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (match)
        values[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  validateLocalEnvironment(config, values);
  validateLocalEnvironment(config, process.env);
  return values;
}

export function assertOwner(config, labels, root = process.cwd()) {
  const owner = labels?.["com.supabase.cli.workdir"];
  if (!owner || path.resolve(owner) !== fs.realpathSync(root))
    throw Error(
      `Supabase project '${config.projectId}' belongs to another checkout. No services or data were changed. Give this clone a unique project_id and ports in supabase/config.toml, or use the owning checkout.`,
    );
}

export function inspectStack(config) {
  const inspect = (kind, name, format) => {
    try {
      return (
        JSON.parse(
          execFileSync("docker", [kind, "inspect", "--format", format, name], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }),
        ) || {}
      );
    } catch {
      return null;
    }
  };
  // Studio is recreated on a directory move; older database labels can still name the former path.
  const studio = inspect(
    "container",
    `supabase_studio_${config.projectId}`,
    "{{json .Config.Labels}}",
  );
  const db = inspect(
    "container",
    `supabase_db_${config.projectId}`,
    "{{json .Config.Labels}}",
  );
  if (studio || db) {
    assertOwner(config, studio || db);
    return true;
  }
  if (
    inspect("volume", `supabase_db_${config.projectId}`, "{{json .Labels}}")
  ) {
    const marker = path.join(".local", "instance.json");
    const saved = fs.existsSync(marker)
      ? JSON.parse(fs.readFileSync(marker, "utf8"))
      : null;
    if (
      saved?.projectId !== config.projectId ||
      saved?.root !== fs.realpathSync(process.cwd())
    )
      throw Error(
        `Retained local volume '${config.projectId}' has no ownership record for this checkout. Use its original checkout or a unique project_id; do not reset it.`,
      );
  }
  return false;
}

export function rememberStack(config) {
  fs.mkdirSync(".local", { recursive: true });
  fs.writeFileSync(
    ".local/instance.json",
    JSON.stringify({
      projectId: config.projectId,
      root: fs.realpathSync(process.cwd()),
    }),
    { mode: 0o600 },
  );
}

export async function assertPortAvailable(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () =>
      reject(
        Error(
          `Local port ${port} is already in use. Keep the existing service running; choose another port in supabase/config.toml.`,
        ),
      ),
    );
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}
