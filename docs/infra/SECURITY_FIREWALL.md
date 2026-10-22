# PR204 Security Firewall v0

Result: `SECURITY_FIREWALL_READY_NO_DEPLOY`

Scope: PR204 is a documentation and registry validation checkpoint for the
20k-50k public frontend lane. It reviews the current public surface after PR203
and before any production deploy gate. It does not change application runtime,
public UI, scripts, package metadata, deployment files, Supabase schema/data,
worker runtime, cloud/server state, or the companion data repository.

## Preconditions

- 123Charts control repo is clean on `origin/main` at
  `4d43a2ad0b31150d67e9ad4fab30f4ab7d2657db` before PR204 edits.
- PR203 / FRONTEND_QA is complete with
  `PASS_FRONTEND_QA_NO_LEAKAGE`.
- Worker repo `/Users/rainie/Desktop/GitHub/88cn-scout-worker` is clean at
  `587a6d87588301a86c9908628734f5f5e87e4d1e`.
- Data repo `/Users/rainie/Desktop/88cn-index-data` is clean at
  `1fb09e31b291d490981fe097a51da2c53dab2894`.

## Firewall Findings

| Surface | Evidence | PR204 verdict |
| --- | --- | --- |
| Project listing | `app/projects/page.tsx` reads through `searchPublishedProjectProjections()` from `lib/projects/published-projection.ts`. | Published projections only. |
| Project detail | `app/projects/[slug]/page.tsx` uses `getPublishedProjectBySlug()` and `notFound()` for missing or non-published records. | Non-published records fail closed. |
| Static params | `generateStaticParams()` for project detail maps only `getPublishedProjectProjections()`. | No arbitrary project slug expansion. |
| Search index | `lib/projects/search-index.ts` filters through `isProjectSitemapEligible()`. | Search documents require published lifecycle, canonical match, source summary, official URL, and no internal blockers. |
| Project sitemap | `getProjectSitemapEntries()` is derived from eligible published projections. | No raw, stale, quarantine, rejected, directory-hint, or copied-content blocker enters sitemap. |
| Collections | `app/collections/[slug]/page.tsx` and `lib/collections/curated-collections.ts` use finite registry rows. | Unknown, draft, noindex, archived, or below-threshold collections fail closed. |
| Task route | PR123 finite `/tasks/[slug]` remains accepted only by the task-discovery checker and route registry. | No broad `/tasks` index. |
| Public API | `public-api-boundary:check`, `public-api:v0:check`, and `agent:gate` keep Public API release disabled. | No Public API release in PR204. |
| MCP | `mcp-threat-model:check`, `read-only-mcp:check`, and `agent:gate` keep MCP disabled/read-only/local-boundary guarded. | No MCP release in PR204. |
| Worker pipeline | PR198 worker QA result is `PASS_WORKER_QA_NO_RUNTIME`. | Worker runtime cannot publish public projections. |
| Data repository | Data repo status was clean before PR204 and PR204 allowed paths exclude it. | No data repo mutation. |

## No-Leakage Checklist

PR204 confirms that the current public frontend and sitemap do not expose:

- `project_entities` backstage rows outside reviewed published projection fields.
- `seed_hint` records.
- `identity_candidate` records.
- `canonical_candidate` records.
- `audit_pending` records.
- raw audit observations.
- `review_ready` records.
- `quarantined` records.
- `rejected` records.
- private source evidence payloads.
- internal review notes.
- internal row hashes or evidence hashes.
- private artifact paths.
- copied competitor descriptions.
- fake score, "best", "top", or search-position claims.
- paid influence as organic ranking or sitemap eligibility.

## Route and Index Boundaries

- `/projects` is a public search/list surface over reviewed published
  projections only.
- `/projects/[slug]` is static-param bounded and fail-closed through
  `notFound()` when the slug does not resolve to a published projection.
- `/collections/[slug]` is finite-registry backed. A collection must be
  `published`, sitemap eligible, and meet `minimumPublishedProjects`.
- `/tasks/[slug]` remains finite and checker-backed from PR123; no `/tasks`
  index exists.
- `/sitemap.xml` includes project entries only through
  `getProjectSitemapEntries()` and collection entries only through
  `getCollectionSitemapEntries()`.
- `/api/public/v0/*` remains disabled by feature flag until a separate
  approved release.
- `/api/mcp` remains disabled unless its local-only feature boundary is
  explicitly enabled in a later approved task.
- Admin routes are not public project routes and do not feed sitemap entries.

## Validation Evidence

Baseline before PR204 edits passed:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- `node scripts/check-landscape-boundary.mjs`
- `npm run landscape:check`
- `node scripts/check-sector-density-boundary.mjs`
- `node scripts/check-task-discovery-boundary.mjs`
- `node scripts/check-alternatives-canonical.mjs`

PR204 post-edit validation must additionally include:

- `npm run agent:scope:check -- PR204`
- `git diff --check`

## Negative Guarantees

PR204 did not perform or authorize:

- production deploy.
- live smoke.
- SSH.
- Aliyun/Tencent/Workbench action.
- Nginx reload.
- PM2 restart.
- worker, crawler, audit, Redis, or queue runtime.
- Supabase staging or production write.
- public API or MCP external release.
- payment/customer access enablement.
- external outreach, CRM, email, social, or DM write.
- data repo mutation.
- PR205 deploy execution.

## Next Gate

The next task is PR205 / `PRODUCTION_DEPLOY_GATE`. PR205 may record an exact
candidate SHA and deployment checklist, but production deployment remains
blocked until the human gives an exact SHA approval phrase.
