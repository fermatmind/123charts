# PR90 API Key + Metering QA v0

## Result

PASS_WITH_SIDECAR.

PR90 verifies the PR87, PR88, and PR89 API key plus metering boundary as a
closed QA-only train. No product code, runtime route, schema, package,
deployment, external service, or data repository mutation was added.

## Repo State

| Check | Result | Evidence |
| --- | --- | --- |
| Branch before work | PASS | `main` |
| Local main equals origin/main | PASS | Both resolved to `382c2a0d19859c14125de1e6e28bdf6f1c221e9b`. |
| Worktree before branch | PASS | Clean. |
| PR87 merged | PASS | PR #105 merge commit `3ce2d3abd95e21996051ea234fe93a3ded84893f` is included in `origin/main`. |
| PR88 merged | PASS | PR #107 merge commit `ff6e6f019cd23b3ccf0188ea0f1816b2c8fecf5c` is included in `origin/main`. |
| PR89 merged | PASS | PR #108 merge commit `382c2a0d19859c14125de1e6e28bdf6f1c221e9b` is included in `origin/main`. |
| PR90 roadmap object exists | PASS | `ops/tasks/roadmap.json` contains PR90. |
| PR87-PR90 train exists | PASS | `ops/trains/batches.json` contains `TRAIN-PR87-PR90-API-KEY-METERING-SHELL`. |
| Data repo check | PASS | `/Users/rainie/Desktop/88cn-index-data` remained clean on `main`. |

## PR87 / PR88 / PR89 Completion Matrix

| Task | Status | QA Result |
| --- | --- | --- |
| PR87 API Key Boundary + Metering Threat Model v0 | Merged | PASS |
| PR88 Disabled API Key Shell v0 | Merged | PASS |
| PR89 Metering Ledger Contract v0 | Merged | PASS_WITH_SIDECAR |

## PR87 Boundary QA

| Check | Result | Evidence |
| --- | --- | --- |
| API key boundary contract exists | PASS | `ops/contracts/api-key-metering-boundary.json` |
| Threat model doc exists | PASS | `docs/PR87_API_KEY_BOUNDARY_METERING_THREAT_MODEL_V0.md` |
| Defaults are false | PASS | `API_KEYS_ENABLED`, `API_KEY_ISSUANCE_ENABLED`, `METERING_ENABLED`, `CUSTOMER_ACCESS_ENABLED`, and `BILLING_ENABLED` are false in the contract. |
| Future keys must be hashed | PASS | Contract requires `future_storage: hashed_only`; doc forbids plaintext storage. |
| Future keys must be scoped | PASS | Contract requires scoped keys and separates Public API/MCP scopes. |
| Future keys must be revocable | PASS | Contract requires revocation and fail-closed revoked keys. |
| Future access must be rate-limited | PASS | Contract requires rate limits before enablement. |
| Future key actions must be auditable | PASS | Contract requires auditable revocation. |
| Payment/billing separation documented | PASS | PR87 doc states metering is not billing and must not create payment state or commercial placement. |
| Public API / MCP / sitemap separation documented | PASS | PR87 doc and contract prohibit score, ordering, sitemap, MCP, and editorial side effects. |
| Human checkpoint triggers documented | PASS | Runtime, issuance, customer access, payment, secrets, migrations, Laravel, external service, and data repo writes require review. |
| No API key runtime implemented by PR87 | PASS | PR87 is contract/docs only. |

## PR88 Disabled Shell QA

