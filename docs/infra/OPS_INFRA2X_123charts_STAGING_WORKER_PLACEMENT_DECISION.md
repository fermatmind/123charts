# OPS-INFRA2X 123Charts Staging / Worker Placement Decision v0

Status: validation passed
Task: OPS-INFRA2X
Result: GO_SCOUT_IMPL0_WITH_CONDITIONAL_PLACEMENT
Date: 2026-06-20

## Result

OPS-INFRA2X converts the OPS-INFRA0X inventory, OPS-INFRA0Y cloud/FermatMind read-only completion, and OPS-INFRA1X shared-server isolation runbook into a concrete conditional placement decision for future 123Charts staging/admin, scout worker, audit worker, and queue/monitoring/backup workloads.

Result: `GO_SCOUT_IMPL0_WITH_CONDITIONAL_PLACEMENT`.

Meaning:

- `SCOUT_IMPL0` may proceed as a readiness and repo-split decision task.
- Actual staging, worker, queue, Redis, Supabase, and server use remains conditional.
- No server placement is executed by OPS-INFRA2X.
- No worker starts.
- No staging write starts.
- No Redis/queue is authorized.
- No Supabase migration is authorized.

Core principle:

Shared hardware is allowed. Shared risk is not allowed.

## Scope

In scope:

- Placement decision matrix for future 123Charts public web, staging/admin, scout worker, audit worker, and queue/monitoring/backup/spare roles.
- Server boundary decisions for `HK-ALIYUN-01`, `FAP-API-ALIYUN-01`, `FAP-WEB-NODE1`, Tencent resources, and Shanghai Aliyun candidate aliases.
- Human confirmation list before any real placement or implementation.
- `SCOUT_IMPL0` handoff checklist.
- Docs/status/roadmap updates only.

Out of scope:

- Deployment.
- SSH.
- Server restart.
- Nginx reload.
- PM2 restart.
- Redis write.
- Database write.
- Supabase write.
- Cloud resource modification.
- DNS or security group modification.
- `.env` edit.
- Secret printing.
- Private key reading.
- FermatMind repo modification.
- Runtime/product code changes.
- `/Users/rainie/Desktop/88cn-index-data` mutation.
- User/directory creation.
- Worker or crawler start.
- Staging write.
- Final placement without human confirmation.

## Source Inputs

- `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md`
- `docs/infra/OPS_INFRA0Y_CLOUD_FERMATMIND_READONLY_INVENTORY_COMPLETION.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/TASK_STATUS.md`
- `docs/SIDECAR_ISSUES.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`

OPS-INFRA1X is the immediate policy source of truth.

## Decision Basis

Key facts carried forward:

- `HK-ALIYUN-01` is 123Charts public web only.
- `FAP-API-ALIYUN-01` is FermatMind API/Ops/queue production and is do-not-touch for 123Charts worker placement.
- `FAP-WEB-NODE1` is FermatMind production web and is do-not-touch for 123Charts worker placement.
- Tencent resources are sunsetting / migration source only and must not receive new 123Charts workloads.
- `SH-ALIYUN-02` is a 2 vCPU / 4 GiB class private-IP-only Shanghai candidate; ownership/capacity needs human confirmation.
- `SH-ALIYUN-03` is a 2 vCPU / 1 GiB class private-IP-only Shanghai candidate; ownership/capacity needs human confirmation.
- `SH-ALIYUN-04` is a 2 vCPU / 1 GiB class private-IP-only Shanghai candidate; ownership/capacity needs human confirmation.
- Private server read-only scan still needs separate human authorization if exact live process/resource facts are required.

Because no private read-only SSH was authorized for OPS-INFRA2X, this report does not claim final server readiness. It records conditional candidates and required confirmations.

## Placement Decision Matrix

