# 简介与官网基础收录，认领后补充资料

本轮按最新用户决定完成本地闭环，预览：

- 项目示例：http://127.0.0.1:3100/zh/products/n8n?dataset=real#owner-claim
- 首页：http://127.0.0.1:3100/zh?dataset=real

## 交付

平台维护项目名称、分类、简短用途介绍和官网链接即可形成基础档案。价格、语言、特点、使用条件等扩展资料由项目方认领后补充；已有资料保留在可展开的参考区，不删除、不自动改称项目方提供。

- 项目页增加认领/更新入口和中英文AI核实提示词，提示词自动带入项目名称与正确官网。
- 可复制到用户自己的联网AI工具；无法读取的信息必须保持未知。当前没有调用付费模型或外部AI服务。
- 已通过认领的维护表单支持上传JSON或粘贴JSON，项目方逐项确认后导入现有草稿。
- 导入限定资料字段并匹配官网域名，拒绝身份、公开状态、核验标识、项目ID、名次和同行关系等越界字段。
- 来源URL、读取日期与依据随申请JSON草稿保存，运营审核可查看；不自动设为独立核验，也不公开私人申请材料。
- 未通过认领的既有项目更新页面明确提示认领，且不触发草稿自动保存或元数据任务；服务端仍使用原认领权限。
- 修复保存中的旧草稿与新导入内容的并发问题，最新编辑继续排队保存。新增验证检查只产生一个更新草稿。
- 简介收录卡使用项目简介与官网引导，不要求生成价格结论。
- 当前已公开、待审核、关系及认领状态保持分离。首次主动投稿的同行要求未改。

## 数据与实现

无新增数据库表。`owner_sources`是现有申请JSON草稿中的可选字段。增量迁移`047_owner_profile_completion.sql`已仅应用到本地数据库：允许已认领项目逐步完善扩展字段，保留初次投稿、事务审核、身份权限、价格确认、关系和首次公开时间规则。

涉及的主要文件：

- `lib/charts/owner-profile.ts`：提示词、JSON字段和来源校验。
- `components/charts/owner-profile-assist.tsx`：复制、上传、粘贴与确认导入。
- `components/charts/discovery-views.tsx`：基础档案、认领入口和参考资料。
- `components/charts/discovery-submit.tsx`：权限前置、导入草稿、并发保存。
- `components/charts/discovery-admin.tsx`：项目方依据展示。
- `lib/charts/types.ts`、`lib/charts/rules.ts`：可选来源字段。
- `lib/charts/discovery.ts`、`app/api/charts/[...path]/route.ts`：基础公开条件及运营更新校验。
- `app/api/charts/card/[id]/route.tsx`、`app/globals.css`：简介分享与样式。
- `supabase/migrations/047_owner_profile_completion.sql`：渐进资料补充。
- `tests/charts/owner-profile.test.ts`、`tests/charts/discovery.test.ts`、`tests/charts/navigation.spec.ts`：对应单元和浏览器验证。
- 根架构说明和`AGENTS.md`：当前资料分工。

## 已实际验证

- 9项聚焦单元检查通过：越界字段、错域名、非法来源链接、大小限制、基础公开与未知状态等。
- 独立本地DEMO浏览器闭环通过：管理员公开仅有简介与官网的基础档案 → 未认领用户被拦截 → 已认领用户上传JSON并确认 → 来源持久化到唯一更新草稿 → 审核前旧版在线 → 提交并审核后更新 → 价格保持未核验、未知语言无需补造。演示认领是测试夹具，不声称测试了真实企业身份核实。
- 复制提示词、游客仅有提示词而没有导入写入入口已验证。
- 既有导航/收藏/搜索/官网直达回归通过；品牌入口回归通过。
- 框架集成回归通过：审核先行、单向关系、修订持续在线、缓存刷新与同步退出。
- 桌面与390px手机项目提示词页面已查看。截图位于`output/playwright/owner-prompt-real-desktop.png`和`owner-prompt-real-mobile.png`；`owner-ai-import.png`为已清理的独立DEMO申请截图。
- 浏览器截图使用正常输入光标模式，避免截图工具在水合前注入隐藏光标样式造成假水合告警。

本地数据库仍为127.0.0.1:54321，服务仍为127.0.0.1:3100。原真实项目资料未批量变更；测试项目、认领与申请已清理。没有向第三方AI发送资料，没有推送、部署或修改生产数据。

最终静态验收：`npm run build`、构建后顺序运行的`npm run typecheck`、`npm run lint`与`git diff --check`均通过。移动端实测document宽度390px，与视口一致。AI联网核实本身未由本站执行；导入与审批验证使用明确标注的合成DEMO资料，不能视为真实项目事实核验。
