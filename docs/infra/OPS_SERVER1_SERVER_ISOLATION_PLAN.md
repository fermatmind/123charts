# OPS-SERVER1 Server Isolation Plan v0

Status: validation passed
Task: PR187 / SERVER_ISOLATION_PLAN
Result: SERVER_ISOLATION_PLAN_READY
Date: 2026-06-21

## Result

PR187 refreshes the server isolation plan after PR186 was verified as already covered by merged PR #224 / OPS-SERVER0R.

Result: `SERVER_ISOLATION_PLAN_READY`.

This is a docs/runbook-only PR. It does not use SSH, open cloud consoles, deploy, restart, reload, create users, create directories, edit env files, read secrets, change security groups, change DNS, resize resources, write server files, start workers, create queues, write Supabase, mutate production, mutate `/Users/rainie/Desktop/88cn-index-data`, or touch FermatMind resources.

## PR186 Equivalence Check

PR186 / SERVER_CAPACITY_READINESS is skipped under the goal rule because the equivalent OPS-SERVER0R task is already merged.

Evidence:

- GitHub PR: `#224`
- Title: `docs: add OPS-SERVER0R capacity readiness scan`
- Merge commit: `55a4336266e508f0d88a95ce4b1ef803b63cf4ae`
- Report: `docs/infra/OPS_SERVER0R_123charts_SERVER_CAPACITY_READINESS_SCAN.md`

OPS-SERVER0R satisfies PR186's read-only capacity checklist:

- documents `HK-ALIYUN-01`, `SH-ALIYUN-02`, `SH-ALIYUN-03`, `SH-ALIYUN-04`, FermatMind do-not-touch resources, and Tencent sunsetting resources;
- records CPU, memory, network, disk-known/unknown, PM2/Nginx/Redis/Supervisor/cron-known/unknown, logs, backups, and candidate-role posture;
- explicitly records no SSH, no console mutation, no server write, no secret read, no deploy, no cloud mutation, no database write, no Supabase write, and no repository mutation;
- preserves blockers as `OPS_SERVER0R_PARTIAL_NEEDS_READONLY_SSH`, `ALIYUN_DISK_UNKNOWN`, `LOG_BACKUP_UNKNOWN`, and ownership/capacity confirmation gaps.

PR187 therefore consumes OPS-SERVER0R as input and does not re-run server inventory.

## Source Inputs

- `docs/infra/OPS_SERVER0R_123charts_SERVER_CAPACITY_READINESS_SCAN.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/infra/OPS_INFRA2X_123charts_STAGING_WORKER_PLACEMENT_DECISION.md`
- `docs/scout/BULK_IMPORT_CONTRACT.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/roadmap.json`
- `ops/trains/batches.json`

## Isolation Principle

Shared hardware is allowed. Shared risk is not allowed.

Any future host preparation must satisfy all of these boundaries:

- one role per app root;
- one Linux user per role family;
- one PM2 app name per process;
- one log directory per role;
- one env path per role;
- one queue namespace per worker family;
- no public web host worker colocation;
- no FermatMind production host colocation;
- no Tencent placement for new 123Charts workload;
- no raw private values in docs, PR bodies, logs, scripts, or status files.

## Role Matrix

| Alias | Current status | Allowed role | Forbidden role | PR187 decision |
| --- | --- | --- | --- | --- |
| `HK-ALIYUN-01` | 123Charts public web host by prior deploy and OPS-SERVER0R evidence | Public web only | Staging admin, scout/import worker, canonical worker, audit worker, queue, Redis, crawler, heavy report generation, FermatMind colocation | Keep public web only. |
| `SH-ALIYUN-02` | Conditional Shanghai candidate, 2 vCPU / 4 GiB class, disk/live services unknown | Staging/admin/internal preview candidate after confirmation | Public web, production worker, heavy audit before capacity proof, FermatMind production | Candidate for PR188 only after human approval and reversible prep plan. |
| `SH-ALIYUN-03` | Conditional Shanghai candidate, 2 vCPU / 1 GiB class, disk/live services unknown | Low-concurrency scout/import/canonical dry-run worker candidate after confirmation | Heavy audit, public web, production crawler, shared FermatMind queue | Candidate for PR189 low-concurrency worker only after human approval and strict caps. |
| `SH-ALIYUN-04` | Conditional Shanghai candidate, 2 vCPU / 1 GiB class, disk/live services unknown | Queue/monitoring/backup/spare or tiny audit dry-run candidate after confirmation | Heavy audit, public web, production Redis without separate approval | Candidate only with capacity confirmation and queue/log isolation. |
| `FAP-API-ALIYUN-01` | FermatMind API/Ops/queue production | FermatMind only | Any 123Charts workload | Do-not-touch. |
| `FAP-WEB-NODE1` | FermatMind public frontend production | FermatMind only | Any 123Charts workload | Do-not-touch. |
| Tencent resources | FermatMind migration-source / sunsetting resources | Migration-source only | New 123Charts workload | Do-not-touch for new placement. |

## User And Directory Plan

Recommended future users:

```text
123charts-web
123charts-admin
123charts-worker
123charts-audit
```

Recommended future app roots:

```text
/opt/apps/123charts-web
/opt/apps/123charts-admin
/opt/apps/88cn-scout-worker
/opt/apps/123charts-audit-worker
```

Recommended future log roots:

```text
/var/log/123charts/web
/var/log/123charts/admin
/var/log/123charts/scout-worker
/var/log/123charts/audit-worker
```

Rules:

- PR187 creates none of these users or directories.
- Future prep must not place worker temp files under a public web root.
- Future prep must not share release symlinks across roles.
- Future prep must not share env files across roles.
- Future prep must not place 123Charts files under FermatMind app roots.

## Process Plan

Recommended future PM2 names:

```text
123charts-web
123charts-staging-admin
88cn-scout-worker
123charts-audit-worker
```

Rules:

- PM2 app names must be unique.
- PM2 cwd must be role-local.
- PM2 logs must be role-local.
- Worker apps require `max_memory_restart`.
- Worker apps require explicit concurrency caps.
- Restart/reload commands must target only the named 123Charts app.
- A 123Charts rollback must never restart FermatMind apps or queues.

PR187 does not add PM2 files or run PM2.

## Network And Public Exposure Plan

Staging/admin:

- default access is private/internal only;
- no public admin exposure without an explicit access policy;
- no sitemap, robots, Public API, MCP, task, alternative, collection, or report exposure.

Scout/import/canonical worker:

- no public listener by default;
- no crawler or external HTTP runtime by default;
- no production write;
- no public projection;
- no public log output.

Audit worker:

- no browser fallback;
- no WAF bypass;
- no proxy evasion;
- no login wall bypass;
- no cookie/session export;
- no broad crawl;
- no heavy audit on 1 GiB candidates.

## Queue And Redis Plan

Default: no queue or Redis is created by PR187.

If a later approved PR introduces queue/Redis, it must use separate namespaces:

```text
123charts:scout:*
123charts:audit:*
123charts:report:*
```

Rules:

- no shared FermatMind queue;
- no shared retry queue;
- no shared dead-letter queue;
- no shared consumer group;
- no Tencent Redis for new 123Charts workload;
- no production Redis without a separate approval and rollback plan.

## Required Human Confirmations Before PR188 / PR189 Actions

Before PR188 / STAGING_ADMIN_HOST_PREP can perform server prep:

- confirm `SH-ALIYUN-02` ownership and that it is free for 123Charts staging/admin;
- confirm disk class/usage and OS family;
- confirm live PM2/Nginx/Supervisor/cron occupancy or approve read-only SSH inventory;
- confirm internal access path;
- confirm rollback path for every server file or service change;
- confirm no FermatMind production collision.

Before PR189 / WORKER_AUDIT_HOST_PREP can perform server prep:

- confirm `SH-ALIYUN-03` and `SH-ALIYUN-04` ownership and capacity;
- confirm whether a stronger Aliyun host is needed for audit;
- confirm memory, disk, logs, backup, and process headroom;
- approve exact worker concurrency and memory caps;
- approve queue namespace or confirm no queue will be created;
- confirm no Tencent placement and no FermatMind production colocation.

## PR188 Handoff

PR188 may proceed only if the task-specific human checkpoint is still active and exact actions are bounded.

Allowed direction:

- prepare staging/admin host artifacts or server-side setup only within PR188 scope;
- keep changes reversible;
- do not add public web load;
- do not touch FermatMind production;
- do not use Tencent for new workload;
- do not deploy production.

Blocked until confirmed:

- any unbounded server write;
- any production public-web change;
- any secret value printout;
- any shared user/root/app/log/env path;
- any resource resize, purchase, stop, restart, or deletion outside explicit PR188 scope.

## PR189 Handoff

PR189 may proceed only after PR188 closes or is intentionally bypassed by an explicit sequence decision.

Allowed direction:

- prepare worker/audit host boundary only within PR189 scope;
- keep worker off `HK-ALIYUN-01`;
- keep worker off FermatMind production resources;
- keep worker off Tencent resources;
- require strict memory/concurrency/log caps.

Blocked until confirmed:

- real crawler runtime;
- broad external HTTP audit;
- Redis/queue creation without scoped approval;
- worker start beyond prep scope;
- heavy audit on 1 GiB hosts.

## No-Action Confirmation

PR187 performs no live action:

- SSH: no.
- Cloud console mutation: no.
- Server write: no.
- Deploy: no.
- Service restart/reload: no.
- User or directory creation: no.
- Env or secret read: no.
- Database/Supabase write: no.
- Redis/queue creation: no.
- Worker/crawler/audit runtime: no.
- Public route/sitemap/API/MCP change: no.
- Data repo mutation: no.
- FermatMind resource mutation: no.

## Validation Evidence

Passing validations:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-SERVER-READINESS`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-SERVER-PREP`
- `npm run agent:scope:check -- PR187`
- `npm run lint`
- `npm run typecheck`
- `node scripts/check-landscape-boundary.mjs`
- `npm run landscape:check`
- `node scripts/check-sector-density-boundary.mjs`
- `node scripts/check-task-discovery-boundary.mjs`
- `node scripts/check-alternatives-canonical.mjs`
- `npm run build`
- `npm run agent:gate`
- `git diff --check`

## Next

After PR187 merges, continue to PR188 / STAGING_ADMIN_HOST_PREP.

PR188 has `human_checkpoint=true` and `server_change_allowed=true`; it must start from clean `origin/main`, re-read current scope, and fix the existing allowed/forbidden `deploy/**` registry conflict before any scoped host prep can pass validation.
