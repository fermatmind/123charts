# Ad Payment Feature Flag + Commercial Boundary Shell v0

## Purpose

PR51 creates a disabled commercial boundary shell for future Featured Signals commercial workflows. It defines server-side flags, a disabled checkout endpoint, a future state model, and a read-only admin orders placeholder.

## Current Status: Disabled Commercial Boundary Shell

This PR does not enable commercial checkout. The endpoint returns a disabled Problem Details response and does not call external services.

## No Stripe Account Required

No Stripe account is required for this PR. The implementation does not configure Stripe and does not import a Stripe SDK.

## No Payment Account Required

No payment account is required. This PR has no live checkout, no payment links, and no billing provider connection.

## No API Keys Required

No API keys are required for build, local validation, or runtime fallback behavior. No `.env` file is added or changed.

## Feature Flags And Defaults

The server-side flags are:

- `AD_PAYMENTS_ENABLED`
- `STRIPE_CHECKOUT_ENABLED`
- `FEATURED_SIGNAL_CHECKOUT_ENABLED`

Each flag defaults disabled unless its value is exactly `true`.

`isFeaturedSignalCommercialFlowEnabled()` returns true only when all three flags are exactly `true`. PR51 still does not execute live checkout when the combined helper is true; a later human checkpoint is required before real checkout work.

## Disabled Checkout Route Behavior

`POST /api/payments/featured-signals/checkout` returns:

- HTTP `503`
- `application/problem+json`
- Problem type `https://123charts.com/problems/commercial-flow-disabled`
- Detail: `Commercial checkout is not enabled for this environment.`

The route performs no Stripe call, no database mutation, no order mutation, no project mutation, no campaign activation, and no external network call.

`GET` returns the same disabled Problem Details response.

## Future Commercial State Model

`lib/payments/featured-signals/types.ts` defines future states:

- `commercial_disabled`
- `checkout_disabled`
- `checkout_requested`
- `payment_pending`
- `paid_pending_admin_review`
- `admin_approved_for_display`
- `admin_rejected`
- `refunded`
- `cancelled`

Payment success can only move to `paid_pending_admin_review` in a future implementation. It cannot directly display Featured Signals.

## Admin Review Requirement

Any future paid order requires admin review before display. The admin placeholder page has no mutation buttons, no approval buttons, no checkout links, and no payment provider links.

## Machine Data Layer Separation

PR51 does not modify machine-readable data layers.

## Featured Signals Relation

Featured Signals remain human-visible UI placements only. PR51 does not modify the PR50 UI components.

## Sitemap Boundary

PR51 does not modify `app/sitemap.ts` and does not add paid state to sitemap decisions.

## Public API Boundary

PR51 does not modify public API routes and does not expose paid state through public API payloads.

## MCP Boundary

PR51 does not add MCP routes, MCP config, or MCP payload fields.

## Signal Score Boundary

PR51 does not modify Signal Score inputs, calculations, or display math.

## Source Confidence Boundary

PR51 does not modify Source Confidence inputs, calculations, or display.

## Organic Ordering Boundary

PR51 does not modify organic project ordering or category ranking logic.

## Redaction And Secret Policy

No secrets are committed. The boundary checker and redaction scanner must pass before merge review.

## Checker Command

Run:

```bash
npm run ad-payment-boundary:check
```

The compatibility alias also exists:

```bash
npm run ad-payment:check
```

## What This PR Does Not Do

- No live checkout.
- No Stripe SDK dependency.
- No payment provider connection.
- No webhook.
- No order table.
- No public payment button.
- No public UI payment link.
- No sitemap change.
- No public API change.
- No MCP change.
- No score or source confidence change.
- No organic ordering change.
- No deployment.

## Future Work Requiring Human Checkpoint

Any real checkout, payment provider account, payment link, webhook, billing audit, paid order persistence, or campaign review workflow requires a separate human checkpoint and a separate PR.
