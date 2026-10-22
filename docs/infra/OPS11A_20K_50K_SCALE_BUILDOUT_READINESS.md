# OPS11A 20k-50k Scale Buildout Train Split + Auto-Merge Readiness Scan

Status: validation passed
Task: OPS11A / OPS11A_20K_50K_SCALE_BUILDOUT_READINESS
Result: GO_SCALE_BUILDOUT_TRAINS_REGISTERED
Date: 2026-06-21

## Result

OPS11A converts the post-PR182A 123Charts plan from a 50-project MVP path into a 20,000-50,000 project operating-system buildout plan.

Decision: `GO_SCALE_BUILDOUT_TRAINS_REGISTERED`.

The next executable task is `PR184 / PROJECT_CONTRACT_STAGING_SCHEMA_APPLY`, the numeric train-compatible remap of `PR182B`. It remains human-checkpointed because it involves Supabase staging schema apply. `PR186 / SERVER_CAPACITY_READINESS` may run in parallel as a read-only/docs-only server readiness path.

OPS11A is registration and readiness only. It does not start PR184, PR186, or any implementation task.

## Scope

In scope:

- review current state after PR181, PR182, and PR182A;
- document 20k-50k scale assumptions;
- resolve suffixed PR ID train compatibility;
- register numeric execution IDs for the buildout;
- classify future auto-merge eligibility and human checkpoints;
- register train segmentation and stop behavior;
- update task, train, and status metadata.

Out of scope:

- Supabase migration apply or connection;
- staging, production, or database writes;
- seed import;
- worker, crawler, audit, queue, Redis, or external HTTP runtime;
- Aliyun or Tencent console action;
- SSH, server prep, Nginx, PM2, Supervisor, systemd, cron, DNS, or security group changes;
- frontend implementation, sitemap runtime changes, Public API, or MCP release;
- data repo mutation;
- private seed row, raw evidence, canonical candidate, secret, or cloud/server identifier commits.

## Source Inputs

Read:

