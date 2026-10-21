# 123Charts：分类发现与替代方案 MVP

当前产品权威：用户于 2026-10-21 提供的《免费分类榜单与替代方案发现平台》方案。本文件记录其工程实现和验收范围。历史 `123CHARTS_V1.md`、`CATEGORY_TRAFFIC_CHARTS.md` 不再定义当前入驻与前台主线。

## 核对结论

核对基线为本地 commit `9792351`。此前网站**不符合本次新方案**：`lib/charts/rules.ts` 要求十个同行；投稿接口要求至少五个截图对象；主导航、详情和分享卡以外部流量为中心。本轮按新方案替换活动调用链，历史记录和证据保持可追溯。

| 新方案要求 | 当前实现 | 验收证据 |
| --- | --- | --- |
| 发现、分类、替代、免费、免费提交五个主入口 | 中英导航与英文默认入口，旧 charts URL 保留查询并转分类发现 | `components/charts/app.tsx`、统一动态路由；浏览器测试 |
| 首页围绕选择任务 | 搜索、分类、本期发现、新收录、替代入口、收藏提示 | `discovery-views.tsx`；桌面/手机截图 |
| 3–5 同行，创新项目例外 | 独立官网规范化、主体去重、共同任务与依据；少于三个需具体原因及补充替代方式 | `rules.ts`、新投稿页、审核事务；规则/SQL 测试 |
| 无截图/OCR/流量 API 门槛 | 活动投稿与审核无图片要求；相关写接口返回 410；worker 不调外部核验、不领取 OCR 作业 | API、migrations 035–038、worker；实际 API/SQL 测试 |
| 统一项目资料 | 用途、语言、特点、价格、条件、开源属性共用同一记录 | 项目/分类/替代/卡片/私有对照共读；实际更新测试 |
| 用途替代入口 | 仅最终通过的申请和已确认、未撤回的关系可公开；支持双向查找但不要求双向提名；任务筛选 | `alternatives()`、bootstrap；一个候选的发布规则测试 |
| 一次审核更新多个页面 | 底层资料与关系通过后自动可见，无逐页批准流程 | 事务审批、可索引资格函数 |
| 价格和开源独立 | free / freemium / trial / paid / unknown；未确认价格显示待确认，持续免费筛选排除试用，开源单独筛选 | `sustainedFree()`；真实样本与浏览器筛选测试 |
| 新收录按首次公开 | 独立时间字段，编辑与重新公开均不能重置 | 数据库触发器与 SQL/API 测试；历史日期估计明确标注 |
| 规则清楚的发现顺序 | 每日 UTC 稳定候选池，先按用途/分类/价格/语言/开源筛选，再一个新人、一个贡献、四个普通低曝光位置；不足回普通池，控制主体去重 | `discovery-cycle.ts`、`discover()`；确定性与过滤测试 |
| 普通资格与贡献奖励分开 | 所有资料合格的公开项目可参与；新有效关系和实质条件修正才产生额外资格；既有指纹去重及每项目/主体七日上限继续使用 | 审批函数、贡献记录；重复审批测试 |
| 实际结果与分享工具 | 私有同类对照、可撤销分享；收录/持续免费/已确认替代卡，不生成默认排名或虚假推荐卡 | Report/Shared、next/og；浏览器及 PNG 请求测试 |
| 管理与纠错 | 身份认领独立审批；贡献不授予资料管理；免费纠错无需同行任务；审核员可维护、归档资料 | claim/correction 接口与后台；权限测试 |
| 后续更新 | 不要求重做初始同行任务；可保持原对照组，或明确替换同行组，旧关系软撤回并保留历史 | migrations 037–038、投稿更新开关；API 测试 |
| 收藏与回访 | 网站收藏、项目/分类/替代页关注真实持久化；通知与可选本地邮件，移除即取消订阅 | follows、worker、通知；API/浏览器测试 |
| 效果记录 | 展示、项目页浏览、官网外跳分别记录，按访客/项目/日估计；机器人、自测、内部行为排除 | 事件与固定官网外跳端点、工作台；现有过滤链保留 |
| SEO / AI 读取 | SSR 正文、稳定对象链接、双语 canonical/hreflang、与正文一致的 JSON-LD；本地全站 noindex、空 sitemap | metadata、proxy、sitemap；浏览器/HTTP 检查 |
| 未来有用页面自动索引 | 项目基本事实及真实关系满足即可；一条候选可用，空页/无关页/后台不具资格 | `discoveryPageEligible()`、`indexableAlternative()`；纯函数测试 |
| 盈利与阶段范围 | 赞助保留独立标识规则，支付/赞助售卖、外部流量、增长榜和积分商城不进入本期 | 规则页与当前导航/路由 |

## 界面与技术

延续现有深灰工作台，单一蓝色操作强调，以任务搜索和可比较的资料建立层次；不把数字或资料完整度包装为产品受欢迎程度。英文默认、中文入口，切语言保留对象与查询。列表在手机上按身份、说明、条件排列，无横向溢出。

一个 Next.js 16.4.2 / React 19 应用、本地 Supabase、一名 durable worker。新增 SQL 全部为增量 migration，审批使用行锁与同域名事务锁，重复点击只生成一个项目/对照交付。历史流量值和快照的不可变约束继续保留；公开页面不再查询它们。

