# TRAFFIC0R Competitor Page Pattern + China/Global SEO Deep Scan v0

Result: GO_TRAFFIC1_WITH_FINDINGS

Date: 2026-06-20

Role: codex-research / codex-build

## Scope

TRAFFIC0R performs deeper public-page observation after TRAFFIC0. It focuses on page patterns, SEO/UX/CTA structure, public monetization signals, China/global SEO gaps, and the inputs TRAFFIC1 should use for demand-side taxonomy.

This is research, roadmap, and strategy work only. It does not implement `/landscape`, `/tasks`, `/zh-CN` routes, SEO pages, growth agents, outreach scripts, crawler scripts, app/runtime code, Supabase changes, deploy changes, external writes, form submissions, account creation, login, PII collection, or data repo mutation.

## Method

Chrome was used for bounded public-page observation. The scan sampled homepages and representative public pages such as category, ranking, latest, tool-detail, submit, advertise/business, editorial guideline, and education/resource pages.

Observation remained read-only:

- no login
- no account creation
- no form submission
- no paywall bypass
- no high-volume crawl
- no competitor database export
- no copied competitor descriptions
- no external site mutation
- no contact or outreach

Public-page data captured for each sample:

- URL and page type
- title and H1 pattern
- visible CTA pattern
- internal linking pattern
- JSON-LD presence where easy to inspect
- sponsored/featured/advertise/submit signals where public
- form/input presence as a public-page signal only
- 123Charts route and policy lesson

Detailed matrices are split into:

- [COMPETITOR_PAGE_PATTERN_MATRIX.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/COMPETITOR_PAGE_PATTERN_MATRIX.md)
- [CHINA_GLOBAL_SEO_GAP_MAP.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/CHINA_GLOBAL_SEO_GAP_MAP.md)
- [PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md](/Users/rainie/Desktop/123charts.com/123charts/docs/traffic/PUBLIC_MONETIZATION_BOUNDARY_AUDIT.md)

## Public Observation Limits

Some sites were partially unavailable in Chrome:

- `theresanaiforthat.com`: Chrome browser automation was blocked by local browser-use security policy. It is recorded as unavailable for this TRAFFIC0R scan and was not bypassed.
- `saashub.com`: sampled pages returned a waiting/minimal-render page in Chrome. No bypass was attempted.
- `alternativeto.net`: sampled category page returned minimal content in Chrome. No bypass was attempted.
- `aitoolsdirectory.com`: homepage and some pages returned partial/minimal text in Chrome, but advertise/blog signals were visible.

These limits do not invalidate the broader conclusion from accessible competitors: generic AI tool directories and category/ranking surfaces are common; the 123Charts gap remains a reviewed bilingual AI project landscape with source-linked public signals.

## Competitor List

International:

- `https://theresanaiforthat.com`
- `https://www.toolify.ai`
- `https://www.futurepedia.io`
- `https://futuretools.io`
- `https://www.aixploria.com/en`
- `https://www.saashub.com`
- `https://alternativeto.net`
- `https://aitoolsdirectory.com`

Chinese / China-facing:

- `https://ai-bot.cn`
- `https://top.aibase.com`
- `https://aibase.com`
- `https://www.ainav.cn`
- `https://www.aigc.cn`
- `https://www.faxianai.com`
- `https://toolifyai.cn`
- `https://ai.hao.360.com`
- `https://ai.codefather.cn`

## International Competitor Matrix

