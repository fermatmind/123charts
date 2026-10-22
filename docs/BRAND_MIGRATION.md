# 本地与 GitHub 更名记录：2026-10-22

- 当前目录：`/Users/rainie/Desktop/123charts.com/123charts`，保留原 Git 历史、工作区、本地配置与命名数据卷。
- 展示品牌 `123Charts`；进程、脚本、协议与路径新增标识 `123charts`；域名 `123charts.com`。
- 已确认归属的 Web/worker 受控停止后，从新目录重启；Studio 的项目目录挂载已重建。数据库和 Storage 命名卷未删除、未 reset。
- GitHub 仓库已由 `fermatmind/88CN` 直接更名为 [fermatmind/123charts](https://github.com/fermatmind/123charts)，仓库 ID `1270066229` 保持不变；更名前后全部 Git refs 一致，已有提交与 PR #258 保留。当前本地 origin 已更新为 `git@github.com:fermatmind/123charts.git`。
- 当前操作文档与 README 使用新仓库名。历史审计只补充当前地址说明，不改写当时的名称、SHA 或结论；相邻仓库和旧 worktree 目录不更名。
- GitHub About 的旧站点地址已更新为 `https://123charts.com`，描述注明当前为本地预览；填写正式域名不表示网站已经上线。
- 更名不涉及服务器、DNS、生产配置或业务数据。GitHub 提供旧地址重定向，但本地使用新 remote；不要重新创建同名旧仓库，以免失去重定向。参见 [GitHub 仓库更名说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)。

以下是必要例外，不能机械改名：

| 残留 | 原因 |
| --- | --- |
| `supabase/migrations/*` 中的 88CN/88cn 字符串 | 已执行迁移保留原始字节，新增业务使用增量迁移 |
| `docs/OPS0_REPO_STATE_AUDIT.md`、`docs/infra/PRODUCTION_DEPLOY_GATE.md` 中的 `fermatmind/88CN` | 历史审计与 PR205 候选记录，已注明当前仓库地址；不改写原始证据 |
| `88cn-index-data`、`88cn-scout-worker` 及其实际本地路径 | 邻接项目与外部来源的真实身份，不属于本项目目录更名 |
| `lib/legacy-identifiers.ts` | 集中保留 `88cn-project-v1` 和 `x-88cn-metrics-key` 的读取兼容；新增输出使用新标识 |
| 忽略的历史日志、浏览器运行记录与本地备份 | 原始验收证据；不批量改写历史数据或密钥 |

运行 `node scripts/check-brand-migration.mjs` 检查未分类残留与迁移文件修改。该检查不修改相邻仓库或历史提交。
