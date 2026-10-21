"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowRight,
  Plus,
  FileText,
  ExternalLink,
  ArrowUpRight,
  Bookmark,
  Bell,
  Check,
  LogOut,
  Share2,
  Download,
  Eye,
  MousePointer2,
} from "lucide-react";
import type { ReportPeer, Report } from "@/lib/charts/types";
import {
  useCharts,
  Status,
  Empty,
  Avatar,
  Field,
  numberFormat,
} from "./context";
export function AuthPage() {
  const { data, t, href, api, busy, notify } = useCharts(),
    router = useRouter(),
    params = useSearchParams();
  const [signup, setSignup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  if (data.user)
    return (
      <Empty title={t("You are signed in", "已登录")}>
        <Link className="button primary" href={href("/dashboard")}>
          {t("Open workspace", "进入工作台")}
        </Link>
      </Empty>
    );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api<{ confirmationRequired?: boolean }>("auth", {
        action: signup ? "signup" : "signin",
        email,
        password,
      });
      if (r.confirmationRequired) {
        notify(
          t(
            "Check your local email inbox to confirm your account.",
            "请在本地邮件收件箱中确认账户。",
          ),
        );
        return;
      }
      const next = params.get("next");
      router.push(
        href(
          next && ["submit", "following", "admin"].includes(next)
            ? `/${next}`
            : "/dashboard",
        ),
      );
      router.refresh();
    } catch {}
  }
  return (
    <section className="panel auth-panel">
      <div className="eyebrow">
        123Charts / {t("Your workspace", "你的工作空间")}
      </div>
      <h1 style={{ marginTop: 15 }}>
        {signup
          ? t("Create a free account", "创建免费账户")
          : t("Welcome back.", "欢迎回来。")}
      </h1>
      <p>
        {t(
          "Save your research, contribute useful evidence and see what your project receives.",
          "保存研究、贡献有效证据，并查看项目获得的实际回报。",
        )}
      </p>
      <form onSubmit={submit}>
        <Field label={t("Email address", "邮箱地址")}>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t("Password", "密码")}>
          <input
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={8}
            maxLength={128}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button className="button primary" disabled={busy}>
          {signup ? t("Create account", "创建账户") : t("Sign in", "登录")}
          <ArrowRight size={13} />
        </button>
      </form>
      <button
        className="button ghost"
        style={{ width: "100%", marginTop: 17 }}
        onClick={() => setSignup((x) => !x)}
      >
        {signup
          ? t("Already have an account? Sign in", "已有账户？登录")
          : t(
              "New to 123Charts? Create a free account",
              "第一次使用？免费注册",
            )}
      </button>
    </section>
  );
}
export function Dashboard({
  notificationsOnly = false,
}: {
  notificationsOnly?: boolean;
}) {
  const { data, t, href, api, busy, locale } = useCharts();
  if (!data.user)
    return (
      <Empty title={t("Your project workspace", "你的项目工作台")}>
        <p>
          {t(
            "Sign in to view applications, peer reports and effect records.",
            "登录后查看申请、同行报告与效果记录。",
          )}
        </p>
        <Link className="button primary" href={href("/login")}>
          {t("Sign in", "登录")}
        </Link>
      </Empty>
    );
  const mine = data.applications.filter((a) => a.owner_id === data.user!.id),
    reports = data.reports.filter((r) => r.owner_id === data.user!.id),
    claims = data.claims.filter(
      (c) => c.owner_id === data.user!.id && c.state === "approved",
    );
  const valid = data.events.filter((e) => !e.excluded),
    rawClicks = data.events.filter((e) => e.kind === "outbound"),
    validClicks = valid.filter((e) => e.kind === "outbound"),
    uniqueClicks = new Set(
      validClicks.map(
        (e) => `${e.visitor_id}:${e.project_id}:${e.created_at.slice(0, 10)}`,
      ),
    );
  const week = new Set(
    validClicks
      .filter(
        (e) =>
          new Date(e.created_at).getTime() >
          Date.parse(data.as_of) - 7 * 86400000,
      )
      .map((e) => e.visitor_id),
  );
  const sources = [...new Set(rawClicks.map((e) => e.surface))];
  return (
    <>
      <div className="page-heading heading-row">
        <div>
          <div className="eyebrow">
            {t("Founder workspace", "项目方工作台")}
          </div>
          <h1>
            {notificationsOnly
              ? t("Your updates.", "你的项目动态。")
              : t("Your project, in perspective.", "看清项目的变化与回报。")}
          </h1>
          <p>{data.user.email}</p>
        </div>
        <div className="row">
          <Link className="button primary" href={href("/submit")}>
            <Plus size={13} />
            {t("New application", "创建申请")}
          </Link>
          <button
            className="button"
            onClick={() => {
              void api("auth", { action: "signout" }).catch(() => {});
            }}
          >
            <LogOut size={12} />
            {t("Sign out", "退出")}
          </button>
        </div>
      </div>
      {!notificationsOnly && (
        <>
          <div className="stat-row">
            <div>
              <strong>
                {mine.filter((a) => a.status === "approved").length}
              </strong>
              <span>{t("Approved applications", "审核通过的申请")}</span>
            </div>
            <div>
              <strong>
                {valid.filter((e) => e.kind === "impression").length}
              </strong>
              <span>
                {t(
                  "Valid recommendation impressions · 30d",
                  "有效推荐展示 · 30 天",
                )}
              </span>
            </div>
            <div>
              <strong>
                {valid.filter((e) => e.kind === "project_view").length}
              </strong>
              <span>
                {t("Valid project views · 30d", "有效项目访问 · 30 天")}
              </span>
            </div>
            <div>
              <strong>{uniqueClicks.size}</strong>
              <span>
                {t("Daily click visitors · 30d", "按日去重点击访客 · 30 天")}
              </span>
            </div>
          </div>
          <section className="panel">
            <div className="row between">
              <h2>{t("Applications & review feedback", "申请与审核反馈")}</h2>
              <span className="tag">{mine.length}</span>
            </div>
            {mine.length ? (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("Project", "项目")}</th>
                      <th>{t("Status", "状态")}</th>
                      <th className="hide-mobile">{t("Feedback", "反馈")}</th>
                      <th>{t("Action", "操作")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mine.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="project-name">
                            {a.draft.name || t("Untitled draft", "未命名草稿")}
                            {a.demo && (
                              <span
                                className="tag demo"
                                style={{ marginLeft: 7 }}
                              >
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="domain">
                            {a.kind === "update"
                              ? t("Information update", "资料更新")
                              : t("Initial enrollment", "首次入驻")}{" "}
                            · {a.id.slice(0, 8)}
                          </div>
                        </td>
                        <td>
                          <Status value={a.status} />
                        </td>
                        <td
                          className="hide-mobile muted"
                          style={{ whiteSpace: "normal", maxWidth: 300 }}
                        >
                          {a.feedback ?? "—"}
                        </td>
                        <td>
                          <Link
                            className="button"
                            href={href(`/submit?id=${a.id}`)}
                          >
                            {["draft", "needs_info"].includes(a.status)
                              ? t("Continue", "继续填写")
                              : t("View", "查看")}
                            <ArrowUpRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title={t("Start your first application", "创建第一份申请")}
              >
                <Link className="button" href={href("/submit")}>
                  {t("Submit a project", "提交项目")}
                </Link>
              </Empty>
            )}
          </section>
          <section className="panel">
            <h2>{t("My peer comparisons", "我的同行对比")}</h2>
            <p>
              {t(
                "Each group contains the ten peers selected for that application. It is separate from the category-wide public chart.",
                "每组包含申请中选择的十个同行，与全分类公开榜单分别展示。",
              )}
            </p>
            {reports.length ? (
              <div className="stack">
                {reports.map((r) => {
                  const p = data.projects.find((p) => p.id === r.project_id);
                  return (
                    <Link
                      href={href(`/reports/${r.id}`)}
                      key={r.id}
                      className="row between"
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <div className="row">
                        <FileText size={17} className="blue" />
                        <div>
                          <div className="project-name">
                            {p?.name ?? t("Project report", "项目报告")}
                          </div>
                          <div className="domain">
                            {r.peers.length} {t("peers", "个同行")} ·{" "}
                            {new Date(r.created_at).toLocaleDateString(
                              locale === "zh" ? "zh-CN" : "en-US",
                            )}
                          </div>
                        </div>
                        {r.demo && <span className="tag demo">DEMO</span>}
                      </div>
                      <ArrowUpRight size={14} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p>
                {t(
                  "Your report is delivered after the application is approved. Unknown data stays unknown.",
                  "审核通过后交付报告，未知数据保持未知。",
                )}
              </p>
            )}
          </section>
          <div className="panel-grid">
            <section className="panel">
              <h2>{t("Manage claimed projects", "管理已认领项目")}</h2>
              {claims.length ? (
                claims.map((c) => {
                  const p = data.projects.find((p) => p.id === c.project_id);
                  return p ? (
                    <div
                      className="row between"
                      style={{ padding: "12px 0" }}
                      key={c.id}
                    >
                      <Link href={href(`/projects/${p.slug}`)} className="row">
                        <Avatar name={p.name} size="small" />
                        {p.name}
                      </Link>
                      <Link
                        className="button"
                        href={href(`/submit?project=${p.id}`)}
                      >
                        {t("Update details", "更新资料")}
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  ) : null;
                })
              ) : (
                <p>
                  {t(
                    "Claim approval grants management rights. Enrollment contribution alone does not.",
                    "认领审核通过后获得管理权限，完成入驻贡献不能替代身份核实。",
                  )}
                </p>
              )}
            </section>
            <section className="panel">
              <h2>
                {t("What 123Charts recorded", "123Charts 实际记录了什么")}
              </h2>
              <dl className="definition-list">
                <dt>{t("Raw outbound clicks", "原始出站点击")}</dt>
                <dd className="mono">{rawClicks.length}</dd>
                <dt>{t("Excluded clicks", "排除的点击")}</dt>
                <dd className="mono">
                  {rawClicks.filter((e) => e.excluded).length}
                </dd>
                <dt>{t("Valid click events", "有效点击事件")}</dt>
                <dd className="mono">{validClicks.length}</dd>
                <dt>{t("Weekly discovery visitors", "每周发现访客估计")}</dt>
                <dd className="mono">{week.size}</dd>
              </dl>
              <p>
                {t(
                  "Visitor estimates use a first-party visitor cookie. Daily uniqueness is visitor + project + UTC date. A click does not confirm a signup, purchase or successful website load.",
                  "访客估计使用本站访客 Cookie，按访客、项目、UTC 日期去重。点击不代表注册、购买或官网已成功加载。",
                )}
              </p>
            </section>
          </div>
          <section className="panel">
            <h2>{t("Outbound attribution", "出站来源")}</h2>
            {sources.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("Surface", "来源位置")}</th>
                    <th>{t("Raw clicks", "原始点击")}</th>
                    <th>{t("Valid click visitors", "有效点击访客")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s}>
                      <td className="mono">{s}</td>
                      <td className="numeric">
                        {rawClicks.filter((e) => e.surface === s).length}
                      </td>
                      <td className="numeric">
                        {
                          new Set(
                            validClicks
                              .filter((e) => e.surface === s)
                              .map(
                                (e) =>
                                  `${e.visitor_id}:${e.project_id}:${e.created_at.slice(0, 10)}`,
                              ),
                          ).size
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                {t(
                  "No outbound events recorded yet. No projected visitor counts are displayed.",
                  "尚无出站事件记录，不展示预测访客数。",
                )}
              </p>
            )}
          </section>
        </>
      )}
      <section className="panel">
        <div className="row between">
          <h2>{t("Notifications", "通知")}</h2>
          <Link className="button ghost" href={href("/following")}>
            {t("Manage subscriptions", "管理订阅")}
            <ArrowRight size={12} />
          </Link>
        </div>
        {data.notifications.length ? (
          data.notifications.map((n) => (
            <div className="review-block" key={n.id}>
              <div className="row between">
                <Link className="project-name" href={href(n.href)}>
                  {locale === "zh" ? n.title_zh : n.title_en}
                  {!n.seen && (
                    <span className="status-dot" style={{ marginLeft: 7 }} />
                  )}
                </Link>
                {!n.seen && (
                  <button
                    disabled={busy}
                    className="button ghost"
                    onClick={() => {
                      void api("notification", { id: n.id }).catch(() => {});
                    }}
                  >
                    <Check size={12} />
                    {t("Mark read", "标为已读")}
                  </button>
                )}
              </div>
              <p>{locale === "zh" ? n.body_zh : n.body_en}</p>
              <span className="domain">
                {new Date(n.created_at).toLocaleString(
                  locale === "zh" ? "zh-CN" : "en-US",
                )}
                {n.email_sent_at &&
                  ` · ${t("Email delivered to local inbox", "邮件已投递本地收件箱")}`}
              </span>
            </div>
          ))
        ) : (
          <p>
            {t(
              "Updates from projects and categories you follow will appear here.",
              "关注的项目和分类更新会显示在这里。",
            )}
          </p>
        )}
      </section>
    </>
  );
}
export function Following() {
  const { data, t, href, locale, api, busy } = useCharts();
  const [emailOverrides, setEmailOverrides] = useState<Record<string, boolean>>(
    {},
  );
  if (!data.user)
    return (
      <Empty title={t("Keep useful projects close", "收藏值得关注的项目")}>
        <Link className="button primary" href={href("/login?next=following")}>
          {t("Sign in", "登录")}
        </Link>
      </Empty>
    );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {t("Your research shelf", "你的研究资料架")}
        </div>
        <h1>{t("Saved & following.", "收藏与关注。")}</h1>
        <p>
          {t(
            "Save projects, follow changes and opt into email summaries. Everything stays free.",
            "收藏项目、关注变化，并自主选择邮件摘要。核心服务免费。",
          )}
        </p>
      </div>
      {data.reports.filter((r) => r.owner_id === data.user?.id).length > 0 && (
        <section className="panel">
          <h2>{t("My peer comparisons", "我的同行对比")}</h2>
          {data.reports
            .filter((r) => r.owner_id === data.user?.id)
            .map((r) => (
              <Link
                className="button"
                key={r.id}
                href={href(`/reports/${r.id}`)}
              >
                {data.projects.find((p) => p.id === r.project_id)?.name ??
                  t("Ten-peer group", "十同行观察组")}{" "}
                →
              </Link>
            ))}
        </section>
      )}
      <section className="panel">
        {data.follows.length ? (
          data.follows.map((f) => {
            const p = data.projects.find((p) => p.id === f.target),
              c = data.categories.find((c) => c.slug === f.target),
              label =
                p?.name ??
                (locale === "zh" ? c?.name_zh : c?.name_en) ??
                f.target;
            return (
              <div className="review-block" key={f.kind + f.target}>
                <div className="row between">
                  <Link
                    className="row"
                    href={href(
                      p ? `/projects/${p.slug}` : `/charts/${c?.slug}`,
                    )}
                  >
                    {p ? (
                      <Avatar name={p.name} size="small" />
                    ) : (
                      <Bell size={18} />
                    )}
                    <div>
                      <div className="project-name">{label}</div>
                      <div className="domain">
                        {f.kind === "bookmark"
                          ? t("Bookmark", "收藏")
                          : f.kind === "category"
                            ? t("Category follow", "关注分类")
                            : t("Project follow", "关注项目")}
                      </div>
                    </div>
                  </Link>
                  <div className="row">
                    {f.kind !== "bookmark" && (
                      <label className="row muted small">
                        <input
                          type="checkbox"
                          checked={
                            emailOverrides[f.kind + f.target] ?? f.email_enabled
                          }
                          disabled={busy}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setEmailOverrides((x) => ({
                              ...x,
                              [f.kind + f.target]: enabled,
                            }));
                            void api("follow", {
                              ...f,
                              email_enabled: enabled,
                            }).catch(() => {
                              setEmailOverrides((x) => ({
                                ...x,
                                [f.kind + f.target]: f.email_enabled,
                              }));
                            });
                          }}
                        />
                        {t("Email summary", "邮件摘要")}
                      </label>
                    )}
                    <button
                      className="button ghost"
                      disabled={busy}
                      onClick={() => {
                        void api("follow", { ...f, remove: true }).catch(
                          () => {},
                        );
                      }}
                    >
                      {t("Remove", "取消")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <Empty title={t("Nothing saved yet", "还没有收藏或关注")}>
            <Link className="button" href={href("/projects")}>
              {t("Explore projects", "探索项目")}
              <ArrowRight size={12} />
            </Link>
          </Empty>
        )}
      </section>
    </>
  );
}
export function PeerReportTable({ peers }: { peers: ReportPeer[] }) {
  const { data, t, href, locale } = useCharts();
  const pathname = usePathname();
  const surface = pathname.includes("/shared/")
    ? "/shared-report"
    : "/peer-report";
  return (
    <div className="table-scroll">
      <table
        className="data-table"
        aria-label={t("Saved peer report", "已交付同行报告")}
      >
        <thead>
          <tr>
            <th>{t("Peer website", "同行网站")}</th>
            <th>{t("Common task", "共同任务")}</th>
            <th>{t("Visits", "访问量")}</th>
            <th>{t("Month / source", "月份 / 来源")}</th>
            <th>{t("Evidence", "证据")}</th>
          </tr>
        </thead>
        <tbody>
          {peers.map((p) => {
            const project = data.projects.find((x) => x.domain === p.domain);
            return (
              <tr key={p.domain}>
                <td>
                  {project ? (
                    <Link
                      href={href(`/projects/${project.slug}?from=${surface}`)}
                      className="project-name"
                    >
                      {p.name} ↗
                    </Link>
                  ) : (
                    <span className="project-name">{p.name}</span>
                  )}
                  <div className="domain mono">{p.domain}</div>
                </td>
                <td
                  style={{ whiteSpace: "normal", minWidth: 200, maxWidth: 350 }}
                >
                  <div>{p.task}</div>
                  <div className="domain" style={{ lineHeight: 1.7 }}>
                    {p.rationale}
                  </div>
                </td>
                <td className="numeric">
                  {p.traffic ? numberFormat(p.traffic.value, locale) : "—"}
                </td>
                <td className="mono small muted">
                  {p.traffic ? (
                    <>
                      {p.traffic.month}
                      <br />
                      {p.traffic.source} · v{p.traffic.version}
                    </>
                  ) : (
                    t("Missing", "暂无数据")
                  )}
                </td>
                <td>
                  {p.traffic ? (
                    <Status value={p.traffic.state} />
                  ) : (
                    <span className="muted small">
                      {t("Not comparable yet", "暂不可比较")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function LivePeerComparison({ report }: { report: Report }) {
  const { data, t, href, dataset } = useCharts();
  return (
    <section className="panel">
      <h2>{t("Peer changes since delivery", "交付后的同行变化")}</h2>
      <p className="small muted">
        {t(
          "Current source records are shown separately from the saved report. Different sources and months are not combined into a ranking.",
          "当前来源记录与已交付报告分别展示，不将不同来源或月份混合排名。",
        )}
      </p>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("Peer website", "同行网站")}</th>
              <th>{t("Latest source record", "最新来源记录")}</th>
              <th>{t("Category position", "分类位置")}</th>
            </tr>
          </thead>
          <tbody>
            {report.peers.map((peer) => {
              const project = data.projects.find(
                (p) => p.domain === peer.domain,
              );
              const current = data.traffic
                .filter(
                  (x) =>
                    x.domain === peer.domain &&
                    x.state === "verified" &&
                    x.demo === report.demo,
                )
                .sort(
                  (a, b) =>
                    b.month.localeCompare(a.month) ||
                    b.verified_at.localeCompare(a.verified_at),
                )[0];
              const memberships = data.memberships.filter(
                (m) => m.project_id === project?.id && m.state === "confirmed",
              );
              return (
                <tr key={peer.domain}>
                  <td>
                    {project ? (
                      <Link href={href(`/projects/${project.slug}`)}>
                        {peer.name}
                      </Link>
                    ) : (
                      peer.name
                    )}
                    <small className="block muted mono">{peer.domain}</small>
                  </td>
                  <td>
                    {current ? (
                      <>
                        <strong className="mono">
                          {current.raw_display ?? numberFormat(current.value)}
                        </strong>
                        <small className="block muted">
                          {current.source} · {current.month} · v
                          {current.version}
                          {dataset === "demo" ? " · DEMO" : ""}
                        </small>
                      </>
                    ) : (
                      t("Still missing comparable data", "仍缺少可比数据")
                    )}
                  </td>
                  <td>
                    {memberships.map((m) => {
                      const snapshot = data.snapshots.find(
                        (s) =>
                          s.category === m.category &&
                          s.month === current?.month &&
                          s.source === current?.source,
                      );
                      const e = snapshot?.entries.find(
                        (e) => e.project_id === project?.id,
                      );
                      return (
                        <Link
                          key={m.category}
                          className="block small blue"
                          href={href(
                            `/charts/${m.category}${snapshot ? `?month=${snapshot.month}&source=${encodeURIComponent(snapshot.source)}` : ""}`,
                          )}
                        >
                          {t(
                            data.categories.find((c) => c.slug === m.category)
                              ?.name_en ?? m.category,
                            data.categories.find((c) => c.slug === m.category)
                              ?.name_zh ?? m.category,
                          )}{" "}
                          ·{" "}
                          {e
                            ? `#${e.rank}`
                            : m.placement === "general"
                              ? t("Broad platform", "综合平台")
                              : t("Not ranked", "未排名")}
                        </Link>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function ReportView({ id }: { id: string }) {
  const { data, t, href, api, busy, notify, locale, dataset } = useCharts();
  const r = data.reports.find((r) => r.id === id),
    [card, setCard] = useState(false);
  if (!r)
    return (
      <Empty
        title={t("This private report is unavailable", "无法访问此私有报告")}
      >
        <Link
          className="button primary"
          href={href(data.user ? "/dashboard" : "/login")}
        >
          {t("Open your workspace", "打开工作台")}
        </Link>
      </Empty>
    );
  const p = data.projects.find((p) => p.id === r.project_id);
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {p?.name} / {t("Enrollment deliverable", "入驻交付成果")}
        </div>
        <h1>{t("My peer comparison.", "我的同行对比。")}</h1>
        <p>
          {t(
            "All ten peers, with verified values and explicit gaps. Your selected observation group is not the whole industry.",
            "完整呈现十个同行，保留已核验数值和缺失信息。自选观察组不代表完整行业。",
          )}
        </p>
      </div>
      {r.demo && (
        <div className="notice">
          {t(
            "DEMONSTRATION — report values and approval history are synthetic.",
            "演示报告 — 数值及通过记录均为模拟。",
          )}
        </div>
      )}
      <LivePeerComparison report={r} />
      <div className="row" style={{ marginBottom: 20 }}>
        <button
          className="button"
          disabled={busy || r.owner_id !== data.user?.id}
          onClick={async () => {
            try {
              await api("share", { id: r.id, enabled: !r.share_token });
            } catch {}
          }}
        >
          <Share2 size={12} />
          {r.share_token
            ? t("Revoke share link", "撤销分享链接")
            : t("Enable sharing", "开启分享")}
        </button>
        {r.share_token && (
          <>
            <Link className="button" href={href(`/shared/${r.share_token}`)}>
              {t("Open shared report", "打开分享报告")}
              <ExternalLink size={12} />
            </Link>
            <button
              className="button ghost"
              onClick={() => {
                void navigator.clipboard
                  .writeText(
                    `${window.location.origin}${href(`/shared/${r.share_token}`)}`,
                  )
                  .then(() => notify(t("Link copied.", "链接已复制。")));
              }}
            >
              {t("Copy link", "复制链接")}
            </button>
          </>
        )}
        {p && (
          <button className="button" onClick={() => setCard((x) => !x)}>
            <Download size={12} />
            {t("Preview share card", "预览分享卡片")}
          </button>
        )}
      </div>
      {card && p && (
        <div className="panel">
          <img
            className="share-preview"
            src={`/api/charts/card/${p.id}?lang=${locale}&dataset=${dataset}`}
            alt={t("Project share card", "项目分享卡片")}
          />
          <p>
            <a
              className="button"
              download={`${p.slug}.png`}
              href={`/api/charts/card/${p.id}?lang=${locale}&dataset=${dataset}&download=1`}
            >
              {t("Download PNG", "下载 PNG")}
            </a>
          </p>
        </div>
      )}
      <PeerReportTable peers={r.peers} />
      <div className="panel" style={{ marginTop: 20 }}>
        <h2>{t("Scope and missing information", "范围与缺失信息")}</h2>
        <p>
          {t(
            "Values reflect the report at approval time. A source, month or measurement scope difference may make two values incomparable. This report uses worldwide, all-device domain visits when available. Unknown values remain unknown.",
            "数值反映报告审核通过时的记录。来源、月份或测量范围不同可能导致不可比较。本报告在可用时使用全球、全部设备、域名访问量。未知值保持未知。",
          )}
        </p>
        <p className="mono small">
          {t("Generated", "生成时间")}:{" "}
          {new Date(r.created_at).toLocaleString(
            locale === "zh" ? "zh-CN" : "en-US",
          )}
        </p>
        <Link
          className="button ghost"
          href={href(`/charts?category=${p?.category ?? "ai-coding"}`)}
        >
          {t("View the full category chart separately", "单独查看全分类榜单")}
          <ArrowRight size={12} />
        </Link>
      </div>
    </>
  );
}