| future_workload | recommended_server_alias | decision_status | reason | required_before_use | forbidden_colocation |
| --- | --- | --- | --- | --- | --- |
| 123Charts public web | `HK-ALIYUN-01` | KEEP_CURRENT_PUBLIC_WEB_ONLY | Current public web host is already dedicated to public Next.js web, sitemap/robots, Nginx public vhost, PM2 `123charts-web`, and live smoke. | Keep public-web-only boundary; do not add worker/queue/staging load. | Scout worker, audit worker, crawler, large batch jobs, Redis queue, heavy report generation, staging admin, FermatMind production. |
| 123Charts staging admin / internal preview | `SH-ALIYUN-02` | CONDITIONAL_CANDIDATE_SH_ALIYUN_02 | Strongest observed non-production Shanghai candidate at 2 vCPU / 4 GiB class; private-IP-only posture can fit internal staging if later access path is approved. | OPS-INFRA1X isolation, human owner confirmation, capacity confirmation or read-only scan, separate Linux user, app root, PM2 name, env path, logs, no FermatMind production conflict. | `HK-ALIYUN-01`, `FAP-API-ALIYUN-01`, `FAP-WEB-NODE1`, Tencent resources, shared app/env/log roots. |
| 123Charts scout worker | `SH-ALIYUN-03` | CONDITIONAL_LOW_CONCURRENCY_SCOUT_CANDIDATE | 2 vCPU / 1 GiB class can only be considered for low-concurrency local/staging scout dry-run, not production crawler load. | OPS-INFRA1X isolation, explicit concurrency cap, memory limit, logrotate, queue namespace, owner/capacity confirmation, no public route effect, no Supabase production write. | `HK-ALIYUN-01`, `FAP-API-ALIYUN-01`, `FAP-WEB-NODE1`, Tencent resources, public web roots, FermatMind production. |
| 123Charts audit worker | `SH-ALIYUN-02` if unused by staging admin; otherwise new/upgraded Aliyun worker host; `SH-ALIYUN-04` only for tiny dry-run/spare | CONDITIONAL_AUDIT_PLACEMENT_NEEDS_CAPACITY_CONFIRMATION | Audit worker is higher risk than scout; observed 1 GiB candidates are not approved for heavy audit. | AUDIT_IMPL0 capacity model, egress politeness policy, per-domain cooldown, global rate limit, worker memory limit, log cap, blocked_by_waf failure taxonomy, no WAF bypass, no proxy evasion, owner/capacity confirmation. | `HK-ALIYUN-01`, `FAP-API-ALIYUN-01`, `FAP-WEB-NODE1`, Tencent resources, heavy audit on 1 GiB candidates. |
| Queue / monitoring / backup / spare | `SH-ALIYUN-04` | CONDITIONAL_QUEUE_MONITORING_BACKUP_CANDIDATE | 1 GiB memory requires caution; candidate is suitable only after confirming ownership/capacity and applying Redis/log/backup isolation. | OPS-INFRA1X Redis/log/backup isolation, human owner/capacity confirmation, retention/logrotate policy, backup path isolation, no production Redis until implementation approval. | FAP Redis, Tencent Redis, public web host, shared queue names, shared dead-letter/retry queues, logs/backups containing secrets or PII. |

## Server Boundary Matrix

| server_alias | current_role | allowed_future_role | forbidden_role | decision |
| --- | --- | --- | --- | --- |
| `HK-ALIYUN-01` | 123Charts public web | 123Charts public web only | Scout worker, audit worker, crawler, queue, heavy report generation, staging admin, FermatMind colocation | Keep as public web only. Worker and staging/admin placement forbidden. |
| `FAP-API-ALIYUN-01` | FermatMind API/Ops/queue production | FermatMind production only | 123Charts scout/audit worker, 123Charts queue, 123Charts Redis, 123Charts cron, 123Charts deploy path, 123Charts staging admin | Do-not-touch. No 123Charts worker placement. |
| `FAP-WEB-NODE1` | FermatMind production public web | FermatMind production web only | 123Charts worker, 123Charts queue, crawler, staging admin | Do-not-touch. No 123Charts worker placement. |
| Tencent resources | FermatMind migration-source / sunsetting resources and managed dependencies | Migration source / sunsetting only | Any new 123Charts workload | No new 123Charts workload. |
| `SH-ALIYUN-02` | Candidate Shanghai Aliyun instance | Conditional staging/admin candidate; possible audit candidate only if not used by staging and capacity is confirmed | Any live role before human confirmation and implementation approval | Conditional candidate only. |
| `SH-ALIYUN-03` | Candidate Shanghai Aliyun instance | Conditional low-concurrency scout dry-run candidate | Heavy audit, public web, production crawler, any live role before confirmation | Conditional low-concurrency scout candidate only. |
| `SH-ALIYUN-04` | Candidate Shanghai Aliyun instance | Conditional queue/monitoring/backup/spare; tiny audit dry-run only if separately approved | Heavy audit, public web, production Redis without approval, any live role before confirmation | Conditional queue/monitoring/backup candidate only. |

