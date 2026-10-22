# OPS-INFRA0X Cross-Project Shared Infrastructure Inventory Scan v0

Status: validation passed with findings  
Task: OPS-INFRA0X  
Result: GO_OPS_INFRA1X_WITH_FINDINGS  
Date: 2026-06-20

## Result

OPS-INFRA0X completed a read-only, redacted repository and infrastructure-readiness scan for 123Charts, 88cn-index-data, and available FermatMind local repos. The scan did not deploy, SSH, restart services, reload Nginx, restart PM2, change Redis, change security groups, change DNS, create/stop/renew instances, mutate Supabase, mutate `/Users/rainie/Desktop/88cn-index-data`, edit `.env`, read secrets, or modify runtime/product code.

The current evidence supports the next docs-only task, `OPS-INFRA1X`, to define shared-server isolation policy and runbooks before any 123Charts staging, scout worker, audit worker, queue, or monitoring placement is selected.

Findings that remain for human confirmation:

- `NEED_CLOUD_CONSOLE_MANUAL_INVENTORY`: Aliyun and Tencent Cloud consoles were not safely inspected in this Codex run.
- `NEED_PRIVATE_SERVER_READONLY_SCAN`: exact current CPU, memory, disk, service colocation, and billing horizon must be confirmed from approved read-only ops inventory.
- FermatMind repo scans were read-only but the local fap repos were not on clean main, so their exact current production role must be treated as repo-evidence plus human confirmation.

## Scope

In scope:

- `/Users/rainie/Desktop/123charts.com/123charts` repository scan.
- `/Users/rainie/Desktop/88cn-index-data` repository cleanliness and policy scan.
- `/Users/rainie/Desktop/GitHub/fap-web` read-only local repo scan.
- `/Users/rainie/Desktop/GitHub/fap-api` read-only local repo scan.
- Redacted placement recommendation and follow-up task list.

Out of scope:

- Cloud writes or console actions.
- Server login, SSH, Workbench, Cloud Assistant, Nginx, PM2, Redis, database, Supabase, DNS, security group, billing, or instance changes.
- Runtime/product code changes.
- Data repo mutation.
- SCOUT_IMPL0, SCOUT_IMPL1, AUDIT_IMPL, REPORT_IMPL, BETA1, I18N0, PR101.

## Safety And Redaction Rules

This report intentionally does not record:

- full public or private IP addresses;
- SSH usernames;
- SSH key paths;
- credential values, browser session material, or connection strings;
- full `.env` contents;
- Supabase service role values;
- Redis credential values;
- complete Nginx configs;
- complete cloud account identifiers;
- private billing identifiers;
- raw cloud resource IDs.

Committed inventory uses aliases and classes only: `HK-ALIYUN-01`, `SH-ALIYUN-*`, `SH-TENCENT-*`, region, public/private IP presence yes/no/unknown, OS class, CPU class, memory class, disk class, expiry month, role candidate, risk class, and do-not-touch reason.

## Source Inputs

123Charts repo inputs:

- `package.json`
- `deploy/pm2/ecosystem.config.cjs`
- `deploy/nginx/123charts.conf.example`
- `deploy/scripts/build-production.sh`
- `deploy/scripts/deploy-rsync.sh.example`
- `deploy/scripts/check-runtime.sh`
- `scripts/agent/deploy-production.sh`
- `scripts/agent/prepare-live-deploy.mjs`
- `ops/server/README.md`
- `ops/skills/live-deploy.md`
- `ops/tools/server-access-policy.md`
- `docs/OPS8B_PRODUCTION_DEPLOY_LIVE_SMOKE_V0.md`
- `docs/OPS9B_DEMAND_SIDE_TRAFFIC_SURFACE_DEPLOY_LIVE_SMOKE_V0.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`

Data repo inputs:

- `/Users/rainie/Desktop/88cn-index-data/README.md`
- `/Users/rainie/Desktop/88cn-index-data/docs/DATA_CONTRACT.md`
- `/Users/rainie/Desktop/88cn-index-data/docs/PRIVACY_BOUNDARY.md`
- `/Users/rainie/Desktop/88cn-index-data/package.json`
- clean git status probe.

FermatMind local repo inputs:

- `/Users/rainie/Desktop/GitHub/fap-web/README.md`
- `/Users/rainie/Desktop/GitHub/fap-web/package.json`
- `/Users/rainie/Desktop/GitHub/fap-web/scripts/deploy_web_pm2.sh`
- `/Users/rainie/Desktop/GitHub/fap-web/deploy/nginx/fap-web.conf`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/502-recovery-runbook.md`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/pm2-autoheal-cron.md`
- `/Users/rainie/Desktop/GitHub/fap-api/README_DEPLOY.md`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/composer.json`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/package.json`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/config/queue.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/scripts/deploy/deploy_backend.sh`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/docker-compose.yml`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/queue-runbook.md`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/backend-deploy-target-aliyun-01.md`

No `/tmp/ops-infra0x-fermatmind-readonly-scan.md` file was present.

## 123Charts Repo Scan Summary

| Question | Answer |
| --- | --- |
| Where is 123Charts currently deployed? | Repo evidence shows production on an Aliyun-hosted public web server reached through Workbench/deploy script, serving `https://123charts.com`. The expected server alias for this scan is `HK-ALIYUN-01`; exact cloud-console details need manual confirmation. |
| What deploy script is used? | `scripts/agent/deploy-production.sh` is the documented fixed-SHA production deploy script; `scripts/agent/prepare-live-deploy.mjs` prints the exact dry-run preparation command. |
| What process manager is used? | PM2, app name `123charts-web`, single Next.js process. |
| What Nginx pattern is used? | Reverse proxy to the local Next.js process with rate-limited API locations and security headers, based on `deploy/nginx/123charts.conf.example`. |
| Does 123Charts currently require Redis? | No repo evidence that the current public web runtime requires Redis. Future queue/worker roles should be isolated and separately approved. |
| Does 123Charts currently run workers? | No current worker runtime found in the 123Charts repo. SCOUT/AUDIT/REPORT worker tasks are future work and not started. |
| Does 123Charts currently write Supabase from production? | The app has Supabase admin/server libraries and admin/import routes, but OPS-INFRA0X did not inspect secrets or live writes. Current scan found no new write behavior introduced by this task. |
| What should remain on Hong Kong public web? | Public Next.js web, public cacheable routes, health, currently approved admin/public endpoints, and live smoke surface only. |
| What should move to Shanghai worker/staging later? | Staging admin/internal preview, scout worker, audit worker, queue/monitoring/backup/spare, subject to isolation policy and FermatMind capacity constraints. |
| What future SCOUT/AUDIT/REPORT tasks require server roles? | `SCOUT_IMPL0`, `SCOUT_IMPL1`, `AUDIT_IMPL`, and `REPORT_IMPL` may need worker/queue/report-generation placement; none may use `HK-ALIYUN-01` until isolated roles are approved. |

## 88cn-index-data Scan Summary

| Question | Answer |
| --- | --- |
| Is it clean? | Yes, git status was clean on `main...origin/main`. |
| Is it curated reviewed data? | Yes. The repo describes itself as public project facts that enter maintainer review and then 123Charts admin review. |
| Is it currently used as operational queue? | No repo evidence supports queue use. |
| Should it store raw scouted identities? | No. It should remain curated, reviewed, public-safe data only. |
| Should it store audit logs? | No. Audit logs belong in a separate reviewed operational store, not this public data repo. |
| Should it store PII? | No. Its privacy boundary explicitly rejects private contact, credential, analytics, private customer, private capital, and similar fields. |

Policy: `88cn-index-data` remains curated reviewed public-safe data. It must not become a worker queue, raw crawl store, audit log database, or PII store.

## FermatMind / fap-web / fap-api Read-Only Scan Summary

