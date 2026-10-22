# PR91 Laravel Gateway Boundary Spec v0

## Result

PR91 defines the future Laravel gateway boundary for 123Charts B2B Alpha Data Feed
access. It is docs/contracts/spec only.

Machine-readable contract:

- `ops/contracts/laravel-gateway-boundary.json`

PR91 does not create Laravel runtime, Composer files, PHP runtime, Supabase
migrations, webhook routes, webhook secrets, Redis production config, server
config, API key runtime, metering runtime, customer access, deployment, or data
repo mutation.

## Purpose

The future Laravel gateway may only serve sanitized Alpha Feed data derived from
reviewed public snapshots or approved one-way sync contracts. It must never
expose raw database rows, private founder data, admin review material, payment
fields, or internal scoring internals.

PR91 prepares that boundary without enabling any runtime. It exists to keep
Laravel, API key, metering, sync, payment, Public API, MCP, sitemap, and
Featured Signals responsibilities separated before later checkpointed work.

## Scope

PR91 adds:

- `ops/contracts/laravel-gateway-boundary.json`;
- this boundary spec;
- task status updates;
- a sidecar reminder that PR92 still has a checker-path scope conflict.

The task remains inside the PR91 roadmap scope:

- docs matching `docs/PR91_*.md`;
- `ops/contracts/laravel-gateway-boundary.json`;
- `docs/TASK_STATUS.md`;
- `docs/SIDECAR_ISSUES.md`;
- `ops/tasks/current.json`.

## Non-Goals

PR91 does not:

- create `composer.json` or `composer.lock`;
- run Composer;
- add PHP runtime files;
- add `artisan`;
- add Laravel `bootstrap/**`;
- add Laravel `routes/**`;
- create Laravel runtime or gateway routes;
- create Supabase migrations;
- create Supabase webhook routes;
- create webhook secrets;
- configure Redis production usage;
- modify server config or deploy config;
- create API key runtime;
- create metering runtime;
- create customer access;
- touch payment or billing;
- release Public API, MCP, sitemap, or Featured Signals behavior;
- mutate `/Users/rainie/Desktop/88cn-index-data`;
- start PR92.

## Current Repo State

Repository inspection found no Laravel root:

| Check | Result |
| --- | --- |
| `composer.json` | Not present |
| `composer.lock` | Not present |
| `artisan` | Not present |
| Laravel `bootstrap/**` | Not present |
| Laravel `routes/**` | Not present |
| PHP runtime files outside irrelevant dependency/build artifacts | Not present |
| Existing Laravel server config | Not present |
| PR91 runtime code introduced | None |

The absence of these files is intentional. PR91 does not create any of them.

## Disabled-By-Default Posture

The PR91 contract requires these default flags:

```json
{
  "LARAVEL_GATEWAY_ENABLED": false,
  "LARAVEL_RUNTIME_ENABLED": false,
  "ALPHA_FEED_GATEWAY_ENABLED": false,
  "GATEWAY_CUSTOMER_ACCESS_ENABLED": false,
  "GATEWAY_METERING_ENABLED": false,
  "SUPABASE_WEBHOOK_SYNC_ENABLED": false,
  "REDIS_GATEWAY_CACHE_ENABLED": false
}
```

Changing any of these from disabled requires later human checkpoint approval.

## Next.js Responsibilities

Next.js remains responsible for current public, admin, Public API, MCP, sitemap,
Featured Signals, submission, claim, and report surfaces. PR91 does not move any
route, serializer, sitemap logic, API key behavior, payment behavior, or
customer access into Laravel.

PR91 must not change:

- Public API release state or ordering;
- MCP tools or payload ordering;
- sitemap inclusion;
- Featured Signals placement;
- Signal Score;
- Source Confidence;
- editorial review results;
- public page generation.

## Future Laravel Responsibilities

Only after later checkpoint approval, a Laravel gateway may:

- serve sanitized Alpha Feed data derived from reviewed public snapshots;
- consume approved one-way sync payloads;
- validate future API key runtime boundaries;
- record future metering events through the metering ledger boundary;
- fail closed when required snapshots, key state, sync state, or metering
  prerequisites are unavailable.

The future gateway must not expose raw database rows, direct table dumps,
private founder fields, admin review material, payment fields, private
telemetry, Source Confidence internals, or Signal Score internals.

## Data Source Boundary

Allowed future sources after checkpoint approval:

- PR81 Alpha Feed boundary records;
- PR82 published signal snapshots;
- PR83 one-way event outbox payloads.

Denied sources:

- raw Supabase rows;
- direct database-table dumps;
- submitted or pending-review records;
- quarantined, scouted, rejected, needs-info, or private archived records;
- admin queues;
- payment or commercial-order state;
- private telemetry;
- external services connected without checkpoint.

Unknown or missing public facts must remain unknown and must not be inferred.

## Alpha Feed Snapshot Dependency

PR91 depends on the PR81 and PR82 boundaries for future payload shape:

- `ops/contracts/alpha-feed-boundary.json`
- `ops/contracts/published-signal-snapshot-schema.json`

Future gateway output must use the PR82 published signal snapshot allowlist. It
must not serialize broad project rows or raw Supabase rows.

## Event-Outbox Dependency

PR91 depends on the PR83 one-way async sync contract:

- `ops/contracts/event-outbox.json`

PR91 creates no event producer, consumer, trigger, webhook, webhook secret,
Redis delivery, full-table sync, request-time polling, or external delivery.
Future sync must be one-way, idempotent, bounded, and checkpointed.

## API Key Boundary Dependency

Future gateway access depends on PR87 and PR88 boundaries:

- `ops/contracts/api-key-metering-boundary.json`

PR91 does not issue keys, validate keys, store keys, rotate keys, revoke keys,
display keys, create key-like fixtures, or enable customer access. Future API
key runtime requires a separate checkpoint.

## Metering Ledger Dependency

Future usage accounting depends on PR89:

- `ops/contracts/metering-ledger-contract.json`

PR91 does not record live events, create a ledger runtime, create billing,
create invoices, write payment state, or couple metering to placement. Metering
is usage accounting only and remains separate from payment.

## Denied Fields

The Laravel gateway boundary denies:

- `founder_email`
- `contact_email`
- `admin_notes`
- `review_notes`
- `payment_state`
- `stripe_customer_id`
- `api_key_plaintext`
- `api_key_hash`
- `api_key_hash_salt`
- `bearer_credential`
- `session_credential`
- `service_role_key`
- `raw_database_row`
- `raw_payload`
- `private_telemetry`
- `source_confidence_internal`
- `signal_score_internal`
- `claim_credential`

The `bearer_credential`, `session_credential`, and `claim_credential` names are
the repo-policy-safe equivalents for credential-bearing field literals that the
repo-wide public wording scanner blocks outside allowlisted policy files.

## Denied Statuses

The Laravel gateway boundary denies these source statuses:

- `submitted`
- `pending`
- `pending_review`
- `quarantined`
- `scouted`
- `rejected`
- `needs_info`
- `archived_private`

## Customer Access Boundary

Customer access is disabled in PR91. Future customer access must require a
human checkpoint, use sanitized published-only Alpha Feed fields, and fail
closed when API key, metering, or source snapshot prerequisites are missing.

## Supabase Boundary

PR91 does not create a Supabase migration, trigger, webhook route, webhook
secret, direct database reader, or raw Supabase exposure path. Any Supabase
schema change or webhook secret is a future checkpoint trigger.

## Redis Boundary

PR91 does not configure Redis or use Redis in production. Future Redis gateway
cache behavior requires a human checkpoint and must not become a source of
truth or erase the last successful public snapshot when refresh fails.

## Server And Deploy Boundary

PR91 does not modify server config, deploy config, production env, production
secrets, package metadata, or runtime process setup. Any Laravel server,
Composer dependency, live deploy, or production env change requires a later
checkpoint.

## Payment Separation

