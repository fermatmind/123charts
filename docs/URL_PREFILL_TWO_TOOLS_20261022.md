# n8n / Activepieces：URL 自动预填实测

2026-10-22，基线 `98aa808`。仅本地开发和验证，不改 schema、认领或公开资料。

## 实测结果

从两个空白表单分别只输入 `https://n8n.io`、`https://activepieces.com`，未手填名称或简介。正常 worker 首次尝试完成，前端读回结果并自动保存为独立草稿。

| 工具 | 名称 | 简介来源 | 抓取最终地址 |
| --- | --- | --- | --- |
| n8n | n8n | 官网 Meta description | https://n8n.io/ |
| Activepieces | Activepieces | 官网 Meta description | https://www.activepieces.com/ |

原先确有两个名称问题：n8n 被识别成宣传标题，Activepieces 带上完整副标题与 HTML 实体。已修复为优先使用 `og:site_name` / `application-name`；没有站点名时，用实际网址的注册域名匹配标题中的品牌片段，再使用一般标题候选。不硬编码这两个工具的名称。

同时修复 Meta 属性中双引号内含撇号时的截断，以及数字 HTML 实体解码。所有预填仍是待用户确认的原文候选，不自动认证、翻译或发布。

资料对照：[n8n 官网](https://n8n.io/)、[Activepieces 官网](https://activepieces.com/)。没有将官网宣传数字或 Meta 自述标记为平台已核验事实。

## 重定向

通过真实抓取函数测试：

- `http://n8n.io` → `https://n8n.io/`
- `https://www.n8n.io` → `https://n8n.io/`
- `http://activepieces.com` → `https://www.activepieces.com/`
- `https://www.activepieces.com` → 原地址

没有更改私网、保留地址、IP 固定、TLS、逐跳校验、跳转次数、HTML 大小及超时规则。公共页中已保存的官网链接未修改。

## 失败与恢复

用本轮独立、不可解析的公共域名测试真实失败流程，worker 按现有策略尝试三次后进入 failed，记录 ENOTFOUND。未插入伪造的成功或失败状态。

发现失败后按钮仍显示禁用的“正在提取”，已修复为可用的“重新提取资料”。失败提示明确可以检查网址后重试或继续手填，并保留输入。实测手填按钮解除失败提示，已输入内容不丢失。

另实测修改官网 URL 后立即手动提取：和 900ms 延迟自动提取合并为一次请求，避免重复创建任务，随后正常取得 Activepieces 资料。失败状态的重试按钮可用已检查；没有重复触发已知不存在域名的同一失败操作。

## 验证

- `npx tsx --test tests/charts/safe-fetch.test.ts tests/charts/rules.test.ts`：21 项通过（包含私网、重定向、异常 DNS、大小限制和本轮名称/引号解析）。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`：通过。
- 实际浏览器自动预填、失败提示、继续手填、请求去重通过。
- 两个工具的 390×844 Chrome 手机视口无横向溢出；失败提示另在 1280px 桌面视口检查。未声称在实体手机测试。
- 受控重启已确认属于本项目的本地运行器，使 worker 加载修复；未重置数据库，未应用新 migration。

## 现有数据保持不变

逐行、逐字段比对本轮开始前快照：46 条项目、2 条认领、9 份申请/草稿全部不变。本轮发现名称问题时产生的两份临时测试草稿已按独立 ID 清理，不涉及原有记录。

最终仅新增以下两份独立测试草稿：均 initial、project_id=null、status=draft、submitted_at=null，未提交审核。

- n8n：http://127.0.0.1:3100/zh/submit?dataset=real&id=7c71a501-32ea-4918-bd55-c4456c6f5416
- Activepieces：http://127.0.0.1:3100/zh/submit?dataset=real&id=2cd64db7-2e15-47fb-b54b-fd165d040cab

草稿需本地 founder 测试账户；凭据在 `.local/accounts.json`，不在本记录复制。

截图与原始读回：

- `output/playwright/n8n-prefill-mobile.png`
- `output/playwright/activepieces-prefill-mobile.png`
- `output/playwright/prefill-failure-desktop.png`
- `output/playwright/two-tools-prefill-readback.json`
- `output/playwright/two-tools-redirects.json`

修改文件：`lib/charts/safe-fetch.ts`、`scripts/local/worker.ts`、`components/charts/discovery-submit.tsx`、`tests/charts/safe-fetch.test.ts` 及本记录。无 push、部署或生产数据操作。
