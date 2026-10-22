# 123Charts 三节点部署配置（本地准备，尚未上线）

本轮未 push、未 SSH、未部署、未改 DNS 或生产数据。模板与本地验收不能证明现有 ECS 的实时容量、网络、证书或 SMTP 已满足要求。当前范围是工具发现、3–5 个同行候选、独立审核与认领；不启动旧流量/OCR业务。

## 节点与隔离

| 既有节点 | 独立资源 |
| --- | --- |
| Production Web | `/srv/123charts/releases/<sha>`、`current` 软链、PM2 `123charts-web`、独立日志和 OpenResty vhost |
| Production API | Compose `123charts-production`：PostgreSQL、Auth、REST、私有 Storage、API gateway、worker |
| Staging | Compose `123charts-staging`：独立 Web、worker、数据库、文件卷、凭据、域名与端口 |

不复用 FermatMind 的数据库、账号、Redis、目录、密钥、队列或进程。API gateway 默认只绑定 loopback；跨节点访问前改成经核实的私网地址，并以安全组仅允许对应节点。数据库/Storage/Auth 不直接映射宿主端口；不暴露 Studio、Postgres 管理口。公开 API 仅通过单独 TLS vhost 开放 Auth/REST/Storage 路径。现有 OpenResty 在容器中时，Web 必须绑定容器可达的私网接口，不能假定容器的 127.0.0.1 就是宿主机。

## 固定来源与镜像

`self-hosted/upstream/` 保存官方 Supabase Docker 与 Kong override 的固定提交、MIT 许可和参考文件，出处见 `third_party/NOTICE.md`。`self-hosted/compose.yml` 是其最小业务裁剪，保留必要 Webhooks/角色初始化；禁用未使用的 Realtime、Edge Functions、Studio 和图片变换。不使用本地 CLI 栈上线。

镜像使用固定版本；Node 基础镜像另锁定 digest。正式交付的应用镜像必须记录不可变 digest，并按目标 Linux 架构构建。不能将 Mac 的 standalone/node_modules 直接复制到 Linux。生产服务器架构尚待核实，本机仅验证 Linux arm64；若目标为 amd64，须以 `--platform linux/amd64` 重建并重复 smoke。

## 配置与构建

1. 外置保存 `.env.production.example` / `.env.staging.example` 的填写副本，权限 0600。`node deploy/scripts/generate-credentials.mjs <新文件>` 可生成独立凭据，不覆盖已有文件、不输出密钥。每环境分别生成；JWT 到期前轮换。生产禁止邮件自动确认。
2. Web 与 worker 各自填写 `deploy/.env.runtime.example`（Staging 使用 `.env.staging.runtime.example`）：明确 `CHARTS_RUNTIME`、`CHARTS_LOCAL_PREVIEW=false`、内部数据库 origin（必须完全相同）、内网 Web 地址、SMTP、发信人、健康文件和 APP_URL。Web 使用 API 私网地址；同 Compose 的 worker 使用 `http://api-gw:8000`。SMTP 587 强制 STARTTLS，465 使用 `CHARTS_SMTP_SECURE=true`，不跳过证书校验。
3. 用提交后的干净源码本地构建：

   ```sh
   docker build -f deploy/Dockerfile --build-arg CHARTS_SOURCE_COMMIT="$(git rev-parse HEAD)" -t 123charts:<sha> .
   ```

   应用镜像包含 standalone Web、单文件 `worker.mjs`、SQL migrations 和 OFL 中文字体；`.dockerignore` 排除本地配置、数据、Git 与测试产物。主机调试也可执行 `CHARTS_BUILD_DIR=.next-production npm run build` 后 `node deploy/scripts/package-release.mjs`，此产物仅适用于构建主机的平台。
