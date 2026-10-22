# TRAFFIC4R Remaining Demand-Side Traffic Split + Train Registration v0

## Result

GO_TRAFFIC4_TRAIN

TRAFFIC4R splits the remaining demand-side traffic work into boundary, implementation, and QA tasks, registers safe non-PR train batches, and validates them through OPS9A2-compatible batch tooling.

This task does not implement TRAFFIC4, TRAFFIC5, TRAFFIC6, TRAFFIC7, `/tasks`, alternatives expansion, report distribution tooling, app/runtime code, sitemap runtime, deployment, external writes, outreach, PII collection, or data-repo changes.

## Scope

- Task ID: TRAFFIC4R
- Role: codex-build / codex-research
- Repo: `/Users/rainie/Desktop/123charts.com/123charts`
- Data repo: `/Users/rainie/Desktop/88cn-index-data` cleanliness check only
- Current source state: TRAFFIC3Q merged at `a6db25049ba293e1d0d304543fa0889f11284988`
- Product code changes: none
- Deployment: none

## Source Inputs

- `docs/traffic/TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md`
- `docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md`
- `docs/traffic/TRAFFIC2_AI_PROJECT_LANDSCAPE_LANDING_BOUNDARY.md`
- `docs/traffic/TRAFFIC2B_AI_PROJECT_LANDSCAPE_LANDING_IMPLEMENTATION_V0.md`
- `docs/traffic/TRAFFIC3_SECTOR_DENSITY_MARKET_MAP_V0.md`
- `docs/traffic/TRAFFIC3B_SECTOR_DENSITY_MARKET_MAP_IMPLEMENTATION_V0.md`
- `docs/traffic/TRAFFIC3Q_SECTOR_DENSITY_MARKET_MAP_QA_V0.md`
- `docs/OPS9A2_NON_PR_TASK_BATCH_RUNNER_COMPATIBILITY_IMPLEMENTATION.md`
- `docs/TASK_STATUS.md`
- `docs/SIDECAR_ISSUES.md`
- `ops/tasks/roadmap.json`
- `ops/tasks/current.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

## Current Roadmap Scan

| Task | Current state before TRAFFIC4R | Decision |
| --- | --- | --- |
| TRAFFIC4 | Registered as broad docs-only task discovery research. | Split before any `/tasks` implementation. |
| TRAFFIC5 | Registered as broad alternatives boundary research. | Split before alternatives expansion. |
| TRAFFIC6 | Registered as broad report distribution generator research. | Split into boundary, generator, and QA. |
| TRAFFIC7 | Registered as demand-side traffic QA. | Keep as final QA closer after split work. |
| TRAFFIC4A/B/Q | Not registered. | Registered in TRAFFIC4R. |
| TRAFFIC5A/B/Q | Not registered. | Registered in TRAFFIC4R. |
| TRAFFIC6A/B/Q | Not registered. | Registered in TRAFFIC4R. |

TRAFFIC4R itself was missing from the roadmap and is registered narrowly with docs/status/roadmap/train metadata scope.

## Required Decisions

1. Current TRAFFIC4 is broad and docs-only, so it should not directly implement `/tasks`.
2. TRAFFIC4 should be split before any `/tasks` implementation.
3. TRAFFIC4A should be boundary-only.
4. TRAFFIC4B may implement finite `/tasks/[slug]` pages only after TRAFFIC4A defines the allowlist and thresholds.
5. TRAFFIC4Q should be QA-only.
6. Current TRAFFIC5 is broad and docs-only.
7. TRAFFIC5 should split before alternatives expansion.
8. TRAFFIC5A should define canonical pair policy.
9. TRAFFIC5B should implement approved alternatives expansion only.
10. TRAFFIC5Q should be QA-only.
11. TRAFFIC6 should split into boundary, generator, and QA because distribution work carries external-write, outreach, and PII risk if not constrained first.
12. TRAFFIC7 should remain the final QA closer.
13. Non-PR train registration can safely work now after OPS9A2 because all registered batches pass `agent:batch:check` and explicit train-plan checks.
14. Registered train batches are `TRAIN-TRAFFIC4-TASK-DISCOVERY`, `TRAIN-TRAFFIC5-ALTERNATIVES-EXPANSION`, and `TRAIN-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA`.
15. Deployment remains after TRAFFIC7 and is not part of these trains.
16. GROWTH0 remains paused.
17. BETA1, I18N0, OPS9B, and PR101 remain paused.

## TRAFFIC4 Split Decision

TRAFFIC4 is split into:

| Task | Role | Type | Purpose |
| --- | --- | --- | --- |
| TRAFFIC4A | codex-research | research | Define finite task slug allowlist, reviewed-project thresholds, noindex/sitemap rules, and task-copy boundaries. |
| TRAFFIC4B | codex-build | implementation | Implement only finite allowlisted task pages if TRAFFIC4A confirms safe scope. |
| TRAFFIC4Q | codex-qa | qa | Verify task route boundaries, copy safety, sitemap/noindex behavior, and no product-code drift. |

TRAFFIC4B remains constrained to reviewed public-safe data, no arbitrary task params, no query-param pages, no under-threshold sitemap entries, no copied descriptions, and no fake counts.

## TRAFFIC5 Split Decision

TRAFFIC5 is split into:

| Task | Role | Type | Purpose |
| --- | --- | --- | --- |
| TRAFFIC5A | codex-research | research | Define canonical pair allowlist policy and comparison-copy boundaries. |
| TRAFFIC5B | codex-build | implementation | Implement approved alternatives expansion only. |
| TRAFFIC5Q | codex-qa | qa | Verify canonical ordering, no reverse duplicates, no N-by-N generation, no unsafe comparison copy, and sitemap behavior. |

TRAFFIC5B remains constrained to approved pairs only, no superiority claims, no defamatory copy, no sponsored bias, and no paid effect on organic comparison.

## TRAFFIC6 Split Decision

TRAFFIC6 is split into:

| Task | Role | Type | Purpose |
| --- | --- | --- | --- |
| TRAFFIC6A | codex-research | research | Define report distribution pack boundary and supported draft channels. |
| TRAFFIC6B | codex-build | implementation | Implement local draft package generation only if TRAFFIC6A confirms scope. |
| TRAFFIC6Q | codex-qa | qa | Verify draft-only output and no external write paths. |

TRAFFIC6B remains local-draft-only: no auto posting, email send, DM send, social API write, platform login, CRM write, PII collection, browser session export, external write, deploy, or data repo mutation.

## TRAFFIC7 QA Decision

TRAFFIC7 remains the final demand-side QA closer. Its dependency list is updated to follow `TRAFFIC3Q`, `TRAFFIC4Q`, `TRAFFIC5Q`, and `TRAFFIC6Q`.

TRAFFIC7 must verify:

- `/landscape`;
- sector-density module;
- task pages if implemented;
- alternatives expansion if implemented;
- report distribution pack if implemented;
- sitemap, canonical, noindex, mobile, and public copy boundaries;
- no generic directory drift;
- no forbidden API, MCP, payment, customer, or data-repo leakage.

## Registered Task Matrix

| Task | Registered | Public/runtime implementation allowed in that task |
| --- | --- | --- |
| TRAFFIC4R | yes | no |
| TRAFFIC4A | yes | no |
| TRAFFIC4B | yes | finite `/tasks/[slug]` implementation only if TRAFFIC4A permits |
| TRAFFIC4Q | yes | no |
| TRAFFIC5A | yes | no |
| TRAFFIC5B | yes | approved alternatives expansion only |
| TRAFFIC5Q | yes | no |
| TRAFFIC6A | yes | no |
| TRAFFIC6B | yes | local draft generator only |
| TRAFFIC6Q | yes | no |
| TRAFFIC7 | updated | no |

No split task is marked started by TRAFFIC4R.

## Registered Train Matrix

| Train | Tasks | Auto merge | Runner status |
| --- | --- | --- | --- |
| TRAIN-TRAFFIC4-TASK-DISCOVERY | TRAFFIC4A, TRAFFIC4B, TRAFFIC4Q | false | PASS |
| TRAIN-TRAFFIC5-ALTERNATIVES-EXPANSION | TRAFFIC5A, TRAFFIC5B, TRAFFIC5Q | false | PASS |
| TRAIN-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA | TRAFFIC6A, TRAFFIC6B, TRAFFIC6Q, TRAFFIC7 | false | PASS |

All train risk flags for live deploy, server changes, payment, MCP, plugin install, new dependency, external service, data repo mutation, public API release, customer access, PII collection, social posting, and outreach automation are false.

`continue_on_sidecar` is true only for sidecar findings; P0/P1/P2 validation, scope, policy, secret, forbidden-path, and GitHub-check failures still stop the train.

## Runner Compatibility Status

OPS9A2 compatibility is sufficient for these trains:

- `npm run agent:batch:check` passes with 34 batches, 132 roadmap tasks, and 80 skeleton tasks.
- `npm run agent:train-plan:check` passes with `TRAIN-TRAFFIC4-TASK-DISCOVERY` as `next_recommended_train`.
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC4-TASK-DISCOVERY` passes.
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC5-ALTERNATIVES-EXPANSION` passes.
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA` passes.

