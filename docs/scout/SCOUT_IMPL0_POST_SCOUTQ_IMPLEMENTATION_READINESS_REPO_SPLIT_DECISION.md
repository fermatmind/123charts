# SCOUT_IMPL0 Post-SCOUTQ Implementation Readiness + Repo Split Decision v0

Status: validation passed
Task: PR146 / SCOUT_IMPL0
Result: GO_SCOUT_IMPL1
Date: 2026-06-20

## Result

PR146 approves the next step as a persistence-boundary task only: `PR147 / SCOUT_IMPL1`.

This PR is a readiness and repo-split decision. It does not implement scout runtime, create a package, create a repository, add a dependency, create a migration, write staging data, start a worker, create Redis/queue infrastructure, or expose scouted records to any public surface.

## Decision Matrix

| Question | Decision | Reason |
| --- | --- | --- |
| Can implementation remain in 123Charts for docs/contracts/local dry-run? | Yes. | The next steps are boundary, storage checkpoint, local dry-run, and QA. They can remain in the 123Charts control repo as docs/status metadata until an actual worker/runtime is approved. |
| Should future worker runtime move to a future `88cn-scout-worker` repo or package? | Yes, evaluate later. | A real worker would have separate runtime, queue, egress, logs, capacity, and deployment risk. It should not be mixed into public web without a later checkpointed worker decision. |
| Is new repo creation needed now? | No. | PR146 is decision-only. New repo/package creation would require a later human checkpoint and explicit implementation task. |
| Is staging sandbox write allowed now? | No. | OPS-INFRA2X did not authorize staging writes. PR149 can only default to local-only unless a later checkpoint is satisfied. |
| Is Supabase migration allowed now? | No. | PR148 may decide migration requirements, but PR146 does not create schema or migration files. |
| Is Redis/queue allowed now? | No. | Redis/queue remains a later AUDIT_IMPL checkpoint and is not needed for PR147. |
| Is server worker allowed now? | No. | Worker placement is conditional and no server/capacity confirmation has authorized a worker start. |
| Should local-only remain default? | Yes. | Local-only and `/tmp` output remain the safe default until storage and staging checkpoints are explicitly passed. |
| What is the exact next task? | `PR147 / SCOUT_IMPL1`. | Define the scouted sandbox persistence boundary before storage, migration, dry-run, audit, or report work. |

## Repo Split Decision

Decision: `KEEP_BOUNDARY_WORK_IN_123Charts_NOW`.

Rationale:

- PR147 and PR148 are policy and checkpoint tasks.
- PR149 defaults to local-only dry-run and does not require a worker repo.
- PR150 is QA-only.
- No approved runtime exists yet.
- No approved queue, Redis, staging write, Supabase migration, or worker placement exists yet.

Future condition for a separate `88cn-scout-worker` package or repo:

- a later task approves worker runtime;
- OPS-INFRA2X placement is confirmed by human owner/capacity review;
- queue/Redis or equivalent job orchestration is approved;
- logs, memory, timeout, concurrency, and retry boundaries are enforced;
- no public web host, FAP production host, or Tencent resource is used;
- data contracts prevent public surface leakage.

## Handoff To PR147

`PR147 / SCOUT_IMPL1` should define:

- private-by-default persistence posture;
- allowed future scouted fields;
- denied future scouted fields;
- sandbox lifecycle states;
- no public frontend, sitemap, Public API, MCP, `/landscape`, `/tasks`, alternatives, or public report leakage;
- no data repo storage;
- no PII;
- no competitor description copying;
- staging-only possibility only as a later checkpoint.

## Stop Conditions Carried Forward

- No new repo.
- No package creation.
- No dependency.
- No runtime code.
- No migration.
- No Supabase write.
- No staging write.
- No Redis or queue.
- No server worker.
- No crawler.
- No public report page.
- No sitemap inclusion.
- No data repo mutation.
- No FermatMind repo mutation.

## Validation Results

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run agent:scope:check -- PR146` | PASS |
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

- Does not start PR147 implementation beyond handoff.
- Does not create a new repository or package.
- Does not add dependencies.
- Does not modify runtime/product code.
- Does not create migrations or schema files.
- Does not write Supabase.
- Does not write staging or production data.
- Does not create Redis or queues.
- Does not start workers or crawlers.
- Does not create public pages, sitemap entries, Public API, or MCP surfaces.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not modify FermatMind repos.
