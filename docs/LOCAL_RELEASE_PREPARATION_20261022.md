# 123Charts 本地验收与上线配置准备

状态：**本地验收完成；三节点部署模板已准备；尚未上线。**

- 当前目录：`/Users/rainie/Desktop/123charts.com/123charts`；原目录已迁移，Git 历史保留。
- 持续预览：`http://127.0.0.1:3100/zh?dataset=real`；英文 `/en?dataset=real`。
- 未 push、未创建 PR、未连接业务服务器、未部署、未改 DNS 或生产数据。
- Studio 的挂载源、容器内目标、环境路径和标签均已转至新目录；原数据库和 Storage 卷未重置。

## 并发与持久化证据

真实 worker 抓取官网；仅延迟浏览器接收真实完成响应，不伪造结果或任务状态。

| 场景 | 证据与结果 |
| --- | --- |
| 最新代码完整导入 | 任务 `1b81da79-a92d-4ded-9bed-3bc350874707`：运行 `05:59:14.858977Z` → 页面导入 `05:59:15.278Z` → 完成 `05:59:15.746Z`。完成前保存、完成后保存及刷新通过 |
| 完整字段 | 名称、中英文简介、任务、`unknown` 价格、空条件、空语言数组与空来源列表，数据库读回与导入内容一致；明确空英文未被补回 |
| 部分导入 | 任务 `852dd328-f0b5-4cc3-85d5-2a0fc60edc6d`：运行 `04:59:10.028631Z` → 导入 `04:59:10.113Z` → 完成 `04:59:11.464Z`；未导入英文可正常预填，导入与手填内容保留 |
| 提取中换官网 | 任务 `49aba380-80b8-46d4-9a67-d8912fef2566`：运行 `05:28:54.196635Z` → 切换 `05:28:54.544Z` → 旧任务完成 `05:29:15.927Z`；Activepieces 新任务及再次提取均完成，导入内容未被旧任务覆盖 |
| 失败重试 | 控制一次 metadata HTTP 503，URL 修改后旧自动简介清空；真实重试任务 `e7800009-af55-4e5a-87ae-fd4155080320` 返回 Activepieces，未覆盖手填名称/中文简介；保存刷新通过 |
| 保存失败 | 控制一次保存 HTTP 503，表单内容保留；真实保存重试与刷新通过 |
| 严格导入 | 错误 JSON、官网不匹配和注入公开状态均被拒绝，原字段未变 |

独立本地测试草稿仅新增两份：`4469eedd-53dd-40d6-925d-77d4f74a6aa4`、`57dce351-aa2c-4455-8ad8-56c3bb802207`，保持草稿，未关联或改变真实项目认领/公开状态。HTTP 503 是失败分支注入，不称为真实官网故障。

时序与截图保存在忽略的 `output/playwright/`：`concurrent-import-final.log`、`concurrent-import-partial.log`、`switch-during-fetch.log`、`partial-retry.log`、`import-error-check.log`、`concurrent-save-retry.log`。

## 既有记录保护与实际修复

开始前 `.local/release-prep-before.json` 与结束后的逐字段比较覆盖：46 个项目、2 个认领、16 个既有申请、19 个关系、3 份报告，共 **86 条原记录最终完全一致**；另有上述两份独立草稿。

过程中发现历史自动化浏览器窗口热更新触发无改动保存：六份草稿更新时间、其中两份附加的默认预填元数据发生变化。其他业务字段未变。关闭旧自动化窗口后，以完整行比对和行锁事务恢复开始前快照，未覆盖任何实际内容编辑。具体恢复记录保存在 `.local/release-preservation-restoration.json`。

修复：前端使用规范化 JSON 内容指纹，未改动保存不发请求；新增 `048_unchanged_drafts.sql` 让数据库相同草稿保存直接返回，保留权限和可编辑状态校验。浏览器新增检查证明刷新、等待自动保存周期及点击保存均不产生多余请求、不改变时间戳；真实编辑继续保存。既有迁移文件未改写。

## 已执行验收

