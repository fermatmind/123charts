# 123Charts

**Discover Websites, Explore Alternatives.** 免费分类发现与替代方案平台。当前产品权威：[DISCOVERY_MVP.md](docs/DISCOVERY_MVP.md)。旧流量榜方案保留为历史；本轮仅本地开发。

## 本地启动

```bash
npm install
npm run local:setup
npm run dev:local
```

Docker Desktop 需要运行。初始化创建本地 Supabase、Auth、私有历史文件存储和邮件收件箱。重复 setup/start 保留现有账户和资料；无数据库重置。核心演示无需 OCR 或远程流量接口。新官网资料提取需要联网，失败允许手填。

- English: http://127.0.0.1:3100/en
- 中文：http://127.0.0.1:3100/zh
- 演示：http://127.0.0.1:3100/en?dataset=demo
- 工作台：`/en/dashboard`；审核后台：`/en/admin`
- 本地邮件：http://127.0.0.1:54324；数据库 Studio：http://127.0.0.1:54323
- 普通用户、管理员测试凭据：[.local/accounts.json](.local/accounts.json)，仅本机生成，勿提交。
- `npm run local:stop` 停止本地应用、worker 和 Supabase，保留数据卷。

所有服务绑定本机；所有本地页面 noindex。GitHub 与生产部署未操作。

## 当前体验

1. 搜索用途、网站或分类，按价格、语言、开源筛选；`Cmd/Ctrl + K` 搜索。
2. 浏览分类发现、新收录、持续免费和用途替代页。发现顺序使用每日稳定轮换，不宣称流量或人气排名。
3. 注册或登录，三步提交官网、用途条件和 3–5 个同行；自动存草稿，小众例外可以说明原因和相关替代方式。无需截图。
4. 审核员逐条确认关系、记录资料依据与价格核验结果，通过后交付公开档案、同类对照、相关替代入口与收录卡。
5. 独立认领管理身份后维护资料；后续更新不重复首次同行数量要求。项目页、筛选、替代比较和新卡片同步读取当前资料。
6. 收藏网站、关注分类或替代页，查看展示和官网外跳记录。分享自愿，对照清单分享可撤销。

## 数据说明

默认 real 只显示真实研究条目，价格未复核则待确认。demo 只显示虚构案例，卡片与清单注明 DEMO。历史流量及截图留存，退出当前导航、投稿、审核和自动调度。初始化不重新制造流量数据。

官网来源与逐项核对见 [DISCOVERY_MVP.md](docs/DISCOVERY_MVP.md)。历史收录日期未曾独立记录的条目明确标记为估计；新记录从首次公开时间开始保存，编辑不重置。

## 验证

```bash
npm run test:charts
npm run test:browser
npm run test:db:charts
npm run lint
npm run typecheck
npm run build
npm run db:types
npm run format:check
```

`tests/charts/legacy/` 保存旧流量投稿与浏览器验收，已退出当前 MVP 验收入口。仍运行的历史纯函数及 SQL 回归仅保护原有不可变数据与权限，不表示相关功能属于当前 MVP。
