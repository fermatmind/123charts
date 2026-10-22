# TRAFFIC3 Sector Density / Market Map v0

Result: GO_TRAFFIC3B_WITH_FINDINGS

Date: 2026-06-20

Role: codex-build / codex-research

## Scope

TRAFFIC3 defines sector-density and market-map policy for future 123Charts landscape work. This task is docs, status, and roadmap work only.

It does not implement `/landscape/sectors`, create app routes, create components, create lib modules, modify sitemap runtime, create `/tasks`, create `/zh-CN`, generate SEO pages, deploy, run competitor research, scrape external websites, contact anyone, mutate Supabase, or mutate `/Users/rainie/Desktop/88cn-index-data`.

## Source Inputs

- `docs/traffic/TRAFFIC0_COMPETITOR_INTENT_CHINA_GAP_RESEARCH.md`
- `docs/traffic/TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md`
- `docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md`
- `docs/traffic/TRAFFIC1_ROUTE_TAXONOMY_MATRIX.md`
- `docs/traffic/TRAFFIC1_CHINESE_SEARCH_INTENT_MAPPING.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_COPY_BOUNDARY.md`
- `docs/traffic/TRAFFIC2_AI_PROJECT_LANDSCAPE_LANDING_BOUNDARY.md`
- `docs/traffic/TRAFFIC2_LANDSCAPE_PAGE_SPEC.md`
- `docs/traffic/TRAFFIC2_LANDSCAPE_DATA_REQUIREMENTS.md`
- `docs/traffic/TRAFFIC2_LANDSCAPE_COPY_AND_CTA_POLICY.md`
- `docs/traffic/TRAFFIC2B_AI_PROJECT_LANDSCAPE_LANDING_IMPLEMENTATION_V0.md`
- `docs/traffic/TRAFFIC2C_DEMAND_SIDE_TRAFFIC_TRAIN_SPLIT_READINESS.md`
- `docs/TASK_STATUS.md`
- `docs/SIDECAR_ISSUES.md`
- `ops/tasks/roadmap.json`
- `ops/tasks/current.json`
- `app/landscape/page.tsx`
- `app/sitemap.ts`
- `scripts/check-landscape-boundary.mjs`
- Local public-signal registries under `lib/demo-projects.ts`, `lib/landscape/`, `lib/stacks/`, `lib/collections/`, `lib/verticals/`, `lib/alternatives/`, and `lib/reports/`.

## Repository / Data Scan Summary

Current runtime source for `/landscape` is local helper data, not the external data repo. `lib/landscape/public-signal-landscape.ts` reads:

- `getPublishedProjects()`
- `getPublishedStackClusters()`
- `getPublishedCuratedCollections()`
- `getPublishedVerticalAssetGrids()`
- `getPublishedCuratedAlternatives()`
- `getPublishedReportRoutes()`

Current reviewed sample facts safely derived from local code:

| Surface | Current reviewed sample count | Notes |
| --- | ---: | --- |
| Public-safe project profiles | 6 | Five `published`, one `claimed`; helper permits `published`, `claimed`, `owner_verified`. |
| Published-only project records | 5 | Used by current stack, collection, vertical, and alternatives helpers. |
| Claimed project records | 1 | Public-safe state, but not used by current published-only helper routes. |
| Demo category records | 5 | Category copy predates this TRAFFIC lane and is not a sector allowlist. |
| Published stack clusters | 3 | Each current stack has one published project. |
| Published curated collections | 3 | Each current collection requires at least two published projects. |
| Published vertical asset grids | 3 | Current vertical thresholds are two published projects; one vertical has three. |
| Published curated alternatives | 3 | Each route compares two published projects in canonical order. |
| Published report routes | 4 | Report routes are reviewed/published route exceptions, not sector pages. |

The companion data repo `/Users/rainie/Desktop/88cn-index-data` is clean and contains 101 public JSON project files with public fields such as project name, official site, category slug, GitHub URL, docs URL, tags, tech stack, source type, region, and language. TRAFFIC3 treats that repo as read-only context only. It is not a direct source for current public sector routes, and no data-repo file is mutated.

Current sitemap behavior:

- includes `/landscape`;
- includes existing finite category, collection, stack, vertical, alternatives, report, and project URLs;
- does not include `/landscape/sectors`;
- does not include `/tasks`;
- does not include `/zh-CN`.

Current checker caveat:

- `scripts/check-landscape-boundary.mjs` still asserts `ops/tasks/current.json` is `TRAFFIC2B` with `PASS` or `PASS_WITH_FINDINGS`.
- TRAFFIC3 leaves `ops/tasks/current.json` unchanged so `landscape:check` remains valid.
- This is tracked in existing sidecar issues and should be fixed by a later checker-maintenance task, not by TRAFFIC3.

## Definition Of Sector

A sector is a high-level demand-side grouping of AI projects by user problem, buyer context, or product market area, used for navigation and reviewed-sample analysis.

A sector is not:

- a global market category;
- an investment category;
- a ranking category;
- a paid placement category;
- an arbitrary keyword page;
- an SEO content farm;
- a complete market coverage claim.

## Sector vs Related Concepts

| Concept | Meaning in 123Charts | Sector distinction |
| --- | --- | --- |
| Sector | High-level demand-side grouping by problem, buyer context, or product market area. | Used for market-map navigation and reviewed-sample density. |
| Category | Broad product classification such as AI agents, AI coding, open-source AI, local LLM, or RAG tools. | Categories may be existing taxonomy labels; sectors are future curated market-map groupings and need stricter density language. |
| Vertical | Narrower application or operating domain such as builder infrastructure or analytics/operations tools. | Existing verticals are finite asset grids; sectors may summarize higher-level density across related verticals or categories. |
| Stack | Technology or infrastructure cluster such as vector search or model training infrastructure. | Stacks group technical implementation contexts; sectors group demand-side market/problem contexts. |
| Collection | Curated editorial grouping selected for a theme. | Collections are editorial sets; sectors require an allowlisted taxonomy and density rules. |
| Task | Concrete user job or workflow such as AI coding workflows or AI search readiness. | Tasks map "what I need to do"; sectors map broader project areas. |
| Alternative | Canonical comparison pair. | Alternatives compare two approved projects; sectors should not imply one project is better. |

## Sector Candidate Rules

Future sector candidates must be:

- finite;
- allowlisted;
- source-backed;
- manually reviewed;
- stable enough for navigation;
- mapped to existing reviewed project records;
- safe to describe without market-size claims;
- backed by public-safe lifecycle states only;
- separate from paid or Featured Signals logic.

Forbidden sector candidates:

- generic trend words with no reviewed projects;
- arbitrary keyword phrases;
- broad "AI tools" buckets;
- purely SEO-driven phrases;
- investment-style sectors;
- sensitive regulated domains unless policy explicitly permits them;
- sectors below threshold when intended for indexable pages;
- sectors generated from query parameters, tags, external crawls, or the companion data repo without review.

## Current Sector Candidate Readiness

Current local reviewed data supports only cautious candidate families:

| Candidate sector family | Current local backing | Count label | Readiness |
| --- | --- | --- | --- |
| AI builder infrastructure | Aurora Code, Nucleus ML, VectorBase | reviewed sample count: 3 | Eligible for an internal sector card and possibly an indexable page under the 3-project default, but not for a strong density claim. |
| Model and search infrastructure | Nucleus ML, VectorBase | reviewed sample count: 2 | Under threshold for indexable sector page; internal/noindex only. |
| Analytics and operations tools | Pulse Analytics, ComplyKit | reviewed sample count: 2 | Under threshold for indexable sector page; internal/noindex only. |
| Open-source AI project tooling | Aurora Code, VectorBase | reviewed sample count: 2 | Under threshold for indexable sector page; internal/noindex only. |
| AI coding workflows | Aurora Code | reviewed sample count: 1 | Under threshold; better handled as future task/stack context until more reviewed records exist. |
| Local/on-device productivity | Scribe AI | reviewed sample count: 1 | Under threshold; claimed public-safe example only. |

No current sector family reaches a five-project density threshold. Therefore TRAFFIC3B should not implement individual indexable sector pages or publish strong sector-density claims.

## Count / Density Rules

Allowed density fields:

- reviewed sample count;
- published project count;
- claimed project count if source-safe and clearly labeled;
- archived count only when clearly labeled historical and excluded from active coverage;
- open-source count if source-backed;
- commercial count if source-backed;
- GitHub linked count;
- docs linked count;
- website reachable count;
- sitemap detected count;
- JSON-LD detected count;
- canonical detected count;
- last reviewed date.

Forbidden density fields:

- global market count;
- total market size;
- traffic estimate;
- revenue estimate;
- ranking estimate;
- funding estimate;
- customer estimate;
- opportunity score;
- investment score;
- guaranteed market gap;
- fake density.

Count labels must use "reviewed sample count", "published project count", "source-linked project count", or "limited reviewed sample". Never use "complete sector coverage" or wording that implies 123Charts has counted the whole market.

## Allowed Fields

Sector cards may show, when source-backed:

- sector name and slug from a finite allowlist;
- short reviewed summary;
- reviewed sample count;
- published project count;
- source-linked project examples;
- public-safe lifecycle mix such as published or claimed;
- open-source/commercial split;
- GitHub linked count;
- docs linked count;
- website reachable count;
- sitemap detected count;
- JSON-LD detected count;
- canonical detected count;
- last reviewed date;
- methodology note;
- under-threshold label when applicable.

## Forbidden Fields

Sector cards and pages must not show:

- private founder contact fields;
- admin notes;
- raw database rows;
- raw external-import payloads;
- pending, submitted, quarantined, scouted, rejected, private, or draft-only records as active coverage;
- payment state;
- API credential or metering data;
- buyer-interest data;
- private analytics;
- internal Signal Score internals beyond already public-safe display rules;
- internal Source Confidence internals beyond public-safe labels;
- investor/backer counts unless separately verified and policy-approved;
- unverified revenue, customer, funding, traffic, ranking, or usage claims;
- paid or Featured Signals influence as a density input.

## Lifecycle Policy

Active sector counts may include only:

- `published`;
- `claimed`;
- `owner_verified`.

Implementation may choose the stricter current route-helper pattern of `published` only for first release if that better matches existing stack, collection, vertical, and alternatives helpers.

Conditional:

- `archived` can appear only as a separate historical/status count, not active sector coverage, and noindex remains the default unless a human approves historical archive indexing.

Forbidden:

- `submitted`;
- `pending_review`;
- `approved` when not yet published;
- `scouted`;
- `quarantined`;
- `rejected`;
- private/admin-only states;
- draft-only records;
- unreviewed claims.

## Indexability / Noindex Policy

Default rule:

- `/landscape/sectors` hub may be indexable only if it has reviewed copy, finite safe links, no unsupported count claims, and a passing checker.
- Individual sector pages require at least 3 reviewed/published public-safe projects.
- If a sector page claims density or market-map density, use 5 reviewed/published projects as the preferred threshold.
- Under-threshold sector pages must be `noindex, follow`.
- Under-threshold sector pages must not enter sitemap.
- Under-threshold sector cards may appear on `/landscape` as internal discovery only when labeled "limited reviewed sample".

TRAFFIC3 decision:

- threshold 3 is acceptable for basic indexability;
- threshold 5 is required for density-positioned pages;
- route-specific threshold is allowed only when the checker enforces the route's count label, sitemap state, and copy boundary.

## Sitemap / Canonical Policy

Future `/landscape/sectors` sitemap rule:

- include the hub only if a future implementation checker passes;
- include individual sector pages only if allowlisted and indexable;
- do not include under-threshold sector pages;
- do not include query-param pages;
- do not include generated sector pages;
- do not include submitted, pending, quarantined, scouted, rejected, private, unreviewed, or draft-only records;
- do not use paid/Featured Signals as a sitemap criterion;
- self-canonical only for allowlisted/indexable sector pages;
- noindex or under-threshold pages must not be canonical targets.

## Copy Boundary

Allowed sector language:

- reviewed sample;
- public signals;
- source-linked projects;
- published projects;
- limited reviewed sample;
- open-source/commercial split when source-backed;
- machine-readability evidence;
- last reviewed;
- not a global market estimate.

Forbidden sector language:

