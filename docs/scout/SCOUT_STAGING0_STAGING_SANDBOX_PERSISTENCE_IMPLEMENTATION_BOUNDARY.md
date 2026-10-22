# SCOUT_STAGING0 Staging Sandbox Persistence Implementation Boundary

Status: validation passed
Task: PR169 / SCOUT_STAGING0
Result: GO_SCOUT_STAGING1
Date: 2026-06-20

## Result

PR169 defines the staging sandbox persistence boundary for future 123Charts scout data.

Result: `GO_SCOUT_STAGING1`.

Meaning:

- PR170 may decide a storage or migration path, but PR169 does not create one;
- staging sandbox means private, internal, review-gated, non-public persistence for scout identity and provenance records;
- staging sandbox records must not enter public frontend, sitemap, Public API, MCP, `/landscape`, `/tasks`, alternatives, public reports, report registry, public JSON, distribution packs, or the data repo;
- no schema, migration, Supabase write, staging write, production write, runtime code, worker, crawler, queue, external HTTP, audit trigger, deploy, or server/cloud mutation is authorized in PR169.

## Checkpoint

PR169 has `human_checkpoint=true`.

The user explicitly said `继续执行`, so PR169 proceeds only as a boundary-only documentation task. The checkpoint does not authorize schema creation, migration files, staging writes, production writes, or runtime code.

## Scope

In scope:

- define what staging sandbox means;
- define fields that may be staged in a later checkpointed task;
- define fields that remain local-only;
- define fields that must never be staged;
- define what must be DB-backed later if staging is approved;
- define no-public-surface rules;
- define no-production-write rules;
- define no-data-repo-write rules;
- define migration and write checkpoint requirements;
- define rollback, delete, TTL, and correction expectations.

Out of scope:

- database schema or migration files;
- Supabase, staging, or production writes;
- runtime storage code;
- worker, crawler, audit, or queue execution;
- data repo mutation;
- public route, sitemap, Public API, MCP, report page, report registry, public JSON, or distribution surface;
- deploy, SSH, server/cloud mutation, Redis, DNS, Nginx, PM2, or security group changes;
- Growth, BETA, I18N, OPS10A, or PR101 start.

## Definition: Staging Sandbox

The staging sandbox is an internal persistence layer that may later hold reviewed local scout artifacts before any public publication decision.

It is:

- private by default;
- admin/reviewer only;
- excluded from public routes;
- excluded from sitemap;
- excluded from Public API and MCP;
- excluded from public reports and distribution packs;
- excluded from the companion data repo;
- subject to TTL, rollback, delete, and correction workflows;
- separate from production public lifecycle states.

It is not:

- a public project table;
- a published project registry;
- a sitemap source;
- a public report dataset;
- a Public API or MCP source;
- a Growth, ranking, or recommendation dataset;
- a substitute for human review.

## Allowed Future Staging Fields

If a later explicit task approves staging persistence, only public-safe internal fields may be staged.

Identity and provenance:

```text
staging_record_id
source_observation_id
source_url
source_type
source_seen_at
source_confidence
project_name_hint
official_website_url
github_url
docs_url
normalized_official_domain
normalized_github_owner
normalized_github_repo
canonical_candidate_key
```

Review and safety:

```text
staging_status
quarantine_reason
review_note
review_owner
reviewed_at
correction_status
ttl_expires_at
deleted_at
```

Audit and freshness placeholders:

```text
last_local_dry_run_at
last_audit_status
last_audit_error_class
source_staleness_state
```

These fields remain internal and must not imply public approval.

## Fields That Remain Local-Only

The following should remain local-only unless a later task explicitly promotes them into a reviewed staging schema:

- raw local dry-run JSONL rows;
- resolver intermediate traces;
- rejected or weak hint rows;
- ambiguous duplicate groups;
- unreviewed manual notes;
- fixture data;
- temporary manifest paths;
- local script/probe diagnostics;
- local-only guardrail fields such as `pr164_local_only` and `pr167_local_only`.

## Forbidden Fields

The staging sandbox must not store:

- founder emails;
- phone numbers;
- private social handles;
- customer names or logos;
- screenshots;
- copied competitor descriptions;
- copied directory descriptions;
- copied categories;
- rankings;
- scores;
- traffic;
- reviews;
- recommendations;
- investor interest;
- revenue, MRR, ARR, users, retention, ROAS, CAC, LTV, financing, or customer claims without a later explicit evidence policy;
- cookies, sessions, tokens, credentials, analytics, billing, CRM, admin, bank, payment, or private telemetry data;
- public status;
- publish status;
- sitemap status;
- Public API status;
- MCP status;
- Growth status;
- investment recommendation, ranking, or endorsement fields.

