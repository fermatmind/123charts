# OPS-SERVER0R 123Charts Server Capacity Readiness Scan v0

## 1. Result

OPS_SERVER0R_PARTIAL_NEEDS_READONLY_SSH

Summary: existing repo/docs plus prior OPS-INFRA0Y cloud-console evidence and this run's read-only Aliyun ECS overview are enough to preserve the current placement direction, but not enough to claim final live capacity readiness for 20k-50k project scale. Exact OS, disk, process ownership, PM2/Nginx/Redis/Supervisor/cron occupancy, logs, backup, and live headroom still require separately approved read-only SSH or safe cloud detail inspection.

## 2. Scope

This scan covered the required aliases and resource groups:

- `HK-ALIYUN-01`
- `SH-ALIYUN-02`
- `SH-ALIYUN-03`
- `SH-ALIYUN-04`
- FermatMind do-not-touch resources
- Tencent sunsetting resources

This was a read-only readiness scan. It did not deploy, migrate, restart, reload, resize, renew, stop, create, delete, write server files, read secrets, or modify any repository. Final local `git status` showed unrelated modified ops task/train metadata files plus an unrelated untracked OPS11A infra doc; those files were not edited by OPS-SERVER0R.

## 3. Method

- Read local 123Charts infra/scout docs.
- Read local FermatMind `fap-web` and `fap-api` deploy/runtime docs and configs without opening `.env` files.
- Attempted Chrome extension control; it failed before browser control due to local runtime metadata error.
- Used Computer Use as a read-only fallback for Chrome.
- Observed Aliyun ECS console overview only; did not open Workbench, Cloud Shell, SSH, Cloud Assistant, security group detail pages, or purchase/renew/stop/restart actions.
- Tencent Cloud console did not finish loading into resource inventory in this run; prior OPS-INFRA0Y recorded Tencent console findings are reused and clearly marked as prior evidence.
- No SSH was used because this task did not include explicit read-only SSH authorization.

## 4. Evidence sources

