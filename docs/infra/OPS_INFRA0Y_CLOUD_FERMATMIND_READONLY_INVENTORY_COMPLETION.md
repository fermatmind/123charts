# OPS-INFRA0Y Cloud + FermatMind Readonly Inventory Completion v0

Status: validation passed with findings  
Task: OPS-INFRA0Y  
Result: GO_OPS_INFRA1X_WITH_FINDINGS  
Date: 2026-06-20

## Result

OPS-INFRA0Y completed the read-only cloud-console and FermatMind dependency inventory that OPS-INFRA0X left open. It converts the cloud-console unknowns into redacted facts and keeps private server capacity as a remaining human-confirmation item because this run did not have explicit read-only SSH authorization.

The next task remains `OPS-INFRA1X`: Shared Server Isolation Policy + Runbook v0. This task does not authorize `OPS-INFRA2X`, `SCOUT_IMPL0`, `SCOUT_IMPL1`, `AUDIT_IMPL`, `REPORT_IMPL`, `BETA1`, `I18N0`, `OPS10A`, `PR101`, deployment, migration, service restart, cloud mutation, DNS/security-group change, billing action, Supabase write, data-repo mutation, or FermatMind repo modification.

## Scope

In scope:

- Read OPS-INFRA0X and update only the unresolved inventory categories.
- Read-only local repo checks for `/Users/rainie/Desktop/123charts.com/123charts`, `/Users/rainie/Desktop/88cn-index-data`, `/Users/rainie/Desktop/GitHub/fap-web`, and `/Users/rainie/Desktop/GitHub/fap-api`.
- Read-only Chrome observation of Aliyun and Tencent Cloud consoles using the user's existing logged-in browser session.
- Redacted cloud and dependency matrices for OPS-INFRA1X policy work.

Out of scope:

- SSH, Workbench commands, package install, Nginx reload, PM2 restart, Supervisor/systemd/cron change, Redis/DB/Supabase write, cloud start/stop/reboot/renew/resize/create/delete, DNS/security-group/firewall change, billing change, deploy, migration, and product/runtime code change.

## Read-Only Safety Rules

The run did not deploy, migrate, restart services, reload Nginx, restart PM2, change Redis, change databases, mutate Supabase, create or change cloud resources, renew Tencent resources, change DNS, change security groups, edit `.env`, read secrets, read SSH keys, modify FermatMind repos, mutate `/Users/rainie/Desktop/88cn-index-data`, start OPS-INFRA1X/2X, or start SCOUT/AUDIT/REPORT implementation.

## Redaction Policy

Committed output intentionally excludes full public IPs, full private IPs, raw cloud resource IDs, raw VPC/subnet IDs, SSH usernames, key paths, account identifiers, secret values, connection strings, full `.env` contents, complete Nginx configs, and private billing identifiers. The report records aliases, regions, running state, resource classes, public/private IP presence, expiry month, project association, role candidate, risk class, and do-not-touch rules only.

## Source Inputs

- `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `docs/OPS8B_PRODUCTION_DEPLOY_LIVE_SMOKE_V0.md`
- `docs/OPS9B_DEMAND_SIDE_TRAFFIC_SURFACE_DEPLOY_LIVE_SMOKE_V0.md`
- `deploy/pm2/ecosystem.config.cjs`
- `docs/28_ALIYUN_HK_DEPLOYMENT_RUNTIME.md`
- `docs/30_PRODUCTION_RUNBOOK.md`
- `/Users/rainie/Desktop/GitHub/fap-web/package.json`
- `/Users/rainie/Desktop/GitHub/fap-web/ecosystem.config.cjs`
- `/Users/rainie/Desktop/GitHub/fap-web/scripts/deploy_web_pm2.sh`
- `/Users/rainie/Desktop/GitHub/fap-web/deploy/nginx/fap-web.conf`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/502-recovery-runbook.md`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/pm2-autoheal-cron.md`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/runtime/public-frontend-source-of-truth.md`
- `/Users/rainie/Desktop/GitHub/fap-api/README_DEPLOY.md`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/composer.json`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/config/queue.php`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/backend-deploy-target-aliyun-01.md`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/queue-runbook.md`
- Aliyun ECS console read-only pages for China Hong Kong and Shanghai.
- Tencent Cloud CVM, Lighthouse, Lighthouse DB, MySQL, and Redis console read-only pages.