| Project | Repo path | Local state | Service type | Deploy model | Process / queue | Redis / DB | Criticality | Do-not-touch notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fap-web | `/Users/rainie/Desktop/GitHub/fap-web` | Not clean; non-main work branch with untracked files | Next.js frontend for FermatMind assessments | PM2-backed production topology; deploy entrypoint `scripts/deploy_web_pm2.sh`; Nginx proxy to local app and same-origin API proxy | PM2 app; autoheal/cron documented | API dependency; Redis not indicated for frontend runtime | High, production web | Do not place 123Charts workers on this host unless isolated and explicitly approved. Do not mutate this repo from OPS-INFRA0X. |
| fap-api | `/Users/rainie/Desktop/GitHub/fap-api` | Not clean; non-main work branch with untracked generated files | Laravel backend/API/Ops | Deployer/GitHub Actions path to Aliyun backend target; Tencent Node3 retired as production deploy target | Supervisor is official queue worker owner; queue config supports Redis/database | MySQL + Redis production baseline; local docker-compose has MySQL/Redis | High, production API/Ops/queue | Treat as do-not-touch for 123Charts worker placement unless isolated and explicitly approved. PHP version docs need confirmation because README_DEPLOY and current composer constraints differ. |

Additional notes:

- Several fap-web derivative worktrees exist under `/Users/rainie/Desktop/GitHub/*/fap-web`; they were not treated as authoritative production repos.
- Several FermatMind content asset directories exist under `/Users/rainie/Desktop/费马资料文件`; they are not infrastructure repos and were not used for server placement decisions.
- Because both main FermatMind repos have local WIP, any exact production placement decision needs human confirmation before using those hosts as shared infrastructure evidence.

## Aliyun Inventory Summary, Redacted

Cloud console was not safely inspected in this run. The table below separates repo-evidenced aliases from manual inventory placeholders.

| Server alias | Cloud provider | Region | Running state | OS | CPU class | Memory class | Disk class | Public IP present | Private IP present | Expiry month | Known project association | Candidate role | Risk class | Migration note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HK-ALIYUN-01 | Aliyun | Hong Kong, expected | unknown from console | unknown | unknown | unknown | unknown | yes, not recorded | unknown | unknown | 123Charts public web | 123Charts public web only | P1 until console capacity confirmed | Do not place workers here. |
| SH-ALIYUN-01 | Aliyun | Shanghai, proposed | NEED_CLOUD_CONSOLE_MANUAL_INVENTORY | unknown | unknown | unknown | unknown | unknown | unknown | unknown | candidate shared staging/admin | staging admin/internal preview | P2/P3 pending inventory | Candidate only. |
| SH-ALIYUN-02 | Aliyun | Shanghai, proposed | NEED_CLOUD_CONSOLE_MANUAL_INVENTORY | unknown | unknown | unknown | unknown | unknown | unknown | unknown | candidate 123Charts worker | scout worker | P2/P3 pending inventory | Candidate only. |
| SH-ALIYUN-03 | Aliyun | Shanghai, proposed | NEED_CLOUD_CONSOLE_MANUAL_INVENTORY | unknown | unknown | unknown | unknown | unknown | unknown | unknown | candidate 123Charts worker | audit worker | P2/P3 pending inventory | Candidate only. |
| SH-ALIYUN-04 | Aliyun | Shanghai, proposed | NEED_CLOUD_CONSOLE_MANUAL_INVENTORY | unknown | unknown | unknown | unknown | unknown | unknown | unknown | candidate shared ops | queue / monitoring / backup / spare | P2/P3 pending inventory | Candidate only. |
| FAP-API-ALIYUN-01 | Aliyun | unknown from local scan | unknown from console | unknown | unknown | unknown | unknown | yes, not recorded | unknown | unknown | FermatMind API/Ops/queue | do-not-touch for 123Charts workers unless isolated | P0/P1 if shared without isolation | Production role requires human confirmation. |

## Tencent Cloud Inventory Summary, Redacted

Cloud console was not safely inspected in this run. Repo evidence from fap-api says a historical Tencent Node3 production deploy target is retired, the old deploy webhook is disabled, and Node3 can expire without affecting current API/Ops/queue/scheduler/deploy path. Exact remaining Tencent instances, billing horizon, and current residual traffic require manual confirmation.

| Server alias | Cloud provider | Region | Running state | OS | CPU class | Memory class | Disk class | Public IP present | Private IP present | Expiry month | Known project association | Candidate role | Risk class | Migration note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SH-TENCENT-01 | Tencent Cloud | unknown | NEED_CLOUD_CONSOLE_MANUAL_INVENTORY | unknown | unknown | unknown | unknown | unknown | unknown | August, expected | historical FermatMind resources | migration source / sunsetting only | P2 Tencent timing risk | Do not place new 123Charts workloads. |
| TENCENT-NODE3-RETIRED | Tencent Cloud | unknown | repo evidence says retired as production deploy target | unknown | unknown | unknown | unknown | unknown | unknown | unknown | historical FermatMind API/Ops deploy target | no new workload | P1 if accidentally reused | Keep sunsetting; manual console confirmation required. |

