# WORKER0 Scout Worker Boundary + Chain Readiness

Status: validation passed
Task: PR160 / WORKER0
Result: GO_WORKER1_WITH_PR160_PR179_CHAIN_REGISTERED
Date: 2026-06-20

## Result

PR160 defines the `88cn-scout-worker` boundary and registers the PR160-PR179 implementation-readiness chain.

Result: `GO_WORKER1_WITH_PR160_PR179_CHAIN_REGISTERED`.

Meaning:

- the future worker/runtime boundary belongs outside the 123Charts public web runtime boundary;
- worker code must not live in `app/**`, `components/**`, public routes, sitemap code, Public API, MCP, or other public runtime paths;
- `88cn-scout-worker` may become a future repo, package, or isolated workspace only behind a later human checkpoint;
- `PR161 / WORKER1` may proceed next as a checkpointed no-runtime bootstrap task only;
- `PR162 / WORKERQ` must QA isolation before Seed 100 work starts;
- PR163-PR179 are registered as the next split chain;
- six phase trains are registered after PR160, beginning with `TRAIN-PR161-PR162-WORKER-BOOTSTRAP-QA`.

No worker, repo, package, dependency, crawler, external HTTP audit, Supabase migration, Redis/queue, staging write, production write, deploy, server/cloud mutation, data repo mutation, FermatMind repo mutation, public report page, sitemap entry, Public API, or MCP surface is created by PR160.

## Scope

In scope:

- convert PR159 / ARCH0 Route A into a detailed worker-boundary decision;
- define the high-level micro-agent blueprint without implementation;
- define HTTP-first audit policy and future headless fallback checkpoint rules;
- define Seed 100 source policy and lifecycle states;
- register PR160-PR179 roadmap tasks and dependencies;
- register post-PR160 train batches if validation passes;
- update current task/train pointers.

Out of scope:

- new repo or package creation;
- dependency installation;
- worker, crawler, queue, audit, report, API, MCP, route, or public UI implementation;
- external HTTP audit;
- browser automation or session export;
- Supabase migration or write;
- staging or production DB write;
- Redis/queue creation;
- deploy, SSH, cloud/server mutation;
- `.env` edit, secret read, or secret print;
- mutation of `/Users/rainie/Desktop/88cn-index-data`;
- mutation of FermatMind repos;
- Growth, BETA, I18N, OPS10A, or PR101 start.

## Source Inputs

Reviewed source inputs:

- `docs/infra/ARCH0_WORKER_ARCHITECTURE_REPO_SPLIT_READINESS.md`
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

Immediate source of truth: PR159 selected Route A with result `GO_WORKER0_REPO_SPLIT_READINESS`.

## Worker Boundary Decision

Decision: future worker runtime must be outside the public web runtime boundary.

Boundary rules:

- `123Charts` remains the public web, policy, docs, admin review, and publication-gate control repo.
- Worker/runtime behavior must not be added to public web paths.
- Worker code may initially be represented as docs and contracts only.
- A future `88cn-scout-worker` physical repo, package, or isolated workspace requires a human checkpoint.
- PR161 can create or prepare a no-runtime skeleton only if that checkpoint explicitly permits the selected form.
- No worker process, queue consumer, crawler, external HTTP audit, staging write, production write, deploy, or public surface is authorized by PR160.

Server boundary:

- `HK-ALIYUN-01` remains public-web-only.
- FermatMind production hosts remain do-not-touch for 123Charts workers.
- Tencent resources remain migration-source / sunsetting only.
- Shanghai Aliyun candidates remain conditional and require owner/capacity confirmation before any use.

## Micro-Agent Blueprint

This is an architecture blueprint only. No agent is implemented.

| Agent | Purpose | Allowed input/output | Forbidden by default |
| --- | --- | --- | --- |
| Discovery Hint Agent | Find public identity hints. | `project_name`, `official_website_url`, `github_url`, `docs_url`, `source_url`, `source_type`, `discovered_at`. | Directory copy, third-party categories, third-party score/order fields, review text, private email, phone, private social handles, cookies, sessions. |
| Canonical Resolver Agent | Resolve identity conflicts. | Official domain, repo, docs, aliases, redirects, source fingerprints, conflict states. | Name-only matching, directory-only matching, merging forks/wrappers/templates without evidence. |
| HTTP-first Audit Agent | Audit official public project sources. | robots-aware lightweight HTTP observations, sitemap/head/canonical/JSON-LD/schema/GitHub/docs signals. | Headless browser, login, form submission, WAF bypass, proxy evasion, cookies, session export, bulk crawling. |
| Quarantine Classifier Agent | Classify failures and ambiguity. | Failure class, source URL, timestamp, retry eligibility, correction path. | Treating failures as permanent negative claims or public project-level judgments. |
| Report Aggregator Agent | Produce anonymous aggregate statistics. | `sample_count`, missing-rate metrics, link-rate metrics, quarantine breakdown, timestamp, method, TTL/correction path. | Project-level public shaming, unreviewed project-detail publication, global market sizing, superiority claims. |
| Growth Draft Agent | Draft distribution material from approved report data. | Local draft output under `/tmp/123charts-growth-drafts/` after report data approval. | Auto-send, auto-post, email send, DM send, GitHub issue creation, CRM write, platform login, external write. |

