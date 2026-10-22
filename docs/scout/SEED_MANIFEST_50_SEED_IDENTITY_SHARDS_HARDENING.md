# SEED_MANIFEST 50-Seed Identity Shards Hardening

Status: validation passed
Task: PR181 / SEED_MANIFEST
Result: GO_PROJECT_CONTRACT_WITH_MANUAL_REVIEW_FINDINGS
Date: 2026-06-21

## Result

PR181 verifies the repaired Seed50 private artifact package and promotes it to a checksum-verified private handoff input for PR182 / PROJECT_CONTRACT.

Result: `GO_PROJECT_CONTRACT_WITH_MANUAL_REVIEW_FINDINGS`.

The package is valid for private contract design input, but it is not audit-ready and not publish-ready because manual review blockers remain.

## Scope

This PR verifies private seed artifact integrity only.

It does not read project websites, run browser automation, run external HTTP audit, write a database, write Supabase, write staging, mutate `88cn-index-data`, create frontend routes, publish project pages, create sitemap entries, expose Public API/MCP fields, start Growth, start a crawler, start a worker runtime, deploy, or mutate server/cloud state.

## Source Input Package

Preferred repaired zip was not present at preflight. The repaired private artifact directory was present and used as the source of truth:

```text
/Users/rainie/Desktop/123charts-private-artifacts/seed-handoff/seed50-enrichment-repaired-20260621-020553/
```

For zip verification, the same repaired directory was copied outside git and zipped at:

```text
/tmp/123charts-seed50-official-source-enrichment-repaired.zip
```

The uploaded non-repaired zip was not used as source of truth.

## Private Artifact Location

Private artifact directory:

```text
/Users/rainie/Desktop/123charts-private-artifacts/seed-handoff/seed50-enrichment-repaired-20260621-020553/
```

The private artifact remains outside git. No seed JSONL, evidence JSONL, canonical JSONL, rejected JSONL, private manifest, `SHA256SUMS`, or zip file is committed.

## Package Structure Verification

Verified required files:

| Area | File | Result |
| --- | --- | --- |
| manifest | `seed-run-manifest.private.json` | PASS |
| checksum | `SHA256SUMS` | PASS |
| accepted shards | `accepted/*.jsonl` | PASS |
| evidence | `evidence/source-evidences.private.jsonl` | PASS |
| canonical | `canonical/entity-scope-candidates.private.jsonl` | PASS |
| review | `review/seed-needs-review.jsonl` | PASS |
| review | `review/source-url-reachability-needs-review.jsonl` | PASS |
| rejected | `rejected/seed-rejected.jsonl` | PASS |
| reports | `reports/seed50-enrichment-report.md` | PASS |
| reports | `reports/seed50-field-coverage-summary.json` | PASS |

JSON files and JSONL files parse successfully.

## Hash Chain Verification

Verified:

- accepted row `row_hash`;
- evidence row `evidence_hash`;
- canonical row `row_hash`;
- shard hashes in manifest;
- evidence file hash;
- canonical file hash;
- rejected file hash;
- review file hashes;
- report file hashes;
- manifest hash;
- `SHA256SUMS`;
- repaired zip opens with `unzip -l`.

Manifest hash:

```text
sha256:08a9fea2875b8c4eef7c96f0c0fc1bfebdecf9d2516fa9d1be949f2ee4f8bd8c
```

## Seed Counts

| Metric | Count |
| --- | ---: |
| Accepted private seed rows | 50 |
| Needs-review rows | 25 |
| Rejected rows | 12 |
| Source evidence rows | 114 |
| Canonical candidate rows | 50 |

Every accepted row keeps:

- `visibility=private_seed_only`;
- `publish_gate=blocked_until_reviewed`;
- `row_hash` present and verified.

No accepted row contains public lifecycle publication, original summary, public projection, sitemap eligibility, or Public API/MCP exposure fields.

## Source Mix

| Source acquisition channel | Count |
| --- | ---: |
| GitHub | 14 |
| Launch | 21 |
| Chinese/outbound | 15 |
| Directory hints | 0 |

Directory hints are discovery context only, never content source.

## GitHub-backed / Open-source Metric Clarification

Correct metric language:

- GitHub-backed candidates: 20 / 50
- Strictly declared open-source candidates: 5 / 50
- Mixed candidates: 15 / 50
- Commercial candidates: 30 / 50

Do not claim 40 percent open source. GitHub-backed visibility and strict open-source declaration are separate metrics.

## Needs-review Findings

Manual review findings are non-blocking for PR181, but must carry forward:

| Finding | Count | Carry forward |
| --- | ---: | --- |
| Needs-review rows | 25 | PR182 / PROJECT_CONTRACT |
| Canonical review rows | 10 | PR182, PR183, PR184 |
| Missing-docs review rows | 6 | PR182, PR183, PR184 |
| Reachability review rows | 11 | PR182, PR183, PR184 |

Needs-review rows remain private and blocked from audit/publication until manual review.

## Rejected Pool Status

Rejected rows: 12.

Rejected source status:

```text
recovered_from_tmp_seed50_rejected_or_weak_hints
```

Rejected rows are retained as private negative-sample audit evidence and were not promoted to accepted.

## No-public / No-index / No-data-repo Guarantee

PR181 does not:

- publish projects;
- create project detail pages;
- create public JSON;
- add sitemap entries;
- expose Public API/MCP fields;
- write `88cn-index-data`;
- write Supabase, staging, or production;
- run external HTTP audit;
- run crawler or worker runtime;
- create deploy/server/cloud mutations;
- start Growth, BETA, I18N, OPS10A, or PR101.

## PR182 Handoff

Register but do not start:

PR182 / PROJECT_CONTRACT - Public Project Entity Contract + Fail-Closed Publish Gate v0

Purpose:

Define the long-term project entity, source evidence, canonical asset, audit observation, review state, and published projection contract.

PR182 must inherit PR181 blockers and keep fail-closed behavior for review, publication, indexing, API/MCP, and report projection.

## Sidecar Findings

No sidecar-blocking issue was found.

Non-blocking manual review findings remain:

- needs-review rows;
- canonical review rows;
- missing-docs review rows;
- reachability review rows.

These are intentionally not resolved in PR181.

## Validation Results

Artifact validation:

- required files present: PASS
- JSON parse: PASS
- JSONL parse: PASS
- accepted-row required fields: PASS
- `visibility=private_seed_only`: PASS
- `publish_gate=blocked_until_reviewed`: PASS
- no public/published/sitemap/API/MCP projection fields: PASS
- row/evidence/canonical hashes: PASS
- shard hashes: PASS
- manifest hash: PASS
- `SHA256SUMS`: PASS
- repaired zip opens: PASS

Repository validation:

- `npm run verify:day0`: PASS
- `npm run policy:scan`: PASS
- `npm run third-party:check`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS
- `node scripts/check-landscape-boundary.mjs`: PASS
- `npm run landscape:check`: PASS
- `node scripts/check-sector-density-boundary.mjs`: PASS
- `node scripts/check-task-discovery-boundary.mjs || true`: PASS
- `node scripts/check-alternatives-canonical.mjs || true`: PASS

## What This PR Does Not Do

- Does not commit private seed package files.
- Does not commit raw 50 project rows.
- Does not commit source evidence rows.
- Does not commit canonical candidate rows.
- Does not commit private manifest or checksum files.
- Does not browse or use computer use.
- Does not run external HTTP audit.
- Does not write any database.
- Does not mutate `88cn-index-data`.
- Does not create public pages, sitemap entries, Public API, or MCP exposure.
- Does not start PR182.
