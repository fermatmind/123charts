> Historical delivery record. Active product requirements are superseded by [DISCOVERY_MVP.md](DISCOVERY_MVP.md). Do not reinstate ten-peer/screenshot or traffic-first onboarding.

# Category traffic charts — local acceptance, 2026-10-21

The current specification is `CATEGORY_TRAFFIC_CHARTS.md`. This delivery builds on local commit `f4f2222`; it does not push or deploy anything.

## Required acceptance outcomes

1. **Independent category addresses:** browser verification covers `/zh/charts`, category search, `/charts/ai-coding`, preserved language/query/month/source context, pagination, pinned versions and rejected nonexistent versions. The share card retains its selected snapshot.
2. **Explicit coverage:** the real September Semrush snapshot initially contains one comparable website among eleven collected AI-coding relationships. Missing sites remain outside the rank; broad platforms are shown separately. The page states that this is current library coverage rather than the whole industry.
3. **Correct measurement object:** the AWS whole-website profile is excluded from the specialist main chart. Classification state and placement are independently reviewed; publishing a previously pending profile does not silently confirm its classification. Multi-category relationships reuse the same measured observation.
4. **Actual source path:** a private, readable original Cursor screenshot was processed by local OCR and matched to an actual HTTPS query of the public Semrush overview page. Domain `cursor.com`, September 2026, Monthly Visits, worldwide/all-device/domain scope and displayed `35.49M` agreed. Receipt `62dc4f77-2bc6-4dc3-8c9c-b74a08710d85` links to traffic version `44fcffed-766d-41fd-b5d3-9d7d874b8cac` and snapshot `91f533d5-e6a8-4cb0-8caf-d3cf4bc7ce51`. The displayed precision, source URL, original response hash and timestamps are retained.
5. **No false updates:** earlier failed attempts have no successful verification time or numeric observation. Tests cover deferred budgets, wrong-month responses, unchanged cached rechecks, no invented values authorized by another receipt, and no duplicate chart publication. A full stop/setup/start recovered an expired source-task lock, retained its private original, retained the successful source-read time and reused the original snapshot.
6. **Periods do not mix:** source calendar months come from actual source output; the latest three confirmed released months are accepted. A requested `2000-01` record could not consume the actual September response. GSC, GA4, AITDK and Semrush are not combined into one visits chart.
7. **Traceable ordering:** the table, JSON-LD, saved JSON endpoint and PNG cards cite the saved category/source/month/scope/data version/snapshot version. SQL tests in a disposable database exercise source conflicts, explicit source revisions, preserved history, repeat-click idempotency, immutable values and public-view privileges. Rounded display intervals do not create precise artificial rank gaps.
8. **Demo isolation:** demo and real data remain separated in bootstrap, snapshots, source tasks and sharing. Browser flows verify the demo labels and the separate actual Semrush case. No synthetic screenshot was used to establish the real source sample.

## Commands and evidence

- `npm run test:charts`: 14 business/API/domain tests passed.
- `npm run test:browser`: 4 browser flows passed. The category flow was rerun after its final URL/pagination/card-context refinements.
- `npm run test:db:charts`: all migrations applied to an empty business schema with local Supabase Auth/Storage base schemas, followed by isolated synthetic SQL correction/permission tests. The normal application database was not reset.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, `git diff --check` passed.
- Anonymous bootstrap omits reviewer identities and private receipts. Original screenshots require authenticated administrator/owner access as appropriate. The public classification view is read-only and does not expose reviewer IDs.

Ignored local evidence includes `.local/real-verification-acceptance.json`, `.local/category-restart-result.json`, raw source captures and `output/playwright/category-real-{desktop,mobile,card}.png`.

## Runtime and remaining limits

Preview: `http://127.0.0.1:3100/zh/charts`. The actual source sample uses `dataset=real&month=2026-09&source=Semrush%20public` on the AI-coding category. Local test accounts remain in `.local/accounts.json`.

One durable worker processes due source tasks, OCR, metadata and notifications. The workbench supports selected-domain or published-library rounds; default limits are five source request attempts per UTC day, 25 seconds per verification pass, three error retries, a spending bound, daily incremental processing and seven-day successful rechecks. Low coverage and pending tasks are displayed explicitly.

Semrush public is an independent, currently accessible validation channel; it is not evidence of equivalence to AITDK or TabAPI. Public pages can change or stop being accessible. Broad data coverage, future commercial redistribution rights, sustained operational costs and customer acquisition remain outside this local acceptance. All local pages stay noindex; GitHub, staging, production, DNS and servers were not operated.
