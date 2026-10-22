# PR92 Laravel Gateway Disabled Scaffold v0

## Result

PR92 creates static disabled-scaffold files only. It does not create a Laravel
application.

PR92 is human-checkpointed and must stop at MERGE_READY. It must not
auto-merge, deploy, or start PR93.

## Purpose

PR92 establishes a non-executable gateway scaffold boundary for possible future
123Charts B2B Alpha Feed infrastructure. The scaffold is static documentation,
machine-readable contract, non-executable example, and a local checker.

## Relationship To PR91

PR91 remains the authoritative Laravel gateway boundary. PR92 follows that
boundary by keeping all gateway behavior disabled and separating any possible
future Laravel gateway from current Next.js, Public API, MCP, sitemap, Featured
Signals, payment, API key, metering, and Supabase sync surfaces.

## Static Scaffold Files

PR92 adds:

- `gateway/README.md`
- `gateway/disabled-scaffold.contract.json`
- `gateway/disabled-scaffold.example.json`
- `scripts/check-laravel-gateway.mjs`

The `gateway/*` files are documentation-only, disabled-scaffold-only,
non-executable, and not-a-Laravel-application.

## Disabled-By-Default Flags

The scaffold contract requires these flags to remain `false`:

- `LARAVEL_GATEWAY_ENABLED`
- `LARAVEL_RUNTIME_ENABLED`
- `COMPOSER_DEPENDENCY_ENABLED`
- `PHP_RUNTIME_ENABLED`
- `SUPABASE_WEBHOOK_SYNC_ENABLED`
- `REDIS_GATEWAY_CACHE_ENABLED`
- `GATEWAY_CUSTOMER_ACCESS_ENABLED`
- `GATEWAY_API_KEY_RUNTIME_ENABLED`
- `GATEWAY_METERING_RUNTIME_ENABLED`

## Checkpoint Triggers

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

## Non-Goals

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
- data repo mutation.

## Checker Behavior

`scripts/check-laravel-gateway.mjs` uses Node standard library only. It verifies:

- required static scaffold files exist;
- required PR92 doc exists;
- all runtime flags are `false`;
- checkpoint triggers exist;
- denied file classes exist;
- denied data fields exist;
- Composer, Laravel root, and PHP runtime files are absent;
- PR92 changed files stay within allowed scope;
- no runtime route, API key runtime, metering runtime, Redis production config,
  server/deploy config, Supabase migration, or data repo marker is introduced;
- PR93 is not started.

The checker also supports `--root /tmp/...` fixture mode for negative probes.

## Negative Tests

Negative probes were run under `/tmp/123charts-pr92-*` and did not leave temp files
in the repository. These failing probes passed:

| Probe | Result |
| --- | --- |
| fake `composer.json` | PASS: checker failed fixture |
| fake `composer.lock` | PASS: checker failed fixture |
| fake `artisan` | PASS: checker failed fixture |
| fake `bootstrap/app.php` | PASS: checker failed fixture |
| fake `routes/web.php` | PASS: checker failed fixture |
| fake PHP runtime file | PASS: checker failed fixture |
| fake Supabase migration | PASS: checker failed fixture |
| fake deploy config | PASS: checker failed fixture |
| fake `.env.gateway` | PASS: checker failed fixture |
| fake runtime flag set to `true` | PASS: checker failed fixture |
| fake API key runtime flag set to `true` | PASS: checker failed fixture |
| fake metering runtime flag set to `true` | PASS: checker failed fixture |
| fake Redis production flag set to `true` | PASS: checker failed fixture |
| fake data repo mutation marker | PASS: checker failed fixture |

## Validation Results

| Command | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:tool:check` | PASS |
| `npm run agent:mcp-config:check` | PASS |
| `npm run agent:plugin-policy:check` | PASS |
| `npm run agent:batch:check` | PASS: 31 batches, 92 roadmap tasks, 80 skeleton tasks |
| `npm run agent:train-plan:check` | PASS |
| `node scripts/check-laravel-gateway.mjs` | PASS |
| `npm run agent:scope:check -- PR92` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR91-PR94-LARAVEL-GATEWAY-SYNC` | PASS |
| `/Users/rainie/Desktop/88cn-index-data` cleanliness check | PASS |

## PR93 Not Started

PR93 is not started by PR92. Any Supabase webhook sync boundary must wait for a
separate PR93 instruction after PR92 review and merge.

## What This PR Does Not Do

PR92 does not implement Laravel, Composer, PHP runtime, Supabase webhook,
Supabase migration, Redis production, server config, deploy, dependency,
customer access, API key runtime, metering runtime, data repo mutation, or PR93.
