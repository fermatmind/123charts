# 123Charts 品牌与榜单表达本地验收

预览：http://127.0.0.1:3100/zh?dataset=real
英文：http://127.0.0.1:3100/en?dataset=real

## 本轮变更

- 在导航版上补充品牌短定位、首屏标题和四项承诺，首页保留直达、常用、新发现和分类网站地图。
- 导航提供分类导航、替代榜单、最新收录、我的常用；项目方按钮统一为免费提交网站。
- 首页与提交页说明：免费提交，审核通过后免费收录；平台免费与产品实际价格、独立开源属性分开表达。
- 替代候选默认按名称 A–Z 排序，可切换首次公开收录时间倒序；同名用项目 ID、任务稳定排序。页面与 JSON-LD 共用排序函数，不使用相关性或访问量评分。
- 最新收录明确为首次公开收录时间，保留历史估计日期标记；没有改写数据库日期或审核规则。
- 新增资料与排序说明锚点；保留真实来源、维护日期与纠错入口，缺失信息如实提示。
- 中英首页标题、描述、OG 文案与收录卡使用统一品牌文案；正式标识仅在现有公开资格条件满足时展示。

## 实际验证

- `npx playwright test tests/charts/navigation.spec.ts --grep 'navigation:|brand:'`：2 passed。
- 实测官网出站 302 与一次主动事件（远端目标页面在浏览器测试中被拦截，本次未向项目官网发送测试访问）、独立简介链接、精确搜索、分类筛选与返回状态。
- 实测游客收藏、排序、刷新保留和移除，辅助按钮没有误触官网。分类基础顺序刷新稳定。
- 实测数据透明锚点、替代榜单入口、Activepieces 的一个已确认候选及部署条件、名称/收录时间切换、来源与纠错链接。
- 实测最新收录入口及列表与本地数据库首次公开日期倒序一致；免费提交跳转登录，并在本地测试账号登录后检查实际三步页的免费承诺。
- 实测中文和英文首页标题、OG 标题、中文描述；1440×900 桌面及390×844手机无横向溢出。桌面首屏18个不同项目入口、手机7个，按实际可见项目ID去重。
- 已生成1200×630收录卡，实际查看中文用途、价格条件和品牌标识。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check` 均通过。
- 复用原3100服务，工作目录确认为本仓库；本地Supabase地址127.0.0.1:54321。没有重置数据库、改变公开状态或接入外部排名服务。

## 截图

- `output/playwright/brand-home-desktop.png`
- `output/playwright/brand-home-mobile.png`
- `output/playwright/brand-home-mobile-en.png`
- `output/playwright/brand-listing-card.png`

## 修改文件

- `lib/charts/brand.ts`：中英品牌文案。
- `components/charts/site-shell.tsx`：品牌、导航、页脚。
- `components/charts/navigation-ui.tsx`：紧凑首屏和项目方说明。
- `components/charts/discovery-submit.tsx`：免费收录承诺。
- `components/charts/discovery-views.tsx`：榜单、资料说明、收录标识。
- `lib/charts/navigation.ts`：可复用的候选排序。
- `lib/charts/pages.tsx`、`app/layout.tsx`：元信息及与可见顺序一致的结构化列表。
- `app/api/charts/card/[id]/route.tsx`：真实收录卡文案。
- `app/globals.css`：紧凑品牌与手机导航样式。
- `tests/charts/navigation.spec.ts`：更新原导航断言与新增品牌入口验收。
- 本文件：本地交付记录。

## 真实数据边界

本地公开投影当前31个项目，其中27个价格尚未确认，31个首次公开日期带有历史估计标记。这些是既有资料状态；本轮未伪造核验或补造日期。只按已确认条件提供免费筛选。关系数量按实际展示，不声称完整全球覆盖。

本轮未重新验证账号间收藏合并、完整投稿审批或所有第三方官网可用性；这些能力未改动。没有新增外部流量排名、OCR、智能相关性算法。没有推送、部署或修改生产数据；预览保持noindex。
