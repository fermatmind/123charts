# PR Train Runner Skill

Use this card when a user starts a bounded PR train by `BATCH_ID`.

## Bounded Batch Rule

1. Read `ops/trains/batches.json`.
2. Select exactly one batch by `id`.
3. Confirm the selected batch has explicit boolean values for merge, live deploy, payment, MCP, server, plugin, and dependency permissions.
4. Confirm the selected task count does not exceed `batch_limit`.
5. For train entries with `sub_batches`, execute only one sub-batch at a time.
6. Run `npm run agent:batch:check`.
7. Run `node scripts/agent/train-plan-check.mjs --batch <BATCH_ID>` before execution.
8. Read each matching task object in `ops/tasks/roadmap.json` before editing.
9. If a task object is missing and not covered by a roadmap skeleton, stop and record the missing task as a blocker.

## Human Checkpoint Rule

Stop before any action covered by `human_checkpoints`.

Human checkpoints are required for:

- payment or Stripe/commercial enablement
- email automation or external notification
- public API external release
- scaled public content or indexability expansion
- Laravel, API key, metering, or data feed release
- real MCP endpoint configuration
- external framework PR creation
- live deployment unless both the batch and roadmap task allow it

## Sidecar Issue Rule

Use `docs/SIDECAR_ISSUES.md` only for issues outside the active task scope.

If `continue_on_sidecar` is true, record the issue and continue with the bounded batch.

If `continue_on_sidecar` is false, record the issue and stop.

Never use a sidecar issue to bypass a forbidden path, failed security gate, missing human checkpoint, or public language violation.

## Merge Policy

Stable low-risk operations are auto-merge eligible by default.

The runner may execute an unattended or train-driven auto-merge and delete the task branch when all conditions are true:

- repository policy has `default_auto_merge_allowed=true`
- repository policy has `auto_delete_branch_after_merge=true`
- the selected batch sets `auto_merge_allowed` to true, or the active task is a stable docs/status/QA/readiness task with no checkpoint blockers
- the active roadmap task allows merge or has no human checkpoint requirement
- `ops/tools/tool-registry.json` allows the required merge command
- the PR is mergeable
- required checks pass
- scope validation and policy scan pass
- no human checkpoint is bypassed

Codex may run `gh pr merge --delete-branch` without a separate human approval step when repo policy allows it, the PR is mergeable, required checks pass, and no human checkpoint is bypassed.

Auto-merge remains blocked for human checkpoints, live deploys, server or cloud mutation, production or staging writes, secret or environment changes, payment/customer access, external writes or outreach, data repo mutation, Public API/MCP release, plugins, or new dependencies unless a later task explicitly records the required human checkpoint.

If merge gates do not pass, open or update the PR and stop before merge.

## Live Smoke vs Live Config Change

Live-smoke-only tasks may run approved smoke checks against the live site when the roadmap task allows QA.

Live-smoke-only tasks must not:

- change server configuration
- change production process managers
- change DNS or TLS
- write secrets or environment values
- deploy a new target SHA

Live configuration changes require a separate roadmap task, exact target SHA, and explicit human approval.

## Post-Merge Validation

After a PR is merged and cleanup is requested, use `ops/skills/post-merge-cleanup.md`.

Confirm:

1. the PR is merged
2. `origin/main` contains the merge commit
3. local `main` is synced to `origin/main`
4. local `main` equals `origin/main`
5. the worktree is clean
6. the task branch is removed only after the above checks pass

## No Same-Worktree Parallelism Rule

Do not run parallel write sessions in the same git worktree.

Before starting a train, inspect:

```bash
git status --short --branch
git worktree list
```

If another train is active in the same working tree, stop or create a separate worktree.

## Parallel OPS Worktree Rule

Parallel OPS tasks must use separate worktrees created from current `origin/main`.

Recommended pattern:

```bash
git fetch origin --prune
git worktree add /path/to/123charts-<task> origin/main -b codex/<task-branch>
```

Work only inside the new worktree. Do not write to another active train's worktree.
