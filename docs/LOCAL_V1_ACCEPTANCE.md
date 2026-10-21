# Local V1 acceptance — 2026-10-21

Scope: the user-approved 123Charts local V1, in the existing 88CN checkout. No GitHub write, push, DNS change, server deployment or production database operation was performed.

## Verified

- Next.js 16.4.2 / React 19 production build, TypeScript, ESLint, formatting and `git diff --check` passed.
- `npm run test:charts`: 8 passing tests, including the actual local Auth/database/Storage/API/OCR workflow, authorization, read-only public views, versioning, snapshot immutability, evidence reuse, corrections and incremental updates.
- `npm run test:browser`: 3 passing desktop/mobile workflows, including keyboard search, bilingual state, private/revocable reports, PNG cards, subscriptions, saved draft recovery, ten peers, five uploaded images, OCR, staff review and delivered report.
- A complete stop/setup/start preserved 37 profiles, 2 applications, 5 original evidence records, 1 report and 99 synthetic traffic records. A previously running job recovered and finished after restart; its stored image remained readable to its authorized owner.
- Anonymous/authenticated public projection views reject database mutations; private screenshots and review references are excluded from anonymous projections.
- Browser static bundles contain no local service-role key. Runtime dependency audit reported zero known advisories. Some development-tool dependency advisories remain; no forced major dependency replacement was applied.
- The preview returns HTTP 200 with the selected server-rendered document language and `noindex`. Published local Docker ports bind to `127.0.0.1`.

Ignored local evidence: `output/playwright/`, `.local/restart-result.json` and local source-retrieval results. Tests clean up their temporary accounts/applications. A synthetic August chart snapshot is retained to exercise historical comparison.

## Data and limits

The seed contains 33 official-site research profiles and 4 fictional demonstration projects. Official-site retrieval succeeded for 31 of 33 profiles during preparation; the remaining retrieval failures are not treated as proof of invalid websites. Price facts await explicit review. All seed visits, ranks, participation and approval examples are labeled demonstrations, isolated from real traffic.

Real AITDK screenshot provenance, external data rights, acquisition cost, review cost and actual audience growth remain unverified. TabAPI, GSC/GA4 and paid model integrations are deferred. Local OCR extracts candidates; staff review is still required. This acceptance establishes local functionality, not production readiness or business results.

## Handoff

- Preview: `http://127.0.0.1:3100/en` or `/zh`.
- Founder: `/en/dashboard`; administrator: `/en/admin`.
- Generated private local test accounts: `.local/accounts.json`.
- Captured local mail: `http://127.0.0.1:54324`.
- Restart: `npm run local:setup`, then `npm run dev:local`.
- Stop while preserving data: `npm run local:stop`.

See the root README for prerequisites, complete workflow and verification commands.
