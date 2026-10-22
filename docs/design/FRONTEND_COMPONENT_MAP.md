# 123Charts Frontend Component Map v0

Result: `FRONTEND_UI_DESIGN_SYSTEM_READY`

Scope: component architecture specification only. This document does not implement components or modify production UI.

## Component Source Rules

Public project components must accept one of:

- `PublishedProjectProjection`;
- a narrowed public-safe view model derived from `PublishedProjectProjection`;
- reviewed finite collection metadata;
- generic static policy copy.

Public project components must not accept:

- raw seed rows;
- raw evidence objects;
- raw audit observations;
- review notes;
- rejected or quarantine details;
- internal confidence;
- hashes;
- private artifact paths;
- worker job payloads;
- admin review objects;
- unreviewed external import rows.

## Component Inventory

| Component | Primary surfaces | Data source | Responsibility |
| --- | --- | --- | --- |
| SiteHeader | all public pages | static nav plus public route registry | compact navigation and search entry. |
| SiteFooter | all public pages | static nav | utility links and boundary links. |
| HeroSearch | home, 404, optional listing | query string into `/projects` | search-first discovery. |
| ProjectCard | home, listing, collections | `PublishedProjectProjection` | dense public project summary. |
| ProjectGrid | listing, collections, home strips | array of published projections | responsive card layout and pagination context. |
| ProjectSignalChips | card, detail, listing | `public_signal_chips` | display reviewed signal labels. |
| ProjectOfficialLinks | card/detail | official website, optional GitHub/docs | public source link cluster. |
| ProjectDetailHero | detail | published projection | title, summary, category, model type, review timestamp. |
| CollectionCard | collections index, shortcuts | reviewed collection metadata | finite collection entry point. |
| CollectionGrid | collections index/detail | reviewed collections or published project members | collection browsing layout. |
| SearchFilterPanel | projects listing | published projection-derived filters | finite search/filter controls. |
| MethodologyBlock | home, detail, collections, methodology | static policy copy | explain reviewed public signal policy. |
| SubmitCTA | home, detail, methodology, empty states | static route | submit/claim/correction call to action. |
| ReviewTimestamp | cards, detail, collections | `last_reviewed_at` or collection review date | freshness display. |
| EmptyState | listing, collections, 404, unavailable states | generic safe state | recovery without data leaks. |
| NoIndexGuard | route metadata helper | route eligibility | noindex/fail-closed policy wrapper. |

## SiteHeader

Purpose:

- provide stable public navigation without exposing admin/raw surfaces;
- prioritize Projects, Collections, Methodology, and Submit after the design architecture is implemented;
- keep brand visible but not oversized.

Inputs:

- static public nav items;
- optional search entry point state;
- no project data required.

Layout:

- sticky top header, 48-56px height;
- left brand mark/text;
- center or right compact nav;
- optional search icon or small search input on desktop;
- mobile menu or horizontal scroll with no clipping.

Rules:

- do not link to `/admin` in public header;
- do not link to raw reports or internal scout/admin paths;
- avoid marketing copy in the header;
- keep touch targets at least 40px high on mobile.

## SiteFooter

Purpose:

- provide utility navigation and policy links;
- reinforce public data boundary without long explanatory copy.

Inputs:

- static links: Projects, Collections, Methodology, Submit, optional Reports if public-safe;
- no raw data.

Layout:

- compact neutral footer;
- two rows on mobile, single row on desktop;
- optional small copyright line.

Rules:

- no admin link;
- no raw pipeline link;
- no claims about visibility outcomes;
- footer should not become a keyword dump.

## HeroSearch

Purpose:

- make search the primary first-viewport action;
- route users into `/projects` without creating crawlable query landing pages.

Inputs:

- default query string;
- finite shortcut links to base routes or finite collections;
- optional count from published projections only.

Layout:

- prominent search input with submit button;
- small shortcut chips below;
- avoid oversized marketing text after launch.

Behavior:

- submit navigates to `/projects?q=...`;
- query pages are noindex/follow by metadata;
- empty query navigates to `/projects`.

No-leak checks:

- placeholder and suggestions cannot include unpublished names;
- counts must derive from published projections only.

## ProjectCard

Purpose:

- optimize scanning across listing, home, and collections;
- expose only reviewed public data.

Inputs:

- `PublishedProjectProjection`.

Visible fields:

