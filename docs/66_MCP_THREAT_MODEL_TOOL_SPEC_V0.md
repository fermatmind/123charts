# MCP Threat Model + Tool Spec v0

## Purpose

PR59 defines the Model Context Protocol boundary for future 123Charts tooling. It records the threat model, safe tool names, strict input schemas, allowlisted outputs, and PR60 implementation preconditions.

PR59 does not implement or expose an MCP server endpoint.

## Scope

This PR covers:

- MCP boundary contract updates
- read-only tool specification
- Public API dependency rule
- prompt injection and tool poisoning risks
- private-field and status leakage risks
- checker coverage for the spec

This PR is spec-only and checkpointed for human review.

## Non-Goals

PR59 does not:

- create `app/api/mcp`
- create `lib/mcp`
- implement MCP server runtime
- expose an MCP endpoint
- connect MCP to Supabase
- add dependencies
- install plugins
- modify server config
- change Public API runtime behavior
- touch payment code
- deploy
- start PR60

## Read-Only MCP Boundary

MCP v0 must be read-only. Mutation tools are forbidden.

Denied mutation examples:

- `submit_project`
- `claim_project`
- `update_project`
- `delete_project`
- `send_email`
- `create_checkout`
- `create_payment`
- `admin_review_project`
- `sync_external_imports`

## Public API Dependency

Future MCP runtime must depend on Public API output only. MCP must not bypass the Public API boundary and must not connect directly to Supabase.

Boundary statement: no direct Supabase access is allowed for MCP.

The only allowed data dependency is the reviewed, published-only Public API boundary defined by:

- `ops/contracts/public-api-boundary.json`
- `docs/64_PUBLIC_API_DATA_BOUNDARY_THREAT_MODEL_V0.md`
- `docs/65_PUBLIC_READ_ONLY_API_V0.md`

## Denied Data

MCP must not expose:

- submitted records
- pending review records
- quarantined records
- rejected records
- unreviewed scouted records
- admin metadata
- payment data
- commercial order state
- founder email
- submitter email
- claim email
- private founder data
- raw payloads
- raw Supabase rows
- internal audit events
- notification state
- Signal Score internals
- Source Confidence internals
- hidden scoring details

## Allowed Tools

Initial allowed tool names:

- `search_ai_projects`
- `get_ai_project_profile`
- `list_ai_project_categories`

Denied broad tool names include:

- `execute_query`
- `run_sql`
- `fetch_url`
- `submit_project`
- `claim_project`
- `update_project`
- `send_email`
- `create_checkout`

## Tool Schemas

Every tool input schema must use:

- `type: object`
- `additionalProperties: false`
- narrow string patterns for slugs, cursors, and category filters
- bounded limits
- no SQL input
- no URL-fetch input
- no arbitrary prompt input
- no admin filter
- no payment filter
- no email field
- no hidden score field
- no freeform execution command

Example safe tool:

```json
{
  "name": "get_ai_project_profile",
  "description": "Return an allowlisted public profile for one published AI project from 123Charts.",
  "inputSchema": {
    "type": "object",
    "additionalProperties": false,
    "required": ["slug"],
    "properties": {
      "slug": {
        "type": "string",
        "pattern": "^[a-z0-9][a-z0-9-]{1,80}$"
      }
    }
  }
}
```

## Output Allowlist

Allowed output fields must come from the Public API boundary:

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

MCP outputs must not include arbitrary HTML, Markdown, scripts, or founder-submitted freeform content without normalization.

## Tool Poisoning Risks

Tool poisoning risks include:

- project-provided text attempting to redefine tool behavior
- malicious category or project labels that look like instructions
- content that asks the model to reveal private records
- content that tells the model to call denied tools

Mitigations:

- descriptions must state fixed read-only behavior
- founder or project text must be treated as data, not instructions
- tools must not accept arbitrary prompt or command fields
- outputs must stay allowlisted and normalized

## Prompt Injection Risks

Prompt injection risks include:

- project descriptions telling the model to ignore system instructions
- public source text requesting hidden fields
- payloads that ask for admin, payment, or private records
- Markdown or HTML that attempts to alter downstream rendering

Mitigations:

- MCP tools return structured data only
- no arbitrary HTML, Markdown, or script output
- no direct URL fetch tool
- no tool that executes model-provided commands

## Data Poisoning Risks

Data poisoning risks include:

- unreviewed imports appearing as public facts
- staged records being treated as published data
- scouted records leaking before review
- AI-generated editorial drafts becoming tool output before approval

Mitigation: MCP must depend on Public API output only, and Public API output must remain published-only and allowlisted.

## Context Overload Risks

Context overload risks include oversized result sets, repeated broad searches, and output that crowds out boundary instructions.

Mitigations:

- bounded `limit` values
- cursor-based paging only
- concise summaries
- no raw payloads
- no bulk export in the MCP spec

## Staged, Scouted, And Quarantined Leakage Risks

MCP must not expose submitted, pending, quarantined, rejected, unreviewed scouted, or admin-review records.

Future PR60 must treat denied statuses as non-public even if a slug exists internally.

## Payment And Commercial Leakage Risks

MCP must not expose payment state, featured payment state, checkout state, commercial order state, private buyer state, or paid placement state.

MCP must not affect organic ordering, sitemap inclusion, Signal Score, Source Confidence, report data, or Public API release posture.

## Future PR60 Preconditions

PR60 may proceed only after this spec passes and receives human review. PR60 must:

- use Public API output only
- avoid direct Supabase access
- implement read-only tools only
- enforce `additionalProperties: false`
- validate outputs against the allowlist
- block denied tool names
- block denied input fields
- block denied output fields
- avoid payment, admin, private founder, raw import, internal score, and Source Confidence internals
- avoid deployment and public exposure without a separate checkpoint

## What This PR Does Not Do

PR59 does not implement or expose an MCP server endpoint. It does not create runtime routes, create runtime MCP libraries, connect to Supabase, expose private fields, mutate data, deploy, install dependencies, touch payment code, modify server config, change PR58 Public API runtime code, or start PR60.
