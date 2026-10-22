# MCP Policy

## Default

MCP is denied by default. OPS2 only permits example configuration files.

## Forbidden MCP Access

MCP tools must not:

- expose unrestricted filesystem access
- read browser cookies
- read password managers
- read Keychain or system credential stores
- scan the whole disk
- write Supabase production data
- run Stripe live operations
- mutate cloud servers or DNS
- bypass 123Charts public API boundaries

## Future 123Charts MCP Rule

A future 123Charts MCP server may read only from the Public API allowlist. It must not query Supabase directly. It must not expose submitted, pending, quarantined, founder email, admin metadata, payment data, or private import payloads.

## Config Safety

MCP config files committed to the repo must be examples only. They must not contain credentials, private endpoints, public server addresses, credential-bearing URLs, or unrestricted filesystem roots.