| Site | Sampled page types | Primary intent | Page pattern | CTA / monetization signal | 123Charts lesson |
| --- | --- | --- | --- | --- | --- |
| There Is An AI For That | Unavailable in Chrome for TRAFFIC0R | task_intent | Not re-observed due browser policy block | Not observed in this run | Treat TAAFT-like task pages as a pattern to map, but do not rely on this run for page-level evidence. |
| Toolify | homepage, ranking/category, submit, revenue ranking, advertise minimal-render | category_intent, ranking_intent, submission_intent, sponsored_placement_intent | Large directory with top/monthly/category/source/revenue rankings, latest tools, category links, submit and advertise links | Sponsored labels and featured sections visible; submit page has form fields; revenue/ranking pages expose high-risk count/traffic framing | 123Charts can learn route structure but should avoid unverified ranking/revenue/traffic framing. Keep public signals reviewed and paid UI separated from organic ordering. |
| Futurepedia | homepage, all categories, AI agents category, tool detail, submit, editorial guidelines | category_intent, education_intent, founder_research_intent | Business-oriented category hierarchy plus tool detail pages with pricing/reviews/alternatives and editorial process page | Submit page frames paid reach; editorial guidelines provide trust surface; forms visible but not submitted | 123Charts should borrow explicit editorial/review process clarity while avoiding paid reach as a core founder promise. |
| FutureTools | homepage, newly added, tool detail, submit | category_intent, education_intent, submission_intent | Curated database with categories, newest ordering, creator/newsletter distribution, simple tool detail pages | Submit page form visible; less obvious sponsored separation in sampled pages | 123Charts can use curation tone and newsletter/report packaging, but must add lifecycle, source links, and machine-readable signals. |
| AIxploria | homepage, categories, latest, submit/featured, verified tools | category_intent, ranking_intent, education_intent, sponsored_placement_intent | Broad multilingual directory with categories, top/list/latest pages, verified category, and featured submit positioning | Submit page title frames "featured" and audience reach; no rel=sponsored found in sampled visible links | 123Charts should not copy broad "best/top" directory language; use finite reviewed route families and label sample counts. |
| SaaSHub | category and alternatives sampled but minimal-render in Chrome | alternative_intent, buyer_research_intent | Page pattern not visible in this run | Not observed from rendered page | Keep canonical alternatives discipline, but do not derive page details from blocked/minimal render. |
| AlternativeTo | AI tools category sampled but minimal-render in Chrome | alternative_intent, category_intent | Page pattern not visible in this run | Not observed from rendered page | Alternatives remain valuable, but TRAFFIC1 should require canonical allowlists and public-signal comparison fields. |
| AIToolsDirectory | homepage partial, submit partial, ads, blog | category_intent, submission_intent, sponsored_placement_intent | Lightweight directory/blog/advertise surfaces; advertise page visible | Advertise and premium placement links visible; submit page minimal in Chrome | 123Charts should avoid mixing a paid placement product with organic discovery, sitemap, API, MCP, Signal Score, or Source Confidence. |

## Chinese Competitor Matrix

