# 12 Cache And Sitemap Strategy

123Charts public discovery must be indexable only after review and cheap to serve at scale.

## Indexing Rules

- `submitted`: noindex and excluded from sitemap.
- `pending_review`: noindex and excluded from sitemap.
- `approved`: preview-only, noindex by default, and excluded from sitemap until public state.
- `published`: indexable and included in sitemap.
- `claimed`: indexable and included in sitemap.
- `owner_verified`: indexable and included in sitemap.
- `archived`: noindex by default unless a human approves historical archive indexing.

Published-only indexing is the default rule.

## Sitemap Rules

- Sitemap shard max: 45,000 URLs.
- Support a sitemap index.
- Project pages, categories, collections, and reports may have independent sitemaps.
- Do not include admin, API, preview, or search-parameter URLs in sitemap output.
- Sitemap inclusion must follow lifecycle state, not route existence.

## Cache Rules

- Published project pages should be cacheable.
- Submit, claim, and admin pages must use no-store.
- Preview pages must use noindex and no-store.
- Public project pages must not call external APIs at render time.
- Cloudflare does not automatically cache all HTML, so cache rules must be planned explicitly.

## Render Source

Public pages must render from local reviewed snapshots. External fetches belong in queue workers, not request handlers.
