import assert from "node:assert/strict";
import { getDomain } from "tldts";

const primaryTypes = [
  "official_documentation",
  "official_pricing",
  "official_license",
  "official_integration",
];

export function sourceHasType(source, type) {
  return (
    primaryTypes.includes(source?.type) &&
    primaryTypes.includes(type) &&
    (source.type === type || source.additional_types?.includes(type))
  );
}

// Documentation research and price verification are independent states.
export function validateResearchedPricing(row) {
  const pricing = row.pricing;
  assert.equal(typeof pricing.officially_checked, "boolean");
  if (pricing.officially_checked) {
    assert.ok(
      typeof pricing.status === "string" &&
        pricing.status.length > 0 &&
        !["not_verified", "unknown", "directory_reported"].includes(
          pricing.status,
        ),
    );
    assert.ok(
      sourceHasType(
        row.sources.find((s) => s.id === pricing.source_ref),
        "official_pricing",
      ),
      `${row.name}: verified pricing requires an official pricing source`,
    );
  } else {
    assert.equal(pricing.status, "not_verified");
    assert.equal(pricing.price_type, "unknown");
    assert.equal(pricing.normalized_monthly_price, null);
    assert.equal(pricing.currency, null);
  }
}

// A cross-domain exception is bound to one project and an exact source snapshot.
// This validates recorded provenance, not corporate ownership or factual accuracy.
export function validateOfficialSourceDomain(
  row,
  projectPath,
  source,
  registry,
) {
  const sourceDomain = getDomain(new URL(source.url).hostname, {
    allowPrivateDomains: true,
  });
  if (sourceDomain === row.identity_domain) return;
  assert.equal(registry.schema_version, "123charts-source-authorities-v1");
  const recorded = registry.projects[projectPath];
  const authorities = Array.isArray(recorded) ? recorded : [recorded];
  const authority = authorities.find((a) => a?.source_domain === sourceDomain);
  assert.ok(authority, `${row.name}: unrecorded official source ${source.url}`);
  assert.equal(authority.identity_domain, row.identity_domain);
  assert.equal(authority.source_domain, sourceDomain);
  assert.ok(Number.isFinite(Date.parse(authority.checked_at)));
  assert.ok(authority.scope_en && authority.scope_zh);
  const ids = authority.sources.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(
    authority.sources.some(
      (s) =>
        s.id === source.id &&
        s.url === source.url &&
        s.excerpt_sha256 === source.excerpt_sha256,
    ),
    `${row.name}: source URL or snapshot is outside the recorded authority`,
  );
  const basis = authority.basis;
  assert.ok(
    [
      "https_redirect",
      "named_product_on_vendor_domain",
      "legacy_sdk_migration",
      "documented_primary_source_relationship",
      "official_repository",
      "technical_standard",
    ].includes(basis.kind),
  );
  const proof = row.sources.find((s) => s.id === basis.source_ref);
  assert.ok(
    [
      "official_documentation",
      "official_pricing",
      "official_license",
      "official_integration",
    ].includes(proof?.type),
  );
  assert.equal(proof.url, basis.url);
  assert.equal(proof.excerpt_sha256, basis.excerpt_sha256);
  assert.ok(basis.summary_en && basis.summary_zh);
  if (basis.kind === "technical_standard") {
    assert.equal(source.type, "official_documentation");
    assert.notEqual(row.pricing.source_ref, source.id);
    assert.ok(
      !row.core_features.some((feature) => feature.source_ref === source.id),
    );
  }
  assert.equal(
    getDomain(new URL(proof.url).hostname, { allowPrivateDomains: true }),
    sourceDomain,
  );
  if (basis.kind === "https_redirect") {
    const from = new URL(basis.requested_url);
    assert.equal(from.protocol, "https:");
    assert.equal(
      getDomain(from.hostname, { allowPrivateDomains: true }),
      row.identity_domain,
    );
    assert.equal(basis.final_url, proof.url);
  }
}