轮换池只记录项目标识、不可逆控制组摘要、周期前有效曝光计数及资格。不对匿名开放底层周期表。候选资格与排序按日冻结；新审核的项目立即进入资料页/新收录/已确认替代入口，下一周期进入轮换，避免刷新和反复修改刷顺序。空的首次初始化候选池允许在资料准备后填充一次。

## 样本与来源

默认 real 与 demo 的**项目、关系和导出隔离**。本轮使用现有研究库，公开 real 资料 31 条；其基础用途介绍为独立编写。没有复核的价格、语言和细节明确待确认，不宣称所有记录均已深度核实。

本轮对以下官网做了实读，并将有根据的差异及条件用于少量冷启动比较（核对日：2026-10-21）：

- [Zapier pricing](https://zapier.com/pricing)：持续免费、任务数与两步 Zaps 限制。
- [Activepieces pricing](https://www.activepieces.com/pricing)：持续免费额度及用户条件。
- [n8n pricing](https://n8n.io/pricing/)：托管云试用、付费与自部署方案分开说明；不把云试用写成持续免费。
- [Make pricing](https://www.make.com/pricing)：场景/动作/点数条件；当前免费额度未可靠取得，价格保留待确认。
- [Node-RED about](https://nodered.org/about/) 与 [license](https://nodered.org/about/license/)：流程编辑、Node.js、自部署与 Apache 2.0；基础软件免费不等于托管和第三方节点无成本。
- [Cursor](https://cursor.com/en-US)、[Aider](https://aider.chat/)、[Continue docs](https://docs.continue.dev/)：共同任务为 AI 辅助代码编辑，界面和配置方式存在差异，价格仍待确认。
- [Langflow](https://www.langflow.org/)、[Dify](https://dify.ai/)：构建代理与知识应用；不将其全部产品功能宣称等同。

确认了 6 条真实用途关系。它们是编辑核对，不冒称项目方主动提交、已经认领、独立测量或用户行为。

[Windsurf editor](https://windsurf.com/editor) 跳转到 Devin Desktop；[Flowise](https://flowiseai.com/) 首页出现 sunsetting 公告。两条资料退出公开推荐，保留待复核研究记录、历史值和原域名，不凭单次不可访问判断网站不存在。

虚构 Discovery 系列用于本地审核、免费筛选和分享验证；包含免费、免费额度、试用、付费及开源等组合，清单和卡片明确 DEMO。旧模拟流量保留于数据库历史，当前初始化不生成新的模拟流量。

规则参考仅用于产品理解，无竞品代码或数据库复制：[SaaSHub](https://www.saashub.com/product-promotion)、[Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)、[Google AI features](https://developers.google.com/search/docs/appearance/ai-features)。自动生成不等于保证被搜索引擎收录；可读取正文和有用差异优先。

## 本地验收与使用

```bash
npm run local:setup
npm run dev:local
npm run test:charts
npm run test:browser
npm run test:db:charts
npm run lint
npm run typecheck
npm run build
npm run format:check
git diff --check
```

普通用户与管理员账户保存在本机 `.local/accounts.json`，密码不写入文档或 Git。普通用户也可自行注册；邮件只进入本地收件箱。

关键浏览器产物在忽略目录 `output/playwright/`：`discovery-desktop.png`、`discovery-mobile.png`、`alternatives-desktop.png`、`shared-comparison.png`、`listing-card.png`。验收日志保存在 `/tmp/charts-*.log`，不是对生产环境的验收。

## 仍需运营验证的事项

- 收藏、外跳和展示事件具备记录链路，不等于已产生真实外部用户、客户或商业价值；自动化测试行为会被排除。
- 大部分历史资料仍需要持续补充价格、语言和限制，未取得依据的字段保持待确认。
- 历史首次公开日期没有独立记载，展示为估计，不作为近期新人奖励依据。
- 当前质量依赖具体资料与关系审核；长期审核成本、回访率、真实点击和赞助续约不能通过本地测试证明。
- 后续赞助产品、细分任务运营、正式邮件、流量数据及多来源核验按后续阶段推进。未进行任何 GitHub、服务器或生产部署。

### 本轮实际运行结果

- `test:charts`：18 项通过，包含实际 Auth/API/数据库的三同行无截图流程、补资料、事务重复点击、私有对照、分享撤销、认领后更新、旧组保留与软撤回、首次日期不变及跨数据集卡片隔离。
- `test:browser`：2 条完整 Chrome 场景通过，覆盖桌面/手机、中英筛选、键盘搜索、替代入口、免费与开源分离、草稿恢复、后台关系审核、对照分享与 PNG。
- `test:db:charts`：全部 migration 在独立空业务库执行通过；SQL 验证无截图小众例外、权限、首次日期与重新公开、审批幂等、worker 过期锁恢复、私有候选池及历史不可变数据。运行中的数据库未重置。
- `lint`、`typecheck`、`format:check`、`build`、`git diff --check` 通过；重复 `local:setup` 和应用/worker 复启通过，稳定服务端口仅绑定 `127.0.0.1`。
- 首页、项目、替代与免费入口 HTTP 200；本地 HTTP robots header/meta 为 noindex，sitemap 为空。发布资格另行计算，不将本地资格或测试行为冒称搜索收录/真实获客。
