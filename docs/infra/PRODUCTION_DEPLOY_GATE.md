# PR205 Production Deploy Gate v0

Result: `READY_FOR_PRODUCTION_DEPLOY_APPROVAL`

PR205 is a non-deploy production approval gate. It records the exact candidate
commit, preflight checklist, live smoke checklist, rollback checklist, and
post-deploy no-leak checks required before a later production deployment task.
It does not deploy, SSH, open Workbench, mutate cloud/server state, reload
Nginx, restart PM2, read or print secrets, write Supabase, mutate the data
repo, enable Public API/MCP, or live-smoke production.

## Candidate Commit

- Candidate repo: `fermatmind/88CN`
- Candidate branch: `origin/main`
- Candidate exact SHA:
  `4f5792564d78966556189f18e40c97cff2b9ad23`
- Candidate basis: PR204 / SECURITY_FIREWALL merged and local `main ==
  origin/main`.
- Deploy executed in PR205: `NO`
- Live smoke executed in PR205: `NO`
- Server/cloud action in PR205: `NONE`
- Nginx/PM2 action in PR205: `NONE`
- Supabase/staging/production write in PR205: `NONE`
- Data repo mutation in PR205: `NONE`
- New env/payment/secret flag in PR205: `NONE`

## Exact Approval Phrase Required

Production deploy remains blocked until the human approves this exact SHA with
one of the following phrases:

```text
I APPROVE 123Charts PRODUCTION DEPLOY FOR EXACT SHA 4f5792564d78966556189f18e40c97cff2b9ad23
```

```text
我批准 123Charts 按 exact SHA 4f5792564d78966556189f18e40c97cff2b9ad23 执行生产部署
```

Approval for any other SHA, branch name, relative ref, or unstated ref is not
sufficient.

## Deploy Preflight Checklist

Before any later production deploy for the candidate SHA, verify all items:

- Local 123Charts repo is clean and `main == origin/main` at the exact approved SHA.
- PR204 is merged and `SECURITY_FIREWALL_READY_NO_DEPLOY` is recorded.
- PR205 is merged and `READY_FOR_PRODUCTION_DEPLOY_APPROVAL` is recorded.
- `npm run verify:day0` passes.
- `npm run policy:scan` passes.
- `npm run third-party:check` passes.
- `npm run agent:redact:check` passes.
- `npm run agent:batch:check` passes.
- `npm run agent:train-plan:check` passes.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npm run agent:gate` passes.
- `node scripts/check-landscape-boundary.mjs` passes.
- `npm run landscape:check` passes.
- `node scripts/check-sector-density-boundary.mjs` passes.
- `node scripts/check-task-discovery-boundary.mjs` passes.
- `node scripts/check-alternatives-canonical.mjs` passes.
- Public API remains disabled unless a separate approved release exists.
- MCP remains disabled unless a separate approved release exists.
- Public project listing/detail remain published-projection only.
- Collections remain finite reviewed registry rows.
- Sitemap/search index include only eligible published projection and approved
  finite discovery routes.
- Worker repo is clean and no worker/runtime/Redis/queue action is required for
  the deploy.
- Data repo is clean and not used as a deploy mutation target.
- Server connection path is available and confirmed by the human for the exact
  target host before any SSH/Workbench action.
- Rollback path is documented and available before any Nginx/PM2 action.
- The human approval phrase exactly matches the candidate SHA.

## Live Smoke Checklist

After a later approved deploy, verify the live host without mutating data:

- `/api/healthz` returns a healthy response.
- `/` returns 200.
- `/projects` returns 200 and lists only published projections.
- `/projects/aurora-code` or another published projection detail returns 200.
- A missing project detail returns fail-closed behavior.
- `/collections/open-source-ai-agents` returns 200.
- An unknown collection slug returns fail-closed behavior.
- `/tasks/evaluate-ai-builder-infrastructure` returns 200.
- No broad `/tasks` index is exposed.
- `/sitemap.xml` returns 200 and includes only approved public URLs.
- `/robots.txt` returns 200.
- `/api/public/v0/projects` remains disabled unless separately released.
- `/api/mcp` remains disabled unless separately released.
- Disabled payment/API-key/buyer-interest shells remain disabled where
  applicable.
- Public HTML does not expose raw seed, evidence, audit, review, quarantine,
  rejected, private artifact path, private hash, or internal confidence data.
- Public copy does not add unsupported score, "best", "top", or paid influence
  claims.

## Rollback Checklist

Before deploying, identify and record:

- Previous known-good production SHA.
- Previous release directory or artifact identifier, if the server uses release
  directories.
- Reversible command sequence for switching the release pointer or restoring the
  previous working tree.
- Nginx config test command to run before any reload.
- PM2 status and restart/save commands to use only after approval.
- Post-rollback smoke checks for health, home, projects, sitemap, robots, and
  disabled API/MCP boundaries.
- Human owner who can approve rollback if live smoke fails.

Rollback execution is not part of PR205.

## Post-Deploy No-Leak Checks

After a later approved deploy, confirm live pages do not expose:

- raw seed rows.
- source evidence payloads.
- audit observations.
- review notes.
- quarantine/rejected records.
- private artifact paths.
- private row/evidence hashes.
- internal confidence values.
- unreviewed project entities.
- copied competitor descriptions.
- unsupported score, "best", "top", paid influence, or search-position claims.
- Public API or MCP output unless separately approved and released.

## Sitemap and Live URL Checks

Expected public route families after deployment:

- `/`
- `/projects`
- `/projects/[published-slug]`
- `/collections/[finite-published-slug]`
- `/stacks/[finite-published-slug]`
- `/verticals/[finite-published-slug]`
- `/alternatives/[canonical-published-slug]`
- `/tasks/evaluate-ai-builder-infrastructure`
- `/reports` and published report routes already accepted by prior tasks
- `/sitemap.xml`
- `/robots.txt`

Rejected or fail-closed route families:

- broad `/tasks` index.
- `/zh-CN`.
- `/landscape/sectors`.
- unsafe `/api` surfaces outside their disabled or admin-gated contracts.
- admin routes as public project routes.
- arbitrary collection/task/project slugs.

## Server Connection State

PR205 does not test or use server access. Existing sidecar context says host
preparation was previously Workbench-only for Shanghai candidates, while local
SSH remained private-only or timed out. A later deploy task must re-confirm the
exact target host, connection method, user, directory, reversible actions, and
approval before any server/cloud interaction.

## Blockers

Production deploy remains blocked by any of the following:

- Missing exact SHA approval phrase.
- Candidate SHA differs from the approved phrase.
- Dirty local 123Charts, worker, or data repo.
- Failing preflight validation.
- Public leak detected.
- Public API/MCP unexpectedly enabled.
- Sitemap includes unreviewed, broad, unknown, stale, quarantine, rejected, or
  unsafe routes.
- Missing rollback path.
- Missing confirmed server connection path.
- Request to enable new env/payment/secret flag.
- Request to mutate Supabase/staging/production data.
- Request to mutate data repo.
- Request to start worker/runtime/Redis/queue activity.

## Actions Requiring Later Approval

The following are explicitly outside PR205 and require a later exact-SHA deploy
approval:

- deploy.
- SSH or Workbench.
- cloud/server mutation.
- Nginx reload.
- PM2 restart.
- live smoke production.
- rollback execution.
- Supabase/staging/production write.
- enabling Public API, MCP, payment, API key, buyer-interest, or worker runtime
  behavior.

## Next Step

Wait for exact SHA approval for
`4f5792564d78966556189f18e40c97cff2b9ad23` before any production deployment
task. Do not start PR206, PR207, Growth2, Growth1, BETA, I18N, or OPS10A in
this PR205 train.
