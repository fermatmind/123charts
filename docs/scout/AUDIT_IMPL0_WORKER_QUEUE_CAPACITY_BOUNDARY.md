# AUDIT_IMPL0 Audit Worker Queue Boundary + Capacity Model v0

Status: validation passed
Task: PR151 / AUDIT_IMPL0
Result: GO_AUDIT_IMPL1_WITH_CONDITIONAL_CAPACITY
Date: 2026-06-20

## Result

PR151 defines the audit worker queue and capacity boundary before any worker runtime, Redis/queue creation, server placement, or external audit.

Result: `GO_AUDIT_IMPL1_WITH_CONDITIONAL_CAPACITY`.

This PR does not start a worker, create Redis queues, run external HTTP audits, create scripts, change packages, deploy, mutate cloud/server config, write Supabase, write staging or production databases, expose public pages, change sitemap, release Public API/MCP surfaces, mutate the data repo, or mutate FermatMind repos.

## Infrastructure Placement Boundary

OPS-INFRA2X remains the placement source of truth.

| Surface | Decision | Audit implication |
| --- | --- | --- |
| `HK-ALIYUN-01` | Public web only. | No audit worker, queue, crawler, or batch job. |
| FermatMind production web/API/DB/Redis | Do not touch for 123Charts workers. | No shared audit workload, no queue, no Redis use. |
| Tencent resources | Migration-source/sunsetting; no new 123Charts workload. | No audit worker placement. |
| `SH-ALIYUN-02` | Conditional staging/admin candidate pending owner and capacity confirmation. | May only be considered by a later approved task. |
| `SH-ALIYUN-03` | Conditional low-concurrency scout dry-run candidate pending owner/capacity confirmation and limits. | Candidate for fixture/local or very small dry-run only after approval. |
| `SH-ALIYUN-04` | Conditional queue/monitoring/backup/spare candidate with caution. | Queue/monitoring needs separate approval; no Redis/queue creation now. |

Heavy audit is not approved on 1 GiB candidate hosts. Any placement that lacks confirmed ownership, memory, CPU, disk, network egress, and isolation remains blocked.

## Capacity Model

Default capacity for this train is zero runtime capacity because no worker is started.

Future approved local or staging dry-run limits must be bounded:

| Dimension | Default for this PR | Future upper bound without another task split |
| --- | --- | --- |
| Runtime workers | 0 | 1 low-concurrency worker after approval only |
| Queue backend | None | Local fixture list or explicitly approved staging queue only |
| Batch size | 0 | 20 jobs per run maximum |
| Concurrency | 0 | 3 maximum; 1 preferred on 1 GiB hosts |
| Timeout | 0 | 8 seconds per request maximum |
| Retries | 0 | 3 attempts maximum including initial attempt |
| Host cooldown | Not running | Required before any repeated host access |
| Output | Docs only | `/tmp` artifact only unless a later fixture task approves committed fixtures |
| Production write | Forbidden | Forbidden |

No 2000, 5000, 10000, full-database, broad-crawl, or continuous audit run is approved.

## Queue Boundary

No Redis or durable queue is created in PR151.

A later queue task must define:

- exact queue backend;
- exact server placement;
- owner and capacity confirmation;
- isolation from public web and FermatMind production;
- max jobs per run;
- max concurrency;
- retry and dead-letter rules;
- stale snapshot handling;
- no zeroing of previous successful data on failed scans;
- rollback and stop procedure;
- log retention and redaction;
- no production database write unless a later production task approves it.

Until then, audit planning may use docs or local fixture lists only.

## Egress Boundary

Any future audit egress must carry forward the earlier AUDIT boundaries:

- public URLs only;
- robots-aware handling;
- no login, cookies, browser session export, platform account use, or WAF/proxy bypass;
- no unusual probing;
- no private networks or metadata endpoints;
- no full-site crawl;
- no external HTTP batch audit unless fixture-only or separately checkpointed;
- classify blocked, unavailable, timeout, DNS, TLS, redirect, unsupported content, and rate-limit outcomes without turning them into permanent negative claims.

## Stop Conditions

Future audit work must stop on:

- missing placement confirmation;
- request for `HK-ALIYUN-01` worker placement;
- request for FermatMind production host, DB, Redis, or API use;
- request for Tencent worker placement;
- request for Redis/queue creation without checkpoint;
- request for external HTTP batch audit without checkpoint;
- request for production database write;
- request for public page, sitemap, Public API, MCP, or data repo mutation;
- request for new dependency, package change, deploy, server restart, or cloud mutation.

## Handoff To PR152

`PR152 / AUDIT_IMPL1` may document a local fixture dry-run by default. If it needs a low-concurrency staging/server audit run, it must keep the checkpoint explicit and must not perform heavy audit, broad crawl, production write, public exposure, Public API/MCP release, data repo mutation, or FermatMind production use.

## Validation Results

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run agent:scope:check -- PR151` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/check-landscape-boundary.mjs` | PASS |
| `npm run landscape:check` | PASS |
| `node scripts/check-sector-density-boundary.mjs` | PASS |
| `node scripts/check-task-discovery-boundary.mjs` | PASS |
| `node scripts/check-alternatives-canonical.mjs` | PASS |

## What This PR Does Not Do

- Does not start a worker.
- Does not create Redis or queues.
- Does not run external HTTP audit.
- Does not add scripts, runtime code, packages, schemas, or migrations.
- Does not deploy or mutate server/cloud config.
- Does not write Supabase, staging, or production databases.
- Does not expose public pages, sitemap entries, Public API fields, or MCP tools.
- Does not mutate the data repo.
- Does not mutate FermatMind repos.
