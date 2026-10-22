# PR82 Published Signal Snapshot Schema v0

## Result

Validation target: PR82 defines the published-only Alpha Feed snapshot schema only.

This task does not implement an exporter, public endpoint, customer-facing file delivery, data repository write, API key runtime, metering runtime, payment flow, or external service call.

## Schema Contract

Machine-readable contract:

- `ops/contracts/published-signal-snapshot-schema.json`

The contract defines:

- NDJSON record rules;
- CSV header and serialization rules;
- published-only source rule;
- explicit output field allowlist;
- denied private, admin, payment, API key, metering, raw row, Source Confidence internal, and Signal Score internal fields.

## Source Rule

Snapshot records must come from reviewed local public records only.

Required lifecycle state:

- `published`

Denied lifecycle states:

- `submitted`
- `pending_review`
- `approved`
- `archived`
- `quarantined`
- `rejected`
- `scouted_unreviewed`
- `admin_review`

The schema denies raw database row serialization, request-time external crawling, and inferred private facts.

## Formats

| Format | Rule |
| --- | --- |
| NDJSON | UTF-8, one JSON object per line, no header row |
| CSV | UTF-8, header row required, comma delimiter, quoted values, deterministic array serialization |

CSV arrays must use pipe-delimited strings after value-level escaping. PR82 only defines this convention; it does not implement export runtime.

## Field Allowlist

| Field | Required | Notes |
| --- | --- | --- |
| `snapshot_version` | Yes | Schema version marker |
| `project_slug` | Yes | Public project slug |
| `project_name` | Yes | Reviewed public project name |
| `canonical_url` | Yes | Reviewed public canonical URL |
| `category` | Yes | Reviewed public category |
| `technology_tags` | No | Reviewed public tags |
| `published_status` | Yes | Must equal `published` |
| `public_source_links` | No | Reviewed public official links |
| `machine_readability_summary` | No | Public metadata coverage summary |
| `last_reviewed_at` | No | Public review timestamp |
| `public_profile_url` | Yes | Public 123Charts profile URL |
| `public_changelog_summary` | No | Public changelog summary only if already public |

## Denied Fields

The snapshot schema denies:

- private founder, submitter, claim, or contact fields;
- admin notes, review notes, review comments, reviewer identifiers, and review decisions;
- payment, commercial order, API key, customer key, and metering fields;
- raw payloads and raw Supabase rows;
- internal Source Confidence inputs;
- internal Signal Score inputs and hidden score weights;
- private telemetry and claim secrets;
- quarantine details and external import status internals.

## Validation Rules

Future checker or exporter work must enforce:

- every record has `published_status` equal to `published`;
- every output field is declared in the schema contract;
- denied fields do not appear in NDJSON records or CSV headers;
- raw source rows are never serialized directly;
- unknown facts remain absent or null;
- CSV array serialization is deterministic;
- PR82 does not write to the data repository;
- PR82 does not add export runtime.

## Definition Of Done

| Requirement | Status | Evidence |
| --- | --- | --- |
| Snapshot schema exists | PASS | `ops/contracts/published-signal-snapshot-schema.json` |
| Published-only source rule | PASS | Contract `source_rule` and this document |
| No private founder data | PASS | Denied fields section |
| No raw database rows | PASS | Source rule and denied fields |
| No internal Signal Score/Source Confidence internals | PASS | Denied fields section |
| No export runtime | PASS | Release posture and non-goals |

## Validation Plan

Required PR82 validations:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:scope:check -- PR82`

Additional train-runner validations:

- `npm run agent:redact:check`
- `npm run agent:tool:check`
- `npm run agent:mcp-config:check`
- `npm run agent:plugin-policy:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`

## Next Task

PR83 may proceed after PR82 is merged, local `main` is synced to `origin/main`, the worktree is clean, and post-merge validation passes.
