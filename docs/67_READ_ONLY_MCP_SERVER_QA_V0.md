# Read-only MCP Server QA v0

## Purpose

PR60 adds a disabled-by-default, read-only MCP server shell for future 123Charts tooling. It follows the PR59 MCP boundary and the PR58 Public API boundary.

## Current Status

Human checkpoint status: required.

The MCP shell is not externally released, not deployed, disabled by default, and not enabled by default.

## Feature Flags

Server-side flags:

```text
MCP_SERVER_ENABLED=false
MCP_LOCAL_ONLY=true
```

`MCP_SERVER_ENABLED` is disabled unless the value is exactly `true`.

`MCP_LOCAL_ONLY` is true unless the value is exactly `false`.

## Route Summary

Route:

```text
/api/mcp
```

Default behavior:

- `GET /api/mcp` returns `503` with `application/problem+json`.
- `POST /api/mcp` returns `503` with `application/problem+json`.
- No tool list is returned while disabled.
- No project data is returned while disabled.
- No database query, Public API fetch, or external network call happens while disabled.

Disabled Problem Details:

```json
{
  "type": "https://123charts.com/problems/mcp-disabled",
  "title": "MCP server is disabled",
  "status": 503,
  "detail": "The MCP server is not enabled for this environment.",
  "instance": "/api/mcp"
}
```

When explicitly enabled in a future reviewed local environment, the route can return static server metadata and static tool schemas only. Tool calls are not implemented in PR60 v0.

## Tool Schema Summary

Static allowed tools come from `ops/contracts/mcp-boundary.json`:

- `search_ai_projects`
- `get_ai_project_profile`
- `list_ai_project_categories`

Every input schema must use `additionalProperties: false`.

Forbidden tool names include:

- `execute_query`
- `run_sql`
- `fetch_url`
- `submit_project`
- `claim_project`
- `update_project`
- `delete_project`
- `send_email`
- `create_checkout`
- `create_payment`

## Public API Boundary Dependency

The MCP shell depends on the Public API boundary contract only. It does not bypass PR58, does not read raw project rows, and does not connect directly to Supabase.

## No Direct Supabase Access

`app/api/mcp/**` and `lib/mcp/**` must not import Supabase clients, service role helpers, SQL helpers, database helpers, admin project helpers, payment helpers, Signal Score internals, or Source Confidence internals.

Boundary statement: no direct Supabase access.

## No Mutation Tools

MCP v0 is read-only. Mutation, email, checkout, admin review, external sync, SQL execution, arbitrary URL fetch, and freeform command tools are forbidden.

Boundary statement: no mutation tools.

## Private Field Denylist

MCP outputs must not include:

- email fields
- admin notes
- review comments
- raw payloads
- raw Supabase rows
- audit events
- notification events
- payment state
- commercial order state
- private founder data
- unreviewed scouted payloads
- Source Confidence internals
- Signal Score internals

## Leakage Boundaries

payment/admin/scouted/quarantined leakage boundaries:

- Payment state and checkout state are never MCP output.
- Admin review metadata and queue state are never MCP output.
- Scouted, pending, submitted, rejected, and quarantined records are never MCP output.
- Raw import payloads and quarantine internals are never MCP output.

## Checker

Run:

```bash
npm run read-only-mcp:check
```

The checker validates feature flags, route disabled behavior, strict static tools, denied imports, denied fields, forbidden path changes, docs, package script registration, and negative fixtures.

## Negative Tests

The checker uses temporary fixtures under `/tmp/123charts-pr60-*` for:

- fake MCP file importing Supabase
- fake MCP file importing payment code
- fake `execute_query` tool
- fake `update_project` tool
- fake `sql` input field
- fake `email` output field
- fake `payment_state` output field
- fake schema with `additionalProperties: true`
- fake deploy path mutation

No temp fixture is left in the repo.

## Local Smoke Result

Default local smoke was run with `npm run dev -- -p 3101`.

- `GET /api/mcp` returns `503 application/problem+json`.
- `POST /api/mcp` returns `503 application/problem+json`.
- Response body states `MCP server is disabled`.
- No live data or private fields are returned.

## What This PR Does Not Do

PR60 does not deploy, publicly expose MCP, install dependencies, install plugins, add secrets, modify server config, touch payment, change Public API runtime behavior, connect directly to Supabase, mutate data, create external registry configuration, or start any future task.

## External Release Warning

This MCP shell is not externally released. Any public endpoint release, external agent surface, production enablement, server config change, or deployment requires a separate human checkpoint.
