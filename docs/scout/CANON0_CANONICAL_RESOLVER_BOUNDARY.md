# CANON0 Canonical Resolver Boundary

Status: validation passed
Task: PR166 / CANON0
Result: GO_CANON1
Date: 2026-06-20

## Result

PR166 defines the canonical resolver boundary for 123Charts backstage identity work.

Result: `GO_CANON1`.

Meaning:

- PR167 may run only a local canonical resolver dry run if allowed by its scope and checkpoint;
- name-only matching is forbidden;
- ambiguous identities must remain unresolved or quarantined;
- no permanent merge, duplicate, canonical, or publication decision is made in PR166;
- no resolver code, external HTTP fetch, Supabase write, staging write, production write, data repo mutation, public route, sitemap, Public API, MCP, report page, audit trigger, crawler, deploy, or server/cloud mutation is authorized.

## Scope

In scope:

- define canonical identity fields;
- define normalized URL rules;
- define GitHub repo/org normalization rules;
- define apex domain handling;
- define ambiguity and conflict states;
- define duplicate handling;
- define quarantine rules;
- define common identity conflict cases.

Out of scope:

- resolver implementation;
- committed generated resolver output;
- external HTTP validation;
- crawling, browser automation, WAF bypass, login, cookies, forms, or proxy behavior;
- Supabase migration or write;
- staging or production write;
- data repo mutation;
- public route, sitemap, Public API, MCP, report page, or distribution surface;
- Growth, BETA, I18N, OPS10A, or PR101 start.

## Canonical Identity Fields

Canonical resolver inputs may use only public-safe identity/provenance fields.

Allowed input fields:

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

Allowed local resolver working fields:

```text
normalized_official_domain
normalized_official_url
normalized_docs_domain
normalized_docs_url
normalized_github_owner
normalized_github_repo
normalized_github_url
canonical_candidate_key
identity_conflict_state
canonical_decision_state
quarantine_reason
resolver_note
```

Forbidden fields:

- rankings;
- scores;
- traffic;
- reviews;
- recommendations;
- copied descriptions;
- copied categories;
- customer names;
- logos;
- founder emails;
- phone numbers;
- private social handles;
- public status;
- review status;
- publish status;
- audit status;
- sitemap status;
- Growth status;
- payment, analytics, CRM, billing, admin, cookies, sessions, tokens, or credentials.

## Normalized URL Rules

URL normalization is for local comparison only. It does not prove ownership or publication eligibility.

Rules:

- parse only syntactically valid `http` or `https` URLs;
- lowercase scheme and hostname;
- remove default ports;
- remove fragments;
- remove tracking query parameters such as `utm_*`, `ref`, `source`, and `fbclid`;
- preserve non-tracking query parameters only when they are part of a docs or product URL;
- remove a trailing slash except for root URLs;
- normalize `www.` away only for comparison, not for display;
- keep the original source URL for provenance;
- do not follow redirects in PR166;
- do not resolve DNS in PR166;
- do not fetch pages in PR166.

Invalid or unparsable URLs must be quarantined with `invalid_url`.

## Apex Domain Handling

Apex domain matching is evidence, not proof.

Rules:

- `www.example.com` and `example.com` can share an apex comparison key;
- subdomains such as `docs.example.com`, `app.example.com`, and `developer.example.com` must keep their subdomain evidence;
- unrelated subdomains must not be merged automatically;
- platform domains such as `github.io`, `vercel.app`, `netlify.app`, `notion.site`, `substack.com`, and `medium.com` are not project apex identity by themselves;
- country-code or brand redirect domains must stay provisional until an official source confirms ownership.

If one project appears across several domains, the resolver may create an `ambiguous_same_project_possible` state, but it must not publish or merge without later QA.

## GitHub Normalization

GitHub URLs are normalized for owner/repo identity.

Rules:

- accept public `github.com/<owner>/<repo>` repository URLs;
- accept public `github.com/<owner>` organization or owner URLs as incomplete identity evidence;
- strip fragments and tracking query parameters;
- strip paths after repo name such as `/tree/*`, `/blob/*`, `/issues`, `/pulls`, `/wiki`, and `/releases` for comparison;
- lowercase owner and repo for comparison, but preserve display spelling from source where needed;
- require official site, docs, source URL, or manual evidence before treating GitHub identity as canonical;
- do not infer project identity from repository name similarity alone.

Forks, mirrors, wrappers, templates, examples, and SDK-only repos require quarantine or manual review.

## Conflict Cases

### One Domain, Many Repos

Examples:

- official site links several repos;
- product has app, SDK, docs, examples, and template repos;
- organization hosts multiple products.

Policy:

