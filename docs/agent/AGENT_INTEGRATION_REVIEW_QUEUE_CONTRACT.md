# AGENT-INTEGRATION0A Review Queue Import Contract

Result: `AGENT_INTEGRATION0A_REVIEW_QUEUE_IMPORT_CONTRACT_READY`

This contract defines how sanitized outputs from `88cn-scout-worker` may be
accepted as candidates for the 123Charts admin review queue.

Strategic principle:

```text
Automatic recommendation, human final gate.
```

This task defines a contract, schemas, fixtures, and a local validator only. It
does not import data, publish data, start a worker, run a crawler, write
Supabase, mutate `published_projection`, update sitemap output, deploy, or
touch cloud/server resources.

## Source Context

Worker repository: `88cn-scout-worker`

Worker final SHA:

```text
31153adb2a125b16c33858f507ce762247a2a3ff
```

Worker completion summary:

- AGENT1 CLI contract ready.
- AGENT2 discovery hint ready.
- AGENT3 official source resolver ready.
- AGENT4 canonical entity ready.
- AGENT5 HTTP audit ready fixture-default.
- AGENT6 quarantine classifier ready.
- AGENT7 review queue packager ready.
- AGENT8 publish recommendation ready, no-autopublish.
- AGENTQ no-auto-publish QA passed.

The worker output is not a publication channel. It is an admin-review input
candidate only.

## Artifact Set

An import candidate directory may contain only these files:

```text
manifest.json
review-ready.jsonl
review-blocked.jsonl
quarantine.jsonl
publish-recommendations.jsonl
events.jsonl
report.md
```

Required for validation:

- `manifest.json`
- `review-ready.jsonl`
- `review-blocked.jsonl`
- `quarantine.jsonl`
- `publish-recommendations.jsonl`

Optional for validation but documented:

- `events.jsonl`
- `report.md`

No other file is part of the import contract. Any extra file must be ignored or
rejected by a later import implementation.

## Manifest Contract

`manifest.json` must satisfy
`contracts/agent/review-queue-import-manifest.schema.json`.

Required properties:

- `schema_version`
- `run_id`
- `generated_at`
- `worker_repo`
- `worker_repo_sha`
- `worker_task_range`
- `source_manifest_hash`
- `artifact_hashes`
- `counts`
- `mode`
- `network_used`
- `runtime_started`
- `db_write_performed`
- `auto_publish_performed`

Required safety values:

- `mode` is `dry_run` or `review_packaging`.
- `network_used` is `false` by default.
- `runtime_started` is `false`.
- `db_write_performed` is `false`.
- `auto_publish_performed` is `false`.

Required counts:

- `review_ready_count`
- `review_blocked_count`
- `quarantine_count`
- `publish_recommendation_count`

The manifest may describe hashes and counts, but it must not describe a target
for public frontend, sitemap, Public API, MCP, Supabase, staging, production,
or `published_projection` writes.

## Review-Ready Records

`review-ready.jsonl` records must satisfy
`contracts/agent/review-ready-record.schema.json`.

Required fields:

- `project_name`
- `slug_candidate`
- `official_website_url`
- `source_status`
- `canonical_status`
- `audit_status`
- `recommendation`
- `review_blockers`
- `source_links`
- `public_field_candidates`
- `worker_trace`

Optional public candidate fields:

- `github_url`
- `docs_url`
- `primary_category`
- `collection_tag_candidates`
- `public_signal_chip_candidates`
- `original_summary_candidate`
- `last_observed_at`

`original_summary_candidate` is not public copy. It is an admin-review
candidate and requires human review before any projection is created.

`public_field_candidates` may only contain candidate versions of:

- `slug`
- `project_name`
- `original_summary`
- `official_website_url`
- `github_url`
- `docs_url`
- `primary_category`
- `collection_tags`
- `public_signal_chips`
- `last_reviewed_at`

The record must not contain `lifecycle_status: "published"` or any write intent
to public surfaces.

## Review-Blocked Records

`review-blocked.jsonl` records must satisfy
`contracts/agent/review-blocked-record.schema.json`.

Required blocker reason codes:

- `missing_official_source`
- `directory_hint_only`
- `canonical_ambiguous`
- `duplicate_conflict`
- `http_unreachable`
- `waf_or_blocked`
- `docs_missing`
- `github_mismatch`
- `copied_content_risk`
- `pii_or_private_data_risk`
- `manual_review_required`

Review-blocked means a record cannot enter review-ready without human unblock.
It is not a rejection and never means publication.

## Quarantine Events

`quarantine.jsonl` records must satisfy
`contracts/agent/quarantine-event.schema.json`.

Quarantine details are admin-only. Quarantine records never enter:

- frontend
- sitemap
- `published_projection`
- Public API
- MCP

## Publish Recommendations

`publish-recommendations.jsonl` records must satisfy
`contracts/agent/publish-recommendation.schema.json`.

Allowed recommendation values:

- `recommend_publish`
- `recommend_review`
- `recommend_quarantine`
- `recommend_reject`
- `recommend_recheck`

Hard rule:

```text
recommend_publish is not published.
publish_recommended is not published.
Only 123Charts admin can create published_projection.
```

Each recommendation requires:

- `reason_codes`
- `missing_fields`
- `risk_flags`
- `human_review_required`
- `recommendation_confidence_band`

Absolute confidence scores must not become public fields.

## Validation Command

Run:

```bash
node scripts/agent/validate-review-queue-import.mjs --dir fixtures/agent-integration
```

The validator reads the manifest and JSONL files, checks required fields,
checks counts, rejects forbidden public fields, rejects published lifecycle
emission, rejects public-surface targets, and verifies no DB write or
auto-publish occurred.

## Non-Goals

- No worker runtime.
- No crawler.
- No live HTTP audit.
- No Redis or queue runtime.
- No Supabase/staging/production write.
- No `published_projection` write or regeneration.
- No sitemap mutation.
- No frontend route mutation.
- No production deploy.
- No SSH or cloud console action.
- No `88cn-index-data` mutation.
- No browser fallback, login scraping, or secret reading.
