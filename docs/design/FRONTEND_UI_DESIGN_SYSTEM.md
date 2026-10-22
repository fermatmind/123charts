# 123Charts Frontend UI Design System v0

Result: `FRONTEND_UI_DESIGN_SYSTEM_READY`

Scope: public frontend design architecture only. This document does not implement production UI, create routes, change runtime code, change data sources, deploy, write Supabase, mutate server/cloud state, or touch the companion data repository.

## Product Position

123Charts is the Free AI Project Growth Index. The public frontend should help readers scan reviewed AI project profiles quickly while making the data boundary obvious: public pages expose only reviewed `published_projection` rows and public-safe collection metadata.

Current production MVP context:

- CONTENT27 has 27 reviewed `published_projection` rows.
- `/projects` already reads a public-safe projection adapter.
- `/projects/[slug]` fails closed for missing or non-published slugs.
- finite curated collections exist as reviewed registry entries.
- search index and sitemap helpers already segment public data and exclude unsafe rows.

Future scale targets:

| Scale | UI implication |
| --- | --- |
| 50 projects | search-first home, compact listing, finite collections, project detail depth. |
| 200 projects | category and collection entry points become useful but must remain finite and reviewed. |
| 1000 projects | listing must rely on pagination, query noindex, and stable sort rules. |
| 5000 projects | search index must be segmented; filters cannot create broad indexable route families. |
| 50000 projects | public pages must render from reviewed local snapshots, segmented search, and sitemap partitions only. |

## Reference Architecture Scan

Public competitor pages were reviewed only for information architecture patterns:

- Toolify exposes a search-first directory, category navigation, daily/new lists, sponsored slots, and dense tool cards.
- SaaSHub exposes category browsing, alternatives-oriented navigation, latest submissions, and compact software cards.
- Futurepedia emphasizes search, trending categories, visual cards, and editorial/category groupings.
- AIBase combines AI tools, rankings, model/news surfaces, and multilingual navigation.
- AI工具集 uses dense Chinese-language navigation and large grouped tool catalogs.

123Charts may borrow browsing efficiency patterns such as strong search, dense cards, clear category entry points, and fast mobile scanning. 123Charts must not copy competitor wording, categories, descriptions, screenshots, logos, subjective ordering, score language, or commercial promises. 123Charts's differentiation is the reviewed public signal layer, official source links, timestamped review, machine-readable readiness, finite collections, and no fake ranking.

Reference sites:

- https://www.toolify.ai/
- https://www.saashub.com/
- https://www.futurepedia.io/
- https://www.aibase.com/
- https://ai-bot.cn/

## Public Data Contract

The public UI must treat `published_projection` as the only project-level frontend source.

Allowed project fields:

| Field | UI use |
| --- | --- |
| `slug` | public route path and internal link target. |
| `project_name` | page title, card title, search result label. |
| `original_summary` | card summary, detail summary, metadata description. |
| `official_website_url` | official external link only. |
| `github_url` | optional public GitHub link. |
| `docs_url` | optional public docs link. |
| `primary_category` / `category` | compact category label and finite filter option. |
| `collection_tags` | finite collection links and listing filter options. |
| `open_source_or_commercial` | neutral model label: Open source, Commercial, or Hybrid. |
| `public_signal_chips` | reviewed public signal chips only. |
| `last_reviewed_at` | visible review timestamp and metadata freshness hint. |
| `lifecycle_status` | render only when status is public-eligible. |
| `seo_indexable` | controls metadata/indexability, not visible as a badge. |

Forbidden public fields:

- raw seed rows;
- raw source evidence payloads;
- raw audit payloads;
- review notes;
- rejected or quarantine details;
- internal confidence;
- private hashes;
- private artifact paths;
- worker job payloads;
- staging IDs, internal IDs, reviewer identity, or review decision internals;
- payment/customer data;
- private founder, submitter, or contact data;
- unreviewed external import fields;
- any copied third-party description;
- any unverified traction, revenue, customer, verification, or financing claim.

Unknown data must be rendered as one of the approved neutral states:

- Not verified
- Public signals only
- Not enough data
- Founder not claimed
- Source unavailable

## Design Principles

1. **Published-only by default**: every public project component accepts `published_projection` or a derived public-safe view model.
2. **Fail closed**: missing, stale, rejected, quarantined, or unreviewed data produces 404, noindex, or empty state rather than a partial public leak.
3. **Search first**: the primary browsing affordance is search plus finite filters, not broad generated landing pages.
4. **High-density but calm**: pages should show many reviewed projects without feeling like an ad directory.
5. **Official links are first-class**: official site, docs, and GitHub links should be visually clear and separated from 123Charts commentary.
6. **Signal chips are evidence labels**: chips summarize reviewed public signals; they are not hidden weights, endorsement, or paid placement.
7. **Finite collections only**: collection pages are curated, reviewed, and sitemap-eligible only when the collection registry says so.
8. **No leaderboard default**: default listing sort should be stable and neutral. No fake ranking, popularity implication, or subjective "best" ordering.
9. **Admin isolation**: public UI never links into raw pipeline surfaces; `/admin` stays protected and noindex.
10. **Scale before ornament**: UI should support 5000+ projects with pagination, deterministic sort, compact cards, and segmented search indexes.

## Visual Direction

Target public style:

- white or near-white page background;
- neutral ink, slate, and muted gray text;
- restrained accent color for focus, source links, and signal chips;
- 8px or smaller card radius;
- dense but readable cards with strong hierarchy;
- clear search box as a first-viewport signal;
- compact filters, not large decorative panels;
- no gradient-orb decoration;
- no oversized marketing hero after launch;
- no exaggerated public copy;
- no visual treatment that makes paid or promoted surfaces look like reviewed signal quality.

