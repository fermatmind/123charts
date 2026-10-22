# PR88 Disabled API Key Shell v0

## Purpose

PR88 adds a disabled-by-default API key shell for future Alpha Feed access. The
shell makes the disabled boundary explicit before any future enablement work.

## Default Disabled Posture

All server-side feature flags default to disabled. A flag is treated as enabled
only when its environment value is exactly `"true"`:

- `API_KEYS_ENABLED`
- `API_KEY_ISSUANCE_ENABLED`
- `CUSTOMER_ACCESS_ENABLED`
- `METERING_ENABLED`
- `BILLING_ENABLED`

The route remains disabled in PR88. No flag combination in this PR issues or
returns keys.

## Disabled Route Behavior

PR88 adds:

- `GET /api/alpha-feed/api-keys`
- `POST /api/alpha-feed/api-keys`

Both methods return `503` with `application/problem+json` and no key material.
The route does not read a request body, generate keys, read a database, write a
database, import Supabase, import Stripe, look up customers, look up payment
state, or emit metering events.

## Problem Details

```json
{
  "type": "https://123charts.com/problems/api-keys-disabled",
  "title": "API key access is disabled",
  "status": 503,
  "detail": "Alpha Data Feed API key access is not enabled for this environment.",
  "instance": "/api/alpha-feed/api-keys"
}
```

## Admin Placeholder UI

PR88 adds a read-only admin placeholder at `/admin/api-keys` and links it from
the admin dashboard.

The page:

- follows the existing admin guard pattern;
- states API key issuance is disabled;
- states no real keys exist in this shell;
- states future access requires admin review and an explicit human checkpoint;
- does not list customers;
- does not list keys;
- does not create keys;
- has no form submission;
- does not call an API key issuance endpoint.

## Relationship To PR87

PR87 defines the API key and metering boundary contract. PR88 implements only a
disabled shell consistent with that contract. It does not relax PR87 human
checkpoint requirements.

## Future PR89 And PR90 Scope

PR89 may define a metering ledger contract. PR90 must QA the API key and
metering boundary before any future enablement.

PR88 does not start PR89.

## Local Smoke Result

Local smoke was run against the PR88 worktree on `localhost:3100`.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/alpha-feed/api-keys` | PASS: `503 application/problem+json` |
| POST | `/api/alpha-feed/api-keys` | PASS: `503 application/problem+json` |

Both responses returned:

```json
{
  "type": "https://123charts.com/problems/api-keys-disabled",
  "title": "API key access is disabled",
  "status": 503,
  "detail": "Alpha Data Feed API key access is not enabled for this environment.",
  "instance": "/api/alpha-feed/api-keys"
}
```

No key material was returned.

## Validation Results

| Command | Result |
| --- | --- |
| `node scripts/check-api-key-shell.mjs` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:tool:check` | PASS |
| `npm run agent:mcp-config:check` | PASS |
| `npm run agent:plugin-policy:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR87-PR90-API-KEY-METERING-SHELL` | PASS |
| `npm run agent:scope:check -- PR88` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |

Note: the isolated PR88 worktree used temporary local symlinks for existing
dependencies and the read-only data repo during local validation. These symlinks
were removed before commit and were not committed.

## Negative Tests

`scripts/check-api-key-shell.mjs` uses temp fixtures under `/tmp/123charts-pr88-*`
and verifies these unsafe probes fail closed:

- fake flag default true;
- fake `crypto.randomBytes` key generation;
- fake plaintext key output;
- fake Supabase import;
- fake Stripe/payment import;
- fake metering runtime route;
- fake customer access route;
- fake Supabase migration;
- fake credential-like string;
- fake route returning `200` with key material.

## Human Checkpoint

PR88 is human-checkpointed by the PR87-PR90 train policy. It must stop at
MERGE_READY, must not auto-merge, must not deploy, and must not start PR89.

## No Real Key Issuance

PR88 does not issue, generate, return, store, list, revoke, rotate, or validate
real API keys.

## No Data Repository Mutation

PR88 does not read from or write to `/Users/rainie/Desktop/88cn-index-data`.

## What This PR Does Not Do

PR88 does not:

- implement real API key issuance;
- generate real or fake key-like material;
- store API keys;
- create customer login;
- create billing or payment logic;
- implement live metering;
- create metering runtime;
- create Supabase migrations;
- import Supabase clients in the disabled route;
- create Laravel runtime;
- add dependencies;
- connect to external services;
- mutate `/Users/rainie/Desktop/88cn-index-data`;
- deploy.