| Check | Result | Evidence |
| --- | --- | --- |
| Disabled shell route exists | PASS | `app/api/alpha-feed/api-keys/route.ts` |
| Route remains disabled | PASS | `GET` and `POST` return disabled Problem Details. |
| No API key generation | PASS | `node scripts/check-api-key-shell.mjs` passed; runtime scan found no generation call in app/lib runtime. |
| No key material in response | PASS | JSON field-level smoke found only Problem Details fields and no key, hash, secret, bearer, payment, Stripe, or customer fields. |
| No Supabase import in disabled shell | PASS | Static scan of `app/api/alpha-feed/api-keys`, `app/admin/api-keys`, and `lib/api-keys` found no Supabase import. |
| No Stripe/payment import in disabled shell | PASS | Static scan found no Stripe or payment import in disabled shell files. |
| No DB write | PASS | Disabled route imports only `NextResponse` and local disabled-shell helpers. |
| No customer access | PASS | No customer route or customer access code was introduced. |
| No metering runtime | PASS | No `app/api/metering` or `lib/metering` path exists. |
| No billing runtime | PASS | No `app/api/billing` or `lib/billing` path exists. |
| Admin placeholder is read-only | PASS | `/admin/api-keys` states disabled posture and has no key creation form or issuance action. |

## PR89 Metering Ledger QA

| Check | Result | Evidence |
| --- | --- | --- |
| Metering ledger contract exists | PASS | `ops/contracts/metering-ledger-contract.json` |
| Metering ledger doc exists | PASS | `docs/PR89_METERING_LEDGER_CONTRACT_V0.md` |
| Defaults are false | PASS | `METERING_LEDGER_ENABLED`, `METERING_RUNTIME_ENABLED`, `BILLING_RUNTIME_ENABLED`, `CUSTOMER_ACCESS_ENABLED`, and `API_KEY_RUNTIME_ENABLED` are false. |
| Event types defined | PASS | Contract defines API request, quota, rate limit, key state, snapshot export, and feed rejection event types. |
| Append-only policy exists | PASS | Contract requires append-only corrections through reversal or adjustment events. |
| Idempotency policy exists | PASS | Contract requires stable `idempotency_key` and dedupe by event type plus key. |
| Denied fields defined | PASS_WITH_SIDECAR | Contract denies API key plaintext/hash/salt, bearer/session/claim credential equivalents, founder/contact fields, admin/review notes, payment/Stripe/invoice/billing fields, raw payloads, private telemetry, Source Confidence internals, and Signal Score internals. |
| Denied statuses defined | PASS | Includes submitted, pending, pending_review, quarantined, scouted, rejected, needs_info, and archived_private. |
| Billing/payment separation exists | PASS | Contract and doc state metering is usage accounting only and not invoices, payments, scores, rankings, or commercial placement. |
| Public API / MCP / sitemap separation exists | PASS | Contract forbids Signal Score, Source Confidence, sitemap, Public API ordering, MCP ordering, Featured Signals, and editorial side effects. |
| No live metering runtime exists | PASS | No `app/api/metering`, `app/api/usage`, or `lib/metering` path exists. |

## Static Runtime Leak Scan

| Scan | Result | Evidence |
| --- | --- | --- |
| Forbidden runtime routes | PASS | No `app/api/api-keys`, `app/api/keys`, `app/api/metering`, `app/api/usage`, `app/api/billing`, or `app/api/customers`. |
| Runtime libraries | PASS | Only `lib/api-keys` exists, which is the PR88 disabled shell helper. No `lib/metering`, `lib/billing`, or `lib/stripe`. |
| Supabase migration patterns | PASS | No API key, metering, or billing migration path found. |
| Runtime implementation strings | PASS | App/lib/runtime scan found no key generation, Stripe checkout, payment secret, plaintext key field, metering write, billing, invoice, customer access, or enabled-by-default flag implementation. |
| Docs/contracts examples | PASS | Restricted terms appear only in docs/contracts and checker negative fixtures as denied examples. |

## Disabled Route Smoke Result

Local dev server only: `npm run dev -- -p 3100`.

| Method | Path | Status | Content-Type | Body Result |
| --- | --- | --- | --- | --- |
| GET | `/api/alpha-feed/api-keys` | 503 | `application/problem+json` | PASS: disabled Problem Details |
| POST | `/api/alpha-feed/api-keys` | 503 | `application/problem+json` | PASS: disabled Problem Details |

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

Field-level response checks found no key material fields, no hash fields, no
secret fields, no bearer fields, no payment fields, no Stripe fields, and no
customer fields.