| Site | Sampled page types | Primary intent | Page pattern | CTA / monetization signal | 123Charts lesson |
| --- | --- | --- | --- | --- | --- |
| AI工具集 / ai-bot.cn | homepage, category, about/monetization | zh_cn_tool_discovery_intent, category_intent, submission_intent | Dense category navigation, latest/hot/update framing, AI writing/category pages, about page | About page exposes advertising/cooperation and inclusion/update language | China directory intent is active and mature; 123Charts should not compete as a generic navigation site. |
| AIBase / top.aibase.com | homepage, discover, ranking, tool detail, submit | zh_cn_tool_discovery_intent, ranking_intent, founder_research_intent, submission_intent | Product library with discovery, ranking, tool pages, submission page, topic/category links | Submit page invites product display; ranking pages visible; AIBase ecosystem includes business/partnership pages | Strong signal that Chinese demand includes product database, rankings, submission, and GEO checking. 123Charts should use public-signal provenance rather than ranking claims. |
| aibase.com | homepage, partnership, GEO checker | zh_cn_outbound_founder_intent, machine_readability_intent, sponsored_placement_intent | News/product/ecosystem plus GEO promotion-effect checker and business cooperation | Partnership page visible; GEO checker uses promotion-effect framing | 123Charts's geo-checker should stay framed around machine readability and public readiness, not promotional outcome measurement. |
| AI导航网 / ainav.cn | homepage, submit, business, tool detail | zh_cn_tool_discovery_intent, submission_intent, sponsored_placement_intent | WordPress-like navigation with submit/business pages, tool detail pages, many category anchors | Submit/business forms visible; one sampled detail page had rel=sponsored links | 123Charts should preserve a stricter separation: Featured Signals can be visible UI only, not organic order, sitemap, API, MCP, scores, or source confidence. |
| AIGC导航 / aigc.cn | homepage, submit, news, category | zh_cn_tool_discovery_intent, submission_intent, education_intent | Dense AI tool category navigation, submit instructions, news/category pages | Submit instructions public; contact links visible; no form submission performed | Good evidence for Chinese category demand; weak evidence for source-linked public-signal landscape. |
| 发现AI / faxianai.com | homepage, tools, ranking, hotnews | zh_cn_tool_discovery_intent, ranking_intent, education_intent | Tools pages, ranking pages, hot news aggregation, product cards | Ranking/hotnews pages visible; external links often nofollow on hotnews | Generic ranking/news surfaces are easy to produce but risky for 123Charts unless source and counts are reviewed. |
| ToolifyAi Chinese / toolifyai.cn | homepage, submit, news | zh_cn_tool_discovery_intent, submission_intent, education_intent | Chinese AI tool navigation, news/articles, submit link, external outbound redirect pattern | Submit inputs visible; news/ad language visible | 123Charts should prioritize more differentiated Chinese terms such as AI project map, project official-site check, and machine-readable public signals. |
| 360AI导航 / ai.hao.360.com | homepage, tool detail pages | zh_cn_tool_discovery_intent, education_intent | Mainstream portal combining AI tools, news, curated details, category tabs | Login/feedback/collection links visible; detail pages include ad signal | Strong mainstream navigation surface, but portal breadth is not 123Charts's path. 123Charts should target founder/builder/researcher specificity. |
| 鱼皮AI导航 / ai.codefather.cn | homepage, tools, MCP, education | zh_cn_tool_discovery_intent, education_intent, machine_readability_intent | AI tools, knowledge base, MCP/Skills, learning resources, news, community | Business cooperation link visible; JSON-LD WebSite/Organization visible on homepage | Strong builder/community education pattern. 123Charts should serve builders with project landscape and public-signal evidence rather than generic tool teaching alone. |

## Page-Pattern Observations

Recurring global patterns:

- Category pages are the dominant directory acquisition pattern.
- Ranking pages often use top/latest/most-used/monthly/traffic/revenue labels.
- Submit pages commonly exist and often contain forms, paid reach, review, update, or inclusion language.
- Tool detail pages often include category tags, pricing, reviews, alternatives, and outbound links.
- Editorial/trust pages are less common but useful when present, especially Futurepedia's public editorial guidelines.
- Structured data appears unevenly. Futurepedia exposed Organization JSON-LD; AIxploria exposed graph JSON-LD; 鱼皮AI导航 exposed WebSite/Organization JSON-LD.
- Public `rel=sponsored` was uncommon in sampled pages; `rel=nofollow` appeared more often on outbound or hotnews-style links.

Recurring Chinese patterns:

- `AI工具导航`, `AI工具大全`, and `AI工具集合` are crowded and generic.
- Submit/收录 and business/cooperation links are common.
- Rankings and hot lists are common, but public provenance for ranking formulas is often unclear from the visible page.
- GEO / AI search visibility language is now present in the Chinese market through AIBase-like surfaces.
- Builder/community education is present through 鱼皮AI导航, including MCP/Skills and coding education surfaces.

## Intent Taxonomy Observations

