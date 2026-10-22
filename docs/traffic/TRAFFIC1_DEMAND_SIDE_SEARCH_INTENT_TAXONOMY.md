# TRAFFIC1 Demand-Side Search Intent Taxonomy v0

Result: GO_TRAFFIC2

Date: 2026-06-20

Role: codex-build

## Scope

TRAFFIC1 converts TRAFFIC0 and TRAFFIC0R into a finite demand-side search intent taxonomy for future 123Charts traffic routes. It defines route-family rules, indexability, sitemap eligibility, canonical ownership, Chinese search mapping, copy boundaries, monetization boundaries, priority, launch gates, and TRAFFIC2 inputs.

This is docs, taxonomy, route-policy, and SEO-boundary work only. It does not implement `/landscape`, `/tasks`, `/zh-CN` routes, alternatives expansion, SEO pages, runtime code, app routes, Supabase writes, deploy changes, external writes, PII collection, data repo mutation, or follow-up tasks.

## Source Inputs

- [TRAFFIC0_COMPETITOR_INTENT_CHINA_GAP_RESEARCH.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC0_COMPETITOR_INTENT_CHINA_GAP_RESEARCH.md)
- [TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md)
- [COMPETITOR_PAGE_PATTERN_MATRIX.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/COMPETITOR_PAGE_PATTERN_MATRIX.md)
- [CHINA_GLOBAL_SEO_GAP_MAP.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/CHINA_GLOBAL_SEO_GAP_MAP.md)
- [PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md)

TRAFFIC0R is the immediate input. Its result was `GO_TRAFFIC1_WITH_FINDINGS`: Chinese AI tool directories are active, but the differentiated 123Charts opportunity is a bilingual AI project landscape with reviewed public signals, active source links, lifecycle states, machine-readability evidence, and strict paid/organic separation.

## Intent Taxonomy

