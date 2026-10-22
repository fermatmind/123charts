# WORKER1 Worker Repo Skeleton / No-runtime Bootstrap

Status: validation passed
Task: PR161 / WORKER1
Result: GO_WORKERQ_NO_RUNTIME_BOOTSTRAP
Date: 2026-06-20

## Result

PR161 resolves the no-runtime worker bootstrap checkpoint without creating a repository, package, workspace, dependency, worker source file, queue, crawler, audit runner, staging writer, deployment target, or server process.

Result: `GO_WORKERQ_NO_RUNTIME_BOOTSTRAP`.

Meaning:

- no physical `88cn-scout-worker` repo is created;
- no package or dependency is created;
- no worker runtime or worker code is introduced;
- the worker remains a future isolated boundary described by docs/contracts only;
- the exact next task is `PR162 / WORKERQ - Worker Repo Isolation QA v0`;
- Seed 100 work must not start until WORKERQ validates isolation.

## Scope

In scope:

- convert PR160 / WORKER0 boundary into a no-runtime bootstrap specification;
- define the future repository/package/workspace options;
- define the draft directory plan for a future isolated worker boundary;
- define the boundary README content for a future worker project;
- define ownership, interface, CI, and validation expectations;
- define hard stops before any future physical repo/package creation.

Out of scope:

- new GitHub repository creation;
- package creation;
- dependency installation;
- source-code implementation;
- worker runtime;
- crawler runtime;
- external HTTP audit;
- Supabase migration or write;
- staging or production DB write;
- Redis/queue creation;
- deploy, SSH, or cloud/server mutation;
- `.env` edit, secret read, or secret print;
- public route, sitemap, Public API, MCP, report page, or distribution surface;
- data repo mutation;
- FermatMind repo mutation;
- PR162, Seed 100, canonical resolver, staging, audit, report, Growth, BETA, I18N, OPS10A, or PR101 start.

## Source Inputs

Reviewed source inputs:

- `docs/infra/WORKER0_SCOUT_WORKER_BOUNDARY_CHAIN_READINESS.md`
- `docs/infra/ARCH0_WORKER_ARCHITECTURE_REPO_SPLIT_READINESS.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/infra/OPS_INFRA2X_123charts_STAGING_WORKER_PLACEMENT_DECISION.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

PR160 is the immediate source of truth. PR160 requires the worker/runtime boundary to remain outside the 123Charts public web runtime boundary and makes PR161 a checkpointed no-runtime bootstrap task.

## Checkpoint Decision

Decision: no physical repo/package/workspace is created in PR161.

Reason:

- the current goal does not authorize new GitHub repo creation;
- the current goal does not authorize new package creation;
- the current goal does not authorize dependency installation;
- PR161 can satisfy its safe path by documenting the skeleton specification and bootstrap plan only;
- physical creation can be reconsidered only in a later human checkpoint that names the exact destination and allowed write scope.

This resolves PR161's human-checkpointed risk by choosing the safe docs-only branch: `NO_RUNTIME_BOOTSTRAP_SPEC_ONLY`.

## Future Skeleton Option Matrix

| Option | Description | Current PR161 decision | Required before use |
| --- | --- | --- | --- |
| Separate GitHub repo | A future `88cn-scout-worker` repository outside the public web repo. | Not created. Preferred long-term runtime isolation option if approved later. | Human checkpoint, repo owner, branch protection, CI contract, secret policy, deploy boundary. |
| Isolated package/workspace | A future package under an approved workspace boundary. | Not created. Possible only if repo governance prefers a monorepo-style boundary. | Human checkpoint, package manager decision, dependency policy, public-web import guard. |
| Docs/contracts only | Boundary docs and interface contracts inside 123Charts. | Selected for PR161. | PR162 QA before Seed 100 starts. |

PR161 chooses docs/contracts only.

## Draft Directory Plan

If a later checkpoint approves physical creation, the future worker boundary should use a structure equivalent to:

```text
88cn-scout-worker/
  README.md
  docs/
    BOUNDARY.md
    DATA_CONTRACTS.md
    RUNBOOK.md
    SECURITY.md
  contracts/
    discovery-hint.v0.json
    canonical-candidate.v0.json
    audit-observation.v0.json
    report-aggregate.v0.json
  fixtures/
    discovery-hints.sample.jsonl
    canonical-conflicts.sample.jsonl
    audit-observations.sample.jsonl
  tests/
    boundary/
      public-surface-negative.test
      denied-fields-negative.test
      no-external-write-negative.test
