# 刷新恢复后的官网预填与手填保护

2026-10-22；基线 `73b7289`。仅本地修改和独立草稿验证。本记录补充 `URL_PREFILL_SWITCH_20261022.md` 中原先仅在表单会话内保存来源的限制。

## 复现与修改

实际复现：n8n 自动预填、手填中文简介、保存并刷新后，切换为 Activepieces，旧 n8n 名称和英文简介没有清除。此前内存中的字段来源无法随刷新恢复。

现在随申请的私有 `draft` JSON 保存可选 `metadata_prefill`：格式版本、官网身份、自动字段及原值、用户编辑标记。保存和恢复使用同一校验规则；无需新表、migration 或回填历史数据。它仅控制私有表单合并，不表示核验、认领或公开资格。

- 刷新后恢复自动字段来源，切换官网时清除匹配的旧自动资料，再读取新官网。
- 保留手填、导入内容及主动清空字段；自动提取和语言补齐都不能覆盖这些标记。
- 兼容既有服务端另一语言简介补齐，同时记录自动复制的来源，防止该副本刷新后残留。复制原文不是翻译或独立核验。
- 历史草稿没有来源记录时保留原文，不能仅凭文字相同推断来源。切换提示明确要求核对这些内容；本轮不回写历史草稿。
- 公开项目编辑入口排除该私有字段。匿名公开 bootstrap 实测不含申请及 `metadata_prefill`。

## 实际验证

两份全新独立草稿，真实调用本地接口和 worker，没有伪造提取结果：

| 场景 | 结果 |
| --- | --- |
| 纯自动 n8n → 保存 → 刷新 → Activepieces → 保存 → 再刷新 | 旧名称及两种语言位置的自动文本立即清除；最终均为 Activepieces 当前资料，无 n8n 残留 |
| 自动名称＋手填中英文简介及分类 → 保存 → 刷新 → 切换官网 → 再刷新 | 名称更新为 Activepieces；手填简介和 knowledge-search 分类保持原值 |
| 主动清空英文简介 → 保存 → 刷新并等待新提取 | 保持空值，既有语言补齐和新提取均未恢复它；测试后恢复本轮手填测试文本 |
| 桌面和手机 | 1440×900、390×844 无横向溢出；手机实际完成恢复、切换和手填保护验证，未测试实体手机 |

`npx tsx --test tests/charts/metadata-prefill.test.ts tests/charts/owner-profile.test.ts tests/charts/discovery.test.ts tests/charts/rules.test.ts`：29 项通过。`npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check` 通过。

## 数据保持与本地读回

与开始前快照逐行、逐字段比较：46 条项目、2 条认领、12 份原有申请/草稿完全不变。删除本轮问题复现用的临时草稿，仅保留两份新的验证草稿，均 `status=draft`、`project_id=null`、`submitted_at=null`，未提交审核：

- 纯自动：`http://127.0.0.1:3100/zh/submit?dataset=real&id=fe2f321c-5ed0-470b-b172-6bde23282ae4`
- 混合手填：`http://127.0.0.1:3100/zh/submit?dataset=real&id=c96682d4-a973-44b6-b854-33917855841e`

需本地 founder 测试账户。运行中的预览仍为 `http://127.0.0.1:3100/zh?dataset=real`。未 push、未部署、未修改生产配置或数据，未重启或重置本地数据库。

原始证据与截图：

- `output/playwright/prefill-reload-before-fix.log`
- `output/playwright/prefill-reload-auto.log`
- `output/playwright/prefill-reload-manual.log`
- `output/playwright/prefill-reload-db-readback.json`
- `output/playwright/prefill-reload-preservation.json`
- `output/playwright/prefill-reload-auto-desktop.png`
- `output/playwright/prefill-reload-manual-mobile.png`
