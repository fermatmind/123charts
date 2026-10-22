import test from "node:test";
import assert from "node:assert/strict";
import {
  databaseEndpoint,
  workerConfiguration,
  publicIndexing,
} from "../../lib/charts/runtime-config";
test("only explicitly configured production may index; staging and local never index", () => {
  assert.equal(
    publicIndexing({
      CHARTS_LOCAL_PREVIEW: "false",
      CHARTS_RUNTIME: "staging",
    }),
    false,
  );
  assert.equal(
    publicIndexing({
      CHARTS_LOCAL_PREVIEW: "true",
      CHARTS_RUNTIME: "production",
    }),
    false,
  );
  assert.equal(
    publicIndexing({
      CHARTS_LOCAL_PREVIEW: "false",
      CHARTS_RUNTIME: "production",
    }),
    true,
  );
});
test("local mode refuses remote databases even with a supplied origin", () => {
  assert.throws(
    () =>
      databaseEndpoint({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.com",
        SUPABASE_SERVICE_ROLE_KEY: "test",
      }),
    /non-local/,
  );
});
test("production access is explicit, exact-origin and independent of local defaults", () => {
  const e = {
    CHARTS_LOCAL_PREVIEW: "false",
    CHARTS_RUNTIME: "production",
    SUPABASE_INTERNAL_URL: "http://api-gw:8000",
    SUPABASE_SERVICE_ROLE_KEY: "test",
    CHARTS_DATABASE_ORIGIN: "http://api-gw:8000",
  };
  assert.equal(databaseEndpoint(e), "http://api-gw:8000");
  assert.throws(
    () =>
      databaseEndpoint({ ...e, CHARTS_DATABASE_ORIGIN: "http://other:8000" }),
    /explicit/,
  );
  assert.throws(() => workerConfiguration(e), /requires/);
  const c = workerConfiguration({
    ...e,
    APP_URL: "https://123charts.com",
    CHARTS_INTERNAL_WEB_URL: "http://10.0.0.2:3110",
    CHARTS_SMTP_HOST: "mail.example",
    CHARTS_MAIL_FROM: "updates@123charts.com",
    CHARTS_WORKER_HEALTH_FILE: "/tmp/worker-health",
  });
  assert.equal(c.mail.requireTLS, true);
  assert.equal(c.publicUrl, "https://123charts.com");
  assert.equal(c.webUrl, "http://10.0.0.2:3110");
});
