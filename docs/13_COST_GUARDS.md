# 13 Cost Guards

123Charts must be able to reduce spend and write volume before a cost spike becomes an outage.

## Cost Kill Switches

The system should support these switches before external refresh or AI jobs ship:

- `disable_external_refresh`
- `disable_editorial_generation`
- `disable_score_recalculation`
- `disable_new_submissions`
- `disable_watchlist_writes`
- `read_only_mode`

## Daily Budgets

Set explicit daily budgets for:

- job count
- external API requests
- editorial generation
- outbound HTTP failures
- Supabase writes

Budget exhaustion must degrade to stale snapshots or read-only behavior, not public page failure.

## Abuse And Access Controls

- Anti-spam on submit form.
- Protected admin paths.
- Cron endpoints require secret.
- Future queue callbacks verify signatures.

## Storage Boundaries

- No unbounded JSONB growth.
- Normalized snapshot long-term.
- Raw payload short-term.
- Raw payload retention must be bounded by time, size, or both.