| intent_type | User job | Target audience | Competitor pattern | 123Charts differentiated answer | Allowed route families | Forbidden route patterns | Indexability policy | Sitemap policy | Copy boundary | Monetization boundary | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `task_intent` | Find projects that help with a concrete job. | Builder, operator, technical evaluator, C-end AI user. | TAAFT-like task pages and task/category filters in broad directories. | Finite task routes mapped to reviewed projects and source-linked public signals. | `/tasks/[slug]`, later `/zh-CN/tasks/[slug]`, supporting links from `/landscape`. | Unlimited task params, `ai-for-anything`, best/top pages, copied task descriptions. | Indexable only when slug is allowlisted and has at least 3 reviewed/published projects. | Include only allowlisted, indexable task routes. | Use reviewed sample counts, source links, lifecycle states, last reviewed. | `none`. | First wave after taxonomy. |
| `category_intent` | Browse a domain, sector, stack, or project family. | AI user, founder, researcher. | Toolify/Futurepedia/AIxploria and Chinese dense category blocks. | Treat categories as navigation into reviewed project landscape, not a volume-first directory. | `/landscape`, `/landscape/sectors`, collections, stacks, verticals, later `/zh-CN/landscape/sectors`. | Unbounded categories, fake global counts, thin auto-generated category pages. | Hubs can be indexable if reviewed copy and safe links exist; child category-like pages need threshold. | Include only reviewed/indexable finite routes. | Label counts as reviewed sample counts; avoid global inventory claims. | `none`. | First wave for hub, later for expansion. |
| `alternative_intent` | Compare a known project/tool with credible alternatives. | Software evaluator, buyer researcher, founder. | SaaSHub/AlternativeTo comparison and alternatives pages. | Canonical public-signal comparison of approved project pairs only. | `/alternatives/[slug]`, later `/zh-CN/alternatives/[slug]`. | N-by-N pair generation, reverse duplicates, superiority claims, unreviewed comparisons. | Indexable only for approved canonical pair with reviewed/published projects and safe copy. | Include only approved canonical pairs. | Compare source-backed public signals; no "better than" claims without evidence. | `none`. | First or second wave. |
| `landscape_intent` | Understand the AI project map, sectors, stacks, and active public signals. | Founder, builder, data researcher, AI project evaluator. | Weakly served by generic directories; stronger gap for 123Charts. | Core positioning: bilingual AI project landscape for reviewed public signals and machine-readability evidence. | `/landscape`, `/landscape/sectors`, `/zh-CN/landscape`. | Generic tool directory clone, broad ranking pages, fake market-size claims. | `/landscape` may be indexable as a safe hub; sector pages need thresholds. | Include indexable landscape hub and eligible sector pages only. | Use project landscape, reviewed public signals, active source links, machine-readability evidence. | `none`. | First wave. |
| `founder_research_intent` | Understand how a project appears publicly and how to improve source readiness. | Founder, builder, outbound founder. | Submit/update pages and editorial guideline pages. | Founder education plus claim/correction/submission lifecycle boundaries. | `/zh-CN/founders`, `/zh-CN/submit`, reports, `/geo-checker` explainers. | Visibility promises, automatic listing, paid inclusion confusion, outreach automation. | Founder education pages can be indexable after manual review; submit pages must avoid outcome claims. | Include only reviewed public education pages, not private workflows. | Use public readiness, source links, last reviewed, founder not claimed when true. | `none`; `/zh-CN/submit` is `checkpoint_required` for any commercial surface. | First wave. |
| `buyer_research_intent` | Evaluate public evidence, freshness, source trust, and exportable snapshots. | Data buyer, analyst, researcher, partner. | Weak in generic directories; some marketplace comparison intent. | Public-signal snapshots, report evidence, source confidence rules, no private fields. | Reports, `/report-distribution-pack`, future Alpha evidence docs. | Buyer-interest endpoints, live feed promises, private data access, customer-signup surfaces. | Reports can be indexable if reviewed and published. | Include reviewed/published report routes only. | Use public-signal evidence, reviewed report, source-backed fields. | `none` unless a future sponsorship checkpoint exists. | Second wave, with report exceptions. |
| `machine_readability_intent` | Check whether project pages expose crawlable and structured public signals. | Founder, builder, SEO/GEO operator, researcher. | AIBase GEO-style checker and 123Charts existing geo-checker adjacency. | Public readiness and machine-readability checks without visibility or citation promises. | `/zh-CN/geo-checker`, existing `/geo-checker`, reports/explainers. | Outcome scoring that implies guaranteed search visibility or AI citation. | Tool pages may be indexable if reviewed and safe; generated result pages must not be indexed. | Include only tool/explainer route, not generated checks or query URLs. | Use website reachable, sitemap detected, JSON-LD detected, canonical detected. | `forbidden` on `/zh-CN/geo-checker`. | First wave. |
| `zh_cn_tool_discovery_intent` | Discover AI projects/tools in Chinese. | Chinese AI user, builder, founder. | AI工具集, AIBase, AIGC导航, ToolifyAi Chinese, 360AI导航. | Avoid generic directory competition; frame as AI project map and source-linked public signals. | `/zh-CN/landscape`, later `/zh-CN/tasks/[slug]`, later `/zh-CN/landscape/sectors`. | Direct first-wave competition on `AI工具导航`, broad best/top/大全 pages, auto-translation at scale. | First-wave Chinese routes require manual review; child routes need thresholds. | Include only manually reviewed, indexable Chinese routes. | Chinese copy must say AI 项目图谱 and public signals, not generic paid listing. | `none` unless route-specific checkpoint says otherwise. | Limited first wave, broader later wave. |
| `zh_cn_outbound_founder_intent` | Help Chinese AI founders prepare for global discoverability and source readiness. | Chinese outbound founder, builder, operator. | Under-served relative to directory and GEO promotion pages. | Strong 123Charts opportunity: founder education, official-site checks, machine-readable evidence. | `/zh-CN/founders`, `/zh-CN/geo-checker`, `/zh-CN/submit`. | Search outcome promises, ranking guarantees, auto outreach, CRM/contact storage. | Indexable only after manual copy review; checker results not indexed. | Include public education/tool routes only. | Frame AI search visibility as readiness, not guaranteed appearance. | `none`; checker monetization is `forbidden`; submit commercial surface is `checkpoint_required`. | First wave after taxonomy. |
| `submission_intent` | Submit, update, claim, correct, or request review. | Founder, maintainer, project owner. | Submit/收录 pages across most directories. | Human-reviewed lifecycle with no automatic listing and no paid inclusion implication. | `/zh-CN/submit`, existing `/submit`, claim/correction explainers. | Paid inclusion pages, automatic listing promises, submitted records in sitemap. | Public submit education pages can be indexable if manually reviewed; submitted records stay noindex. | Do not include submitted, pending, scouted, or rejected records. | Use founder claim, correction, human review, source-backed profile language. | `checkpoint_required` for commercial surfaces. | First wave as education; product workflows separate. |
| `sponsored_placement_intent` | Understand or buy visible placement. | Sponsor, founder, advertiser. | Advertise, featured, premium placement pages across competitors. | Keep Featured Signals as visible UI only and isolated from organic systems. | No TRAFFIC1 launch route; future policy docs only. | Paid ranking, paid sitemap inclusion, paid score boost, paid API/MCP exposure. | Not indexable as demand-side organic route in TRAFFIC1. | No sitemap entry unless a future human checkpoint approves a dedicated sponsorship policy page. | Do not promise exposure, ranking, traffic, citation, funding, or customer outcomes. | `checkpoint_required` or `forbidden` depending route. | Later only. |

