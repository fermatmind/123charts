# Brand Voice and Public Copy Guard v0

## Summary

PR38 adds a machine-readable public copy guard for 123Charts brand language. It complements the baseline forbidden-pattern scanner with a narrower brand-voice check that can distinguish outcome promises from compliant non-promise disclaimers.

The guard is local-only. It performs no network calls, stores no secrets, and does not modify public page copy.

## Files

| File | Purpose |
| --- | --- |
| `ops/copy/brand-voice-rules.json` | Machine-readable brand voice, preferred wording, restricted claim groups, and synthetic probes. |
| `scripts/check-brand-voice.mjs` | Local checker that validates the rules, scans public source files, and verifies positive and negative probes. |
| `scripts/scan-forbidden-patterns.mjs` | Registers PR38 rule files as policy-source files so the rules themselves do not trigger the baseline scanner. |
| `package.json` | Adds `npm run brand-voice:check`. |

## Guard Model

The baseline `policy:scan` remains the broad public-language gate. It blocks canonical Phase 1 restricted public wording outside allowlisted policy files.

`brand-voice:check` is narrower and semantic:

1. It reads `ops/copy/brand-voice-rules.json`.
2. It validates that the rule set has public source roots, extensions, restricted claim groups, and probes.
3. It confirms positive probes pass.
4. It confirms negative probes fail closed.
5. It scans public source roots: `app`, `components`, and `lib`.
6. It ignores non-public implementation zones such as API handlers, auth helpers, validation code, security code, Supabase helpers, and admin internals.

## Restricted Claim Groups

The rule set blocks link-exchange framing, ranking promises, traffic promises, AI citation promises, and generic guaranteed outcome language when those phrases are used as positive claims.

Explicit negation remains allowed. Examples:

- Allowed: "does not guarantee search ranking, traffic, indexing, or AI citations"
- Allowed: "No ranking guarantees, traffic promises, or SEO benefits"
- Blocked: "Claim your profile for guaranteed ranking"
- Blocked: "Add the badge for a guaranteed AI citation"

This matters because 123Charts public pages must be able to state limitations clearly without turning those limitation statements into policy failures.

## Brand Voice

Allowed public tone:

- data-terminal
- factual
- founder-useful
- non-promissory
- evidence-first

Preferred language:

- public growth signals
- machine-readable signals
- editorial review
- founder claim
- source confidence
- readiness check
- not verified

Avoided framing:

- outcome promises
- ranking claims
- traffic claims
- AI citation claims
- paid placement framing
- link-exchange framing

## Non-Goals

- No public page copy changes.
- No app, component, API, middleware, Supabase, deployment, or data-model changes.
- No new dependency.
- No external service calls.
- No payment, placement, ranking, traffic, or AI visibility promise.

## Validation

Required PR38 checks:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run brand-voice:check`
- `npm run agent:scope:check -- PR38`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## PR39 Handoff

PR39 should verify:

- positive probes pass
- negative probes fail closed
- the checker scans public source files
- policy files are the only new allowlist entries
- no app code was modified by PR38
