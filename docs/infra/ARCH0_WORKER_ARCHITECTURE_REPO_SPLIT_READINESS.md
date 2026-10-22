# ARCH0 Worker Architecture + Repo Split Readiness Scan v0

Status: validation passed
Task: PR159 / ARCH0
Result: GO_WORKER0_REPO_SPLIT_READINESS
Date: 2026-06-20

## Result

PR159 reviews the post-implementation state after PR146-PR158 and selects the next architecture lane.

Result: `GO_WORKER0_REPO_SPLIT_READINESS`.

The next step should be `PR160 / WORKER0 - 88cn-scout-worker Boundary + Bootstrap Readiness v0`.

This task does not create a worker repo, package, dependency, migration, queue, server process, staging write, production write, or public surface. It only decides that the worker/runtime boundary should be designed before 123Charts moves from local-only and fixture-only artifacts toward real staging data production.

## Scope

In scope:

- review PR146-PR157 and PR158 outcomes;
- compare split-worker and single-repo staging-first architecture options;
- decide the next architecture route;
- carry forward OPS-INFRA1X and OPS-INFRA2X isolation rules;
- register the immediate Route A readiness lane as roadmap metadata.

Out of scope:

- deploy, SSH, cloud/server mutation;
- Supabase migration or Supabase write;
- staging or production DB write;
- Redis/queue creation;
- worker or crawler runtime;
- external HTTP audit;
- public report page, sitemap, Public API, or MCP release;
- new repo creation;
- new package implementation;
- new dependency;
- data repo mutation;
- FermatMind repo mutation;
- runtime/product code change;
- Growth, BETA, I18N, OPS10A, or PR101.

## Source Inputs

Reviewed source inputs:

- `docs/scout/POST_IMPL0_SCOUT_AUDIT_REPORT_IMPLEMENTATION_RESULT_REVIEW.md`
- `docs/scout/SCOUT_IMPLR_POST_INFRA_IMPLEMENTATION_TRAIN_SPLIT_READINESS.md`
- `docs/scout/SCOUT_IMPL0_POST_SCOUTQ_IMPLEMENTATION_READINESS_REPO_SPLIT_DECISION.md`
- `docs/scout/SCOUT_IMPL1_SCOUTED_SANDBOX_PERSISTENCE_BOUNDARY.md`
- `docs/scout/SCOUT_IMPL2_SANDBOX_STORAGE_MIGRATION_CHECKPOINT.md`
- `docs/scout/SCOUT_IMPL3_LOCAL_SANDBOX_WRITE_DRY_RUN.md`
- `docs/scout/SCOUT_IMPLQ_SANDBOX_PERSISTENCE_NO_PUBLISH_QA.md`
- `docs/scout/AUDIT_IMPL0_WORKER_QUEUE_CAPACITY_BOUNDARY.md`
- `docs/scout/AUDIT_IMPL1_SMALL_BATCH_FIXTURE_DRY_RUN.md`
- `docs/scout/AUDIT_IMPLQ_WORKER_QA.md`
- `docs/scout/REPORT_IMPL0_DATA_ELIGIBILITY_SCAN.md`
- `docs/scout/REPORT_IMPL1_AGGREGATE_REPORT_DRAFT.md`
- `docs/scout/REPORT_IMPL2_CHINESE_OUTBOUND_REPORT_DRAFT.md`
- `docs/scout/REPORT_IMPLQ_REPORT_QA_TTL_CORRECTION_QA.md`
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

## Current State After PR146-PR158

PR146-PR157 are complete. Final train result: `PASS_REPORT_IMPL_QA_TRAIN_COMPLETE`.

PR158 is complete with result `GO_ARCH0_BEFORE_SECOND_GROWTH`.

Current state:

- SCOUT outputs are local-only and docs/tmp-artifact-boundary only.
- AUDIT outputs are fixture-only and no-runtime only.
- REPORT outputs are draft-only and no-public-surface only.
- No real staging dataset exists.
- No real external audit result exists.
- No public report dataset exists.
- No report-backed Growth material exists.
- OPS-INFRA2X placement remains conditional.
- `HK-ALIYUN-01` remains public-web-only.
- FermatMind production hosts remain do-not-touch.
- Tencent remains migration-source/sunsetting only.
- `/Users/rainie/Desktop/88cn-index-data` remains curated reviewed public-safe data only.

This means 123Charts needs a staging/worker architecture before second-round Growth, public report distribution, or public report publication can be considered.

## Repo Split Decision Analysis

Decision: design the worker/runtime boundary before any staging write or worker runtime.

Answers:

1. The next implementation boundary should not put real worker/runtime behavior directly into the public web path.
2. A future `88cn-scout-worker` repo or package boundary should be designed before staging writes or worker runtime.
3. A physical repo/package split is not created now. It becomes required before real server worker/runtime, queue consumers, or external audit jobs.
4. Splitting reduces public-web blast radius, dependency drift, process ownership ambiguity, queue/log mixing, and accidental route/API leakage.
5. Splitting increases release coordination, contract-versioning work, CI setup, local development setup, and cross-repo governance overhead.
6. 123Charts must retain public web, docs/policy, admin review surfaces, future approved report UI, sitemap/robots, public API/MCP policy, and final publication gates.
7. `88cn-index-data` must never receive raw scout payloads, crawl dumps, audit logs, queue state, PII/private data, staging-only rows, worker temp output, correction queues, or operational secrets.

The route is not "create repo now"; it is "define the boundary before the next implementation step".

## Architecture Option Comparison

| Dimension | Option A: split worker repo/package | Option B: single-repo staging-first |
| --- | --- | --- |
| Security isolation | Stronger. Worker, crawler, queue, logs, and staging tooling can be separated from public web. | Weaker. Public web repo carries more runtime-adjacent surfaces and review burden. |
| Deployment complexity | Higher. Requires contract, CI, ownership, release, and local setup decisions. | Lower initially. Existing repo conventions and gates apply. |
| Testability | Stronger for worker-specific fixtures and no-public-surface tests once boundary is defined. | Easier for quick local checks, but worker and public web tests can become coupled. |
| Repo governance | Clearer ownership for worker/runtime code after boundary approval. | Simpler short term, but higher risk of scope creep in 123Charts public web repo. |
| Future worker runtime | Better fit. Worker process, queue consumers, and audit runners can be isolated. | Poorer fit before strict package/process boundaries exist. |
| Supabase migration risk | Easier to checkpoint separately from public web release. | Higher chance migrations arrive alongside web/admin changes. |
| Redis/queue risk | Easier to namespace and isolate from web runtime. | Higher chance queue concepts leak into web repo defaults. |
| Public-web safety | Stronger; `HK-ALIYUN-01` stays public-web-only. | Requires constant guardrails to prevent worker colocation assumptions. |
| Operational burden | Higher at first. Requires bootstrap readiness and contract discipline. | Lower initially but can become expensive after worker code grows. |
| Compatibility with current tasks | Fits PR158 and OPS-INFRA2X: architecture before real data production. | Fits local-only staging only, but not the need for future worker/runtime separation. |

Chosen option: Option A, split worker repo/package boundary readiness first.

## Staging Sandbox Architecture Decision

Staging sandbox is required before real reports because PR154-PR158 found no real staging dataset, no real audit results, and no publishable report data.

Decision:

- Begin with local/fixture contract preservation until a staging checkpoint is explicitly approved.
- Move toward DB-backed staging only after a migration/write checkpoint.
- Keep staging invisible to public web by default: no public routes, no sitemap, no Public API/MCP, no report registry, no public JSON, and no data repo export.
- Store raw or operational material only in future approved staging/worker storage, not in `88cn-index-data`.

Needed storage boundary before any write:

- exact task ID;
- exact staging target;
- exact schema/table proposal;
- allowed and denied fields;
- no PII/private data;
- rollback/delete plan;
- no production write guarantee;
- no public-route/sitemap/API/MCP effect;
- no data repo mutation.

Human checkpoint required before any migration or staging write.

## Worker Architecture Decision

Worker runtime is needed before second-round Growth if the project needs real audit/report data. It is not started here.

First safe worker scope:

- boundary and bootstrap readiness only;
- no runtime process;
- no external HTTP;
- no queue consumer;
- no staging or production write;
- no package dependency;
- no repo creation without explicit human checkpoint.

Minimum viable worker path:

1. `PR160 / WORKER0`: boundary + bootstrap readiness.
2. `PR161 / WORKER1`: no-runtime bootstrap, only after human checkpoint if repo/package creation is approved.
3. `PR162 / WORKERQ`: isolation QA.

Server placement:

- Do not run worker on `HK-ALIYUN-01`.
- Do not run worker on `FAP-API-ALIYUN-01`.
- Do not run worker on `FAP-WEB-NODE1`.
- Do not run worker on Tencent resources.
- `SH-ALIYUN-03` remains a conditional low-concurrency scout candidate pending owner/capacity confirmation and worker limits.
- `SH-ALIYUN-02` remains conditional staging/admin candidate and possible audit candidate only if not otherwise used and capacity is confirmed.
- `SH-ALIYUN-04` remains conditional queue/monitoring/backup/spare candidate with caution.
- Current placement does not allow heavy audit, especially not on 1 GiB candidate hosts.

## Queue / Redis Decision

Redis/queue is not required immediately.

Redis/queue becomes needed only when:

- durable async worker runs are approved;
- queue consumers are approved;
- retry/dead-letter behavior is required;
- staging worker execution exceeds local/file-based dry-run scope.

Rules:

- Do not share Redis with FermatMind by default.
- Do not use Tencent Redis for new 123Charts workloads.
- Use explicit queue namespace and key prefixes if Redis/queue is later approved.
- Keep default before Redis as local dry-run, file queue, or explicit staging-only queue contract.
- Queue creation requires human checkpoint.

## Supabase / Storage Decision

