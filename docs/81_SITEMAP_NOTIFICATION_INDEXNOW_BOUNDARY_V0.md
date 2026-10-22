# PR78 Sitemap Notification + IndexNow Boundary v0

## Purpose

PR78 defines the safe boundary for future sitemap notification and IndexNow dry-run work.

This task is boundary-only. It adds a machine-readable contract and local checker, but it does not modify sitemap runtime behavior, deploy, contact search engines, create notification queues, or send external pings.

No external search endpoint is called in PR78.

## Non-Goals

PR78 does not:

- call Google APIs;
- send IndexNow live pings;
- contact Bing, Yandex, Seznam, or any IndexNow endpoint;
- modify `app/sitemap.ts`;
- change public routes, API routes, MCP behavior, payment behavior, server config, deploy config, or `88cn-index-data`;
- add dependencies;
- commit IndexNow keys or require an environment secret;
- start PR79.

## Google Indexing API Prohibition

Google Indexing API is forbidden for normal 123Charts project, report, category, stack, collection, vertical, alternatives, profile, and intent pages.

The default path for discoverability remains reviewed sitemap inclusion only. Any future exception would require a separate human decision outside PR78 and must not be introduced by this train.

## IndexNow Default

IndexNow live ping is disabled by default.

Live ping requires a human checkpoint. PR78 does not create live ping code, endpoint calls, queue workers, cron jobs, server config, or key handling. PR79 remains dry-run only unless a later explicit approval changes that boundary.

## Dry-Run Policy

Dry-run is allowed for future QA only when it:

- reads from local sitemap-eligible URL sources;
- writes evidence locally;
- performs no external network request;
- uses no committed key;
- reports what would have been notified without sending a ping.

## Sitemap Source Boundary

Allowed URL sources:

- `sitemap_published_pages_only`;
- `allowlisted_intent_registry_published_only`.

Denied URL sources:

- `submitted`;
- `pending`;
- `quarantined`;
- `scouted`;
- `rejected`;
- `admin`;
- `api`;
- `mcp`;
- `payment`.

Sitemap eligibility remains controlled by the existing published and reviewed route rules. Submitted, pending-review, quarantined, scouted, rejected, admin, API, MCP, payment, and private surfaces must not enter sitemap notification candidates.

## Notification Contract

Machine-readable contract:

```text
ops/indexing/sitemap-notification-boundary.json
```

Required PR78 posture:

- `google_indexing_api_allowed: false`;
- `indexnow_live_ping_default: false`;
- `live_ping_requires_human_checkpoint: true`;
- `dry_run_allowed: true`;
- `external_network_calls_in_pr78: false`;
- `sitemap_runtime_change_allowed_in_pr78: false`.

Future notification systems must be idempotent and allowlisted. A future implementation must dedupe by normalized URL plus sitemap last-modified value or an equivalent reviewed key. Public routes must never recalculate notification candidates by crawling external sources at request time.

## Key Handling

No keys are committed in PR78.

Future key handling must use human-managed secret storage outside the repository after an explicit checkpoint. PR78 does not require an environment variable, secret file, production config, GitHub secret, or server change.

## Checker

Local checker:

```text
npm run sitemap-notification:check
```

The checker verifies:

- the boundary document exists;
- the boundary JSON exists;
- Google Indexing API remains forbidden;
- IndexNow live ping defaults to disabled;
- live ping requires a human checkpoint;
- dry-run is allowed;
- no PR78 external network call is allowed;
- denied URL source states stay denied;
- no IndexNow key-like material is committed;
- no runtime sitemap, app, public, deploy, middleware, package-lock, or library file changed in PR78;
- package script wiring exists.

## PR79 QA Expectations

PR79 should remain QA-only unless a human checkpoint explicitly changes its scope.

Expected PR79 work:

- dry-run candidate extraction only;
- no live ping;
- no Google API call;
- no external search endpoint contact;
- no deploy;
- no production secret;
- no data repository mutation;
- no PR80 start.

## Definition Of Done

- [x] Sitemap notification boundary exists.
- [x] IndexNow live ping default is disabled.
- [x] Google Indexing API is explicitly forbidden.
- [x] Human checkpoint is required for live external ping.
- [x] Dry-run-only policy is documented.
- [x] Allowed and denied URL sources are defined.
- [x] Pending, scouted, quarantined, rejected, admin, API, MCP, and payment URLs are denied.
- [x] Checker exists and passes.
- [x] Negative probes are defined and pass.
- [x] No external network call occurs.
- [x] No deployment occurs.
- [x] No sitemap runtime expansion is introduced.
- [x] PR79 remains not started and human-checkpointed.

## What This PR Does Not Do

PR78 does not deploy, live ping, call Google APIs, contact IndexNow endpoints, change sitemap runtime behavior, expose Public API or MCP changes, touch payment, commit keys, mutate `88cn-index-data`, or start PR79.
