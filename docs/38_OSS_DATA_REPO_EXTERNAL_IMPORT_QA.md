# 38 OSS Data Repo + External Import QA

## Result

PASS.

## Scope

- Data repo: https://github.com/fermatmind/88cn-index-data
- Data repo commit: `24b54db`
- 123Charts main commit: `105883f`
- QA branch: `codex/oss-data-repo-external-import-qa`
- Date: 2026-06-16

## Screenshots

| Surface | Screenshot |
| --- | --- |
| 88cn-index-data repository | `../screenshots/qa/pr26-index-data-repo.png` |
| 88cn-index-data Actions | `../screenshots/qa/pr26-index-data-actions.png` |
| 88cn-index-data PR template | `../screenshots/qa/pr26-index-data-pr-template.png` |
| Local `/admin/external-imports` | `../screenshots/qa/pr26-admin-external-imports.png` |
| Local `/api/admin/external-imports` unauthorized response | `../screenshots/qa/pr26-admin-external-imports-unauthorized.png` |

## 123Charts Main Gate

PASS:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run db:schema:check`
- `npm run public-surface:check`
- `npm run intake:check`
- `npm run external-import:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build` - 40/40 pages

## Data Repo Validation

Repo status:

- `fermatmind/88cn-index-data` is public.
- `main` is synced with `origin/main`.
- Worktree is clean after QA.

PASS:

- `npm ci`
- `npm run taxonomy:check`
- `npm run privacy:check`
- `npm run validate`
- `npm run aggregate`
- `npm test`

## File Structure QA

PASS. Required files are present:

- `README.md`, `CONTRIBUTING.md`, `LICENSE`, `DATA_LICENSE.md`, `SECURITY.md`
- `taxonomy/categories.json`, `taxonomy/source-types.json`, `taxonomy/regions.json`, `taxonomy/tech-stacks.json`
- `schemas/project.schema.json`
- `data/projects/example-ai-project.json`
- `scripts/validate-projects.mjs`, `scripts/aggregate-projects.mjs`, `scripts/check-forbidden-fields.mjs`, `scripts/check-taxonomy.mjs`
- `docs/DATA_CONTRACT.md`, `docs/PRIVACY_BOUNDARY.md`, `docs/PR_REVIEW_POLICY.md`, `docs/OPEN_CORE_BOUNDARY.md`, `docs/MAINTAINER_GUIDE.md`
- `.github/workflows/validate-project.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS`

## Schema Check

PASS:

- `project.schema.json` uses `additionalProperties: false`.
- Allowed project fields are limited to public project metadata.
- URL fields require `https://`.
- Required fields include `schema_version`, `name`, `slug`, `website_url`, `category_slug`, `one_liner`, `source_type`, `region`, and `language`.
- Taxonomy slug uniqueness passed.
- At least one public source beyond `website_url` is enforced by validation.

## Privacy Boundary Check

PASS:

- Data repo docs reject email, phone, revenue, MRR, ARR, API keys, access tokens, private dashboards, analytics screenshots, private customer lists, and Stripe private fields.
- `check-forbidden-fields.mjs` blocks forbidden keys and sensitive string patterns.
- `README.md` states PR merge is not publication on 123charts.com.
- `README.md` states 123Charts does not promise traffic, ranking, funding, or AI search citation.
- Dynamic Signal Score, Source Confidence, Editorial Note, Claim status, Admin review metadata, and telemetry are excluded from the public data repo.
- Dangerous SEO/backlink/ranking/investment language scan found no matches.

## Negative Tests

PASS. Temporary `data/projects/__qa-*.json` files were created, tested, and deleted.

| Case | Expected | Observed |
| --- | --- | --- |
| `founder_email` / email pattern | `privacy:check` fails | Expected failure |
| `http://` website URL | `validate` fails | Expected failure |
| `unknown-category` | `validate` fails | Expected failure |
| Missing public source beyond website | `validate` fails | Expected failure |
| Duplicate `example-ai-project` slug | `validate` fails | Expected failure |

After cleanup, `git status --short` was clean in `88cn-index-data`, and `npm test` passed.

## GitHub Workflow QA

PASS:

- Workflow file exists: `.github/workflows/validate-project.yml`.
- Main push workflow observed: `Validate project data`, conclusion `success`.
- PR workflow observed: `Validate project data`, conclusion `success`.
- PR template exists and requires contributors to confirm no private information is submitted.
- CODEOWNERS exists.
- No auto-merge, auto-publish, OpenAI API call, crawler, webhook, or deploy behavior was observed in the workflow.

## External Import Static Check

PASS:

- Required `lib/index-data/*` files exist.
- Required admin page and admin API routes exist.
- `npm run external-import:check` passed.
- `syncExternalImports()` writes only to `external_project_imports`.
- No direct write to `projects` was observed.
- No auto publish logic was observed.
- No sitemap import or indexing mutation was observed.
- `dry_run` defaults to `true` in the admin sync API.
- The optional GitHub credential env var is server-only and does not use a `NEXT_PUBLIC_` prefix.
- Imported project payloads are re-validated inside 123Charts.
- Forbidden fields are blocked again inside 123Charts.
- Import fingerprint and dedupe logic exist.
- Migration `006_external_import_indexes.sql` is additive: fingerprint column plus indexes.

## Admin Route / API QA

PASS:

- `scripts/codex-preflight.sh` passed before browser testing.
- `/admin` returned a graceful `Admin Not Configured` state with no data exposure.
- `/admin/external-imports` returned `Sign In Required` when unauthenticated.
- `/admin/submissions` and `/admin/claims` returned `Sign In Required` when unauthenticated.
- `GET /api/admin/external-imports` returned `401 application/problem+json`.
- `POST /api/admin/external-imports/sync` returned `401 application/problem+json`.
- Problem Details contained `type`, `title`, `status`, `detail`, `instance`, and `request_id`.
- No raw import payload, GitHub credential, Supabase key, env value, or staged import data was observed in unauthenticated responses.
- Sampled admin pages contained no forbidden public language.

## Findings

- P0: none
- P1: none
- P2: none
- P3: none

## Explicit Safety Statements

- No project auto-publish observed.
- No direct write to `projects` observed.
- No sitemap import observed.
- No private field allowed in data repo.
- No SEO/backlink/ranking promises found.
- No authenticated admin dry-run was attempted.
- No real import row was created.
- No Supabase data was written.

## Known Limitations

- QA did not use an authenticated admin session, so the admin dry-run UI was not exercised beyond the auth boundary.
- QA did not create or write real `external_project_imports` rows.
- Browser screenshots are Safari desktop screenshots only.

## Recommended Next Step

Proceed with PR #27 focused on authenticated admin dry-run QA only after a controlled admin session and non-production Supabase target are available.
