# Aider URL 预填：本地修复与验收

日期：2026-10-22。本轮仅修改抓取实现及聚焦测试，不改数据库 schema、认领、审核或公开规则。

## 根因证据

- 本机系统 DNS 服务器为 `198.18.0.1`；`dns.lookup('aider.chat', {all:true})` 返回 `198.18.1.95`。
- 普通 `resolve4` 和指定公共 DNS 的 UDP 查询仍返回此代理虚拟地址；AAAA 查询也出现本地代理 ULA 地址。
- `198.18.0.0/15` 原本就在安全阻止列表中；原检查正确拒绝它。
- 以固定公网 IP 连接并保持 TLS 主机校验的 HTTPS DNS 查询，得到 Aider 的真实公网 A 记录 `185.199.108.153` 等。网站 HTTP 请求固定连接这些通过校验的地址后可取得 HTML。

因此修复解析路径，不放行代理虚拟地址，也不取消地址校验。

## 实现

`lib/charts/safe-fetch.ts`：

- 普通系统 DNS 结果继续使用原地址检查和连接 IP 固定方式。
- 仅当系统结果全部为 `198.18.0.0/15` IPv4 虚拟地址时，使用固定 `dns.google` HTTPS 解析入口、固定公网 bootstrap 地址 `8.8.8.8`，保留 TLS 证书及主机校验。
- 分别读取 A/AAAA，检查 DNS 状态、问题名称/类型及结果格式，再对所有返回地址执行原私网/保留地址检查。DNS 失败、私网、混合地址或异常响应不进入网站请求。
- IP 字面量直接检查；不会把 `https://198.18.1.95` 当作域名交给公共 DNS。
- 公共解析入口不跟随重定向，并设置 8 秒空闲超时、64 KB 响应上限。目标网站仍保留逐跳重新解析/检查、最多三次重定向、512 KB HTML 上限及超时。
- 超限立即拒绝，避免流结束与 socket error 的先后顺序导致截断内容被误当成功。
- Aider 页面没有 description Meta 标签。优先使用 Meta；缺失时仅取 H1 后的真实介绍段落，排除脚本、模板、页脚等内容。结果标记 `description_source=page_intro`，不生成中文翻译、不推断价格或核验状态。
- 支持标题中常见的空格连字符分隔，名称提取为 `Aider`。

固定解析入口规则参考 [Google 公共 DNS JSON API](https://developers.google.com/speed/public-dns/docs/doh/json)；这只是代理虚拟 DNS 场景的解析依赖，未将其作为产品资料核验来源。

## 实际验证

- `npx tsx --test tests/charts/safe-fetch.test.ts tests/charts/rules.test.ts`：19 项通过。包含正常 DNS、虚拟 DNS、私网/混合/映射 IPv6、恶意 DNS 答案、解析器重定向、目标私网重定向、公共重定向、跳转上限、HTML 类型/大小和缺少 Meta 的真实段落读取。
- `npm run lint`、`npm run typecheck`、`npm run build`、`git diff --check`：通过。
- `safeHtml('https://aider.chat')` 实际返回 HTML，名称 Aider，简介来自官网原文段落。
- `safeHtml('http://aider.chat')` 实际跟随公开跳转到 `https://aider.chat/`，正常取得资料。
- 已确认并重启本项目本地运行器，worker 加载修复；没有重置数据库。
- 390×844 Chrome 手机视口：新建空白表单，只输入 `https://aider.chat`，未手填名称/简介，worker 完成后自动显示 Aider 和英文原文，无横向溢出。未声称在真实手机设备测试。
- 对应 worker 任务 `a451c7c0-4353-4c63-bd85-11afb73b1426`：done、首次尝试成功、error=null、description_source=page_intro。本次单条任务记录耗时 650ms，不作为性能承诺。

## 数据边界与预览

数据库逐行比对导入前快照：原有 46 条项目、2 条认领及 8 份申请/草稿全部字段保持不变。测试新增一份独立的 initial 草稿，project_id=null、status=draft，未提交或发布。上轮 Aider JSON 草稿与认领记录未改动。

- 正常预览：http://127.0.0.1:3100/zh?dataset=real
- 独立预填测试草稿：http://127.0.0.1:3100/zh/submit?dataset=real&id=d8aec08b-293a-4741-b80d-f853fcc14ddc
- 草稿需使用本地 founder 测试账户；凭据只保存在 `.local/accounts.json`。
- 截图：`output/playwright/aider-url-prefill-mobile.png`
- worker 与数据库读回：`output/playwright/aider-meta-fix-readback.json`

仅本地修改，无 push、部署或生产数据操作。外部解析服务不可用时仍拒绝抓取并提供手动填写；不会为取得资料而放松私网安全校验。
