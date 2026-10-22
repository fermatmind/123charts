# PR96 Data Buyer Interest Form Shell v0

## Purpose

PR96 adds a disabled buyer-interest shell for the future Alpha Feed surface. It
lets reviewers see the intended boundary before any real collection, delivery,
account, or commercial workflow exists.

## Scope

Changed implementation paths:

- `app/alpha-feed/page.tsx`
- `app/api/alpha-feed/buyer-interest/route.ts`
- `scripts/check-data-buyer-interest.mjs`

Changed operating records:

- `docs/PR96_DATA_BUYER_INTEREST_FORM_SHELL_V0.md`
- `docs/SIDECAR_ISSUES.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`

## Disabled And No-Write Posture

The `/alpha-feed` page now includes a buyer-interest shell, but all visible
controls are disabled, read-only, and have no submit action. Preview inputs do
not include `name` attributes, so the shell does not define a collection
payload.

The API route at `/api/alpha-feed/buyer-interest` returns HTTP `503` with
`application/problem+json` for both `GET` and `POST`.

## No PII Collection

PR96 does not collect names, private contact details, company details, phone
details, buyer messages, private founder data, or customer records. The route
does not parse request bodies.

## No Supabase Write

PR96 does not import Supabase clients, create database writes, create schema
changes, or mutate production data.

## No CRM Or Email Provider

PR96 does not connect HubSpot, Salesforce, Mailchimp, SendGrid, Resend,
Postmark, Nodemailer, or any other CRM or email delivery provider.

## No Payment

PR96 does not create checkout, billing, Stripe, paid access, or payment state.

## No Customer Signup

PR96 does not create customer accounts, customer signup, account activation, or
waitlist enrollment.

## No API Key Request

PR96 does not create API key request handling, API credential issuance, API
access activation, or metering runtime behavior.

## No External Service

PR96 does not call external services, webhooks, live feed delivery targets, or
third-party APIs. It adds no environment variable requirement and no dependency.

## UI Behavior

The Alpha Feed page presents the buyer-interest shell as a disabled preview.
The submit-like control is a disabled `type="button"` and cannot submit.

## API Disabled Behavior

The disabled route returns this Problem Details shape:

```json
{
  "type": "https://123charts.com/problems/data-buyer-interest-disabled",
  "title": "Data buyer interest is disabled",
  "status": 503,
  "detail": "Alpha Feed buyer interest collection is not enabled for this environment."
}
```

## Copy Boundary

Public copy stays limited to public signal snapshots, reviewed public metadata,
machine-readability evidence, disabled preview language, no private data, no
payment, and no customer access yet. It avoids restricted capital-product
language, return promises, private data claims, access promises, and financial
advice.

## Checker

`scripts/check-data-buyer-interest.mjs` validates:

- PR96 documentation exists.
- The page shell is disabled by default.
- Preview inputs are disabled and have no collection names.
- The route returns disabled Problem Details.
- The route does not parse request bodies.
- No Supabase, CRM, email provider, payment, API credential, metering, env, or
  external network behavior is present.
- PR96 keeps `human_checkpoint=true`.
- PR97 has not started.

The checker is not registered in `package.json` because PR96 scope forbids that
file.

## Negative Tests

The checker creates temporary `/tmp/123charts-pr96-*` fixtures and verifies that
these cases fail:

- Fake Supabase import.
- Fake CRM provider reference.
- Fake email provider reference.
- Fake payment provider reference.
- Fake external `fetch`.
- Fake active private-contact input.
- Fake active company input.
- Fake route returning HTTP 200.
- Fake customer signup-is-open copy.
- Fake restricted capital-product wording.
- Fake API credential request copy.

No temp files are written to the repository.

## Human Checkpoint Status

PR96 remains `human_checkpoint=true`. This PR must stop at `MERGE_READY`, must
not auto-merge, must not deploy, and must not start PR97.

## Relationship To PR95

PR95 created the static Alpha Feed landing boundary. PR96 adds only the disabled
buyer-interest shell and the disabled API response for that future boundary.

## Future Requirements Before Enabling Real Collection

Before any real collection can exist, a later approved task must define data
minimization, consent copy, storage policy, abuse controls, provider choices,
admin review, retention policy, security review, deployment approval, and human
checkpoint approval.

## What This PR Does Not Do

PR96 does not create live Alpha Feed delivery, buyer onboarding, customer
access, external sync, payment, API access, metering, Supabase writes, data repo
mutation, production deploy, or PR97 evidence dossier work.

## Validation Results

Completed validation:

- `npm run verify:day0` PASS
- `npm run policy:scan` PASS
- `npm run third-party:check` PASS
- `npm run agent:redact:check` PASS
- `npm run agent:tool:check` PASS
- `npm run agent:mcp-config:check` PASS
- `npm run agent:plugin-policy:check` PASS
- `npm run agent:batch:check` PASS
- `npm run agent:train-plan:check` PASS
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR95-PR97-ALPHA-FEED-LANDING-EVIDENCE` PASS with expected PR96 checkpoint warning
- `npm run agent:scope:check -- PR96` PASS
- `node scripts/check-data-buyer-interest.mjs` PASS
- `npm run lint` PASS
- `npm run typecheck` PASS
- `npm run build` PASS
- `npm run agent:gate` PASS

The first standalone build was started concurrently with `agent:gate` and hit a
temporary `.next` trace-file race. The subsequent standalone build passed.
