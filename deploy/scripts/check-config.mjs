import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
for (const environment of ["production", "staging"]) {
  const prefix = ["compose", "--env-file", `deploy/self-hosted/.env.${environment}.example`, "-f", "deploy/self-hosted/compose.yml"];
  const model = JSON.parse(execFileSync("docker", [...prefix, "config", "--format", "json"], { encoding: "utf8" }));
  assert.equal(model.name, `123charts-${environment}`);
  for (const [name, service] of Object.entries(model.services)) {
    assert.ok(service.image && !service.image.includes(":latest"));
    assert.ok(service.mem_limit && service.cpus && service.logging);
    assert.ok(!service.container_name && !service.privileged && !service.network_mode);
    if (name !== "api-gw") assert.ok(!service.ports?.length, "Only gateway binds a host port");
  }
  assert.equal(model.services["api-gw"].ports[0].host_ip, "127.0.0.1");
  assert.equal(model.services["api-gw"].environment.KONG_ADMIN_LISTEN, "off");
  execFileSync("docker", [...prefix, "-f", "deploy/self-hosted/app.compose.yml", "--profile", "web", "--profile", "worker", "config", "--quiet"], { env: { ...process.env, CHARTS_APP_IMAGE: "123charts:config-check", CHARTS_RUNTIME_ENV_FILE: fs.realpathSync("deploy/.env.runtime.example") } });
}
const dockerfile = fs.readFileSync("deploy/Dockerfile", "utf8");
assert.match(dockerfile, /FROM node:24-bookworm-slim@sha256:[a-f0-9]{64}/);
assert.match(dockerfile, /USER node/);
assert.match(fs.readFileSync("deploy/scripts/package-release.mjs", "utf8"), /worker\.mjs/);
for (const file of ["deploy/scripts/build-production.sh", "scripts/agent/deploy-production.sh"])
  execFileSync("bash", ["-n", file]);
console.log("PASS: isolated production/staging Compose, bounded resources/logs, gateway exposure, pinned Node, Web + worker packaging and shell syntax.");
