# 123Charts 本地导航改版验收（2026-10-22）

预览：<http://127.0.0.1:3100/zh?dataset=real>

## 实现与边界

在原有 Next.js 项目中优化公共前台，沿用深色表面、细分隔线和蓝色操作强调。首页结构为紧凑页头、统一搜索、精选/个人常用、小范围新发现、分类网站地图和有效替代入口。名称是官网动作，其他操作独立；基础目录稳定，轮换只用于有限发现区。

3100 的服务进程工作目录已核对为 `/Users/rainie/Desktop/123charts.com/88CN`，继续复用原服务。`APP_URL=http://127.0.0.1:3100`、Supabase `http://127.0.0.1:54321`、`CHARTS_LOCAL_PREVIEW=true`。没有生产数据写入、push、部署或线上配置修改。

- 首页精选明确标注编辑选择，不是热度。分类每组最多八项，新发现四项；显示内容来自原有公开资料，保留全部审核与关系状态。
- 统一 `SiteUnit`：名称和图标通过既有出站引擎直达官网；简介进档案，有有效关系才显示找替代，否则显示查看同类。
- 搜索与快捷键共用组件和匹配规则；仅回车进入搜索结果，不擅自打开首项。搜索标题、价格/语言/开源筛选与 URL 一致。
- 游客常用使用项目 ID、按 dataset 保存于当前浏览器。账号收藏复用原 follows 接口，按 ID 合并；保留原账号顺序，追加游客项，并逐项清理已合并队列。退出或换账号不展示上一账号常用。
- 用户可上移、下移和移除；账号收藏已同步，排序只保存在对应账号的当前浏览器，不声称跨设备排序同步。
- 分类基础列表稳定，支持新收录、名称排序。替代页靠近候选展示使用条件，长依据折叠，中英文分别呈现。
- 首页各区域、分类、搜索和替代的曝光来源分别记录。官网 GET 不记主动点击；名称单击仅产生一次异步点击事件，收藏/简介不误触官网。

## 本地资料清理

基于 [AWS 官网](https://aws.amazon.com/) 和 [JetBrains 官网](https://www.jetbrains.com/) 于本轮读取的内容，核对的是平台实体及其原官网，而不是把平台改名成一个助手：AWS 保留平台公开档案，并退出独立编程助手导航候选；JetBrains 改为开发工具用途说明。保留项目 ID、原官网和首次公开日期。知识分类改为“知识库与检索开发”，对应框架、工作空间和向量数据库。

纠正脚本仅允许本机预览数据库，按旧字段条件更新；原记录备份于忽略提交的 `.local/navigation-data-before.json`。没有改动价格核验结果、关系或认领权限。初始化沿用现有本地 setup，并接入同一条件纠正步骤；本轮未重置原数据库或重新验证整套空库初始化。

## 实际验证

| 路径 | 结果 |
| --- | --- |
| 桌面 1440×900 首页 | 18 个不同项目入口完整可见，首个入口 y≈254；基于浏览器 DOM 位置测量，不把重复项目计为不同项目 |
| 手机 390×844 首页 | 9 个不同项目入口完整可见，首个入口 y≈294；中英文主布局无整页横向溢出 |
| 官网与辅助操作 | 候选名称经过本地 302 指向已保存官网；一次主动点击一个事件，收藏和简介不触发外跳 |
| 精确搜索 | n8n 回车进入一个匹配结果；简介往返保留 q，Cmd+K 使用同一搜索 |
| 分类导航 | 刷新顺序不变，价格与名称筛选保留；进入简介并返回恢复 URL 条件及滚动位置（本轮观察起点 scrollY=311） |
| 实际替代页 | Activepieces 显示一个 n8n 候选，试用、自部署和成本条件可见，不制造其他候选 |
| 游客常用 | 添加、刷新保留、移除、排序、已有收藏页管理通过 |
| 账号常用 | 原有项目保留、游客项追加去重、删除不复活、排序刷新保留、连续添加、退出/换账号隔离通过；只使用临时本地账号并清理 |
| 原投稿闭环回归 | 草稿恢复、三同行提交、关系审核、项目审核、对照清单、分享及 PNG 通过；清理命名测试资料 |

通过命令：

```sh
npx playwright test tests/charts/navigation.spec.ts
npx playwright test tests/charts/browser.spec.ts
npm run typecheck
npm run lint
npm run build
git diff --check
```

常规 `npm run test:browser` 已包含这三个聚焦浏览器案例。本轮没有扩大为全站 CI、数据库重建或生产验收。

官网测试拦截远端页面内容，仅验证实际本地 302、目标 URL 和单次记录，不向远端网站发送测试流量；不把此项称作远端网站可用性或注册转化验证。账号排序跨设备仍是缺口；实体与价格资料保留原有已确认/未知边界，不声称逐个重新核验。

## 截图

- [改版前桌面](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-before-desktop.png)
- [改版后桌面](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-after-desktop.png)
- [改版前手机](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-before-mobile.png)
- [改版后手机](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-after-mobile.png)
- [英文手机](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-mobile-english.png)
- [真实关系的替代页](/Users/rainie/Desktop/123charts.com/88CN/output/playwright/nav-alternatives.png)

截图在本机 output 目录保存，未推送。

## 修改文件清单

- `AGENTS.md`
- `app/[lang]/(dashboard)/following/page.tsx`
- `app/[lang]/(public)/following/page.tsx`
- `app/api/charts/[...path]/route.ts`
- `app/globals.css`
- `components/charts/browser-favorites.ts`
- `components/charts/context.tsx`
- `components/charts/discovery-views.tsx`
- `components/charts/navigation-ui.tsx`
- `components/charts/personal-app.tsx`
- `components/charts/public-app.tsx`
- `components/charts/site-shell.tsx`
- `docs/123Charts_Navigation_Interaction_Spec_20261022.md`
- `docs/NAVIGATION_PREVIEW_20261022.md`
- `lib/charts/navigation.ts`
- `lib/charts/pages.tsx`
- `lib/charts/server.ts`
- `next-env.d.ts`
- `package.json`
- `playwright.config.ts`
- `scripts/local/refine-navigation-data.ts`
- `scripts/local/seed-discovery.ts`
- `scripts/local/setup.mjs`
- `tests/charts/browser.spec.ts`
- `tests/charts/navigation.spec.ts`