## Route Family Taxonomy

Detailed route-family rules live in [TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md). Summary:

- `/landscape` is the positioning and navigation hub.
- `/landscape/sectors` is the sector-density and market-map family.
- `/tasks/[slug]` is a finite allowlist of task-to-project discovery pages.
- `/alternatives/[slug]` is a canonical allowlist of public-signal comparison pages.
- `/zh-CN/landscape`, `/zh-CN/geo-checker`, `/zh-CN/founders`, and `/zh-CN/submit` are manually reviewed Chinese first-wave candidates.
- `/report-distribution-pack` is a reviewed report packaging policy surface, not an automated distribution workflow.

## Indexability Policy

The route-level default is:

- a route can be indexable only if it has at least 3 reviewed/published projects;
- if fewer than 3 reviewed/published projects are available, use `noindex, follow`;
- under-threshold routes must not be included in sitemap;
- under-threshold routes may still be used for internal navigation if useful and safe;
- submitted, pending, quarantined, scouted, rejected, private, draft-only, and unreviewed records must never make a demand-side route indexable.

Exceptions:

- pure reports can be indexable if the report is reviewed and published;
- `/geo-checker` and `/zh-CN/geo-checker` can be indexable as tool pages if static/manual copy is reviewed and generated result pages are not indexed;
- `/landscape` can be indexable as a hub if it links only to safe surfaces and does not make unsupported count claims;
- manually reviewed Chinese education/tool pages can be indexable before child route families are created.

## Sitemap Policy

Sitemap eligibility requires all of the following:

1. Route is indexable.
2. Route is finite and allowlisted when dynamic.
3. Route uses reviewed/published project data only.
4. Route is not generated from arbitrary params or query strings.
5. Route excludes submitted, pending, quarantined, scouted, rejected, private, draft-only, and unreviewed records.
6. Route is not an API, MCP, payment, admin, customer, buyer-interest, disabled shell, or internal endpoint.
7. Route is not an auto-translated page at scale.
8. Route is not an under-threshold task, sector, or alternatives page.

Detailed rules live in [TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md).

## Canonical Policy

