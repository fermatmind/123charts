# 16 Upstream File Inventory

The upstream snapshots below were downloaded to `.scratch/upstream/` for research only. The snapshot files are ignored by Git and must not be committed.

| Repo | Commit SHA | Downloaded file/path groups | License file detected | Files committed | Production copied | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| `gijsverheijke/directorystarter` | `93c2f79a4721afdb1a84c6f6fe184dd372b17b10` | `README.md`, `LICENSE.md`, `package.json`, `schema.sql`, `env.example`, `app/sitemap.ts`, `app/listings/**`, `app/categories/**`, `app/submit/**`, `app/search/**`, `app/dashboard/**`, `components/listings/**`, `components/submit/**`, `components/search/**`, `utils/supabase/**`, `types/**`, `lib/keycopy.ts`, `proxy.ts`, `next.config.ts`, `tailwind.config.ts` | Yes, `LICENSE.md` | NO | NO | Use as architecture reference; future copy requires separate PR and notice entry. |
| `Durgesh-Vaigandla/AI-tools-database` | `95053fc0a2f596c9445472409db181a6d684e3af` | `README.md`, `LICENSE`, `package.json`, `data/schema.json`, `data/categories.json`, `data/tools.json`, `data/tools/**`, `scripts/**`, `.github/workflows/**`, `docs/**` | Yes, `LICENSE` | NO | NO | Use as data-schema and validation reference; rewrite 123Charts project schema. |
| `AlbertYang666/ainav` | `4b6bf7e2969b185642de16534789b6f809f7b0ca` | `README.md`, `README.zh.md`, `LICENSE`, `package.json`, `data/ai-services.json`, `locales/**`, `src/app/[lang]/**`, `src/app/admin/**`, `src/app/api/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `supabase/**`, `scripts/**` | Yes, `LICENSE` | NO | NO | Use as i18n/admin/submit reference; rewrite UI, API, schema, and copy. |
| `DiscovAI/DiscovAI-search` | `0499fae24f948cc831a5c1fabf6a9474fc202b55` | `README.md`, `LICENSE`, `package.json`, `src/db/**`, `src/app/**`, `src/components/**`, `src/lib/**`, `.env.example`, `next.config.mjs` | Yes, `LICENSE` | NO | NO | Keep as future semantic search reference only. |

## Snapshot Storage

- Snapshot root: `.scratch/upstream/`
- Commit files:
  - `.scratch/upstream/directorystarter.COMMIT`
  - `.scratch/upstream/AI-tools-database.COMMIT`
  - `.scratch/upstream/ainav.COMMIT`
  - `.scratch/upstream/DiscovAI-search.COMMIT`
- Whether files are committed: NO
- Whether files are production copied: NO
- Next action: use these snapshots to design 123Charts-owned schema, routes, queue boundaries, and review flows in future PRs.
