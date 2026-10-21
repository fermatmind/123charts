# 全站架构规范落地记录

唯一标准：仓库根目录 `123Charts_Website_Framework_V1_20261021.md`，原附件逐字复制。该标准明确：提交提供私有预览，基础审核通过后公开；部分关系待审不阻塞项目审核。

| 原有缺口 | 当前实现 |
| --- | --- |
| 公共和后台共用 catch-all、侧栏与客户端 | 物理路由组 `(public)` / `(dashboard)` / `(admin)`；服务端登录与管理权限布局；共享 Header 内账户菜单 |
| 页面直接读取基础表，缺少规范实体投影 | `products`、`competitor_relations`、`outbound_clicks`、`impressions` 复用现有 `charts_*` 基础表，不复制数据、不引入第二套 ORM |
| 分类只有通用筛选列表 | 四视图、紧凑筛选、持续免费与开源独立、目标选择器、零结果清除筛选 |
| 同行关系误作双向 | anchor 是目标网站，candidate 是提交项目，只发布已确认定向关系；允许被动目标资料 |
| 要求关系全部审核才通过项目 | 项目与关系独立审核，未确认关系不公开、不奖励；后续可单独确认或撤销 |
| 缓存没有实际标签读取链路 | 统一目录使用实际 tag；审核提交后 `revalidateTag`；持久化失效重试；提交版本隔离并发旧缓存；下架实时可见性校验 |
| 官网 GET 直接记点击 | GET 仅 302；主动客户端 POST 异步记录；事件 ID 重试去重、访客/项目/日估计；机器人、自测、自点排除 |
| 展示去重不区分展示来源 | 至少 50% 可见一秒；会话/项目/来源去重，数据库唯一键防并发重复 |
| 旧路径与新实体不一致 | canonical `/products/[slug]`；旧项目路径重定向；sitemap 与 llms.txt 使用同一公开资料与关系 |

数据库独立保存：`charts_projects.publication`、`charts_applications.status`、`charts_relations.status`、`charts_claims.state`。首次公开时间由数据库保护；修订待审保留原公开版；隐藏状态不会被修订审核自动恢复。公开投影不暴露管理身份、私人投稿和原始统计。

接口：`/api/v1/submissions`、`/api/v1/reviews/[id]/decision`、`/api/v1/events/impression`、`/api/v1/events/outbound`。现有 SDK/事务继续复用，旧接口兼容；OCR、截图上传和外部流量任务退出当前业务链。

本地验收包括真实 HTTP 状态流转与权限、两条浏览器闭环、桌面/手机截图、独立空库迁移和 SQL 权限检查。运行命令见 README。测试资料只使用独立虚构域名并清理；不会重置日常本地数据库。本轮不操作 GitHub、域名或服务器。