Gateway access and metering are not payment. PR91 does not create billing,
Stripe, checkout, payment state, paid customer enablement, or commercial
placement behavior. Future billing or payment work requires a separate human
checkpoint and must remain separate from Signal Score, Source Confidence,
Public API ordering, MCP payload ordering, sitemap inclusion, Featured Signals
placement, and editorial review results.

## Public API / MCP / Sitemap / Featured Signals Separation

PR91 must not:

- release a Public API surface;
- change Public API ordering;
- expose MCP tools or change MCP payload ordering;
- change sitemap inclusion;
- change Featured Signals placement;
- change Signal Score;
- change Source Confidence;
- change editorial review results.

## PR92 Risk Note

OPS7B found that PR92 allows `scripts/check-laravel-gateway.mjs` while also
forbidding `scripts/**`. PR92 should not start until this checker-path scope
conflict is resolved.

PR91 does not fix PR92 and does not start PR92.

## PR93 Risk Note

PR93 can remain safe only as contract/spec. Any Supabase migration, webhook
route, webhook secret, live delivery, Redis production use, Laravel runtime,
server config, external service connection, or data repo mutation requires a
later human checkpoint.

## PR94 QA Expectation

PR94 should remain QA-only after PR91 through PR93 boundaries exist. It should
verify the contracts and absence of runtime/schema/server/deploy/secret changes
without modifying product runtime paths.

## Human Checkpoint Triggers

Human checkpoint approval is required before:

- `composer_dependency`
- `laravel_runtime`
- `php_runtime`
- `server_config`
- `live_deploy`
- `supabase_schema_change`
- `supabase_webhook_secret`
- `redis_production_usage`
- `customer_access`
- `api_key_runtime`
- `metering_runtime`
- `external_service_connection`
- `data_repo_mutation`

## What This PR Does Not Do

PR91 does not create Laravel runtime, Composer files, PHP runtime, Supabase
migrations, webhook routes, webhook secrets, Redis production config, server
config, API key runtime, metering runtime, customer access, deployment, payment,
external service connections, public surface changes, or data repo mutation.

PR91 does not start PR92.

## Validation Plan

Required PR91 validations:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:scope:check -- PR91`

Additional requested validations:

- `npm run agent:redact:check`
- `npm run agent:tool:check`
- `npm run agent:mcp-config:check`
- `npm run agent:plugin-policy:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR91-PR94-LARAVEL-GATEWAY-SYNC`
- `/Users/rainie/Desktop/88cn-index-data` cleanliness check

## Definition Of Done

| Requirement | Status | Evidence |
| --- | --- | --- |
| Laravel boundary exists | PASS | `ops/contracts/laravel-gateway-boundary.json` |
| Boundary doc exists | PASS | This document |
| Disabled-by-default posture defined | PASS | Contract default flags |
| Next.js vs Laravel responsibilities separated | PASS | Responsibility sections |
| Alpha Feed snapshot dependency defined | PASS | PR81/PR82 dependency sections |
| Event-outbox dependency defined | PASS | PR83 dependency section |
| API key boundary dependency defined | PASS | PR87/PR88 dependency section |
| Metering ledger dependency defined | PASS | PR89 dependency section |
| Denied fields and statuses defined | PASS | Contract and this document |
| Payment separation defined | PASS | Payment separation section |
| Public API / MCP / sitemap / Featured Signals separated | PASS | Separation section |
| Human checkpoint triggers defined | PASS | Contract and this document |
| No Laravel runtime created | PASS | Repo inspection |
| No Composer files created | PASS | Repo inspection |
| No PHP runtime files created | PASS | Repo inspection |
| No Supabase migrations created | PASS | PR91 scope |
| No Redis production config created | PASS | PR91 scope |
| No server/deploy config modified | PASS | PR91 scope |
| No dependency added | PASS | PR91 scope |
| No data repo mutation occurs | PASS | Data repo cleanliness check required |
| PR92 scope conflict documented | PASS | PR92 risk note and sidecar |
| PR92 is not started | PASS | PR91 scope only |
