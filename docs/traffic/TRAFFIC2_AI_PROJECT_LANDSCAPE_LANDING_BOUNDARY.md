# TRAFFIC2 AI Project Landscape Landing Boundary v0

Result: GO_TRAFFIC2B

Date: 2026-06-20

Role: codex-build

## Scope

TRAFFIC2 defines the product boundary, content architecture, route policy, safe data requirements, copy rules, indexability rules, sitemap rules, and implementation handoff for a future `/landscape` page.

This is docs, product-boundary, route-spec, and implementation-handoff work only. It does not implement `/landscape`, create app routes, create components, create lib modules, modify sitemap runtime, generate SEO pages, create `/tasks`, create `/zh-CN` routes, deploy, perform external writes, collect PII, mutate Supabase, or mutate `/Users/rainie/Desktop/88cn-index-data`.

## Source Inputs

- [TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md)
- [TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md)
- [TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md)
- [TRAFFIC1_CHINESE_SEARCH_INTENT_MAPPING.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_CHINESE_SEARCH_INTENT_MAPPING.md)
- [TRAFFIC1_DEMAND_SIDE_COPY_BOUNDARY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_DEMAND_SIDE_COPY_BOUNDARY.md)
- [TRAFFIC1_ROUTE_TAXONOMY_MATRIX.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_ROUTE_TAXONOMY_MATRIX.md)
- [TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md)
- [CHINA_GLOBAL_SEO_GAP_MAP.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/CHINA_GLOBAL_SEO_GAP_MAP.md)
- [PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md)

TRAFFIC1 is the source of truth. TRAFFIC2 does not contradict TRAFFIC1: `/landscape` is a positioning and navigation hub, not a generic directory, ranking page, paid placement page, or data-feed endpoint.

## What /landscape Is

`/landscape` is a positioning and navigation hub for reviewed AI project landscape surfaces, source-linked public signals, machine-readability evidence, and future demand-side discovery routes.

It should help users understand how 123Charts organizes reviewed AI projects by category, stack, source links, lifecycle status, public readiness signals, reports, and future finite demand-side routes.

## What /landscape Is Not

`/landscape` is not:

- a generic AI tools directory clone;
- a full market database;
- a global market count;
- a ranking page;
- a paid placement page;
- a superlative tools list;
- a generated SEO content farm;
- a data-feed endpoint;
- a buyer-interest form;
- a customer signup page;
- a route that exposes submitted, private, pending, quarantined, rejected, or unreviewed records.

## Target Audiences

1. Builders / repo hunters: want to find active AI projects, source links, stacks, and alternatives.
2. Potential AI founders: want to understand sectors, project density, competitors, and public readiness.
3. Researchers / data buyers: want to understand reviewed public signals and future Alpha Feed evidence.
4. AI project founders: want to submit, claim, correct, or understand project public-signal readiness.

## Page Goal

The future page should establish 123Charts's demand-side navigation position:

- explain that 123Charts organizes reviewed public AI project signals;
- guide users to existing safe surfaces such as projects, reports, geo-checker, stacks, collections, verticals, and alternatives;
- preview source-linked public signal types without exposing private fields;
- prepare the path for TRAFFIC2B implementation and later finite task/sector work;
- avoid unsupported counts, ranking language, paid placement, and outcome promises.

## Page Information Architecture

Detailed layout policy lives in [TRAFFIC2_LANDSCAPE_PAGE_SPEC.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC2_LANDSCAPE_PAGE_SPEC.md). Required sections:

1. Hero: "Explore reviewed AI projects by category, stack, source links, and public readiness signals."
2. Audience split: builders, founders, researchers, project owners.
3. Browse by: stacks, collections, verticals, alternatives, reports, geo-checker, future tasks, future sectors.
4. Public signal preview: reviewed sample counts only when source-backed.
5. Machine-readability evidence: website reachable, GitHub linked, docs linked, sitemap detected, JSON-LD detected, canonical detected.
6. Founder CTA: submit project, claim/correct profile, run geo-checker.
7. Research / Alpha Feed CTA: view reports, read Alpha Feed evidence.

## Data Source Requirements

Future `/landscape` implementation may read only:

- reviewed/published project records;
- existing finite registries for stacks, collections, verticals, and approved alternatives;
- reviewed reports registry;
- public signal checks already stored or generated by local safe checks;
- source-linked public metadata;
- route-safe aggregate counts.