- `/landscape` is self-canonical.
- `/landscape/sectors` is self-canonical.
- `/tasks/[slug]` is self-canonical only if the slug is allowlisted and indexable.
- `/alternatives/[slug]` is canonical only if the pair is approved in canonical order.
- Reverse-pair alternatives must not be generated.
- N-by-N alternatives must not be generated.
- `/zh-CN/*` canonical and hreflang implementation is deferred to I18N tasks; TRAFFIC1 defines only future intent and copy policy.
- Reports are self-canonical when reviewed and published.
- No canonical may point to an unreviewed or noindex page.

## Chinese Mapping

Detailed mapping lives in [TRAFFIC1_CHINESE_SEARCH_INTENT_MAPPING.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_CHINESE_SEARCH_INTENT_MAPPING.md). TRAFFIC1 confirms:

- Avoid first-wave direct competition with `AI工具`, `AI工具导航`, `AI工具大全`, and `AI工具集合`.
- Prioritize project-map, outbound-founder, source-readiness, and machine-readability clusters.
- First-wave Chinese candidates are `/zh-CN/landscape`, `/zh-CN/geo-checker`, `/zh-CN/founders`, and `/zh-CN/submit`.
- Later Chinese candidates are `/zh-CN/landscape/sectors`, `/zh-CN/tasks/[slug]`, and `/zh-CN/alternatives/[slug]`.
- `AI工具怎么被ChatGPT搜到`, `GEO`, and `AI搜索可见性` must be framed as public readiness and machine readability, not guaranteed visibility or citation.

## Copy Boundaries

Allowed:

- reviewed public signals
- source-linked AI projects
- active source links
- machine-readability evidence
- public readiness signals
- reviewed sample count
- published project set
- source-backed open-source or commercial status
- last reviewed
- website reachable
- GitHub linked
- docs linked
- sitemap detected
- JSON-LD detected
- canonical detected

Forbidden:

- best/top style superiority language without independent support
- outcome promises for ranking, traffic, AI citation, capital access, customers, visibility, or collection
- official endorsement unless an actual source supports it
- verified unless claim or verification status exists
- capital-product and restricted financial-offering language covered by the AGENTS public-language ban
- fake counts or unsupported global counts
- copied competitor descriptions
- paid inclusion, automatic listing, dofollow/backlink, or exposure promises

Chinese forbidden wording includes 保证曝光, 保证排名, 保证收录, 保证被 ChatGPT 引用, 免费外链, 付费收录, 买排名, 最强, 最全, 第一, 投资机会, 收益, 回报, 股权, and 代币 unless a later policy explicitly allows a safer factual context. The safe default is avoid.

Detailed rules live in [TRAFFIC1_DEMAND_SIDE_COPY_BOUNDARY.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/TRAFFIC1_DEMAND_SIDE_COPY_BOUNDARY.md).

## Monetization Boundary

TRAFFIC1 adopts the TRAFFIC0R Public Monetization Boundary Audit:

- Featured Signals may affect human-visible UI only.
- Featured Signals must not affect sitemap inclusion.
- Featured Signals must not affect Public API ordering.
- Featured Signals must not affect MCP payloads.
- Featured Signals must not affect Signal Score.
- Featured Signals must not affect Source Confidence.
- Featured Signals must not affect organic route ordering.
- Featured Signals must not affect editorial review result.

Route-family defaults:

| Route family | monetization_boundary |
| --- | --- |
| `/landscape` | `none` |
| `/landscape/sectors` | `none` |
| `/tasks/[slug]` | `none` |
| `/alternatives/[slug]` | `none` |
| `/zh-CN/landscape` | `none` |
| `/zh-CN/geo-checker` | `forbidden` |
| `/zh-CN/founders` | `none` |
| `/zh-CN/submit` | `checkpoint_required` for any commercial surface |
| `/report-distribution-pack` | `none` unless a later sponsorship checkpoint exists |

## Route Priority Model

