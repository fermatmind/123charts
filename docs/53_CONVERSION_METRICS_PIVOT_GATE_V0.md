# Conversion Metrics + Pivot Gate v0

## Summary

PR46 adds the first aggregate conversion metrics boundary for 123Charts. It creates an admin-only counter model, a guarded server-side write route, an admin summary page, and Day 30 / Day 60 / Day 100 pivot gate definitions.

## What Is Included

- `conversion_metric_daily_counts`: daily aggregate counters for report views, AI Search Readiness Checker runs, project submissions, and project claims.
- `conversion_pivot_gate_snapshots`: admin-only Day 30, Day 60, and Day 100 review snapshots.
- `/api/metrics/conversion`: server-side write route guarded by `INTERNAL_METRICS_WRITE_KEY` and `x-123charts-metrics-key`.
- `/admin/metrics`: admin-only summary view for aggregate counters and pivot gates.
- `npm run conversion-metrics:check`: static boundary checker.

## Data Boundary

The metrics layer stores aggregate counts only.

It does not store:

- founder email
- IP address
- user agent
- cookie identifiers
- third-party tracking identifiers
- submitted form payloads
- external analytics payloads

The write API is disabled until a server-only internal key is configured. Public pages do not call the metrics API, and no browser tracking script is added.

## Metric Keys

| Key | Surface examples | Collection boundary |
| --- | --- | --- |
| `report_view` | `/reports`, `/reports/early-ai-project-machine-readability-2026` | Server-side only, aggregate count. |
| `geo_checker_run` | `/geo-checker` | Server-side only, aggregate count. |
| `project_submission` | `/submit` | Server-side only, aggregate count. |
| `project_claim` | `/claim` | Server-side only, aggregate count. |

## Pivot Gates

| Gate | Purpose | Required signals | Decision rule |
| --- | --- | --- | --- |
| Day 30 | Signal capture check | report view, checker run, submission, claim | Confirm aggregate capture works before adding conversion surfaces. |
| Day 60 | Founder action check | submission, claim | Compare aggregate founder actions against content and tool usage before expanding review capacity. |
| Day 100 | Pivot gate review | report view, checker run, submission, claim | Use aggregate trend evidence to decide whether to continue, narrow, or redesign the founder acquisition loop. |

## Non-Goals

- No third-party tracking scripts.
- No public launch automation.
- No sitemap changes.
- No project publication side effects.
- No private founder data collection.
- No payment or paid feature integration.
- No MCP, worker, cron, Redis, or deploy changes.

## Validation

| Command | Result |
| --- | --- |
| `npm run conversion-metrics:check` | PASS |
| `npm run agent:scope:check -- PR46` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run public-surface:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## Sidecar Note

`agent:gate` does not yet run `conversion-metrics:check` because PR46 scope does not include `scripts/agent/gate.sh`. A later OPS gate-maintenance task can add it with the other post-PR42 specialized checks.
