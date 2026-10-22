# PR93 Supabase Webhook Sync Boundary v0

## Result

PR93 defines the future Supabase webhook sync boundary only.

PR93 does not create a Supabase webhook, Supabase migration, webhook runtime, webhook secret, Laravel sync consumer, Redis production configuration, server configuration, deployment, external delivery service, or data repo mutation.

Any future sync must be one-way, idempotent, minimal-payload, and derived only from approved public event types. It must never deliver raw database rows or private founder/admin/payment/API-key/metering fields.

## Purpose

This PR defines the checkpoint boundary for future one-way asynchronous event delivery from reviewed public 123Charts data into a future Laravel gateway or Redis cache layer.

Machine-readable contract:

- `ops/contracts/supabase-webhook-sync-boundary.json`

## Scope

PR93 is contract/spec only. It documents:

- disabled-by-default sync posture;
- one-way event source rules;
- payload allow/deny boundaries;
- idempotency and retry requirements;
- data drift handling;
- Supabase, Laravel, Redis, server, deploy, and data repo checkpoint triggers.

## Non-Goals

PR93 does not implement:

- Supabase webhook runtime;
- Supabase migration;
- webhook route;
- webhook secret;
- Redis production config;
- Laravel sync consumer;
- Laravel runtime;
- PHP files;
- server config;
- deploy;
- external delivery service;
- event delivery runtime;
- full-table polling;
- I/O-heavy bulk sync;
- raw database row delivery;
- private founder, admin, payment, API-key, or metering fields;
- internal Signal Score or Source Confidence internals;
- data repo mutation.

## Current State

PR91 defined the future Laravel gateway boundary. PR92 added static disabled-scaffold files only. PR93 does not modify those scaffold files and does not create runtime integration.

## Relationship To PR83 Event-Outbox Contract

PR83 defines the one-way async event-outbox model in:

- `ops/contracts/event-outbox.json`
- `docs/PR83_EVENT_OUTBOX_ONE_WAY_SYNC_CONTRACT_V0.md`

PR93 inherits that posture. Future webhook sync must remain one-way, idempotent, bounded, public-only, and checkpointed. PR93 does not create the outbox producer, webhook runtime, consumer runtime, or delivery runtime.

## Relationship To PR91 Laravel Gateway Boundary

PR91 remains the authoritative Laravel gateway boundary. Future Laravel gateway consumption may only use reviewed public snapshots or approved one-way event payloads after explicit checkpoint approval.

PR93 does not enable Laravel, Composer, PHP runtime, customer access, API-key runtime, metering runtime, Redis production use, or server config.

## Relationship To PR92 Disabled Scaffold

PR92 created a static disabled scaffold. PR93 does not modify `gateway/**`, does not add PHP files, and does not turn the scaffold into a Laravel application.

## Disabled-By-Default Sync Posture

The PR93 contract requires these default flags to remain `false`:

| Flag | Default |
| --- | --- |
| `SUPABASE_WEBHOOK_SYNC_ENABLED` | `false` |
| `SUPABASE_WEBHOOK_RUNTIME_ENABLED` | `false` |
| `SUPABASE_WEBHOOK_SECRET_CONFIGURED` | `false` |
| `LARAVEL_SYNC_CONSUMER_ENABLED` | `false` |
| `REDIS_GATEWAY_CACHE_ENABLED` | `false` |
| `EVENT_DELIVERY_ENABLED` | `false` |

## One-Way Sync Model

Future sync, if approved later, must be:

- one-way from reviewed public source events to the downstream gateway/cache layer;
- asynchronous;
- idempotent;
- bounded by approved event source types;
- minimal-payload;
- fail-closed when prerequisites are unavailable.

## No Full-Table Polling

Future sync must not scan full tables in cron-like loops or request-time handlers. Full resync is a separate manual checkpointed operation only.

## No Raw Database Row Delivery

Webhook payloads must never deliver raw database rows, raw Supabase rows, raw payloads, or direct table dumps.