| Route family | acquisition_priority | navigation_priority | SEO_risk | data_readiness | engineering_complexity | brand_fit | first_wave_or_later |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/landscape` | 3 | 5 | 2 | 4 | 3 | 5 | First wave |
| `/landscape/sectors` | 3 | 5 | 2 | 3 | 3 | 5 | First wave after hub policy |
| `/tasks/[slug]` | 5 | 3 | 4 | 3 | 3 | 4 | First wave after hub, finite slugs only |
| `/alternatives/[slug]` | 5 | 3 | 4 | 4 | 2 | 4 | First or second wave, canonical only |
| `/zh-CN/landscape` | 4 | 5 | 3 | 3 | 4 | 5 | First wave after stable English strategy |
| `/zh-CN/geo-checker` | 4 | 4 | 3 | 4 | 4 | 5 | First wave after manual Chinese review |
| `/zh-CN/founders` | 3 | 4 | 2 | 4 | 2 | 5 | First wave |
| `/zh-CN/submit` | 3 | 3 | 3 | 4 | 2 | 4 | First wave as education, workflow separate |
| `/report-distribution-pack` | 3 | 3 | 3 | 4 | 2 | 4 | Later first wave, reviewed reports only |

TRAFFIC1 incorporates TRAFFIC0R's nuance:

- `/tasks/[slug]` and `/alternatives/[slug]` have higher acquisition priority.
- `/landscape` has higher navigation and positioning priority.
- `/landscape` should be built before or alongside first task pages as the hub.
- Chinese routes should translate stable strategy, not multiply ambiguity.

## TRAFFIC2 Input Requirements

TRAFFIC2 should not start until this TRAFFIC1 taxonomy is merged and clean. TRAFFIC2 inputs are:

- `/landscape` purpose: positioning and navigation hub for reviewed public-signal AI projects.
- route-family boundaries: hub, sectors, tasks, alternatives, Chinese first-wave, and report pack.
- safe data source: reviewed/published project records and source-linked public evidence only.
- indexability rules: threshold and exception policy in this doc.
- sitemap rules: indexable finite routes only.
- allowed copy: reviewed public signals, source links, machine-readability evidence, reviewed sample counts.
- forbidden copy: outcome promises, copied descriptions, fake counts, capital-product language, paid inclusion.
- internal link policy: link from hub to eligible safe child routes; under-threshold pages may be internal only and noindex.
- CTA policy: founder submit/claim/correction education only, no automatic listing or paid outcome promise.
- monetization boundary: no paid effect on sitemap/API/MCP/score/source confidence/organic ordering/editorial result.
- no fake counts rule.
- no unreviewed project rule.
- no auto-generated category rule.

Expected next task: TRAFFIC2 AI Project Landscape Landing v0.

## Findings

1. TRAFFIC1 can proceed to TRAFFIC2 because the taxonomy can be expressed with finite routes and reviewed-data gates.
2. The actual roadmap allowed `docs/traffic/TRAFFIC1_*.md`, so TRAFFIC1 uses prefixed equivalents for the requested supporting reports.
3. No sidecar issue is required for TRAFFIC1 because the roadmap scope is sufficient for docs/status/roadmap metadata and forbids runtime work as expected.

## Sidecar Issues

None for TRAFFIC1.

## Exact Next Task

TRAFFIC2 AI Project Landscape Landing v0.

Do not start TRAFFIC2 inside TRAFFIC1.

## What This Task Does Not Do

- Does not implement `/landscape`.
- Does not implement `/tasks`.
- Does not implement `/zh-CN` routes.
- Does not implement alternatives expansion.
- Does not generate SEO pages.
- Does not modify app, components, lib, scripts, Supabase, deploy, middleware, package, public, gateway, secrets, or data repo files.
- Does not deploy.
- Does not perform new competitor browsing.
- Does not log in, submit forms, create accounts, contact users, post externally, or collect PII.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start TRAFFIC2, GROWTH0, BETA1, I18N0, or PR101.