## Human Confirmation Matrix

| confirmation_needed | why_needed | blocks_what | required_before |
| --- | --- | --- | --- |
| `SH-ALIYUN-02` ownership/capacity | It is the strongest non-production candidate but ownership and live headroom were not confirmed by SSH. | Staging/admin use; any audit fallback use. | Any staging write, admin deployment, or audit worker placement. |
| `SH-ALIYUN-03` ownership/capacity | It is only 2 vCPU / 1 GiB class and may be insufficient even for low-concurrency scout without memory/log limits. | Scout worker use. | Any scout worker start or queue consumer. |
| `SH-ALIYUN-04` ownership/capacity | It is only 2 vCPU / 1 GiB class and may be insufficient for queue/monitoring/backup without memory/disk confirmation. | Queue/monitoring/backup/spare use; any tiny audit dry-run. | Any Redis/queue/log backup role. |
| Private read-only SSH if exact placement is required | Needed to confirm OS, users, PM2/Supervisor, Nginx, Redis, cron, disk, logs, backups, and headroom. | Final placement readiness. | Before claiming `PLACEMENT_READY_*` or starting implementation that touches servers. |
| Tencent sunset/migration timing | Tencent is sunsetting and production dependencies remain visible. | Any migration sequencing decision and no-new-workload enforcement. | Before any migration or expiry-sensitive operations. |
| FermatMind do-not-touch override if ever requested | FAP production web/API/DB/Redis are critical; sharing would create high risk. | Any 123Charts use of FermatMind production hosts or managed dependencies. | Human approval plus isolation proof; not authorized by OPS-INFRA2X. |

## 123Charts Public Web Decision

Decision: `KEEP_CURRENT_PUBLIC_WEB_ONLY`.

`HK-ALIYUN-01` remains the 123Charts public web host only. It may continue serving public web, Nginx public vhost, PM2 `123charts-web`, sitemap/robots, and live smoke. It must not receive scout worker, audit worker, crawler, large batch job, Redis queue, heavy report generation, or staging/admin load.

## Staging Admin Placement Decision

Decision: `CONDITIONAL_CANDIDATE_SH_ALIYUN_02`.

`SH-ALIYUN-02` is the preferred conditional candidate for 123Charts staging admin / internal preview because it is the strongest observed non-production Shanghai candidate. It is not placement-ready without human ownership/capacity confirmation and OPS-INFRA1X isolation application.

Required before use:

- Human confirmation of owner and intended role.
- Capacity confirmation or approved read-only server scan.
- Separate Linux user.
- Separate app root.
- Separate PM2 app name.
- Separate env path.
- Separate logs.
- No FermatMind production colocation conflict.
- Approved internal access path or later-approved proxy/VPN.

## Scout Worker Placement Decision

Decision: `CONDITIONAL_LOW_CONCURRENCY_SCOUT_CANDIDATE`.

`SH-ALIYUN-03` may be considered only for low-concurrency local/staging scout dry-run. It is not approved for production crawler load, public-route effects, or Supabase production writes.

Required before use:

- OPS-INFRA1X isolation applied.
- Explicit worker concurrency cap.
- Memory limit.
- Logrotate.
- Queue namespace if a queue is introduced later.
- No public web colocation.
- No FermatMind production colocation.
- Human confirmation of host ownership/capacity.

If capacity is insufficient, use `SH-ALIYUN-02` only if it is not used for staging admin, or provision/assign a stronger Aliyun worker host later. Do not recommend Tencent.

## Audit Worker Placement Decision

Decision: `CONDITIONAL_AUDIT_PLACEMENT_NEEDS_CAPACITY_CONFIRMATION`.

Audit is higher risk than scout. `SH-ALIYUN-02` may be considered only if it is not used for staging admin and capacity is confirmed. `SH-ALIYUN-04` is not approved for heavy audit because it is a 2 vCPU / 1 GiB class candidate; it can only be considered for tiny dry-run/spare after further confirmation. Long-running audit should use a new or upgraded Aliyun worker host if the capacity model requires it.

Required before use:

- `AUDIT_IMPL0` capacity model.
- Egress politeness policy.
- Per-domain cooldown.
- Global rate limit.
- Worker memory limit.
- Log cap.
- `blocked_by_waf` failure taxonomy.
- No WAF bypass.
- No proxy evasion.
- Human confirmation of host ownership/capacity.