Canonical resolver must handle:

- one domain with many repos;
- one repo with many domains;
- same name across different projects;
- domain redirects;
- project rename;
- mirror sites;
- forks;
- wrappers;
- template repos.

## HTTP-First Audit Policy

Default audit policy: HTTP-first.

Allowed future HTTP-first observations, after an approved later task:

- robots-aware public URL fetches;
- `robots.txt`;
- `sitemap.xml`;
- HTML head metadata;
- canonical link;
- JSON-LD;
- SoftwareApplication schema;
- public GitHub/docs link presence;
- bounded timeout/retry/failure taxonomy.

Default limits carried forward:

- maximum 20 jobs per run;
- maximum concurrency 3;
- request timeout 8 seconds;
- maximum retries 3;
- failed scans must not zero out the last successful snapshot;
- source state can become stale instead of being erased.

Forbidden by default:

- headless browser;
- login;
- form submission;
- WAF bypass;
- proxy evasion;
- cookies;
- browser session export;
- bulk crawling;
- public-route-time recalculation.

## Headless Browser Fallback Policy

Headless browser is not allowed now.

Future fallback may be considered only through a separate checkpointed task such as `AUDIT_BROWSER0 / Headless Browser Fallback Boundary`.

Minimum checkpoint requirements:

- exact target class and reason HTTP-first is insufficient;
- no login, cookies, session export, or platform account use;
- no WAF bypass or proxy evasion;
- bounded concurrency and runtime;
- screenshots/artifacts stored outside public routes by default;
- no public project-level claim from unreviewed browser output;
- redaction and no-secret proof;
- no data repo mutation;
- no public page, sitemap, Public API, or MCP exposure.

## Seed 100 Source Policy

Future Seed 100 source mix:

| Source class | Target mix | Rule |
| --- | ---: | --- |
| GitHub / awesome lists / open-source AI projects | 40% | Prefer official repos and official docs. |
| Product launch sources / HN / public launch pages | 30% | Use as discovery hints; verify against official sources. |
| AI directories | 20% | Discovery hints only; no copied descriptions, categories, score/order fields, or recommendation copy. |
| Manually selected Chinese outbound AI projects | 10% | Require official source and original 123Charts note before any public use. |

Rules:

- do not depend 100% on any directory;
- `source_url` is required for each hint;
- official source is preferred;
- rejected/quarantined hints must be tracked separately;
- Seed 100 must not go public;
- Seed 100 must not enter sitemap;
- Seed 100 must not enter `/landscape`, `/tasks`, alternatives, Public API, MCP, or reports as project-level data.

## Lifecycle State Machine

Primary lifecycle:

1. `discovered_hint`
2. `identity_candidate`
3. `canonical_candidate`
4. `audit_pending`
5. `audited_observation`
6. `review_candidate`
7. `published_candidate`
8. `published`

Failure and side states:

- `quarantined`
- `duplicate`
- `ambiguous_identity`
- `source_unavailable`
- `robots_blocked`
- `waf_blocked`
- `rejected_hint`

Public visibility rule:

Only `published` and explicitly reviewed aggregate outputs may be public. Everything before `published` is private/backstage and must not affect public routes, sitemap, Public API, MCP, `/landscape`, `/tasks`, alternatives, reports, or data repo exports.

## PR160-PR179 Task Registration Matrix

