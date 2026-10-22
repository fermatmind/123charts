import assert from "node:assert/strict";
import { getDomain } from "tldts";

// Migration metadata records evidence; it does not grant publication or prove ownership.
function publicHttpsDomain(value) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:");
  assert.ok(!url.username && !url.password);
  const domain = getDomain(url.hostname, { allowPrivateDomains: true });
  assert.ok(domain);
  return domain;
}

export function officialSourceDomains(row, officialTypes) {
  const domains = new Set([row.identity_domain]);
  const migrations = row.official_domain_migrations ?? [];
  assert.ok(Array.isArray(migrations));
  if (migrations.length) {
    assert.equal(row.research_status, "primary_source_researched");
  }
  for (const migration of migrations) {
    assert.equal(migration.from_domain, row.identity_domain);
    const target = publicHttpsDomain(`https://${migration.to_domain}/`);
    assert.equal(migration.to_domain, target);
    assert.ok(!domains.has(target), "Duplicate or same-domain migration");
    assert.ok(Number.isFinite(Date.parse(migration.observed_at)));
    assert.ok(migration.explanation_en?.trim());
    assert.match(migration.explanation_zh ?? "", /[\u4e00-\u9fff]/);
    const refs = migration.evidence_source_refs;
    assert.ok(Array.isArray(refs) && refs.length > 0);
    assert.equal(new Set(refs).size, refs.length);
    const evidence = refs.map((id) => {
      const source = row.sources.find((item) => item.id === id);
      assert.ok(source && officialTypes.has(source.type));
      assert.equal(source.verification, "official_documentation_read");
      assert.ok(source.title && source.research_notes_en);
      assert.ok(Number.isFinite(Date.parse(source.read_at)));
      assert.match(source.excerpt_sha256 ?? "", /^[a-f0-9]{64}$/);
      assert.ok(
        [row.identity_domain, target].includes(publicHttpsDomain(source.url)),
      );
      return source;
    });
    assert.ok(
      evidence.some(
        (source) =>
          source.requested_url &&
          publicHttpsDomain(source.requested_url) === row.identity_domain &&
          publicHttpsDomain(source.url) === target,
      ),
      "Migration needs a read source recording the original request and final URL",
    );
    domains.add(target);
  }
  return domains;
}
