# 123Charts Agent Architecture Map

## System Map

```text
Discovery Sources
  |
  v
88cn-scout-worker                         [worker-only boundary]
  |- Discovery Hint Agent
  |- Official Source Resolver Agent
  |- Canonical Entity Agent
  |- HTTP Audit Agent
  |- Quarantine Classifier Agent
  |- Review Queue Packager Agent
  |- Publish Recommendation Agent
  `- Report Draft Agent
  |
  v
review-ready payload                      [no-auto-publish gate]
  |
  v
123Charts Admin Review Queue                   [admin-only boundary]
  |
  v
manual review gate                        [manual publish gate]
  |
  v
published_projection                      [public boundary starts here]
  |
  v
Frontend / Search / Sitemap
  |
  v
88cn-index-data public-safe snapshot
```

## Boundary Labels

| Boundary | Owner | Public eligibility |
| --- | --- | --- |
| worker-only boundary | `88cn-scout-worker` | never public |
| no-auto-publish gate | worker/admin handoff | not public |
| admin-only boundary | `123Charts` admin | not public by itself |
| manual publish gate | human reviewer | required before public |
| public boundary | `published_projection` | public-safe reviewed records only |

## Repository Responsibilities

| Repo | Responsibilities | Must not do |
| --- | --- | --- |
| `88cn-scout-worker` | discovery, source resolution, canonical candidates, audit observations, quarantine, review package, publish recommendation, report draft | publish, mutate sitemap, mutate frontend, write production by default |
| `123Charts` | admin review, manual publish, projection, public frontend, search, sitemap, collections, deploy gate | expose raw worker evidence or bypass admin review |
| `88cn-index-data` | reviewed public-safe snapshot after publication | store raw seed/evidence/audit/review payloads |

## Public Data Rule

Only `published_projection` feeds public frontend, search, sitemap, and public-safe snapshots.