| PR | Alias | Title | Purpose | Status |
| --- | --- | --- | --- | --- |
| PR160 | WORKER0 | 88cn-scout-worker Boundary + Full Chain Readiness Scan v0 | Define worker boundary and register PR160-PR179 chain. | Completed by this PR. |
| PR161 | WORKER1 | Worker Repo Skeleton / No-runtime Bootstrap v0 | Create or plan a no-runtime worker skeleton only if checkpoint permits. | Registered, not started. |
| PR162 | WORKERQ | Worker Repo Isolation QA v0 | Verify worker boundary isolation. | Registered, not started. |
| PR163 | SCOUT_SEED0 | Seed 100 Source Mix + Discovery Hint Policy v0 | Define Seed 100 source mix and allowed/forbidden fields. | Registered, not started. |
| PR164 | SCOUT_SEED1 | Seed 100 Identity Hint Local Pack v0 | Produce local-only identity hint pack if allowed. | Registered, not started. |
| PR165 | SCOUT_SEEDQ | Seed 100 Hint QA / No-Copy QA v0 | Verify no-copy, no-PII, no-public-surface. | Registered, not started. |
| PR166 | CANON0 | Canonical Resolver Boundary v0 | Define canonical resolver rules. | Registered, not started. |
| PR167 | CANON1 | Local Canonical Resolver Dry Run v0 | Run local resolver dry-run if allowed. | Registered, not started. |
| PR168 | CANONQ | Canonical Resolver QA v0 | QA resolver output and no-public-surface. | Registered, not started. |
| PR169 | SCOUT_STAGING0 | Staging Sandbox Persistence Implementation Boundary v0 | Define staging sandbox implementation boundary. | Registered, not started. |
| PR170 | SCOUT_STAGING1 | Staging Sandbox Storage / Migration Checkpoint v0 | Decide schema/migration checkpoint. | Registered, not started. |
| PR171 | SCOUT_STAGING2 | Staging Sandbox Write Dry Run v0 | Run staging/local write dry-run only if checkpoint allows. | Registered, not started. |
| PR172 | SCOUT_STAGINGQ | Staging Sandbox No-Publish QA v0 | Verify staging no-publish. | Registered, not started. |
| PR173 | AUDIT_WORKER0 | HTTP-first Audit Worker Boundary + Capacity Model v0 | Define HTTP-first audit worker boundary. | Registered, not started. |
| PR174 | AUDIT_WORKER1 | Seed 100 Small-Batch Audit Dry Run v0 | Run small-batch audit dry-run only if allowed. | Registered, not started. |
| PR175 | AUDIT_WORKERQ | Audit Worker Runtime QA v0 | QA audit worker / no-risk boundary. | Registered, not started. |
| PR176 | REPORT_DATA0 | Real Report Data Eligibility Scan v0 | Decide if data is eligible for report. | Registered, not started. |
| PR177 | REPORT_DATA1 | AI Project Readiness Data-backed Report v0 | Create English data-backed report only if eligible. | Registered, not started. |
| PR178 | REPORT_DATA2 | Chinese Outbound AI Project Readiness Report v0 | Create Chinese data-backed report only if eligible. | Registered, not started. |
| PR179 | REPORT_DATAQ | Report Dataset QA + TTL Correction QA v0 | QA report dataset and TTL/correction boundary. | Registered, not started. |

## Dependency Map

| Task | Depends on |
| --- | --- |
| PR161 | PR160 |
| PR162 | PR161 |
| PR163 | PR162 |
| PR164 | PR163 |
| PR165 | PR164 |
| PR166 | PR165 |
| PR167 | PR166 |
| PR168 | PR167 |
| PR169 | PR168 |
| PR170 | PR169 |
| PR171 | PR170 |
| PR172 | PR171 |
| PR173 | PR172 |
| PR174 | PR173 |
| PR175 | PR174 |
| PR176 | PR175 |
| PR177 | PR176 |
| PR178 | PR176 |
| PR179 | PR177, PR178 |

## Train Registration Matrix

| Train | Tasks | Purpose | Auto-merge |
| --- | --- | --- | --- |
| `TRAIN-PR161-PR162-WORKER-BOOTSTRAP-QA` | PR161, PR162 | No-runtime worker bootstrap checkpoint and isolation QA. | false |
| `TRAIN-PR163-PR165-SCOUT-SEED-MVP` | PR163, PR164, PR165 | Seed 100 source policy, local identity hint pack boundary, and no-copy QA. | false |
| `TRAIN-PR166-PR168-CANON-RESOLVER` | PR166, PR167, PR168 | Canonical resolver boundary, local dry run, and no-public-surface QA. | false |
| `TRAIN-PR169-PR172-SCOUT-STAGING` | PR169, PR170, PR171, PR172 | Staging sandbox boundary, storage checkpoint, write dry-run checkpoint, and no-publish QA. | false |
| `TRAIN-PR173-PR175-AUDIT-WORKER` | PR173, PR174, PR175 | HTTP-first audit worker boundary, small-batch audit checkpoint, and runtime QA. | false |
| `TRAIN-PR176-PR179-REPORT-DATA` | PR176, PR177, PR178, PR179 | Report data eligibility, English/Chinese report decisions, and dataset QA. | false |

