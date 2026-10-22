# 未认领项目的公开列表统一

预览：

- http://127.0.0.1:3100/zh?dataset=real
- http://127.0.0.1:3100/zh/categories/workflow-automation?dataset=real
- http://127.0.0.1:3100/zh/alternatives/activepieces?dataset=real

## 本轮修改

首页、分类与替代候选共用站点单元：未认领条目展示简介与正确官网入口，简介、替代、收藏仍为独立操作。首页紧凑入口增加“认领”，完整列表增加“认领补充”；链接携带claim意图进入现有项目认领说明。替代目标也提供认领入口。

未确认价格、未知语言不再逐条显示。已确认价格继续展示，已有特点、有效语言、许可证和真实使用条件可展开查看；已认领项目的已有资料默认展开。认领身份不等于字段已核验，价格仍读取原确认状态。替代页保留已审核的任务关系和当前排序。

只省略已知的占位文本和与简介完全重复的特点；部分未知但包含真实限制的句子仍保留。没有有效补充资料时不生成空面板。原始数据库记录、审核条件、首次公开时间、关系及收藏规则均未修改。

## 验证

- 既有导航用例通过：精确搜索、收藏增删/排序/刷新、独立官网直达、返回状态与稳定顺序。
- 品牌入口与新展示用例通过：三页认领入口、点击认领不产生官网统计、未认领默认收起参考资料、n8n真实试用与自部署限制及语言保留、英语替代页手机无溢出。
- 3项聚焦单元检查通过，含已知占位模板过滤以及“成本未知但可自部署”等真实条件保留。
- 桌面1440×900与手机390×844截图已实际查看。首页不同工具入口仍为桌面18个、手机7个。
- 截图：`output/playwright/listing-home-desktop.png`、`listing-home-mobile.png`、`listing-category-desktop.png`、`listing-alternatives-desktop.png`。

修改文件：`components/charts/navigation-ui.tsx`（共用站点、认领与参考资料组件）、`components/charts/discovery-views.tsx`（替代页组合）、`lib/charts/navigation.ts`（明确占位模板处理）、`app/globals.css`、`tests/charts/navigation.spec.ts`、`tests/charts/owner-profile.test.ts`及本文。

本轮只改前台呈现。复用127.0.0.1:3100服务及本地数据库；未新增表、执行迁移、改变公开资格或调用外部AI。未推送、未部署、未修改生产数据。

最终静态检查：`npm run build`、构建后顺序运行的`npm run typecheck`、`npm run lint`、`git diff --check`均通过；三个本地预览URL均返回200。