## Server Role Matrix

| Alias | Recommended role | Forbidden role | Rationale |
| --- | --- | --- | --- |
| HK-ALIYUN-01 | 123Charts public web only | Scout worker, audit worker, crawler, large batch jobs, shared queue, heavy report generation | Public web host should stay low-risk and predictable. |
| SH-ALIYUN-01 | Candidate staging admin / internal preview | Production FermatMind colocated workload without isolation | Needs user, directory, PM2, env, Redis, log, and backup isolation first. |
| SH-ALIYUN-02 | Candidate scout worker | Public web, unbounded crawler, direct public route recalculation | Scout workload must remain bounded and queue-isolated. |
| SH-ALIYUN-03 | Candidate audit worker | Public web, unbounded audit, credentialed/form automation | Audit workload must inherit egress/politeness boundaries. |
| SH-ALIYUN-04 | Candidate queue / monitoring / backup / spare | Public web single point of failure | Should isolate queue prefixes, logs, backups, monitoring, and retention. |
| SH-TENCENT-* | Migration source / sunsetting only | New 123Charts staging, worker, queue, or monitoring placement | Expected sunsetting around August; do not add new dependencies. |
| FAP-WEB-NODE1 | FermatMind public web | 123Charts worker unless isolated and approved | Existing production web criticality. |
| FAP-API-ALIYUN-01 | FermatMind API/Ops/queue | 123Charts worker unless isolated and approved | Existing API, queue, DB, Redis, and ops criticality. |

## Resource Risk Matrix

| Severity | Risk | Current classification |
| --- | --- | --- |
| P0 | 123Charts worker shares secrets or queue with FermatMind production | Not observed directly; must be prohibited by OPS-INFRA1X before placement. |
| P0 | Worker runs on critical production API host without isolation | Possible if FAP-API host is reused; do not approve without isolation. |
| P0 | Raw IPs/secrets committed | Not done in OPS-INFRA0X. |
| P1 | Redis/PM2/Nginx name collision risk | Real risk for shared servers; OPS-INFRA1X must define namespacing. |
| P1 | No log rotation | Unknown for proposed 123Charts worker hosts; manual inventory needed. |
| P1 | Unknown production role | Applies to cloud-console-only aliases until manual inventory is complete. |
| P1 | Shared deployment path ambiguity | Real risk; path isolation required before any worker placement. |
| P2 | Limited CPU/memory headroom | Unknown; cloud console/private server read-only scan required. |
| P2 | Unclear staging environment | Current staging/admin placement is only a candidate plan. |
| P2 | Missing monitoring/backup docs | Needs OPS-INFRA1X/2X. |
| P2 | Tencent migration timing risk | Expected August sunsetting means no new 123Charts workload should be placed there. |
| P3 | Missing exact app role labels | Needs manual inventory with redacted aliases. |
| P3 | Missing non-sensitive server alias documentation | This report proposes aliases but needs human confirmation. |
| P3 | Manual confirmation needed | Cloud console and private server capacity were not inspected. |

## Tencent Sunsetting / Migration Note

Tencent Cloud resources should be treated as migration source and sunsetting infrastructure only. Any resource expiring around August should be marked:

- sunsetting;
- migration source;
- do-not-place-new-123Charts-workload.

New 123Charts workloads should prefer Aliyun and must wait for explicit isolation policy and placement approval.

## Preliminary 123Charts Placement Recommendation

Default recommendation:

| Workload | Preliminary placement |
| --- | --- |
| 123Charts public web | `HK-ALIYUN-01` only |
| 123Charts staging admin / internal preview | `SH-ALIYUN-01` candidate |
| 123Charts scout worker | `SH-ALIYUN-02` candidate |
| 123Charts audit worker | `SH-ALIYUN-03` candidate |
| Queue / monitoring / backup / spare | `SH-ALIYUN-04` candidate |
| Tencent Cloud resources | migration source / sunsetting only |

