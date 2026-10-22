# 123Charts software research catalog

已采集 50 类、1000 个候选项目，每类至少 5 个。**1000 是采集数量，不是深度研究完成数量。当前只有 3 个完成了官方资料实读与原创双语档案重写，997 个仍是质量不足的结构化草稿。** 功能标签、段落数、字数和 JSON 校验通过均不能证明内容准确、项目完整或具备 SEO/GEO 竞争力。

英文为主稿，中文根据同一篇主稿翻译。定位仍是面向国际开发者与用户的通用软件与 SaaS 目录，AI 工具只是其中一部分。

## 当前逐篇重写

| 档案                                                        | 本次实质补充                                                                                        | 研究状态                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [Zapier](projects/workflow-automation/zapier-054d95f6.json) | 触发/动作实例、字段映射、轮询延迟、免费与试用、任务费率算例、失败重放、双向同步边界                 | 官方资料实读；待独立内容审核与实测 |
| [n8n](projects/workflow-automation/n8n-io-88ed6a00.json)    | 数据项模型、表达式/代码、部署责任、Community 功能边界、执行计费、固定样例、错误流程、许可及嵌入限制 | 官方资料实读；待独立内容审核与实测 |
| [Make](projects/workflow-automation/make-021a1507.json)     | bundles/operations/credits、迭代聚合、顺序路由、费用算例、调度、未完成执行、跳过与回滚、HTTP 条件   | 官方资料实读；待独立内容审核与实测 |

`research_status: primary_source_researched` 表示已实读主要官方资料并逐篇编写，不表示独立审稿通过或实际使用测评。`official_check: documentation_reviewed` 只表示文档核对。所有项目仍为 `draft`。没有给未知的定价、许可证、地区、界面语言或替代关系补造答案。

每篇的 `description_en/zh` 是产品概述；**完整长文在同一 JSON 的 `profile.sections`**，按问题组织英文及对应中文正文。`source_refs` 连接到同文件的 `sources`，每项含实际 URL、读取时间、读取片段摘要哈希及原创研究笔记。`evidence_type` 区分文档事实、建议、假设算例；`research_gaps` 明列未核项。旧的竞品来源只作为发现记录保留，已被官方正文替代。没有另建一份正文权威。

本轮具体修正：Zapier 旧稿的“无试用”与官网当前试用说明冲突；原先的通用“API 管理、版本控制”标签不足以描述实际 Zap 工作流。n8n 不能笼统写成仅浏览器云服务，也不能把 fair-code 误当宽松开源；Make 不能把成功状态当作所有输入都处理成功。这些问题需要逐项实读，无法靠扩写模板修复。

```text
data/catalog/
  categories.json                  # 分类名称与发现来源
  projects/<category>/<slug>.json   # 唯一项目档案
  feature-glossary.json             # 原创术语解释与中文词表
  index.json                       # 只列文件位置；不复制正文
  collection.json                  # 实际数量与分类覆盖
  evidence/                        # 实际读取记录与缺口
```

未重写的 997 个档案主要依赖第三方标签和模板化解释，其中文也未逐篇编辑。一般功能定义不能证明产品实际实现、套餐范围或可用条件。3 个会议工具虽曾额外读取竞品概述，仍不计入官方深研数量。客户采用、节时、可靠性、评分和收益没有实测依据，不能包装成评测结论。

初始候选来自实际读取的 SaaSworthy 页面；SaaSHub 用来研究详情页的职责和信息缺口。深研正文以产品官网、帮助文档、定价及许可说明为依据，原创组织事实、实例和选型判断。没有复制竞品文章、代码、图片、Logo、评论、评分、排名或数据库结构。`read_at` 是本次研究读取时间，公共网页工具可能使用缓存，不表示厂商更新时间或购买时的即时条件。读取到的原始工具片段留在忽略目录 `.scratch/deep-research/`；提交中的研究笔记和来源链接可用于重新核查，片段哈希本身不证明主张正确。

## SEO、GEO 与可读性的边界

每篇准备原创双语标题、摘要及选型问题；正文按实际用户问题给出可单独理解的答案，把价格与使用条件放在一起，并提供可追溯的来源。没有把无依据的最高级、评分、所谓“实测节省”或关键词重复当优化。查询意图为编辑判断，未测搜索量、排名或 AI 引用率。

Google 的[以用户为先内容指导](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)强调原创价值、可信来源和完整回答；[AI 搜索指导](https://developers.google.com/search/docs/appearance/ai-features)说明没有额外的 AI 专用优化要求，也不保证抓取、收录或展示。后续公开页需把正文及来源呈现为可读文本，并让结构化数据与可见内容一致。本次未实现公开 HTML、JSON-LD、canonical、hreflang 或 sitemap，不能据此声称已完成线上 SEO/GEO。

同一注册域名只保留一个主档案；跨类只记录 `secondary_categories`。这一保守去重方式可能合并同一厂商旗下多个产品，避免用镜像、子域名和同站不同路径凑数量。分类顺序不代表热度或推荐名次。

这些是**待审资料文件**。现有应用只开放 3 类，现有投稿及 owner-profile 导入也有各自契约；新目录不是它们的直接输入。此批不修改数据库、公开投影、审核权限、运行时分类、sitemap 或部署。没有把第三方记录当作官网核验或公开收录。文件结构方便程序读取；上线后供 AI 抓取的公开 HTML/JSON-LD 仍属于后续接入。

离线重建与验证（在已安装仓库 Node 依赖的环境运行）：

```bash
python3 -m unittest discover -s scripts/catalog -p 'test_*.py'
node scripts/catalog/validate.mjs
git diff --check
```

工具：`collect_software.py` 支持在来源允许访问时低频读取公开 HTML，并检查 robots；遇到 403/429 会停下。`import_browser_research.py` 只读取本地保存的公开网页阅读结果。已有逐篇研究后，批量 materialize 会在任何写入或删除之前停止，避免重建覆盖正文；继续编辑原项目 JSON。原始网页和中间记录保存在被 Git 忽略的 `.scratch/`，不随资料分支发布。

校验器只检查结构、来源引用、研究进度计数和状态兼容性，不会把段落、字数或来源数量作为内容质量验收。当前抽查与本轮修订记录见 [content-revision-20261022.json](evidence/content-revision-20261022.json)。