| Intent | User job | Competitor pattern | 123Charts differentiation | Safe for 123Charts | Wave |
| --- | --- | --- | --- | --- | --- |
| task_intent | Find an AI project/tool for a concrete job | TAAFT-like task pages; category sites also expose task filters | Finite task pages mapped to reviewed projects and public signals | Yes, if allowlisted | First wave after taxonomy |
| category_intent | Browse tools by domain | Toolify, Futurepedia, AIxploria, AI工具集, AIGC导航, 360AI导航 | Use category as navigation into reviewed project landscape, not generic directory | Yes, with reviewed sample counts | First wave |
| alternative_intent | Compare known project/tool to options | SaaSHub/AlternativeTo style; Futurepedia detail pages include alternatives | Canonical public-signal comparisons only | Yes, if canonical | First/second wave |
| landscape_intent | Understand sector/stack/project map | Weakly served by directories | 123Charts primary positioning: project landscape and sector density | Yes | First wave |
| founder_research_intent | Check how a project appears publicly | Submit/update pages; GEO tools in China | Founder education plus machine-readability evidence | Yes | First wave |
| buyer_research_intent | Evaluate public data fields and source trust | Weak in generic directories | Public-signal snapshots and Alpha Feed evidence later | Yes, docs/report first | Second wave |
| machine_readability_intent | Check whether project profile is machine-readable | AIBase GEO checker and 123Charts geo-checker adjacency | Public readiness and structured-data checks without outcome promises | Yes | First wave |
| zh_cn_tool_discovery_intent | Find AI tools in Chinese | Many crowded directories | Avoid generic `AI工具导航` head-on; use project landscape differentiation | Yes, but not generic | Later/limited first wave |
| zh_cn_outbound_founder_intent | Help Chinese founders prepare global project pages | Under-served in sampled pages | Strong 123Charts opportunity | Yes | First wave after taxonomy |
| submission_intent | Submit/update/list a tool | Common across directories | Human-reviewed submit/claim/correction with lifecycle states | Yes, but no promises | First wave |
| sponsored_placement_intent | Buy visible placement or exposure | Visible on many competitor surfaces | 123Charts must isolate Featured Signals from organic systems | Only as separate boundary | Avoid in TRAFFIC1 |

## China Gap Analysis

1. Is the Chinese AI tool directory market empty?
   No. It has mature navigation, ranking, product library, news, tutorial, and community surfaces.

2. What do Chinese AI tool sites already do well?
   They do broad category coverage, frequent updates, submit/收录 flows, hot/ranking surfaces, practical Chinese copy, AI news aggregation, and beginner-friendly navigation.

3. What do they not do well?
   They rarely present a reviewed bilingual AI project landscape with source-linked public signals, lifecycle status, open-source/commercial split, machine-readability evidence, and researcher-ready public-signal fields.

4. What does AIBase / AI工具集 / AIGC导航 / 发现AI suggest about Chinese demand?
   Demand exists for tool discovery, submission, ranking, GEO/checking, business cooperation, and education. The broadest directory terms are crowded; differentiated project intelligence terms are more suitable for 123Charts.

5. Is 123Charts's opportunity "AI tools directory" or "AI project landscape"?
   AI project landscape.

6. Should 123Charts compete for `AI工具导航` directly?
   Not as the first move. It is crowded and generic. 123Charts should target `AI项目图谱`, `AI项目官网检测`, `AI项目机器可读性`, `AI工具出海`, open-source AI agent project, RAG project, and alternatives-style clusters.

7. Which Chinese intent clusters should 123Charts prioritize?
   Outbound-founder readiness, project landscape, official-site machine-readability check, open-source/commercial split, AI agent/coding/RAG project maps, and limited alternatives.

8. Which Chinese intent clusters should 123Charts avoid?
   Generic `AI工具`, `AI工具导航`, `AI工具大全`, `AI工具集合`, unreviewed rankings, broad best/top claims, auto-translated tool pages, and paid placement blended into organic discovery.