Admin and internal pages may remain more utilitarian. Public pages should move toward a neutral directory/editorial interface instead of the current dark terminal-first visual direction.

## Layout System

Page shell:

- maximum content width: 1120-1280px for listings, 760-920px for detail prose;
- horizontal padding: 16px mobile, 24px tablet, 32px desktop;
- section spacing: 32-48px desktop, 24-32px mobile;
- sticky header height: 48-56px;
- footer kept compact and utility-oriented.

Cards:

- project cards: fixed scan rhythm, title at top, two-line summary, chips, official link row, review date;
- collection cards: title, summary, criteria count or project count, last reviewed;
- avoid nested cards;
- repeated cards may use subtle border and neutral background;
- no card should change size on hover.

Controls:

- search input should be the largest control on home and listing pages;
- filters should be finite dropdowns, segmented controls, or checkboxes;
- pagination should use page numbers or previous/next with canonical non-index behavior for filtered results;
- official link buttons should use icons from the app's icon library;
- external links must use clear external-link affordance.

Typography:

- page titles: 28-40px desktop, 24-32px mobile;
- listing card titles: 14-16px;
- metadata labels and chips: 11-12px;
- body summary: 13-15px;
- no viewport-width-scaled fonts;
- letter spacing remains 0 except small uppercase labels that already exist in the design language.

## Signal Chip Design

Signal chips should be visually prominent but not loud.

Recommended chip groups:

| Group | Examples | Visual treatment |
| --- | --- | --- |
| Source availability | official site, docs, GitHub | neutral outline chip with icon. |
| Machine readability | sitemap, JSON-LD, schema | subtle filled chip. |
| Review state | published projection, last reviewed | timestamp-adjacent chip. |
| Model type | open source, commercial, hybrid | text chip, not a quality label. |

Chip rules:

- display only reviewed chip values;
- do not infer missing chips;
- do not convert missing data into negative claims;
- do not show internal confidence or hidden weights;
- do not let featured/promoted placement alter chips;
- do not show raw audit status or audit payload detail.

## Search And Filter Direction

Home search:

- primary search box with placeholder focused on project, category, or public signal;
- direct link to `/projects?q=...`;
- show finite collection shortcuts below search.

Listing search:

- search input, category dropdown, collection dropdown/tag selector, and optional model-type selector;
- all filters render as query parameters;
- filtered query result pages remain noindex unless a later reviewed route policy explicitly approves them;
- filter option sets are derived from current published projections only;
- listing does not create crawlable arbitrary combinations.

Scale behavior:

- page size remains fixed and deterministic;
- search index records contain slug, title, summary, category, finite collection tags, public chips, path, and last reviewed;
- segment search indexes by stable category bucket or project slug range at larger scale;
- sitemap segment size should stay bounded and aligned with existing helper constants;
- public routes must not crawl external sources or recalculate signals at request time.

## Official Link Treatment

Official links must be easy to verify visually.

Rules:

- show "Official website" before any secondary links;
- optional GitHub and docs links follow as separate links;
- display hostnames for scanability;
- external links open in a new tab with safe attributes;
- never label a directory source as official;
- never show raw source evidence IDs or hashes;
- if official link is missing, the project should not be public-indexable under the current gate.

## Collection Direction

Collections are finite navigation, not broad pSEO.

Rules:

- collection index lists only reviewed finite collections;
- collection detail must show inclusion criteria, why included, project list, methodology note, and last reviewed;
- membership comes from reviewed collection registry plus published project projections;
- empty or under-threshold collections fail closed or noindex;
- collections do not imply endorsement or ordered superiority.

## SEO And Metadata Rules

Public metadata may use only reviewed projection fields.

Allowed:

- title from `project_name` or collection title;
- description from `original_summary` or collection summary;
- canonical path from reviewed slug;
- robots index/follow only when sitemap eligibility passes;
- JSON-LD only from public-safe fields and official links.

Forbidden:

- raw evidence;
- raw audit observations;
- review notes;
- private paths;
- hash values;
- internal confidence;
- unreviewed external import data;
- filtered query pages as indexable pages;
- sitemap entries for non-eligible lifecycle states.

## Accessibility And Mobile

Mobile browsing must be fast and dense:

- header nav collapses or horizontally scrolls without clipping core links;
- search remains above the fold;
- filters stack below search and are collapsible after 200+ projects;
- cards use one column and preserve fixed title/summary/chip rhythm;
- tap targets are at least 40px high for primary controls;
- official links remain readable and do not overflow;
- chips wrap cleanly and never overlap summary text;
- pagination controls remain reachable after results.

Accessibility requirements:

- semantic headings per page;
- visible focus rings;
- link labels include purpose;
- empty states announced with clear text;
- color cannot be the only signal for status;
- external links include visible external-link icon or label.

## No-Leak Checklist

Before implementing or changing public UI, verify:

- component input type is `PublishedProjectProjection` or a public-safe derived object;
- no raw data import path is used in public routes;
- unknown fields are absent or neutral;
- no admin-only status appears in public UI;
- no unreviewed project slug is linked;
- no query/filter page becomes sitemap-eligible by accident;
- no source evidence ID, hash, artifact path, job payload, or private reviewer field appears in rendered HTML;
- no public page claims verified traction, revenue, customer count, financing, or internal quality;
- no paid/featured surface changes organic order, chips, or sitemap inclusion.

## Implementation Boundary

This v0 design system is a product and architecture blueprint only. Future implementation work should be split into small PRs:

1. public style tokens and shell alignment;
2. search/header/home redesign;
3. project card/detail component upgrade;
4. collections index and collection detail polish;
5. no-leak and sitemap/search regression tests.

Each implementation PR must keep the public data source bound to reviewed `published_projection` rows unless a later human-approved policy expands the contract.