- `docs/scout/SEED_MANIFEST_50_SEED_IDENTITY_SHARDS_HARDENING.md`
- `docs/scout/PROJECT_CONTRACT_PUBLIC_ENTITY_FAIL_CLOSED_GATE.md`
- `docs/scout/PROJECT_CONTRACT_MIGRATION_CHECKPOINT.md`
- `docs/scout/POST179R_WORKER_SEED_CANON_STAGING_AUDIT_REPORT_EVIDENCE_REVIEW.md`
- `docs/infra/WORKER0_SCOUT_WORKER_BOUNDARY_CHAIN_READINESS.md`
- `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md`
- `docs/infra/OPS_INFRA0Y_CLOUD_FERMATMIND_READONLY_INVENTORY_COMPLETION.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/infra/OPS_INFRA2X_123charts_STAGING_WORKER_PLACEMENT_DECISION.md`
- `docs/TASK_STATUS.md`
- `docs/SIDECAR_ISSUES.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

No private seed rows were read. No `.env` files were read. No secrets were printed.

## Current State After PR182A

Confirmed state:

- PR181 is merged and records 50 accepted private seed rows, 25 needs-review rows, 12 rejected rows, 20 GitHub-backed candidates, 5 strictly open-source declared candidates, 15 mixed candidates, and 30 commercial candidates.
- PR182 is merged and defines Entity -> Repo -> Web, Source Evidence, lifecycle states, `published_projection`, fail-closed sitemap/API/MCP gates, and field visibility.
- PR182A is merged and selects `READY_FOR_PR182B_WITH_HUMAN_CHECKPOINT`.
- PR182A confirms existing migrations `001`-`012`, RLS conventions, `public.projects`, and admin-only review/import tables, but no dedicated PR182 project contract staging table family.
- `main == origin/main` before OPS11A branch creation.
- 123Charts worktree and `/Users/rainie/Desktop/88cn-index-data` were clean before OPS11A edits.
- No PR182B/PR182C/OPS-SERVER/PR183A/PR184/PR185/PR186/PR187/PR188 implementation had started.

## 20k-50k Scale Assumptions

At 20,000-50,000 projects, 123Charts needs an operating data plane, not a single small seed handoff.

Required assumptions:

- import must be sharded into batches with manifest, checksum, retry, quarantine, and review states;
- staging records must be separate from public projection records;
- admin review must support bulk triage, filters, state logs, and conflict resolution;
- workers must run outside public web request paths;
- audit jobs must be HTTP-first, rate-limited, retry-aware, and private by default;
- failed scans must preserve the last successful snapshot and mark stale instead of zeroing out scores;
- search and sitemap must be segmented and finite;
- frontend pages must read only reviewed projections;
- server roles must isolate public web, staging/admin, worker, audit, queue, logs, and backup paths.

## What Changes From The 50-Project MVP Plan

Invalid 50-project assumptions:

- one local artifact or one manual import pass is enough;
- a minimal control panel can be the immediate next implementation after PR182A;
- a single list page can scale without search, pagination, and finite collection rules;
- public sitemap can be one flat surface without segmentation;
- audit can be fixture-only or ad hoc;
- server placement can wait until after worker implementation;
- rejected, stale, and ambiguous states can stay as side notes rather than durable review states.

Still valid outputs:

- PR181 private seed integrity model and manual review blockers;
- PR182 Entity -> Repo -> Web contract and `published_projection` boundary;
- PR182 fail-closed sitemap/API/MCP policy;
- PR182A staging schema draft, RLS stance, rollback expectations, and no-seed-import default;
- OPS-INFRA shared-server isolation principle: shared hardware is allowed, shared risk is not.

Mandatory before 10,000 projects:

- project contract staging schema;
- bulk import contract;
- batch/import/quarantine job model;
- admin bulk review panel;
- worker bootstrap and isolated queue policy;
- HTTP-first audit worker with failure taxonomy;
- retry and dead-letter handling;
- published-only frontend listing/search/detail/collection pages;
- search index and sitemap segmentation;
- server capacity/readiness and host isolation plan.

## Task ID Compatibility And Remap Decision

Current train validators accept `PR<number>` IDs and selected non-PR families. They do not accept suffixed PR IDs such as `PR182B`, `PR183A`, or `PR184Q` inside train batches.

Decision:

- keep existing `PR182B` as a previously registered standalone checkpoint artifact;
- do not reference suffixed IDs in new train batches;
- remap the 20k-50k execution chain to numeric IDs `PR184` through `PR207`;
- preserve original intent through aliases.

Collision scan:

- existing numeric PR max before OPS11A: `PR183`;
- proposed numeric range: `PR184`-`PR207`;
- collision result: no numeric collision.

## Task Matrix

| execution_id | preserved source label | alias | title | type | depends_on | human_checkpoint | auto_merge_eligible | purpose | forbidden actions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PR184 | PR182B | PROJECT_CONTRACT_STAGING_SCHEMA_APPLY | Project Contract Staging Schema Apply v0 | staging-schema-apply | OPS11A, PR182A | yes | no | Apply staging schema after approval. | production write, seed import, public read |
| PR185 | PR182C | BULK_IMPORT_CONTRACT | Bulk Import Contract v0 | bulk-import-contract | PR184 | no | yes | Define import batch/quarantine contract. | import, DB write, runtime |
| PR186 | OPS-SERVER0R | SERVER_CAPACITY_READINESS | Server Capacity Readiness Scan v0 | server-readiness-scan | OPS11A | no | yes | Read-only capacity readiness path. | SSH, console mutation, server write |
| PR187 | OPS-SERVER1 | SERVER_ISOLATION_PLAN | Server Isolation Plan v0 | server-isolation-plan | PR186 | no | yes | Refresh isolation runbook. | server change, deploy |
| PR188 | OPS-SERVER2 | STAGING_ADMIN_HOST_PREP | Staging/Admin Host Prep v0 | server-host-prep | PR187, PR184 | yes | no | Prepare staging/admin host. | unapproved server change, production load |
| PR189 | OPS-SERVER3 | WORKER_AUDIT_HOST_PREP | Worker/Audit Host Prep v0 | server-host-prep | PR187 | yes | no | Prepare worker/audit host. | unapproved server change, runtime start |
| PR190 | PR183A | BULK_CONTROL_PANEL | Bulk Control Panel v0 | admin-review-ui | PR184 | yes | no | Admin-only bulk review surface. | auto-publish, public route |
| PR191 | PR183B | STATE_SWITCHER_REVIEW_LOG | State Switcher + Review Log v0 | admin-review-state | PR190 | yes | no | Manual state switcher and review log. | automatic publish transition |
| PR192 | PR183Q | CONTROL_PANEL_QA | Control Panel QA v0 | qa | PR191 | no | yes | QA admin boundaries. | implementation edits |
| PR193 | PR184A | SCOUT_WORKER_REPO_BOOTSTRAP | Scout Worker Repo Bootstrap v0 | worker-bootstrap | PR185, PR187 | yes | no | Worker boundary bootstrap. | runtime start, queue creation |
| PR194 | PR184B | BULK_IMPORT_WORKER | Bulk Import Worker v0 | worker-implementation | PR193, PR185, PR188 | yes | no | Bounded import worker. | production write, unapproved staging write |
| PR195 | PR184C | CANONICAL_RESOLVER_WORKER | Canonical Resolver Worker v0 | worker-implementation | PR194 | yes | no | Identity conflict resolver. | public projection |
| PR196 | PR184D | HTTP_AUDIT_WORKER | HTTP Audit Worker v0 | worker-implementation | PR193, PR189 | yes | no | HTTP-first audit worker. | browser fallback, WAF bypass, login, bulk crawling |
| PR197 | PR184E | QUEUE_RETRY_DEAD_LETTER | Queue Retry Dead-letter v0 | queue-retry-dead-letter | PR194, PR196 | yes | no | Retry and dead-letter handling. | shared Redis, unbounded retry |
| PR198 | PR184Q | WORKER_QA | Worker QA v0 | qa | PR197 | no | yes | QA worker boundaries. | implementation edits |
| PR199 | PR185A | PROJECT_LISTING_SEARCH | Project Listing + Search v0 | frontend-public-surface | PR190 | yes | no | Published-only listing/search. | raw staging exposure |
| PR200 | PR185B | PROJECT_DETAIL_PAGE | Project Detail Page v0 | frontend-public-surface | PR199 | yes | no | Published-only detail pages. | raw seed/evidence/audit exposure |
| PR201 | PR185C | COLLECTIONS | Collections v0 | frontend-public-surface | PR199 | yes | no | Finite reviewed collections. | faceted pSEO expansion |
| PR202 | PR185D | SEARCH_INDEX_SITEMAP_SEGMENTATION | Search Index + Sitemap Segmentation v0 | search-sitemap | PR199, PR200, PR201 | yes | no | Segmented search/sitemap. | unreviewed sitemap inclusion |
| PR203 | PR185Q | FRONTEND_QA | Frontend QA v0 | qa | PR202 | no | yes | QA frontend no-leakage boundaries. | implementation edits |
| PR204 | PR186A | SECURITY_FIREWALL | Security Firewall v0 | security-firewall | PR198, PR203 | yes | no | Security hardening gate. | deploy |
| PR205 | PR186B | PRODUCTION_DEPLOY_GATE | Production Deploy Gate v0 | production-deploy-gate | PR204 | yes | no | Exact-SHA deploy gate. | deploy without exact approval |
| PR206 | PR187 | FIRST_DATA_REPORT | First Data Report v0 | report-data | PR198, PR203 | yes | no | First real data-backed report. | unreviewed project-level claims |
| PR207 | PR188 | SECOND_ROUND_GROWTH2 | Second-round Growth2 v0 | growth-followup | PR206 | yes | no | Report-backed Growth2 follow-up. | email, DM, social, CRM, external write |

## Dependency DAG

```text
OPS11A
  -> PR184 -> PR185
  -> PR186 -> PR187 -> PR188
                    -> PR189

