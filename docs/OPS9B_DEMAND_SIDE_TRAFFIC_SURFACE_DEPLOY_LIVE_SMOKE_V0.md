# OPS9B Demand-Side Traffic Surface Deploy + Live Smoke v0

Date: 2026-06-20
Role: Codex-QA / Deploy-QA
Result: LIVE_PASS
Exact deployed SHA: `3234ef79f430569230aabc55b02060092013503d`

## Result

OPS9B deployed the exact approved `origin/main` SHA to production and completed
post-deploy live smoke.

The deployment used the existing production host checkout and the documented
deploy script. No new environment variables, payment flags, secret flags,
server config, Supabase schema, data-repo files, product/runtime code, or
public-route implementation was changed in this OPS9B evidence task.

GROWTH0, BETA1, I18N0, PR101, and any new traffic task were not started.

## Human Approval

The deployment was executed only after explicit human approval naming the exact
SHA:

```text
我确认部署 123Charts origin/main SHA 3234ef79f430569230aabc55b02060092013503d 到生产服务器，不启用任何新 env/payment/secret flag。
```

## Precondition

OPS9C merged first and resolved the OPS9B local blockers recorded in PR #150:

- `OPS9B` now resolves through `npm run agent:scope:check -- OPS9B`.
- `landscape:check` accepts the PR123-approved finite
  `/tasks/evaluate-ai-builder-infrastructure` route only when the task discovery
  checker passes.
- Broad `/tasks`, `/zh-CN`, `/landscape/sectors`, unsafe sitemap entries, and
  under-threshold task slugs remain rejected.

## Approved Deploy SHA

| Item | Evidence | Result |
| --- | --- | --- |
| Approved deploy SHA | `3234ef79f430569230aabc55b02060092013503d` | PASS |
| Local `main` before OPS9B | `HEAD == origin/main == 3234ef79f430569230aabc55b02060092013503d` | PASS |
| PR122-PR131 chain present | Local history includes PR122 through PR131 and OPS9C PR #151 before deploy | PASS |
| Deployed production SHA | Deploy script output: `production deploy completed at 3234ef79f430569230aabc55b02060092013503d` | PASS |

## Scope

OPS9B records deployment and smoke evidence only. It does not modify
product/runtime code, routes, feature flags, server config in git, deployment
scripts, secrets, environment files, Supabase schema, payment settings, API key
runtime, MCP runtime, Laravel runtime, customer access, outreach tooling, or
`/Users/rainie/Desktop/88cn-index-data`.

## Pre-Deploy Validation Matrix

| Check | Result | Notes |
| --- | --- | --- |
| `git status --short --branch` | PASS | Clean `main...origin/main` |
| `git rev-parse HEAD` | PASS | `3234ef79f430569230aabc55b02060092013503d` |
| `git rev-parse origin/main` | PASS | `3234ef79f430569230aabc55b02060092013503d` |
| Data repo status | PASS | `/Users/rainie/Desktop/88cn-index-data` clean on `main...origin/main` |
| `npm run verify:day0` | PASS | Includes docs, policy, and third-party checks |
| `npm run policy:scan` | PASS | Public wording guard passed |
| `npm run third-party:check` | PASS | Notice guard passed |
| `npm run agent:redact:check` | PASS | Redaction guard passed |
| `npm run agent:batch:check` | PASS | 37 batches, 144 roadmap tasks, 80 skeleton tasks |
| `npm run agent:train-plan:check` | PASS | Current train-plan dry run passed |
| `npm run agent:scope:check -- OPS9B` | PASS | OPS9B registry resolved after OPS9C |
| `npm run lint` | PASS | No ESLint errors |
| `npm run typecheck` | PASS | TypeScript check passed |
| `npm run build` | PASS | Next build generated `/landscape`, one finite task route, and four alternatives routes |
| `npm run agent:gate` | PASS | Full local agent gate passed |
| `node scripts/check-landscape-boundary.mjs` | PASS | Accepts approved finite task route with task-discovery evidence |
| `npm run landscape:check` | PASS | Wrapper check passed |
| `node scripts/check-task-discovery-boundary.mjs` | PASS | Finite task route boundary passed |
| `node scripts/check-sector-density-boundary.mjs` | PASS | Sector-density boundary passed |
| `npm run report-distribution-pack:generate -- --dry-run` | PASS | 4 reports, 7 files, all external-write safety flags false |

## Deployment Command

The deploy command run on the production host checkout was:

```bash
cd /var/www/123charts
BASE_URL=https://123charts.com scripts/agent/deploy-production.sh --confirm --commit 3234ef79f430569230aabc55b02060092013503d
```

The script completed the fixed-SHA checkout, dependency install, Day 0
verification, production build, PM2 restart, PM2 save/status, Nginx config test,
Nginx reload, local smoke, live smoke, and final deployed-SHA assertion.

## PM2 / Nginx / TLS / DNS Summary

| Area | Result | Evidence |
| --- | --- | --- |
| PM2 | PASS | `123charts-web` restarted and remained `online` |
| Nginx config | PASS | `nginx: configuration file /etc/nginx/nginx.conf test is successful` |
| Local smoke from production host | PASS | `/api/healthz`, `/`, `/projects`, `/submit`, `/geo-checker`, `/sitemap.xml`, `/robots.txt`, `/admin` returned 200 |
| Live smoke from production host | PASS | Same route set returned 200 through `https://123charts.com` |
| External live smoke from local workstation | PASS | `BASE_URL=https://123charts.com scripts/agent/smoke-live.sh` returned `live smoke passed` |

## Baseline Public Route Smoke Matrix