4. 未来传输镜像/产物时使用固定 SHA 与 checksum，不在服务器 git pull main 或临时 npm install。PM2 方案从目标 Linux 镜像提取 `/app` 到版本目录，使用 `deploy/pm2/ecosystem.config.cjs`；API 节点以 `app.compose.yml --profile worker` 启动 worker；Staging 同时启用 `web`、`worker` profile。设置 `CHARTS_APP_IMAGE` 为固定应用镜像、`CHARTS_RUNTIME_ENV_FILE` 为外置节点环境文件。
5. 在正式授权后、备份且暂停写入的前提下，启动独立 Supabase，再运行 `CHARTS_COMPOSE_ENV=<环境文件> node deploy/scripts/migrate.mjs`。迁移记录 checksum，已执行文件不改写；重复执行跳过。不要运行 local:setup/seed 向生产填演示数据。

## 资源、健康和日志

Compose 给各服务 CPU、内存、PID 和日志上限；这些是起始预算，必须先与既有负载合并评估。官方完整栈最低要求见 [自托管文档](https://supabase.com/docs/guides/self-hosting/docker)。不足时暂缓，不加服务器、不挤占 FermatMind。

- Web `/api/healthz` 检查进程存活；还需请求真实分类并确认有预期项目，不能只检查健康接口。
- Auth/Storage/Postgres/gateway 有独立健康检查。worker 仅在成功读取持久化队列后更新心跳，120 秒过期则不健康；任务有数据库 lease 和重试。
- Web 的 PM2 内存重启阈值 768 MB；PM2 本身不提供硬 CPU 隔离，需在现有主机资源管理中为该进程配置独立 cgroup 后才能准入。容器已有限制。
- Docker 日志每份 10 MB、保留 5 份；主机 PM2 日志示例为 `logrotate/123charts`。OpenResty 日志也必须加入现有日志轮转配置的独立条目。
- 本地与 Staging 持续 `noindex`、空 sitemap；生产仅符合资格的公开页索引。私有后台、草稿、分享报告保持 noindex。不要在代理层缓存带账号信息的 HTML。

## 备份、恢复与回滚

先暂停 Web 与 worker 写入，执行以下命令仅针对明确配置的独立 stack：

```sh
CHARTS_COMPOSE_ENV=<环境文件> CHARTS_WRITES_PAUSED=true node deploy/scripts/backup-restore.mjs backup <新的私有备份目录>
```

脚本暂停 API writer，保存完整 SQL、Storage 文件、数据库加密配置卷、业务数据指纹、ACL/RLS 权限清单和 SHA256 清单，然后恢复 API 服务。备份含账号及私有信息，权限 0700/0600；应加密后复制至经核实的异地独立备份位置，并配置保留期、监控与定期恢复演练。本轮未配置任何真实异地目的地，不声称具备已验证 RPO/RTO。

恢复只允许新建的 `123charts-restore-*` 隔离栈，校验镜像与 checksum；仅在全新隔离栈内以单事务恢复完整数据库对象；已有业务表、账号或文件则拒绝：

```sh
CHARTS_COMPOSE_ENV=<全新恢复栈环境文件> CHARTS_WRITES_PAUSED=true node deploy/scripts/backup-restore.mjs restore <备份目录>
```

恢复前清除新栈的默认授权，避免 Supabase 初始化授权扩大还原对象的权限；恢复后逐项核对数据与 ACL/RLS，通过后才启动 API。环境文件与原 JWT/数据库角色凭据须单独加密保管，恢复时使用对应原始凭据。

恢复失败时保持 writer 停止，禁止切流。复核账号、项目数量、业务字段及私有文件后才安排切换；不要把 SQL 直接覆盖运行中的生产库。应用回滚：暂停 worker、恢复上一版 Web release 软链/镜像与 worker 镜像，健康检查后恢复流量。扩展迁移保留；不自动逆向删除字段或回灌旧库。只在隔离恢复演练通过后决定数据恢复方案。

## 正式部署前仍需核实

三节点实时 CPU/内存/磁盘与保留余量；目标 CPU 架构、Node/PM2/Docker 版本；私网地址、独立端口与安全组；容器化 OpenResty 的连通性和 `nginx -t`；域名/TLS证书；独立 SMTP 的投递、退信及发信域配置；独立加密备份位置、留存和恢复时长。以上未核实前，状态只能是“部署配置已准备，尚未上线”。