```

This is a plan only. These files and directories are not created by PR161.

## Boundary README Draft

Future README content should state:

- this worker is backstage-only;
- it does not serve public web traffic;
- it does not expose public routes;
- it does not publish records;
- it does not write to `88cn-index-data`;
- it does not write production databases;
- it does not share FermatMind infrastructure;
- it does not run on `HK-ALIYUN-01`;
- it does not run on Tencent resources;
- it starts from HTTP-first, robots-aware, bounded work only after checkpoint;
- headless browser fallback, Redis/queue, external HTTP audit, staging writes, and deployment each require later checkpoints.

## Interface Contract Plan

Future worker contracts should remain file/API-shape contracts before runtime:

| Contract | Purpose | Public-safe fields | Denied fields |
| --- | --- | --- | --- |
| `discovery-hint.v0` | Carry a source-backed identity hint. | `project_name`, `official_website_url`, `github_url`, `docs_url`, `source_url`, `source_type`, `discovered_at`, `confidence`, `manual_note`. | private contacts, cookies, sessions, copied directory copy, scores, rankings, traffic, public status. |
| `canonical-candidate.v0` | Represent identity resolution evidence. | normalized website, normalized repo, aliases, conflict state, source fingerprint, timestamp. | name-only merge decision, competitor category, ranking, unreviewed public lifecycle state. |
| `audit-observation.v0` | Represent HTTP-first official-source observation. | timestamp, target class, status class, sitemap/canonical/schema/doc flags, failure class. | raw crawl dump, login material, cookies, WAF bypass proof, browser session, private data. |
| `report-aggregate.v0` | Represent aggregate report input. | sample count, timestamp, method, TTL, correction path, aggregate rates, quarantine breakdown. | project-level public shaming, global market count, investment advice, permanent negative labels. |

## CI And Validation Plan

Future physical worker CI must be separated from public web release CI.

Minimum checks before any runtime:

- contract schema validation;
- denied-field negative fixtures;
- no-public-surface negative fixtures;
- no external write fixture;
- no data repo write fixture;
- no production write fixture;
- redaction check;
- dependency/license check;
- public-web import boundary check;
- fixture-only audit dry-run before any external HTTP task.

No future worker CI may require production secrets to validate a pull request.

## Public Web Import Boundary

Public web may read only reviewed, published, public-safe records through existing public data contracts. It must not import worker internals, worker queues, worker temp output, raw scout observations, raw audit observations, correction queues, or staging-only state.

Forbidden import direction:

```text
123Charts/app|components|lib/public -> 88cn-scout-worker/internal
```

Allowed future direction after review:

```text
reviewed aggregate/report artifact -> approved public report surface
```

That approval is not part of PR161.

## Runtime Hard Stops

The following remain hard stops after PR161:

- worker runtime start;
- server worker placement;
- Redis/queue creation;
- external HTTP audit;
- headless browser fallback;
- Supabase migration;
- staging DB write;
- production DB write;
- deploy;
- SSH;
- cloud/server mutation;
- public route creation;
- sitemap inclusion;
- Public API/MCP release;
- data repo mutation;
- FermatMind repo mutation.

## PR162 QA Handoff

PR162 / WORKERQ should verify:

- PR161 created only docs/status metadata;
- no physical worker repo/package/workspace exists in this repo;
- no package metadata changed;
- no worker runtime code exists;
- no public web route, API route, MCP route, sitemap, or report surface changed;
- no external HTTP audit, crawler, Supabase write, staging write, production write, Redis/queue, deploy, server/cloud mutation, data repo mutation, or FermatMind repo mutation occurred;
- Seed 100 is still not started.

## Validation Results

Baseline validation before PR161 edits passed:

| Check | Result |
| --- | --- |
| PR160 merge verification | PASS |
| PR161-PR179 roadmap registration | PASS |
| six expected train registrations | PASS |
| `/Users/rainie/Desktop/88cn-index-data` cleanliness | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| six explicit train-plan checks | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/check-landscape-boundary.mjs` | PASS |
| `npm run landscape:check` | PASS |
| `node scripts/check-sector-density-boundary.mjs` | PASS |
| `node scripts/check-task-discovery-boundary.mjs` | PASS |
| `node scripts/check-alternatives-canonical.mjs` | PASS |

Final PR161 validation after edits:

| Check | Result |
| --- | --- |
| `npm run agent:scope:check -- PR161` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
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
| `git diff --check` | PASS |

## What This PR Does Not Do

- Does not start PR162.
- Does not start Seed 100.
- Does not create `88cn-scout-worker`.
- Does not create a new GitHub repo.
- Does not create a package or workspace.
- Does not add dependencies.
- Does not create worker source files.
- Does not implement worker, crawler, queue, audit, report, API, MCP, route, sitemap, or product code.
- Does not perform external HTTP audit.
- Does not use headless browser automation.
- Does not create Supabase migrations.
- Does not write Supabase, staging, or production data.
- Does not create Redis or queues.
- Does not deploy, SSH, restart services, reload Nginx, restart PM2, or mutate cloud/server state.
- Does not edit `.env`, read secrets, or print secrets.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not mutate FermatMind repos.
- Does not create public pages, sitemap entries, public JSON, Public API, MCP, report registry, or distribution surfaces.
- Does not start Growth, BETA, I18N, OPS10A, or PR101.
