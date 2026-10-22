# Day 0 Audit

This audit checks whether the Day 0 repository wall covers the minimum governance requirements for 123Charts before app work begins.

| Requirement | Covered | Evidence | Notes |
| --- | --- | --- | --- |
| Agent role separation | Yes | `AGENTS.md`, `docs/01_AGENT_OPERATING_MODEL.md` | Codex Computer Use, implementation agents, and the human team have separate authority boundaries. |
| Forbidden language wall | Yes | `AGENTS.md`, `docs/06_FORBIDDEN_PATTERNS.md`, `scripts/scan-forbidden-patterns.mjs` | Public wording scans are local and allowlist policy documents that must quote banned terms. |
| noindex rules | Yes | `AGENTS.md`, `docs/07_RUNTIME_GUARDS.md` | Lifecycle state controls index and sitemap eligibility. |
| fake data prohibition | Yes | `AGENTS.md`, `docs/06_FORBIDDEN_PATTERNS.md`, `docs/10_DATA_CONTRACT.md` | Unknown data must remain visibly unknown. |
| batch queue principle | Yes | `AGENTS.md`, `docs/08_BATCH_PIPELINE.md` | External scans must be queued, sharded, bounded, and retry-safe. |
| editorial draft rule | Yes | `AGENTS.md`, `docs/09_EDITORIAL_PIPELINE.md` | AI creates drafts only; public notes require human review. |
| data contract staging rule | Yes | `AGENTS.md`, `docs/10_DATA_CONTRACT.md` | External JSON enters staging before Admin review. |
| Codex Computer Use read-only QA rule | Yes | `AGENTS.md`, `docs/01_AGENT_OPERATING_MODEL.md`, `docs/07_RUNTIME_GUARDS.md` | Browser QA must pass preflight and write only QA artifacts. |

## Gaps Closed By Day 0.5 And Day 0.6

- Add scalability guards before any project count growth.
- Add cache and sitemap rules before public routing work.
- Add cost kill switches before any external refresh or AI drafting jobs.
- Add open source reuse rules before copying or adapting third-party code.
- Add third-party notice checks before upstream reuse begins.
