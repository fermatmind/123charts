import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { getDomain } from "tldts";

const domain = (url) => getDomain(url.hostname, { allowPrivateDomains: true });
const nonempty = (value) =>
  typeof value === "string" && value.trim().length > 0;

function publicHttps(value) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:");
  assert.ok(!url.username && !url.password && !url.port);
  assert.ok(domain(url), "Evidence requires a registrable public domain");
  return url;
}

function inScope(value, scope) {
  const url = publicHttps(value);
  const base = publicHttps(scope);
  assert.ok(
    !base.search && !base.hash,
    "Evidence scope cannot contain query/fragment",
  );
  return (
    url.origin === base.origin &&
    (url.pathname === base.pathname ||
      (base.pathname.endsWith("/") &&
        (url.pathname === base.pathname.slice(0, -1) ||
          url.pathname.startsWith(base.pathname))))
  );
}

// Observations record provenance, not an independent ownership certification.
// The origin must belong to the project's identity; source claims cannot anchor
// themselves by linking back to that identity from an unrelated website.
export function validateRelationshipEvidence(document) {
  assert.equal(
    document.schema_version,
    "123charts-official-source-evidence-v1",
  );
  assert.ok(Array.isArray(document.observations));
  const ids = new Set();
  for (const evidence of document.observations) {
    assert.ok(nonempty(evidence.id) && !ids.has(evidence.id));
    ids.add(evidence.id);
    const from = publicHttps(evidence.from_url);
    publicHttps(evidence.to_url);
    assert.equal(
      domain(publicHttps(`https://${evidence.identity_domain}/`)),
      evidence.identity_domain,
    );
    assert.ok(Number.isFinite(Date.parse(evidence.read_at)));
    assert.ok(["html", "extracted_text"].includes(evidence.content_kind));
    assert.match(evidence.content_sha256, /^[a-f0-9]{64}$/);
    assert.ok(nonempty(evidence.research_notes_en));
    assert.ok(nonempty(evidence.excerpt));
    assert.equal(
      createHash("sha256").update(evidence.excerpt).digest("hex"),
      evidence.excerpt_sha256,
      `${evidence.id}: relationship excerpt hash mismatch`,
    );
    const observed = JSON.parse(evidence.excerpt);
    if (evidence.kind === "link") {
      assert.equal(observed.document_url, evidence.from_url);
      assert.equal(
        new URL(observed.href, from).href,
        new URL(evidence.to_url).href,
      );
    } else {
      assert.equal(evidence.kind, "request_resolution");
      assert.equal(observed.requested_url, evidence.from_url);
      assert.equal(observed.final_url, evidence.to_url);
      assert.notEqual(
        new URL(evidence.from_url).origin,
        new URL(evidence.to_url).origin,
      );
    }
    assert.ok(inScope(evidence.to_url, evidence.scope_url));
  }
  // Resolve chains independently of file order. An unanchored cycle (or an
  // unrelated website's assertion) never establishes first-party provenance.
  const pending = new Set(document.observations);
  const resolved = [];
  while (pending.size) {
    const before = pending.size;
    for (const evidence of pending) {
      if (
        domain(publicHttps(evidence.from_url)) === evidence.identity_domain ||
        resolved.some(
          (parent) =>
            parent.identity_domain === evidence.identity_domain &&
            inScope(evidence.from_url, parent.scope_url),
        )
      ) {
        resolved.push(evidence);
        pending.delete(evidence);
      }
    }
    assert.ok(
      pending.size < before,
      `Unanchored official-source evidence: ${[...pending].map((e) => e.id).join(", ")}`,
    );
  }
  return document.observations;
}

export function validateOfficialSourceDomain(
  identity,
  source,
  observations = [],
) {
  const sourceUrl = publicHttps(source.url);
  if (domain(sourceUrl) === identity) return;
  assert.ok(
    observations.some(
      (evidence) =>
        evidence.identity_domain === identity &&
        inScope(source.url, evidence.scope_url),
    ),
    `${source.url}: official cross-domain source needs first-party link or request-resolution evidence for ${identity}`,
  );
}

export function validateResearchPricing(row, documentedSource) {
  const pricing = row.pricing;
  if (pricing.officially_checked === true) {
    assert.equal(pricing.status, "official_documentation_read");
    assert.equal(
      documentedSource(pricing.source_ref)?.type,
      "official_pricing",
    );
    return;
  }
  assert.equal(pricing.officially_checked, false);
  assert.ok(
    ["not_verified", "not_checked", "unknown"].includes(pricing.status),
  );
  assert.equal(pricing.price_type, "unknown");
  assert.ok(
    pricing.normalized_monthly_price == null,
    "Unverified pricing cannot supply an amount",
  );
  assert.ok(
    pricing.currency == null,
    "Unverified pricing cannot supply a currency",
  );
  assert.ok(
    pricing.checked_at == null,
    "Unverified pricing cannot claim a completed check",
  );
  assert.ok(
    !pricing.source_ref,
    "Unverified pricing cannot claim a verified price source",
  );
  assert.ok(
    nonempty(pricing.source_snapshot_en) &&
      nonempty(pricing.source_snapshot_zh),
  );
}
