# Public Read-only API v0

## Purpose

PR58 adds a feature-flagged read-only Public API v0 shell. It uses the PR57 public API boundary contract and keeps the surface disabled by default.

## Current Status

This PR creates route files, a server-side feature flag, an allowlist serializer, documentation, and a checker. It does not externally release the API.

Human checkpoint status: required before merge or external release.

## Feature Flag

Environment variable:

```text
PUBLIC_API_ENABLED=false
```

Default behavior:

- missing value: disabled
- any value other than exactly `true`: disabled
- exactly `true`: enabled

When disabled, routes return Problem Details with status `503` and content type `application/problem+json`.

## Allowed Routes

PR58 creates only these routes:

- `GET /api/public/v0/projects`
- `GET /api/public/v0/projects/[slug]`

No other public API route is introduced.

## Disabled Response

Disabled routes return:

```json
{
  "type": "https://123charts.com/problems/public-api-disabled",
  "title": "Public API is disabled",
  "status": 503,
  "detail": "The public API is not enabled for this environment.",
  "instance": "/api/public/v0/projects"
}
```

The response contains no project data and does not query a database.

## Published-Only Data Rule

When enabled, the API may serialize only records whose status is exactly `published`.

Denied statuses include:

- `submitted`
- `pending_review`
- `approved`
- `claimed`
- `owner_verified`
- `archived`
- `quarantined`
- `rejected`
- `scouted_unreviewed`
- `admin_review`

## Allowlist Serializer

The serializer lives at `lib/public-api/serializer.ts` and derives the allowlist from `ops/contracts/public-api-boundary.json`.

Allowed output fields are:

- `slug`
- `name`
- `canonical_url`
- `category`
- `short_description`
- `public_source_links`
- `technology_tags`
- `published_at`
- `updated_at`
- `profile_status`
- `structured_metadata_summary`

The serializer fails closed if status is not `published` or required public fields are missing.

## Denied Fields

The API must not serialize:

- email fields
- private founder data
- admin notes
- review comments
- review decisions
- review queue state
- raw payloads
- raw Supabase rows
- audit events
- notification events
- payment data
- payment state
- featured payment state
- commercial order state
- private source notes
- Source Confidence internals
- Signal Score internals
- hidden scoring details
- unreviewed scouted payloads

## Privacy Boundary

Public API output is built from reviewed local snapshots only. It must not infer missing facts or expose private source material.

## Admin Data Boundary

Admin review metadata, internal queue state, rejected records, quarantined records, and staged import records are not public API data.

## Payment Boundary

The Public API does not expose payment state, checkout state, featured commercial state, private buyer state, or commercial order state.

## MCP Boundary

PR58 does not expose MCP behavior and does not import MCP code. Future MCP work must not bypass the Public API boundary.

## Rate-Limit And Abuse Notes

PR58 does not add API keys, metering, bulk export, or external release behavior. A later external release must document request bounds and abuse handling before enabling the API outside a reviewed environment.

## Checker

Run:

```bash
npm run public-api:v0:check
```

The checker validates the feature flag, routes, serializer, denied imports, denied fields, no sitemap mutation, no writes, no API keys, no metering, no Laravel gateway, and negative fixtures.

## What This PR Does Not Do

PR58 does not auto-merge, deploy, announce an external API release, start PR59, expose MCP, implement API keys, implement metering, add a Laravel gateway, add a B2B feed, mutate data, connect to external services, touch payment code, touch deployment config, or change server config.
