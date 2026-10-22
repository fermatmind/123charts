import assert from "node:assert/strict";
import test from "node:test";
import { officialSourceDomains } from "./source-domains.mjs";

const types = new Set(["official_documentation", "official_pricing"]);
const fixture = () => ({
  identity_domain: "oldvendor.com",
  research_status: "primary_source_researched",
  sources: [
    {
      id: "redirect",
      type: "official_documentation",
      verification: "official_documentation_read",
      requested_url: "https://www.oldvendor.com/product",
      url: "https://www.newvendor.com/",
      title: "Vendor product",
      research_notes_en:
        "Original request redirected to the current product page.",
      read_at: "2026-10-22T15:00:00Z",
      excerpt_sha256: "a".repeat(64),
    },
  ],
  official_domain_migrations: [
    {
      from_domain: "oldvendor.com",
      to_domain: "newvendor.com",
      observed_at: "2026-10-22T15:00:00Z",
      evidence_source_refs: ["redirect"],
      explanation_en:
        "Observed official redirect, with product continuity reviewed.",
      explanation_zh: "已读取官网跳转并核对产品延续关系。",
    },
  ],
});

test("existing same-domain records require no migration metadata", () => {
  assert.deepEqual(
    [...officialSourceDomains({ identity_domain: "vendor.com" }, types)],
    ["vendor.com"],
  );
});

test("cross-domain source URLs alone do not authorize a migration", () => {
  const row = fixture();
  delete row.official_domain_migrations;
  const domains = officialSourceDomains(row, types);
  assert.ok(!domains.has("newvendor.com"));
});

test("evidenced migration permits only the exact registered target domain", () => {
  const row = fixture();
  const urls = row.sources.map(({ url }) => url);
  const domains = officialSourceDomains(row, types);
  assert.ok(domains.has("oldvendor.com"));
  assert.ok(domains.has("newvendor.com"));
  assert.ok(!domains.has("unrelated.com"));
  assert.deepEqual(
    row.sources.map(({ url }) => url),
    urls,
  );
});

test("unproven and malformed migrations fail closed", () => {
  const mutations = [
    (r) => {
      r.official_domain_migrations = {};
    },
    (r) => {
      r.research_status = "structured_candidate";
    },
    (r) => {
      r.official_domain_migrations[0].from_domain = "other.com";
    },
    (r) => {
      r.official_domain_migrations[0].to_domain = "sub.newvendor.com";
    },
    (r) => {
      r.official_domain_migrations[0].to_domain = "unrelated.com";
    },
    (r) => {
      r.official_domain_migrations[0].to_domain = "newvendor.com/path";
    },
    (r) => {
      r.official_domain_migrations[0].evidence_source_refs = [];
    },
    (r) => {
      r.official_domain_migrations[0].evidence_source_refs = ["missing"];
    },
    (r) => {
      r.official_domain_migrations[0].evidence_source_refs = [
        "redirect",
        "redirect",
      ];
    },
    (r) => {
      r.official_domain_migrations[0].observed_at = "unknown";
    },
    (r) => {
      r.sources[0].type = "competitor_detail";
    },
    (r) => {
      r.sources[0].verification = "not_checked";
    },
    (r) => {
      delete r.sources[0].requested_url;
    },
    (r) => {
      r.sources[0].requested_url = "https://other.com/";
    },
    (r) => {
      r.sources[0].requested_url = "http://oldvendor.com/";
    },
    (r) => {
      r.sources[0].url = "https://user:password@newvendor.com/";
    },
    (r) => {
      r.sources[0].excerpt_sha256 = "invented";
    },
    (r) => {
      r.official_domain_migrations.push({ ...r.official_domain_migrations[0] });
    },
  ];
  for (const mutate of mutations) {
    const row = fixture();
    mutate(row);
    assert.throws(() => officialSourceDomains(row, types), mutate.toString());
  }
});
