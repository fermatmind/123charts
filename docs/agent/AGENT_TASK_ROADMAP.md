# 123Charts Agent Task Roadmap

Result: `AGENT0R_READY_FOR_WORKER_AGENT_IMPLEMENTATION`

Default for every task before explicit runtime approval:

```text
runtime allowed now: no
auto-publish allowed: no
production write allowed: no
```

## Modules

| Task | Repo | Purpose | Input | Output | Allowed Actions | Forbidden Actions | Human Checkpoint | Auto-Merge | Depends On | Runtime Now |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AGENT1 / Worker CLI Contract Stabilization | `88cn-scout-worker` | stabilize deterministic worker CLI, manifests, artifact contracts, and dry-run proof | existing worker contracts, fixtures, docs | stable CLI contract and no-runtime QA | docs, fixtures, local tests, dry-run artifact contract | runtime, crawler, live HTTP, Redis, DB writes, dependency changes | yes | no | AGENT0R | no |
| AGENT2 / Discovery Hint Agent | `88cn-scout-worker` | produce source-backed discovery hints | public seed lists and approved inputs | `seed_hint` artifacts | public-source hinting and dedupe | competitor content copying, private contacts, outreach | yes | no | AGENT1 | no |
| AGENT3 / Official Source Resolver Agent | `88cn-scout-worker` | identify official public URLs | `seed_hint`, `identity_candidate` | `source_verified` candidates | official source checks and ambiguity flags | treating directories as official sources, login/cookie scraping | yes | no | AGENT2 | no |
| AGENT4 / Canonical Entity Agent | `88cn-scout-worker` | create canonical candidates and ambiguity states | source verified candidates | `canonical_candidate`, `canonical_review_needed` | deterministic matching, duplicate evidence, uncertainty states | name-only merge, public slug write | yes | no | AGENT3 | no |
| AGENT5 / HTTP Audit Agent | `88cn-scout-worker` | generate bounded audit observations | canonical candidates and approved fixtures | `audit_observed` artifacts | fixture-first audit checks, bounded observations after approval | live crawl runtime, browser fallback, WAF bypass, proxy evasion | yes | no | AGENT4 | no |
| AGENT6 / Quarantine Classifier Agent | `88cn-scout-worker` | classify ambiguity/failure/privacy risk | audit/canonical/source states | `quarantined`, `rejected`, retry classes | failure taxonomy and admin-safe labels | public negative claims from unreviewed data | yes | no | AGENT5 | no |
| AGENT7 / Review Queue Packager Agent | `88cn-scout-worker` | package sanitized review-ready payloads | verified/quarantined/canonical records | `review_ready` packages | local package creation and redaction proof | writing 123Charts review queue, projection, sitemap | yes | no | AGENT6 | no |
| AGENT8 / Publish Recommendation Engine | `88cn-scout-worker` | recommend publish decisions with transparent reasons | review-ready packages and audit observations | `publish_recommended` decisions | recommendation and reason codes | final publish, ranking, paid/organic mixing | yes | no | AGENT7 | no |
| AGENT9 / Report Draft Generator | `88cn-scout-worker` | draft aggregate methodology and reports | reviewed aggregate data | local report drafts | aggregate drafts and methodology notes | public report release or external posting | yes | no | AGENT8 | no |
| AGENTQ / Agent No-Auto-Publish QA | `88cn-scout-worker` | prove the worker cannot publish automatically | worker code, fixtures, negative tests | QA report and failure gates | static checks and negative tests | disabling publication safeguards | yes | no | AGENT1 | no |
| AGENT-INTEGRATION0 / Worker Output to 123Charts Review Queue | `123Charts` | first approved handoff into admin review queue | sanitized review-ready worker package | 123Charts review queue records | approved admin queue integration | projection/sitemap/public write | yes | no | AGENT7, AGENTQ | no |
| BULK200_AGENT_DRY_RUN | `88cn-scout-worker` | capacity rehearsal for 200 records | fixtures/local approved manifests | local artifacts and review load estimate | local dry-run only | production writes and auto-publish | yes | no | AGENTQ | no |
| BULK1000_AGENT_DRY_RUN | `88cn-scout-worker` | capacity rehearsal for 1000 records | fixtures/local approved manifests | local artifacts and bottleneck report | local dry-run only | production writes and auto-publish | yes | no | BULK200_AGENT_DRY_RUN | no |

## Execution Order

```text
AGENT0R
  -> AGENT1
  -> AGENT2
  -> AGENT3
  -> AGENT4
  -> AGENT5
  -> AGENT6
  -> AGENT7
  -> AGENT8
  -> AGENT9
  -> AGENTQ
  -> AGENT-INTEGRATION0
  -> BULK200_AGENT_DRY_RUN
  -> BULK1000_AGENT_DRY_RUN
```

`AGENT-INTEGRATION0` is the first task that may connect worker output back to the `123Charts` admin review queue, and only after a separate explicit approval.

