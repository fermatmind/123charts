# 123Charts Laravel Gateway Disabled Scaffold

## Status

This directory is documentation-only, disabled-scaffold-only, non-executable,
and not-a-Laravel-application.

It is intentionally not a Composer project and intentionally does not contain
Laravel runtime files.

## Purpose

PR92 creates a static boundary scaffold for a possible future Laravel gateway
serving sanitized 123Charts B2B Alpha Feed data. The scaffold is a contract and
example only. It does not create a Laravel application.

The future gateway may only be considered after a later human checkpoint. It
must follow the PR91 Laravel Gateway Boundary Spec and may only serve sanitized
Alpha Feed data derived from reviewed public snapshots or approved one-way sync
contracts.

## Relationship To PR91

PR91 defines the Laravel gateway boundary:

- disabled by default;
- separated from Next.js public, admin, Public API, MCP, sitemap, and Featured
  Signals behavior;
- dependent on reviewed Alpha Feed snapshot contracts;
- dependent on the event-outbox boundary for future sync;
- dependent on API key and metering boundaries for any future access control or
  usage accounting;
- blocked from raw database row exposure, private founder/admin/payment fields,
  and internal scoring internals.

PR92 keeps that boundary static. It does not enable any runtime path.

## Files In This Scaffold

- `gateway/README.md`: this documentation-only scaffold note.
- `gateway/disabled-scaffold.contract.json`: machine-readable disabled gateway
  contract.
- `gateway/disabled-scaffold.example.json`: non-executable disabled posture
  example.

## Explicit Non-Goals

PR92 does not create:

- Laravel runtime;
- Composer setup;
- PHP runtime;
- `composer.json`;
- `composer.lock`;
- `artisan`;
- `bootstrap/**`;
- `routes/**`;
- Supabase migration;
- webhook runtime;
- webhook secret;
- Redis production config;
- server config;
- deploy config or deploy script;
- dependency;
- customer access;
- API key runtime;
- metering runtime;
- data repo mutation;
- PR93 work.

## Disabled Posture

The scaffold contract requires all runtime flags to remain `false`:

- `LARAVEL_GATEWAY_ENABLED`
- `LARAVEL_RUNTIME_ENABLED`
- `COMPOSER_DEPENDENCY_ENABLED`
- `PHP_RUNTIME_ENABLED`
- `SUPABASE_WEBHOOK_SYNC_ENABLED`
- `REDIS_GATEWAY_CACHE_ENABLED`
- `GATEWAY_CUSTOMER_ACCESS_ENABLED`
- `GATEWAY_API_KEY_RUNTIME_ENABLED`
- `GATEWAY_METERING_RUNTIME_ENABLED`

## Future Checkpoint Triggers

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

## PR93 Boundary

PR93 must not start from PR92. PR92 only prepares a disabled static scaffold and
local checker. Any Supabase webhook sync boundary must be handled by a separate
PR93 instruction after PR92 is reviewed and merged.

