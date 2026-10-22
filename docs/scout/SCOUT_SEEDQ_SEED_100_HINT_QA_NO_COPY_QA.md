# SCOUT_SEEDQ Seed 100 Hint QA / No-Copy QA

Status: validation passed
Task: PR165 / SCOUT_SEEDQ
Result: PASS_SCOUT_SEED_NO_COPY_QA
Date: 2026-06-20

## Result

PR165 QA verifies PR163 and PR164.

Result: `PASS_SCOUT_SEED_NO_COPY_QA`.

Meaning:

- PR163 source policy is present and constrains Seed hints to identity-only fields;
- PR164 generated local-only `/tmp` output and did not commit generated JSONL packs;
- accepted hints use allowed fields and local-only guardrail fields only;
- rejected/weak hints stay separated;
- no public route, sitemap, Public API, MCP, report, data repo, Supabase write, audit trigger, or Growth state was introduced.

## Reviewed Scope

Reviewed committed files:

- `docs/scout/SCOUT_SEED0_SEED_100_SOURCE_MIX_DISCOVERY_HINT_POLICY.md`
- `docs/scout/SCOUT_SEED1_SEED_100_IDENTITY_HINT_LOCAL_PACK.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/trains/current.json`

Reviewed local-only generated files:

- `/tmp/123charts-pr164-seed-identity-hints-local-pack.jsonl`
- `/tmp/123charts-pr164-seed-identity-hints-rejected-or-weak.jsonl`
- `/tmp/123charts-pr164-seed-identity-hints-manifest.json`

## Local Pack QA

Accepted local hints:

- rows: 40;
- confidence: 21 `strong`, 19 `medium`;
- source types: 20 `github_repo`, 3 `product_hunt`, 6 `official_launch_page`, 6 `official_site`, 5 `manual_chinese_outbound`;
- state: `identity_hint_local_only`;
- review state: `not_reviewed_not_public_not_audited`.

Rejected or weak local hints:

- rows: 12;
- state: `rejected_or_weak_hint_local_only`;
- review state: `not_reviewed_not_public_not_audited`;
- reasons: 9 `directory_only`, 1 `copied_copy_risk`, 1 `no_official_site`, 1 `PII_risk`.

The rejected/weak rows are not failed projects. They remain incomplete evidence for later manual review.

## Schema QA

Accepted local hints use only PR163 identity fields plus PR164 local guardrail fields.

Allowed identity fields:

```text
project_name
official_website_url
github_url
docs_url
source_url
source_type
discovered_at
confidence
manual_note
```

Local guardrail fields:

```text
pr164_local_only
record_state
review_state
```

Forbidden fields were not present:

- category;
- description;
- ranking or rank;
- score;
- stars;
- traffic;
- reviews;
- recommendations;
- email or founder email;
- phone;
- public status;
- review status;
- publish status;
- audit status;
- sitemap status;
- Growth status.

## No-Copy QA

PR165 verifies:

- no competitor descriptions were committed;
- no directory category text was committed;
- no directory ranking, score, review, recommendation, popularity label, or sponsored-order data was committed;
- no README or marketing copy was copied into public 123Charts copy;
- `manual_note` remains short original 123Charts reviewer wording for local identity context only;
- Product Hunt and directory inputs remain discovery/source hints, not copy sources.

## PII / Private Data QA

PR165 verifies:

- no founder emails;
- no phone numbers;
- no private social handles;
- no customer names or logos;
- no screenshots;
- no cookies, sessions, tokens, credentials, analytics, billing, CRM, or admin data.

QA note: an initial broad phone-pattern probe matched date and URL-like numeric text. The final QA probe scans non-URL text fields for contact patterns and reports no issues.

## No-Public-Surface QA

PR165 verifies no changes were made to:

- `app/**`;
- `components/**`;
- `lib/**`;
- `scripts/**`;
- `supabase/**`;
- `deploy/**`;
- `middleware.ts`;
- `package.json`;
- `package-lock.json`;
- `public/**`;
- `.env*`;
- `/Users/rainie/Desktop/88cn-index-data/**`.

No Seed hints entered:

- public frontend;
- sitemap;
- Public API;
- MCP;
- `/landscape`;
- `/tasks`;
- alternatives pages;
- public report pages;
- report registry;
- public JSON;
- distribution packs.

## Train Closure

`TRAIN-PR163-PR165-SCOUT-SEED-MVP` is complete after PR165.

Train results:

| Task | Result |
| --- | --- |
| PR163 / SCOUT_SEED0 | `GO_SCOUT_SEED1` |
| PR164 / SCOUT_SEED1 | `PASS_SCOUT_SEED40_LOCAL_PACK_WITH_FINDINGS` |
| PR165 / SCOUT_SEEDQ | `PASS_SCOUT_SEED_NO_COPY_QA` |

Next train: `TRAIN-PR166-PR168-CANON-RESOLVER`.

Exact next task: PR166 / CANON0.

## Validation Results

Validation after PR165 edits:

| Check | Result |
| --- | --- |
| Local `/tmp` pack schema QA | PASS |
| No-copy QA | PASS |
| PII/private data QA | PASS |
| No-public-surface QA | PASS |
| `npm run agent:scope:check -- PR165` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/check-landscape-boundary.mjs` | PASS |
| `npm run landscape:check` | PASS |
| `node scripts/check-sector-density-boundary.mjs` | PASS |
| `node scripts/check-task-discovery-boundary.mjs` | PASS |
| `node scripts/check-alternatives-canonical.mjs` | PASS |
| `git diff --check` | PASS |
