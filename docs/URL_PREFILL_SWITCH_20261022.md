# 同一表单切换官网与抓取重试

2026-10-22；基线 `d7e9e41`。只修改本地表单预填逻辑，不修改数据库结构、抓取安全规则、认领或发布流程。

## 复现与修复

从空表单输入 n8n 官网，自动预填后改成 Activepieces：旧实现保留了非空的 n8n 名称和简介，形成官网与项目资料不匹配的草稿。原始读回见 `output/playwright/prefill-switch-before-fix.json`。

修复后的行为：

- 在当前表单中记录名称、英文简介及建议分类的自动来源。切换到另一个官网时，只清除这些仍未被用户编辑的自动字段，再读取新官网。
- 手填、JSON 导入、已有草稿的内容视为用户输入，保留并提示核对其是否适用于新官网。用户在请求期间修改或主动清空字段，返回结果也不会覆盖；分类同样受保护。
- 按当前官网和请求序号接收结果。旧官网、旧重试请求即使晚返回，也不能激活旧任务或回填资料；切换 A → B → A 仍拒绝原 A 请求。
- 自动提取与手动按钮共用启动逻辑。`www`、协议和路径等同一官网的变体沿用既有根域抓取语义，不清除字段或重复自动抓取。此身份键只用于界面关联，安全校验仍在服务端执行。
- 抓取或请求失败后提供重试与继续手填；改址时解除旧失败状态。

来源追踪只属于当前表单会话，不推断历史草稿中哪些文字由 AI 或人工填写。已有草稿和导入内容保留后需要用户核对，不会静默清空。Meta 候选仍需确认，不代表认领、核验或公开通过。

## 实际浏览器验证

使用本地 founder 测试账户和本轮新建的独立表单；真实调用本地接口及 worker。

| 路径 | 实测结果 |
| --- | --- |
| n8n 自动预填 → 同表单改成 Activepieces | 旧自动名称和简介立即清空，新结果为 Activepieces 及其官网 Meta 简介 |
| 改为不可解析公共域名 → 手填中英文简介 → 抓取失败 | worker 三次尝试后记录 ENOTFOUND；显示可用重试按钮，手填内容保留 |
| 上述失败后改为 Activepieces，立即手动提取 | 名称成功预填，手填中英文简介完全保留，旧失败提示消失 |
| n8n 响应晚于 Activepieces | 通过浏览器暂扣真实任务创建响应，等 Activepieces 预填完成后放行；页面仍为 Activepieces，简介不变 |
| 请求期间手填名称、中英文简介并选择分类 | 真实 n8n 任务返回后，保留手填值及 knowledge-search 分类 |
| 桌面与手机视口 | 1440×900、390×844 无页面横向溢出；手机端实际完成改址、重试与字段填写 |

延迟测试仅控制真实响应的交付时机，没有伪造任务或成功结果。对应 n8n 与 Activepieces 任务均由 worker 首次尝试完成。未在实体手机验证。

记录与截图：

- `output/playwright/prefill-switch-mobile-readback.log`
- `output/playwright/prefill-switch-failure.log`
- `output/playwright/prefill-switch-retry.log`
- `output/playwright/prefill-late-response.log`
- `output/playwright/prefill-manual-during-request.log`
- `output/playwright/prefill-retry-manual-mobile.png`
- `output/playwright/prefill-late-response-desktop.png`
- `output/playwright/prefill-switch-preservation.json`

## 检查和数据边界

- `npx tsx --test tests/charts/metadata-prefill.test.ts tests/charts/safe-fetch.test.ts tests/charts/rules.test.ts`：28 项通过，包含本轮 7 项字段来源、手填保护与请求时序测试，以及原有私网、重定向等检查。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`：通过。
- 对开始前快照逐行、逐字段比较：46 条项目、2 条认领、11 份申请/草稿完全不变。
- 清理本轮三份临时测试草稿；只保留一份独立 Activepieces 预填草稿：`394c0400-fb91-4517-a678-858d84dc8ec7`，`status=draft`、`project_id=null`、`submitted_at=null`。没有提交审核。
- 官网请求仅获取资料；所有任务、测试草稿和统计写入目标为本机 Supabase。未 push、未部署、未访问生产数据库。

本地预览：`http://127.0.0.1:3100/zh?dataset=real`。

保留的独立草稿：`http://127.0.0.1:3100/zh/submit?dataset=real&id=394c0400-fb91-4517-a678-858d84dc8ec7`，需本地 founder 测试账户。
