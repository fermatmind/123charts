# Day 1 Scaffold Notes

## Date

2026-06-15

## Summary

Created the 123Charts Day 1 Next.js App Router scaffold with TypeScript, Tailwind CSS, and shadcn/ui visual conventions.

## Architecture Decisions

### Framework

- Next.js 14.2 (App Router) — stable, well-tested LTS release
- React 18 — avoids React 19 upgrade risk during early scaffold phase
- TypeScript 5.7 — strict mode enabled
- Tailwind CSS 3.4 — classic config approach (v4 not yet widely adopted by shadcn/ui)

### Visual System

- Dark terminal aesthetic: near-black background (`#0a0a0a`), cool gray / silver white text, thin 1px borders
- CSS variable system follows shadcn/ui conventions (HSL color space, `--terminal-*` custom tokens)
- Inter (sans-serif body) + JetBrains Mono (monospace data) from `next/font/google`
- No illustrations, no cartoons, no generic AI tools navigation style

### shadcn/ui Conventions

- `lib/utils.ts` with `cn()` (clsx + tailwind-merge) — standard shadcn pattern
- CSS variable-based theming in `globals.css`
- Component primitives (Button, Card, Badge, etc.) written in-house following shadcn patterns
- No `npx shadcn-ui init` CLI run — manual setup to keep dependencies minimal

### Component Inventory

| Component | Purpose |
|---|---|
| `site-header` | Sticky nav bar, dark glass-morphism, minimal |
| `site-footer` | Clean footer with site name and nav links |
| `project-card` | Listing card with Signal Score, source confidence, claim status |
| `signal-score` | Numeric badge + dimension bar for detail page |
| `source-confidence-badge` | Source trust level indicator |

### Routes

| Route | Method | Type | Index Policy |
|---|---|---|---|
| `/` | GET | Server Component | Indexable |
| `/projects` | GET | Server Component | Indexable |
| `/projects/[slug]` | GET | Server Component | Indexable (published/claimed/verified) |
| `/submit` | GET | Server Component | noindex, no-store |
| `/claim/[slug]` | GET | Server Component | noindex, no-store |
| `/api/healthz` | GET | Route Handler | N/A (disallowed in robots) |

### Data Layer

- `lib/demo-projects.ts` — 6 hardcoded demo projects, no database connection
- All data follows data integrity rules (no fabricated metrics)
- Unknown values displayed as "Not verified", "Public signals only", etc.
- Public pages render from local snapshot data — no external API calls at render time

### Lifecycle & Sitemap

- Sitemap includes only `/`, `/projects`, `/submit`, and published/claimed project pages
- `robots.ts` disallows `/admin`, `/api`, `/preview`
- Claim/submit pages are `noindex`
- Lifecycle states follow AGENTS.md indexing policy

### What Is NOT Included

- No Supabase connection
- No `.env.local` or `.env` files
- No production secrets or API keys
- No crawler, no external API integration
- No third-party project data imported
- No upstream code copied into production (all code written by 123Charts)
- No `shadcn-ui` CLI init (manual shadcn-like setup only)

### Third-Party Notice

No third-party code, files, templates, or datasets have been copied into 123Charts production as of Day 1. All source files are original 123Charts code. `third_party/NOTICE.md` remains unchanged from Day 0.6.

## Verification

All Day 0 governance checks must continue to pass:

- `npm run verify:day0` — must pass
- `npm run policy:scan` — must pass (no forbidden wording in new files)
- `npm run third-party:check` — must pass (no unregistered third-party code)

New Day 1 checks:

- `npm run lint` — Next.js lint (eslint-config-next)
- `npm run typecheck` — TypeScript `tsc --noEmit`
- `npm run build` — Next.js production build

## Next Steps

- Day 2: Supabase integration, project submission API, admin review skeleton
- Day 2: Queue abstraction for external refresh jobs
- Day 2: Founder dashboard / claim verification backend
- Day 3: Editorial pipeline, score recalculation jobs, cost kill switches
- Future: Semantic search (DiscovAI reference — deferred to later phase)
