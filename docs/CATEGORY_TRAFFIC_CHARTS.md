# Category traffic charts — current local specification

This specification extends 123Charts V1 with the user-approved category-first traffic design. The original V1 remains the authority for free enrollment, private evidence, identity claims and contribution rewards. This delivery stays local; no GitHub push, DNS or server deployment.

## Public journey

- Main navigation: Discover / Category traffic charts / Join for free. Personal follows, peer comparisons and notifications live in the workspace.
- `/en/charts` and `/zh/charts` are category directories, with search, reviewed purpose definitions, parent directories, collection/coverage counts, each category's three leading entries, follows and recent publications. Popular categories use recorded category-follow counts, never a global traffic rank.
- `/zh/charts/ai-coding?month=2026-09&source=Semrush%20public` reproduces the category, reporting month and source. `version=N` pins the publication. Historical category/query URLs redirect while preserving other filters.
- Each category page separates ranked entries, missing/conflicted/unknown-scope websites, broad platforms, changes and free recommendation rotation. Search, pricing filters and pagination preserve category ranks. Missing prior months have no invented zero growth.
- Visits means estimated visit occurrences for a specified period; it does not mean unique visitors, active users or product quality. Collection count is not whole-industry coverage.

## Classification and publication

A website has independently reviewed many-to-many category relationships, with pending/confirmed/adjusted status, a purpose basis and main/general/scope-unknown placement. Broad whole-site measurements (including the AWS research profile) are contextual; they cannot stand in for one product's specialist traffic. The same measurement is reused across categories and must not be summed into industry totals.

Published snapshots select only confirmed, main-chart relationships and same-source/month/metric/scope verified observations. Research profiles can rank without enrolling. Missing records stay outside the rank; unresolved conflicts suspend usage. Source and classification revisions retain the old immutable snapshots and reasons.

Ranking is deterministic competition ranking (1, 1, 3). Display values and precision are retained. Overlapping rounding intervals are treated as ties rather than invented precise differences. A repeat check reuses a publication unless its values, coverage, memberships, exclusions or rule version actually changed. Publishing is serialized by category/source/month/dataset.

The page, JSON-LD and `/api/charts/snapshot/{id}?dataset=real|demo` reference the same saved entries. JSON includes measurement domain, visit value, category rank, source, month, scope, verification basis, data version and snapshot version. PNG cards also name source, period, scope, snapshot version and coverage; demo cards retain their label.

## Continuous checking

The existing single durable worker handles the source queue as well as OCR and metadata. One scheduler processes new evidence and due records; successful source records default to a seven-day next check. Daily incremental processing and weekly due dates are distinct from monthly reporting periods.

`charts_verification_tasks` retains attempts, priority, next due date, last actual request, last successful verification, cumulative calls and error. Stale locks are reclaimed. Response receipts keep the original source response, hash, retrieval time, extracted observation, outcome and actual request count. Request/runtime/retry/spending limits defer work rather than creating zero values or success timestamps. A 24-hour response cache reuses a source read across tasks without refreshing the original successful retrieval time; administrators can request a fresh read within the same budget.

The data workbench controls selected-domain or published-library coverage, source screenshot OCR, due tasks, private originals, receipts, classification decisions and explicit source corrections. New observations never replace a conflicting published value automatically. Confirmed corrections create a new data version and affected category snapshot.

## Real source sample

The approved no-key validation channel is **Semrush public**, read from its ordinary public website overview pages. It is a separate source, not assumed equivalent to AITDK or TabAPI. The adapter uses a fixed HTTPS provider origin, rejects redirects, bounds response size/time, and requires an explicit matching domain, completed reporting month, Visits and worldwide/all-device scope. It retains standard TLS verification. Arbitrary website metadata still uses the independent DNS/private-address SSRF guard.

On 2026-10-21 a privately stored original Cursor source screenshot was OCR-extracted and matched against an actual public source query:

- Source: https://www.semrush.com/website/cursor.com/overview/
- Statistical month: 2026-09; displayed visits: **35.49M**; normalized display estimate: 35,490,000; display step: 10,000 visits.
- Scope: worldwide / all devices / cursor.com.
- Independent real classification snapshot: AI coding; initial coverage **1/11** collected websites. That is limited local coverage, not a global leadership claim.

Private screenshots and full source responses remain local and outside Git. The anonymous JSON exposes a source URL/hash and observation provenance, not private originals. The initial clipped screenshot was not adopted; the complete readable screenshot passed extraction and matching.

AITDK contribution requirements remain ten relevant peers and evidence for five to ten distinct peers. A cross-source Semrush check cannot certify an AITDK screenshot; such material remains in manual review. TabAPI is not connected. Similarweb public access was blocked from the local environment; no bypass was attempted.

## Follows and limits

Category/site follows and private ten-peer comparisons show actual new profiles, new statistical months, coverage changes and confirmed corrections. Saved reports retain delivery-time values; the separate peer-changes view shows current records and category positions. A content-identical recheck does not create a new chart notification.

All local pages remain noindex and the local sitemap stays empty. This sample verifies a real extraction/query/publication path. It does not verify comprehensive data coverage, future public-page availability, commercial redistribution rights, sustained acquisition cost or customer growth. External deployment and a broad operational data pilot remain separate work.