It must not read private, pending, quarantined, rejected, unreviewed, admin-only, payment, API credential, buyer-interest, raw database, private telemetry, or internal scoring internals that are not public-safe.

Detailed data policy lives in [TRAFFIC2_LANDSCAPE_DATA_REQUIREMENTS.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC2_LANDSCAPE_DATA_REQUIREMENTS.md).

## Allowed Fields

Future public display may use:

- project name;
- slug;
- category;
- short public description if reviewed;
- website URL;
- public GitHub URL;
- public docs URL;
- public launch page;
- stack tags;
- collection tags;
- vertical tags;
- lifecycle label: published, claimed, archived when safe;
- last reviewed date;
- website reachable;
- sitemap detected;
- JSON-LD detected;
- canonical detected;
- source-linked open-source/commercial status when source-backed;
- reviewed sample count.

## Forbidden Fields

Never display on `/landscape`:

- private founder contact fields;
- admin notes;
- review notes;
- payment state;
- customer/payment-provider fields;
- API credential or metering data;
- buyer-interest data;
- private analytics;
- internal credential material;
- raw payloads;
- raw database rows;
- submitted/private records;
- quarantined records;
- rejected records;
- private scouted records;
- unreviewed claims;
- fake or unsupported global market counts.

## Lifecycle-State Policy

Allowed public data states:

- `published`
- `claimed`
- `owner_verified`

Conditionally visible:

- `archived`, only when displayed as a safe historical/status label and not included as active market coverage.

Forbidden for `/landscape` public display and sitemap influence:

- `submitted`
- `pending_review`
- `approved` when not yet published
- `scouted`
- `quarantined`
- `rejected`
- private/admin-only states
- draft-only records
- unreviewed claims

## Indexability Policy

`/landscape` can be indexable if:

- the page is manually reviewed;
- it links only to safe public surfaces;
- it does not make unsupported count claims;
- it does not expose forbidden fields;
- it does not include disabled, customer, payment, API, MCP, admin, or buyer-interest routes;
- it does not treat under-threshold dynamic pages as sitemap targets;
- the implementation checker passes in TRAFFIC2B.

## Sitemap Policy

Future sitemap inclusion rules:

- include `/landscape` only after implementation checker passes;
- do not include `/landscape/sectors` unless implemented and eligible;
- do not include `/tasks/*` in TRAFFIC2 or TRAFFIC2B unless separately scoped;
- do not include `/zh-CN/*` in TRAFFIC2 or TRAFFIC2B unless separately scoped;
- do not include under-threshold child routes;
- do not include disabled shell, API, MCP, payment, admin, customer, buyer-interest, or generated checker-result routes.

## Canonical Policy

- `/landscape` should be self-canonical after implementation.
- Child route canonicals remain governed by TRAFFIC1.
- `/landscape` must not canonicalize to an unreviewed or noindex page.
- Future `/zh-CN/*` canonical and hreflang behavior is deferred to I18N tasks.

## Internal Link Policy

Future `/landscape` may link to existing safe surfaces:

- `/projects`
- `/reports`
- `/geo-checker`
- `/founders`
- `/submit`
- `/alpha-feed`
- existing published stacks
- existing published collections
- existing published verticals
- existing approved alternatives

Future links may appear as placeholders only if they are not in sitemap, clearly marked as coming soon or internal-only, not indexable, and do not generate fake pages.

## CTA Policy

Allowed CTAs:

- Explore reviewed projects.
- Browse stacks, collections, verticals, reports, and approved alternatives.
- Submit a project for human review.
- Claim/correct a public profile.
- Run the geo-checker.
- View reports.
- Read Alpha Feed evidence.

Forbidden CTAs:

- paid listing or paid ranking;
- customer signup;
- buyer-interest capture;
- live feed access;
- contact/outreach automation;
- outcome promises for ranking, traffic, collection, AI citation, exposure, funding, or customers.

## Copy Boundary

Allowed copy:

- reviewed public signals;
- active source links;
- AI project landscape;
- machine-readability evidence;
- source-linked projects;
- public readiness signals;
- reviewed sample counts;
- published projects.

Forbidden copy:

- generic directory superlatives;
- unsupported global market-count claims;
- outcome promises for ranking, traffic, AI citation, ChatGPT visibility, exposure, or collection;
- investment-style or financial-advice framing;
- paid inclusion or automatic listing language;
- backlink or search-value promises;
- official endorsement without source evidence;
- fake counts.

