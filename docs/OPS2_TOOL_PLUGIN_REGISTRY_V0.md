# OPS2 Tool And Plugin Registry v0

## Result

OPS2 defines a controlled tool and plugin registry for future 123Charts Codex tasks. It does not install plugins, configure real MCP servers, modify product code, or deploy.

## Why 123Charts Cannot Let Codex Freely Download Plugins

123Charts has production deployment, admin review, public API, future MCP, and payment-adjacent boundaries. Unreviewed tools can read local files, browser sessions, private credentials, cloud accounts, or production data. Free-form plugin installation would make PR review incomplete because a hidden tool could change state outside the Git diff.

OPS2 makes tool access explicit, reviewable, and phase-bound.

## Tool Registry

`ops/tools/tool-registry.json` is the machine-readable tool allowlist. Each tool records:

- id
- name
- type
- status
- phases
- required flag
- install mode
- permissions
- allowed commands
- forbidden commands
- notes

Default policy denies install, network, writes, and secret access unless a tool entry and roadmap task allow it.

## Plugin Registry

`ops/plugins/approved-plugins.json` records approved repo-native skill cards only. `ops/plugins/denied-plugins.json` records denied plugin categories such as browser cookie readers, cloud write plugins, live payment plugins, production database write plugins, unrestricted filesystem MCP, and browser extension installers.

OPS2 does not install or activate any real plugin.

## Current PR31 - PR34 Tool Boundary

For current OPS and PR31 through PR34 work, allowed tools are:

- git
- gh
- node
- npm
- curl
- Codex-controlled browser

Any missing tool must be reported. Codex must not install it unless the active roadmap task explicitly allows installation.

## Playwright

Playwright is conditional. It may be enabled only for explicit visual QA or browser QA tasks, starting in the PR35-PR46 range or when a roadmap task grants that permission. It must use a clean profile and must not read user browser cookies or saved passwords.

## Stripe CLI

Stripe CLI is conditional for future PR50-PR51 test-mode work only. Live mode and real payment creation are forbidden.

## Supabase CLI

Supabase CLI is conditional for database, migration, or local validation tasks. Production database access requires explicit human approval outside Codex.

## Laravel / Composer / PHP Tools

Composer, PHP, PHPUnit, Redis CLI, and OpenAPI validator are reserved for future PR81+ Laravel API Gateway phases. They are not required now and are not installed by OPS2.

## MCP Server Rules

MCP servers are denied by default. OPS2 commits example config only:

- `ops/mcp/config.example.toml`
- `.codex/config.example.toml`

Future 123Charts MCP may read only from the Public API allowlist and must not query Supabase directly.

## Why Real `.codex/config.toml` Cannot Be Committed

Real local Codex config may contain private endpoints, local paths, credentials, or machine-specific setup. It belongs in ignored local files. The repository commits only `.codex/config.example.toml`.

Ignored files:

- `.codex/config.toml`
- `.codex/*.local.toml`

## Requesting A Future Tool

To request a future tool:

1. Add or update a task in `ops/tasks/roadmap.json`.
2. Add the tool to `ops/tools/tool-registry.json`.
3. State the allowed phase and command patterns.
4. State whether install is allowed.
5. Run the agent checks.
6. Submit the registry change for PR review before use.

## Checks

Run:

```bash
npm run agent:tool:check
npm run agent:mcp-config:check
npm run agent:plugin-policy:check
```

These checks validate the tool registry, plugin registry, and MCP example config.

## What OPS2 Does Not Do

- Does not install plugins.
- Does not configure real MCP servers.
- Does not modify product code.
- Does not deploy.
- Does not connect to Supabase, Stripe, cloud servers, or real MCP endpoints.
- Does not add third-party dependencies.
