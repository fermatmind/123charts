# Premium Featured Signals UI Component v0

## Purpose

PR50 adds a human-visible Featured Signals UI layer for reviewed public projects. The component is a presentation surface only. It does not change project eligibility, publication state, score math, source confidence, sitemap output, public API output, MCP payloads, or organic project ordering.

## What Featured Signals Are

- A labeled UI placement surface for projects that are already reviewed and public.
- A server-flagged component that returns `null` unless explicitly enabled.
- A founder-facing and reader-facing visual module that links to internal 123Charts project pages.
- A narrow admin explanation page documenting the boundary before PR51.

## What Featured Signals Are Not

- Not a score input.
- Not a source confidence input.
- Not an indexing rule.
- Not a machine-readable data field.
- Not a campaign activation system.
- Not a payment, checkout, billing, or order workflow.

## Feature Flag

The server-side flag is `FEATURED_SIGNALS_ENABLED`.

Default behavior:

- Missing flag: disabled.
- Any value other than `true`: disabled.
- Disabled state: homepage and category pages render normally, and the component returns `null`.

There is no client-exposed feature flag and no payment-related public environment variable.

## Eligibility Boundary

`lib/featured/eligibility.ts` fails closed.

Eligible states:

- `published`
- `claimed`
- `owner_verified`

Blocked or inactive states include:

- `submitted`
- `pending_review`
- `approved`
- `archived`
- `draft`
- `quarantined`
- `rejected`
- `removed`
- `inactive`
- `noindex_only`
- `policy_blocked`

The project must also have public source references and source confidence data.

## UI Placement

PR50 adds `FeaturedVerifiedSignals` to:

- Homepage UI.
- Category page UI.

Because the flag defaults disabled, no visible placement appears by default. Organic project arrays and ordering remain untouched.

Visible placements include the required label:

- `Featured placement`

## Machine Layer Separation

PR50 does not modify:

- `app/sitemap.ts`
- public API routes
- future MCP routes
- Signal Score logic
- Source Confidence logic
- project report datasets
- organic sorting

The featured component reads a small static v0 fixture only when the server flag is explicitly enabled, then filters through the eligibility helper.

## External Links

The current component uses internal project links. If a future featured card renders an external placement URL, it must use:

```txt
rel="sponsored noopener noreferrer"
```

## Admin Surface

`/admin/featured-signals` is a read-only boundary explanation page. It does not approve, activate, or order placement. It documents that payment activation is outside PR50 and remains a PR51 checkpoint.

## Boundary Checker

`npm run featured-signals:check` verifies:

- Featured component files exist.
- The feature flag defaults closed.
- Eligibility helper exists and includes allowed and blocked states.
- Featured logic is not imported by sitemap, public API, MCP, score, or source confidence files.
- Featured files do not import payment or checkout modules.
- Featured-surface copy avoids blocked wording.
- External featured links, if introduced, include the required rel attributes.
- `app/sitemap.ts` is not modified.
- `package.json` includes the checker script.

## Non-Goals

- No PR51 implementation.
- No Stripe or checkout integration.
- No campaign activation.
- No billing records.
- No Supabase schema change.
- No project publication workflow change.
- No public API or MCP changes.

## PR51 Warning

PR51 must not proceed automatically from this PR. Commercial activation requires a separate human checkpoint and a separate payment boundary review.