- **55 项**聚焦业务/导入/URL 安全/运行配置测试通过。
- **2 项**隔离库接口闭环通过：投稿、补资料、审核、独立替代关系、报告、认领/修订、冻结首次公开时间、缓存刷新、隐藏与权限。
- **6 项**实际浏览器用例通过：投稿/草稿恢复/无改动保存/审核/卡片，以及导航、收藏合并与隔离、品牌、认领后 JSON 修订、未认领项目展示。
- 桌面 1440×900、手机 390×844；桌面首屏 20 个不同工具入口、手机 8 个，返回滚动、官网/简介/替代独立动作、刷新收藏与中英切换通过。
- 空库全部迁移、SQL/RLS、草稿 no-op 与真实修改检查通过；恢复后的增量迁移重复执行无新增应用。
- `npm run typecheck`、`npm run lint`、Linux Docker 内 `npm run build`、部署 Compose 静态检查、隔离 OpenResty `nginx -t`、第三方许可检查与 Git 空白检查通过。

原始输出：`.local/release-unit.log`、`.local/release-db-check.log`、`.local/release-typecheck.log`、`.local/release-lint.log`、`.local/linux-build-final.log`、`.local/acceptance/linux-integration.log`、`browser-final.log`、`navigation-final.log`。

## 部署产物与隔离演练

- 官方固定提交的自托管 Supabase Docker 模板，独立命名卷/凭据、CPU/内存/PID/日志上限；独立 Web、worker 与 OpenResty 配置。详见 [deploy/README.md](../deploy/README.md)。
- Linux arm64、Node 24 容器中 Web/worker 实际启动并健康；worker 实际完成 Activepieces metadata 任务。离线队列恢复、重启后最多三次重试、过期 lease 回收通过。
- standalone 与单文件 worker 包含运行依赖；镜像排除本地环境和数据。分享卡改用保留 OFL 许可的 Noto Sans SC，Linux 中文 PNG 实际生成。
- 本地和 Staging 持续 noindex、空 sitemap；仅明确配置的 Production 可按公开资格索引。实际验证公开 Aider 页、demo/后台/筛选页与 canonical、JSON-LD；生产模式 sitemap 为 92 个当时符合资格的语言 URL。
- 完整 SQL、Storage、数据库加密配置卷、数据指纹及 ACL/RLS 清单备份恢复通过：**103 张表、287 项权限对象匹配**，私有文件字节一致，匿名文件/RPC/迁移记录访问被拒绝。
- 演练发现并修复了恢复目标默认授权扩大私有对象权限的问题：恢复前清理目标默认授权，按备份重建，再逐项校验数据与权限；不匹配则保持 API 停止。迁移记录表也已明确撤销匿名/普通账号权限。

最终恢复证明：`.local/acceptance/restore-check-final.json`；生产模式证明：`production-smoke.json`；worker 重启证明：`worker-test.json`。临时栈均只绑定本机，与原预览数据库隔离。

## 真实剩余条件

1. 尚未核实三台既有服务器的实时容量、CPU 架构、端口/私网连通、安全组、OpenResty 宿主连接方式、TLS、SMTP 投递及独立加密备份位置。资源不足须暂缓，不挤占 FermatMind、不增加服务器。
2. 本机验证 Linux arm64；若 ECS 为 amd64，需构建并验收对应架构。当前本地镜像标记为工作区验收产物，正式发布前需从最终干净提交构建并记录不可变 digest。
3. 未验证真实 SMTP 投递、真实异地备份 RPO/RTO、线上流量或商业效果；不把本地样本称为真实获客。
4. `npm audit --omit=dev` 为 0；完整依赖审计有 9 项开发构建链告警，来自 braces 和 PostCSS selector parser。当前不在用户请求处理链解析不可信 glob/CSS。braces 官方公告尚无修复版本；未采用强制降级 Next ESLint 或升级 Tailwind 大版本绕过告警。仅构建可信源码，后续追踪 [braces 公告](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 与 [PostCSS 公告](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)。

本轮没有声明“消除所有未知问题”或“生产已就绪”。旧名称兼容、历史迁移和外部真实仓库例外见 [BRAND_MIGRATION.md](BRAND_MIGRATION.md)。