- use domain as project-owned evidence only;
- do not select one repo as canonical unless source evidence identifies it as the main product repo;
- mark unresolved cases as `multi_repo_same_domain_review`.

### One Repo, Many Domains

Examples:

- old domain redirects to new domain;
- docs domain differs from marketing domain;
- regional domains share one repo;
- project rename leaves old site alive.

Policy:

- keep all source URLs;
- normalize domains separately;
- require redirect or official-source evidence before selecting a primary domain;
- mark unresolved cases as `multi_domain_same_repo_review`.

### Same Name, Different Projects

Examples:

- common AI product names;
- same name in different languages;
- old abandoned repo and active commercial product share a name.

Policy:

- name-only matching is forbidden;
- require domain, repo owner, docs, or source evidence;
- mark unresolved cases as `same_name_conflict`.

### Project Rename

Policy:

- preserve old and new names as evidence;
- require official source evidence for rename;
- avoid public claims until reviewed;
- mark unresolved cases as `rename_review`.

### Redirect Domain

Policy:

- PR166 does not fetch redirects;
- PR167 may use only local fixture or provided evidence unless checkpointed otherwise;
- unverified redirect claims remain `redirect_unverified`.

### Mirror Site

Policy:

- mirror sites are not canonical identity unless official source confirms them;
- mirror-only evidence must be quarantined as `mirror_unverified`.

### Fork

Policy:

- forked repos are not canonical upstream identity by default;
- fork evidence must be marked `fork_review`;
- do not merge fork and upstream identities automatically.

### Wrapper

Policy:

- wrappers around another project must remain separate unless official source states same ownership/product;
- mark as `wrapper_review`.

### Template Repo

Policy:

- templates are not product identities by default;
- mark as `template_repo_review`.

### Docs-Only Project

Policy:

- docs-only public projects can be identity candidates if docs are official/product-owned;
- they require explicit `docs_only_project_review` state before later acceptance.

### GitHub-Only Project

Policy:

- GitHub-only projects can be local identity candidates if the public repo is the primary project surface;
- they require stronger repo-owner evidence and no name-only matching;
- unresolved cases use `github_only_review`.

## Canonical Decision States

Allowed local-only states:

| State | Meaning |
| --- | --- |
| `canonical_candidate` | Evidence suggests a likely identity, but not public or permanent. |
| `ambiguous_review_required` | Multiple plausible identities exist. |
| `duplicate_candidate` | Duplicate is possible but not merged. |
| `quarantined` | Evidence is insufficient, risky, private, copied, or invalid. |
| `rejected_local_only` | Local hint is unsuitable for this stage. |

Forbidden states in PR166:

- `published`;
- `approved`;
- `claimed`;
- `owner_verified`;
- `audited`;
- `report_ready`;
- `growth_ready`;
- `sitemap_ready`;
- `public_api_ready`;
- `mcp_ready`.

## Duplicate Handling

Duplicate detection must be evidence-weighted.

Strong duplicate evidence:

- same normalized official domain plus same normalized GitHub repo;
- same official docs domain plus same official site;
- explicit official rename/merge evidence.

Medium duplicate evidence:

- same normalized official domain with different repos;
- same normalized repo with multiple domains;
- same product-owned docs and launch source.

Weak evidence:

- same or similar name only;
- same category;
- same directory page;
- same Product Hunt topic or launch category;
- same marketing phrase;
- same logo or screenshot.

Weak evidence must never auto-merge records.

## Quarantine Rules

Quarantine when:

- URL is invalid or missing;
- identity depends on name similarity only;
- source is directory-only;
- source has copied description/category/ranking/score/review/recommendation risk;
- source requires login, cookies, form submission, WAF bypass, proxy evasion, or browser session;
- project identity conflicts with another candidate;
- fork, mirror, wrapper, or template status is unresolved;
- private contact, analytics, billing, customer, CRM, or admin data appears;
- source evidence suggests public/audit/Growth status without review.

Quarantine is not a negative project label. It means evidence is incomplete or unsafe.

## PR167 Handoff

PR167 / CANON1 may proceed only as a local dry run if its human checkpoint is resolved.

PR167 must:

- use PR166 states and rules;
- prefer `/tmp` or fixture-only output;
- avoid external HTTP;
- avoid Supabase, staging, production, data repo, public routes, sitemap, Public API, MCP, reports, audit, deploy, and Growth;
- keep ambiguous and duplicate decisions provisional until PR168 QA.

Expected result: `PASS_LOCAL_CANONICAL_RESOLVER_DRY_RUN`.

## Validation Results

Validation after PR166 edits:

| Check | Result |
| --- | --- |
| `npm run agent:scope:check -- PR166` | PASS |
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
