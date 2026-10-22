"use client";
import { CategorySummaries } from "./category-charts";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Bookmark,
  Plus,
  Layers3,
  ChartNoAxesCombined,
  FileText,
  ShieldCheck,
  Check,
  Code2,
  Workflow,
  Database,
  Clock3,
  Info,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Project, Traffic, Report } from "@/lib/charts/types";
import {
  useCharts,
  Avatar,
  Empty,
  Status,
  Field,
  compact,
  numberFormat,
} from "./context";
import { PeerReportTable } from "./workspace";
export function useEvent(
  projectId: string | undefined,
  kind = "project_view",
  surface = "/projects",
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!projectId) return;
    let sent = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (sent) return;
        if (timer) clearTimeout(timer);
        if (
          !entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
        )
          return;
        timer = setTimeout(() => {
          sent = true;
          void fetch("/api/charts/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id: projectId,
              kind,
              surface,
              automated: navigator.webdriver,
            }),
            keepalive: true,
          });
        }, 1000);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [projectId, kind, surface]);
  return ref;
}
export function Change({
  current,
  previous,
}: {
  current?: Traffic;
  previous?: Traffic;
}) {
  const { t } = useCharts();
  let change: number | null = null;
  if (
    current &&
    previous &&
    previous.value > 0 &&
    current.source === previous.source &&
    current.metric === previous.metric &&
    current.scope === previous.scope &&
    current.state === "verified" &&
    previous.state === "verified"
  ) {
    const d = new Date(`${previous.month}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + 1);
    if (d.toISOString().slice(0, 7) === current.month)
      change = ((current.value - previous.value) / previous.value) * 100;
  }
  return change === null ? (
    <span
      className="muted"
      title={t(
        "Comparable consecutive months required",
        "需要可比较的连续月份",
      )}
    >
      {t("No comparable prior month", "暂无可比上期")}
    </span>
  ) : (
    <span
      className={`row mono ${change >= 0 ? "positive" : "negative"}`}
      style={{ gap: 3, fontSize: 10 }}
    >
      {change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{" "}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}
export function Sparkline({ rows }: { rows: Traffic[] }) {
  const values = rows
    .filter((x) => x.state === "verified")
    .sort((a, b) => a.month.localeCompare(b.month));
  if (values.length < 2) return <span className="muted">—</span>;
  for (let i = 1; i < values.length; i++) {
    const d = new Date(`${values[i - 1].month}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + 1);
    if (d.toISOString().slice(0, 7) !== values[i].month)
      return <span className="muted">—</span>;
  }
  const min = Math.min(...values.map((x) => x.value)),
    max = Math.max(...values.map((x) => x.value)),
    range = max - min || 1;
  const points = values
    .map(
      (x, i) =>
        `${(i / (values.length - 1)) * 90},${22 - ((x.value - min) / range) * 18}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 92 25"
      className="sparkline"
      aria-label="Monthly visits trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#6b89bc"
        strokeWidth="1.5"
      />
    </svg>
  );
}
export function RecommendationCard({
  id,
  reason,
  slot,
}: {
  id: string;
  reason: string;
  slot: number;
}) {
  const { data, t, href, locale } = useCharts(),
    p = data.projects.find((x) => x.id === id);
  const ref = useEvent(id, "impression", `/recommendations/slot-${slot}`);
  if (!p) return null;
  const reasonText =
    reason === "newly_enrolled"
      ? t("Newly enrolled", "新入驻轮换")
      : reason === "adopted_contribution"
        ? t("Community contribution", "有效贡献推荐")
        : t("Worth discovering", "低曝光项目发现");
  return (
    <div className="recommendation" ref={ref}>
      <div className="row between">
        <Avatar name={p.name} />
        <Link
          href={href(`/projects/${p.slug}?from=/recommendations/slot-${slot}`)}
          aria-label={`${t("View", "查看")} ${p.name}`}
        >
          <ArrowUpRight size={15} className="muted" />
        </Link>
      </div>
      <Link
        href={href(`/projects/${p.slug}?from=/recommendations/slot-${slot}`)}
        className="project-name"
        style={{ display: "block" }}
      >
        {p.name}
      </Link>
      <p>{locale === "zh" ? p.description_zh : p.description_en}</p>
      <div className="reason">
        <span className="status-dot" />
        {reasonText}
        {p.demo && (
          <span className="mono" style={{ marginLeft: "auto", fontSize: 8 }}>
            DEMO
          </span>
        )}
      </div>
    </div>
  );
}
export function Home() {
  const { data, t, href, locale } = useCharts();
  const recommended = data.recommendations.filter((x) => x.context === "all");
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow row" style={{ gap: 8 }}>
            <span className="status-dot" />
            {t(
              "Independent projects. Shared perspective.",
              "独立项目，共同发现。",
            )}
          </div>
          <h1>
            {t("A clearer view", "看清网站，")}
            <br />
            <em>{t("of the web.", "发现下一种可能。")}</em>
          </h1>
          <p>
            {t(
              "Discover useful projects. Compare websites with traceable data. Find the tools—and the peers—that matter to you.",
              "发现有用的项目，通过可追溯的数据比较网站，找到适合自己的工具与同行。",
            )}
          </p>
          <div className="hero-meta">
            <span>
              <span className="blue mono">{data.projects.length}</span>{" "}
              {t("projects in the library", "个研究项目")}
            </span>
            <span>
              ↗ {t("Free to explore. Free to join.", "浏览免费，入驻免费。")}
            </span>
            <Link
              href={href("/methodology")}
              className="row blue"
              style={{ gap: 4 }}
            >
              {t("How data works", "了解数据方法")}
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <div className="index-graphic">
          <div className="eyebrow">
            {t("A growing research library", "持续整理的研究库")}
          </div>
          <strong className="mono">
            {String(data.projects.filter((p) => !p.demo).length).padStart(
              3,
              "0",
            )}
            <span style={{ fontSize: 13, color: "#5d6a86", marginLeft: 5 }}>
              {" "}
              / {data.categories.length} {t("sectors", "领域")}
            </span>
          </strong>
          <svg viewBox="0 0 170 65" aria-hidden="true">
            {data.categories.map((c, i) => (
              <g key={c.slug}>
                <rect
                  x="0"
                  y={i * 21}
                  width="170"
                  height="10"
                  rx="2"
                  fill="#1b2230"
                />
                <rect
                  x="0"
                  y={i * 21}
                  width={
                    (data.projects.filter((p) => p.category === c.slug).length /
                      Math.max(
                        ...data.categories.map(
                          (x) =>
                            data.projects.filter((p) => p.category === x.slug)
                              .length,
                        ),
                        1,
                      )) *
                    170
                  }
                  height="10"
                  rx="2"
                  fill={["#9cb3ea", "#687fae", "#425677"][i]}
                />
              </g>
            ))}
          </svg>
          <div className="small muted" style={{ fontSize: 9 }}>
            {t(
              "Profile coverage · no traffic estimates",
              "资料覆盖数量 · 非流量估算",
            )}
          </div>
        </div>
      </section>
      <div className="section-header">
        <div>
          <h2>
            {t("Discover something new", "发现新项目")}{" "}
            <span className="tag" style={{ marginLeft: 7, fontSize: 8 }}>
              {t("FREE ROTATION", "免费轮换")}
            </span>
          </h2>
        </div>
        <Link href={href("/submit")}>
          {t("Your project could be here", "让你的项目被发现")}
          <ArrowUpRight size={12} />
        </Link>
      </div>
      {recommended.length ? (
        <div className="recommendations">
          {recommended.map((r) => (
            <RecommendationCard
              key={r.id}
              id={r.project_id}
              reason={r.reason}
              slot={r.slot}
            />
          ))}
        </div>
      ) : (
        <div className="panel">
          <p>
            {t(
              "No eligible recommendations yet. Approved projects rotate here for free.",
              "暂无合格推荐候选，审核通过的项目将在此免费轮换。",
            )}
          </p>
        </div>
      )}
      <div className="section-header">
        <div>
          <h2>{t("Category traffic charts", "分类流量榜")}</h2>
          <p>
            {t(
              "Same source. Same month. A comparable starting point.",
              "统一来源与月份，为比较提供明确起点。",
            )}
          </p>
        </div>
        <Link href={href("/charts")}>
          {t("Explore charts", "查看榜单")}
          <ArrowRight size={12} />
        </Link>
      </div>
      <CategorySummaries />
      <div className="section-header">
        <h2>{t("Collected this week", "本周新收录网站")}</h2>
      </div>
      <div className="category-update-list">
        {data.projects
          .filter(
            (p) =>
              Date.parse(data.as_of) - Date.parse(p.collected_at) <
              7 * 86400000,
          )
          .sort((a, b) => b.collected_at.localeCompare(a.collected_at))
          .slice(0, 6)
          .map((p) => (
            <Link key={p.id} href={href(`/projects/${p.slug}`)}>
              <span>
                {p.name}
                {p.demo ? " · DEMO" : ""}
              </span>
              <span className="mono muted">{p.collected_at.slice(0, 10)}</span>
            </Link>
          ))}
      </div>
      <div className="section-header">
        <h2>{t("Recently updated profiles", "最近更新的项目资料")}</h2>
        <Link href={href("/projects")}>
          {t("Browse library", "浏览研究库")}
          <ArrowRight size={12} />
        </Link>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <tbody>
            {[...data.projects]
              .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              .slice(0, 4)
              .map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={href(`/projects/${p.slug}`)}
                      className="project-cell"
                    >
                      <Avatar name={p.name} size="small" />
                      <div>
                        <div className="project-name">{p.name}</div>
                        <div className="domain mono">{p.domain}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="hide-mobile muted">
                    {locale === "zh" ? p.description_zh : p.description_en}
                  </td>
                  <td className="muted small">
                    {p.demo
                      ? t("Demo project", "演示项目")
                      : t("Research profile", "研究资料")}
                    <ArrowUpRight
                      size={12}
                      style={{ display: "inline", marginLeft: 10 }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function ProjectListing({
  category,
  charts = false,
}: {
  category?: string;
  charts?: boolean;
}) {
  const { data, t, locale } = useCharts(),
    c = data.categories.find((x) => x.slug === category);
  const recommended = category
    ? data.recommendations.filter((r) => r.context === category)
    : [];
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {t("The 123Charts index", "123Charts 项目研究库")}
        </div>
        <h1>
          {c
            ? locale === "zh"
              ? c.name_zh
              : c.name_en
            : charts
              ? t("Category traffic charts", "分类流量榜")
              : t("Find your next tool.", "寻找下一个好工具。")}
        </h1>
        <p>
          {c
            ? locale === "zh"
              ? c.description_zh
              : c.description_en
            : charts
              ? t(
                  "A category-level view of website visits, built from published, versioned snapshots.",
                  "依据已发布且保留版本的快照，查看分类内网站访问量。",
                )
              : t(
                  "Explore projects by task, category and available evidence. No paid ranking.",
                  "按任务、分类和可用证据探索项目，不出售榜单名次。",
                )}
        </p>
      </div>
      {recommended.length > 0 && (
        <>
          <div className="section-header">
            <h2>
              {t("Discover in this category", "发现同类项目")}{" "}
              <span className="tag">{t("Free rotation", "免费轮换")}</span>
            </h2>
          </div>
          <div className="recommendations category-recommendations">
            {recommended.map((r) => (
              <RecommendationCard
                key={r.id}
                id={r.project_id}
                reason={r.reason}
                slot={r.slot}
              />
            ))}
          </div>
        </>
      )}
      <ProjectTable category={category} charts={charts || !!category} />
    </>
  );
}
export function ProjectTable({
  compactView = false,
  category,
  charts = false,
}: {
  compactView?: boolean;
  category?: string;
  charts?: boolean;
}) {
  const { data, t, href, locale, dataset } = useCharts(),
    params = useSearchParams(),
    router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? ""),
    [price, setPrice] = useState(params.get("price") ?? "all"),
    [cat, setCat] = useState(
      category ?? params.get("category") ?? (charts ? "ai-coding" : "all"),
    ),
    [month, setMonth] = useState(
      params.get("month") ?? data.months.find((m) => m.accepted)?.month ?? "",
    ),
    [page, setPage] = useState(Number(params.get("page")) || 1);
  useEffect(() => {
    setCat(
      category ?? params.get("category") ?? (charts ? "ai-coding" : "all"),
    );
  }, [category, params, charts]);
  const snapshot = data.snapshots.find(
      (s) => s.category === cat && s.month === month,
    ),
    entries = snapshot?.entries ?? [];
  const entryMap = new Map(entries.map((x) => [x.project_id, x]));
  const pool = data.projects.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      (p.name + p.domain + p.description_en + p.description_zh)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (price === "all" ||
        ((p as any).price_verified !== false &&
          (price === "free-options"
            ? ["free", "freemium"].includes(p.price_type)
            : p.price_type === price))),
  );
  const sorted = pool.slice().sort((a, b) => {
    const ar = entryMap.get(a.id)?.rank,
      br = entryMap.get(b.id)?.rank;
    return charts
      ? (ar ?? Infinity) - (br ?? Infinity) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name);
  });
  const limit = compactView ? 7 : 12,
    totalPages = Math.max(1, Math.ceil(sorted.length / limit)),
    visible = sorted.slice(
      (Math.min(page, totalPages) - 1) * limit,
      Math.min(page, totalPages) * limit,
    );
  function filter(k: string, v: string) {
    setPage(1);
    const values = { q, price, category: cat, month, page: "1", [k]: v };
    if (k === "category") setCat(v);
    if (k === "price") setPrice(v);
    if (k === "month") setMonth(v);
    if (!compactView) {
      const target = category
        ? `/charts/${k === "category" ? v : category}`
        : charts
          ? "/charts"
          : "/projects";
      router.replace(href(`${target}?${new URLSearchParams(values)}`), {
        scroll: false,
      });
    }
  }
  useEffect(() => {
    if (compactView || q === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => filter("q", q), 500);
    return () => clearTimeout(timer);
  }, [q]);
  return (
    <>
      <div className="filter-tabs">
        {charts ? (
          data.categories.map((c) => (
            <button
              className={cat === c.slug ? "active" : ""}
              key={c.slug}
              onClick={() => filter("category", c.slug)}
            >
              {locale === "zh" ? c.name_zh : c.name_en}
            </button>
          ))
        ) : (
          <>
            <button
              className={cat === "all" ? "active" : ""}
              onClick={() => filter("category", "all")}
            >
              {t("All projects", "所有项目")}
            </button>
            {data.categories.map((c) => (
              <button
                className={cat === c.slug ? "active" : ""}
                key={c.slug}
                onClick={() => filter("category", c.slug)}
              >
                {locale === "zh" ? c.name_zh : c.name_en}
              </button>
            ))}
          </>
        )}
      </div>
      <div className="filters">
        <div className="filter-search">
          <Search size={14} />
          <input
            className="input"
            aria-label={t("Filter projects", "筛选项目")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={t(
              "Search name, domain or task…",
              "搜索名称、域名或任务…",
            )}
          />
        </div>
        <select
          aria-label={t("Price type", "价格类型")}
          value={price}
          onChange={(e) => filter("price", e.target.value)}
        >
          <option value="all">{t("All price types", "所有价格类型")}</option>
          <option value="free-options">
            {t("Free / free tier", "免费 / 含免费额度")}
          </option>
          {["free", "freemium", "trial", "paid"].map((v, i) => (
            <option key={v} value={v}>
              {
                [
                  t("Free", "免费"),
                  t("Free tier", "含免费额度"),
                  t("Trial", "试用"),
                  t("Paid", "付费"),
                ][i]
              }
            </option>
          ))}
        </select>
        {charts && (
          <select
            aria-label={t("Statistical month", "统计月份")}
            value={month}
            onChange={(e) => filter("month", e.target.value)}
            disabled={!data.months.length}
          >
            {!data.months.length && (
              <option value="">
                {t("No released month", "暂无已发布月份")}
              </option>
            )}
            {data.months.map((m) => (
              <option key={m.month} value={m.month}>
                {m.month}
              </option>
            ))}
          </select>
        )}
        <span
          className="small muted"
          style={{ marginLeft: "auto", fontSize: 10 }}
        >
          <SlidersHorizontal
            size={11}
            style={{ display: "inline", marginRight: 6 }}
          />
          {charts ? "AITDK · Visits" : t("Research library", "项目研究库")}
        </span>
      </div>
      {charts && !snapshot && (
        <div className="notice">
          {t(
            "No published snapshot for this selection. Profiles remain discoverable; missing visits are not zero or a last-place rank.",
            "当前选择暂无已发布快照。项目仍可被发现，访问量缺失不代表零，也不会自动排在最后。",
          )}
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>{charts ? "#" : t("No.", "序号")}</th>
              <th>{t("Project / domain", "项目 / 域名")}</th>
              <th className="hide-tablet">{t("Category", "分类")}</th>
              <th>{t("Monthly visits", "月访问量")}</th>
              <th className="hide-mobile">{t("MoM", "环比")}</th>
              <th className="hide-medium">{t("History", "历史")}</th>
              <th className="hide-tablet">{t("Pricing", "价格类型")}</th>
              <th className="hide-mobile">{t("Evidence", "证据状态")}</th>
              <th>
                <span className="hide-mobile">{t("Explore", "查看")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => {
              const entry =
                entryMap.get(p.id) ??
                (!charts
                  ? data.snapshots
                      .find(
                        (s) => s.category === p.category && s.month === month,
                      )
                      ?.entries.find((e) => e.project_id === p.id)
                  : undefined);
              const current = entry
                ? data.traffic.find(
                    (x) =>
                      x.id === entry.traffic_id &&
                      x.domain === p.measurement_domain &&
                      x.state === "verified",
                  )
                : undefined;
              const history = data.traffic
                .filter(
                  (x) =>
                    x.domain === p.measurement_domain &&
                    x.source === "AITDK" &&
                    x.metric === "visits" &&
                    x.scope === "worldwide-all-devices-domain" &&
                    x.state === "verified" &&
                    x.month <= month,
                )
                .sort((a, b) => a.month.localeCompare(b.month));
              const idx = current
                  ? history.findIndex((x) => x.id === current.id)
                  : -1,
                previous = idx > 0 ? history[idx - 1] : undefined;
              const categoryName = data.categories.find(
                (c) => c.slug === p.category,
              );
              return (
                <tr key={p.id}>
                  <td className="rank mono">
                    {charts
                      ? current
                        ? String(entry?.rank).padStart(2, "0")
                        : "—"
                      : String(i + (page - 1) * limit + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <Link
                      href={href(
                        `/projects/${p.slug}?from=${encodeURIComponent(compactView ? "/home/charts/" + cat : charts ? "/charts/" + cat : category ? "/charts/" + category : "/projects")}`,
                      )}
                      className="project-cell"
                    >
                      <Avatar name={p.name} size="small" />
                      <div>
                        <div className="project-name">
                          {p.name}
                          {p.demo && (
                            <span
                              className="tag demo"
                              style={{ marginLeft: 6, fontSize: 8 }}
                            >
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="domain mono">{p.domain}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="hide-tablet">
                    <Link className="tag" href={href(`/charts/${p.category}`)}>
                      {locale === "zh"
                        ? categoryName?.name_zh
                        : categoryName?.name_en}
                    </Link>
                  </td>
                  <td className="numeric">
                    {current ? (
                      compact(current.value)
                    ) : (
                      <span className="muted" style={{ fontSize: 10 }}>
                        {t("No data", "暂无数据")}
                      </span>
                    )}
                  </td>
                  <td className="hide-mobile">
                    <Change current={current} previous={previous} />
                  </td>
                  <td className="hide-medium">
                    <Sparkline rows={history} />
                  </td>
                  <td className="hide-tablet muted" style={{ fontSize: 10 }}>
                    {(p as any).price_verified === false
                      ? t("Not checked", "待核对")
                      : [
                          t("Free", "免费"),
                          t("Free tier", "含免费额度"),
                          t("Trial", "试用"),
                          t("Paid", "付费"),
                        ][
                          ["free", "freemium", "trial", "paid"].indexOf(
                            p.price_type,
                          )
                        ]}
                  </td>
                  <td className="hide-mobile">
                    {current ? (
                      <span
                        className={`tag ${dataset === "demo" ? "demo" : "verified"}`}
                      >
                        {dataset === "demo"
                          ? t("Demo verified", "模拟核验")
                          : t("Verified", "已核验")}
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: 10 }}>
                        {entry
                          ? t("Revision needed", "待修订快照")
                          : t("Not ranked", "暂未排名")}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      className="icon-button"
                      href={href(
                        `/projects/${p.slug}?from=${encodeURIComponent(compactView ? "/home/charts/" + cat : charts ? "/charts/" + cat : category ? "/charts/" + category : "/projects")}`,
                      )}
                      aria-label={`${t("View", "查看")} ${p.name}`}
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <Empty title={t("No matching projects", "暂无匹配项目")}>
          <p>
            {t(
              "Try another task or remove a filter.",
              "试试其他任务，或移除筛选条件。",
            )}
          </p>
        </Empty>
      )}
      <div className="table-note">
        <span>
          {snapshot
            ? `${snapshot.month} · AITDK · ${t("worldwide, all devices, domain scope", "全球、全部设备、域名范围")} · ${snapshot.coverage_count}/${snapshot.total_count} ${t("covered", "具备数据")} · v${snapshot.version}`
            : t(
                "Profiles without comparable data remain unranked.",
                "无可比较数据的项目保持未排名。",
              )}{" "}
          {snapshot?.correction_note && (
            <span className="blue"> · {snapshot.correction_note}</span>
          )}
        </span>
        <div className="row nowrap" style={{ gap: 8 }}>
          {!compactView && (
            <>
              <button
                disabled={page <= 1}
                className="button ghost"
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </button>
              <span>
                {page}/{totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                className="button ghost"
                onClick={() => setPage((p) => p + 1)}
              >
                →
              </button>
            </>
          )}
          {compactView && (
            <Link
              className="blue"
              href={href(`/charts?category=${cat}&month=${month}`)}
            >
              {t("View all", "查看全部")} →
            </Link>
          )}
        </div>
      </div>
      {snapshot && (
        <p className="muted small" style={{ fontSize: 10 }}>
          {t("Snapshot generated", "快照生成于")}{" "}
          {new Date(snapshot.created_at).toLocaleString(
            locale === "zh" ? "zh-CN" : "en-US",
          )}{" "}
          ·{" "}
          {t(
            "Coverage of this research library, not the entire industry.",
            "仅代表本研究库的覆盖范围，并非完整行业。",
          )}
        </p>
      )}
    </>
  );
}
export function CategoryIndex() {
  const { data, t, href, locale, api } = useCharts();
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">{t("Explore by purpose", "按照用途探索")}</div>
        <h1>{t("A task, not a buzzword.", "按任务分类，找到实用方案。")}</h1>
        <p>
          {t(
            "Projects are grouped by what they help people do. AI and non-AI products can solve the same task.",
            "以项目实际帮助用户完成的任务组织分类，AI 与非 AI 产品都可以解决相同问题。",
          )}
        </p>
      </div>
      <div className="category-grid">
        {data.categories.map((c, i) => (
          <div className="category-item" key={c.slug}>
            <div className="row between">
              <span className="eyebrow">0{i + 1}</span>
              <span className="tag">
                {data.projects.filter((p) => p.category === c.slug).length}{" "}
                {t("projects", "个项目")}
              </span>
            </div>
            <Link href={href(`/charts/${c.slug}`)}>
              <h3>{locale === "zh" ? c.name_zh : c.name_en} ↗</h3>
            </Link>
            <p>{locale === "zh" ? c.description_zh : c.description_en}</p>
            <div className="row">
              <Link className="button" href={href(`/charts/${c.slug}`)}>
                {t("Explore category", "浏览分类")}
                <ArrowRight size={12} />
              </Link>
              <button
                className="button ghost"
                onClick={() => {
                  void api("follow", {
                    kind: "category",
                    target: c.slug,
                    email_enabled: false,
                    remove: data.follows.some(
                      (f) => f.kind === "category" && f.target === c.slug,
                    ),
                  }).catch(() => {});
                }}
              >
                {data.follows.some(
                  (f) => f.kind === "category" && f.target === c.slug,
                )
                  ? t("Following", "已关注")
                  : t("Follow", "关注")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
export function ProjectDetail({ slug }: { slug: string }) {
  const { data, t, href, locale, dataset, api, busy, notify } = useCharts();
  const p = data.projects.find((x) => x.slug === slug);
  const ref = useEvent(p?.id);
  const [dialog, setDialog] = useState(""),
    [message, setMessage] = useState("");
  const detailParams = useSearchParams();
  const rawSurface = detailParams.get("from");
  const outboundSurface =
    rawSurface &&
    /^\/(home|charts|categories|recommendations|peer-report|shared-report|search|related)(?:\/[a-z0-9_-]+)*$/i.test(
      rawSurface,
    )
      ? rawSurface
      : `/projects/${slug}`;
  if (!p)
    return (
      <Empty
        title={t("Project not found in this dataset", "当前数据集中未找到项目")}
      >
        <Link href={href("/projects")}>{t("Browse projects", "浏览项目")}</Link>
      </Empty>
    );
  const sources = Array.from(
    new Set(
      data.traffic
        .filter(
          (x) => x.domain === p.measurement_domain && x.state === "verified",
        )
        .map((x) => x.source),
    ),
  );
  const selectedSource = detailParams.get("source") ?? sources[0] ?? "AITDK";
  const values = data.traffic
    .filter(
      (x) =>
        x.domain === p.measurement_domain &&
        x.state === "verified" &&
        (!detailParams.get("month") || x.month <= detailParams.get("month")!) &&
        x.source === selectedSource &&
        x.scope === "worldwide-all-devices-domain",
    )
    .sort((a, b) => a.month.localeCompare(b.month));
  const latest = values.at(-1);
  const category = data.categories.find((x) => x.slug === p.category);
  const claim = data.claims.find(
    (x) => x.project_id === p.id && x.state === "approved",
  );
  const seenDomains = new Set<string>();
  const relatedPool = data.relations
    .filter(
      (r) =>
        r.status === "approved" &&
        (r.project_id === p.id || r.peer_domain === p.domain),
    )
    .map((r) => ({
      relation: r,
      project:
        r.project_id === p.id
          ? data.projects.find((x) => x.domain === r.peer_domain)
          : data.projects.find((x) => x.id === r.project_id),
    }))
    .filter(
      (item) =>
        item.project &&
        item.project.id !== p.id &&
        !seenDomains.has(item.project.measurement_domain) &&
        !!seenDomains.add(item.project.measurement_domain),
    );
  const offset = relatedPool.length
    ? Math.floor(Date.parse(data.as_of) / 86400000) % relatedPool.length
    : 0;
  const relations = [
    ...relatedPool.slice(offset),
    ...relatedPool.slice(0, offset),
  ].slice(0, 4);

  const followed = (kind: string) =>
    data.follows.some((f) => f.target === p.id && f.kind === kind);
  async function requestReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(dialog, { project_id: p!.id, message });
      setDialog("");
      setMessage("");
      notify(t("Submitted for review.", "已提交审核。"));
    } catch {}
  }
  return (
    <div ref={ref}>
      <div className="row between" style={{ marginBottom: 25 }}>
        <Link className="muted small" href={href("/projects")}>
          ← {t("Back to projects", "返回项目列表")}
        </Link>
        <div className="row">
          <button
            className="button"
            onClick={() => {
              void api("follow", {
                target: p.id,
                kind: "bookmark",
                remove: followed("bookmark"),
              }).catch(() => {});
            }}
          >
            <Bookmark size={13} />
            {followed("bookmark") ? t("Saved", "已收藏") : t("Save", "收藏")}
          </button>
          <button
            className="button"
            onClick={() => {
              void api("follow", {
                target: p.id,
                kind: "project",
                email_enabled: false,
                remove: followed("project"),
              }).catch(() => {});
            }}
          >
            {followed("project")
              ? t("Following", "已关注")
              : t("Follow updates", "关注更新")}
          </button>
        </div>
      </div>
      <div className="heading-row">
        <div className="detail-heading">
          <Avatar name={p.name} size="large" />
          <div>
            <h1>{p.name}</h1>
            <p className="mono muted small">{p.domain}</p>
          </div>
        </div>
        <a
          className="button primary"
          href={`/out/${p.id}?surface=${encodeURIComponent(outboundSurface)}&lang=${locale}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Visit website", "访问官网")}
          <ExternalLink size={13} />
        </a>
      </div>
      <div className="detail-tags">
        <Link className="tag" href={href(`/charts/${p.category}`)}>
          {locale === "zh" ? category?.name_zh : category?.name_en}
        </Link>
        <span className="tag">{t("Research profile", "资料已收录")}</span>
        {p.enrolled_at && (
          <span className="tag">{t("Enrolled", "正式入驻")}</span>
        )}
        {p.owner_verified && (
          <span className="tag">
            {t("Owner claim approved", "管理者身份已核实")}
          </span>
        )}
        {p.demo && (
          <span className="tag demo">
            {t("Fictional demo project", "虚构演示项目")}
          </span>
        )}
      </div>
      <p className="long-copy">
        {locale === "zh" ? p.description_zh : p.description_en}
      </p>
      <section className="panel">
        <h2>{t("Category positions", "各分类中的位置")}</h2>
        <p className="small muted">
          {t(
            "Classification is reviewed by purpose; broad platforms are contextual and do not rank as individual products.",
            "分类按用途审核；综合平台仅作相关背景，不代表旗下单独产品排名。",
          )}
        </p>
        {data.memberships
          .filter((m) => m.project_id === p.id)
          .map((m) => {
            const c = data.categories.find((c) => c.slug === m.category);
            const snap = data.snapshots.find((s) => s.category === m.category);
            const entry = snap?.entries.find((e) => e.project_id === p.id);
            return (
              <div className="category-update-list" key={m.category}>
                <Link
                  href={href(
                    `/charts/${m.category}${snap ? `?month=${snap.month}&source=${encodeURIComponent(snap.source)}&version=${snap.version}` : ""}`,
                  )}
                >
                  <span>
                    {t(c?.name_en ?? m.category, c?.name_zh ?? m.category)}
                    <small className="block muted">{m.basis}</small>
                  </span>
                  <span>
                    {m.placement === "general"
                      ? t("Related broad platform", "相关综合平台")
                      : m.state !== "confirmed"
                        ? t("Classification under review", "归类待审核")
                        : entry
                          ? `#${entry.rank} · ${snap?.month} · ${snap?.source}`
                          : t("Not ranked this month", "本期暂未排名")}
                  </span>
                </Link>
              </div>
            );
          })}
      </section>
      {sources.length > 1 && (
        <div className="filters">
          <label>
            {t("Traffic source", "访问量来源")}{" "}
            <select
              value={selectedSource}
              onChange={(e) => {
                const qs = new URLSearchParams(detailParams);
                qs.set("source", e.target.value);
                window.location.href = href(`/projects/${p.slug}?${qs}`);
              }}
            >
              {sources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="panel-grid" style={{ marginTop: 25 }}>
        <section className="panel">
          <h2>
            {t("Website traffic", "网站访问量")}{" "}
            <span className="tag demo" style={{ marginLeft: 8 }}>
              {dataset === "demo"
                ? t("SYNTHETIC", "演示数值")
                : t("THIRD-PARTY ESTIMATE", "第三方估算")}
            </span>
          </h2>
          {latest ? (
            <>
              <div className="row between">
                <div>
                  <strong
                    className="numeric"
                    style={{ fontSize: 30, fontWeight: 400 }}
                  >
                    {latest.raw_display ?? numberFormat(latest.value, locale)}
                  </strong>
                  <div className="muted small">
                    {latest.month} · {latest.source} · {t("visits", "访问次数")}
                  </div>
                </div>
                <Change current={latest} previous={values.at(-2)} />
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={values.map((x) => ({
                      month: x.month,
                      visits: x.value,
                    }))}
                    margin={{ top: 25, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#7297ff"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="100%"
                          stopColor="#7297ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#616e89"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#616e89"
                      fontSize={9}
                      tickFormatter={(v) => compact(v)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#191f2c",
                        border: "1px solid #35415a",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                    <Area
                      dataKey="visits"
                      type="linear"
                      stroke="#82a5ff"
                      strokeWidth={2}
                      fill="url(#chartFill)"
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="small muted">
                {t("Measurement domain", "测量域名")}: {p.measurement_domain}
                <br />
                {t(
                  "Worldwide · all devices · domain scope",
                  "全球 · 全部设备 · 域名范围",
                )}{" "}
                · v{latest.version}
              </p>
            </>
          ) : (
            <Empty title={t("No verified visits yet", "暂无已核验访问量")}>
              <p>
                {t(
                  "This project can still be discovered, followed and recommended.",
                  "项目仍可被发现、关注，并在满足条件后进入推荐。",
                )}
              </p>
            </Empty>
          )}
        </section>
        <section className="panel">
          <h2>{t("Profile & provenance", "项目资料与来源")}</h2>
          <dl className="definition-list">
            <dt>{t("Official website", "官网")}</dt>
            <dd>
              <a
                className="blue"
                href={`/out/${p.id}?surface=${encodeURIComponent(outboundSurface)}&lang=${locale}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.website_url} ↗
              </a>
            </dd>
            <dt>{t("Measured object", "测量对象")}</dt>
            <dd className="mono">{p.measurement_domain}</dd>
            <dt>{t("Listing", "收录状态")}</dt>
            <dd>{t("Public research profile", "公开研究资料")}</dd>
            <dt>{t("Enrollment", "入驻状态")}</dt>
            <dd>
              {p.enrolled_at
                ? t("Enrolled", "已正式入驻")
                : t("Not enrolled", "尚未主动入驻")}
            </dd>
            <dt>{t("Pricing", "价格类型")}</dt>
            <dd>
              {(p as any).price_verified === false
                ? t(
                    "Not checked — confirm on the official website",
                    "尚未核对，请以官网为准",
                  )
                : p.price_type}
            </dd>
            <dt>{t("Source check", "官网读取")}</dt>
            <dd>
              {p.demo
                ? t("Synthetic fixture", "演示样本")
                : p.source_checked_at
                  ? `${t("Retrieved", "已读取")} · ${new Date(p.source_checked_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}`
                  : t("Retrieval not confirmed", "尚未确认读取成功")}
            </dd>
            <dt>{t("Updated", "资料更新")}</dt>
            <dd>
              {new Date(p.updated_at).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
              )}
            </dd>
          </dl>
          <div
            className="row"
            style={{
              borderTop: "1px solid var(--line)",
              marginTop: 20,
              paddingTop: 16,
            }}
          >
            <button className="button" onClick={() => setDialog("claim")}>
              <ShieldCheck size={12} />
              {t("Claim this project", "认领项目")}
            </button>
            <button
              className="button ghost"
              onClick={() => setDialog("correction")}
            >
              {t("Suggest a correction", "免费纠错")}
            </button>
            <a
              className="button ghost"
              href={`/api/charts/card/${p.id}?lang=${locale}&dataset=${dataset}&snapshot=${encodeURIComponent(detailParams.get("snapshot") ?? "")}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("Share card", "分享卡片")} ↗
            </a>
          </div>
        </section>
      </div>
      {dialog && (
        <section className="panel">
          <h2>
            {dialog === "claim"
              ? t("Verify management identity", "核实管理者身份")
              : t("Correct a factual error", "更正事实错误")}
          </h2>
          <p>
            {dialog === "claim"
              ? t(
                  "Provide a verifiable official-domain contact or published ownership evidence. Contribution screenshots do not establish identity.",
                  "请提供可核对的官方域名联系方式或公开管理权证据，贡献截图不能证明身份。",
                )
              : t(
                  "Corrections are free and do not require peer contributions. Explain the error and link the source.",
                  "纠错免费，无需完成同行贡献。请说明错误并附来源。",
                )}
          </p>
          <form onSubmit={requestReview}>
            <textarea
              required
              minLength={10}
              maxLength={3000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label={t(
                "Evidence or correction details",
                "身份依据或纠错详情",
              )}
            />
            <div className="review-actions">
              <button disabled={busy} className="button primary">
                {t("Submit for review", "提交审核")}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setDialog("")}
              >
                {t("Cancel", "取消")}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel">
        <h2>{t("Related by task", "按共同任务关联")}</h2>
        {relations.length ? (
          <div className="stack">
            {relations.map(({ relation: r, project: peer }) => {
              return (
                <div className="row between" key={r.id}>
                  <div>
                    <div className="project-name">
                      {peer?.name ?? r.peer_name}
                    </div>
                    <p>
                      {r.task} · {r.rationale}
                    </p>
                  </div>
                  {peer && (
                    <Link
                      className="button"
                      href={href(
                        `/projects/${peer.slug}?from=/related/${p.slug}`,
                      )}
                    >
                      {t("View", "查看")} ↗
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>
            {t(
              "No reviewed task relationships are published for this profile. Nominations alone do not create placements.",
              "此项目暂未发布已审核的任务关系，提名本身不会产生展示位置。",
            )}
          </p>
        )}
      </section>
      <p className="muted small">
        {t(
          "Third-party estimates are not an audit of first-party analytics. A visit or outbound click is not a registration or customer.",
          "第三方估算不是第一方统计审计，访问或出站点击不代表注册或客户。",
        )}
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: p.name,
            description: locale === "zh" ? p.description_zh : p.description_en,
            inLanguage: locale,
            dateModified: p.updated_at,
            about: {
              "@type": "SoftwareApplication",
              name: p.name,
              url: p.website_url,
              applicationCategory: category?.name_en,
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
export function SharedReport({ token }: { token: string }) {
  const { t } = useCharts();
  const [report, setReport] = useState<Report | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/charts/shared/${token}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const x = await r.json();
        if (active) setReport(x);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [token]);
  if (error)
    return (
      <Empty title={t("Shared report unavailable", "分享报告不可用")}>
        <p>
          {t(
            "The owner may have revoked this link.",
            "项目方可能已撤销该分享链接。",
          )}
        </p>
      </Empty>
    );
  if (!report) return <div className="skeleton" />;
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {t("Shared observation group", "分享的同行观察组")}
        </div>
        <h1>{t("My peer comparison", "我的同行对比")}</h1>
        <p>
          {t(
            "A selected group, not the entire industry. Shared voluntarily by the applicant.",
            "申请者自主分享的自选同行组，并非完整行业。",
          )}
        </p>
      </div>
      {report.demo && (
        <div className="notice">
          {t(
            "DEMONSTRATION — synthetic values and review states.",
            "演示样本 — 数值及审核状态均为模拟。",
          )}
        </div>
      )}
      <PeerReportTable peers={report.peers} />
    </>
  );
}
export function Methodology() {
  const { t } = useCharts();
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          123Charts / {t("Methodology", "数据方法")}
        </div>
        <h1>{t("Know what the numbers mean.", "理解每一个数字。")}</h1>
        <p>
          {t(
            "Transparent scope, explicit unknowns and separate rules for ranking and discovery.",
            "口径透明、未知明确，数据排名与项目推荐独立运行。",
          )}
        </p>
      </div>
      <article className="long-copy">
        <h2>{t("One comparable monthly chart", "一个可比较的月榜")}</h2>
        <p>
          {t(
            "A chart uses published snapshots for one category, statistical month, source, visits metric and measurement scope. Current scope: AITDK, worldwide, all devices, domain. Coverage counts refer to the research library, not the whole industry.",
            "榜单使用分类、统计月份、来源、访问量指标与测量范围一致的已发布快照。当前口径为 AITDK、全球、全部设备、域名范围。覆盖数量指研究库，并非整个行业。",
          )}
        </p>
        <h2>{t("Evidence is not automatic proof", "截图需要复核")}</h2>
        <p>
          {t(
            "OCR reads text. A reviewer checks website attribution, month, unit, metric, source and scope, and records the reference and review channel. Duplicate screenshots are not independent measurements. Unresolved conflicts are suspended. No fixed percentage threshold decides truth, and confidence never multiplies visits.",
            "OCR 只负责读取文字。审核员核对网站归属、月份、单位、指标、来源及范围，并记录复核渠道和依据。重复截图不算独立测量，未解决冲突暂停使用。不用固定百分比判定真假，不把可信度乘以访问量。",
          )}
        </p>
        <h2>{t("Free enrollment, real contribution", "免费入驻，有效贡献")}</h2>
        <p>
          {t(
            "Submit ten distinct relevant peer websites and screenshot evidence for five to ten distinct peers. The source calendar defines accepted released months, initially three. A multi-image peer counts once. Corrections and basic public research profiles do not require this task.",
            "提交十个不同的相关同行网站，并为其中五至十个不同同行提供截图证据。接受月份由来源发布日历决定，初始为最近三个已发布月份。同一同行多张图片只计一个。免费纠错和基础研究资料收录不要求完成此任务。",
          )}
        </p>
        <h2>{t("Three independent states", "三种独立状态")}</h2>
        <p>
          {t(
            "Collected means a research profile exists. Claimed means management identity has been reviewed. Enrolled means contribution requirements were met and approved. A website can rank without enrolling, and an enrolled project can have no traffic data.",
            "资料收录代表研究资料存在，身份认领代表管理者身份经过核对，正式入驻代表贡献要求已满足并通过审核。未入驻网站可以凭合格数据参与排名，已入驻项目也可能没有流量数据。",
          )}
        </p>
        <h2>{t("Recommendation is not ranking", "推荐与数据排名独立")}</h2>
        <p>
          {t(
            "Four initial slots: two newly enrolled projects, one adopted contribution and one low-exposure discovery. Related candidates rotate daily with control-subject deduplication. Contribution never changes visits or data ranks. Placement is an opportunity, not a promise of visitors.",
            "首期四个位置：两个新入驻项目、一个有效贡献项目、一个低曝光项目。相关候选按天轮换，同轮去除重复控制主体。贡献不改变访问量或数据名次，推荐不承诺具体访客数量。",
          )}
        </p>
        <h2>{t("Versioned records and corrections", "版本与更正")}</h2>
        <p>
          {t(
            "Source revisions create new data versions. Monthly snapshots retain their inputs, scope and generation time. Rank changes may result from coverage, classification or correction; they are not automatically traffic growth or decline. Missing values stay unknown rather than zero.",
            "来源修订产生新数据版本，月榜快照保留输入、范围与生成时间。名次变化可能由覆盖、分类调整或更正导致，不能自动解释成流量涨跌。缺失值保持未知，不填零。",
          )}
        </p>
        <h2>{t("What effect records measure", "效果记录测量什么")}</h2>
        <p>
          {t(
            "Impressions, project views and outbound clicks are platform events, separate from third-party visits. Click visitors are deduplicated by visitor, project and UTC date. Recognizable bots, tests and self-clicks are excluded from valid discovery estimates. An outbound redirect does not prove the target loaded or converted.",
            "展示、项目页访问与官网出站点击是平台行为，与第三方访问量分开。点击访客按同一访客、同一项目、同一 UTC 日期去重，可识别机器人、测试与自点单独排除。出站跳转不证明官网已加载，更不证明转化。",
          )}
        </p>
        <h2>
          {t("Local preview and public availability", "本地预览与公开发布")}
        </h2>
        <p>
          {t(
            "All local pages are noindex. Demo traffic is synthetic, stored separately and visibly labeled. Real-data mode shows only actual evidence. No TabAPI, GSC or GA4 connection is claimed. Core browsing, submissions, approved profiles and basic discovery are free. Search indexing, SEO outcomes and AI citations are not guaranteed.",
            "本地页面整体 noindex。演示流量为模拟，独立存储并明确标注。真实数据模式仅显示实际证据，不宣称已接通 TabAPI、GSC 或 GA4。核心浏览、提交、审核通过的资料与基础发现免费，不保证搜索收录、SEO 结果或 AI 引用。",
          )}
        </p>
      </article>
    </>
  );
}