## Negative Probe Coverage Review

| Area | Result | Evidence |
| --- | --- | --- |
| PR87 default flags true rejected | PASS | PR87 contract requires false defaults and PR87 docs record disabled-only boundary. |
| PR87 plaintext key storage rejected | PASS | PR87 contract and doc forbid plaintext storage. |
| PR87 payment fields rejected | PASS | PR87 denied fields and payment separation rules cover payment state and Stripe/customer payment fields. |
| PR87 runtime route rejected | PASS | PR87 non-goals forbid routes/endpoints and runtime behavior. |
| PR88 fake key generation rejected | PASS | `scripts/check-api-key-shell.mjs` negative fixture covers generation calls. |
| PR88 Supabase import rejected | PASS | PR88 checker covers Supabase import. |
| PR88 Stripe import rejected | PASS | PR88 checker covers Stripe/payment import. |
| PR88 metering runtime route rejected | PASS | PR88 checker covers metering runtime route. |
| PR88 customer access route rejected | PASS | PR88 checker covers customer access route. |
| PR88 key-like string rejected | PASS | PR88 checker covers credential-like fixture material. |
| PR88 route returning 200 with key material rejected | PASS | PR88 checker covers 200 response with key material. |
| PR89 metering flags true rejected | PASS | PR89 contract requires false defaults; PR89 PR body recorded temporary `/tmp` negative probes. |
| PR89 missing idempotency rejected | PASS | PR89 contract requires stable idempotency; PR89 PR body recorded temporary `/tmp` negative probe. |
| PR89 missing append-only rejected | PASS | PR89 contract requires append-only policy; PR89 PR body recorded temporary `/tmp` negative probe. |
| PR89 payment fields rejected | PASS | PR89 contract denies payment state, Stripe customer, invoice, and billing address fields. |
| PR89 runtime route rejected | PASS | PR89 PR body recorded fake metering route negative probe; static scan confirms no route exists. |
| PR89 billing route rejected | PASS | PR89 PR body recorded fake billing route negative probe; static scan confirms no route exists. |
| PR89 Redis production config rejected | PASS | PR89 PR body recorded fake Redis production config negative probe; static scan confirms no PR89 runtime config exists. |

## Data Repo Cleanliness

`/Users/rainie/Desktop/88cn-index-data` remained clean on `main` tracking
`origin/main`. PR90 did not mutate it.

## Validation Matrix

| Command | Result |
| --- | --- |
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
| `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR91-PR94-LARAVEL-GATEWAY-SYNC` | PASS |
| `node scripts/check-api-key-shell.mjs` | PASS |
| Contract validation via Node standard library | PASS |
| Static runtime leak scan | PASS |
| Disabled route local smoke | PASS |
| `npm run agent:scope:check -- PR90` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |

## Findings By Severity

- P0: none.
- P1: none.
- P2: none.
- P3: PR89 uses `bearer_credential`, `session_credential`, and `claim_credential` as denied field names instead of the external brief's credential-word literal because the repo-wide public wording scanner forbids that literal outside allowlisted policy files. This is equivalent for the boundary and already recorded in `docs/SIDECAR_ISSUES.md`.

## Sidecar Issues

PR90 adds one P3 sidecar note for the PR89 denied-field naming equivalence and
does not bypass any failed gate or missing checkpoint.

## What This QA Does Not Do

PR90 does not modify product code, implement API key issuance, generate API
keys, implement metering runtime, create billing/payment logic, import Stripe,
add Supabase migrations, create Laravel runtime, configure Redis production,
mutate `/Users/rainie/Desktop/88cn-index-data`, deploy, or start PR91.

## Train Completion

`TRAIN-PR87-PR90-API-KEY-METERING-SHELL` is complete after PR90 merges and
post-merge cleanup succeeds.

## Next Train Readiness

`TRAIN-PR91-PR94-LARAVEL-GATEWAY-SYNC` dry-run passes with four planned tasks.
It remains high-risk and checkpointed. PR91 was not started.
