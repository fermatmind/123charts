# 本地更名记录：2026-10-22

- 当前目录：`/Users/rainie/Desktop/123charts.com/123charts`，保留原 Git 历史、工作区、本地配置与命名数据卷。
- 展示品牌 `123Charts`；进程、脚本、协议与路径新增标识 `123charts`；域名 `123charts.com`。
- 已确认归属的 Web/worker 受控停止后，从新目录重启；Studio 的项目目录挂载已重建。数据库和 Storage 命名卷未删除、未 reset。

以下是必要例外，不能机械改名：

| 残留 | 原因 |
| --- | --- |
| `supabase/migrations/*` 中的 88CN/88cn 字符串 | 已执行迁移保留原始字节，新增业务使用增量迁移 |
| `fermatmind/88CN` 与实际 GitHub URL | 外部真实仓库未更名；本地 Git remote 与历史不改写 |
| `88cn-index-data`、`88cn-scout-worker` 及其实际本地路径 | 邻接项目与外部来源的真实身份，不属于本项目目录更名 |
| `lib/legacy-identifiers.ts` | 集中保留 `88cn-project-v1` 和 `x-88cn-metrics-key` 的读取兼容；新增输出使用新标识 |
| 忽略的历史日志、浏览器运行记录与本地备份 | 原始验收证据；不批量改写历史数据或密钥 |

运行 `node scripts/check-brand-migration.mjs` 检查未分类残留与迁移文件修改。该检查不修改相邻仓库或历史提交。