## PR-Numbered Execution Registration

Follow-up registration maps the 10-step demand-side chain to 10 PR-numbered tasks. Existing `PR101-PR121` remain reserved for the MCP and agent ecosystem train, so the demand-side chain starts at `PR122`.

| PR | Traffic task | Title | Type |
| --- | --- | --- | --- |
| PR122 | TRAFFIC4A | Task-to-Project Discovery Boundary v0 | research |
| PR123 | TRAFFIC4B | Finite Task Pages Implementation v0 | implementation |
| PR124 | TRAFFIC4Q | Task Pages QA v0 | qa |
| PR125 | TRAFFIC5A | Alternatives Expansion Boundary v0 | research |
| PR126 | TRAFFIC5B | Alternatives Expansion Implementation v0 | implementation |
| PR127 | TRAFFIC5Q | Alternatives Expansion QA v0 | qa |
| PR128 | TRAFFIC6A | Report Distribution Pack Boundary v0 | research |
| PR129 | TRAFFIC6B | Report Distribution Pack Generator v0 | implementation |
| PR130 | TRAFFIC6Q | Report Distribution Pack QA v0 | qa |
| PR131 | TRAFFIC7 | Demand-Side Traffic QA v0 | qa |

Registered PR trains:

| Train | Tasks | Mirrors |
| --- | --- | --- |
| TRAIN-PR122-PR124-TRAFFIC4-TASK-DISCOVERY | PR122, PR123, PR124 | TRAIN-TRAFFIC4-TASK-DISCOVERY |
| TRAIN-PR125-PR127-TRAFFIC5-ALTERNATIVES-EXPANSION | PR125, PR126, PR127 | TRAIN-TRAFFIC5-ALTERNATIVES-EXPANSION |
| TRAIN-PR128-PR131-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA | PR128, PR129, PR130, PR131 | TRAIN-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA |

The PR-numbered chain keeps the same boundaries as the TRAFFIC task chain:

- no live deploy;
- no server config;
- no payment, MCP, public API release, or customer access;
- no plugin install or new dependency by train default;
- no external service write;
- no data repo mutation;
- no PII collection, social posting, or outreach automation.

Exact next PR task: `PR122`.

Exact next PR train: `TRAIN-PR122-PR124-TRAFFIC4-TASK-DISCOVERY`.

Do not start `PR122` or the PR train from this registration step.

## Deployment Timing Recommendation

Deployment remains after TRAFFIC7. TRAFFIC4R registers planning and train metadata only, and does not change deployment readiness.

## Paused Task Recommendation

Keep these paused:

- GROWTH0;
- BETA1;
- I18N0;
- OPS9B;
- PR101.

TRAFFIC4A is the next task, but it is not started by TRAFFIC4R.

## Validation Results

Local validation passed:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run agent:scope:check -- TRAFFIC4R`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- `node scripts/check-landscape-boundary.mjs`
- `npm run landscape:check`
- `node scripts/check-sector-density-boundary.mjs`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC4-TASK-DISCOVERY`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC5-ALTERNATIVES-EXPANSION`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-TRAFFIC6-TRAFFIC7-DISTRIBUTION-QA`

`npm run sector-density:check` is not registered, so the direct checker command is the validation source.

Data repository cleanliness passed:

- `/Users/rainie/Desktop/88cn-index-data` is clean on `main...origin/main`.

## Exact Next Task / Train

Exact next task: PR122 Task-to-Project Discovery Boundary v0.

Traffic alias: TRAFFIC4A.

Exact next train: TRAIN-PR122-PR124-TRAFFIC4-TASK-DISCOVERY.

Do not start PR122, TRAFFIC4A, or the train inside TRAFFIC4R.

## What This PR Does Not Do

- Does not implement TRAFFIC4, TRAFFIC5, TRAFFIC6, or TRAFFIC7.
- Does not create `/tasks`, `/tasks/[slug]`, alternatives pages, `/zh-CN`, or sitemap runtime changes.
- Does not modify app/runtime code.
- Does not deploy.
- Does not create growth agents.
- Does not send email, DMs, social posts, or external writes.
- Does not create CRM records.
- Does not collect or store PII.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start TRAFFIC4A, TRAFFIC4, GROWTH0, BETA1, I18N0, OPS9B, or PR101.
