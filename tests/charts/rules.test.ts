import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWebsite,
  validatePeers,
  parseTraffic,
  evidenceFieldsComplete,
  comparableChange,
  SCOPE,
  validateSubmission,
} from "../../lib/charts/rules";
import { publicAddress, extractMetadata } from "../../lib/charts/safe-fetch";
import type { TrafficFields } from "../../lib/charts/types";
const traffic: TrafficFields = {
  domain: "example.com",
  source: "AITDK",
  month: "2026-09",
  metric: "visits",
  scope: SCOPE,
  value: 120000,
};
test("canonical website strips tracking, www, credentials and duplicated paths", () => {
  assert.equal(
    normalizeWebsite("https://www.Example.com/en?utm_source=x#pricing").domain,
    "example.com",
  );
  assert.equal(
    normalizeWebsite("example.com").website_url,
    "https://example.com",
  );
  for (const url of [
    "http://localhost",
    "http://127.0.0.1",
    "https://user:pass@example.com",
    "https://example.com:8443",
    "https://github.com/org/repo",
  ])
    assert.throws(() => normalizeWebsite(url));
});
test("peer aliases share an identity; own site and incomplete group are rejected", () => {
  const make = (domain: string) => ({
    domain,
    name: domain,
    task: "document search",
    rationale: "comparable retrieval task",
  });
  assert.throws(
    () =>
      validatePeers(
        [make("www.example.com"), make("docs.example.com")],
        "own.example",
        false,
      ),
    /Duplicate/,
  );
  assert.throws(
    () => validatePeers([make("own.example")], "own.example", false, true),
    /own website/,
  );
  assert.throws(
    () => validatePeers([make("peer.example")], "own.example", true, true),
    /ten/,
  );
});
test("OCR extracts units, released month and scope, without inventing missing numbers", () => {
  const f = parseTraffic(
    "competitor.com\nAITDK\n2026-09\nTotal Visits: 1.25M\nWorldwide All Devices",
  );
  assert.equal(f.value, 1250000);
  assert.equal(f.month, "2026-09");
  assert.equal(f.scope, SCOPE);
  assert.equal(evidenceFieldsComplete(f, "competitor.com"), true);
  assert.equal(parseTraffic("competitor.com\nAITDK\nNo data").value, null);
  assert.equal(
    parseTraffic("competitor.com\nTotal Visits: 5K\nSep 2026").month,
    "2026-09",
  );
  assert.equal(
    evidenceFieldsComplete(
      parseTraffic("competitor.com 2026-09 visits: 5K"),
      "competitor.com",
    ),
    false,
  );
});
test("growth requires consecutive periods, matching scope and a positive base", () => {
  assert.equal(
    comparableChange(traffic, { ...traffic, month: "2026-08", value: 100000 }),
    20,
  );
  assert.equal(
    comparableChange(traffic, { ...traffic, month: "2026-08", value: 0 }),
    null,
  );
  assert.equal(
    comparableChange(traffic, { ...traffic, month: "2026-07" }),
    null,
  );
  assert.equal(
    comparableChange(traffic, {
      ...traffic,
      month: "2026-08",
      metric: "gsc_clicks",
    }),
    null,
  );
  assert.equal(comparableChange(traffic, undefined), null);
});
test("network safety rejects reserved IPv4 and local/mapped IPv6", () => {
  for (const address of [
    "127.0.0.1",
    "10.2.3.4",
    "169.254.169.254",
    "192.168.1.1",
    "100.64.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fd00::1",
    "fec0::1",
    "64:ff9b::7f00:1",
    "2001:db8::1",
  ])
    assert.equal(publicAddress(address), false, address);
  assert.equal(publicAddress("8.8.8.8"), true);
});
test("metadata treats HTML as text and supports reversed attribute order", () => {
  const x = extractMetadata(
    '<title>Example &amp; Co | Build</title><meta content="Useful &amp; readable" name="description">',
  );
  assert.equal(x.name, "Example & Co");
  assert.equal(x.description, "Useful & readable");
});
