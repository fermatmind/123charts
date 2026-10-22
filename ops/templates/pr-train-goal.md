# PR Train Goal Template

Use this template to start a bounded train from `ops/trains/batches.json`.

```text
/goal <BATCH_ID> PR Train Execution
You are Codex 5.5 High under the 123Charts Agent Operating System.

Inputs:
- BATCH_ID: <BATCH_ID>
- AUTO_MERGE_ALLOWED: <true by default for stable low-risk tasks; false for checkpointed/high-risk tasks>
- LIVE_DEPLOY_ALLOWED: <true|false>
- PAYMENT_CHANGE_ALLOWED: <true|false>
- MCP_CHANGE_ALLOWED: <true|false>

Mission:
Read `ops/trains/batches.json`, select the batch whose `id` equals BATCH_ID, and execute only that bounded batch.

Rules:
1. Refuse to run if the selected batch is missing, malformed, or larger than `batch_limit`.
2. Refuse to run if any provided input flag is broader than the selected batch allows.
3. Read `ops/skills/pr-train-runner.md` before editing files.
4. Run `npm run agent:batch:check`.
5. Run `node scripts/agent/train-plan-check.mjs --batch <BATCH_ID>` and treat it as a dry-run only.
6. Read each task object in `ops/tasks/roadmap.json` before executing that task.
7. Create or use a clean git worktree for this train. Do not write in the same worktree as another active PR train.
8. Edit only paths allowed by the active roadmap task and the selected batch.
9. Stop at every `human_checkpoints` rule before performing the checkpointed action.
10. Record sidecar issues in `docs/SIDECAR_ISSUES.md` only when the issue is outside the current task scope and `continue_on_sidecar` is true.
11. Do not install plugins, add dependencies, configure real MCP servers, touch payment enablement, or change server configuration unless both the batch and task explicitly allow it.
12. Run the validations required by each task, then run the train-level validation bundle.
13. For stable low-risk tasks where repo policy and the selected batch allow auto-merge, merge with task-branch deletion after required checks pass.

Completion:
- Summarize completed tasks.
- List validations and results.
- List sidecar issues, if any.
- Confirm `git status --short --branch`.
- Auto-merge stable low-risk tasks by default when repo policy, tool registry, the selected batch, the active roadmap task, and GitHub merge state allow it. Use branch deletion after merge. Do not auto-merge if a human checkpoint, live deploy, server/cloud mutation, production/staging write, secret/env change, payment/customer access, external write/outreach, data repo mutation, Public API/MCP release, plugin, or new dependency would be bypassed.
```

Only change these template inputs for routine use:

- `BATCH_ID`
- `AUTO_MERGE_ALLOWED`
- `LIVE_DEPLOY_ALLOWED`
- `PAYMENT_CHANGE_ALLOWED`
- `MCP_CHANGE_ALLOWED`
