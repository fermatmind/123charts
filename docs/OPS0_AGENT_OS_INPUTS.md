# OPS-0 Agent OS Inputs

## Repository Paths

| Repo | Local path | GitHub |
| --- | --- | --- |
| Main app | `/Users/rainie/Desktop/123charts.com/123charts` | `fermatmind/88CN` |
| Data repo | `/Users/rainie/Desktop/88cn-index-data` | `fermatmind/88cn-index-data` |

## Current Docs Numbering

Current numbered docs range:

- `00_PROJECT_BRIEF.md` through `41_GEO_CHECKER_REMEDIATION_LIVE_QA.md`
- OPS docs added by this audit: `OPS0_REPO_STATE_AUDIT.md`, `OPS0_PR31_READINESS.md`, `OPS0_AGENT_OS_INPUTS.md`

## Main Repo NPM Scripts

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `build:production` | `NODE_ENV=production next build` |
| `start:production` | `next start` |
| `lint` | `next lint` |
| `typecheck` | `tsc --noEmit` |
| `runtime:check` | `bash deploy/scripts/check-runtime.sh` |
| `db:schema:check` | `node scripts/check-supabase-migrations.mjs` |
| `public-surface:check` | `node scripts/check-public-surface-hardening.mjs` |
| `intake:check` | `node scripts/check-intake-firewall.mjs` |
| `external-import:check` | `node scripts/check-external-import-integration.mjs` |
| `geo-checker:check` | `node scripts/check-geo-checker.mjs` |
| `docs:check` | Required file existence check |
| `policy:scan` | `node scripts/scan-forbidden-patterns.mjs` |
| `third-party:check` | `node scripts/check-third-party-notices.mjs` |
| `verify:day0` | `npm run docs:check && npm run policy:scan && npm run third-party:check` |

## Data Repo NPM Scripts

| Script | Command |
| --- | --- |
| `validate` | `node scripts/validate-projects.mjs` |
| `aggregate` | `node scripts/aggregate-projects.mjs` |
| `privacy:check` | `node scripts/check-forbidden-fields.mjs` |
| `taxonomy:check` | `node scripts/check-taxonomy.mjs` |
| `seed:check` | `node scripts/check-seed-batch.mjs` |
| `test` | taxonomy, privacy, validate, aggregate, seed checks |

## Recommended `agent:gate` Scripts

Recommended main repo gate:

1. `npm run verify:day0`
2. `npm run db:schema:check`
3. `npm run public-surface:check`
4. `npm run intake:check`
5. `npm run external-import:check`
6. `npm run geo-checker:check`
7. `npm run lint`
8. `npm run typecheck`
9. `npm run build`

Recommended data repo gate:

1. `npm run taxonomy:check`
2. `npm run privacy:check`
3. `npm run validate`
4. `npm run aggregate`
5. `npm run seed:check`
6. `npm test`

Current caveat: main repo gate is green after PR #30, but quarantine summary support is still missing for external import consumer flows.

## Roadmap Tasks To Register

| Task | Proposed focus |
| --- | --- |
| OPS1 | Agent Operating System v1 |
| OPS1Q | Agent OS QA |
| PR31 | External Import Consumer Quarantine Summary v0 |
| PR32 | Seed 100 Import Dry Run + Admin Staging QA |
| PR33 | Seed 100 Machine-Readability Audit Dataset v0 |
| PR34 | First Founder Intent Signal Report v0 |
| PR35 | Founder Intent Report QA + Live Deploy |

## Contracts For OPS-1

OPS-1 should create explicit contracts for:

- telemetry
- cache-tags
- event-outbox
- redaction
- featured-signals-boundary
- public-api-boundary
- mcp-boundary
- payment-boundary

## Redaction Policy Recommendation

- Default to hard fail on secret-like material.
- `--fix` may be allowed only for low-risk generated artifacts.
- Real secrets must never be automatically rewritten by an agent.
- Reports should use `REDACTED` for server addresses, env values, private keys, session material, and credential-bearing URLs.
- GitHub auth state must not be printed into reports.

## Build And QA Triage Policy Recommendation

1. Separate gate failures from build failures.
2. Treat policy scanner failures as release blockers even if build passes.
3. Continue static scanning after a gate failure and mark the result PARTIAL unless the repo cannot be inspected.
4. Keep implementation fixes out of Codex-QA tasks; QA may only write scoped reports.
5. When a data generator mutates output during QA, restore or verify clean worktree before leaving the repo.
6. Do not promote imported data from staging to public state without an explicit admin review task.