## No Private Fields

Webhook payloads must not include private founder, admin, payment, API-key, metering, credential, claim, telemetry, internal Source Confidence, or internal Signal Score fields.

## Event Source Allowlist

Allowed future event source types:

- `project_published`
- `project_archived`
- `project_public_fields_updated`
- `changelog_published`
- `source_link_verified`
- `profile_claimed_public`
- `profile_removed_public`
- `snapshot_ready`

## Event Source Denylist

Denied event source types:

- `submitted_private`
- `pending_private`
- `quarantined_private`
- `scouted_private`
- `admin_review_private`
- `payment_private`
- `api_key_private`
- `metering_private`
- `raw_database_row`

## Payload Field Denylist

Denied payload fields:

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
- `service_role_credential`
- `webhook_credential`
- `raw_database_row`
- `raw_payload`
- `private_telemetry`
- `source_confidence_internal`
- `signal_score_internal`
- `claim_credential`

## Idempotency Requirement

Every future event must carry a stable idempotency key. Duplicate idempotency keys must be treated as already processed.

Recommended key shape:

```text
event_source_type:public_record_ref:schema_version:public_change_revision
```

## Retry And Backoff Requirement

Future delivery must use bounded retries with exponential backoff and jitter. Failed delivery must not zero out public scores, remove reviewed public data, or replace the last successful snapshot.

## Data Drift Handling

The reviewed source system wins. Future consumers reconcile by `public_record_ref`, `schema_version`, and idempotency key history. A cached public record may be marked stale, but replacement facts must not be invented.

## Webhook Secret Policy

PR93 configures no webhook secret and adds no placeholder secret. Future secret configuration requires explicit human checkpoint approval and must not be stored in the repository.

## Supabase Migration Boundary

PR93 adds no Supabase migration, trigger, schema change, or webhook runtime. Any future Supabase schema or webhook runtime change requires an explicit human checkpoint.

## Redis Production Boundary

PR93 adds no Redis production config and keeps `REDIS_GATEWAY_CACHE_ENABLED` false. Future Redis production use requires an explicit human checkpoint.

## Laravel Consumer Boundary

PR93 adds no Laravel sync consumer, PHP files, Composer setup, routes, bootstrap files, or Laravel runtime. Future consumer runtime requires an explicit human checkpoint.

## Server And Deploy Boundary

PR93 adds no server config, deploy config, deployment script, external service connection, production env config, or production secret. Any future server or deploy change requires an explicit human checkpoint.

## Human Checkpoint Triggers

Human checkpoint approval is required before:

- `supabase_schema_change`
- `supabase_webhook_runtime`
- `supabase_webhook_secret`
- `laravel_sync_consumer`
- `redis_production_usage`
- `server_config`
- `live_deploy`
- `external_service_connection`
- `event_delivery_runtime`
- `data_repo_mutation`

## PR94 QA Expectations

PR94 may verify PR91, PR92, and PR93 boundaries after PR93 merges and post-merge cleanup is complete. PR94 must not be started by PR93.

Expected PR94 checks include:

- contract file exists;
- sync flags remain disabled;
- no Supabase migration is added;
- no webhook runtime route is added;
- no webhook secret is configured;
- no Redis production config is added;
- no Laravel sync consumer is added;
- no server/deploy config is modified;
- no data repo mutation occurs.

## Repo Inspection Evidence

| Evidence Item | PR93 Result |
| --- | --- |
| No Supabase migration added | PASS |
| No webhook runtime route added | PASS |
| No webhook secret configured | PASS |
| No Redis production config added | PASS |
| No Laravel sync consumer added | PASS |
| No server/deploy config modified | PASS |
| No data repo mutation | PASS |

## What This PR Does Not Do

PR93 does not create a Supabase webhook, Supabase migration, webhook runtime, webhook secret, Laravel sync consumer, Redis production configuration, server configuration, deployment, external delivery service, or data repo mutation.