No `/tmp/ops-infra0x-fermatmind-readonly-scan.md` file was used.

## OPS-INFRA0X Unresolved Items

| Unknown From OPS-INFRA0X | Resolution | Evidence Source | Confidence | Remaining Action |
| --- | --- | --- | --- | --- |
| `NEED_CLOUD_CONSOLE_MANUAL_INVENTORY` | Partially resolved. Aliyun ECS, Tencent Lighthouse, Tencent MySQL, and Tencent Redis were observed read-only and summarized redacted. | Chrome cloud-console observation | High for listed resources | Confirm any unobserved cloud products before migration execution. |
| `NEED_PRIVATE_SERVER_READONLY_SCAN` | Still unknown. No explicit SSH authorization in this turn. | Task authorization boundary | High | Human must approve read-only SSH separately if exact CPU/disk/service colocation is required. |
| Aliyun Shanghai capacity unknowns | Partially confirmed. Four running Shanghai ECS instances exist; one is named as FermatMind API production, three are launch-advisor instances. | Aliyun ECS Shanghai list | High | Human must confirm exact intended owner for the three launch-advisor instances and whether they are free for 123Charts later. |
| Tencent remaining resource unknowns | Confirmed for visible core FermatMind resources: three Lighthouse servers, one MySQL production DB, one Redis production cache; CVM Shanghai and Lighthouse DB are empty. | Tencent console read-only pages | High | Confirm billing/sunset plan before Tencent expiry; no new 123Charts workload. |
| FermatMind production host unknowns | Partially confirmed. fap-api production alias appears on Aliyun Shanghai ECS; fap-web remains PM2 production topology from repo docs; Tencent still hosts production DB/Redis and legacy/app resources. | fap-web/fap-api repo docs plus cloud console | Medium-high | Human confirmation needed before using any host for shared work. |
| FermatMind staging host unknowns | Partially confirmed. Tencent Lighthouse has a visible `fap-api-staging` instance. | Tencent Lighthouse console | High | Treat as FermatMind do-not-touch until migration plan is approved. |
| Redis / queue / PM2 / Nginx / cron unknowns | Partially confirmed. fap-web uses PM2; fap-api docs say Supervisor is official queue owner and Redis/database queue drivers exist; Tencent Redis production is visible. | Repo docs plus Tencent Redis console | Medium-high | Private server read-only scan needed for live process colocation. |
| log / backup / monitoring unknowns | Still unknown from server runtime. Repo runbooks mention logs/autoheal, but live service-level configuration was not inspected. | Repo docs only | Medium | OPS-INFRA1X should define required isolation and private read-only scan checklist. |

## 123Charts Follow-Up Summary

| Question | Answer |
| --- | --- |
| Does 123Charts currently run only public web in production? | Yes from repo/runbook evidence. Production public web is PM2 app `123charts-web` behind Nginx on the Hong Kong Aliyun host. |
| Does 123Charts currently have a scout worker? | No current worker runtime was found. SCOUT implementation remains future work. |
| Does 123Charts currently have an audit worker? | No current audit worker runtime was found. AUDIT implementation remains future work. |
| Does 123Charts currently use Redis? | No current public web runtime evidence requires Redis. Future queues must be isolated. |
| Does 123Charts currently write Supabase from production for SCOUT/AUDIT? | No SCOUT/AUDIT runtime has started; Supabase write behavior was not exercised in this task. |
| What future 123Charts roles need servers? | Staging admin/internal preview, scout worker, audit worker, queue/monitoring/backup/spare. |
| Which roles must not run on Hong Kong public web? | Scout worker, audit worker, crawler, large batch jobs, shared queue, report generation, and monitoring/backup jobs that can affect public latency. |

Conclusion: `HK-ALIYUN-01` remains public web only. Worker/staging placement is future work and must wait for OPS-INFRA1X and OPS-INFRA2X.

## 88cn-index-data Confirmation

The data repo stayed read-only. It remains curated public-safe reviewed data, not an operational queue, raw crawler store, audit log database, or PII store. No mutation was performed.

## fap-web Read-Only Scan Summary

`fap-web` is production-critical FermatMind frontend code. Local repo state was not clean and was not modified. Repo evidence shows:

