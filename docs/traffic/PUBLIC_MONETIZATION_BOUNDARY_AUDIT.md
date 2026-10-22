# TRAFFIC0R Public Monetization Boundary Audit

## Audit Boundary

This audit records public-page evidence only. It does not infer private backend architecture, hidden ranking logic, private ad systems, database state, or search guideline compliance.

Neutral labels used:

- public evidence observed
- not observed
- unclear from public pages
- risk pattern for 123Charts

123Charts comparison principle:

Featured Signals may affect human-visible UI only. Featured Signals must not affect sitemap inclusion, Public API ordering, MCP payloads, Signal Score, Source Confidence, organic route ordering, or editorial review result.

## Competitor Audit Matrix

| Site | Featured / sponsored / promoted labels | Advertise / sponsor / submit / pricing CTA | Paid/organic separation visible? | rel=sponsored / nofollow observed? | Ranking mixed with paid placement? | Traffic/ranking claims in paid copy? | 123Charts lesson |
| --- | --- | --- | --- | --- | --- | --- | --- |
| toolify.ai | Sponsored and featured labels observed on homepage/ranking surfaces | Submit and advertise links visible; submit form visible | Unclear from public pages; sponsored cards visibly labeled but ranking interaction is not fully auditable | rel=nofollow observed on many outbound revenue-ranking links; rel=sponsored not observed | Unclear from public pages | Revenue/monthly visits/ranking framing visible on public ranking routes | Do not use unverified traffic/revenue/ranking framing. Paid UI must not affect organic systems. |
| futurepedia.io | Featured/advertise/review language observed; editorial guidelines visible | Submit page and charge rationale visible | Better than most because editorial guidelines are public, but exact paid/organic separation still not fully knowable | rel=nofollow observed on some outbound links; rel=sponsored not observed | Unclear from public pages | Reach/audience framing visible on submit page | 123Charts should publish review/lifecycle rules and keep any paid surface isolated. |
| futuretools.io | Not prominent in sampled pages | Submit form visible; newsletter distribution visible | Unclear from sampled pages | rel=sponsored/nofollow not observed in sampled summary | Not observed | Not observed in sampled pages | Curation/newsletter can be safe if it does not promise outcomes. |
| aixploria.com | Featured/verified/top/best language observed | Submit/featured page visible | Unclear from public pages | rel=nofollow observed; rel=sponsored not observed | Unclear from public pages | Audience/reach framing visible on featured page | 123Charts should avoid broad top/best framing and separate featured UI clearly. |
| aitoolsdirectory.com | Featured Tools Premium Placement visible | Submit Tool and Advertise visible | Unclear from public pages | rel=sponsored/nofollow not observed in sampled summary | Unclear from public pages | Premium placement language visible | 123Charts should not let premium placement language touch discovery trust. |
| AI工具集 / ai-bot.cn | Advertising/cooperation language visible | Advertising cooperation and inclusion/update links visible | Unclear from public pages | rel=nofollow observed; rel=sponsored not observed | Unclear from public pages | Not observed as ranking claim in sampled pages | 123Charts Chinese submit pages must avoid paid inclusion confusion. |
| AIBase / top.aibase.com | Promotion/ranking/submission signals visible | Submit/product display page visible | Unclear from public pages | rel=nofollow observed; rel=sponsored not observed | Ranking and submission coexist publicly, but hidden logic is not auditable | GEO/promotion and ranking language visible in ecosystem | 123Charts must frame GEO as readiness/machine readability, not promotional outcome. |
| aibase.com | Business cooperation visible | Partnership and GEO checker pages visible | Unclear from public pages | rel=sponsored/nofollow not observed in sampled summary | Not observed in sampled pages | Promotion-effect language visible on GEO checker | Avoid outcome-oriented checker copy. |
| AI导航网 / ainav.cn | Advertising/business cooperation visible | Submit and business cooperation forms visible | Some sampled tool-detail outbound links used rel=sponsored | rel=sponsored and rel=nofollow observed on sampled detail page | Unclear from public pages | Not observed as ranking claim in sampled detail | Good reminder to make paid/link treatment explicit and not affect organic routes. |
| AIGC导航 / aigc.cn | Submit/contact/认证 language visible | Submit/contact visible | Unclear from public pages | rel=nofollow observed; rel=sponsored not observed | Not observed | Not observed | Submit instructions can exist, but lifecycle and review boundaries must be explicit. |
| 发现AI / faxianai.com | Ranking, ad, promotion language visible | Ranking/hotnews/tool cards visible | Unclear from public pages | Many nofollow outbound links observed on hotnews; rel=sponsored not observed | Unclear from public pages | Ranking/hotness language visible | 123Charts should avoid ranking pages until source and counts are defensible. |
| ToolifyAi Chinese | Submit, ad/news language visible | Submit link and inputs visible | Unclear from public pages | rel=sponsored/nofollow not observed in sampled summary | Unclear from public pages | Not observed | Generic Chinese directory monetization patterns reinforce need for differentiation. |
| 360AI导航 | Ad signal visible on detail pages | Feedback/login/collection links visible | Unclear from public pages | rel=sponsored/nofollow not observed in sampled summary | Not observed | Not observed | Portal-style ads should not define 123Charts's trust model. |
| 鱼皮AI导航 | Business cooperation visible | Business cooperation link visible | Unclear from public pages | rel=sponsored/nofollow not observed in sampled summary | Not observed | Not observed | Builder community monetization should stay separate from project evidence. |
| SaaSHub | Not observed due minimal render | Not observed | Not observed | Not observed | Not observed | Not observed | No conclusion from TRAFFIC0R page sample. |
| AlternativeTo | Not observed due minimal render | Not observed | Not observed | Not observed | Not observed | Not observed | No conclusion from TRAFFIC0R page sample. |
| There Is An AI For That | Not observed due Chrome policy block | Not observed | Not observed | Not observed | Not observed | Not observed | No page-level conclusion from TRAFFIC0R sample. |

## 123Charts Monetization Rules For Future Tasks

Mandatory:

1. Featured Signals can be a visible UI label only.
2. Featured Signals must not affect sitemap inclusion.
3. Featured Signals must not affect Public API ordering.
4. Featured Signals must not affect MCP payloads.
5. Featured Signals must not affect Signal Score.
6. Featured Signals must not affect Source Confidence.
7. Featured Signals must not affect organic route ordering.
8. Featured Signals must not affect editorial review result.
9. Submit/claim/correction copy must not imply automatic listing.
10. Chinese copy must not imply paid inclusion, search outcome, traffic outcome, or AI-citation outcome.
11. Sponsored outbound links, if ever used later, need explicit visible labeling and technical review before launch.
12. Rankings should not launch until ranking inputs, source confidence, and paid isolation are documented.

## TRAFFIC1 Monetization Inputs

TRAFFIC1 should add `monetization_boundary` to every route family:

- `none`: pure editorial/source-backed route
- `featured_ui_only`: paid/featured visual label allowed, no organic-system effect
- `forbidden`: route cannot contain monetization surface
- `checkpoint_required`: future paid surface requires human checkpoint

Suggested initial defaults:

- `/landscape`: `none`
- `/landscape/sectors`: `none`
- `/tasks/[slug]`: `none`
- `/alternatives/[slug]`: `none`
- `/zh-CN/landscape`: `none`
- `/zh-CN/geo-checker`: `forbidden`
- `/zh-CN/founders`: `none`
- `/zh-CN/submit`: `checkpoint_required` for any commercial surface
- report distribution pages: `none` unless a later human checkpoint approves a separate sponsorship boundary

