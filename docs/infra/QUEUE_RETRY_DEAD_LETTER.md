# PR197 Queue Retry Dead-letter

Result: QUEUE_RETRY_DEAD_LETTER_READY_LOCAL_ONLY
Date: 2026-06-21

## Worker Repo Change

| Field | Value |
| --- | --- |
| repository | `fermatmind/88cn-scout-worker` |
| worker PR | `https://github.com/fermatmind/88cn-scout-worker/pull/4` |
| worker branch | `codex/pr197-queue-retry-dead-letter` |
| worker commit | `ee44871` |
| local path | `/Users/rainie/Desktop/GitHub/88cn-scout-worker` |

## Implemented Capabilities

Worker PR #4 adds local-only queue/retry/dead-letter support:

- queue job contract;
- dead-letter contract;
- bounded retry policy;
- `max_attempts <= 3`;
- `default_concurrency <= 3`;
- per-domain cooldown requirement for audit jobs;
- dead-letter-required default;
- failed item quarantine event;
- local dry-run queue adapter;
- future Redis adapter interface-only contract;
- fixture and no-dependency Node test.

## Boundary

PR197 remains local-only. It does not add:

- Redis client or connection;
- shared Redis;
- FermatMind Redis;
- Tencent Redis;
- unbounded retry;
- background daemon;
- server deployment;
- database writes;
- Supabase connection;
- staging or production writes;
- package metadata or dependencies;
- external HTTP;
- runtime start;
- secrets or env reads.

## Validation Evidence

Worker repo:

- `node tests/queue/local-queue-adapter.test.mjs`
- `node tests/audit/http-audit-worker.test.mjs`
- `node tests/canonical/canonical-resolver.test.mjs`
- `node tests/import/import-worker.test.mjs`
- contracts JSON parse
- `package.json` absent
- `package-lock.json` absent
- `node_modules` absent
- `git diff --check`

123Charts:

- `npm run agent:scope:check -- PR197`
- `npm run agent:redact:check`
- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- `git diff --check`

## Next

Continue to `PR198 / WORKER_QA` only after worker PR #4 and this 123Charts tracking PR merge.

Stop after PR198. Do not start PR199.
