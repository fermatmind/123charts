# 123Charts Agent Automation Strategy

Result: `AGENT0R_READY_FOR_WORKER_AGENT_IMPLEMENTATION`

Slogan: `Automatic recommendation, human final gate.`

## Core Principle

The 123Charts Agent system is not an auto-publishing crawler.

The 123Charts Agent system is an automatic data preparation and recommendation pipeline. It may prepare source-backed candidates, normalize evidence, classify risk, package review payloads, and recommend publish decisions. It must not bypass human review.

Final public release must always pass through:

```text
worker output
  -> review-ready payload
  -> 123Charts admin review
  -> manual publish gate
  -> published_projection
  -> frontend / search / sitemap
```

`publish_recommended` is not `published`. `review_ready` is not `published`. Only records that pass human admin review may become `published` and enter `published_projection`.

## Three Repo Roles

### 123Charts

Role:

- frontend;
- admin review;
- manual publish gate;
- `published_projection`;
- SEO / sitemap;
- finite collections;
- deploy gate;
- no-leak checks.

Forbidden in the public frontend:

- raw seed;
- raw source evidence;
- raw audit payload;
- review notes;
- canonical ambiguity details;
- quarantine details;
- rejected details;
- private hashes;
- worker job payload;
- internal confidence.

### 88cn-scout-worker

Role:

- discovery;
- official source resolution;
- canonical resolution;
- HTTP-first audit;
- quarantine classification;
- review queue packaging;
- publish recommendation;
- report draft generation.

Forbidden by default:

- auto publish;
- production write;
- sitemap mutation;
- frontend mutation;
- external outreach;
- WAF bypass;
- login / cookie / session scraping.

### 88cn-index-data

Role:

- reviewed public-safe snapshot only;
- versioned exports after publication.

Forbidden:

- raw seed;
- raw evidence;
- raw audit;
- review notes;
- private hashes;
- quarantine / rejected details;
- worker payloads.

## Data State Machine

```text
seed_hint
identity_candidate
source_verified
canonical_candidate
canonical_review_needed
audit_pending
audit_observed
quarantined
review_ready
publish_recommended
published
stale
archived
rejected
```

Rules:

- Only `published` can enter `published_projection`.
- Only `published_projection` can enter frontend/search/sitemap.
- `publish_recommended` is not published.
- `review_ready` is not published.
- `quarantined` and `rejected` never enter the frontend.

## Runtime Phases

### Phase 1: Local Batch / Manual Trigger

- CLI only.
- Fixture/local dry-run.
- No runtime daemon.
- No DB write.
- No queue.

### Phase 2: Scheduled Dry-Run

- Scheduled local/server dry-run.
- Artifact output.
- Still no auto-publish.

### Phase 3: Staging Queue

- Review-ready payload to 123Charts admin.
- Dead-letter/quarantine policy.
- Manual review gate.

### Phase 4: Production Worker

- Requires explicit server/runtime approval.
- Requires rollback.
- Requires monitoring.
- Requires Redis/queue or equivalent.
- Still no auto-publish.

## Scale Roadmap

| Scale | Batch Size | Review Load | Audit Concurrency | Quarantine Policy | Sitemap Impact | Frontend Impact | Human Review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 27 | existing published projection | already reviewed | none in AGENT0R | existing rejected/quarantine states only | current published URLs only | current MVP | required |
| 50 | small controlled batch | manual review per project | fixture/local only until later approval | quarantine ambiguous canonical/source cases | publish only reviewed additions | finite list/detail growth | required |
| 200 | split batches | queue review by category/source confidence | bounded dry-run before runtime | quarantine by failure taxonomy and duplicate risk | segmented sitemap after publish | published-only browsing/search | required |
| 1000 | staged batches | reviewer queue and sampling metrics | low-concurrency approved audit only | dead-letter and stale handling required | sitemap segments required | pagination/search pressure review | required |
| 5000 | multi-wave batches | operational review capacity required | production worker only after Phase 4 gate | quarantine dashboards and retry budgets required | sitemap partition strategy required | frontend performance and no-leak QA required | required |

Default approach:

- Do not import 5000 and publish all at once.
- Import in batches.
- Review in batches.
- Publish in batches.
- Sitemap in segments.

## Reference Projects

- LangGraph: state graph and human-in-loop pattern.
- CrewAI / AG2: multi-agent role pattern.
- Crawl4AI / Firecrawl: clean web extraction pattern.
- Crawlee: request lifecycle, retry, and crawler lifecycle pattern.
- Prefect / Dagster / Temporal: future workflow orchestration candidates, not current dependencies.

Important conclusion:

Do not introduce a heavy agent framework now. Start with deterministic TypeScript CLI contracts inside `88cn-scout-worker`. Reference these projects conceptually, but do not add them as dependencies in AGENT0R.

