# GROWTH2B Report Distribution Draft Generator v0

Date: 2026-06-20
Role: Codex-Research
Result: PASS_LOCAL_DRAFT_CONTRACT_ONLY
Next task: GROWTH2Q Report Distribution Agent QA / No-External-Post QA v0

## Scope

GROWTH2B defines the local report distribution draft package that a future
generator may emit. The current roadmap scope forbids `scripts/**`, runtime
code, package metadata, public assets, routes, Supabase, deployment files, and
data-repo writes, so this task intentionally documents the generator contract
instead of adding executable generator code.

The draft package is local-only and review-only. It does not post externally,
send email, send DMs, log in to platforms, write CRM records, store PII, export
browser sessions, call social APIs, connect analytics, write Supabase, mutate
`/Users/rainie/Desktop/88cn-index-data`, or deploy.

## Input Contract

The draft generator may read only local, already-reviewed public report
metadata:

- report slug;
- public report path;
- report title;
- report kind;
- publication date;
- optional short, human-reviewed source note.

It must not read browser sessions, platform accounts, CRM exports, private
founder contacts, customer lists, analytics dashboards, emails, DMs, unpublished
project records, unreviewed external crawl output, or data-repo files.

## Output Contract

A compliant local draft package contains only:

- `manifest.json`, with source reports, channel list, generated timestamp, and
  safety flags;
- `README.md`, explaining that all drafts require human review;
- `links.json`, with local 123Charts report paths and titles only;
- channel draft markdown files;
- `manual-posting-checklist.md`, with human-only execution steps;
- `redaction-checklist.md`, with private-data and unsafe-claim review steps.

No output file may be committed by default. A future executable generator must
write under `/tmp` or another ignored local path unless a later roadmap task
explicitly allows committed artifacts.

## Manifest Template

```json
{
  "task": "GROWTH2B",
  "mode": "local_draft_only",
  "sourceReports": [
    {
      "slug": "weekly-ai-project-signals-2026-06-21",
      "path": "/reports/weekly-ai-project-signals-2026-06-21",
      "title": "Weekly AI Project Signals - June 21, 2026",
      "kind": "demo-report",
      "date": "2026-06-21"
    }
  ],
  "channels": [
    "x_thread_draft",
    "v2ex_post_draft",
    "jike_post_draft",
    "hn_title_candidates",
    "github_discussion_draft",
    "newsletter_snippet",
    "reddit_style_technical_post",
    "manual_posting_checklist"
  ],
  "safetyFlags": {
    "externalWrites": false,
    "emailSend": false,
    "dmSend": false,
    "socialPost": false,
    "platformLogin": false,
    "crmWrite": false,
    "piiIncluded": false,
    "browserSessionExport": false,
    "dataRepoMutation": false,
    "deploy": false
  }
}
```

## Channel Draft Templates

All examples below are templates, not live posts. A human must edit, approve,
and execute any external use outside Codex.

### X Thread Draft

```text
Draft only - human review required.

123Charts published a public growth-signal report:
{report_title}
{report_path}

Useful when reviewing how AI project pages present public, machine-readable
signals. The report uses reviewed local 123Charts materials and avoids private
founder, customer, CRM, or analytics data.
```

### V2EX / Jike Post Draft

```text
Draft only - human review required.

We are using 123Charts to track public AI project discovery signals. New report:
{report_title}
{report_path}

The writeup is intended as a public-signal review, not a promise of placement,
traffic, ranking, funding, or commercial outcome.
```

### Hacker News Title Candidates

```text
Draft only - human review required.

- Show HN: 123Charts public AI project signal report
- 123Charts report on machine-readable AI project pages
- Public growth-signal notes for early AI projects
```

### GitHub Discussion Draft

```text
Draft only - human review required.

We prepared a short 123Charts report based on public project-profile signals:
{report_title}
{report_path}

The report should be reviewed as local editorial material. It does not include
private contacts, account data, live analytics, or unreviewed external claims.
```

### Newsletter Snippet

```text
Draft only - human review required.

New on 123Charts: {report_title}. This public report summarizes reviewed AI project
signals and links back to the canonical report path: {report_path}.
```

### Reddit-Style Technical Post

```text
Draft only - human review required.

We are testing how to describe public AI project readiness without inventing
metrics or using private data. This 123Charts report is a local editorial artifact:
{report_title}
{report_path}

Review focus: public report metadata, public paths, and machine-readable
project presentation.
```

## Manual Posting Checklist

Before any human uses a draft externally:

- confirm the source report is published and public;
- confirm the public path is correct;
- remove any private person, account, email, phone, CRM, customer, or analytics
  detail;
- remove unsupported claims about traffic, ranking, investment, endorsement,
  customer adoption, or search visibility;
- confirm the draft does not ask Codex to log in, post, comment, email, DM,
  create issues, or call platform APIs;
- record the final human decision outside Codex if the team needs an operating
  log.

## Negative Boundary Probes

GROWTH2Q should verify that the GROWTH2B artifact does not introduce:

- executable sender code;
- platform credentials or account handles;
- browser cookie/session export;
- CRM field collection;
- private founder or customer contact fields;
- unreviewed external source scraping;
- committed generated output;
- route, sitemap, app, API, MCP, Supabase, package, or deploy changes;
- data-repo mutation;
- live social, email, DM, GitHub issue, comment, or platform API action.

## Validation Evidence

GROWTH2B must pass:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:scope:check -- GROWTH2B`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- direct landscape, sector-density, task-discovery, alternatives, and report
  distribution dry-run checks

The GROWTH2A boundary has been merged on `origin/main` at
`5912178c02f861f211a6ce138dc9ae5505780a1c`.

## What This PR Does Not Do

This PR does not add generator code, run external posting, send email, send DMs,
log in to platforms, create GitHub Issues or comments, write CRM records, store
PII, export browser sessions, call social APIs, connect live analytics, write
Supabase, change app/runtime code, change sitemap behavior, deploy, mutate the
data repo, start GROWTH2Q, start GROWTH1A, start GROWTH3A, start BETA1, start
I18N0, start OPS8D, start OPS10A, or start PR101.
