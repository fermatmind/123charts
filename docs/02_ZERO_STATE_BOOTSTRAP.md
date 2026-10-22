# 本地安装、初始化与预览

本说明适用于当前 123Charts 代码，不使用历史 Day 0 脚手架限制。所有测试写入只落在本机，生产部署不在本说明范围。

## 从新地址开始

1. 安装 Git、Node.js 20.11+（建议 Node 24，`nvm install && nvm use` 读取 `.nvmrc`）与 Docker Desktop，或本机 Linux Docker Engine。原生 Windows 启动/进程停止未验证，Windows 请使用 WSL2 与 Docker Desktop 集成。
2. 确认 `node --version`、`npm --version`、`docker info` 正常。Docker 必须使用本机 Unix socket；脚本拒绝远程 Docker。首次需要联网下载 npm 包与 Supabase 镜像，安装耗时取决于网络。
3. 执行：

   ```bash
   git clone https://github.com/fermatmind/123charts.git
   cd 123charts
   npm ci
   npm run local:setup
   npm run dev:local
   ```

   已配置 GitHub SSH 的用户也可以使用 `git@github.com:fermatmind/123charts.git` 克隆。目录可自行选择，不依赖开发者 Desktop 路径、云凭据或相邻仓库。

4. `local:setup` 执行全部迁移，生成 `.env.local`、`.local/accounts.json` 和本地样本；这些文件不提交 Git。无需手动填写 Supabase key。出现 `Ready` 后再启动 Web/worker；首次页面编译需等待，服务默认在 `127.0.0.1:3100`。

## 本地入口

| 入口 | 默认地址或文件 |
| --- | --- |
| 英文首页 | http://127.0.0.1:3100/en?dataset=real |
| 中文首页 | http://127.0.0.1:3100/zh?dataset=real |
| 虚构演示 | http://127.0.0.1:3100/zh?dataset=demo |
| 登录 | http://127.0.0.1:3100/zh/login |
| 工作台 / 审核 | `/zh/dashboard` / `/zh/admin` |
| 普通用户 / 管理员 / 其他用户 | `.local/accounts.json` 的 `founder` / `admin` / `other`；密码随机生成，仅在本机查看 |
| 邮件收件箱 | http://127.0.0.1:54324（邮件截留在本机） |
| Supabase Studio | http://127.0.0.1:54323 |
| API / PostgreSQL / SMTP | `127.0.0.1:54321` / `54322` / `54325` |

real 为平台整理的真实工具简介和官网；demo 为明确标注的虚构案例。首次初始化创建用于本机体验的账号与审核示例，不代表真实项目方入驻。官网提取需要外网；提取失败可以继续手填或导入 AI JSON。

## 再次启动和停止

- 停止过服务后执行 `npm run dev:local`，使用同一目录和配置，恢复原数据库与账号并执行新增迁移；不要同时启动两个 Web/worker。
- 数据库重新绑定后，脚本只重连当前项目的 Auth、REST、Storage 与元数据服务，等 Auth 和资料接口就绪后才启动 Web/worker，避免首次登录命中过期数据库连接。
- `Ctrl+C` 停止本次 Web/worker，数据库仍运行。`npm run local:stop` 停止当前目录所属的 Web/worker 和 Supabase，保留数据库及存储卷。
- 再次 `npm run local:setup` 不 reset 数据库，已有项目和草稿保留；样本修订只补充缺失项。不要使用 `supabase db reset`、删除命名卷或 Docker 全量清理来解决启动问题。
- `.env.local` / `.local/accounts.json` 是当前实例的本地状态，不要复制到另一实例、公开粘贴或提交。丢失账号密码后不要用重复 setup 期望重置已有用户密码。

## 同一台电脑运行第二份克隆

默认 `project_id` 为 `123charts-local`，同一 Docker 中不能由多个目录共同使用。脚本发现已有容器属于另一目录时，会在启动/迁移/填充样本前拒绝，停止命令也不接管另一份实例。

新克隆首次初始化前，编辑其 `supabase/config.toml`：

- 设置独立名称，例如 `project_id = "123charts-sandbox"`。
- 将该文件中的 `54320`–`54329` 端口改成空闲的另一组，例如 `55320`–`55329`，包括 API、DB、shadow、Studio 和本地邮件/SMTP。
- 将 `[auth]` 的 `site_url` 改为 `http://127.0.0.1:3101` 等空闲的 Web 端口。Web、APP_URL、SMTP 及容器名均读取此配置，不需要改代码。
- 执行 `npm run local:setup` 后再启动。此实例使用独立命名卷、账号、网络和环境文件，不共享默认实例数据。

首次确定实例后保持这份配置；不要在有真实本地工作数据时随意切换 project_id。已有 `.env.local` 与配置端口不一致会明确报错，不自动覆盖；新建空克隆用于另一组配置更安全。

## 常见失败

- **Docker 未就绪**：先打开 Docker Desktop，等待 `docker info` 成功，再重试同一命令。Linux 手动启动 Docker；不要切到远程 context。
- **项目属于其他目录**：回到原目录，或对新克隆设置独立 project_id/端口；不要停止来源不明的服务或 reset 原数据库。
- **端口已占用**：保留现有服务，按上节设置空闲端口。Web 端口冲突会在启动 worker 前报错。
- **旧环境或远程数据库**：不要复制生产 `.env`；脚本在初始化前拒绝远程地址、部署运行模式和不匹配端口。
- **镜像或 npm 下载失败**：检查网络与 Docker 磁盘，按原命令重试；不要用 `npm audit fix --force` 改动依赖大版本来修复安装。
- **页面正在编译**：保持运行终端，等待 Next.js `Ready`，再访问 `/en` 或 `/zh`。检查终端错误，不把空页面当初始化成功。

## 聚焦验证

先用 `Ctrl+C` 停止当前目录的 Web/worker，再构建；开发与构建默认共用 `.next`，不要并行运行。数据库不必停止。

```bash
npm run test:unit
npm run lint
npm run typecheck
npm run build
```

单元测试不连接运行数据库。`test:charts` 和 `test:browser` 包含写入型闭环，只在独立可丢弃实例中运行，需实例 Web/worker 已启动及本机 Chrome 可用；自定义端口时，例如：

```bash
CHARTS_TEST_BASE_URL=http://127.0.0.1:3101 npm run test:browser
```

`npm run test:db:charts` 从当前 project_id 定位容器，只创建并清理临时迁移测试库，不 reset 运行数据库。`db:types` 会重写类型文件；`format:check` 是维护检查，均不属于首次启动的必需步骤。部署模板见 `deploy/README.md`，不要把本地测试栈直接暴露上线。
