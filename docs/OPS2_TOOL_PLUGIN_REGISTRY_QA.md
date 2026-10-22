# OPS2 Tool And Plugin Registry QA

## Result

PASS

OPS2 registry files, package scripts, roadmap entries, tool registry schema, positive checks, negative probes, ignored local config, strategy docs, and sensitive information scan were verified. One OPS2Q scope registration gap was found and remediated in this PR under the allowed narrow remediation rule.

## Current Main Commit

- PR #33 merge commit: `c4f257d`
- QA branch: `codex/tool-plugin-registry-qa`

## Files Existence Checklist

PASS. All required OPS2 files exist.

| Area | Result | Notes |
| --- | --- | --- |
| `ops/tools/**` | PASS | Registry and six policy docs present |
| `ops/plugins/**` | PASS | Plugin policy plus approved and denied JSON registries present |
| `ops/mcp/**` | PASS | README and example config present |
| `.codex/**` | PASS | README and example config present |
| `scripts/agent/*check.mjs` | PASS | Three OPS2 check scripts present |
| `docs/OPS2_TOOL_PLUGIN_REGISTRY_V0.md` | PASS | Present |

## Package Scripts Check

PASS.

| Script | Result |
| --- | --- |
| `agent:tool:check` | PASS |
| `agent:mcp-config:check` | PASS |
| `agent:plugin-policy:check` | PASS |

## Tool Registry Schema Check

PASS.

| Check | Result | Notes |
| --- | --- | --- |
| Top-level `version` | PASS | Present |
| Top-level `policy` | PASS | Present |
| Top-level `tools` | PASS | Present |
| Top-level `denied` | PASS | Present |
| Default install/network/write/secrets | PASS | All false |
| Human-required global install | PASS | true |
| Browser extensions denied by default | PASS | true |
| MCP servers denied by default | PASS | true |
| Production credentials denied | PASS | true |
| Required tool ids | PASS | 14/14 present |
| Required tool fields | PASS | Check script passed |

## Positive Validation Results

PASS.

| Command | Result |
| --- | --- |
| `npm run agent:tool:check` | PASS |
| `npm run agent:mcp-config:check` | PASS |
| `npm run agent:plugin-policy:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 42/42 pages generated |
| `npm run agent:gate` | PASS |
| `npm run agent:scope:check -- OPS2` | PASS |
| `npm run agent:scope:check -- OPS2Q` | PASS after remediation |

## Negative Tool-Check Test Result

PASS.

Temporary worktree:

```text
/tmp/123charts-ops2q-tool-probe
```

Probe:

- Changed a conditional tool install command to a pipe-to-shell pattern.
- Ran `node scripts/agent/tool-check.mjs`.
- Observed exit code `1`.
- Removed the temporary worktree.

Observed summary:

```text
tool-check failed with 1 issue(s)
- tool playwright install.command uses dangerous pattern
```

## Negative MCP Config Check Result

PASS.

Temporary worktree:

```text
/tmp/123charts-ops2q-mcp-probe
```

Probe:

- Added an unrestricted user-root placeholder to `.codex/config.example.toml`.
- Ran `node scripts/agent/mcp-config-check.mjs`.
- Observed exit code `1`.
- Removed the temporary worktree.

Observed summary:

```text
mcp-config-check failed with 1 issue(s)
- .codex/config.example.toml:16 contains Users root
```

## Negative Plugin Policy Check Result

PASS.

Temporary worktree:

```text
/tmp/123charts-ops2q-plugin-probe
```

Probe:

- Added a denied plugin id to the approved plugin registry in the temporary worktree.
- Ran `node scripts/agent/plugin-policy-check.mjs`.
- Observed exit code `1`.
- Removed the temporary worktree.

Observed summary:

```text
plugin-policy-check failed with 1 issue(s)
- plugin appears in both approved and denied registries: unrestricted-filesystem-mcp
```

## `.codex` And `.gitignore` Check

PASS.

| Check | Result |
| --- | --- |
| `.gitignore` contains `.codex/config.toml` | PASS |
| `.gitignore` contains `.codex/*.local.toml` | PASS |
| `.codex/config.toml` absent | PASS |
| `.codex/*.local.toml` absent | PASS |
| committed `.codex` files limited to README and example config | PASS |

## Denied Plugin Category Check

PASS. The denied registry contains all required high-risk categories:

- browser-cookie-reader
- password-manager-reader
- seo-rank-tracker
- auto-social-poster
- cloud-provider-write-plugin
- stripe-live-payment-plugin
- supabase-production-write-plugin
- unrestricted-filesystem-mcp
- browser-extension-installer
- keychain-reader
- email-blast-plugin
- social-dm-automation-plugin

## Strategy Docs Review

PASS.

The policy docs state:

- default plugin install is denied
- global installs require human confirmation
- MCP is denied by default
- browser session data, Keychain, and password manager access are forbidden
- cloud write plugins are denied
- live payment tools are denied
- production database write plugins are denied
- current OPS / PR31-PR34 work is limited to git, gh, node, npm, curl, and Codex-controlled browser

## Sensitive Information Scan

PASS_WITH_NOTES.

`npm run agent:redact:check` passed.

Additional grep checks found only existing documentation references to environment variable names and placeholder examples. No real secret values, real config, private key blocks, credential URLs, or public server addresses were detected in OPS2 files or `.codex` examples.

## Narrow Remediation

The first roadmap review found that `OPS2Q.allowed_paths` did not include `docs/OPS2_TOOL_PLUGIN_REGISTRY_QA.md`, and `ops/tasks/current.json` still pointed to OPS2 in progress. This PR applies the allowed narrow remediation:

- added `docs/OPS2_TOOL_PLUGIN_REGISTRY_QA.md`
- added exact OPS task metadata paths needed for this QA remediation
- changed current task metadata to OPS2Q complete
- updated `docs/TASK_STATUS.md`

Final `npm run agent:scope:check -- OPS2Q` passes.

## Findings

| Severity | Area | Finding | Status |
| --- | --- | --- | --- |
| P1 | OPS2Q scope registration | OPS2Q initially lacked this QA report path. | Remediated in this PR; final scope check passes. |
| P3 | Current task metadata | Current task metadata initially stayed on OPS2 in progress. | Remediated in this PR. |

## Recommendation

PR31 can proceed after OPS2Q merges. Tool/plugin registry controls are parseable, enforceable, and default-deny for plugin install, real MCP config, production services, browser session reads, and product-code mutation.
