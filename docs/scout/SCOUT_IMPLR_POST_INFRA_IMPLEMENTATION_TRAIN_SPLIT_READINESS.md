# SCOUT_IMPLR Post-INFRA Implementation Train Split Readiness

Date: 2026-06-20
Task ID: PR145
Alias: SCOUT_IMPLR
Role: codex-ops / codex-research
Result: GO_SCOUT_IMPL0
Exact next task: PR146 / SCOUT_IMPL0 Post-SCOUTQ Implementation Readiness + Repo Split Decision v0
Exact next train: TRAIN-PR146-PR150-SCOUT-IMPL-PERSISTENCE

## Result

PR145 converts the completed PR133-PR144 SCOUT/AUDIT/REPORT boundary phase and the completed OPS-INFRA placement phase into the next implementation-stage task split.

Result: `GO_SCOUT_IMPL0`.

Meaning:

- `SCOUT_IMPL0` may proceed next as a readiness and repo-split decision task only.
- Repo split and a possible `88cn-scout-worker` boundary should be evaluated next.
- Actual staging writes, Supabase migrations, Redis/queue creation, worker starts, audit runs, public report pages, sitemap inclusion, deploys, and server placement remain behind later task-specific checkpoints.
- PR145 does not start PR146 or any implementation task.
- PR145 itself is docs/status/train registration only and may be auto-merged with task-branch deletion after validation.

## Scope

In scope:

- Scan PR133-PR144 SCOUT/AUDIT/REPORT closeout.
- Carry forward OPS-INFRA2X conditional placement decisions.
- Register PR145 through PR157 roadmap task objects.
- Register three safe post-INFRA implementation-stage trains.
- Document human checkpoints and risk flags.
- Update status and train metadata.

Out of scope:

- Product/runtime code.
- Server/cloud mutation.
- SSH.
- Deployment.
- Supabase migration or write.
- Staging sandbox write.
- Redis/queue creation.
- Worker/crawler runtime.
- Batch audit runtime.
- Public report page creation.
- Sitemap inclusion.
- `/Users/rainie/Desktop/88cn-index-data` mutation.
- FermatMind repo mutation.
- BETA1, I18N0, OPS10A, PR101, or second-round Growth work.

## Source Inputs

| Source | Use |
| --- | --- |
| `docs/scout/SCOUT0R_MASS_INGESTION_AUDIT_REPORT_SPLIT_READINESS.md` | Previous split and train-registration baseline. |
| `docs/scout/*SCOUT*.md` | Sandbox, source, resolver, dry-run, and QA constraints. |
| `docs/scout/*AUDIT*.md` | Egress, politeness, batch audit, and dry-run constraints. |
| `docs/scout/*REPORT*.md` | TTL, correction, aggregate report, and Chinese outbound report constraints. |
| `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md` | Initial infrastructure inventory and findings. |
| `docs/infra/OPS_INFRA0Y_CLOUD_FERMATMIND_READONLY_INVENTORY_COMPLETION.md` | Cloud and FermatMind dependency read-only completion. |
| `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md` | Isolation policy and runbook source. |
| `docs/infra/OPS_INFRA2X_123charts_STAGING_WORKER_PLACEMENT_DECISION.md` | Immediate infrastructure source of truth. |
| `docs/TASK_STATUS.md` | Current task status history. |
| `ops/tasks/current.json` | Current task pointer. |
| `ops/tasks/roadmap.json` | Roadmap task registry. |
| `ops/trains/current.json` | Current train pointer. |
| `ops/trains/batches.json` | Train batch registry. |

## Current Infrastructure Decision Summary

OPS-INFRA2X result is `GO_SCOUT_IMPL0_WITH_CONDITIONAL_PLACEMENT`.