PR184 -> PR190 -> PR191 -> PR192

PR185 + PR187 -> PR193
PR193 + PR185 + PR188 -> PR194 -> PR195
PR193 + PR189 -> PR196
PR194 + PR196 -> PR197 -> PR198

PR190 -> PR199 -> PR200
               -> PR201
PR199 + PR200 + PR201 -> PR202 -> PR203

PR198 + PR203 -> PR204 -> PR205
PR198 + PR203 -> PR206 -> PR207
```

Parallel path:

- `PR186 / SERVER_CAPACITY_READINESS` may run in parallel with `PR184` because it is read-only/docs-only.

## Auto-Merge Eligibility Matrix

| task | auto_merge_eligible | reason |
| --- | --- | --- |
| OPS11A | yes | docs/status/roadmap/train metadata only; no human checkpoint required. |
| PR185 | yes | bulk import contract only; no import or DB write. |
| PR186 | yes | read-only/docs-only server readiness scan. |
| PR187 | yes | isolation plan/runbook only. |
| PR192 | yes | QA-only allowed-path task. |
| PR198 | yes | QA-only allowed-path task. |
| PR203 | yes | QA-only allowed-path task. |
| PR184, PR188-PR191, PR193-PR197, PR199-PR202, PR204-PR207 | no | Supabase, server, worker, public surface, deploy, report, or growth risk requires checkpoint. |

## Human Checkpoint Matrix

| task group | checkpoint reason |
| --- | --- |
| PR184 | Supabase staging schema apply. |
| PR188-PR189 | Server prep and host mutation. |
| PR190-PR191 | Admin implementation and manual state transition surface. |
| PR193-PR197 | Worker bootstrap, staging effects, external HTTP audit, Redis/queue, retry/dead-letter behavior. |
| PR199-PR202 | Public frontend/search/sitemap surface. |
| PR204-PR205 | Security hardening and production deploy gate. |
| PR206-PR207 | Public report and report-backed growth material. |

## Train Registration Matrix

| train | tasks | auto_run_behavior |
| --- | --- | --- |
| TRAIN-DATA-PLANE | PR184, PR185 | Stops at PR184 human checkpoint before Supabase apply. |
| TRAIN-SERVER-READINESS | PR186, PR187 | Auto-merge eligible if checks pass; read-only/docs-only. |
| TRAIN-SERVER-PREP | PR188, PR189 | Stops on server prep checkpoints. |
| TRAIN-CONTROL-PANEL-20K | PR190, PR191, PR192 | Stops on implementation/review state checkpoints. |
| TRAIN-WORKER-PIPELINE-20K | PR193-PR198 | Stops before worker runtime, external HTTP audit, and queue effects. |
| TRAIN-FRONTEND-MVP-20K | PR199-PR203 | Stops before public surface and sitemap changes. |
| TRAIN-SECURITY-DEPLOY-20K | PR204, PR205 | Stops before deploy; exact SHA required. |
| TRAIN-REPORT-GROWTH-20K | PR206, PR207 | Stops before public report or external growth action. |

All registered train task IDs are runner-compatible numeric PR IDs.

## Database / Supabase Staging Plan

PR184 is the first data-plane implementation task and is the numeric remap of PR182B.

Rules:

- staging schema apply only;
- explicit human approval required;
- no production write;
- no seed import in PR184;
- RLS fail-closed by default;
- rollback and post-apply schema smoke required.

20k-50k planning additionally needs later contracts for:

- `import_batches`;
- `worker_jobs`;
- `audit_runs`;
- `quarantine_events`;
- `report_snapshots`;
- search index candidates;
- sitemap candidates.

Those are not created by OPS11A.

## Server Readiness / OPS Plan

Server path:

- PR186: read-only/docs-only capacity readiness scan;
- PR187: isolation plan and runbook;
- PR188: staging/admin host prep, checkpointed;
- PR189: worker/audit host prep, checkpointed.

OPS11A performs no fresh Aliyun/Tencent scan except reading existing redacted OPS-INFRA reports. No server action occurs.

Carry-forward rules:

- `HK-ALIYUN-01` remains public-web-only;
- FermatMind production hosts remain do-not-touch for 123Charts workers;
- Tencent resources are migration-source/sunsetting only;
- Shanghai Aliyun candidates require owner/capacity confirmation before use.

## Control Panel Plan

20k-50k requires more than the previous minimal control panel:

- bulk staging record triage;
- review filters for missing docs, identity conflict, reachability, source class, stale, rejected, and quarantine;
- manual lifecycle state switching;
- immutable review log;
- no auto-publish;
- no unreviewed public projection.

PR190 and PR191 are checkpointed implementation tasks. PR192 is QA-only and may be auto-merge eligible if executed alone.

## Worker / Queue / Audit Plan

Worker path:

- PR193: worker boundary/bootstrap;
- PR194: bulk import worker;
- PR195: canonical resolver worker;
- PR196: HTTP-first audit worker;
- PR197: retry/dead-letter queue;
- PR198: worker QA.

Required scale rules:

- no public-route-time crawl or score recalculation;
- default batch cap and concurrency controls;
- request timeout and retry limits;
- failed scans mark stale and preserve last successful snapshot;
- browser fallback requires separate checkpoint;
- no WAF bypass, login, cookie use, proxy evasion, or platform session export.

## Frontend / Sitemap Segmentation Plan

20k-50k frontend must include:

- listing pagination;
- search;
- filters;
- finite reviewed collections;
- published-only project detail pages;
- sitemap segmentation;
- no broad faceted pSEO;
- no raw seed, source evidence, audit, review note, rejected, or quarantine exposure.

PR199-PR202 are checkpointed public-surface tasks. PR203 is QA-only.

## Report / Growth Plan

PR206 requires real reviewed audit/report data. Fixture-only and aggregate-only draft evidence is insufficient for a public report.

PR207 may use only approved report-backed material. By default it must not send email, DM, social posts, CRM writes, or any external write.

## Sidecar Findings

Findings:

- Existing `PR182B` remains registered as a standalone suffixed checkpoint from PR182A, but new trains use `PR184` as the numeric remap.
- Existing `PR183 / CONTROL_PANEL` remains in roadmap as the earlier minimal control panel task, but the 20k-50k path supersedes it with `PR190`-`PR192`.
- `TRAIN-SERVER-READINESS` is auto-merge eligible; server prep is not.
- `TRAIN-DATA-PLANE` starts with a human-checkpointed Supabase apply and must not auto-run through PR184.

No sidecar-blocking issue was found.

## Exact Next Task / Train

Exact next task:

`PR184 / PROJECT_CONTRACT_STAGING_SCHEMA_APPLY`

Exact next train:

`TRAIN-DATA-PLANE`

Parallel read-only task:

`PR186 / SERVER_CAPACITY_READINESS`

Do not start either task inside OPS11A.

## Validation Results

Pre-change baseline:

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
- `node scripts/check-task-discovery-boundary.mjs`: PASS
- `node scripts/check-alternatives-canonical.mjs`: PASS

Metadata validation during OPS11A:

- `jq empty ops/tasks/current.json ops/tasks/roadmap.json ops/trains/current.json ops/trains/batches.json`: PASS
- `npm run agent:scope:check -- OPS11A`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS for `TRAIN-DATA-PLANE`
- explicit train-plan dry runs: PASS for all eight new trains

Final validation:

- `npm run verify:day0`: PASS
- `npm run policy:scan`: PASS
- `npm run third-party:check`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS
- `node scripts/check-landscape-boundary.mjs`: PASS
- `npm run landscape:check`: PASS
- `node scripts/check-sector-density-boundary.mjs`: PASS
- `node scripts/check-task-discovery-boundary.mjs`: PASS
- `node scripts/check-alternatives-canonical.mjs`: PASS
- `git diff --check`: PASS

## What This PR Does Not Do

- Does not apply Supabase migration.
- Does not connect to Supabase.
- Does not write staging or production data.
- Does not import seed data.
- Does not touch Aliyun or Tencent consoles.
- Does not SSH.
- Does not change Nginx, PM2, Redis, Supervisor, systemd, cron, DNS, security groups, deploy config, or server files.
- Does not start crawler, worker, audit, queue, or report runtime.
- Does not create public project pages.
- Does not change sitemap runtime.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not modify FermatMind repos.
- Does not read `.env` values or secrets.
- Does not commit private seed rows, artifacts, source evidence rows, or canonical candidate rows.
