# External Import Consumer Quarantine Summary v0

## Result

PR31 adds an explicit quarantine summary layer for external project imports from the open data repository into 123Charts admin staging.

This is a consumer-side safety layer. It does not publish imported records, does not change sitemap behavior, does not expose import rows through public APIs, and does not perform runtime website availability checks.

## Why This Exists

OPS-0 found a P1 gap: invalid external import records could fail validation without a clear admin-facing quarantine summary. That made it harder to prove that structural import issues were separated from normal staging.

PR31 fixes that by classifying every import item into one of four outcomes:

- `accepted`: structurally valid and eligible for admin staging as `pending_review`
- `quarantined`: parseable, but needs human handling before it can enter normal review
- `duplicate`: already represented by slug or fingerprint and not inserted again
- `rejected`: badly malformed and not safe to stage

Accepted does not mean published. Publishing remains a separate admin action.

## Structural Issues Covered

The quarantine layer records reason counts for:

- `invalid_url`
- `invalid_category`
- `duplicate_slug`
- `duplicate_fingerprint`
- `forbidden_field`
- `privacy_risk`
- `malformed_payload`
- `source_not_allowed`

These are structural/import issues only. Runtime website failures such as DNS failure, 404, 502, timeout, or redirect loops belong to a later audit dataset task, not to external import sync.

## Summary Shape

Admin sync returns:

```json
{
  "total": 0,
  "accepted": 0,
  "quarantined": 0,
  "rejected": 0,
  "duplicates": 0,
  "reasons": {
    "invalid_url": 0,
    "invalid_category": 0,
    "duplicate_slug": 0,
    "duplicate_fingerprint": 0,
    "forbidden_field": 0,
    "privacy_risk": 0,
    "malformed_payload": 0,
    "source_not_allowed": 0
  }
}
```

The admin imports API also returns `quarantine_summary` beside the recent import rows.

## Storage Boundary

PR31 reuses the existing `external_project_imports.status` field and adds:

- `quarantine_reason_code`
- `quarantine_details`
- `last_imported_at`

Quarantined records remain in `external_project_imports`. They do not write to `projects`, do not enter sitemap, do not enter public project API responses, and do not enter future MCP payloads.

Rejected records can be counted without being inserted.

Duplicate records are counted and skipped to avoid duplicate staging rows.

## Admin UI Boundary

`/admin/external-imports` now shows:

- total imports
- pending review / accepted count
- quarantined count
- duplicate count
- rejected count
- reason code counts

The UI shows only reason code and count. It does not render raw payload values.

## Privacy And Redaction

Classification and quarantine details are intentionally sanitized:

- no raw payload dump
- no private contact-like value exposure
- no credential URL exposure
- no environment values
- no server identifiers

`quarantine_details` stores a short issue label and safe field names only when needed.

## Public Boundary

PR31 does not modify public page routing, sitemap generation, read-only project API behavior, submit/claim behavior, featured placement, payment boundaries, or MCP behavior.

The import sync remains an admin-only staging operation. It does not auto-publish and does not change claim state.

## Validation Commands

Required validation:

```bash
npm run verify:day0
npm run policy:scan
npm run third-party:check
npm run db:schema:check
npm run public-surface:check
npm run intake:check
npm run external-import:check
npm run external-import:quarantine:check
npm run geo-checker:check
npm run agent:redact:check
npm run agent:tool:check
npm run agent:mcp-config:check
npm run agent:plugin-policy:check
npm run agent:scope:check -- PR31
npm run lint
npm run typecheck
npm run build
npm run agent:gate
```

Note: `agent:gate` does not currently include `external-import:quarantine:check`; PR31 runs it explicitly.

## Follow-Up PR32 QA Expectations

PR32 should be a Codex-QA task:

- run Seed 100 import dry-run checks
- verify admin staging remains private
- verify quarantine summary is visible only in admin paths
- verify seed slugs do not enter sitemap or public project API
- verify rejected and duplicate records are counted without public exposure
