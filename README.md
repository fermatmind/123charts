# 123Charts

Free project discovery, source-aware website charts, peer contributions and founder workspaces. This checkout is the **local V1**, built on the historical 88CN repository. Historical 88CN documents describe earlier work; current product authority is [123CHARTS_V1.md](docs/123CHARTS_V1.md).

## Start locally

```bash
npm install
npm run local:setup
npm run dev:local
```

- English: http://127.0.0.1:3100/en
- 中文：http://127.0.0.1:3100/zh
- Founder workspace: `/en/dashboard`
- Review console: `/en/admin`
- Local mail inbox: http://127.0.0.1:54324
- Local database studio: http://127.0.0.1:54323

Local founder/admin test credentials are generated in `.local/accounts.json` with private file permissions. They are not production credentials. Normal users may also register through the app. Supabase Auth, database, Storage and mail capture run locally; no external SMTP or cloud account is used.

Setup is idempotent: it preserves users, drafts, uploads and reviewed data. `npm run local:stop` stops the app, worker and local Supabase while retaining volumes. Normal setup/start never resets the database. Initial setup downloads containers and English/Chinese OCR resources; subsequent core demo use works offline. Metadata extraction from a new public website naturally requires connectivity.

Docker Desktop must run. Local services bind explicitly to `127.0.0.1`. The startup helper preserves the CLI-created container configuration, Kong runtime files and volume mounts when correcting Docker Desktop port bindings. It only touches containers named for `123charts-local`.

## Explore the complete workflow

1. Browse projects, categories and published chart snapshots. `Cmd/Ctrl + K` opens search.
2. Sign in as the local founder, create/save a draft, select ten relevant peers and upload PNG/JPG/WebP evidence for five to ten distinct peers.
3. The worker performs real local OCR. Extraction stops at **awaiting review**, never automatic verification.
4. Sign in as the local administrator. Review relationships, inspect private originals, confirm numeric fields and record a review channel/reference. Approve the complete application.
5. The applicant receives a profile, a private ten-peer report and free recommendation eligibility. Enable/revoke report sharing and preview/download a PNG card.
6. Claim management identity separately to submit later information updates. Updates keep the observation group and do not repeat initial admission requirements.
7. Save/follow projects or categories; opt into local email summaries. View recorded impressions, project views and outbound clicks in the founder workspace.

Unknown peers adopted during review enter the **unpublished research queue**. An administrator completes factual bilingual descriptions and a source reference before publishing them. Nomination does not publish a page or create an automatic placement on a peer's page.

## Data integrity

The default `dataset=demo` includes 33 independently written official-site research profiles and four fictional projects. **Every traffic value, ranking, enrollment/claim example and sample approval in this dataset is synthetic.** Demo and real traffic/versions/snapshots are isolated. `dataset=real` keeps real research profiles while showing missing traffic honestly.

Official source retrieval is recorded independently of verification. A failed retrieval is not proof that a website is invalid. Seed prices are not shown as verified unless actually reviewed. The local seed never overwrites existing profiles or user work on subsequent setup runs.

The three starting categories are AI coding, workflow automation, and knowledge search/RAG. Charts use AITDK visits, a single released month and worldwide/all-device/domain scope. The source calendar explicitly records accepted months. GSC clicks and GA4 sessions are not mixed with visits. No GSC/GA4 or TabAPI connection is claimed.

Published snapshots and traffic values cannot be overwritten. Source corrections create versions; unresolved conflicts suspend usage. Contribution adoption deduplicates information and applies per-project/per-controller caps independently of traffic ranking. A fictional demo outbound destination records an attempt and explains why no actual website exists.

All local HTML is `noindex`; robots permits reading that instruction, and the local sitemap is empty. Private reports, screenshots, drafts, review references and internal control identities do not enter anonymous projections. Ordinary publication eligibility, canonical/hreflang metadata and consistent JSON-LD are implemented separately from local indexing.

## Development and verification

```bash
npm run typecheck
npm run lint
npm run test:charts       # domain rules + actual database/Auth/Storage/API/OCR workflow; local app required
npm run test:browser      # Chrome UI flows, desktop/mobile, sharing, PNG and reviewer delivery
npm run format:check
npm run build
npm run db:types          # generate local Supabase database types
```

Browser evidence is saved under `output/playwright/`; credentials, raw seed screenshots and source retrieval results stay under ignored `.local/`. `.env.local` is generated locally and never committed.

Architecture: Next.js 16 / React 19 / TypeScript; Tailwind; Radix dialog primitives; Recharts; Supabase SDK with SQL migrations; Tesseract.js OCR; one durable database-backed worker. There is no additional ORM, payment path, remote LLM or external data API dependency.

PNG rendering uses the Mac's installed Unicode font copied into ignored `.local/fonts/` during setup. That system font is not redistributed. A later server deployment must install a suitably licensed CJK font rather than copying the Mac font.

GitHub configuration, DNS, hosting and production deployment are outside this local delivery. A later real-data pilot must validate actual screenshot sources, data acquisition/review cost and external source usage rights; local synthetic samples do not establish those results.
