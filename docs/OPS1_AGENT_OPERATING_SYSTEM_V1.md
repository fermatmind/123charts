# OPS1 Agent Operating System v1

## Result

OPS1 adds a repo-native execution layer for 123Charts agents. It does not change product behavior, public pages, database schema, API routes, or deployment configuration.

## Why 123Charts Needs Agent OS

123Charts now has several parallel lanes: product builds, read-only QA, live smoke checks, data repo ingestion, and later assistant-facing read surfaces. Without a local operating layer, each PR has to restate boundaries from scratch. Agent OS makes the boundary machine-readable so future work can run with less drift.

## Roles

Codex Build implements assigned roadmap tasks. It edits only paths allowed by `ops/tasks/roadmap.json`, runs the task validations, and opens a draft PR.

Codex QA is read-only by default. It writes QA reports and screenshots, stops on failed gates, and does not repair implementation defects.

Triage classifies failures when ownership is unclear. The accepted failure types are `code_defect`, `env_config_mismatch`, `server_runtime_issue`, `flaky_network`, `stale_test_expectation`, and `unknown`.

## OPS Tasks And Product PR Numbers

OPS tasks do not consume product PR numbers. They define execution rules, contracts, and verification helpers. Product PRs remain reserved for user-facing behavior, admin flows, data-plane behavior, API changes, and live content changes.

## Roadmap JSON

The roadmap is JSON so scripts can enforce scope before review. `scripts/agent/scope-check.mjs` reads `ops/tasks/roadmap.json`, resolves the task from CLI input or `ops/tasks/current.json`, then compares changed files against allowed and forbidden paths.

## Redaction Default Hard Fail

The redaction checker fails closed because leaked credentials and server details cannot be safely corrected after a public push. The checker prints only file, line, and rule name. It does not print sensitive values.

`--fix` is reserved for low-risk generated report text. Real secrets and credential-bearing URLs remain hard failures.

## Telemetry Opt-In

Telemetry is opt-in only. CI does not publish telemetry by default. Publishing requires `publish_to_123charts=true`. The telemetry contract bans secrets, environment values, logs, private repo data, and raw private payloads.

## Cache Tag Matrix

Cache behavior must be designed before implementation. `ops/contracts/cache-tags.json` defines bounded tags such as `project:{slug}`, `category:{category_slug}`, `report:{report_slug}`, and `sitemap:public`. The contract blocks unscoped full-site invalidation.

## Event Outbox And Replay

Future Laravel or Redis consumers must read event outbox rows or reviewed snapshots. Supabase remains the source of truth. Webhook delivery alone is not enough because failed delivery must be replayable and receivers must be idempotent.

## How To Execute PR31

1. Sync `main`.
2. Create the PR31 branch.
3. Read `ops/tasks/roadmap.json` task `PR31`.
4. Read contracts for data planes, public API, MCP, cache, and events.
5. Implement only the quarantine summary behavior.
6. Confirm import sync does not fetch live websites.
7. Confirm quarantined records do not enter `projects`, sitemap, public API, or MCP.
8. Run:

```bash
npm run agent:scope:check -- PR31
npm run agent:redact:check
npm run verify:day0
npm run policy:scan
npm run third-party:check
npm run external-import:check
npm run lint
npm run typecheck
npm run build
```

PR31 is a build task. PR32 is the QA task that verifies Seed 100 import dry-run and admin staging behavior.

## How To Add A Future PR

1. Add a full task object to `ops/tasks/roadmap.json`.
2. Include `id`, `title`, `type`, `role`, `repo`, `phase`, `depends_on`, `allowed_paths`, `forbidden_paths`, `validations`, data-plane fields, and `definition_of_done`.
3. Keep allowed paths narrow.
4. Add contract checks when the task touches cache, telemetry, event sync, payments, public API, or MCP.
5. Run `npm run agent:scope:check -- <TASK_ID>`.

## OPS2 Follow-Up

OPS2 is separate. It should register Codex tools and plugin boundaries after OPS1 QA passes. This PR only creates the Agent OS foundation and does not implement the OPS2 registry.

## Added Package Scripts

- `agent:gate`
- `agent:smoke:local`
- `agent:smoke:live`
- `agent:deploy:production`
- `agent:redact:check`
- `agent:scope:check`
- `agent:triage:check`
- `agent:cache-contract:check`
- `agent:telemetry-contract:check`
- `agent:event-contract:check`
- `agent:pr:summary`

## What This PR Does Not Do

- Does not modify product code.
- Does not deploy.
- Does not change app, lib, or Supabase implementation.
- Does not implement PR31 quarantine behavior.
- Does not add external dependencies.