9. Should Chinese pages come before or after English landscape taxonomy?
   After or alongside a stable English landscape taxonomy. Chinese routes should translate stable strategy, not multiply ambiguity.

10. What should the first zh-CN routes be?
    `/zh-CN/landscape`, `/zh-CN/geo-checker`, `/zh-CN/founders`, `/zh-CN/submit`, and later finite `/zh-CN/tasks/[slug]` after TRAFFIC1 defines the taxonomy.

## Route Opportunity Map

First-wave candidates:

| Route | Why | Boundary |
| --- | --- | --- |
| `/landscape` | Positioning hub for project landscape; connects sectors, stacks, collections, alternatives, and tasks | Navigation-first; not expected to drive SEO alone; reviewed sample counts only |
| `/landscape/sectors` | Sector density map and market-map entry | No fake global counts; label reviewed sample counts |
| `/tasks/ai-coding-workflows` | High-fit builder demand and existing seed projects | Finite allowlist; at least 3 reviewed/published projects or noindex |
| `/tasks/rag-knowledge-base` | Builder/research demand cluster | Finite allowlist; source-backed project evidence |
| `/tasks/local-llm-deployment` | Strong technical intent | Must avoid generic tool dump; public signals only |
| `/tasks/ai-search-readiness` | Ties to geo-checker/machine-readability positioning | No citation or traffic outcome claims |
| limited `/alternatives/[slug]` | Acquisition-friendly comparison intent | Canonical allowlist; no N-by-N generation |
| `/zh-CN/landscape` | Differentiated Chinese route against crowded directories | Translate stable landscape strategy |
| `/zh-CN/geo-checker` | Strong outbound-founder utility | Public readiness only; no outcome promises |
| `/zh-CN/founders` | Founder education and claim/correction clarity | No visibility or ranking promise |
| `/zh-CN/submit` | Human-reviewed submission education | No paid inclusion or automatic listing promise |

Second-wave candidates:

- `/zh-CN/tasks/[slug]`
- `/zh-CN/landscape/sectors`
- additional limited tasks
- expanded alternatives allowlist
- report distribution pages

Avoid / forbidden route patterns:

- unlimited `/tasks/[anything]`
- unlimited `/ai-for-[anything]`
- unlimited `/best-ai-tools-for-[anything]`
- unreviewed top/best rankings
- N-by-N alternatives generation
- copied competitor descriptions
- fake counts
- fake traffic/ranking/citation claims
- auto-translated tool pages at scale
- paid placement disguised as organic ranking
- submitted/unreviewed pages in sitemap

## Route Priority Model

Scores: 1 low, 5 high. `SEO_risk` is risk, not priority.