Supabase migration is not required immediately.

Migration checkpoint is required before:

- staging DB-backed sandbox records;
- worker-produced durable records;
- audit result row storage;
- correction/re-audit queue state;
- report aggregate storage.

Production writes are forbidden.

Staging-only writes may be allowed only after a later checkpoint with schema, fields, rollback, and no-public-surface proof.

Possible later entities:

- `scouted_sandbox_records`;
- `scout_source_observations`;
- `canonical_identity_candidates`;
- `audit_runs`;
- `audit_observations`;
- `report_aggregate_snapshots`;
- `correction_requests`.

Forbidden:

- PII/private data;
- raw crawl dumps;
- copied competitor descriptions;
- credentials, cookies, browser sessions;
- production write paths;
- public lifecycle/status fields that imply publication;
- direct data repo writes;
- public API/MCP exposure by default.

## Server Placement Implications

Carry forward OPS-INFRA2X:

- `HK-ALIYUN-01`: current 123Charts public web only.
- `SH-ALIYUN-02`: conditional staging/admin candidate pending ownership/capacity confirmation.
- `SH-ALIYUN-03`: conditional low-concurrency scout candidate pending ownership/capacity confirmation and worker limits.
- `SH-ALIYUN-04`: conditional queue/monitoring/backup/spare candidate with caution.
- `FAP-API-ALIYUN-01`: FermatMind production API/Ops/queue; do-not-touch for 123Charts workers.
- `FAP-WEB-NODE1`: FermatMind production web; do-not-touch for 123Charts workers.
- Tencent resources: migration-source/sunsetting only; no new 123Charts workload.

Private read-only SSH is still a separate human authorization if exact live process, disk, memory, PM2/Supervisor, Redis, cron, log, or backup facts are required.

## Human Checkpoint Matrix

| Trigger | Required Decision |
| --- | --- |
| New repo creation | Human checkpoint. |
| New worker package | Human checkpoint. |
| New dependency | Human checkpoint. |
| Supabase migration | Human checkpoint. |
| Staging DB write | Human checkpoint. |
| Production DB write | Forbidden. |
| Redis/queue creation | Human checkpoint. |
| Server worker start | Human checkpoint. |
| External HTTP audit | Human checkpoint unless fixture-only. |
| Public report page | Human checkpoint. |
| Sitemap inclusion | Human checkpoint. |
| Deploy | Forbidden in ARCH0. |
| Data repo mutation | Forbidden. |

## Chosen Next Lane

Chosen lane: Route A.

Chosen result: `GO_WORKER0_REPO_SPLIT_READINESS`.

Reason:

- future runtime should not live inside the 123Charts public web repo without a boundary decision;
- staging data production requires worker/storage contracts that are not yet defined;
- OPS-INFRA2X placement is conditional and public web isolation is non-negotiable;
- a worker repo/package boundary can be designed without creating the repo now;
- single-repo staging-first is acceptable only for docs/local fixtures, not for real worker/runtime.

## Registered Next Tasks

Registered as roadmap metadata only:

| Task | Alias | Title | Status |
| --- | --- | --- | --- |
| PR160 | WORKER0 | 88cn-scout-worker Boundary + Bootstrap Readiness v0 | Registered, not started. |
| PR161 | WORKER1 | Worker Repo Skeleton / No-runtime Bootstrap v0 | Registered, not started; human checkpoint required before repo/package creation. |
| PR162 | WORKERQ | Worker Repo Isolation QA v0 | Registered, not started. |

No train is registered in ARCH0.

## Sidecar Findings

No new P0/P1/P2 sidecar finding is created.

Non-blocking finding:

- PR159 updates PR159 allowed paths to include the preferred `docs/infra/ARCH0_*.md` report path. The prior PR158 registration allowed `docs/architecture/ARCH0_*.md` and `docs/scout/ARCH0_*.md`, but the PR159 task brief prefers `docs/infra/ARCH0_WORKER_ARCHITECTURE_REPO_SPLIT_READINESS.md`.

## Validation Results

Baseline validation before edits passed:

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
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

`agent:train-plan:check` still prints the repository default `TRAIN-PR146-PR150-SCOUT-IMPL-PERSISTENCE` dry run while passing. PR159 scope is enforced by `agent:scope:check -- PR159` and changed-file review.

## What This PR Does Not Do

- Does not start PR160.
- Does not create `88cn-scout-worker`.
- Does not create a repo or package.
- Does not add dependencies.
- Does not implement worker, crawler, queue, storage, report, API, MCP, or product code.
- Does not create Supabase migrations.
- Does not write Supabase, staging, or production databases.
- Does not create Redis or queues.
- Does not start scout worker or audit worker.
- Does not perform external HTTP audit.
- Does not deploy, SSH, or mutate cloud/server state.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not mutate FermatMind repos.
- Does not create public report pages, sitemap entries, public JSON, Public API, or MCP surfaces.
- Does not start Growth, BETA, I18N, OPS10A, or PR101.
