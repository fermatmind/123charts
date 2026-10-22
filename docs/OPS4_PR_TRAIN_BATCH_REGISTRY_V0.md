# OPS4 PR Train Batch Registry v0

## Purpose

OPS-4A creates the first machine-readable PR Train Batch Registry for 123Charts. Future Codex runs can select a bounded train by `BATCH_ID` instead of receiving long manual prompts with repeated rules.

The registry lives in:

- `ops/trains/batches.json`
- `ops/trains/current.json`
- `ops/templates/pr-train-goal.md`
- `ops/skills/pr-train-runner.md`

## Why OPS-4A Is Spec-Only

OPS-4A is intentionally limited to registry, template, skill-card, and documentation files. Another Codex session may be running PR36-PR41 in the main `/Users/rainie/Desktop/123charts.com/123charts` worktree, so this PR avoids the files most likely to conflict with an active train.

OPS-4A does not modify product code, task state, package scripts, agent scripts, deployment files, data repo files, schemas, migrations, or public UI.

## Why Package And Scripts Are Deferred To OPS-4B

Runner integration belongs in OPS-4B because it is likely to edit:

- `package.json`
- `package-lock.json`
- `scripts/agent/**`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `docs/TASK_STATUS.md`

Those paths can collide with PR36-PR41 train work. Deferring script wiring keeps OPS-4A parallel-safe and reviewable.

## Batch Registry Structure

Each batch object in `ops/trains/batches.json` includes:

- `id`
- `title`
- `phase`
- `tasks`
- `batch_limit`
- `auto_merge_allowed`
- `live_deploy_allowed`
- `payment_change_allowed`
- `mcp_change_allowed`
- `server_change_allowed`
- `plugin_install_allowed`
- `new_dependency_allowed`
- `continue_on_sidecar`
- `stop_on`
- `human_checkpoints`
- `required_preconditions`
- `allowed_roles`
- `notes`

Booleans are explicit. The default policy allows auto-merge for stable low-risk operations, deletes task branches after merge, and continues to block plugin install, new dependencies, and same-worktree parallel writes.

## Registered Batches

| Batch | Scope | Limit | Key Gates |
| --- | --- | ---: | --- |
| `TRAIN-PR36-PR41` | Founder intent report archive, copy guard, Genesis explainer | 6 | PR37 and PR41 are live-smoke-only checkpoints; no server config change |
| `TRAIN-PR42-PR46` | Founder conversion core | 5 | No live deploy unless later roadmap says otherwise |
| `TRAIN-PR47-PR49` | Submission channels, public copy, founder FAQ | 3 | Safe batch candidate if public copy guard stays current |
| `TRAIN-PR50-PR51` | Featured signals and payment feature flag | 2 | PR51 requires human checkpoint |
| `TRAIN-PR52-PR55` | Lifecycle and retention | 4 | Email automation or external notification requires human checkpoint |
| `TRAIN-PR56-PR60` | Public API boundary | 5 | Public API external release requires human checkpoint |
| `TRAIN-PR61-PR80` | Global intent interception web | 4 per sub-batch | Strict anti-scaled-content boundary |
| `TRAIN-PR81-PR100` | B2B Alpha Data Feed | 4 | Laravel, API key, metering, payment, and data feed release require human checkpoint |
| `TRAIN-PR101-PR121` | MCP and agent ecosystem integration | 4 | No external framework PR creation without explicit human confirmation |

## Human Checkpoint Policy

The runner skill requires a stop before checkpointed actions. Human checkpoints cover payment/Stripe/commercial enablement, email automation, external notification, public API external release, scaled public content expansion, data feed release, real MCP endpoint configuration, external framework PR creation, and live deployment unless both the batch and task allow it.

Auto merge is the default for stable low-risk operations. Train-driven merge remains controlled by repository policy, batch permissions, roadmap permissions, and required checks. Repository policy allows Codex to execute `gh pr merge --delete-branch` without a separate human approval step when the PR is mergeable, required checks pass, and no human checkpoint is bypassed.

Auto merge is blocked when a task would bypass a human checkpoint, live deploy, server or cloud mutation, production or staging write, secret or environment change, payment/customer access, external write or outreach, data repo mutation, Public API/MCP release, plugin install, or new dependency.

## Parallel Worktree Policy

Parallel writes must not happen in the same git worktree.

OPS-4A was prepared in a separate worktree:

```bash
git fetch origin --prune
git worktree add /Users/rainie/Desktop/123charts.com/123charts-ops4a origin/main -b codex/ops4a-pr-train-batch-registry-spec
```

Future parallel OPS tasks should use the same isolation pattern and work only inside the task-specific worktree.

## What This PR Does Not Do

- Does not modify product code.
- Does not modify `package.json` or `package-lock.json`.
- Does not add or modify scripts.
- Does not modify `ops/tasks/current.json`.
- Does not modify `ops/tasks/roadmap.json`.
- Does not modify `docs/TASK_STATUS.md`.
- Does not deploy.
- Does not install plugins or dependencies.
- Does not configure real MCP servers.
- Does not touch payment implementation.
- Does not modify `/Users/rainie/Desktop/88cn-index-data`.

## Validation Results

Validation run for OPS-4A:

| Command | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:tool:check` | PASS |
| `npm run agent:mcp-config:check` | PASS |
| `npm run agent:plugin-policy:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS with existing Supabase Edge Runtime warning |

`npm run lint` initially could not start because the fresh worktree did not have `node_modules`; `npm ci` was run from the existing lockfile and did not change dependency manifests.

Scope validation:

`npm run agent:scope:check` is not applicable for OPS-4A because OPS-4A is not yet registered in `ops/tasks/roadmap.json` and this PR intentionally does not edit roadmap task objects.

## Follow-Up OPS-4B Recommendation

After PR36-PR41 train work is complete, OPS-4B should wire the registry into repo-local execution scripts and package commands.

Recommended OPS-4B scope:

- add an agent script that validates `BATCH_ID` against `ops/trains/batches.json`
- add a package script for registry validation
- add an optional runner preflight that checks same-worktree parallelism
- register OPS-4B in `ops/tasks/roadmap.json`
- update `docs/TASK_STATUS.md` only in the OPS-4B PR
