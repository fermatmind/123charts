# 123Charts software research catalog

本批已采集 50 个软件与 SaaS 分类、1000 个独立项目；每类至少 5 个项目，每个项目一个 JSON，共 10,857 条第三方功能条目。英文是内容原文，中文是同一组结构化事实的本地化草稿。AI 工具只占分类的一部分，定位是面向国际开发者与用户的通用软件发现目录。

```text
data/catalog/
  categories.json                  # 分类名称与发现来源
  projects/<category>/<slug>.json   # 唯一项目档案
  feature-glossary.json             # 原创术语解释与中文词表
  index.json                       # 只列文件位置；不复制正文
  collection.json                  # 实际数量与分类覆盖
  evidence/                        # 实际读取记录与缺口
```

每个档案提供分段英文介绍、对应中文介绍、逐项功能、典型任务、运行平台、组织规模、API、支持渠道、定价快照、FAQ、来源和待核事项。一般功能解释帮助理解术语，不能当作具体产品的套餐范围或实现细节。典型任务标记为推断；客户实际采用情况、许可证、支持语言、限制和替代关系没有依据时保留未知。3 个会议工具额外实读了产品概述，并保存字段级摘编依据；其余档案是结构化采集与双语综合草稿，仍需逐项内容审核。

SaaSHub 的详情结构用于研究页面职责；本批逐项事实来自实际读取的 SaaSworthy 公开页面。没有复制竞品文章、代码、图片、Logo、评论、评分、排名或数据库结构。名称、官网和功能等事实保留逐项来源；介绍和术语解释采用本批自己的表达。`read_at` 是读取时间，网页阅读工具可能使用缓存，它不表示竞品更新时间或官网核实时间。

同一注册域名只保留一个主档案；跨类只记录 `secondary_categories`。这一保守去重方式可能合并同一厂商旗下多个产品，避免用镜像、子域名和同站不同路径凑数量。分类顺序不代表热度或推荐名次。

这些是**待审资料文件**。现有应用只开放 3 类，现有投稿及 owner-profile 导入也有各自契约；新目录不是它们的直接输入。此批不修改数据库、公开投影、审核权限、运行时分类、sitemap 或部署。没有把第三方记录当作官网核验或公开收录。文件结构方便程序读取；上线后供 AI 抓取的公开 HTML/JSON-LD 仍属于后续接入。

离线重建与验证（在已安装仓库 Node 依赖的环境运行）：

```bash
python3 -m unittest discover -s scripts/catalog -p 'test_*.py'
node scripts/catalog/validate.mjs
git diff --check
```

工具：`collect_software.py` 支持在来源允许访问时低频读取公开 HTML，并检查 robots；遇到 403/429 会停下。`import_browser_research.py` 只读取本地保存的公开网页阅读结果。原始网页和中间记录保存在被 Git 忽略的 `.scratch/`，不随资料分支发布。
