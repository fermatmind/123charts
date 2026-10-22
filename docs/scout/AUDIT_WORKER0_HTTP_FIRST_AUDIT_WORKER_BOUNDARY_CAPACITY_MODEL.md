# AUDIT_WORKER0 HTTP-first Audit Worker Boundary + Capacity Model

Status: validation passed
Task: PR173 / AUDIT_WORKER0
Result: GO_AUDIT_WORKER1_WITH_CONDITIONAL_CAPACITY
Date: 2026-06-20

## Result

PR173 defines the HTTP-first audit worker boundary and capacity model before any worker runtime, queue, external HTTP audit, browser fallback, deploy, or write.

Result: `GO_AUDIT_WORKER1_WITH_CONDITIONAL_CAPACITY`.

This task is docs/status/train metadata only. It does not start a worker, create Redis or queues, run external HTTP audits, run a crawler, add scripts, change packages, deploy, mutate server/cloud config, write Supabase, write staging or production databases, expose public pages, change sitemap, release Public API/MCP surfaces, mutate the data repo, or mutate FermatMind repos.

## Checkpoint

PR173 has `human_checkpoint=true`.

The user said `继续执行`, so PR173 proceeds only as a boundary and capacity model. This checkpoint resolution does not authorize:

- external HTTP audit;
- browser fallback;
- WAF or proxy bypass;
- server worker start;
- Redis or queue creation;
- server/cloud mutation;
- deployment;
- staging or production DB write;
- Supabase migration or write;
- public route, sitemap, Public API, MCP, or report surface;
- data repo mutation.

## HTTP-first Boundary

Future audit work must be HTTP-first by default.

Allowed future audit protocol only after a later explicit task permits a run:

- public project URLs only;
- `HEAD` or bounded `GET` requests only;
- no login, cookies, account sessions, saved browser profiles, or platform accounts;
- no private network, metadata endpoint, localhost, internal IP, or credential-bearing URL access;
- no WAF bypass, proxy evasion, CAPTCHA bypass, unusual probing, vulnerability scanning, or brute force;
- no full-site crawl;
- no permanent negative project claim from timeout, block, TLS, DNS, redirect, unsupported content, or rate-limit outcomes;
- preserve last successful snapshot and mark failed sources stale instead of zeroing scores.

Browser fallback is not part of PR173. Any browser fallback requires a later explicit checkpoint with exact target, reason, and no cookie/session export.

## Capacity Model

Default runtime capacity in PR173 is zero.

Future approved dry-runs must stay bounded:

| Dimension | PR173 default | Future upper bound without another split |
| --- | --- | --- |
| Worker processes | 0 | 1 low-concurrency worker only after approval |
| Queue backend | None | Local fixture list by default; staging queue only after explicit approval |
| Batch size | 0 | 20 jobs per run maximum |
| Concurrency | 0 | 3 maximum; 1 preferred on 1 GiB hosts |
| Request timeout | 0 | 8 seconds maximum |
| Retries | 0 | 3 attempts maximum including the initial attempt |
| Host cooldown | Not running | Required before repeated access to the same host |
| Output | Docs/status only | `/tmp` artifact only unless a later task approves committed fixtures |
| Production write | Forbidden | Forbidden |

No 100-row, 1000-row, 2000-row, 5000-row, 10000-row, full-database, broad-crawl, continuous audit, or production crawler run is approved.

## Placement Constraints

OPS-INFRA2X remains the placement source of truth.

| Target | Status | PR173 decision |
| --- | --- | --- |
| `HK-ALIYUN-01` | 123Charts public web only | Audit worker, crawler, queue, staging/admin, and heavy jobs are forbidden. |
| FermatMind production web/API/DB/Redis | Do-not-touch for 123Charts workers | No shared worker, queue, Redis, DB, or API use. |
| Tencent resources | Migration-source/sunsetting | No new 123Charts audit workload placement. |
| `SH-ALIYUN-02` | Conditional staging/admin candidate; possible audit candidate only if unused and capacity confirmed | Not placement-ready in PR173. Future audit use requires owner/capacity confirmation and isolation proof. |
| `SH-ALIYUN-03` | Conditional low-concurrency scout candidate | Not approved for audit worker placement. |
| `SH-ALIYUN-04` | Conditional queue/monitoring/backup/spare candidate with 1 GiB-class caution | Tiny fixture/spare consideration only after explicit approval; no heavy audit. |
| New/upgraded Aliyun worker host | Future option | Required if the approved audit capacity exceeds confirmed Shanghai candidate headroom. |

Heavy audit is not approved on 1 GiB candidate hosts.

## Queue Boundary

PR173 does not create Redis, queues, workers, or consumers.

A later queue task must define:

- exact queue backend;
- exact server placement;
- owner and capacity confirmation;
- isolation from public web and FermatMind production;
- queue namespace and dead-letter policy;
- max jobs per run;
- max concurrency;
- retry and stale-source handling;
- redacted log retention;
- rollback and kill procedure;
- proof of no public surface, sitemap, Public API, MCP, data repo, or production write effect.

Until then, audit planning may use docs or local fixture lists only.

## Failure Taxonomy

Future audit output must classify failures without making permanent negative claims:

| Class | Meaning | Required handling |
| --- | --- | --- |
| `dns_error` | DNS lookup failed | Mark source stale or blocked for retry; do not zero scores. |
| `tls_error` | TLS handshake or certificate issue | Record as technical access issue only. |
| `timeout` | Request exceeded timeout | Retry within limits, then mark stale. |
| `rate_limited` | Remote host signals throttling | Cool down; do not retry aggressively. |
| `blocked_by_policy` | Robots, headers, or policy deny access | Respect block; no bypass. |
| `blocked_by_waf` | WAF/CAPTCHA/bot block | Stop; no bypass or proxy evasion. |
| `redirect_limit` | Redirect chain exceeds limit | Mark unsupported for this run. |
| `unsupported_content` | Non-HTML or unsupported payload | Skip without negative project claim. |
| `unavailable` | 4xx/5xx or transient outage | Preserve last successful snapshot if present. |

## PR174 Handoff

PR174 / AUDIT_WORKER1 may proceed only as a fixture/local small-batch dry-run by default.

PR174 must not perform real external HTTP audit unless a separate explicit checkpoint approves:

- exact input scope;
- exact target URLs;
- exact command or runner;
- no worker start unless approved;
- no queue/Redis unless approved;
- batch size, concurrency, timeout, retry, cooldown, and stop conditions;
- no production/staging write;
- no public route, sitemap, Public API, MCP, report surface, or data repo effect;
- redacted logs and `/tmp` artifact boundaries.

## What This PR Does Not Do

- Does not start a worker.
- Does not create Redis or queues.
- Does not run external HTTP audit.
- Does not use a browser.
- Does not run a crawler.
- Does not add scripts, runtime code, packages, schemas, or migrations.
- Does not deploy or mutate server/cloud config.
- Does not write Supabase, staging, or production databases.
- Does not expose public pages, sitemap entries, Public API fields, or MCP tools.
- Does not commit generated artifacts.
- Does not mutate the data repo.
- Does not mutate FermatMind repos.
