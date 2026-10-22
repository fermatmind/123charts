# 11 Scalability Guards

123Charts must scale by staying static on the public path and asynchronous on the data path.

## Core Shape

- Frontend extremely static.
- Backend extremely asynchronous.
- No request-path crawling.
- No full-table score recalculation.
- Per-project score recalculation only.
- Public pages must render from local snapshots.
- External data pulls must be queued, chunked, rate-limited, and retry-safe.

## Scale Tiers

| Tier | Project Count | Operating Mode |
| --- | ---: | --- |
| Tier 1 | 0-300 projects | Manual review, simple queues, mostly static pages. |
| Tier 2 | 300-3,000 projects | Scheduled queue batches, snapshot rendering, bounded refresh windows. |
| Tier 3 | 3,000-10,000 projects | Priority refresh tiers, sitemap sharding, stricter stale-source handling. |
| Tier 4 | 10,000-50,000 projects | Dedicated workers, queue provider abstraction, cold storage for old payloads. |

## Refresh Tiers

| Tier | Meaning | Refresh Policy |
| --- | --- | --- |
| hot | Active or recently claimed projects | Frequent queued refresh within daily budgets. |
| warm | Published projects with stable signals | Periodic refresh with lower priority. |
| cold | Low-change projects | Infrequent refresh and snapshot-first rendering. |
| dead | Archived or unreachable projects | No routine external refresh unless manually reactivated. |

## Source And Payload Boundaries

- Social source optional and disabled by default.
- Raw payload retention bounded.
- Normalized snapshots are the long-term source for public rendering.
- Failed fetch does not zero out score.
- Keep the last successful snapshot and mark the source stale.

## Queue Provider Abstraction

- Stage 1: Supabase job table.
- Later: QStash / Cloudflare Queue / custom worker.

The product code should depend on a small queue interface, not provider-specific logic in public routes.
