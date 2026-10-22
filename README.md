# 123Charts

**Discover great tools. Find better alternatives.** 全球工具分类与替代榜单。当前产品权威：[全站架构规范](123Charts_Website_Framework_V1_20261021.md)。旧流量榜方案保留为历史；当前运行范围为本地开发与预览，尚未部署。

GitHub：[fermatmind/123charts](https://github.com/fermatmind/123charts)。现有仓库直接更名，保留提交、分支、标签、Issue 和 PR 历史；SSH remote 为 `git@github.com:fermatmind/123charts.git`。

## 本地启动

需要 Git、Node.js **20.11+**（建议 Node 24，仓库提供 `.nvmrc`）和已启动的 Docker Desktop / 本机 Docker Engine。首次安装 npm 依赖、下载 Supabase 镜像需要联网；不需要云端 Supabase、生产密钥或相邻仓库。

```bash
git clone https://github.com/fermatmind/123charts.git
cd 123charts
# 如使用 nvm：nvm install && nvm use
npm ci
npm run local:setup
npm run dev:local
```

`local:setup` 自动执行迁移、生成忽略的 `.env.local` 和随机测试账号，创建本地数据库、Auth、私有存储、邮件收件箱及 real/demo 样本；不要预先复制空密钥或生产环境配置。看到 `Ready` 后再运行 `dev:local`，后者同时启动 Web 和持久化任务 worker，终端需保持运行。重复初始化不 reset，后续启动通常只需 `npm run dev:local`。新官网资料提取需要联网，失败允许手填；核心演示无需 OCR 或远程流量接口。

默认端口见下方。已有另一份克隆在运行时，请使用原目录，或先按[本地开发说明](docs/02_ZERO_STATE_BOOTSTRAP.md)设置独立项目名与端口；脚本会拒绝接管其他目录的数据库或占用中的预览端口。

从新地址克隆的实际安装、初始化与重启结果见[本地启动验收记录](docs/LOCAL_STARTUP_CHECK_20261022.md)。

- English: http://127.0.0.1:3100/en
- 中文：http://127.0.0.1:3100/zh
- 演示：http://127.0.0.1:3100/en?dataset=demo
- 工作台：`/en/dashboard`；审核后台：`/en/admin`
- 本地邮件：http://127.0.0.1:54324；数据库 Studio：http://127.0.0.1:54323
- 普通用户、管理员测试凭据：[.local/accounts.json](.local/accounts.json)，仅本机生成，勿提交。
- `npm run local:stop` 停止本地应用、worker 和 Supabase，保留数据卷。

所有本地服务绑定本机；所有本地页面 noindex。代码已同步 GitHub；未执行生产部署。

## 当前体验

1. 搜索用途、网站或分类，按价格、语言、开源筛选；`Cmd/Ctrl + K` 搜索。
2. 浏览分类发现、新收录、持续免费和用途替代页。发现顺序使用每日稳定轮换，不宣称流量或人气排名。
3. 注册或登录，三步提交官网、用途条件和 3–5 个同行；自动存草稿，小众例外可以说明原因和相关替代方式。无需截图。
4. 审核员记录资料依据与价格核验结果，通过后交付公开档案、同类对照与收录卡；部分关系待审不阻塞项目公开，仅确认的定向关系进入替代入口。
5. 独立认领管理身份后维护资料；后续更新不重复首次同行数量要求。项目页、筛选、替代比较和新卡片同步读取当前资料。
6. 收藏网站、关注分类或替代页，查看展示和官网外跳记录。分享自愿，对照清单分享可撤销。

## 数据说明

默认 real 只显示真实研究条目，价格未复核则待确认。demo 只显示虚构案例，卡片与清单注明 DEMO。历史流量及截图留存，退出当前导航、投稿、审核和自动调度。初始化不重新制造流量数据。

官网来源与逐项核对见 [DISCOVERY_MVP.md](docs/DISCOVERY_MVP.md)。历史收录日期未曾独立记录的条目明确标记为估计；新记录从首次公开时间开始保存，编辑不重置。

## 验证

无需数据库写入的检查：

运行构建前先用 `Ctrl+C` 停止当前目录的 Web/worker，避免开发和构建共用 `.next`；数据库可以继续运行。

```bash
npm run test:unit
npm run lint
npm run typecheck
npm run build
```

浏览器/API 集成检查会创建测试草稿及审核记录，只在独立、可丢弃的本地测试实例中执行。安装 Chrome 后，启动该实例，再运行 `npm run test:charts`、`npm run test:browser`；非默认预览地址需设置 `CHARTS_TEST_BASE_URL`。`npm run test:db:charts` 使用当前项目容器中的临时数据库验证空库迁移，不 reset 运行库。详细命令与停止方法见[本地开发说明](docs/02_ZERO_STATE_BOOTSTRAP.md)。

`npm run db:types` 是维护命令，会重写生成类型；`npm run format:check` 检查整个指定目录，不是首次启动的必要步骤。

`tests/charts/legacy/` 保存旧流量投稿与浏览器验收，已退出当前 MVP 验收入口。仍运行的历史纯函数及 SQL 回归仅保护原有不可变数据与权限，不表示相关功能属于当前 MVP。

## 本轮架构实现

公共发现、个人空间、运营管理分别使用 `(public)`、`(dashboard)`、`(admin)` 路由组与权限布局。公共首屏不包含管理面板。

Supabase SQL 是唯一 schema，继续使用 SDK，不引入第二套 ORM。`products`、`competitor_relations`、`outbound_clicks`、`impressions` 是现有 `charts_projects`、`charts_relations`、`charts_events` 的规范只读投影，非重复数据表；分类使用 `charts_categories` / `catalog_categories`，避免覆盖旧业务的 `categories`。

提交只创建私有预览；审核通过才公开。资料修订审核中保留旧版，隐藏项目审核后仍隐藏。首次公开时间由数据库保护。关系始终是 anchor ← candidate，不自动反向成立。

规范接口：`/api/v1/submissions`、`/api/v1/reviews/[id]/decision`、`/api/v1/events/outbound`。官网 GET 只做 302 跳转，真实点击由客户端异步 POST 记录；链接预取不计数。审核事务完成后刷新实际使用的缓存 tag；私有 outbox 支持失败重试和提交版本隔离。

## 本地上线准备

更名与兼容例外见 [BRAND_MIGRATION.md](docs/BRAND_MIGRATION.md)。三节点独立自托管配置、备份恢复和上线前置条件见 [deploy/README.md](deploy/README.md)；本轮不执行远端部署。