- Next.js frontend, `pnpm` project, Node 24 production expectation.
- PM2 app name `fap-web`.
- Production app path class under `/opt/apps/fap-web`.
- Nginx same-origin `/api/` proxy to the API host and frontend proxy to local Next.js.
- Autoheal cron/runbook exists for `fap-web`.
- Frontend host is do-not-touch for 123Charts workers unless a later isolation policy and explicit approval allow it.

## fap-api Read-Only Scan Summary

`fap-api` is production-critical FermatMind backend/API/Ops/queue code. Local repo was not modified. Repo evidence shows:

- Laravel backend with PHP 8.4 composer constraint in current code.
- Production API alias documented as Aliyun ECS `fap-api-prod-ali-01`.
- Tencent Node3 is retired as production deploy target by repo docs.
- Supervisor is the official queue worker owner; legacy systemd queue service should not be treated as canonical.
- Queue config supports Redis/database drivers; production defaults require confirmation.
- MySQL and Redis are live production dependencies and visible in Tencent Cloud.
- Backend/API/Ops/queue host is do-not-touch for 123Charts workers unless later isolated and approved.

## FermatMind Dependency Matrix

| Repo | Service Alias | Service Type | Criticality | Process Manager | Queue Or Worker | Redis Dependency | Database Dependency | Server Hint | Do Not Touch For 123Charts Worker | Human Confirmation Needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fap-web | FAP-WEB-NODE1 | Next.js public frontend | High | PM2 | No frontend worker in repo evidence | API-side dependency only | API-side dependency only | PM2 app `fap-web`, Node 24, Nginx proxy | Yes | Yes, before any shared placement |
| fap-api | FAP-API-ALIYUN-01 | Laravel API/Ops/queue | High | Supervisor for queues; web process via PHP/Nginx class | Yes, official queue owner is Supervisor | Yes, production Redis visible on Tencent | Yes, production MySQL visible on Tencent | Aliyun Shanghai ECS named as production API | Yes | Yes, before any shared placement |
| fap-api | TENCENT-MYSQL-PROD | Tencent MySQL production DB | High | Managed cloud DB | Not a worker | No | Primary DB | Shanghai, production DB alias visible | Yes | Yes, migration source only |
| fap-api | TENCENT-REDIS-PROD | Tencent Redis production cache/queue dependency | High | Managed cloud Redis | Queue/cache dependency | Yes | No | Shanghai, production Redis alias visible | Yes | Yes, migration source only |
| fap-api | TENCENT-FAP-STAGING | Tencent Lighthouse staging/API host | Medium-high | Unknown from console | Unknown | Unknown | Unknown | Shanghai Lighthouse `fap-api-staging` | Yes | Yes, migration/sunset plan required |

## Aliyun Inventory Summary, Redacted

Aliyun ECS console observation confirmed:

- China Hong Kong: one running ECS, instance name class `launch-advisor-20260616`, 2 vCPU / 4 GiB / 1 Mbps, public and private IP present, subscription billing, expires 2026-07.
- Shanghai: four running ECS instances. One is named `fap-api-prod-ali-01`, 2 vCPU / 4 GiB / 5 Mbps, public and private IP present, pay-as-you-go. Three are launch-advisor instances with private IP only and 0 Mbps public bandwidth, two 2 vCPU / 1 GiB and one 2 vCPU / 4 GiB, all pay-as-you-go.

The cloud console did not show OS family in the list view used for this task. OS remains unknown until approved server read-only scan or safe instance detail inspection.

## Tencent Inventory Summary, Redacted

Tencent Cloud console observation confirmed:

- CVM Shanghai: no CVM instance in the visible Shanghai CVM list.
- Lighthouse Shanghai: three running servers named `fap-app-01`, `fap-app-02`, and `fap-api-staging`; expiry month 2026-08; public IPv4 present; all are migration-source/sunsetting only.
- Lighthouse DB: no visible light database.
- MySQL Shanghai: one running managed MySQL instance named `rds-fap-prod`, MySQL 8.0, package class 1 core / 2000 MB / 50 GB, private network only, subscription expiry 2026-09.
- Redis Shanghai: one running managed Redis instance named `redis-fap-prod`, Redis 7.0 standard architecture, 2 GB class, private network only, subscription expiry 2026-08.

Tencent resources are migration-source/sunsetting and must not receive new 123Charts workloads.

## Cloud Resource Matrix, Redacted

