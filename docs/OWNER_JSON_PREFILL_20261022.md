# AI JSON 导入、刷新恢复与重新提取验证

2026-10-22；基线 `f1ad2f6`。使用两份全新独立草稿和页面真实文件上传入口，验证导入、保存、刷新、换址、重新提取。未发现本轮要求中的新覆盖问题，业务实现保持不变；仅补充回归测试与本记录。

JSON 是明确标注“仅本地测试”的模板格式样本，不宣称样本中的测试文字是 AI 已核实的产品事实。真实 n8n / Activepieces Meta 提取仍通过现有本地接口和 worker 完成，没有伪造任务结果。

## 实际浏览器结果

| 场景 | 结果 |
| --- | --- |
| 部分 JSON 导入中文简介、用途和属性 → 保存刷新 | 导入内容逐字恢复，未导入的 n8n 名称和英文简介仍属于自动字段 |
| 上述草稿切换为 Activepieces → 提取 → 再次主动提取 → 保存刷新 | 旧自动名称和英文简介立即清除，随后更新为 Activepieces；导入的中文简介、用途、unknown 价格、空语言数组和空限制保留 |
| 完整 JSON 导入名称、双语简介、用途、属性及来源条目 → 保存刷新 → 切换官网重新提取 → 再刷新 | 所有导入字段与 JSON 原值一致；自动字段记录中无旧 n8n 文字，导入字段不再被标记为自动 |
| 官网为 Activepieces 时，再次上传原 n8n JSON | 显示官网域名不匹配，拒绝导入，表单保持原值 |
| 桌面和手机 | 1440×900、390×844 无横向溢出；手机完成完整导入流程，未测试实体手机 |

导入内容和其来源属于用户输入，切换官网后按要求保留，仍须用户核对是否适用于新官网。保留旧 JSON 的来源链接不等于将它认定为新工具的事实来源。文件没有提供核实日期时保持空值，没有产生平台“已核验”状态。

## 检查与原有数据

- `npx tsx --test tests/charts/metadata-prefill.test.ts tests/charts/owner-profile.test.ts tests/charts/discovery.test.ts tests/charts/rules.test.ts`：32 项通过。新增部分/完整导入、刷新和提取覆盖回归；提取期间导入及显式空字段保护在单元测试验证，没有声称该时序已在浏览器执行。
- 增加 JSON 不得导入 `metadata_prefill` 内部来源标记的检查，沿用现有严格解析器，未更改权限。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`：通过。
- 开始前的 46 条项目、2 条认领、14 份申请/草稿逐行、逐字段不变。仅新增下列两份测试草稿，均 `status=draft`、`project_id=null`、`submitted_at=null`，没有提交审核或公开。
- 未推送、未部署、未修改生产配置或数据；没有数据库重建、迁移、服务重启或实际 AI 付费调用。

## 本地读回与证据

预览：`http://127.0.0.1:3100/zh?dataset=real`。草稿需本地 founder 测试账户：

- 部分导入：`http://127.0.0.1:3100/zh/submit?dataset=real&id=444a2975-889b-42ad-86c7-f57984a30646`
- 完整导入：`http://127.0.0.1:3100/zh/submit?dataset=real&id=468b5614-e16d-4814-a6c0-e8f39d4c8384`

样本与原始证据保存在本地忽略目录：

- `output/owner-profiles/prefill-import-partial-n8n.json`
- `output/owner-profiles/prefill-import-full-n8n.json`
- `output/playwright/prefill-json-partial.log`
- `output/playwright/prefill-json-full.log`
- `output/playwright/prefill-json-db-readback.json`
- `output/playwright/prefill-json-partial-desktop.png`
- `output/playwright/prefill-json-full-mobile.png`