- `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md`
- `docs/infra/OPS_INFRA0Y_CLOUD_FERMATMIND_READONLY_INVENTORY_COMPLETION.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/infra/OPS_INFRA2X_123Charts_STAGING_WORKER_PLACEMENT_DECISION.md`
- `docs/scout/PROJECT_CONTRACT_MIGRATION_CHECKPOINT.md`
- `docs/scout/PROJECT_CONTRACT_PUBLIC_ENTITY_FAIL_CLOSED_GATE.md`
- `/Users/rainie/Desktop/GitHub/fap-web/ecosystem.config.cjs`
- `/Users/rainie/Desktop/GitHub/fap-web/scripts/deploy_web_pm2.sh`
- `/Users/rainie/Desktop/GitHub/fap-web/scripts/rolling_reload_pm2.sh`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/*`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/runtime/*`
- `/Users/rainie/Desktop/GitHub/fap-api/deploy.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/config/queue.php`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/*`
- Chrome/Computer Use observation of Aliyun ECS overview on 2026-06-21.

## 5. Cloud inventory summary

Aliyun, observed in this run:

- ECS overview showed 5 ECS instances and 5 running instances.
- This matches prior OPS-INFRA0Y evidence: one Hong Kong ECS and four Shanghai ECS.
- The overview exposed raw instance IDs/IPs; they are deliberately omitted here.
- Visible resource classes were consistent with prior redacted docs: one Hong Kong 2 vCPU / 4 GiB class host, one Shanghai FermatMind API 2 vCPU / 4 GiB class host, and three Shanghai launch-advisor candidate hosts.

Aliyun, prior OPS-INFRA0Y evidence reused:

- Hong Kong: one running ECS, 2 vCPU / 4 GiB / 1 Mbps class, public and private IP present, subscription, expiry month 2026-07.
- Shanghai: four running ECS instances. One FermatMind API production host, 2 vCPU / 4 GiB / 5 Mbps, public and private IP present, pay-as-you-go. Three launch-advisor candidate hosts with private IP only, 0 Mbps public bandwidth, two 2 vCPU / 1 GiB and one 2 vCPU / 4 GiB, pay-as-you-go.

Tencent, prior OPS-INFRA0Y evidence reused:

- CVM Shanghai: no visible CVM instance.
- Lighthouse Shanghai: three running FermatMind servers, expiry month 2026-08, public IPv4 present.
- Tencent MySQL: one production MySQL 8.0 managed instance, 1 core / 2000 MB / 50 GB class, private network only, expiry 2026-09.
- Tencent Redis: one production Redis 7.0 managed instance, 2 GB class, private network only, expiry 2026-08.
- User direction on 2026-06-21: Tencent expires around the end of August and all resources are intended to move to Aliyun. This scan treats Tencent as migration-source / sunsetting only.

## 6. Server role matrix

| Alias | Current / known role | Candidate role | Status | Decision |
| --- | --- | --- | --- | --- |
| `HK-ALIYUN-01` | 123Charts public web | public web only | running by console/doc evidence | Keep public web only. |
| `SH-ALIYUN-02` | Shanghai launch-advisor candidate, strongest non-production class | staging/admin/internal preview | conditional | Needs owner/capacity and read-only SSH confirmation. |
| `SH-ALIYUN-03` | Shanghai launch-advisor candidate, low memory class | low-concurrency scout/import/canonical worker | conditional | Only tiny/low-concurrency worker after confirmation. |
| `SH-ALIYUN-04` | Shanghai launch-advisor candidate, low memory class | queue/monitoring/backup/spare or tiny audit dry-run | conditional | Not enough for heavy audit without upgrade/new host. |
| `FAP-API-ALIYUN-01` | FermatMind API/Ops/queue production | do-not-touch | running by prior evidence | No 123Charts workload. |
| `FAP-WEB-NODE1` | FermatMind public frontend production | do-not-touch | repo/runtime evidence | No 123Charts workload. |
| Tencent resources | FermatMind migration-source / managed dependencies | sunsetting only | prior evidence | No new 123Charts workload. |

## 7. HK-ALIYUN-01 capacity summary

- CPU: 2 vCPU class.
- Memory: 4 GiB class.
- Disk: not confirmed from this run; prior report did not record exact disk class for this alias.
- Network: 1 Mbps public bandwidth class from prior OPS-INFRA0Y.
- OS family: unknown until SSH or safe instance detail inspection.
- PM2: repo evidence says 123Charts public web uses PM2 app `123charts-web`.
- Nginx: repo evidence says public reverse proxy / vhost pattern.
- Redis: no current 123Charts public web Redis requirement found.
- Supervisor/systemd/cron: live state unknown; do not infer without SSH.
- Logs/backup: live state unknown; must be checked before adding more load.
- Current app roots: 123Charts public web root is known by deployment docs, but live root not revalidated by SSH in this task.
- Current process ownership: unknown without SSH.
- Candidate role: 123Charts public web only.
- Do-not-touch reason: public latency and production stability; no scout/audit/queue/crawler/heavy report generation/staging admin/FermatMind colocation.

Recommendation: keep current public web role only. Capacity is acceptable for current public web continuation, not for worker expansion.

## 8. SH-ALIYUN-02 capacity summary

- CPU: 2 vCPU class.
- Memory: 4 GiB class.
- Disk: unknown.
- Network: private-IP-only / 0 Mbps public bandwidth class from prior OPS-INFRA0Y.
- OS family: unknown.
- PM2/Nginx/Redis/Supervisor/cron: unknown without SSH.
- Logs/backup: unknown without SSH.
- Current app roots: unknown.
- Current process ownership: unknown.
- Candidate role: staging/admin/internal preview first; possible audit fallback only if unused by staging and capacity is proven.
- Do-not-touch reason: not placement-ready; owner, live services, logs, disk, and isolation must be confirmed.

Recommendation: best conditional Shanghai candidate for staging/admin because it has 4 GiB memory class, but not ready for live placement.

## 9. SH-ALIYUN-03 capacity summary

- CPU: 2 vCPU class.
- Memory: 1 GiB class.
- Disk: unknown.
- Network: private-IP-only / 0 Mbps public bandwidth class from prior OPS-INFRA0Y.
- OS family: unknown.
- PM2/Nginx/Redis/Supervisor/cron: unknown without SSH.
- Logs/backup: unknown without SSH.
- Current app roots: unknown.
- Current process ownership: unknown.
- Candidate role: low-concurrency scout/import/canonical worker only after strict caps.
- Do-not-touch reason: 1 GiB memory is not safe for heavy audit or broad crawler behavior.

Recommendation: conditional low-concurrency dry-run worker only. Require memory limit, concurrency cap, disk/log guard, and read-only SSH confirmation.

## 10. SH-ALIYUN-04 capacity summary

- CPU: 2 vCPU class.
- Memory: 1 GiB class.
- Disk: unknown.
- Network: private-IP-only / 0 Mbps public bandwidth class from prior OPS-INFRA0Y.
- OS family: unknown.
- PM2/Nginx/Redis/Supervisor/cron: unknown without SSH.
- Logs/backup: unknown without SSH.
- Current app roots: unknown.
- Current process ownership: unknown.
- Candidate role: queue/monitoring/backup/spare, or tiny audit dry-run only if separately approved.
- Do-not-touch reason: insufficient proof for Redis/queue/audit load; log and backup capacity unknown.

Recommendation: conditional spare/monitoring/backup candidate only. Do not place production Redis or heavy audit here without upgraded capacity or managed service decision.

## 11. FermatMind do-not-touch matrix

| Resource | Current role | Do-not-touch reason | 123Charts rule |
| --- | --- | --- | --- |
| `FAP-WEB-NODE1` | FermatMind production frontend, PM2 `fap-web`, Nginx proxy | High criticality public frontend | No 123Charts worker, queue, crawler, or staging/admin. |
| `FAP-API-ALIYUN-01` | FermatMind API/Ops/queue production | API, queue, deploy, Nginx, Supervisor, DB/Redis dependency | No 123Charts worker, Redis, queue, cron, deploy path, or staging/admin. |
| FermatMind production DB | Managed production DB dependency | P0 data integrity risk | No 123Charts direct dependency or writes. |
| FermatMind production Redis | Managed cache/queue dependency | P0 queue/cache isolation risk | No 123Charts direct use, no shared queue, no shared prefix. |
| FermatMind PM2/Supervisor/Nginx/cron/release roots | Production runtime surfaces | Restart/reload/cross-deploy risk | No 123Charts control path or colocated deploy script. |

## 12. Tencent sunsetting matrix

| Resource | Prior observed state | Expiry / sunset | 123Charts decision |
| --- | --- | --- | --- |
| Tencent Lighthouse app host 1 | running, FermatMind app host | 2026-08 | migration source / sunsetting only |
| Tencent Lighthouse app host 2 | running, FermatMind app host | 2026-08 | migration source / sunsetting only |
| Tencent Lighthouse staging/API host | running, FermatMind staging/API | 2026-08 | migration source / sunsetting only |
| Tencent MySQL production | running managed MySQL 8.0 class | 2026-09 | production do-not-touch; migration source only |
| Tencent Redis production | running managed Redis 7.0 class | 2026-08 | production do-not-touch; migration source only |

No Tencent resource should receive new 123Charts workload.

## 13. CPU / memory / disk / network summary

| Alias | CPU | Memory | Disk | Network | Capacity verdict |
| --- | --- | --- | --- | --- | --- |
| `HK-ALIYUN-01` | 2 vCPU | 4 GiB | unknown | 1 Mbps public bandwidth class | OK for current public web only; not worker-safe. |
| `SH-ALIYUN-02` | 2 vCPU | 4 GiB | unknown | private-only / 0 Mbps public class | Best staging/admin candidate; needs SSH/detail confirmation. |
| `SH-ALIYUN-03` | 2 vCPU | 1 GiB | unknown | private-only / 0 Mbps public class | Low-concurrency scout only; memory constrained. |
| `SH-ALIYUN-04` | 2 vCPU | 1 GiB | unknown | private-only / 0 Mbps public class | Spare/monitoring/backup/tiny dry-run only; memory constrained. |
| `FAP-API-ALIYUN-01` | 2 vCPU | 4 GiB | unknown | 5 Mbps public bandwidth class | FermatMind production do-not-touch. |
| Tencent Lighthouse app 1 | 4 vCPU | 8 GiB | 120 GB system disk class | public IPv4 present | Sunsetting only. |
| Tencent Lighthouse app 2 | 2 vCPU | 4 GiB | 60 GB system disk class | public IPv4 present | Sunsetting only. |
| Tencent staging/API | 2 vCPU | 4 GiB | 100 GB system disk class | public IPv4 present | Sunsetting only. |

Disk for Aliyun ECS candidates remains a blocker for final readiness because worker/audit/log/backup capacity cannot be judged without disk class and live usage.

## 14. PM2 / Nginx / Redis / Supervisor / cron summary

- 123Charts public web: PM2 app `123charts-web` and Nginx public vhost are expected from repo/deploy evidence. Live process list not checked.
- 123Charts Redis: no current public web Redis requirement found. Future Redis/queue requires isolation and approval.
- fap-web: PM2 app `fap-web`, Node 24 runtime expectation, Nginx proxy, and autoheal cron/runbook exist in repo docs. Do-not-touch for 123Charts.
- fap-api: deploy config uses Nginx, PHP-FPM, Supervisor as official queue worker owner, and Redis/database queue drivers. Do-not-touch for 123Charts.
- Tencent Redis/MySQL: production FermatMind managed dependencies, migration-source only.
- Cron: fap-web autoheal docs and fap-api scheduler/queue runbooks exist, but live cron was not inspected.

Live PM2, Nginx, Redis, Supervisor, systemd, and cron occupancy remains `NEED_READONLY_SSH_FOR_LIVE_CAPACITY`.

## 15. Logs / backup summary

- OPS-INFRA1X requires separate role-scoped logs and backup paths before workers start.
- Recommended future logs include `/var/log/123charts/web/`, `/var/log/123charts/admin/`, `/var/log/123charts/scout-worker/`, and `/var/log/123charts/audit-worker/`.
- Recommended backup separation includes `/backups/123charts/` and `/backups/fap/`.
- This scan did not inspect live `/var/log`, backup paths, snapshots, or logrotate state.
- Aliyun ECS overview showed backup/snapshot widgets, but no instance-level live backup policy was verified in this run.

Verdict: logs and backups are not placement-ready until read-only SSH or safe cloud detail inspection confirms disk pressure, logrotate, retention, and backup ownership.

## 16. Candidate placement recommendation

Recommended placement model remains:

- `HK-ALIYUN-01`: keep 123Charts public web only.
- `SH-ALIYUN-02`: conditional staging/admin/internal preview candidate.
- `SH-ALIYUN-03`: conditional low-concurrency scout/import/canonical worker candidate.
- `SH-ALIYUN-04`: conditional queue/monitoring/backup/spare candidate; tiny audit dry-run only if separately approved.
- Audit worker: do not approve heavy audit on 1 GiB hosts. Prefer `SH-ALIYUN-02` only if unused and confirmed, or assign/provision a stronger Aliyun worker host later.
- FermatMind production: do-not-touch.
- Tencent: migration-source / sunsetting only.

For 20k-50k project scale, this should be treated as a phased readiness model, not a final capacity approval. Low-memory candidates may support bounded dry-runs, not sustained broad audit/crawler workloads.

## 17. Server risks

- `NEED_READONLY_SSH_FOR_LIVE_CAPACITY`: exact OS, disk, services, logs, backups, process ownership, and headroom are unknown.
- `ALIYUN_DISK_UNKNOWN`: Aliyun ECS disk class/usage is not confirmed for candidate hosts.
- `LOW_MEMORY_WORKER_RISK`: 1 GiB worker candidates can OOM under audit/report workloads.
- `PUBLIC_WEB_COLOCATION_RISK`: adding workers to `HK-ALIYUN-01` can harm public latency and stability.
- `FERMATMIND_COLLISION_RISK`: PM2/Nginx/Supervisor/Redis/cron/deploy roots must not cross with FermatMind.
- `TENCENT_SUNSET_RISK`: Tencent resources expire around August/September and must not become new 123Charts dependencies.
- `LOG_BACKUP_UNKNOWN`: no live proof of logrotate, backup retention, or restore ownership.

## 18. Required human confirmations

- Approve read-only SSH inventory if exact live server capacity is required.
- Confirm Aliyun Shanghai launch-advisor instance ownership and whether the three candidates are free for 123Charts roles.
- Confirm Aliyun disk class/usage and OS family for `HK-ALIYUN-01`, `SH-ALIYUN-02`, `SH-ALIYUN-03`, and `SH-ALIYUN-04`.
- Confirm Tencent sunset/migration order before August/September expiries.
- Confirm no unobserved Tencent or Aliyun products contain retained FermatMind/123Charts dependencies.
- Confirm no FermatMind production host may be reused without explicit isolation proof and human approval.

## 19. Recommended next tasks

Next:

Approve read-only SSH inventory, then OPS-SERVER1.

`OPS-SERVER1 / Isolation Plan` should turn this scan into an exact role/runbook plan after live read-only facts are confirmed. Real server changes must wait for:

- `OPS-SERVER2 / Staging/Admin Host Prep`
- `OPS-SERVER3 / Worker/Audit Host Prep`

Both require explicit human approval before any server or cloud mutation.

## 20. What this scan did not do

- Did not deploy.
- Did not migrate.
- Did not run SSH commands.
- Did not open or use Workbench, Cloud Shell, or Cloud Assistant.
- Did not restart or reload PM2, Nginx, Redis, Supervisor, systemd, or cron.
- Did not modify cron.
- Did not create Linux users or directories.
- Did not edit env files.
- Did not read or print `.env`, private keys, tokens, DB URLs, Redis URLs, or cloud secrets.
- Did not modify databases, Redis, Supabase, DNS, security groups, firewalls, billing, instances, disks, or bandwidth.
- Did not stop, reboot, resize, renew, purchase, or delete cloud resources.
- Did not install packages.
- Did not write server files or upload files.
- Did not run migrations, crawlers, workers, or audits.
- Did not modify 123Charts, 88cn-index-data, fap-web, fap-api, or FermatMind repos.
- Did not commit, push, or open a PR.

## Final console values

Result: OPS_SERVER0R_PARTIAL_NEEDS_READONLY_SSH
Report path: /tmp/123charts-ops-server0r-capacity-readiness-scan.md
Servers covered: HK-ALIYUN-01, SH-ALIYUN-02, SH-ALIYUN-03, SH-ALIYUN-04, FermatMind do-not-touch resources, Tencent sunsetting resources
Cloud console observed: yes, partial; Aliyun ECS overview observed in this run, Tencent current run did not reach resource inventory and prior OPS-INFRA0Y console evidence was reused
Read-only SSH used: no
HK-ALIYUN-01 recommendation: keep 123Charts public web only
SH-ALIYUN-02 recommendation: conditional staging/admin/internal preview candidate after read-only SSH and owner/capacity confirmation
SH-ALIYUN-03 recommendation: conditional low-concurrency scout/import/canonical dry-run candidate only
SH-ALIYUN-04 recommendation: conditional queue/monitoring/backup/spare candidate; no heavy audit without stronger capacity
FermatMind do-not-touch confirmed: yes, from repo docs and OPS-INFRA0Y/1X/2X evidence
Tencent sunsetting confirmed: yes, from prior OPS-INFRA0Y evidence and user-stated August Tencent migration direction; current-run Tencent resource page did not finish loading
Main blockers: read-only SSH not authorized, Aliyun disk/OS/live service occupancy unknown, Tencent current-run resource page not re-observed, Shanghai candidate ownership/capacity needs confirmation
Recommended next task: Approve read-only SSH inventory, then OPS-SERVER1 / Isolation Plan
Repo changes: none by OPS-SERVER0R; current worktree has unrelated modified ops task/train metadata files plus an unrelated untracked OPS11A infra doc
Server/cloud changes: none
Secrets printed: no