| Server Alias | Cloud Provider | Region | Running State | OS Family | CPU Class | Memory Class | Disk Class | Public IP Present | Private IP Present | Expiry Month | Known Project Association | Candidate Role | Risk Class | Migration Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HK-ALIYUN-01 | Aliyun | China Hong Kong | Running | unknown | 2 vCPU | 4 GiB | unknown | yes | yes | 2026-07 | 123Charts public web by repo/deploy evidence; console name needs human label confirmation | public web only | P1 | Do not place workers here. |
| FAP-API-ALIYUN-01 | Aliyun | Shanghai | Running | unknown | 2 vCPU | 4 GiB | unknown | yes | yes | pay-as-you-go | FermatMind API/Ops/queue | do-not-touch production API | P0/P1 | Not available for 123Charts worker without isolation and approval. |
| SH-ALIYUN-02 | Aliyun | Shanghai | Running | unknown | 2 vCPU | 4 GiB | unknown | no | yes | pay-as-you-go | unconfirmed launch-advisor instance | candidate staging/admin after OPS-INFRA1X/2X | P2 | Human must confirm owner and isolation. |
| SH-ALIYUN-03 | Aliyun | Shanghai | Running | unknown | 2 vCPU | 1 GiB | unknown | no | yes | pay-as-you-go | unconfirmed launch-advisor instance | candidate scout/audit only after OPS-INFRA1X/2X | P2 | Human must confirm owner and capacity. |
| SH-ALIYUN-04 | Aliyun | Shanghai | Running | unknown | 2 vCPU | 1 GiB | unknown | no | yes | pay-as-you-go | unconfirmed launch-advisor instance | candidate queue/monitoring/backup/spare only after OPS-INFRA1X/2X | P2 | Human must confirm owner and capacity. |
| TENCENT-LH-FAP-APP-01 | Tencent Cloud | Shanghai | Running | unknown | 4 vCPU | 8 GiB | 120 GB system disk | yes | unknown | 2026-08 | FermatMind app host | migration source / sunsetting only | P1 | No new 123Charts workload. |
| TENCENT-LH-FAP-APP-02 | Tencent Cloud | Shanghai | Running | unknown | 2 vCPU | 4 GiB | 60 GB system disk | yes | unknown | 2026-08 | FermatMind app host | migration source / sunsetting only | P1 | No new 123Charts workload. |
| TENCENT-LH-FAP-STAGING | Tencent Cloud | Shanghai | Running | unknown | 2 vCPU | 4 GiB | 100 GB system disk | yes | unknown | 2026-08 | FermatMind staging/API | migration source / sunsetting only | P1 | No new 123Charts workload. |
| TENCENT-MYSQL-PROD | Tencent Cloud | Shanghai | Running | managed | 1 core class | 2000 MB class | 50 GB class | no | yes | 2026-09 | FermatMind production DB | migration source / do-not-touch | P0 | No direct 123Charts dependency. |
| TENCENT-REDIS-PROD | Tencent Cloud | Shanghai | Running | managed | managed | 2 GB class | managed | no | yes | 2026-08 | FermatMind production Redis | migration source / do-not-touch | P0 | No direct 123Charts dependency. |

## 123Charts Candidate Placement Matrix

| Future Workload | Candidate Server Alias | Allowed Now | Required Before Use | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| 123Charts public web | HK-ALIYUN-01 | Yes, already current public web | Keep public-web-only boundary; no worker colocation | P1 if overloaded | Do not add scout/audit/queue load. |
| 123Charts staging admin | SH-ALIYUN-02 | No | OPS-INFRA1X isolation policy, OPS-INFRA2X placement approval, server owner confirmation | P2 | Candidate only. |
| 123Charts scout worker | SH-ALIYUN-03 | No | OPS-INFRA1X isolation, OPS-INFRA2X placement, queue/egress limits, logs/backup policy | P2 | Candidate only; not Hong Kong. |
| 123Charts audit worker | SH-ALIYUN-03 or SH-ALIYUN-04 | No | OPS-INFRA1X isolation, OPS-INFRA2X placement, politeness/egress policy, no credentialed automation | P2 | Candidate only. |
| Queue / monitoring / backup | SH-ALIYUN-04 | No | OPS-INFRA1X namespace/log/backup/retention policy and OPS-INFRA2X explicit placement | P2 | Candidate only. |

