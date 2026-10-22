# 15 Open Source Reuse Plan

This plan is based on research snapshots downloaded to `.scratch/upstream/`. Those files are not committed and are not production code.

## Snapshot Summary

| Upstream repo | Commit SHA | License judgment | 123Charts use judgment |
| --- | --- | --- | --- |
| `gijsverheijke/directorystarter` | `93c2f79a4721afdb1a84c6f6fe184dd372b17b10` | MIT detected in `LICENSE.md` | Strong reference for directory routing, listing submission, Supabase access shape, and sitemap structure. |
| `Durgesh-Vaigandla/AI-tools-database` | `95053fc0a2f596c9445472409db181a6d684e3af` | MIT detected in `LICENSE` | Strong reference for public JSON schema, category split, validation, aggregation, and docs workflow. |
| `AlbertYang666/ainav` | `4b6bf7e2969b185642de16534789b6f809f7b0ca` | MIT detected in `LICENSE` | Strong reference for i18n, admin review, submit API, sitemap, robots, and review workflows. |
| `DiscovAI/DiscovAI-search` | `0499fae24f948cc831a5c1fabf6a9474fc202b55` | Apache-2.0 detected in `LICENSE` | Future-phase reference for semantic search and chat-style retrieval only. |

## Per-Repo Reuse Decisions

### gijsverheijke/directorystarter

- Purpose: directory scaffold reference for listings, categories, search, submit, dashboard, Supabase helpers, and sitemap.
- License: MIT, eligible for future direct fork or module extraction with notice.
- Can directly copy: none in this PR. Future isolated extraction may consider small utility patterns or schema concepts only after separate PR and `third_party/NOTICE.md` update.
- Must rewrite: public UI, route copy, listing pages, submit flow, dashboard flow, Supabase table names, RLS policies, and sitemap logic to match 123Charts lifecycle rules.
- Reference only: visual layout, category taxonomy, listing descriptions, and any project content.

### Durgesh-Vaigandla/AI-tools-database

- Purpose: data repo schema, validation, category split, aggregation scripts, docs, and GitHub workflow reference.
- License: MIT, eligible for future module extraction with notice.
- Can directly copy: none in this PR. Future separate PR may adapt validation structure after rewriting fields for 123Charts.
- Must rewrite: schema fields, category set, validation error wording, aggregation output, and all data rows.
- Reference only: tool lists, descriptions, category labels, docs site output, and contributor wording.

### AlbertYang666/ainav

- Purpose: i18n, admin, submit, API, sitemap, robots, Supabase review schema, and notification workflow reference.
- License: MIT, eligible for future module extraction with notice.
- Can directly copy: none in this PR. Future separate PR may adapt high-level i18n file organization or admin review concepts after review.
- Must rewrite: admin UI, API routes, auth assumptions, Supabase schema, moderation model, email/notification code, service data, and public pages.
- Reference only: service descriptions, locale content, UI composition, admin screens, and review copy.

### DiscovAI/DiscovAI-search

- Purpose: future semantic search reference, including embedding, vector database access, chat API, and search-result UI.
- License: Apache-2.0, eligible for future reference or module extraction with notice and patent-license awareness.
- Can directly copy: none in this PR. Future direct extraction should be avoided until semantic search becomes an approved phase.
- Must rewrite: all chat API routes, embedding provider integration, prompt text, UI components, database access, and environment contract.
- Reference only: vector search architecture, rate-limit shape, and retrieval flow.

## 123Charts Mapping

| Upstream concept | 123Charts target |
| --- | --- |
| `listings` | `projects` |
| `submit` | `project_submissions` |
| `dashboard` | founder dashboard / admin review |
| `approved` / `pending` | 123Charts lifecycle states |
| `data/tools/*.json` | `88cn-index-data data/projects/*.json` |
| `schema.json` | `project.schema.json` |
| `scripts/validate.js` | `validate-project.js` |
| vector search | future phase only |

## Day 1-Day 3 Code Migration Plan

### Day 1

- Create 123Charts-owned `project.schema.json` from product requirements, not by copying upstream schema directly.
- Create validation command shape inspired by AI-tools-database, with 123Charts fields and lifecycle constraints.
- Define data repo layout for `data/projects/*.json`, `data/categories.json`, and source metadata.
- Keep public page rendering snapshot-only.

### Day 2

- Create 123Charts-owned app scaffold only after governance approval.
- Build project listing, category, search, and submit route contracts using 123Charts names.
- Implement published-only sitemap rules and no-store preview/admin/submit policies.
- Keep external refresh off the request path.

### Day 3

- Add founder dashboard / admin review skeleton with lifecycle promotion blocked behind human review.
- Add queue abstraction for external refresh jobs.
- Add cost kill switches before external refresh, score recalculation, or editorial generation jobs.
- Defer vector search to a later phase.

## Risk List

- MIT and Apache-2.0 permit reuse, but provenance must still be recorded before any production copy.
- Directory UI patterns can drift into pixel-level copying; 123Charts must create its own visual system.
- Upstream data rows and descriptions are not 123Charts editorial content and must not be bulk imported as published pages.
- Upstream schemas use tool-directory assumptions; 123Charts needs project lifecycle, claim, and review fields.
- Upstream status names do not match 123Charts lifecycle states exactly.
- Admin and submit flows may assume auth, email, and database policies that are unsafe for 123Charts without redesign.
- Semantic search adds external API, embedding, vector storage, and cost risk; it stays future phase only.
- Raw upstream payloads must remain in `.scratch` and out of Git.