Default restrictions:

- Do not run audit worker on `HK-ALIYUN-01`.
- Do not run audit worker on `FAP-API-ALIYUN-01`.
- Do not run audit worker on `FAP-WEB-NODE1`.
- Do not run audit worker on Tencent.
- Do not approve heavy audit on 1 GiB candidate hosts.

## Queue / Monitoring / Backup Decision

Decision: `CONDITIONAL_QUEUE_MONITORING_BACKUP_CANDIDATE`.

`SH-ALIYUN-04` is the conditional queue/monitoring/backup/spare candidate, but its 1 GiB memory class requires caution. OPS-INFRA2X does not authorize production Redis, queue creation, or queue consumers.

Rules:

- No production Redis until OPS-INFRA2X and later implementation approval.
- If Redis/queue is needed later, prefer managed Redis or isolated Redis with prefix policy.
- No shared FAP Redis.
- No Tencent Redis for new 123Charts workloads.
- Monitoring/log backup must not store secrets or PII.

Required before use:

- OPS-INFRA1X Redis/log/backup isolation applied.
- Human confirmation of host ownership/capacity.
- Retention/logrotate policy.
- Backup path isolation.

## Do-Not-Touch Summary

- `HK-ALIYUN-01`: public web only; no worker, crawler, queue, heavy report generation, or staging/admin.
- `FAP-API-ALIYUN-01`: FermatMind API/Ops/queue production; no 123Charts worker or deploy-path sharing.
- `FAP-WEB-NODE1`: FermatMind production public web; no 123Charts worker.
- Tencent resources: migration-source / sunsetting only; no new 123Charts workload.
- `TENCENT-MYSQL-PROD`: no direct 123Charts use or writes.
- `TENCENT-REDIS-PROD`: no direct 123Charts use or writes.
- `88cn-index-data`: no raw scout/audit/queue/PII storage.

## Tencent Sunsetting Summary

Tencent Cloud resources remain migration-source / sunsetting only. OPS-INFRA2X does not place staging, worker, queue, monitoring, backup, Redis, or managed DB workload on Tencent. Any future Tencent work must be a human-approved migration/sunset task, not a new 123Charts workload task.

## SCOUT_IMPL0 Handoff Checklist

| question | OPS_INFRA2X_answer | impact_on_SCOUT_IMPL0 |
| --- | --- | --- |
| Can `SCOUT_IMPL0` proceed? | Yes, as readiness/repo-split decision only. | It may evaluate implementation boundaries without starting workers or staging writes. |
| Should repo split be evaluated? | Yes. | `SCOUT_IMPL0` should decide whether scout/audit implementation belongs in 123Charts, a worker package, or another repo boundary. |
| Can staging sandbox write be considered? | Only as a future conditional path. | No staging write is authorized by OPS-INFRA2X. |
| Is worker placement final or conditional? | Conditional. | `SCOUT_IMPL0` must not start a worker; implementation must wait for human confirmation and approved placement. |
| Is Redis required now? | No. | No Redis/queue is authorized by OPS-INFRA2X. |
| Is Supabase migration allowed now? | No. | No Supabase migration or production write is authorized. |
| Should local-only remain default? | Yes. | Local-only remains the default until SCOUT_IMPL tasks approve staging behavior. |

## What This Task Does Not Do

- Does not deploy.
- Does not SSH.
- Does not restart services.
- Does not reload Nginx.
- Does not restart PM2.
- Does not modify Redis.
- Does not write databases.
- Does not write Supabase.
- Does not modify cloud resources.
- Does not change DNS or security groups.
- Does not edit `.env`.
- Does not print secrets.
- Does not read private key contents.
- Does not modify fap-web, fap-api, or FermatMind repos.
- Does not create users or directories.
- Does not start workers.
- Does not start crawlers.
- Does not perform staging writes.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not create runtime code.
- Does not start `SCOUT_IMPL0`, `SCOUT_IMPL1`, `AUDIT_IMPL`, `REPORT_IMPL`, `BETA1`, `I18N0`, `OPS10A`, or `PR101`.

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
| `npm run agent:scope:check -- OPS-INFRA2X` | PASS |
| `npm run task-discovery:check` | npm alias missing; direct checker passed |
| `npm run alternatives-canonical:check` | npm alias missing; direct checker passed |
| `npm run report-distribution:check` | npm alias missing |