PR160 is not included in a future train after completion.

## Human Checkpoint Matrix

| Trigger | Decision |
| --- | --- |
| New repo creation | Human checkpoint required. |
| New worker package creation | Human checkpoint required. |
| New dependency | Human checkpoint required. |
| Supabase migration | Human checkpoint required. |
| Staging DB write | Human checkpoint required. |
| Production DB write | Forbidden. |
| Redis/queue creation | Human checkpoint required. |
| Server worker start | Human checkpoint required and OPS-INFRA2X placement confirmation required. |
| External HTTP audit | Human checkpoint required unless fixture/local-only. |
| Headless browser fallback | Human checkpoint required in a separate task. |
| Public report page | Human checkpoint required. |
| Sitemap inclusion | Human checkpoint required. |
| Public API or MCP release | Human checkpoint required in a separate public-surface task. |
| Deploy | Forbidden in PR160. |
| Data repo mutation | Forbidden. |
| FermatMind repo mutation | Forbidden. |

## Risk Flag Matrix

All registered trains default to:

| Flag | Value |
| --- | --- |
| auto_merge_allowed | false |
| live_deploy_allowed | false |
| server_change_allowed | false |
| payment_change_allowed | false |
| mcp_change_allowed | false |
| public_api_release_allowed | false |
| plugin_install_allowed | false |
| new_dependency_allowed | false |
| external_service_allowed | false |
| data_repo_mutation_allowed | false |
| customer_access_allowed | false |
| pii_collection_allowed | false |
| social_posting_allowed | false |
| outreach_automation_allowed | false |
| email_send_allowed | false |
| dm_send_allowed | false |
| crm_write_allowed | false |
| platform_login_allowed | false |
| browser_session_export_allowed | false |
| live_analytics_connection_allowed | false |
| production_write_allowed | false |
| production_worker_allowed | false |
| crawler_runtime_allowed | false |

Task-level safe defaults:

- `no_prod_write=true`
- `no_public_page=true`
- `no_sitemap=true`
- `no_api_mcp=true`
- `no_data_repo_write=true`
- `no_supabase_write=true`
- `no_redis_queue=true`
- `no_external_http_audit=true`

## Exact Next Task/Train

Exact next task: `PR161 / WORKER1 - Worker Repo Skeleton / No-runtime Bootstrap v0`.

Exact next train: `TRAIN-PR161-PR162-WORKER-BOOTSTRAP-QA`.

PR161 must not start unless explicitly requested. It remains checkpointed and may only create or plan a no-runtime skeleton if the human checkpoint permits the selected repo/package/workspace boundary.

## Sidecar Findings

No new P0/P1/P2 sidecar finding is created by PR160.

Existing `docs/SIDECAR_ISSUES.md` contains historical gate-maintenance and lifecycle-checker items. They do not block PR160 because this task is docs/status/roadmap/train metadata only and does not start implementation.

## Validation Results

Baseline validation passed before PR160 edits:

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

Final validation after edits:

| Check | Result |
| --- | --- |
| JSON parse for task/train registries | PASS |
| `npm run agent:scope:check -- PR160` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR161-PR162-WORKER-BOOTSTRAP-QA` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR163-PR165-SCOUT-SEED-MVP` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR166-PR168-CANON-RESOLVER` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR169-PR172-SCOUT-STAGING` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR173-PR175-AUDIT-WORKER` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR176-PR179-REPORT-DATA` | PASS |
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
| `/Users/rainie/Desktop/88cn-index-data` status | CLEAN |

## What This PR Does Not Do

- Does not start PR161.
- Does not create `88cn-scout-worker`.
- Does not create a repo, package, dependency, or worker source file.
- Does not implement worker, crawler, queue, audit, report, API, MCP, route, sitemap, or product code.
- Does not run a crawler.
- Does not perform external HTTP audit.
- Does not use headless browser automation.
- Does not create Supabase migrations.
- Does not write Supabase, staging, or production data.
- Does not create Redis or queues.
- Does not deploy, SSH, restart services, reload Nginx, restart PM2, or mutate cloud/server state.
- Does not edit `.env`, read secrets, or print secrets.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not mutate FermatMind repos.
- Does not create public pages, sitemap entries, public JSON, Public API, MCP, report registry, or distribution surfaces.
- Does not start Growth, BETA, I18N, OPS10A, or PR101.