- project name;
- original summary;
- category;
- model type;
- public signal chips;
- official hostname;
- last reviewed;
- optional collection labels when space allows.

Forbidden fields:

- raw evidence;
- raw audit;
- internal confidence;
- review notes;
- private hashes;
- rejected/quarantine detail;
- unverified metrics.

Layout:

- 8px card radius or less;
- title one line with optional external/detail affordance;
- summary two lines;
- metadata chips wrap in two rows max before truncation pattern;
- official link row at bottom;
- review timestamp visible on expanded card or listing detail mode.

Mobile:

- one column;
- summary remains two to three lines;
- chips wrap without changing card hover size;
- official link hostname truncates safely.

## ProjectGrid

Purpose:

- present project cards at stable density;
- preserve scanning rhythm at 27 rows and 5000+ rows.

Inputs:

- array of published projections;
- pagination state;
- optional result count.

Layout:

- desktop 3 columns where width allows;
- tablet 2 columns;
- mobile 1 column;
- fixed gaps and no masonry layout.

Behavior:

- supports deterministic pagination;
- does not virtualize in v0 unless later needed;
- never fetches raw data.

Empty state:

- delegates to EmptyState with no mention of hidden records.

## ProjectSignalChips

Purpose:

- show reviewed source and readiness signals in a compact, machine-readable visual form.

Inputs:

- `public_signal_chips`;
- optional display mode: compact, detail, card.

Display rules:

- map known chip keys to reader-friendly labels;
- unknown chip keys should either be hidden or rendered only if allowlisted by public projection policy;
- do not invent positive chips from missing data;
- do not show internal weights.

Visual:

- neutral outline/fill chips;
- small icon only when it clarifies source type;
- no success-heavy color treatment that implies endorsement.

## ProjectOfficialLinks

Purpose:

- make official source links clear and auditable.

Inputs:

- `official_website_url`;
- optional `github_url`;
- optional `docs_url`.

Layout:

- "Official website" first;
- "Public GitHub" and "Public docs" after;
- hostname display below or inside link;
- external-link icon for each item.

Rules:

- do not render directory hints;
- do not render raw source evidence IDs;
- if official website is missing, the parent public page should fail closed under current policy.

## ProjectDetailHero

Purpose:

- establish identity and source boundary at the top of detail pages.

Inputs:

- `PublishedProjectProjection`.

Visible fields:

- project name;
- summary;
- category;
- model type;
- published projection label;
- review timestamp;
- official link.

Layout:

- compact detail header, not a marketing hero;
- source link near title/summary;
- chips below summary or in adjacent metadata rail on desktop.

Rules:

- no logo unless reviewed and licensed;
- no screenshots from competitors or unapproved sources;
- no claim that 123Charts has verified private business performance.

## CollectionCard

Purpose:

- represent one finite reviewed collection.

Inputs:

- collection slug;
- title;
- summary;
- inclusion criteria excerpt;
- last reviewed;
- eligible published project count.

Layout:

- title, summary, count, timestamp;
- optional representative project names from published projections;
- link to `/collections/[slug]`.

Rules:

- only render collections from `getPublishedCuratedCollections()`;
- do not expose draft/noindex collections;
- do not present collection membership as a ranking.

## CollectionGrid

Purpose:

- handle collections index and collection detail project lists.

Inputs:

- reviewed collection list for index mode;
- published project members for detail mode.

Layout:

- index: responsive collection card grid;
- detail: criteria panels plus ProjectGrid.

Behavior:

- fails closed when collection is under threshold;
- no arbitrary filter combinations;
- no dynamic category page generation from collection tags.

## SearchFilterPanel

Purpose:

- provide finite search controls for `/projects`.

Inputs:

- query;
- selected category;
- selected collection tag;
- selected model type if implemented;
- filter options derived from published projections.

Layout:

- desktop: search input plus compact selectors in one row;
- mobile: search input first, filters stacked or collapsible;
- reset link visible when any filter is active.

Rules:

- query variants noindex;
- filter options cannot include unpublished categories/tags;
- no hidden broad pSEO route creation;
- no unbounded facet combinations.

## MethodologyBlock

Purpose:

- explain trust model in small reusable pieces.

Inputs:

- static methodology text;
- optional collection methodology note;
- optional link to `/methodology`.

Content themes:

- reviewed `published_projection`;
- public signals only;
- official source links;
- timestamped review;
- finite collection membership;
- no private/raw data exposure.