| Route type | acquisition_priority | navigation_priority | SEO_risk | data_readiness | engineering_complexity | brand_fit | Recommendation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/landscape` | 3 | 5 | 2 | 4 | 3 | 5 | Build before or alongside first task pages as the hub. |
| `/landscape/sectors` | 3 | 5 | 2 | 3 | 3 | 5 | Build after taxonomy clarifies sector families. |
| `/tasks/[slug]` | 5 | 3 | 4 | 3 | 3 | 4 | High acquisition, but only finite reviewed slugs. |
| `/alternatives/[slug]` | 5 | 3 | 4 | 4 | 2 | 4 | Use canonical allowlist and public-signal comparison only. |
| `/zh-CN/landscape` | 4 | 5 | 3 | 3 | 4 | 5 | Strong differentiation if English taxonomy is stable. |
| `/zh-CN/geo-checker` | 4 | 4 | 3 | 4 | 4 | 5 | Use machine-readability framing, no outcome claims. |
| `/zh-CN/founders` | 3 | 4 | 2 | 4 | 2 | 5 | Good founder education route. |
| `/zh-CN/submit` | 3 | 3 | 3 | 4 | 2 | 4 | Must avoid listing or visibility promises. |
| report distribution pages | 3 | 3 | 3 | 4 | 2 | 4 | Use reviewed reports only; no automated posting. |

Nuanced conclusion:

- `/tasks/[slug]` and `/alternatives/[slug]` have higher acquisition priority.
- `/landscape` has higher navigation and positioning priority.
- `/landscape` should still be built before or alongside first task pages as the hub.
- Chinese routes should translate stable strategy, not multiply ambiguity.

## SEO Safety Rules

Mandatory for future TRAFFIC tasks:

1. Finite allowlist only.
2. Published/reviewed project data only.
3. No fake counts.
4. Label counts as reviewed sample counts.
5. If published reviewed projects under a route are below threshold, route must be `noindex, follow`.
6. Public indexable route threshold: at least 3 reviewed/published projects; otherwise no sitemap entry.
7. No copied tool descriptions.
8. No automated bulk translation pages.
9. No top/best/ranking/superiority claims.
10. No traffic/ranking/AI citation/funding/customer promises.
11. No N-by-N alternatives generation.
12. Sponsored/Featured UI must remain separate from organic/sitemap/API/MCP/score systems.

## Chinese SEO Seed Matrix

| Keyword cluster | Intent | Future route | Page type | Risk | Wave |
| --- | --- | --- | --- | --- | --- |
| AI工具 | generic tool discovery | Avoid direct first-wave route | none | High, crowded | Avoid initially |
| AI工具导航 | generic directory | Avoid direct first-wave route | none | High, crowded | Avoid initially |
| AI工具大全 | generic directory | Avoid direct first-wave route | none | High, crowded | Avoid initially |
| AI工具集合 | generic directory | Avoid direct first-wave route | none | High, crowded | Avoid initially |
| AI项目图谱 | project landscape | `/zh-CN/landscape` | landscape hub | Medium | First wave |
| AI项目导航 | project discovery | `/zh-CN/landscape` | landscape hub | Medium | First wave |
| AI创业赛道 | founder sector research | `/zh-CN/landscape/sectors` | sector map | Medium | Later first wave |
| AI项目竞品 | alternatives/research | limited `/zh-CN/alternatives/[slug]` | comparison | High | Later |
| AI工具出海 | outbound founder readiness | `/zh-CN/founders`, `/zh-CN/geo-checker` | founder education/checker | Medium | First wave |
| AI项目官网检测 | machine readability | `/zh-CN/geo-checker` | checker | Medium | First wave |
| AI项目机器可读性 | machine readability | `/zh-CN/geo-checker` | checker/explainer | Medium | First wave |
| AI项目结构化数据 | structured data readiness | `/zh-CN/geo-checker` | checker/explainer | Medium | First wave |
| AI工具怎么被ChatGPT搜到 | AI search readiness education | `/zh-CN/geo-checker` | explainer/checker | High wording risk | First wave with careful copy |
| AI出海项目官网SEO | outbound SEO readiness | `/zh-CN/founders` | founder guide | Medium | First wave |
| 开源AI Agent项目 | open-source project discovery | `/zh-CN/landscape` or task page | landscape/task | Medium | First wave |
| AI Coding Agent项目 | builder discovery | `/zh-CN/tasks/ai-coding-workflows` later | task page | Medium | Later |
| RAG项目图谱 | builder/research discovery | `/zh-CN/tasks/rag-knowledge-base` later | task page | Medium | Later |
| AI工具平替 | alternative intent | limited alternatives | comparison | High | Later |
| 开源AI工具替代 | open-source alternatives | limited alternatives | comparison | High | Later |

## English SEO Seed Matrix

| Keyword cluster | Intent | Future route | Page type | Risk | Wave |
| --- | --- | --- | --- | --- | --- |
| AI project landscape | landscape_intent | `/landscape` | landscape hub | Low | First wave |
| AI startup landscape | founder_research_intent | `/landscape/sectors` | sector map | Medium | First wave |
| AI project public signals | buyer_research_intent | `/reports` / Alpha evidence docs | report | Low | First wave |
| AI project machine readability | machine_readability_intent | `/geo-checker` / task explainer | checker/explainer | Low | First wave |
| AI search readiness checker | machine_readability_intent | `/geo-checker` | checker | Medium wording risk | First wave |
| open source AI agent projects | category/task intent | `/tasks/ai-coding-workflows` or collection | task/collection | Medium | First wave |
| AI coding agent projects | category/task intent | `/tasks/ai-coding-workflows` | task page | Medium | First wave |
| RAG tools landscape | task/landscape intent | `/tasks/rag-knowledge-base` | task page | Medium | First wave |
| local LLM tools landscape | task/landscape intent | `/tasks/local-llm-deployment` | task page | Medium | Later first wave |
| AI tool alternatives | alternative_intent | `/alternatives/[slug]` | comparison | High | First/second wave |
| open source alternative to [tool] | alternative_intent | canonical alternatives | comparison | High | Later |
| AI project structured data | machine_readability_intent | `/geo-checker` explainer | checker/explainer | Low | First wave |
| AI project JSON-LD checker | machine_readability_intent | `/geo-checker` explainer | checker/explainer | Low | First wave |
| machine-readable AI project profile | buyer/founder research | `/reports` / profile docs | report/profile | Low | First wave |

## 123Charts Positioning Update

Recommended English:

123Charts is a bilingual AI project landscape for reviewed public signals, active source links, and machine-readability evidence.

Simpler C-end English:

Find active AI projects by category, stack, source links, and public readiness signals.

Recommended Chinese:

123Charts 是一个中英双语 AI 项目发现图谱，聚焦已审阅公开信号、活体来源链接和机器可读性证据。

Simpler Chinese:

按赛道、技术栈、开源状态和公开信号发现活跃 AI 项目。

Avoid:

- `verified` unless claim/verification status exists
- visibility promises
- best/top language
- official endorsement language
- capital-product language
- traffic or AI-citation promises

## TRAFFIC1 Input Requirements

TRAFFIC1 should define these taxonomy dimensions:

- `intent_type`
- `audience`
- `route_family`
- `indexability_policy`
- `sitemap_policy`
- `minimum_project_threshold`
- `allowed_copy_patterns`
- `forbidden_copy_patterns`
- `zh_CN_mapping`
- `canonical_policy`
- `data_source_requirement`
- `monetization_boundary`
- `acquisition_priority`
- `navigation_priority`
- `SEO_risk`
- `first_wave_or_later`

TRAFFIC1 should also define route-level launch gates:

- required reviewed project count
- required source-link count
- allowed lifecycle states
- noindex fallback
- sitemap inclusion rule
- canonical ownership
- copy review checklist
- monetization isolation checklist

## Follow-Up Task Recommendations

Confirm existing roadmap sequence:

- TRAFFIC1: Demand-Side Search Intent Taxonomy v0
- TRAFFIC2: AI Project Landscape Landing v0
- TRAFFIC3: Sector Density / Market Map v0
- TRAFFIC4: Task-to-Project Discovery v0
- TRAFFIC5: Alternatives Expansion Boundary v0
- TRAFFIC6: Report Distribution Pack Generator v0
- TRAFFIC7: Demand-Side Traffic QA v0
- GROWTH0: Growth Agent Boundary Scan v0
- GROWTH1: Founder Acquisition Agent v0
- GROWTH2: Report Distribution Agent v0
- GROWTH3: Weekly Growth Review Generator v0

No follow-up task starts inside TRAFFIC0R.

## Exact Next Recommended Task

TRAFFIC1 Demand-Side Search Intent Taxonomy v0.

TRAFFIC1 should convert this scan into a finite taxonomy before any `/landscape`, `/tasks`, `/zh-CN`, alternatives expansion, report distribution, or growth-agent work starts.

## What This Task Does Not Do

- Does not implement `/landscape`.
- Does not implement `/tasks`.
- Does not create Chinese routes.
- Does not generate SEO pages.
- Does not modify app/runtime code.
- Does not modify scripts, Supabase, deploy config, public files, package files, gateway files, secrets, or server config.
- Does not deploy or run live smoke.
- Does not log in to competitor sites.
- Does not create accounts.
- Does not submit forms.
- Does not bypass paywalls.
- Does not scrape at scale.
- Does not copy competitor descriptions.
- Does not contact anyone.
- Does not post externally.
- Does not collect or store PII.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start TRAFFIC1, TRAFFIC2, GROWTH0, BETA1, I18N0, or PR101.

## Source URLs Observed

Observed with Chrome public-page sampling:

- `https://www.toolify.ai/`
- `https://www.toolify.ai/Best-AI-Tools-Category`
- `https://www.toolify.ai/submit`
- `https://www.toolify.ai/advertise`
- `https://www.toolify.ai/Best-AI-Tools-revenue`
- `https://www.futurepedia.io/`
- `https://www.futurepedia.io/ai-tools`
- `https://www.futurepedia.io/ai-tools/ai-agents`
- `https://www.futurepedia.io/tool/chatgpt`
- `https://www.futurepedia.io/submit-tool`
- `https://www.futurepedia.io/editorial-guidelines`
- `https://futuretools.io/`
- `https://futuretools.io/newly-added`
- `https://futuretools.io/tools/rowspeak-eezpb1`
- `https://futuretools.io/submit-a-tool`
- `https://www.aixploria.com/en`
- `https://www.aixploria.com/en/categories-ai/`
- `https://www.aixploria.com/en/last-ai/`
- `https://www.aixploria.com/en/add-ai/`
- `https://www.aixploria.com/en/verified-ai-tools/`
- `https://www.saashub.com/best-ai-tools-software`
- `https://www.saashub.com/there-s-an-ai-for-that-alternatives`
- `https://alternativeto.net/category/ai-tools/`
- `https://aitoolsdirectory.com`
- `https://aitoolsdirectory.com/submit-tool`
- `https://aitoolsdirectory.com/ads`
- `https://aitoolsdirectory.com/blog`
- `https://ai-bot.cn`
- `https://ai-bot.cn/favorites/ai-writing-tools/`
- `https://ai-bot.cn/about-us/`
- `https://top.aibase.com`
- `https://top.aibase.com/discover`
- `https://top.aibase.com/ranking/top`
- `https://top.aibase.com/tool/sendmux-cli`
- `https://app.aibase.cn/submission`
- `https://aibase.com`
- `https://www.aibase.com/zh/partnership`
- `https://app.aibase.com/zh/tools/geo-checker`
- `https://www.ainav.cn`
- `https://www.ainav.cn/%e6%8f%90%e4%ba%a4%e7%bd%91%e7%ab%99`
- `https://www.ainav.cn/%e5%95%86%e4%b8%9a%e5%90%88%e4%bd%9c`
- `https://www.ainav.cn/sites/2554.html`
- `https://www.aigc.cn`
- `https://www.aigc.cn/submit`
- `https://www.aigc.cn/ai-news`
- `https://www.aigc.cn/chat`
- `https://www.faxianai.com`
- `https://www.faxianai.com/tool`
- `https://www.faxianai.com/rankings`
- `https://www.faxianai.com/hotnews/`
- `https://toolifyai.cn`
- `https://toolifyai.cn/submit`
- `https://toolifyai.cn/article_list/2`
- `https://ai.hao.360.com`
- `https://ai.hao.360.com/details/KATUPUbkLXvAPT`
- `https://ai.hao.360.com/details/KALUQkXrL374PT`
- `https://ai.codefather.cn`
- `https://ai.codefather.cn/tool`
- `https://ai.codefather.cn/mcp`
- `https://ai.codefather.cn/vibe`

