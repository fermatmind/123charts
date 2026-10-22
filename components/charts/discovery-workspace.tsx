"use client";
import Link from "next/link";
import { useState } from "react";
import { useCharts, Empty, Status } from "./context";
export function DiscoveryDashboard({
  notificationsOnly = false,
  projectId,
}: {
  notificationsOnly?: boolean;
  projectId?: string;
}) {
  const { data, t, href, api } = useCharts();
  if (!data.user)
    return (
      <div className="discovery-page">
        <Empty title={t("Your workspace", "你的工作台")}>
          <Link className="button" href={href("/login")}>
            {t("Sign in", "登录")}
          </Link>
        </Empty>
      </div>
    );
  const events = data.events.filter(
    (e) => !e.excluded && (!projectId || e.project_id === projectId),
  );
  const outbound = events.filter((e) => e.kind === "outbound");
  const unique = new Set(
    outbound.map(
      (e) => e.project_id + e.visitor_id + e.created_at.slice(0, 10),
    ),
  );
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <div className="eyebrow">YOUR SPACE / 123CHARTS</div>
        <h1>{t("Your project, discovered.", "看见项目被发现的过程。")}</h1>
        <p>
          {t(
            "Manage facts, follow your review and see recorded discovery activity.",
            "维护资料，跟进审核，查看平台记录的真实发现行为。",
          )}
        </p>
      </div>
      {!notificationsOnly && (
        <>
          <p className="muted">
            {
              data.events.filter((e) => e.exclusion_reason === "ai_crawler")
                .length
            }{" "}
            {t(
              "identified AI crawler events (excluded from human discovery)",
              "条已识别 AI 抓取行为（不计入真人发现）",
            )}
          </p>
          <div className="discovery-facts">
            <div>
              <small>
                {t("RECORDED IN THE LAST 30 DAYS", "最近三十天记录")}
              </small>
              <h2>
                {events.filter((e) => e.kind === "impression").length}{" "}
                {t("impressions", "次展示")}
              </h2>
              <p>
                {events.filter((e) => e.kind === "project_view").length}{" "}
                {t("profile views", "次项目页浏览")} · {outbound.length}{" "}
                {t("outbound clicks", "次官网外跳")} · {unique.size}{" "}
                {t(
                  "visitor / project / day estimates",
                  "访客／项目／日去重估计",
                )}
              </p>
              <small>
                {data.events.filter((e) => e.excluded).length}{" "}
                {t(
                  "bot, self or test events excluded",
                  "条机器人、自测或内部行为已排除",
                )}
              </small>
            </div>
            <div>
              <small>{t("DISCOVERY SURFACES", "发现来源")}</small>
              {[...new Set(events.map((e) => e.surface))]
                .slice(0, 8)
                .map((surface) => (
                  <p key={surface}>
                    {surface} ·{" "}
                    {events.filter((e) => e.surface === surface).length}
                  </p>
                ))}
              <p>
                {t(
                  "Outbound clicks are not successful website loads, registrations or customers.",
                  "外跳不等于官网成功加载、注册或客户。",
                )}
              </p>
            </div>
          </div>
          <div className="section-heading">
            <h2>{t("Applications & updates", "申请与后续更新")}</h2>
            <Link className="button primary" href={href("/submit")}>
              {t("Submit a tool for free", "免费提交工具")}
            </Link>
          </div>
          {data.applications
            .filter(
              (a) =>
                a.owner_id === data.user?.id &&
                (!projectId || a.project_id === projectId),
            )
            .map((a) => (
              <div className="review-card" key={a.id}>
                <div className="row">
                  <h3>{a.draft.name || a.draft.website_url}</h3>
                  <Status value={a.status} />
                </div>
                <p>{a.feedback}</p>
                <p className="muted">
                  {a.draft.task} · {a.draft.peers.length} {t("peers", "个同行")}
                </p>
                <div className="row">
                  {["draft", "needs_info"].includes(a.status) && (
                    <Link className="button" href={href("/submit?id=" + a.id)}>
                      {t("Resume draft", "继续草稿")}
                    </Link>
                  )}
                  {a.project_id && (
                    <Link
                      className="button"
                      href={href(
                        "/products/" +
                          data.projects.find((p) => p.id === a.project_id)
                            ?.slug,
                      )}
                    >
                      {t("View profile", "查看档案")}
                    </Link>
                  )}
                  {data.reports
                    .filter((r) => r.application_id === a.id)
                    .map((r) => (
                      <Link
                        className="button"
                        key={r.id}
                        href={href("/reports/" + r.id)}
                      >
                        {t("Comparison shortlist", "同类对照清单")}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          <h2>{t("Claimed projects", "已认领项目")}</h2>
          {data.claims
            .filter(
              (c) =>
                c.owner_id === data.user?.id &&
                c.state === "approved" &&
                (!projectId || c.project_id === projectId),
            )
            .map((c) => {
              const p = [...data.projects, ...data.managedProjects].find(
                (p) => p.id === c.project_id,
              );
              return p ? (
                <div className="review-card" key={c.id}>
                  <strong>{p.name}</strong>
                  <p>
                    {t(
                      "Management identity verified. Updates do not require repeating the initial peer task.",
                      "管理身份已核实，后续更新无需重复首次同行任务。",
                    )}
                  </p>
                  <Link
                    className="button"
                    href={href("/submit?project=" + p.id)}
                  >
                    {t("Update profile & peers", "更新资料与同行")}
                  </Link>
                </div>
              ) : null;
            })}
          <h2>{t("Claims & free corrections", "认领与免费纠错")}</h2>
          {[...data.claims, ...data.corrections]
            .filter((c) => c.owner_id === data.user?.id)
            .map((c) => (
              <p key={c.id}>
                <Status value={c.state} />{" "}
                {c.feedback || t("Awaiting review", "等待审核")}
              </p>
            ))}
        </>
      )}
      <section>
        <h2>{t("Updates for you", "你的通知")}</h2>
        {data.notifications.length ? (
          data.notifications.map((n) => (
            <div className="review-card" key={n.id}>
              <Link href={href(n.href)}>
                <strong>{t(n.title_en, n.title_zh)}</strong>
              </Link>
              <p>{t(n.body_en, n.body_zh)}</p>
              {!n.seen && (
                <button
                  className="button ghost"
                  onClick={() =>
                    void api("notification", { id: n.id }).catch(() => {})
                  }
                >
                  {t("Mark read", "标为已读")}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="muted">
            {t(
              "Save a tool or follow a category to build your next visit.",
              "收藏工具或关注分类，为下次选择留下入口。",
            )}
          </p>
        )}
      </section>
    </div>
  );
}
export function DiscoveryFollowing({
  kind,
}: {
  kind?: "bookmark" | "following";
}) {
  const { data, t, href, api, locale } = useCharts();
  if (!data.user)
    return (
      <div className="discovery-page">
        <Empty title={t("Keep your shortlist", "保存候选清单")}>
          <Link className="button" href={href("/login")}>
            {t("Sign in", "登录")}
          </Link>
        </Empty>
      </div>
    );
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <h1>{t("Saved & following", "收藏与关注")}</h1>
        <p>
          {t(
            "Your tools, task categories and alternatives. Follow updates only when you choose.",
            "保存工具、任务分类和替代方案。由你选择是否订阅更新。",
          )}
        </p>
      </div>
      {data.follows
        .filter(
          (f) =>
            !kind ||
            (kind === "bookmark"
              ? f.kind === "bookmark"
              : f.kind !== "bookmark"),
        )
        .map((f) => {
          const p = data.projects.find((p) => p.id === f.target);
          const c = data.categories.find((c) => c.slug === f.target);
          return (
            <div className="review-card" key={f.kind + f.target}>
              <div className="row">
                <Link
                  href={href(
                    f.kind === "category"
                      ? "/categories/" + f.target
                      : f.kind === "alternatives"
                        ? "/alternatives/" + p?.slug
                        : "/products/" + p?.slug,
                  )}
                >
                  <strong>
                    {p?.name ||
                      (locale === "zh" ? c?.name_zh : c?.name_en) ||
                      t("Unavailable profile", "资料不可用")}
                  </strong>
                </Link>
                <span className="tag">
                  {f.kind === "alternatives"
                    ? t("Alternatives", "替代方案")
                    : f.kind === "category"
                      ? t("Category", "分类")
                      : f.kind === "bookmark"
                        ? t("Bookmark", "收藏")
                        : t("Project updates", "项目更新")}
                </span>
                <button
                  className="button ghost"
                  onClick={() =>
                    void api("follow", { ...f, remove: true }).catch(() => {})
                  }
                >
                  {t("Remove / unsubscribe", "移除／取消关注")}
                </button>
              </div>
              {f.kind !== "bookmark" && (
                <label>
                  <input
                    type="checkbox"
                    checked={f.email_enabled}
                    onChange={(e) =>
                      void api("follow", {
                        ...f,
                        email_enabled: e.target.checked,
                      }).catch(() => {})
                    }
                  />
                  {t(
                    "Optional email digest to local inbox",
                    "可选邮件摘要，送至本地收件箱",
                  )}
                </label>
              )}
            </div>
          );
        })}
      {!data.follows.length && (
        <p className="notice">
          {t(
            "No saved tools yet. Explore a category and save useful choices.",
            "还没有收藏，探索分类并保存有用的选择。",
          )}
        </p>
      )}
    </div>
  );
}