| Area | Decision carried forward |
| --- | --- |
| `HK-ALIYUN-01` | Keep as 123Charts public-web-only. No worker, crawler, queue, heavy report generation, or staging/admin load. |
| `FAP-API-ALIYUN-01` | FermatMind production API/Ops/queue do-not-touch for 123Charts worker placement. |
| `FAP-WEB-NODE1` | FermatMind production web do-not-touch for 123Charts worker placement. |
| Tencent resources | Sunsetting / migration source only. No new 123Charts workload. |
| `SH-ALIYUN-02` | Conditional staging/admin candidate; possible audit candidate only if unused by staging and capacity is confirmed. |
| `SH-ALIYUN-03` | Conditional low-concurrency scout candidate only. |
| `SH-ALIYUN-04` | Conditional queue/monitoring/backup/spare candidate with caution. |
| Audit placement | Needs capacity confirmation; 1 GiB candidates are not approved for heavy audit. |
| Redis/queue | Not authorized yet. |
| Supabase migration | Not authorized yet. |
| Staging write | Not authorized yet. |
| Default posture | Local-only until SCOUT_IMPL tasks approve otherwise. |

## Conditional Placement Implications

| Future lane | Implication |
| --- | --- |
| SCOUT_IMPL0 | Can evaluate repo split and worker boundary. Cannot create a repo, worker package, dependency, server placement, or runtime. |
| SCOUT_IMPL1 | Can define persistence boundary. Cannot create schema, migration, DB write, or staging write. |
| SCOUT_IMPL2 | Can decide storage/migration checkpoint. Actual Supabase migration must split to a later approved task. |
| SCOUT_IMPL3 | Defaults to local-only dry run. Any actual staging DB write requires human checkpoint and staging-only/no-public-route rules. |
| AUDIT_IMPL0 | Can model capacity and queue boundary. Cannot create Redis/queue or start a worker. |
| AUDIT_IMPL1 | Defaults to fixture/local small-batch dry run. External HTTP audit or server worker requires human checkpoint. |
| REPORT_IMPL | Can evaluate eligible data and drafts. Public pages, sitemap, public JSON, Public API, or MCP require a later checkpoint. |

## Task Split Matrix

| PR | Alias | Classification | Depends on | Purpose | Default stop line |
| --- | --- | --- | --- | --- | --- |
| PR145 | SCOUT_IMPLR | docs_only | PR144, OPS-INFRA2X | Register implementation-stage split and trains. | Does not start PR146. |
| PR146 | SCOUT_IMPL0 | docs_only / checkpointed_boundary | PR145, PR144, OPS-INFRA2X | Readiness and repo-split decision. | No implementation or new repo. |
| PR147 | SCOUT_IMPL1 | checkpointed_boundary | PR146 | Scouted sandbox persistence boundary. | No schema, migration, or write. |
| PR148 | SCOUT_IMPL2 | checkpointed_boundary | PR147 | Storage / migration checkpoint. | No migration unless later split and approved. |
| PR149 | SCOUT_IMPL3 | local_dry_run / staging_write_checkpointed | PR148 | Staging/local sandbox write dry-run boundary. | No production write; staging write needs checkpoint. |
| PR150 | SCOUT_IMPLQ | qa_only | PR149, PR148, PR147 | Sandbox persistence no-publish QA. | No runtime code. |
| PR151 | AUDIT_IMPL0 | server_worker_checkpointed | PR145, OPS-INFRA2X, PR150 | Audit worker queue boundary and capacity model. | No worker run or Redis/queue creation. |
| PR152 | AUDIT_IMPL1 | local_dry_run / server_worker_checkpointed | PR151 | Small-batch audit dry run. | No heavy audit; external HTTP needs checkpoint unless fixture-only. |
| PR153 | AUDIT_IMPLQ | qa_only | PR152, PR151 | Audit worker QA. | No worker runtime. |
| PR154 | REPORT_IMPL0 | checkpointed_boundary | PR145, PR150, PR153 | Report data eligibility scan. | No public report page. |
| PR155 | REPORT_IMPL1 | checkpointed_boundary | PR154 | AI Project Readiness aggregate report draft/decision. | Public page/sitemap requires later checkpoint. |
| PR156 | REPORT_IMPL2 | checkpointed_boundary | PR154 | Chinese outbound report draft/decision. | Public page/sitemap requires later checkpoint. |
| PR157 | REPORT_IMPLQ | qa_only | PR155, PR156, PR154 | Report QA and TTL correction QA. | No publication or release. |

