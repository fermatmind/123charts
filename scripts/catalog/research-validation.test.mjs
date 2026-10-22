import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  validateRelationshipEvidence,
  validateOfficialSourceDomain,
  validateResearchPricing,
} from "./research-validation.mjs";

const hash = (s) => createHash("sha256").update(s).digest("hex");
const envelope = (observations) => ({
  schema_version: "123charts-official-source-evidence-v1",
  observations,
});
function observation(overrides = {}) {
  const from = "https://www.vendor.com/help";
  const to = "https://docs.host.com/vendor/";
  const excerpt = JSON.stringify({ document_url: from, href: to });
  return {
    id: "vendor-help",
    identity_domain: "vendor.com",
    kind: "link",
    from_url: from,
    to_url: to,
    scope_url: to,
    read_at: "2026-10-22T10:00:00Z",
    content_kind: "html",
    content_sha256: hash("read page"),
    excerpt,
    excerpt_sha256: hash(excerpt),
    research_notes_en:
      "First-party navigation links to this product's hosted help path.",
    ...overrides,
  };
}
const source = (url) => ({ url });
const unknown = () => ({
  pricing: {
    status: "not_verified",
    price_type: "unknown",
    officially_checked: false,
    normalized_monthly_price: null,
    currency: null,
    checked_at: null,
    source_snapshot_en: "Price page inaccessible; amount unknown.",
    source_snapshot_zh: "价格页不可访问，金额未知。",
  },
});

test("completed research may retain explicitly unknown pricing without a fake source", () => {
  validateResearchPricing(unknown(), () => undefined);
  const missingOptionals = unknown();
  delete missingOptionals.pricing.normalized_monthly_price;
  delete missingOptionals.pricing.checked_at;
  validateResearchPricing(missingOptionals, () => undefined);
});

test("unknown pricing rejects contradictory confirmed fields", () => {
  for (const update of [
    { normalized_monthly_price: 0 },
    { normalized_monthly_price: 19 },
    { currency: "USD" },
    { checked_at: "2026-10-22T10:00:00Z" },
    { price_type: "subscription" },
    { source_ref: "product" },
    { status: "official_documentation_read" },
    { source_snapshot_zh: "" },
    { officially_checked: undefined },
  ]) {
    const row = unknown();
    Object.assign(row.pricing, update);
    assert.throws(() => validateResearchPricing(row, () => undefined));
  }
});

test("checked pricing still needs official pricing evidence", () => {
  const row = {
    pricing: {
      status: "official_documentation_read",
      officially_checked: true,
      source_ref: "price",
    },
  };
  validateResearchPricing(row, (id) =>
    id === "price" ? { type: "official_pricing" } : undefined,
  );
  assert.throws(() => validateResearchPricing(row, () => undefined));
  assert.throws(() =>
    validateResearchPricing(row, () => ({ type: "official_documentation" })),
  );
});

test("same registrable domain keeps existing official subdomains compatible", () => {
  validateOfficialSourceDomain(
    "vendor.co.uk",
    source("https://help.vendor.co.uk/article"),
  );
  for (const url of [
    "http://help.vendor.co.uk/article",
    "https://user:password@help.vendor.co.uk/article",
    "https://127.0.0.1/article",
  ]) {
    assert.throws(() =>
      validateOfficialSourceDomain("vendor.co.uk", source(url)),
    );
  }
});

test("cross-domain link evidence is product- and path-scoped", () => {
  const evidence = validateRelationshipEvidence(envelope([observation()]));
  validateOfficialSourceDomain(
    "vendor.com",
    source("https://docs.host.com/vendor/article/1"),
    evidence,
  );
  for (const [identity, url] of [
    ["other.com", "https://docs.host.com/vendor/article"],
    ["vendor.com", "https://docs.host.com/vendor-other/article"],
    ["vendor.com", "https://docs.host.com/other/article"],
    ["vendor.com", "https://docs.host.com.evil.com/vendor/article"],
    ["vendor.com", "https://docs.host.com/vendor/../other/article"],
  ])
    assert.throws(() =>
      validateOfficialSourceDomain(identity, source(url), evidence),
    );
  assert.throws(() =>
    validateOfficialSourceDomain(
      "vendor.com",
      source("https://docs.host.com/vendor/article"),
    ),
  );
});

test("actual request resolution supports a migrated product path", () => {
  const excerpt = JSON.stringify({
    requested_url: "https://vendor.com/",
    final_url: "https://parent.com/product",
  });
  const evidence = validateRelationshipEvidence(
    envelope([
      observation({
        kind: "request_resolution",
        from_url: "https://vendor.com/",
        to_url: "https://parent.com/product",
        scope_url: "https://parent.com/product",
        excerpt,
        excerpt_sha256: hash(excerpt),
      }),
    ]),
  );
  validateOfficialSourceDomain(
    "vendor.com",
    source("https://parent.com/product"),
    evidence,
  );
  assert.throws(() =>
    validateOfficialSourceDomain(
      "vendor.com",
      source("https://parent.com/another-product"),
      evidence,
    ),
  );
});

test("relationship claims without consistent provenance are rejected", () => {
  for (const update of [
    { identity_domain: "another.com" },
    { content_sha256: "invented" },
    { content_kind: "search_summary" },
    { read_at: "invalid" },
    { excerpt_sha256: hash("different excerpt") },
    { to_url: "https://different.com/" },
    { scope_url: "https://docs.host.com/elsewhere/" },
    { kind: "brand_name_match" },
    { from_url: "https://user:password@www.vendor.com/help" },
  ])
    assert.throws(() =>
      validateRelationshipEvidence(envelope([observation(update)])),
    );
  assert.throws(() =>
    validateRelationshipEvidence(envelope([observation(), observation()])),
  );
});

test("migration-to-help chains resolve out of order but unanchored cycles cannot self-certify", () => {
  const link = (id, from, to) => {
    const excerpt = JSON.stringify({ document_url: from, href: to });
    return observation({
      id,
      from_url: from,
      to_url: to,
      scope_url: to,
      excerpt,
      excerpt_sha256: hash(excerpt),
    });
  };
  const child = link(
    "hosted-help",
    "https://new-vendor.com/",
    "https://docs.host.com/vendor/",
  );
  const parent = link(
    "migration",
    "https://vendor.com/",
    "https://new-vendor.com/",
  );
  const evidence = validateRelationshipEvidence(envelope([child, parent]));
  validateOfficialSourceDomain(
    "vendor.com",
    source("https://docs.host.com/vendor/guide"),
    evidence,
  );
  assert.throws(() => validateRelationshipEvidence(envelope([child])));
  const cycle = link(
    "cycle",
    "https://docs.host.com/vendor/",
    "https://new-vendor.com/",
  );
  assert.throws(() => validateRelationshipEvidence(envelope([child, cycle])));
});
