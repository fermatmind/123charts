# 123Charts 当前工具定位与本地体验

本轮按用户最新决定：当前聚焦全球工具发现与替代榜单；长期保留网站与数字服务扩展能力。此前品牌记录保留为历史，不覆盖本轮定稿。

- 中文预览：http://127.0.0.1:3100/zh?dataset=real
- 英文预览：http://127.0.0.1:3100/en?dataset=real
- 现有3100服务工作目录：`/Users/rainie/Desktop/123charts.com/88CN`
- 数据与统计写入：本地Supabase `http://127.0.0.1:54321`。预览保持noindex。

## 实现

- 统一中英文主标、副标、承诺、提交按钮、搜索模式与提示、页脚和规则介绍；首页、页面元数据与分享卡共用品牌文案。
- 保留官网、域名、项目名称、字段、统计标识及原路由。没有迁移数据库或更改项目公开资格。
- 分类与搜索列表读取已有语言，支持展开使用条件；未知语言显示待补充。首页紧凑单元不增加这些额外面板。
- 替代页复用已确认任务关系，显示差异、已有部署限制、语言与价格确认状态，分别显示资料更新与来源核对日期。没有根据开源属性推断免费托管。
- 提交页明确审核后的公开档案、分类展示与符合条件的替代展示机会；关系仍单独审核。处理页使用已有申请状态，不将已通过申请写成正在提交审核。
- 在原规则说明页放置长期愿景，不新增业务页面或空分类。
- 保留分类稳定顺序、首次公开日期、有限新发现、独立官网出站统计、常用收藏和三步投稿规则。
- 从已有123品牌SVG转换浏览器favicon，修复浏览器默认请求404；未更改品牌图案。

## 实际检查

- `npx playwright test tests/charts/navigation.spec.ts --grep 'navigation:|brand:'`：最终2 passed，定位用例无控制台错误。两个现有聚焦浏览器用例：官网直达（本地302和一次主动统计）、独立简介与收藏操作、精确搜索、分类筛选、返回状态、稳定列表、游客常用增删/排序/刷新保留、有效替代页。
- 定位验收覆盖中英标题与OG、主标和搜索提示、透明说明、真实替代排序、部署与语言信息、条件展开、最新收录与本地数据库首次公开日期顺序。
- 实际登录本地普通测试账号检查免费提交页、权益说明；读取现有本地演示已通过申请并核对其状态，未新建真实投稿或执行审批。
- 桌面1440×900、手机390×844；手机搜索弹层可用，无横向溢出。中文首屏按项目ID去重：桌面18个、手机7个入口。
- 验证官网跳转时拦截远端目标页面；未向收录项目的生产站点发送测试浏览。
- 首次控制台检查发现默认favicon404，已定位并补齐原图标资源后复验。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check` 均通过；typecheck在构建完成后顺序复核。

## 截图

- `output/playwright/tools-home-desktop-zh.png`
- `output/playwright/tools-home-desktop-en.png`
- `output/playwright/tools-home-mobile-zh.png`
- `output/playwright/tools-home-mobile-en.png`
- `output/playwright/tools-category-desktop.png`
- `output/playwright/tools-listing-card.png`

## 修改文件

- `lib/charts/brand.ts`：本轮中英定位、权益与愿景文案。
- `lib/charts/pages.tsx`：页面元数据标签。
- `lib/charts/navigation.ts`：已有语言标签本地化与未知标记处理。
- `components/charts/site-shell.tsx`：Logo、提交入口、搜索说明与页脚。
- `components/charts/navigation-ui.tsx`：工具搜索、首页文案和已有条件展开。
- `components/charts/discovery-views.tsx`：分类、替代页及资料说明。
- `components/charts/discovery-submit.tsx`：免费提交权益与真实状态展示。
- `components/charts/discovery-workspace.tsx`：工具定位相关入口文案。
- `app/api/charts/card/[id]/route.tsx`：正式收录卡标题。
- `app/globals.css`：条件面板及手机紧凑导航布局。
- `app/favicon.ico`：由现有品牌图标转换。
- `tests/charts/navigation.spec.ts`：维护现有导航和定位验收。
- `tests/charts/browser.spec.ts`：维护工具名称的可访问标签断言。
- 本文：本轮本地交付记录。

## 真实缺口与未验证路径

当前本地公开资料31个项目，27个价格未确认；31个首次公开日期属于历史估计，已有标记继续保留。免费筛选只读取有确认状态且有持续免费条件的记录，当前为Activepieces、Node-RED、Zapier；不把n8n的试用算成持续免费。来源提供方身份未独立建模，规则说明明确不从来源链接推断提供方或独立核验。

本轮未重新执行完整注册/投稿/审批、账号间收藏合并、所有官网可用性及后台权限验收。没有新增外部数据、截图OCR、推荐算法或收入平台；未推送、未部署、未修改生产配置或生产数据。