## Train Registration Matrix

| Train | Tasks | Purpose | Status |
| --- | --- | --- | --- |
| `TRAIN-PR146-PR150-SCOUT-IMPL-PERSISTENCE` | PR146, PR147, PR148, PR149, PR150 | SCOUT implementation readiness, persistence boundary, storage checkpoint, staging/local dry-run, and no-publish QA. | Registered. |
| `TRAIN-PR151-PR153-AUDIT-IMPL-WORKER` | PR151, PR152, PR153 | Audit worker capacity boundary, small-batch dry-run, and audit QA. | Registered. |
| `TRAIN-PR154-PR157-REPORT-IMPL-READINESS` | PR154, PR155, PR156, PR157 | Report data eligibility, English aggregate report, Chinese outbound report, and report QA. | Registered. |

## Human Checkpoint Matrix

| Trigger | Required decision |
| --- | --- |
| Supabase migration | Human checkpoint required; split to a later explicit implementation task if needed. |
| Staging DB write | Human checkpoint required; staging-only and no public route effect. |
| Production DB write | Forbidden in this phase. |
| Redis/queue creation | Human checkpoint required. |
| Server worker start | Human checkpoint required and OPS-INFRA2X placement confirmation required. |
| External HTTP batch audit | Human checkpoint required unless local fixture-only. |
| Public report page | Human checkpoint required. |
| Sitemap inclusion | Human checkpoint required. |
| New repo creation | Human checkpoint required. |
| New dependency | Human checkpoint required. |
| Deploy | Forbidden in SCOUT_IMPLR. |

## Risk Flag Matrix

PR145 auto-merge policy:

| Flag | Value |
| --- | --- |
| auto_merge_allowed | true |

PR145 may be auto-merged and its task branch may be deleted after validation because it does not perform implementation, runtime, server, cloud, database, staging, worker, public-surface, data-repo, or deploy work.

The three registered future trains still keep these risk flags at `false`:

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

Task-level additional requirements:

| Task class | Required extra flags |
| --- | --- |
| Local/staging dry-run | `local_only=true`, `output_under_tmp=true`, `no_prod_write=true`, `no_public_page=true`, `no_sitemap=true`, `no_api_mcp=true`, `no_data_repo_write=true`. |
| Staging write checkpoint | `human_checkpoint=true`, `staging_only=true`, `no_production_write=true`, `no_public_route_effect=true`, `no_sitemap=true`. |
| Server worker checkpoint | `human_checkpoint=true`, `server_worker_allowed_only_if_OPS_INFRA2X_confirmed=true`, `no_HK_ALIYUN_worker=true`, `no_FAP_host_worker=true`, `no_Tencent_worker=true`. |

## Repo Split Decision Inputs

SCOUT_IMPL0 should evaluate:

- Whether scout/audit implementation remains in the 123Charts control repo as docs/contracts only.
- Whether a future `88cn-scout-worker` package or repo is needed.
- Whether a new repo would create data-governance or review-boundary risk.
- Whether future worker code can stay isolated from public web and FermatMind production repos.
- Whether runner compatibility requires PR-number task IDs even if aliases remain SCOUT/AUDIT/REPORT metadata.

PR145 decision: repo split should be evaluated, but no new repo or package is created here.

## Storage / Migration Decision Inputs

SCOUT_IMPL1 and SCOUT_IMPL2 should carry forward:

- Sandbox records remain private-by-default and not public lifecycle records.
- No scouted record can enter sitemap, Public API, MCP, `/landscape`, `/tasks`, alternatives, public reports, or distribution packs before review.
- Unknown fields remain unknown.
- Actual Supabase migration requires a later human-checkpointed implementation task.
- No production write is allowed in this phase.

PR145 decision: storage and migration can be evaluated only as boundary/checkpoint work.

## Staging Write Decision Inputs

SCOUT_IMPL3 should carry forward:

- Local-only remains default.
- Staging write requires explicit human checkpoint.
- Staging write, if approved later, must be staging-only, non-production, no-public-route-effect, no-sitemap, and no Public API/MCP exposure.
- `SH-ALIYUN-02` is only a conditional staging/admin candidate pending ownership and capacity confirmation.

PR145 decision: no immediate staging write is allowed.

## Audit Worker Decision Inputs

AUDIT_IMPL0 and AUDIT_IMPL1 should carry forward:

- Audit placement is conditional and needs capacity confirmation.
- Heavy audit is not approved on 1 GiB candidate hosts.
- `HK-ALIYUN-01`, FAP production hosts, and Tencent resources are forbidden for audit worker placement.
- Queue/Redis creation requires human checkpoint.
- External HTTP batch audit requires human checkpoint unless local fixture-only.
- Bounded batch defaults from the prior audit policy remain: maximum 20 jobs per run, maximum concurrency 3, 8 second timeout, maximum 3 attempts, and no WAF bypass or proxy evasion.

PR145 decision: scout and audit workers cannot start immediately.

## Report Implementation Decision Inputs

REPORT_IMPL0 through REPORT_IMPLQ should carry forward:

- REPORT0 TTL/correction policy remains required.
- REPORT1/REPORT2 can only use reviewed local/staging-eligible data.
- Drafts must avoid private contacts, unreviewed copied descriptions, individual unapproved candidates, customer claims, financing claims, revenue claims, verification claims, external outreach targets, and raw audit logs.
- Public report pages, sitemap inclusion, public JSON, Public API, MCP, and external distribution require a later human checkpoint and likely split.

PR145 decision: REPORT_IMPL cannot create public report pages immediately.

## Exact Next Task And Train

Exact next task: `PR146 / SCOUT_IMPL0`.

Exact next train: `TRAIN-PR146-PR150-SCOUT-IMPL-PERSISTENCE`.

PR146 must remain readiness/repo-split decision work. It must not start SCOUT_IMPL1, SCOUT_IMPL2, SCOUT_IMPL3, AUDIT_IMPL, REPORT_IMPL, BETA1, I18N0, OPS10A, PR101, deploy, server/cloud work, staging writes, Supabase migrations, Redis/queue work, worker runtime, public report pages, sitemap inclusion, data repo mutation, or FermatMind repo mutation.

## Sidecar Findings

No active PR145 sidecar findings.

Carried forward as non-blocking constraints:

- OPS-INFRA2X placement remains conditional because no private read-only SSH/capacity confirmation was authorized.
- Audit placement needs capacity confirmation.
- 1 GiB candidate hosts are not approved for heavy audit.
- Redis/queue, Supabase migration, staging write, worker start, public report page, and sitemap inclusion all require later checkpoints.

## Validation Results

| Command | Result |
| --- | --- |
| 123Charts preflight sync | PASS |
| OPS-INFRA2X merged into `origin/main` | PASS |
| data repo preflight sync | PASS |
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
| `npm run agent:scope:check -- PR145` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR146-PR150-SCOUT-IMPL-PERSISTENCE` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR151-PR153-AUDIT-IMPL-WORKER` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR154-PR157-REPORT-IMPL-READINESS` | PASS |

## What This PR Does Not Do

- Does not implement `SCOUT_IMPL0`.
- Does not start PR146, PR147, PR148, PR149, PR150, PR151, PR152, PR153, PR154, PR155, PR156, or PR157.
- Does not deploy.
- Does not SSH.
- Does not modify servers.
- Does not create Linux users.
- Does not create directories.
- Does not modify PM2.
- Does not modify Nginx.
- Does not modify Redis.
- Does not modify DNS or security groups.
- Does not edit `.env`.
- Does not mutate Supabase.
- Does not create Supabase migrations.
- Does not write staging sandbox.
- Does not start a worker.
- Does not start a crawler.
- Does not run batch audit.
- Does not create public report pages.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not modify FermatMind repos.
- Does not modify runtime/product code.
- Does not start BETA1.
- Does not start I18N0.
- Does not start OPS10A.
- Does not start PR101.