Do not execute this placement from OPS-INFRA0X. OPS-INFRA2X must choose exact roles after human confirmation of cloud inventory, server capacity, and FermatMind production constraints.

## Do-Not-Touch List

- `HK-ALIYUN-01`: no scout/audit worker or crawler runtime.
- `FAP-WEB-NODE1`: no 123Charts worker placement without explicit isolation approval.
- `FAP-API-ALIYUN-01`: no 123Charts worker placement without explicit isolation approval.
- `SH-TENCENT-*`: no new 123Charts workload placement.
- `/Users/rainie/Desktop/88cn-index-data`: no raw scouted identities, queue, audit log, PII, or worker state.
- Production Nginx, PM2, Redis, DNS, security groups, billing, instances, `.env`, Supabase, and server services: no changes in OPS-INFRA0X.

## Unknowns / Needs Human Confirmation

`NEED_CLOUD_CONSOLE_MANUAL_INVENTORY`:

- Aliyun instance list with redacted aliases.
- Tencent Cloud instance list with redacted aliases.
- Region, OS class, CPU class, memory class, disk class, public/private IP presence yes/no, expiry month, and current running state.
- Which Shanghai Aliyun machines exist and which are spare/candidate.
- Whether any Tencent resource still receives traffic or runs retained support services.

`NEED_PRIVATE_SERVER_READONLY_SCAN`:

- PM2 app list with redacted app names and ports.
- Nginx vhost list without full configs.
- Redis database/prefix usage without credential values.
- Cron/supervisor list without secrets.
- Disk/log/backup status classes.
- Current CPU/memory headroom classes.
- Existing app users and deploy roots, redacted.

FermatMind confirmation:

- fap-web exact current production host role.
- fap-api exact current API/Ops/queue host role.
- fap-api PHP version baseline (`README_DEPLOY.md` and current composer constraint differ).
- Whether any remaining Tencent-hosted dependency is still required by FermatMind.

## Manual Cloud Inventory Checklist

For each visible Aliyun or Tencent server, a human should record only:

- `server_alias`
- `cloud_provider`
- `region`
- `running_state`
- `OS`
- `CPU class`
- `memory class`
- `disk class / disk size class`
- `public_ip_present: yes/no`
- `private_ip_present: yes/no`
- `expiry month / billing horizon`
- `known project association`
- `candidate role`
- `risk class`
- `migration note`

Do not record full IPs, usernames, key paths, raw cloud IDs, billing IDs, or secrets in committed files.

## Exact Next Task Recommendation

1. `OPS-INFRA1X`: Shared Server Isolation Policy + Runbook v0.
2. `OPS-INFRA2X`: 123Charts Staging / Worker Placement Decision v0.
3. `SCOUT_IMPL0`: Post-SCOUTQ Implementation Readiness + Repo Split Decision v0.

OPS-INFRA1X should define Linux user isolation, directory isolation, PM2 app name isolation, Nginx vhost isolation, Redis prefix/DB isolation, env secret isolation, log isolation, backup isolation, deploy script isolation, and rollback runbook.

OPS-INFRA2X should choose exact roles for 123Charts staging/admin/worker only after human confirmation of the manual inventory.

## What This PR Does Not Do

- Does not deploy.
- Does not SSH or use cloud console write actions.
- Does not restart services.
- Does not reload Nginx.
- Does not restart PM2.
- Does not modify Redis.
- Does not change DNS, security groups, billing, or instances.
- Does not read or print secrets.
- Does not edit `.env`.
- Does not mutate Supabase.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not modify FermatMind repos.
- Does not modify 123Charts runtime/product code.
- Does not start OPS-INFRA1X, OPS-INFRA2X, SCOUT_IMPL0, SCOUT_IMPL1, AUDIT_IMPL, REPORT_IMPL, BETA1, I18N0, or PR101.

## Validation

| Check | Result |
| --- | --- |
| 123Charts preflight sync | PASS |
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
| `npm run report-distribution-pack:generate -- --dry-run` | PASS |
| `npm run agent:scope:check -- OPS-INFRA0X` | PASS |