Detailed copy and CTA policy lives in [TRAFFIC2_LANDSCAPE_COPY_AND_CTA_POLICY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC2_LANDSCAPE_COPY_AND_CTA_POLICY.md).

## Monetization Boundary

`/landscape` monetization boundary: `none`.

Do not include:

- featured placement;
- sponsored slot;
- advertise CTA;
- paid submit CTA;
- paid ranking;
- commercial listing claims.

If future Featured Signals appear on `/landscape`, they require a separate human-checkpointed task and must remain human-visible UI only. They must not affect sitemap, Public API ordering, MCP payloads, Signal Score, Source Confidence, organic route ordering, or editorial review.

## Visual/UX Direction

The future page should feel like a quiet operational project landscape, not a marketing landing page or directory clone:

- structured, scan-friendly sections;
- dense but readable project-signal cards;
- clear audience pathways;
- restrained visual hierarchy;
- no oversized decorative hero;
- no fake counters;
- no paid-placement styling;
- no card-within-card layouts;
- no route or section that implies broader coverage than reviewed samples support.

## Empty/Low-Data State

If reviewed data is sparse:

- do not pretend market coverage;
- use reviewed-sample wording;
- show available safe route families;
- link to reports and geo-checker;
- invite submit/correction through the reviewed workflow;
- do not invent categories;
- do not show global counts;
- do not create empty task pages.

Safe copy:

> 123Charts currently shows a reviewed sample of public AI project signals. Counts are not global market estimates.

## Noindex Fallback

Use `noindex, follow` if:

- implementation checker is missing or failing;
- copy has not been manually reviewed;
- the page links to unsafe or under-threshold surfaces;
- counts are not source-backed;
- lifecycle filtering is incomplete;
- forbidden fields could leak;
- sitemap and canonical policy are not implemented safely.

## TRAFFIC2B Implementation Handoff

The exact next task is:

TRAFFIC2B AI Project Landscape Landing Implementation v0.

TRAFFIC2B should implement the route only after this boundary is merged. Handoff details live in [TRAFFIC2_LANDSCAPE_IMPLEMENTATION_HANDOFF.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC2_LANDSCAPE_IMPLEMENTATION_HANDOFF.md).

## TRAFFIC2B Recommended Allowed Paths

Recommended future implementation paths:

- `app/landscape/page.tsx`
- `components/landscape/**`
- `lib/landscape/**`
- `lib/seo/**`
- `app/sitemap.ts` only if sitemap inclusion is required
- `scripts/check-landscape-boundary.mjs`
- `docs/traffic/TRAFFIC2B_*.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `package.json` only if checker script registration is required

## TRAFFIC2B Recommended Checker

Recommended checker: `node scripts/check-landscape-boundary.mjs`.

The checker should verify:

- `/landscape` exists only in TRAFFIC2B or later implementation scope;
- no `/tasks` or `/zh-CN` routes are introduced;
- data comes from reviewed/published public-safe sources;
- forbidden fields are not imported or rendered;
- route copy avoids restricted public claims;
- no paid/Featured Signals influence sitemap, score, Source Confidence, API, MCP, organic ordering, or editorial review;
- sitemap includes `/landscape` only when checker passes;
- low-data state uses reviewed-sample wording.

## Findings

1. TRAFFIC2 can complete as docs-only because the current roadmap scope allows `docs/traffic/TRAFFIC2_*.md`, status files, and roadmap metadata.
2. TRAFFIC2B was missing from roadmap before this task. TRAFFIC2 registers it narrowly as the exact next recommended implementation task without starting it.
3. The future `/landscape` route should not be built as a broad directory or ranking page. It should be a reviewed public-signal navigation hub.

## Sidecar Issues

None for TRAFFIC2.

## Exact Next Task

TRAFFIC2B AI Project Landscape Landing Implementation v0.

Do not start TRAFFIC2B inside TRAFFIC2.

## What This Task Does Not Do

- Does not implement `/landscape`.
- Does not create app routes.
- Does not create components.
- Does not create lib modules.
- Does not modify sitemap runtime.
- Does not generate SEO pages.
- Does not create `/tasks`.
- Does not create `/zh-CN` routes.
- Does not deploy.
- Does not perform external writes.
- Does not collect PII.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start TRAFFIC2B, TRAFFIC3, GROWTH0, BETA1, I18N0, or PR101.