| Route | Result |
| --- | --- |
| `/` | 200 |
| `/projects` | 200 |
| `/reports` | 200 |
| `/reports/early-ai-project-machine-readability-2026` | 200 |
| `/geo-checker` | 200 |
| `/submit` | 200 |
| `/founders` | 200 |
| `/genesis` | 200 |
| `/alpha-feed` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |

## Demand-Side Route Smoke Matrix

| Route | Result |
| --- | --- |
| `/landscape` | 200 |
| `/tasks/evaluate-ai-builder-infrastructure` | 200 |
| `/alternatives/aurora-code-vs-nucleus-ml` | 200 |
| `/alternatives/nucleus-ml-vs-vectorbase` | 200 |
| `/alternatives/complykit-vs-pulse-analytics` | 200 |
| `/alternatives/aurora-code-vs-vectorbase` | 200 |

## Negative Route Smoke Matrix

| Probe | Expected | Result |
| --- | --- | --- |
| `/tasks` | No broad task index | 404 |
| `/tasks/review-model-search-infrastructure` | Under-threshold task absent | 404 |
| `/tasks/unknown-task-slug` | Unknown task absent | 404 |
| `/zh-CN` | I18N route absent | 404 |
| `/landscape/sectors` | Sector sub-route absent | 404 |
| `/alternatives/vectorbase-vs-aurora-code` | Reverse duplicate absent | 404 |

## Disabled Route Smoke Matrix

| Route | Method | Result |
| --- | --- | --- |
| `/api/mcp` | GET | 503 Problem Details |
| `/api/mcp` | POST | 503 Problem Details |
| `/api/payments/featured-signals/checkout` | GET | 503 Problem Details |
| `/api/payments/featured-signals/checkout` | POST | 503 Problem Details |
| `/api/alpha-feed/api-keys` | GET | 503 Problem Details |
| `/api/alpha-feed/api-keys` | POST | 503 Problem Details |
| `/api/alpha-feed/buyer-interest` | GET | 503 Problem Details |
| `/api/alpha-feed/buyer-interest` | POST | 503 Problem Details |

No disabled MCP, payment, API-key, or buyer-interest surface activated during
the OPS9B deploy.

## Sitemap Verification

Live `/sitemap.xml` returned 200 with 36 URLs.

Required demand-side entries were present:

- `/landscape`
- `/tasks/evaluate-ai-builder-infrastructure`
- `/alternatives/aurora-code-vs-nucleus-ml`
- `/alternatives/nucleus-ml-vs-vectorbase`
- `/alternatives/complykit-vs-pulse-analytics`
- `/alternatives/aurora-code-vs-vectorbase`

Forbidden sitemap entries were absent:

- `/api`, `/admin`, `/mcp`, `/payments`, `api-keys`, `buyer-interest`
- `/private`, `/submitted`, `/pending`, `/quarantined`, `/scouted`, `/rejected`
- `/zh-CN`, `/landscape/sectors`
- `/alternatives/vectorbase-vs-aurora-code`
- under-threshold or unknown task slugs

## Robots Verification

Live `/robots.txt` returned 200 and includes:

- `Disallow: /admin/`
- `Disallow: /api/`
- `Disallow: /preview/`
- `Disallow: /claim/`
- `Disallow: /submit/`
- `Sitemap: https://123charts.com/sitemap.xml`

## Security Header Summary

Checked `/`, `/landscape`, `/tasks/evaluate-ai-builder-infrastructure`,
`/alternatives/aurora-code-vs-nucleus-ml`, and `/api/mcp`.

All checked responses included:

- `x-content-type-options`
- `referrer-policy`
- `permissions-policy`
- `x-frame-options` and/or `content-security-policy`
- expected cache policy for static pages or `no-store` for disabled API

## Copy Boundary Live Smoke

Rendered live HTML for the home page, landscape page, finite task page, and an
alternatives page was scanned for the public-language-ban term set. No forbidden
public-copy match was found in the checked live surfaces.

## Report Distribution Dry-Run Safety

`npm run report-distribution-pack:generate -- --dry-run` returned a finite local
draft plan:

- 4 reports
- 7 files
- all safety flags false for external writes, email send, DM send, social post,
  platform login, CRM write, PII inclusion, browser session export, data-repo
  mutation, and deploy

## Data Leak Scan

Live sitemap and checked HTML did not expose private/admin/payment/API-key/MCP
surfaces, unsafe lifecycle states, reverse alternatives duplicates, broad task
index, under-threshold task slugs, `/zh-CN`, or `/landscape/sectors`.

The disabled-route probes returned 503 Problem Details instead of activating
write-capable behavior.

## Data Repo Cleanliness

`/Users/rainie/Desktop/88cn-index-data` remained clean on `main...origin/main`.
OPS9B did not mutate the data repo.

## Findings By Severity

- P0: none.
- P1: none.
- P2: none.
- P3: existing generic `scripts/agent/smoke-live.sh` still covers only the
  baseline route set; OPS9B used an expanded manual probe for demand-side,
  disabled-route, sitemap, robots, header, and copy boundaries.

## Sidecar Issues

No active OPS9B blocker remains after this rerun.

OPS9C resolved the prior P1 blockers before deployment:

- OPS9B scope-check registration.
- Landscape checker lifecycle acceptance for the PR123 finite task route.

## What This Task Does Not Do

- Does not create new env, payment, or secret flags.
- Does not change product/runtime code.
- Does not change routes, sitemap runtime, robots runtime, or feature flags.
- Does not change deployment scripts or server config in git.
- Does not write to Supabase.
- Does not write to `/Users/rainie/Desktop/88cn-index-data`.
- Does not start GROWTH0, BETA1, I18N0, PR101, or any new traffic task.
