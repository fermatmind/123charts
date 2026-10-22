import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import {
  readLocalConfig,
  validateLocalEnvironment,
  assertOwner,
  assertPortAvailable,
} from "../../scripts/local/config.mjs";
import { waitForLocalServices } from "../../scripts/local/ready.mjs";

test("startup waits for both Auth and data, and never reports ready after upstream failure", async () => {
  let round = 0;
  await waitForLocalServices("http://127.0.0.1:55321", "local-test-key", {
    attempts: 3,
    pause: async () => {
      round++;
    },
    fetch: async (url: string) =>
      new Response(null, {
        status: round === 0 && url.includes("/rest/") ? 503 : 200,
      }),
  });
  assert.equal(round, 1);
  await assert.rejects(
    waitForLocalServices("http://127.0.0.1:55321", "local-test-key", {
      attempts: 1,
      pause: async () => {},
      fetch: async () => new Response(null, { status: 503 }),
    }),
    /not ready/,
  );
  await assert.rejects(
    waitForLocalServices("https://example.com", "local-test-key"),
    /remote/,
  );
});

test("local clone config supports separate instances and rejects conflicting ports or a remote site", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-config-"));
  try {
    fs.mkdirSync(path.join(root, "supabase"));
    const original = fs.readFileSync("supabase/config.toml", "utf8");
    const file = path.join(root, "supabase/config.toml");
    fs.writeFileSync(
      file,
      original.replace(
        /^project_id = .*$/m,
        'project_id = "123charts-config-test"',
      ),
    );
    const config = readLocalConfig(root);
    assert.equal(config.projectId, "123charts-config-test");
    assert.equal(config.network, "123charts-config-test-network");
    assert.ok(config.ports.smtp !== config.ports.api);
    fs.writeFileSync(
      file,
      original.replace(/(\[api\][\s\S]*?\nport = )\d+/, `$1${config.ports.db}`),
    );
    assert.throws(() => readLocalConfig(root), /distinct/);
    fs.writeFileSync(
      file,
      original.replace(/^site_url = .*$/m, 'site_url = "https://example.com"'),
    );
    assert.throws(() => readLocalConfig(root), /127\.0\.0\.1/);
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});

test("local setup rejects remote/stale configuration before overwriting it", () => {
  const config = readLocalConfig();
  validateLocalEnvironment(config, {
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${config.ports.api}`,
    APP_URL: config.siteUrl,
    CHARTS_LOCAL_PREVIEW: "true",
  });
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_INTERNAL_URL",
    "APP_URL",
    "CHARTS_DATABASE_ORIGIN",
  ])
    assert.throws(
      () => validateLocalEnvironment(config, { [key]: "https://example.com" }),
      /not match/,
    );
  assert.throws(
    () => validateLocalEnvironment(config, { CHARTS_RUNTIME: "production" }),
    /deployed/,
  );
  assert.throws(
    () => validateLocalEnvironment(config, { CHARTS_LOCAL_PREVIEW: "false" }),
    /true/,
  );
});

test("a clone cannot attach to another checkout's Supabase containers", () => {
  const config = readLocalConfig();
  assertOwner(config, {
    "com.supabase.cli.workdir": fs.realpathSync(process.cwd()),
  });
  assert.throws(
    () =>
      assertOwner(config, {
        "com.supabase.cli.workdir": path.join(os.tmpdir(), "another-clone"),
      }),
    /another checkout/,
  );
  assert.throws(() => assertOwner(config, {}), /another checkout/);
});

test("an occupied preview port is reported without terminating its listener", async () => {
  const server = net.createServer();
  try {
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address() as net.AddressInfo;
    await assert.rejects(assertPortAvailable(address.port), /already in use/);
    assert.equal(server.listening, true);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