## Staging Statuses

Allowed staging-only statuses:

| Status | Meaning |
| --- | --- |
| `staged_identity_hint` | Public-safe identity hint is staged for internal review. |
| `canonical_candidate` | Canonical candidate exists but is not reviewed or public. |
| `ambiguous_review_required` | Identity conflict needs review. |
| `duplicate_candidate` | Duplicate may exist; no merge is permanent. |
| `quarantined` | Evidence is insufficient, risky, private, copied, or invalid. |
| `rejected_local_only` | Not suitable for staging/public use in this stage. |
| `deleted_internal` | Internal record was removed or tombstoned. |

Forbidden staging statuses:

- `approved`;
- `published`;
- `claimed`;
- `owner_verified`;
- `audited`;
- `report_ready`;
- `growth_ready`;
- `sitemap_ready`;
- `public_api_ready`;
- `mcp_ready`.

## What Must Be DB-Backed Later

If PR170 or a later task approves a durable staging path, DB-backed persistence must support:

- durable internal IDs;
- source provenance;
- reviewer attribution;
- status transitions;
- quarantine reasons;
- TTL and stale-state tracking;
- correction workflow;
- rollback/delete/tombstone operations;
- audit/freshness metadata;
- RLS or equivalent access control;
- no-public-surface enforcement.

PR169 does not approve a DB-backed path. It only defines the minimum contract.

## No-Public-Surface Rules

Staging sandbox data must never be read by:

- public frontend routes;
- sitemap generation;
- robots or public metadata;
- Public API routes;
- MCP tools;
- `/landscape`;
- `/tasks`;
- alternatives pages;
- public report pages;
- report registry;
- public JSON;
- distribution packs;
- search submission jobs;
- social/outreach/email automation.

Any future public use requires a separate reviewed publication task with explicit source, status, field, TTL, and correction rules.

## Migration Checkpoint Requirements

PR170 must stop at a checkpoint unless it is explicitly authorized to proceed.

Before any migration exists, PR170 or a later task must define:

- table/entity names;
- exact field list;
- indexes and uniqueness constraints;
- RLS or access-control policy;
- denied public routes and denied serializers;
- rollback strategy;
- delete/tombstone behavior;
- TTL and stale-state update behavior;
- correction workflow;
- seed/fixture strategy;
- staging-only environment target;
- proof that production writes are impossible;
- proof that sitemap, Public API, MCP, reports, and data repo remain untouched.

## Write Checkpoint Requirements

Any staging write requires a separate explicit checkpoint.

Before any write:

- target environment must be staging-only;
- production DB write must be impossible;
- `.env` and secrets must not be exposed;
- data repo writes must remain forbidden;
- rollback/delete plan must be documented;
- sample payload must be public-safe and PII-free;
- write count must be bounded;
- retry behavior must be bounded;
- public routes, sitemap, Public API, MCP, and reports must not read the written records.

If the checkpoint is not explicit, PR171 must default to local-only dry-run.

## Rollback / Delete / Correction Expectations

Future staging persistence must support:

- immediate record quarantine;
- reviewer correction note;
- stale-state marking;
- deletion or tombstone;
- rollback of a batch by batch ID;
- no-public impact confirmation;
- audit trail for internal review without storing private data.

Correction language must not shame or negatively label a project publicly.

## PR170 Handoff

PR170 / SCOUT_STAGING1 may decide a storage/migration path.

Default safe result:

- `GO_SCOUT_STAGING2_LOCAL_ONLY`

If a real Supabase migration is needed and not explicitly approved:

- `NEED_SUPABASE_MIGRATION_CHECKPOINT`

PR170 must not create migration files, write Supabase, write staging, write production, mutate data repo, expose public routes, update sitemap, release Public API/MCP, trigger audit, deploy, or start Growth unless a later explicit task changes the boundary.

## Validation Results

Validation after PR169 edits:

| Check | Result |
| --- | --- |
| `npm run agent:scope:check -- PR169` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/check-landscape-boundary.mjs` | PASS |
| `npm run landscape:check` | PASS |
| `node scripts/check-sector-density-boundary.mjs` | PASS |
| `node scripts/check-task-discovery-boundary.mjs` | PASS |
| `node scripts/check-alternatives-canonical.mjs` | PASS |
| `git diff --check` | PASS |