## Do-Not-Touch Matrix

| Server Or Service Alias | Reason | Scope Of Restriction | Required Human Confirmation |
| --- | --- | --- | --- |
| HK-ALIYUN-01 | Current 123Charts public web host | No scout/audit/queue/crawler/report-generation workload | OPS-INFRA2X explicit placement only if policy changes |
| FAP-WEB-NODE1 | FermatMind production frontend | No 123Charts worker or queue colocation | Yes |
| FAP-API-ALIYUN-01 | FermatMind production API/Ops/queue | No 123Charts worker, Redis, queue, cron, or deploy-path sharing | Yes |
| TENCENT-LH-FAP-APP-01 | Tencent sunsetting app host | No new 123Charts workload | Yes, migration-source only |
| TENCENT-LH-FAP-APP-02 | Tencent sunsetting app host | No new 123Charts workload | Yes, migration-source only |
| TENCENT-LH-FAP-STAGING | Tencent staging/API host | No new 123Charts workload | Yes, migration-source only |
| TENCENT-MYSQL-PROD | Production database | No 123Charts direct use, no DB writes, no migration execution | Yes |
| TENCENT-REDIS-PROD | Production Redis/cache/queue dependency | No 123Charts direct use, no Redis writes, no migration execution | Yes |

## Required Decisions

| Decision | Answer |
| --- | --- |
| Is OPS-INFRA1X ready to proceed? | Yes, with findings. It has enough facts to write isolation policy and read-only scan checklists. |
| Is OPS-INFRA2X ready to proceed after OPS-INFRA1X? | Conditionally yes. OPS-INFRA2X should wait for OPS-INFRA1X output and human confirmation of launch-advisor instance ownership/capacity. |
| Is SCOUT_IMPL0 still blocked until OPS-INFRA1X/2X? | Yes. No scout worker should start before policy and placement approval. |
| Can any Tencent resource host new 123Charts workload? | No. Tencent is migration-source/sunsetting only. |
| Can Hong Kong Aliyun host scout/audit worker? | No. It remains public-web-only. |
| Can any FermatMind production host host 123Charts worker now? | No. Later use would require isolation policy, explicit approval, and server-level confirmation. |
| Which unknowns remain? | Private server CPU/disk/service colocation, OS family from live servers, log/backup/monitoring runtime config, launch-advisor ownership, exact app roles for unlabeled Aliyun instances. |
| Which unknowns require human confirmation? | Private read-only SSH, launch-advisor ownership, Tencent sunset timing, production migration sequence. |
| Which facts are safe enough for OPS-INFRA1X policy work? | Cloud resource aliases/classes, Tencent no-new-workload rule, Hong Kong public-web-only rule, FermatMind do-not-touch rule, need for user/directory/PM2/Nginx/Redis/log/env/backup isolation. |

## Remaining Human Confirmations

- Approve read-only SSH separately if exact server OS, disk, CPU, memory, PM2, Nginx, Redis, Supervisor, cron, log, and backup facts are required.
- Confirm whether the three Aliyun Shanghai launch-advisor ECS instances are available for future 123Charts roles.
- Confirm whether the Hong Kong Aliyun launch-advisor console name should be permanently documented as `HK-ALIYUN-01`.
- Confirm Tencent resource sunset timeline and migration order before August/September expiries.
- Confirm no other cloud products outside the observed ECS/Lighthouse/MySQL/Redis pages contain live FermatMind/123Charts dependencies.

## Exact Next Task Recommendation

Proceed to `OPS-INFRA1X`: Shared Server Isolation Policy + Runbook v0.

OPS-INFRA1X should define Linux user isolation, directory isolation, PM2 app-name isolation, Nginx vhost isolation, Redis prefix/DB isolation, env secret isolation, log isolation, backup isolation, deploy-script isolation, rollback policy, and approved read-only server inventory checklist.

## What This Task Does Not Do

This task does not deploy, migrate, SSH, restart or reload services, change PM2/Nginx/Supervisor/systemd/cron, modify Redis or databases, mutate Supabase, create/stop/renew/resize/delete cloud resources, change security groups/DNS/firewalls, edit `.env`, read secrets, modify fap-web/fap-api, mutate 88cn-index-data, start OPS-INFRA1X/2X, or start SCOUT/AUDIT/REPORT/BETA/I18N implementation.
