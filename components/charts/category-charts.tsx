"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Search, ExternalLink } from "lucide-react";
import { useCharts, Avatar, Empty, numberFormat } from "./context";
import { Change, Sparkline, RecommendationCard } from "./public-views";
import type {
  Category,
  Project,
  Snapshot,
  SnapshotEntry,
} from "@/lib/charts/types";
function FollowCategory({ slug }: { slug: string }) {
  const { data, t, api, href } = useCharts();
  const on = data.follows.some(
    (f) => f.kind === "category" && f.target === slug,
  );
  return data.user ? (
    <button
      className="button"
      onClick={() =>
        void api("follow", {
          kind: "category",
          target: slug,
          remove: on,
          email_enabled: false,
        }).catch(() => {})
      }
    >
      {on
        ? t("Following category", "已关注分类")
        : t("Follow category", "关注分类")}
    </button>
  ) : (
    <Link className="button" href={href("/login?next=following")}>
      {t("Follow category", "关注分类")}
    </Link>
  );
}
export function CategorySummaries({ search = "" }: { search?: string }) {
  const { data, t, locale, href, dataset } = useCharts();
  return (
    <div className="category-summary-grid">
      {data.categories
        .filter((c) =>
          (c.name_en + c.name_zh + c.description_en + c.description_zh)
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map((c) => {
          const snapshot = data.snapshots
            .filter((s) => s.category === c.slug)
            .sort(
              (a, b) =>
                b.month.localeCompare(a.month) ||
                b.created_at.localeCompare(a.created_at),
            )[0];
          const count = data.memberships.filter(
            (m) =>
              m.category === c.slug &&
              m.state === "confirmed" &&
              data.projects.some((p) => p.id === m.project_id),
          ).length;
          return (
            <section className="category-summary" key={c.slug}>
              <div className="eyebrow">
                {locale === "zh" ? c.parent_zh : c.parent_en}
              </div>
              <h2>
                <Link href={href(`/charts/${c.slug}`)}>
                  {locale === "zh" ? c.name_zh : c.name_en}
                  <ArrowRight size={16} />
                </Link>
              </h2>
              <p>{locale === "zh" ? c.description_zh : c.description_en}</p>
              <div className="coverage-inline">
                <span>
                  <strong>{count}</strong> {t("collected", "已收录")}
                </span>
                <span>
                  <strong>{snapshot?.coverage_count ?? 0}</strong>{" "}
                  {t("ranked", "可排名")}
                </span>
                <span className="mono">
                  {snapshot?.month ?? t("No published month", "尚无已发布月份")}
                </span>
              </div>
              <div className="summary-leaders">
                {snapshot?.entries.slice(0, 3).map((e) => {
                  const p = data.projects.find((p) => p.id === e.project_id);
                  return p ? (
                    <Link key={p.id} href={href(`/projects/${p.slug}`)}>
                      <span className="mono muted">#{e.rank}</span>
                      <span>{p.name}</span>
                      <span className="mono">
                        {e.raw_display ?? numberFormat(e.value)}
                      </span>
                    </Link>
                  ) : null;
                })}
                {!snapshot?.entries.length && (
                  <p className="muted">
                    {t(
                      "Awaiting comparable verified data.",
                      "等待可比较的核验数据。",
                    )}
                  </p>
                )}
              </div>
              <div className="small muted">
                {snapshot
                  ? `${snapshot.source} · Monthly Visits · ${t("published", "发布于")} ${snapshot.created_at.slice(0, 10)}`
                  : t(
                      "Profiles remain discoverable without a traffic rank.",
                      "没有流量名次的项目仍可被发现。",
                    )}
                {dataset === "demo" && " · DEMO"}
              </div>
              <div className="row between" style={{ marginTop: 20 }}>
                <Link
                  className="blue"
                  href={href(
                    `/charts/${c.slug}${snapshot ? `?month=${snapshot.month}&source=${encodeURIComponent(snapshot.source)}` : ""}`,
                  )}
                >
                  {t("View full chart", "查看完整榜单")} →
                </Link>
                <FollowCategory slug={c.slug} />
              </div>
            </section>
          );
        })}
    </div>
  );
}
export function ChartsIndex() {
  const { data, t, href } = useCharts();
  const [q, setQ] = useState("");
  const updated = [...data.categories].sort((a, b) =>
    (
      data.snapshots.find((s) => s.category === b.slug)?.created_at ?? ""
    ).localeCompare(
      data.snapshots.find((s) => s.category === a.slug)?.created_at ?? "",
    ),
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          123Charts / {t("Browse by purpose", "按用途查找")}
        </div>
        <h1>{t("Category traffic charts", "分类流量榜")}</h1>
        <p>
          {t(
            "Explore website visits, comparable growth and peer distribution for free. Data is contributed by users and periodically checked by the platform.",
            "免费查看各个分类的网站访问量、增长变化和同行分布。数据由用户贡献，并由平台定期核验。",
          )}
        </p>
      </div>
      <div className="filter-search category-search">
        <Search size={16} />
        <input
          className="input"
          aria-label={t("Search categories", "搜索分类")}
          placeholder={t("Find a category or task…", "搜索分类或任务…")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <section className="panel">
        <h2>{t("Popular categories", "热门分类")}</h2>
        <p className="small muted">
          {t(
            "Ordered by saved category follows on 123Charts; this is not a website traffic rank.",
            "按 123Charts 分类关注数排列，不是网站流量名次。",
          )}
        </p>
        {data.categories
          .filter((c) => (data.categoryFollowers[c.slug] ?? 0) > 0)
          .sort(
            (a, b) =>
              (data.categoryFollowers[b.slug] ?? 0) -
              (data.categoryFollowers[a.slug] ?? 0),
          )
          .map((c) => (
            <Link
              className="button"
              key={c.slug}
              href={href(`/charts/${c.slug}`)}
            >
              {t(c.name_en, c.name_zh)} · {data.categoryFollowers[c.slug]}
            </Link>
          ))}
        {!Object.values(data.categoryFollowers).some((n) => n > 0) && (
          <p className="muted small">
            {t("No category follows recorded yet.", "尚无分类关注记录。")}
          </p>
        )}
      </section>
      <CategorySummaries search={q} />
      {!data.categories.some((c) =>
        (c.name_en + c.name_zh + c.description_en + c.description_zh)
          .toLowerCase()
          .includes(q.toLowerCase()),
      ) && <Empty title={t("No matching category", "没有匹配分类")} />}
      <div className="section-header">
        <h2>{t("Recently published categories", "最近发布的分类")}</h2>
      </div>
      <div className="category-update-list">
        {updated.map((c) => {
          const s = data.snapshots.find((s) => s.category === c.slug);
          return (
            <Link key={c.slug} href={href(`/charts/${c.slug}`)}>
              <span>{t(c.name_en, c.name_zh)}</span>
              <span className="mono muted">
                {s
                  ? `${s.month} · v${s.version} · ${s.created_at.slice(0, 10)}`
                  : t("No published snapshot", "尚无已发布快照")}
              </span>
            </Link>
          );
        })}
      </div>
      <p className="small muted">
        {t(
          "Parent directories organize navigation; they do not combine unrelated categories into a global ranking.",
          "上级目录用于导航，不将用途不同的分类自动合成总榜。",
        )}
      </p>
    </>
  );
}
export function CategoryChart({ slug }: { slug: string }) {
  const { data, t, href, locale, dataset } = useCharts();
  const params = useSearchParams(),
    router = useRouter();
  const c = data.categories.find((c) => c.slug === slug);
  const [expanded, setExpanded] = useState("");
  const urlQuery = params.get("q") ?? "";
  const [queryDraft, setQueryDraft] = useState(urlQuery);
  useEffect(() => setQueryDraft(urlQuery), [urlQuery]);
  if (!c) return <Empty title={t("Category not found", "分类不存在")} />;
  const versions = data.snapshots.filter((s) => s.category === slug);
  const source =
    params.get("source") ??
    versions[0]?.source ??
    data.months[0]?.source ??
    "AITDK";
  const month =
    params.get("month") ??
    versions
      .filter((s) => s.source === source)
      .map((s) => s.month)
      .sort()
      .reverse()[0] ??
    data.months.filter((m) => m.source === source && m.accepted)[0]?.month ??
    "";
  const selection = versions
    .filter((s) => s.source === source && s.month === month)
    .sort((a, b) => b.version - a.version);
  const snapshot = params.has("version")
    ? selection.find((s) => String(s.version) === params.get("version"))
    : selection[0];
  const price = params.get("price") ?? "all";
  function filter(key: string, value: string) {
    const qs = new URLSearchParams(params);
    qs.set(key, value);
    if (["month", "source"].includes(key)) qs.delete("version");
    if (key === "source") qs.delete("month");
    if (key !== "page") qs.delete("page");
    router.replace(href(`/charts/${slug}?${qs}`), { scroll: false });
  }
  const members = data.memberships.filter(
    (m) => m.category === slug && m.state === "confirmed",
  );
  const pool = data.projects.filter((p) =>
    members.some((m) => m.project_id === p.id),
  );
  const match = (p: Project) =>
    (p.name + p.domain + p.description_en + p.description_zh)
      .toLowerCase()
      .includes(queryDraft.toLowerCase()) &&
    (price === "all" || (p.price_verified && p.price_type === price));
  const rows = (snapshot?.entries ?? []).filter((e) => {
    const p = data.projects.find((p) => p.id === e.project_id);
    return p && match(p);
  });
  const page = Math.max(1, Number(params.get("page")) || 1),
    limit = 12,
    pages = Math.max(1, Math.ceil(rows.length / limit));
  const visible = rows.slice(
    (Math.min(page, pages) - 1) * limit,
    Math.min(page, pages) * limit,
  );
  const indexed = new Set(snapshot?.entries.map((e) => e.project_id));
  const general = pool.filter(
    (p) => members.find((m) => m.project_id === p.id)?.placement === "general",
  );
  const unranked = pool.filter(
    (p) => !indexed.has(p.id) && !general.some((g) => g.id === p.id),
  );
  const checks = data.checks.filter(
    (x) =>
      x.source === source &&
      x.month === month &&
      pool.some((p) => p.measurement_domain === x.domain),
  );
  const checked = checks.filter(
    (x) => x.last_success_at && x.state === "verified",
  ).length;
  const recent = pool.filter(
    (p) => Date.parse(data.as_of) - Date.parse(p.collected_at) < 7 * 86400000,
  );
  const recs = data.recommendations.filter((r) => r.context === slug);
  const sources = Array.from(
    new Set([
      ...versions.map((s) => s.source),
      ...data.months.map((m) => m.source),
      "AITDK",
    ]),
  );
  const months = Array.from(
    new Set([
      ...versions.filter((s) => s.source === source).map((s) => s.month),
      ...data.months.filter((m) => m.source === source).map((m) => m.month),
    ]),
  )
    .sort()
    .reverse();
  function reason(p: Project) {
    const m = members.find((m) => m.project_id === p.id);
    if (m?.placement === "scope_unknown")
      return t("Measurement scope awaiting confirmation", "测量范围待确认");
    if (
      data.traffic.some(
        (x) =>
          x.domain === p.measurement_domain &&
          x.source === source &&
          x.month === month &&
          x.state === "conflict",
      )
    )
      return t("Unresolved data conflict", "数据存在待处理问题");
    if (
      checks.some(
        (x) =>
          x.domain === p.measurement_domain &&
          ["pending", "running", "deferred", "needs_review"].includes(x.state),
      )
    )
      return t("Awaiting verification", "数据待核验");
    return t("No comparable data for this month", "暂无本期可比数据");
  }
  return (
    <>
      <div className="row between">
        <Link className="small muted" href={href("/charts")}>
          ← {t("All categories", "所有分类")}
        </Link>
        <FollowCategory slug={slug} />
      </div>
      <div className="page-heading">
        <div className="eyebrow">{t(c.parent_en ?? "", c.parent_zh ?? "")}</div>
        <h1>
          {t(`${c.name_en} website traffic chart`, `${c.name_zh}网站流量榜`)}
        </h1>
        <p>{t(c.description_en, c.description_zh)}</p>
        <p className="small muted">
          {t(
            "Estimated visits in the selected statistical month. Visits are not unique visitors, active product users or a measure of product quality.",
            "按指定统计月份的网站访问次数估算排序。访问次数不代表独立访客数、产品活跃用户数或产品质量。",
          )}
        </p>
      </div>
      <section
        className="chart-overview"
        aria-label={t("Chart coverage and provenance", "榜单覆盖与来源")}
      >
        <div>
          <span>{t("Statistical month", "统计月份")}</span>
          <strong className="mono">{month || "—"}</strong>
        </div>
        <div>
          <span>{t("Source / metric", "来源 / 指标")}</span>
          <strong>{source} · Monthly Visits</strong>
        </div>
        <div>
          <span>{t("Scope", "统计范围")}</span>
          <strong>
            {t(
              "Worldwide · all devices · measured domain",
              "全球 · 全部设备 · 测量域名",
            )}
          </strong>
        </div>
        <div>
          <span>
            {t("Collection / comparable coverage", "收录 / 可比覆盖")}
          </span>
          <strong>
            {snapshot?.total_count ?? pool.length} {t("collected", "已收录")} ·{" "}
            {snapshot?.coverage_count ?? 0} {t("ranked", "可排名")}
          </strong>
        </div>
        <div>
          <span>{t("Check progress", "核验进度")}</span>
          <strong>
            {checked}/{pool.length} {t("successfully checked", "已成功核验")}
          </strong>
          <small>
            {pool.length - checked}{" "}
            {t("pending / unresolved", "待处理 / 待复核")}
          </small>
        </div>
        <div>
          <span>{t("Version / published", "版本 / 发布时间")}</span>
          <strong>
            {snapshot
              ? `v${snapshot.version} · ${snapshot.created_at.slice(0, 16).replace("T", " ")} UTC`
              : t("Not published", "尚未发布")}
          </strong>
          <small>{snapshot?.rule_version}</small>
        </div>
      </section>
      <p className="small muted">
        {t(
          "Coverage describes the current 123Charts research library, not the entire industry.",
          "覆盖范围仅指 123Charts 当前研究库，不代表完整行业。",
        )}
      </p>
      <div className="filters chart-filters">
        <select
          aria-label={t("Statistical month", "统计月份")}
          value={month}
          onChange={(e) => filter("month", e.target.value)}
        >
          {!months.length && (
            <option value="">{t("No released month", "暂无已发布月份")}</option>
          )}
          {months.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label={t("Data source", "数据来源")}
          value={source}
          onChange={(e) => filter("source", e.target.value)}
        >
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label={t("Snapshot version", "快照版本")}
          value={snapshot?.version ?? ""}
          onChange={(e) => filter("version", e.target.value)}
        >
          {!selection.length && <option value="">—</option>}
          {selection.map((s) => (
            <option key={s.id} value={s.version}>
              v{s.version} · {s.created_at.slice(0, 10)}
            </option>
          ))}
        </select>
        <select
          aria-label={t("Price type", "价格类型")}
          value={price}
          onChange={(e) => filter("price", e.target.value)}
        >
          <option value="all">{t("All prices", "全部价格")}</option>
          {["free", "freemium", "trial", "paid"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <div className="filter-search">
          <Search size={14} />
          <input
            className="input"
            value={queryDraft}
            onChange={(e) => {
              const value = e.target.value;
              setQueryDraft(value);
              const qs = new URLSearchParams(window.location.search);
              qs.set("q", value);
              qs.delete("page");
              window.history.replaceState(
                null,
                "",
                href(`/charts/${slug}?${qs}`),
              );
            }}
            aria-label={t("Filter websites", "筛选网站")}
            placeholder={t("Search within this category", "搜索本分类网站")}
          />
        </div>
      </div>
      {!snapshot && (
        <div className="notice">
          {t(
            "No published snapshot for this selection. Missing data does not imply zero visits or a last-place rank.",
            "当前选择暂无已发布快照。数据缺失不表示零访问量，也不自动排在最后。",
          )}
        </div>
      )}
      {snapshot && (
        <>
          <div className="table-scroll">
            <table className="data-table category-rank-table">
              <thead>
                <tr>
                  <th>
                    <span className="hide-mobile">
                      {t("Category rank", "分类内名次")}
                    </span>
                    <span className="only-mobile">#</span>
                  </th>
                  <th>{t("Website / measured domain", "网站 / 测量域名")}</th>
                  <th>{t("Estimated monthly visits", "月访问次数估算")}</th>
                  <th className="hide-mobile">
                    {t("Traffic MoM", "流量环比")}
                  </th>
                  <th className="hide-medium">{t("History", "历史趋势")}</th>
                  <th className="hide-mobile">
                    {t("Verification", "核验状态")}
                  </th>
                  <th>{t("Basis", "依据")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => {
                  const p = data.projects.find((p) => p.id === e.project_id)!;
                  const traffic = data.traffic.find(
                    (x) => x.id === e.traffic_id,
                  );
                  const history = data.traffic
                    .filter(
                      (x) =>
                        x.domain === e.domain &&
                        x.source === source &&
                        x.scope === snapshot.scope &&
                        x.metric === snapshot.metric &&
                        x.state === "verified" &&
                        x.month <= month,
                    )
                    .sort((a, b) => a.month.localeCompare(b.month));
                  const previous = history
                    .filter((x) => x.month < month)
                    .at(-1);
                  const check = data.checks.find(
                    (x) =>
                      x.domain === e.domain &&
                      x.source === source &&
                      x.month === month,
                  );
                  return (
                    <ChartRow
                      key={e.project_id}
                      project={p}
                      entry={e}
                      snapshot={snapshot}
                      expanded={expanded === p.id}
                      onExpand={() =>
                        setExpanded(expanded === p.id ? "" : p.id)
                      }
                    >
                      <td className="hide-mobile">
                        <Change current={traffic} previous={previous} />
                      </td>
                      <td className="hide-medium">
                        <Sparkline rows={history} />
                      </td>
                      <td className="hide-mobile">
                        <span
                          className={`tag ${dataset === "demo" ? "demo" : "verified"}`}
                        >
                          {dataset === "demo"
                            ? t("Demo verified", "模拟核验")
                            : t("Source checked", "来源已核对")}
                        </span>
                        <small className="block muted">
                          {check?.last_success_at?.slice(0, 10) ??
                            traffic?.verified_at?.slice(0, 10)}
                        </small>
                      </td>
                    </ChartRow>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <Empty
              title={t("No matching ranked websites", "没有匹配的已排名网站")}
            />
          )}
          <div className="pagination">
            <span>
              {rows.length}{" "}
              {t(
                "ranked results · original category positions preserved",
                "条排名结果 · 保留原分类名次",
              )}
            </span>
            <div className="row">
              <button
                className="button"
                disabled={page <= 1}
                onClick={() => filter("page", String(page - 1))}
              >
                ←
              </button>
              <span className="mono">
                {Math.min(page, pages)}/{pages}
              </span>
              <button
                className="button"
                disabled={page >= pages}
                onClick={() => filter("page", String(page + 1))}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
      <div className="section-header">
        <h2>
          {t("Not ranked this month", "本期未参与排名的网站")}{" "}
          <span className="mono muted">{unranked.length}</span>
        </h2>
      </div>
      <div className="category-update-list">
        {unranked.filter(match).map((p) => (
          <Link key={p.id} href={href(`/projects/${p.slug}`)}>
            <span>
              {p.name}
              <small className="block muted mono">{p.domain}</small>
            </span>
            <span className="small muted">
              {reason(p)}
              {(() => {
                const historical = data.traffic
                  .filter(
                    (x) =>
                      x.domain === p.measurement_domain &&
                      x.source === source &&
                      x.month < month &&
                      x.state === "verified",
                  )
                  .sort((a, b) => b.month.localeCompare(a.month))[0];
                return historical ? (
                  <small className="block mono">
                    {t("Historical", "历史")} {historical.month} ·{" "}
                    {historical.raw_display ?? numberFormat(historical.value)} ·{" "}
                    {historical.source}
                  </small>
                ) : null;
              })()}
            </span>
          </Link>
        ))}
        {!unranked.length && (
          <p className="muted small">
            {t(
              "Every eligible listed website has comparable data for this snapshot.",
              "本快照中符合条件的已收录网站均有可比数据。",
            )}
          </p>
        )}
      </div>
      {general.length > 0 && (
        <>
          <div className="section-header">
            <h2>{t("Related broad platforms", "相关综合平台")}</h2>
          </div>
          <p className="small muted">
            {t(
              "Whole-site figures describe the broad platform. They are excluded from this specialist category rank.",
              "全站数据描述整个综合平台，不代表其中某款产品，不参与本细分类主榜。",
            )}
          </p>
          <div className="category-update-list">
            {general.map((p) => (
              <Link key={p.id} href={href(`/projects/${p.slug}`)}>
                <span>{p.name}</span>
                <span className="mono muted">
                  {p.measurement_domain} · {t("whole website", "全站")}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="section-header">
        <h2>{t("Category changes", "本分类动态")}</h2>
      </div>
      <div className="category-update-list">
        {versions.slice(0, 8).map((s) => (
          <Link
            key={s.id}
            href={href(
              `/charts/${slug}?month=${s.month}&source=${encodeURIComponent(s.source)}&version=${s.version}`,
            )}
          >
            <span>
              {s.month} · {s.source} · v{s.version}
              <small className="block muted">
                {s.correction_note ?? t("Monthly publication", "月榜发布")}
              </small>
            </span>
            <span className="mono muted">{s.created_at.slice(0, 10)}</span>
          </Link>
        ))}
        {recent.map((p) => (
          <Link key={p.id} href={href(`/projects/${p.slug}`)}>
            <span>
              {t("Newly collected", "新收录")} · {p.name}
            </span>
            <span className="mono muted">{p.collected_at.slice(0, 10)}</span>
          </Link>
        ))}
      </div>
      <div className="section-header">
        <h2>{t("Free discovery rotation", "免费发现与贡献推荐")}</h2>
        <Link href={href("/methodology")}>
          {t("Separate from traffic rank", "与流量排名独立")}
        </Link>
      </div>
      {recs.length ? (
        <div className="recommendations">
          {recs.map((r) => (
            <RecommendationCard
              key={r.id}
              id={r.project_id}
              reason={r.reason}
              slot={r.slot}
            />
          ))}
        </div>
      ) : (
        <p className="muted">
          {t(
            "No eligible recommendations currently.",
            "当前暂无合格推荐候选。",
          )}
        </p>
      )}
      {snapshot && (
        <a
          className="small blue"
          href={`/api/charts/snapshot/${snapshot.id}?dataset=${dataset}`}
          target="_blank"
          rel="noreferrer"
        >
          {t("Read this exact snapshot as JSON", "读取本次快照 JSON")} ↗
        </a>
      )}
      {snapshot && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: t(`${c.name_en} traffic chart`, `${c.name_zh}流量榜`),
              description: `${snapshot.demo ? "DEMO · " : ""}${snapshot.month} · ${snapshot.source} · Monthly Visits · ${snapshot.scope}`,
              datePublished: snapshot.created_at,
              identifier: snapshot.id,
              numberOfItems: snapshot.entries.length,
              itemListOrder: "https://schema.org/ItemListOrderDescending",
              url: `https://123charts.com/${locale}/charts/${slug}?month=${snapshot.month}&source=${encodeURIComponent(snapshot.source)}&version=${snapshot.version}`,
              itemListElement: snapshot.entries.map((e) => ({
                "@type": "ListItem",
                position: e.rank,
                item: {
                  "@type": "WebSite",
                  name:
                    data.projects.find((p) => p.id === e.project_id)?.name ??
                    e.domain,
                  url: `https://${e.domain}`,
                  identifier: e.traffic_id,
                },
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <p className="small muted">
        {t(
          "Rank changes may reflect new coverage, classification or corrections. They do not necessarily mean traffic changed. Website traffic appearing in several categories must not be summed as industry traffic.",
          "名次变化可能来自新增覆盖、分类调整或纠错，不一定表示访问量变化。同一网站出现在多个分类的流量不能相加为行业总量。",
        )}
      </p>
    </>
  );
}
function ChartRow({
  project: p,
  entry: e,
  snapshot: s,
  expanded,
  onExpand,
  children,
}: {
  project: Project;
  entry: SnapshotEntry;
  snapshot: Snapshot;
  expanded: boolean;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  const { data, t, href, dataset } = useCharts();
  const traffic = data.traffic.find((x) => x.id === e.traffic_id);
  const check = data.checks.find(
    (x) =>
      x.domain === e.domain && x.source === s.source && x.month === s.month,
  );
  return (
    <>
      <tr data-project={p.slug}>
        <td className="mono rank">#{e.rank}</td>
        <td>
          <Link
            className="project-cell"
            href={href(
              `/projects/${p.slug}?source=${encodeURIComponent(s.source)}&month=${s.month}&snapshot=${s.id}&from=${encodeURIComponent(`/charts/${s.category}`)}`,
            )}
          >
            <Avatar name={p.name} size="small" />
            <div>
              <strong>{p.name}</strong>
              <small className="block mono muted">{e.domain}</small>
            </div>
          </Link>
        </td>
        <td className="numeric mono">
          {e.raw_display ?? numberFormat(e.value)}
          {dataset === "demo" && <small className="block tag demo">DEMO</small>}
        </td>
        {children}
        <td>
          <button
            className="button"
            aria-expanded={expanded}
            onClick={onExpand}
          >
            {t("Details", "详情")}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7}>
            <div className="rank-evidence">
              <p>
                {t("Measured domain", "测量域名")}: <code>{e.domain}</code> ·{" "}
                {s.source} · {s.month} · Visits · {s.scope}
              </p>
              <p>
                {t("Snapshot / data version", "快照 / 数据版本")}: v{s.version}{" "}
                / v{e.data_version} · <code>{e.traffic_id}</code>
              </p>
              <p>
                {t("Last successful verification", "最近成功核验")}:{" "}
                {check?.last_success_at ??
                  traffic?.verified_at ??
                  t("Unknown", "未知")}
                <br />
                {t("Last actual attempt", "最近实际尝试")}:{" "}
                {check?.last_attempt_at ??
                  t("No scheduled attempt recorded", "暂无自动检查记录")}
              </p>
              <p>
                {traffic?.correction_note ??
                  t(
                    "No correction recorded for this value.",
                    "此数值暂无修订记录。",
                  )}
                {e.precision_step &&
                  e.precision_step > 1 &&
                  ` · ${t("Display precision", "显示精度")} ${e.precision_step} visits`}
              </p>
              {traffic?.state !== "verified" && (
                <p className="notice">
                  {t(
                    "This historical snapshot retains its original value; the current data version has changed or requires review.",
                    "历史快照保留发布时的数值；当前数据版本已变化或需要复核。",
                  )}
                </p>
              )}
              <a
                href={`/api/charts/snapshot/${s.id}?dataset=${dataset}`}
                className="blue"
                target="_blank"
                rel="noreferrer"
              >
                {t("Source and version record", "来源与版本记录")}{" "}
                <ExternalLink size={12} />
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