- best sector;
- hottest sector;
- highest ROI;
- investment opportunity;
- guaranteed demand;
- least competitive;
- saturated market unless evidence is explicitly reviewed and phrased as limited context;
- global sector count;
- complete landscape;
- traffic, revenue, funding, customer, or ranking claims;
- "you should build here";
- financial, investment, startup, legal, compliance, medical, security, or other regulated advice.

Sector copy must not imply that 123Charts is recommending where to allocate capital, build, buy, or launch. It may say that a sector has a limited reviewed sample of source-linked public projects.

## Market-Map Risk Analysis

| Risk | Failure mode | Control |
| --- | --- | --- |
| Fake density | Small reviewed sample is framed as broad market coverage. | Require reviewed sample labels and forbid global coverage wording. |
| Thin sector pages | Pages are created from keywords without enough reviewed projects. | Require finite allowlist, thresholds, noindex under threshold, no sitemap inclusion. |
| Ranking drift | Sector order implies best/worst or investment attractiveness. | Use neutral ordering such as editorial order or alpha order; no opportunity scores. |
| Paid/organic confusion | Featured Signals influence sector cards or sitemap. | Keep monetization boundary `none`; paid exposure cannot affect organic systems. |
| Data leakage | Pending, scouted, quarantined, or external staging data enters public pages. | Use public-safe lifecycle filters and staging-to-review boundary. |
| Regulated advice | Compliance, security, finance, healthcare, or legal sectors imply guidance. | Discovery-only copy and explicit no-advice boundary. |
| Data repo overreach | 101 public JSON files are treated as reviewed production routes. | Treat companion repo as staging/context only until imported and reviewed. |

## Future Page Architecture Recommendation

Option C is recommended for TRAFFIC3B:

Show sector cards or a sector-density module on `/landscape` only. Do not create `/landscape/sectors` yet, and do not create individual sector pages.

Reason:

- current local reviewed data has only six public-safe profiles;
- only one candidate family reaches the 3-project threshold;
- no family reaches the preferred 5-project density threshold;
- `/landscape` already exists as the safe hub;
- a module can improve navigation without creating thin indexable pages or sitemap risk.

Option A can be reconsidered later:

- `/landscape/sectors` hub only, no individual pages, if the module proves useful and the checker can enforce no route params, no sitemap leakage, and reviewed-sample language.

Option B should wait:

- `/landscape/sectors` hub plus finite `/landscape/sectors/[slug]` should wait until multiple sectors meet thresholds and a dedicated checker exists.

## TRAFFIC3B Implementation Handoff

Register and run TRAFFIC3B only as a constrained implementation task:

Title:

`TRAFFIC3B Sector Density / Market Map Implementation v0`

Recommended result:

`PASS_SECTOR_MODULE_ONLY`

Recommended implementation shape:

- add a sector-density module to existing `/landscape`;
- use a finite local sector registry/helper only if needed;
- no `/landscape/sectors` route;
- no individual sector pages;
- no sitemap runtime change unless a later route is explicitly approved;
- no `/tasks`;
- no `/zh-CN`;
- no API, MCP, payment, customer, buyer-interest, Supabase, deploy, or data-repo work.

Recommended allowed paths for TRAFFIC3B:

- `app/landscape/page.tsx`
- `components/landscape/**`
- `lib/landscape/**`
- `scripts/check-sector-density-boundary.mjs`
- `docs/traffic/TRAFFIC3B_*.md`
- `docs/SIDECAR_ISSUES.md`
- `docs/BUILD_ERRORS.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `package.json` only for checker script registration

Recommended forbidden paths:

- `app/landscape/sectors/**`
- `app/tasks/**`
- `app/zh-CN/**`
- `app/api/**`
- `supabase/**`
- `deploy/**`
- `middleware.ts`
- `package-lock.json`
- `public/**`
- `.env*`
- `.codex/**`
- `third_party/**`
- `gateway/**`
- `screenshots/**`
- `/Users/rainie/Desktop/88cn-index-data/**`

Recommended checker:

`scripts/check-sector-density-boundary.mjs`

Checker should validate:

- no fake counts;
- reviewed sample wording exists;
- no global market claims;
- no investment, financial, or regulated advice;
- no `/tasks`;
- no `/zh-CN`;
- no `/landscape/sectors`;
- no under-threshold sitemap entries;
- no arbitrary sector params;
- no forbidden lifecycle records;
- no payment, API, MCP, customer, or buyer-interest links;
- data repo remains clean.

Do not implement TRAFFIC3B inside TRAFFIC3.

## Findings

1. TRAFFIC3 can proceed to TRAFFIC3B only with a constrained module-first implementation.
2. Current reviewed local data is too small for individual sector pages.
3. A 3-project threshold is acceptable for basic indexability, but a 5-project threshold should be required for density-framed sector pages.
4. The companion data repo has broader public JSON coverage, but it is not current runtime truth for sector pages.
5. `ops/tasks/current.json` should remain unchanged until `landscape:check` becomes lifecycle-aware.
6. Deploy should wait until TRAFFIC7 by default, matching TRAFFIC2C, unless a human explicitly chooses a smaller checkpoint release.

## Sidecar Issues

No new blocking sidecar issue is opened by TRAFFIC3.

Existing non-blocking sidecar still applies:

- `scripts/check-landscape-boundary.mjs` remains lifecycle-scoped to `TRAFFIC2B/PASS`, so TRAFFIC3 leaves `ops/tasks/current.json` unchanged.

## Required Questions

1. A sector is a high-level demand-side grouping by user problem, buyer context, or product market area.
2. It differs from category, vertical, stack, collection, task, and alternative by serving market-map navigation and reviewed-sample density rather than broad taxonomy, narrow domain, technical cluster, editorial theme, workflow, or pair comparison.
3. `/landscape/sectors` should not be implemented yet; start with a module on `/landscape`.
4. Eligible current candidate families are limited; only AI builder infrastructure reaches 3 reviewed local projects.
5. Minimum indexability count is 3 reviewed/published public-safe projects.
6. Use 3 for basic indexability and 5 for density-framed sector pages.
7. Fewer than threshold means `noindex, follow`, no sitemap, and internal-only limited reviewed sample labeling.
8. Counts should be labeled as reviewed sample count, published project count, source-linked project count, or limited reviewed sample.
9. Sector cards can show source-backed public fields, reviewed counts, lifecycle-safe examples, machine-readability evidence, and last reviewed date.
10. Forbidden fields include private/admin/payment/API/metering/buyer-interest/raw/unreviewed data and unverifiable business or market claims.
11. Archived data must be separate historical/status context; dead or quarantined data must not count as active coverage.
12. Open-source/commercial split is allowed only when source-backed.
13. Machine-readability signals are allowed when source-backed.
14. GitHub, docs, and source link availability are allowed when public and reviewed.
15. Gaps can be shown only as "limited reviewed sample" or "not enough data", not as opportunity guarantees.
16. Avoid financial, investment, or market-opportunity advice by using reviewed-sample language and forbidding outcome claims.
17. Avoid fake density by finite allowlists, thresholds, source-backed counts, and explicit sample labels.
18. Sitemap policy: hub only after checker pass; individual pages only when allowlisted and indexable; under-threshold pages excluded.
19. Canonical policy: self-canonical only for allowlisted/indexable sector pages; noindex pages are not canonical targets.
20. TRAFFIC3B should implement only a sector module on `/landscape`.
21. TRAFFIC3B should add `scripts/check-sector-density-boundary.mjs`.
22. Deployment should wait until TRAFFIC7 by default, or happen after TRAFFIC3 only through an explicit human checkpoint release task.

## Exact Next Task

TRAFFIC3B Sector Density / Market Map Implementation v0.

Run TRAFFIC3B as a constrained module-only implementation. Do not start TRAFFIC4, GROWTH0, BETA1, I18N0, PR101, or TRAFFIC3Q from TRAFFIC3.

## What This Task Does Not Do

TRAFFIC3 does not implement product pages, app routes, `/landscape/sectors`, `/tasks`, `/zh-CN`, SEO page generation, sitemap runtime changes, route params, components, lib modules, checker scripts, package metadata, external research, competitor browsing, external writes, social posting, outreach automation, deployment, Supabase writes, or data repository mutation.