Rules:

- examples must use published data or generic labels;
- no raw evidence examples;
- no internal confidence description.

## SubmitCTA

Purpose:

- route founders/readers to submit, claim, or correction flows without implying automatic publication.

Inputs:

- CTA variant: submit, claim, correction;
- target URL.

Layout:

- compact inline block or panel;
- icon plus short command;
- supporting copy no longer than two lines.

Rules:

- no promises about search outcomes;
- no automatic publish language;
- no private review-state detail.

## ReviewTimestamp

Purpose:

- make review freshness visible and reusable.

Inputs:

- ISO date string from `last_reviewed_at` or collection `lastReviewed`;
- optional label.

Layout:

- small text row with clock/check icon;
- card mode: compact;
- detail mode: fuller label such as "Last reviewed".

Rules:

- do not show raw audit timestamp unless it is projected as public review time;
- if missing, parent page should render neutral state or fail closed depending on route eligibility.

## EmptyState

Purpose:

- keep fail-closed and no-result paths useful without leaking hidden records.

Inputs:

- title;
- body;
- action links;
- optional search prompt.

Allowed messages:

- no public profiles matched this search;
- reviewed collections are being prepared;
- this public profile is unavailable;
- submissions are temporarily unavailable.

Forbidden messages:

- pending private slug exists;
- project was rejected;
- project is quarantined;
- queue state;
- internal blocker reason;
- raw backend error details.

## NoIndexGuard

Purpose:

- centralize indexability decisions for public pages and query variants.

Inputs:

- route type;
- sitemap eligibility boolean;
- query/filter state;
- lifecycle state after projection lookup.

Behavior:

- base public static routes may be indexable;
- filtered query pages noindex/follow;
- ineligible project/collection pages noindex or 404;
- `/admin`, 404, and disabled submit states noindex.

Rules:

- guard must not query raw records to explain failures;
- metadata cannot include private or unreviewed fields;
- sitemap helper and robots metadata must agree.

## Component Interaction Map

```text
Home
  SiteHeader
  HeroSearch
  ProjectGrid -> ProjectCard -> ProjectSignalChips / ProjectOfficialLinks / ReviewTimestamp
  CollectionGrid -> CollectionCard
  MethodologyBlock
  SubmitCTA
  SiteFooter

Projects Listing
  SiteHeader
  SearchFilterPanel -> NoIndexGuard
  ProjectGrid -> ProjectCard
  EmptyState
  SiteFooter

Project Detail
  SiteHeader
  ProjectDetailHero -> ReviewTimestamp / ProjectOfficialLinks
  ProjectSignalChips
  CollectionCard links
  MethodologyBlock
  SubmitCTA
  SiteFooter

Collections
  SiteHeader
  CollectionGrid -> CollectionCard / ProjectGrid
  MethodologyBlock
  EmptyState
  SiteFooter

Methodology / Submit / 404
  SiteHeader
  MethodologyBlock / SubmitCTA / EmptyState / HeroSearch
  NoIndexGuard where required
  SiteFooter
```

## Component QA Matrix

| Check | Components |
| --- | --- |
| Accepts only public projection or static policy input | ProjectCard, ProjectGrid, ProjectSignalChips, ProjectOfficialLinks, ProjectDetailHero, ReviewTimestamp. |
| Query variants noindex | HeroSearch, SearchFilterPanel, NoIndexGuard. |
| No admin/raw links | SiteHeader, SiteFooter, EmptyState. |
| No unreviewed collection exposure | CollectionCard, CollectionGrid. |
| No internal confidence or hash rendering | all project components. |
| Mobile no-overlap | SiteHeader, HeroSearch, ProjectCard, SearchFilterPanel, ProjectDetailHero. |
| Official links clear | ProjectOfficialLinks, ProjectCard, ProjectDetailHero. |
| Empty states non-leaky | EmptyState, ProjectGrid, CollectionGrid, NoIndexGuard. |

## Future Implementation Notes

Future implementation should proceed as narrow PRs:

- keep all component inputs typed to public projection or static public policy;
- add tests or checkers around public rendering if a component touches project data;
- avoid adding new dependencies for v0 design polish;
- avoid changing sitemap helpers in visual-only PRs;
- keep admin and public component namespaces separate;
- run policy, redaction, train, type, build, and gate checks before PR handoff.
