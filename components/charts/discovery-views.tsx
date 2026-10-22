"use client";
import { OwnerProfileAssist } from "./owner-profile-assist";
import { brand } from "@/lib/charts/brand";
import { FavoriteButton, SiteUnit, NavigationHome } from "./navigation-ui";
import {
  localText,
  stableProjects,
  searchScore,
  orderAlternativeChoices,
  languageNames,
} from "@/lib/charts/navigation";
import { OfficialLink } from "./official-link";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Search,
  Bookmark,
  ArrowRight,
  Code2,
  Workflow,
  Database,
  Check,
  Shuffle,
} from "lucide-react";
import { useCharts, Avatar, Empty, Status } from "./context";
import { useEvent } from "./use-event";
import {
  alternatives,
  discover,
  priceLabel,
  profileReady,
  sustainedFree,
  prices,
} from "@/lib/charts/discovery";
import type { Project, Report } from "@/lib/charts/types";
export function SaveButton({
  p,
  kind = "bookmark",
}: {
  p: Project;
  kind?: string;
}) {
  const { data, api, t, href } = useCharts();
  const pathname = usePathname(),
    query = useSearchParams();
  const active = data.follows.some((f) => f.kind === kind && f.target === p.id);
  if (kind === "bookmark") return <FavoriteButton p={p} />;
  return data.user ? (
    <button
      className="button ghost"
      aria-label={t("Save " + p.name, "收藏 " + p.name)}
      onClick={() =>
        void api("follow", { kind, target: p.id, remove: active }).catch(
          () => {},
        )
      }
    >
      <Bookmark size={14} fill={active ? "currentColor" : "none"} />
      {kind === "alternatives"
        ? t(
            active ? "Following alternatives" : "Follow alternatives",
            active ? "已关注替代方案" : "关注替代方案",
          )
        : t(active ? "Saved" : "Save", active ? "已收藏" : "收藏")}
    </button>
  ) : (
    <Link
      className="button ghost"
      href={href(
        "/login?returnTo=" + encodeURIComponent(pathname + "?" + query),
      )}
    >
      <Bookmark size={14} />
      {t("Save", "收藏")}
    </Link>
  );
}
export function WebsiteRow({
  p,
  surface,
  task,
  reason,
}: {
  p: Project;
  surface: string;
  task?: string;
  reason?: string;
}) {
  return <SiteUnit p={p} surface={surface} task={task} reason={reason} />;
}

export function CategoryLinks() {
  const { data, t, href, locale } = useCharts();
  const icons = [Code2, Database, Workflow];
  return (
    <div className="discovery-categories">
      {data.categories.map((c, i) => {
        const Icon = icons[i];
        return (
          <Link key={c.slug} href={href("/categories/" + c.slug)}>
            <Icon size={21} />
            <div>
              <strong>{locale === "zh" ? c.name_zh : c.name_en}</strong>
              <small>
                {
                  data.projects.filter(
                    (p) => p.category === c.slug && profileReady(p),
                  ).length
                }{" "}
                {t("tools", "个工具")} <ArrowRight size={12} />
              </small>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
export function DiscoveryHome() {
  return <NavigationHome />;
}
export function DiscoveryListing({
  category,
  mode = "discover",
}: {
  category?: string;
  mode?: "discover" | "new" | "free" | "open-source";
}) {
  const { data, t, href, locale } = useCharts(),
    params = useSearchParams(),
    router = useRouter();
  const [filterQuery, setFilterQuery] = useState(params.toString());
  useEffect(() => setFilterQuery(params.toString()), [params]);
  const filters = new URLSearchParams(filterQuery),
    q = filters.get("q") || "",
    price = filters.get("price") || "",
    language = filters.get("language") || "",
    oss = filters.get("oss") === "1",
    view = filters.get("view") || mode;
  const intent = filters.get("intent"),
    sort = view === "new" ? "new" : filters.get("sort") || "default";
  const c = data.categories.find((c) => c.slug === category),
    selectedCategory = category || filters.get("category") || "";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setFilterQuery(next.toString());
    window.history.replaceState(null, "", "?" + next.toString());
  };
  const filtered = stableProjects(data.projects.filter(profileReady)).filter(
    (p) =>
      (!selectedCategory || p.category === selectedCategory) &&
      searchScore(p, q) > 0 &&
      (!price || (p.price_verified ? p.price_type : "unknown") === price) &&
      (!language || p.supported_languages?.includes(language)) &&
      (!oss || p.is_open_source) &&
      (view !== "free" || sustainedFree(p)) &&
      (mode !== "open-source" || p.is_open_source),
  );
  const ordered = [...filtered].sort((a, b) =>
    q
      ? searchScore(b, q) - searchScore(a, q)
      : sort === "new"
        ? (b.first_published_at || "").localeCompare(a.first_published_at || "")
        : 0,
  );
  const page = Math.max(1, Number(filters.get("page")) || 1),
    rows = ordered.slice((page - 1) * 12, page * 12);
  const isSearch = !!q || intent === "alternatives",
    targets = data.projects.filter(
      (p) =>
        alternatives(p, data.projects, data.relations).length > 0 &&
        (!selectedCategory || p.category === selectedCategory) &&
        searchScore(p, q) > 0,
    );
  return (
    <div className="discovery-page navigation-listing">
      <header className="directory-heading">
        <div className="breadcrumb">
          <Link href={href("/")}>{t("Home", "首页")}</Link> /{" "}
          <Link href={href("/categories")}>{t("Categories", "全部分类")}</Link>
        </div>
        <h1>
          {c
            ? locale === "zh"
              ? c.name_zh
              : c.name_en
            : isSearch
              ? intent === "alternatives"
                ? t("Alternatives for “" + q + "”", "“" + q + "”的替代入口")
                : t("Results for “" + q + "”", "“" + q + "”的搜索结果")
              : mode === "free"
                ? t("Free to use", "免费可用")
                : mode === "open-source"
                  ? t("Open source tools", "开源工具")
                  : mode === "new"
                    ? t("New listings chart", "最新收录榜")
                    : t("Tool directory", "工具目录")}
        </h1>
        <p>
          {c
            ? locale === "zh"
              ? c.description_zh
              : c.description_en
            : isSearch
              ? t(
                  "Exact matches first. Choose a tool or compare alternatives.",
                  "精确匹配优先，选择官网或继续比较。",
                )
              : mode === "new"
                ? t(
                    "Ordered by first public listing date, not product launch date. Editing a profile never resets it.",
                    "按首次审核公开时间排序，不代表产品首发时间；编辑资料不重置收录日期。",
                  )
                : t(
                    "Compare tasks and conditions. Tool names open their official websites.",
                    "比较用途和使用条件，点击工具名称直达官网。",
                  )}
        </p>
      </header>
      {category && (
        <nav className="view-tabs" aria-label={t("Category views", "分类视图")}>
          {[
            ["discover", t("Directory", "工具导航")],
            ["new", t("Newly listed", "新收录")],
            ["free", t("Free to use", "免费可用")],
            ["alternatives", t("Alternatives", "找替代方案")],
          ].map(([v, label]) => (
            <Link
              key={v}
              className={view === v ? "active" : ""}
              href={href(
                "/categories/" +
                  category +
                  "?" +
                  new URLSearchParams({
                    ...Object.fromEntries(filters),
                    view: v,
                    page: "1",
                  }),
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <div className="discovery-filters">
        <label>
          <Search size={14} />
          <input
            aria-label={t("Search tools", "搜索工具")}
            value={q}
            onChange={(e) => set("q", e.target.value)}
            placeholder={t("Tool, domain, task", "工具、域名、任务")}
          />
        </label>
        {!category && (
          <select
            aria-label={t("Category", "分类")}
            value={selectedCategory}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">{t("All categories", "全部分类")}</option>
            {data.categories.map((c) => (
              <option value={c.slug} key={c.slug}>
                {locale === "zh" ? c.name_zh : c.name_en}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label={t("Price type", "价格类型")}
          value={price}
          onChange={(e) => set("price", e.target.value)}
        >
          <option value="">{t("All prices", "全部价格")}</option>
          {Object.entries(prices).map(([v, l]) => (
            <option key={v} value={v}>
              {l[locale === "zh" ? 1 : 0]}
            </option>
          ))}
        </select>
        <select
          aria-label={t("Supported language", "支持语言")}
          value={language}
          onChange={(e) => set("language", e.target.value)}
        >
          <option value="">{t("All languages", "全部语言")}</option>
          {[
            ...new Set(
              data.projects.flatMap((p) => p.supported_languages || []),
            ),
          ]
            .sort()
            .map((l) => (
              <option key={l}>{l}</option>
            ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={oss}
            onChange={(e) => set("oss", e.target.checked ? "1" : "")}
          />
          {t("Open source", "开源")}
        </label>
        {!isSearch && (
          <select
            aria-label={t("Order", "排序")}
            value={sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="default">{t("Stable default", "默认顺序")}</option>
            <option value="new">{t("Newly listed", "新收录")}</option>
            <option value="name">{t("Name", "名称")}</option>
          </select>
        )}
      </div>
      <p className="result-count">
        {intent === "alternatives" ? targets.length : filtered.length}{" "}
        {t("matching tools", "个匹配工具")}
        {mode === "free"
          ? t(
              " · sustained free use only; trials excluded",
              " · 持续免费，限时试用不计入",
            )
          : ""}
      </p>
      <p className="ordering-note">
        {isSearch
          ? t("Order: exact matches first", "当前排序：精确匹配优先")
          : sort === "new"
            ? t(
                "Order: first public listing, newest first",
                "当前排序：首次公开收录时间倒序",
              )
            : t("Order: name A–Z, stable", "当前排序：名称 A–Z，稳定顺序")}{" "}
        ·{" "}
        <Link href={href("/how-it-works") + "#data-and-order"}>
          {t("Sorting explained", "排序说明")}
        </Link>
      </p>
      {view === "alternatives" || intent === "alternatives" ? (
        <div className="alternative-shortcuts">
          {targets.map((p) => (
            <Link key={p.id} href={href("/alternatives/" + p.slug)}>
              {p.name}
              <span>
                {alternatives(p, data.projects, data.relations).length}{" "}
                {t("choices", "个选择")} →
              </span>
            </Link>
          ))}
          {!targets.length && (
            <Empty
              title={t(
                "No confirmed alternative target yet",
                "暂无匹配的有效替代入口",
              )}
            >
              <Link href={href("/projects?q=" + encodeURIComponent(q))}>
                {t("Browse related tools", "查看相关工具")}
              </Link>
            </Empty>
          )}
        </div>
      ) : rows.length ? (
        <div className="directory-results">
          {rows.map((p) => (
            <div key={p.id}>
              <SiteUnit
                p={p}
                showConditions
                surface={
                  category
                    ? "/categories/" + category
                    : isSearch
                      ? "/search"
                      : mode === "free"
                        ? "/free"
                        : mode === "open-source"
                          ? "/open-source"
                          : mode === "new"
                            ? "/new"
                            : "/projects"
                }
              />
              {sort === "new" && (
                <small className="muted">
                  {t("First listed", "首次收录")}{" "}
                  {p.first_published_at?.slice(0, 10) ||
                    t("Not recorded", "尚未记录")}
                  {p.first_publication_inferred
                    ? t(" · estimated historical date", " · 历史日期为估计")
                    : ""}
                </small>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty title={t("No matching tools", "暂无匹配工具")}>
          <p>
            {t(
              "Try another term or clear your filters.",
              "换一个关键词，或清除筛选条件。",
            )}
          </p>
          <Link
            className="button"
            href={href(category ? "/categories/" + category : "/projects")}
          >
            {t("Clear filters", "清除筛选")}
          </Link>
          <Link className="button ghost" href={href("/categories")}>
            {t("Explore categories", "浏览相关分类")}
          </Link>
        </Empty>
      )}
      {ordered.length > 12 && view !== "alternatives" && (
        <nav className="pagination" aria-label={t("Pages", "分页")}>
          {Array.from({ length: Math.ceil(ordered.length / 12) }, (_, i) => (
            <Link
              key={i}
              className={"button " + (page === i + 1 ? "primary" : "")}
              href={
                "?" +
                new URLSearchParams({
                  ...Object.fromEntries(filters),
                  page: String(i + 1),
                })
              }
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function DiscoveryCategories() {
  const { t, href } = useCharts();
  return (
    <div className="discovery-page navigation-listing">
      <header className="directory-heading">
        <h1>{t("All categories", "全部分类")}</h1>
        <p>
          {t(
            "Discover global tools, starting with AI coding, knowledge and retrieval development, and workflow automation.",
            "发现全球工具，当前聚焦 AI 编程辅助、知识库与检索开发、工作流自动化。",
          )}
        </p>
      </header>
      <CategoryLinks />
      <div className="row">
        <Link className="button" href={href("/free")}>
          {t("Free to use", "免费可用")}
        </Link>
        <Link className="button" href={href("/open-source")}>
          {t("Open source", "开源发现")}
        </Link>
        <Link className="button" href={href("/new")}>
          {t("Newly listed", "新收录")}
        </Link>
      </div>
    </div>
  );
}
export function AlternativesPage({ slug }: { slug?: string }) {
  const { data, href, t, locale } = useCharts(),
    params = useSearchParams(),
    router = useRouter();
  const target = data.projects.find((p) => p.slug === slug);
  if (!target)
    return (
      <div className="discovery-page navigation-listing">
        <header className="directory-heading">
          <h1>{t("Alternative charts", "替代榜单")}</h1>
          <p>
            {t(
              "Choose a target and task, then compare differences and conditions. Candidate order is by name or first public listing date.",
              "选择目标与任务，比较差异和条件；候选可按名称或首次公开收录时间排列。",
            )}
          </p>
        </header>
        <div className="alternative-shortcuts">
          {data.projects
            .filter(
              (p) => alternatives(p, data.projects, data.relations).length > 0,
            )
            .map((p) => (
              <Link href={href("/alternatives/" + p.slug)} key={p.id}>
                {p.name}
                <span>
                  {alternatives(p, data.projects, data.relations).length}{" "}
                  {t("choices", "个选择")} →
                </span>
              </Link>
            ))}
        </div>
      </div>
    );
  const choices = alternatives(target, data.projects, data.relations),
    tasks = [...new Set(choices.map((c) => c.task))],
    task = params.get("task") || "",
    order = params.get("sort") === "new" ? "new" : "name",
    matched = orderAlternativeChoices(choices, task, order);
  return (
    <div className="discovery-page navigation-alternatives">
      <header className="directory-heading">
        <div className="breadcrumb">
          <Link href={href("/alternatives")}>
            {t("Alternatives", "找替代")}
          </Link>{" "}
          / {target.name}
        </div>
        <h1>
          {t("Alternatives to " + target.name, target.name + " 替代方案")}
        </h1>
        <p>
          {t("Other ways to complete: ", "换一种方式完成：")}
          {task
            ? localText(task, locale)
            : tasks.length === 1
              ? localText(tasks[0], locale)
              : tasks.length > 1
                ? t("all confirmed tasks", "全部已确认用途")
                : localText(target.task, locale)}
        </p>
        <div className="row">
          <OfficialLink
            productId={target.id}
            surface={"/alternatives/" + target.slug}
            target="_blank"
            rel="noopener"
            className="button"
          >
            {t("Target website", "目标官网")} ↗
          </OfficialLink>
          <SaveButton p={target} kind="alternatives" />
          <Link
            className="button ghost"
            href={href("/products/" + target.slug)}
          >
            {t("About the target", "目标简介")}
          </Link>
        </div>
      </header>
      {tasks.length > 1 && (
        <label className="task-selector">
          {t("Compare task", "比较任务")}
          <select
            aria-label={t("Common task", "共同任务")}
            value={task}
            onChange={(e) => {
              const q = new URLSearchParams(params.toString());
              e.target.value ? q.set("task", e.target.value) : q.delete("task");
              router.replace("?" + q, { scroll: false });
            }}
          >
            <option value="">
              {t("All confirmed tasks", "全部已确认用途")}
            </option>
            {tasks.map((x) => (
              <option key={x} value={x}>
                {localText(x, locale)}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="result-count">
        {matched.length}{" "}
        {t(
          "confirmed choices · related for this task, not identical in every feature",
          "个已确认选择 · 用途相关，不代表全部功能等同",
        )}
      </p>
      <div className="alternative-order">
        <label>
          {t("Sort candidates", "候选排序")}
          <select
            aria-label={t("Candidate order", "候选排序")}
            value={order}
            onChange={(e) => {
              const next = new URLSearchParams(params.toString());
              next.set("sort", e.target.value);
              router.replace("?" + next, { scroll: false });
            }}
          >
            <option value="name">{t("Name A–Z", "名称 A–Z")}</option>
            <option value="new">
              {t("First public listing — newest", "首次公开收录时间倒序")}
            </option>
          </select>
        </label>
        <span>
          {order === "new"
            ? t(
                "Current order: first public listing date",
                "当前排序：首次公开收录时间倒序",
              )
            : t("Current order: name A–Z", "当前排序：名称 A–Z")}{" "}
          ·{" "}
          <Link href={href("/how-it-works") + "#data-and-order"}>
            {t("Sorting explained", "排序说明")}
          </Link>
        </span>
      </div>
      {matched.map((x) => (
        <article key={x.project.id + x.task} className="alternative-candidate">
          <SiteUnit
            p={x.project}
            task={x.task}
            surface={"/alternatives/" + target.slug}
          />
          <div className="candidate-facts">
            <div>
              <small>{t("Key difference", "特点与适用条件")}</small>
              <p>
                {localText(x.project.differentiator, locale) ||
                  t("Details not yet confirmed", "特点待确认")}
              </p>
            </div>
            <div>
              <small>{t("Pricing & limits", "价格与限制")}</small>
              <p>
                {localText(x.project.conditions, locale) ||
                  t(
                    "Conditions not recorded. Check the official website.",
                    "使用条件待补充，请查看官网。",
                  )}
              </p>
              {!x.project.price_verified && (
                <p className="muted">
                  {t(
                    "Pricing not yet confirmed. Check current official terms.",
                    "价格尚未确认，请以官网当前说明为准。",
                  )}
                </p>
              )}
              <p>
                {t("Supported languages", "支持语言")} ·{" "}
                {languageNames(x.project.supported_languages, locale)}
              </p>
            </div>
          </div>
          {order === "new" && (
            <p className="ordering-note">
              {t("First public listing", "首次公开收录")}：{" "}
              {x.project.first_published_at?.slice(0, 10) ||
                t("Not recorded", "尚未记录")}
              {x.project.first_publication_inferred
                ? t(" · estimated historical date", " · 历史日期为估计")
                : ""}
            </p>
          )}
          <details className="comparison-source">
            <summary>
              {t("Relationship basis & sources", "关系依据与资料来源")}
            </summary>
            <p>{localText(x.rationale, locale)}</p>
            <p>
              {x.project.official_source ||
                t("Source to be supplemented", "来源待补充")}{" "}
              · {t("Updated", "资料更新于")}{" "}
              {x.project.updated_at?.slice(0, 10) ||
                t("Not recorded", "尚未记录")}{" "}
              · {t("Source checked", "来源核对日期")}{" "}
              {x.project.source_checked_at?.slice(0, 10) ||
                t("Not recorded", "尚未记录")}{" "}
              ·{" "}
              <Link href={href("/products/" + x.project.slug) + "#corrections"}>
                {t("Report an error", "纠错")}
              </Link>
            </p>
          </details>
        </article>
      ))}
      {!matched.length && (
        <Empty
          title={t(
            "No confirmed candidates for this task",
            "此用途暂无已确认候选",
          )}
        >
          <Link href={href("/categories/" + target.category)}>
            {t("Browse this category", "查看同类工具")} →
          </Link>
        </Empty>
      )}
    </div>
  );
}

export function DiscoveryDetail({ slug }: { slug: string }) {
  const { data, t, href, locale, api, dataset, busy } = useCharts();
  const p = data.projects.find((p) => p.slug === slug);
  const pathname = usePathname(),
    query = useSearchParams();
  const ref = useEvent(p?.id);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<"claim" | "correction">(
    query.get("claim") === "1" ? "claim" : "correction",
  );
  if (!p) return <Empty title={t("Project unavailable", "项目不可用")} />;
  const related = alternatives(p, data.projects, data.relations);
  return (
    <div className="discovery-page" ref={ref}>
      {p.review_state === "pending" && (
        <p className="source-pending">
          {t(
            "Public submission · pending review. Profile details and proposed alternatives are not independently confirmed.",
            "公开投稿 · 待审核。资料与提议的替代关系尚未独立核实。",
          )}
        </p>
      )}
      <div className="page-heading">
        <div className="row">
          <Avatar name={p.name} />
          <div>
            <div className="eyebrow">{p.domain}</div>
            <h1>{p.name}</h1>
          </div>
        </div>
        <p>{locale === "zh" ? p.description_zh : p.description_en}</p>
        <div className="row">
          {p.price_verified && (
            <span className="tag">{priceLabel(p, locale === "zh")}</span>
          )}
          {p.is_open_source && (
            <a className="tag" href={p.open_source_url} rel="nofollow noopener">
              {t("Open source", "开源")}
            </a>
          )}
          {profileReady(p) && (
            <span className="tag">{brand[locale].listed}</span>
          )}
          <span className="tag">
            {p.owner_verified
              ? t("Owner claimed", "管理者已认领")
              : t("Community listing · unclaimed", "社区收录 · 未认领")}
          </span>
        </div>
      </div>
      <div className="row">
        <OfficialLink
          className="button primary"
          productId={p.id}
          surface={"/products/" + p.slug}
        >
          {t("Visit website", "前往官网")}
          <ArrowUpRight size={15} />
        </OfficialLink>
        <SaveButton p={p} />
        {related.length > 0 && <SaveButton p={p} kind="alternatives" />}
        {related.length > 0 && (
          <Link className="button" href={href("/alternatives/" + p.slug)}>
            {t("Compare alternatives", "比较替代方案")} →
          </Link>
        )}
      </div>
      <section className="owner-listing-note" id="owner-claim">
        <h2>{t("Is this your project?", "这是你的项目吗？")}</h2>
        <p>
          {t(
            "123Charts maintains a short introduction and official website link. Claim your project to add pricing, languages, features, conditions and updates. Identity and submitted facts are reviewed separately.",
            "123Charts 整理项目简介并提供官网入口。项目方认领后，可补充价格、语言、功能、使用条件和更新；管理身份与提交资料分别审核。",
          )}
        </p>
        <div className="row">
          <a
            className="button primary"
            href="#corrections"
            onClick={() => setAction("claim")}
          >
            {t("Claim and complete this profile", "认领并补充项目资料")}
          </a>
          <Link className="button" href={href("/submit?project=" + p.id)}>
            {t("Already claimed? Update details", "已认领？更新资料")}
          </Link>
        </div>
        <OwnerProfileAssist name={p.name} websiteURL={p.website_url} />
      </section>
      <details className="supplemental-profile">
        <summary>
          {t("Existing supplementary information", "查看已有补充资料")}
        </summary>
        <p className="muted">
          {t(
            "Preserved reference information. A claimed identity does not establish who supplied each field or independently verify it. Owners can submit corrections and updates.",
            "保留已有参考资料；已认领不代表每个字段均由项目方提供或已经独立核实。项目方可提交修正与更新。",
          )}
        </p>
        <div className="discovery-facts">
          <div>
            <small>{t("PRIMARY TASK", "主要用途")}</small>
            <h2>
              {localText(p.task, locale) || t("To be confirmed", "待补充")}
            </h2>
            <p>
              {localText(p.differentiator, locale) ||
                t("Details are being maintained.", "详细资料待完善。")}
            </p>
          </div>
          <div>
            <small>{t("CONDITIONS & LIMITS", "使用条件与限制")}</small>
            <p>
              {localText(p.conditions, locale) ||
                t(
                  "Pricing conditions have not yet been confirmed. Check the official website.",
                  "价格与使用条件尚未确认，请查看官网。",
                )}
            </p>
            <p>
              {t("Languages", "支持语言")} ·{" "}
              {languageNames(p.supported_languages, locale)}
            </p>
          </div>
        </div>
      </details>
      <div className="row">
        <small className="muted">
          {t("First public listing", "首次公开收录")} ·{" "}
          {p.first_published_at?.slice(0, 10) || t("Unknown", "未知")}
          {p.first_publication_inferred &&
            t(" (estimated historical date)", "（历史日期为估计）")}
          <br />
          {t("Profile updated", "资料更新")} ·{" "}
          {p.updated_at?.slice(0, 10) || t("Not recorded", "尚未记录")}
        </small>
        <Link href={href("/categories/" + p.category)}>
          {
            data.categories.find((c) => c.slug === p.category)?.[
              locale === "zh" ? "name_zh" : "name_en"
            ]
          }{" "}
          →
        </Link>
      </div>
      <section>
        <h2>
          {t("Another way to complete this task", "完成相关任务的其他选择")}
        </h2>
        {related.length ? (
          related
            .slice(0, 5)
            .map((x) => (
              <WebsiteRow
                key={x.project.id + x.task}
                p={x.project}
                task={x.task}
                surface={"/products/" + p.slug}
              />
            ))
        ) : (
          <p className="muted">
            {t(
              "No related choices have been confirmed yet.",
              "暂无已确认的相关选择。",
            )}
          </p>
        )}
      </section>
      <section>
        <h2>{t("A factual card, ready to share", "可分享的收录卡")}</h2>
        <p className="muted">
          {t(
            "The listing card shows the project introduction and official profile link. Sharing is optional.",
            "收录卡展示项目简介和档案链接，分享完全自愿。",
          )}
        </p>
        <div className="row">
          {[
            "listing",
            ...(sustainedFree(p) ? ["free"] : []),
            ...(data.relations.some(
              (r) =>
                r.project_id === p.id &&
                r.status === "approved" &&
                !r.withdrawn_at,
            )
              ? ["alternative"]
              : []),
          ].map((kind) => (
            <a
              key={kind}
              className="button"
              target="_blank"
              rel="noopener"
              href={`/api/charts/card/${p.id}?dataset=${dataset}&lang=${locale}&kind=${kind}`}
            >
              {kind === "listing"
                ? t("Listing card PNG", "收录卡 PNG")
                : kind === "free"
                  ? t("Free plan card PNG", "免费方案卡 PNG")
                  : t("Alternative card PNG", "替代卡 PNG")}{" "}
              ↗
            </a>
          ))}
        </div>
      </section>
      <section id="corrections">
        <h2>{t("Keep this profile accurate", "维护正确的项目资料")}</h2>
        <p className="muted">
          {t(
            "Corrections are free and independent of submission. Identity claims grant management access, not quality certification.",
            "纠错免费开放，无需完成投稿。身份认领授予管理权限，不代表质量认证。",
          )}
        </p>
        {data.user ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api(action, { project_id: p.id, message });
                setMessage("");
              } catch {}
            }}
          >
            <select
              aria-label={t("Request type", "请求类型")}
              value={action}
              onChange={(e) => setAction(e.target.value as typeof action)}
            >
              <option value="correction">
                {t("Free correction", "免费纠错")}
              </option>
              <option value="claim">
                {t("Claim management identity", "认领管理身份")}
              </option>
            </select>
            <textarea
              required
              minLength={10}
              aria-label={t("Evidence or correction details", "依据或纠错说明")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(
                "Describe the correction or provide verifiable ownership evidence.",
                "说明具体错误，或提供可核验的管理身份依据。",
              )}
            />
            <button className="button" disabled={busy}>
              {t("Send for review", "提交审核")}
            </button>
          </form>
        ) : (
          <Link
            className="button"
            href={href(
              "/login?returnTo=" +
                encodeURIComponent(
                  pathname +
                    "?" +
                    new URLSearchParams({
                      ...Object.fromEntries(query),
                      ...(action === "claim" ? { claim: "1" } : {}),
                    }) +
                    "#corrections",
                ),
            )}
          >
            {t("Sign in to correct or claim", "登录后纠错或认领")}
          </Link>
        )}
      </section>
      <p className="muted">
        {t("Research source", "资料来源")} ·{" "}
        {p.official_source?.startsWith("http") ? (
          <a href={p.official_source} rel="nofollow noopener">
            {p.official_source}
          </a>
        ) : (
          p.official_source || t("To be supplemented", "待补充")
        )}{" "}
        ·{" "}
        {p.source_checked_at?.slice(0, 10) ||
          t("Check date not recorded", "核对日期尚未记录")}
      </p>
    </div>
  );
}
export function ComparisonTable({ report }: { report: Report }) {
  const { data, t, locale, href } = useCharts();
  const own = data.projects.find((p) => p.id === report.project_id);
  return (
    <div>
      {report.demo && <p className="notice">DEMO / 虚构演示案例</p>}
      <p className="notice">
        {t(
          "Your selected comparison group. Current shared profile data is shown; this is not an industry ranking. Unknowns stay unknown.",
          "你的自选同类对照清单。读取当前项目资料，不代表行业排名，未知信息保持未知。",
        )}
      </p>
      {[
        ...(own
          ? [
              {
                domain: own.domain,
                name: own.name,
                task: own.task,
                rationale: "",
              },
            ]
          : []),
        ...report.peers,
      ].map((peer, i) => {
        const p = data.projects.find((p) => p.domain === peer.domain);
        return (
          <div className="comparison-detail" key={peer.domain}>
            <strong>
              {p ? (
                <Link href={href("/products/" + p.slug)}>{p.name}</Link>
              ) : (
                peer.name
              )}
            </strong>
            <p>
              {peer.task} · {peer.rationale}
            </p>
            <p>
              {p ? priceLabel(p, locale === "zh") : t("Unconfirmed", "待确认")}{" "}
              ·{" "}
              {p?.supported_languages?.join(" / ") ||
                t("Languages to be confirmed", "语言待补充")}
            </p>
            <p>
              {p?.differentiator ||
                t("Characteristics to be supplemented", "特点待补充")}{" "}
              ·{" "}
              {p?.conditions ||
                t("Conditions to be supplemented", "使用条件待补充")}
            </p>
            {p ? (
              <OfficialLink productId={p.id} surface="/reports">
                {t("Official website", "官网")} ↗
              </OfficialLink>
            ) : (
              <span className="muted">
                {peer.domain} ·{" "}
                {t("Research profile pending review", "研究资料待审核")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
export function DiscoveryReport({ id }: { id: string }) {
  const { data, t, api, href, busy } = useCharts();
  const report = data.reports.find((r) => r.id === id);
  if (!report)
    return (
      <Empty
        title={t("Private comparison unavailable", "无法访问此私有对照清单")}
      />
    );
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <h1>{t("Your comparison shortlist", "你的同类对照清单")}</h1>
      </div>
      <ComparisonTable report={report} />
      <div className="row">
        <button
          className="button"
          disabled={busy || report.owner_id !== data.user?.id}
          onClick={() =>
            void api("share", { id, enabled: !report.share_token }).catch(
              () => {},
            )
          }
        >
          {report.share_token
            ? t("Revoke sharing", "撤销分享")
            : t("Enable sharing", "开启分享")}
        </button>
        {report.share_token && (
          <Link className="button" href={href("/shared/" + report.share_token)}>
            {t("Open shared comparison", "打开分享清单")}
          </Link>
        )}
      </div>
    </div>
  );
}
export function DiscoveryShared({ token }: { token: string }) {
  const { t } = useCharts();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/charts/shared/" + token, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((r) => {
        if (live) setReport(r);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [token]);
  return (
    <div className="discovery-page">
      <h1>{t("Shared comparison shortlist", "分享的同类对照清单")}</h1>
      {report ? (
        <ComparisonTable report={report} />
      ) : (
        <p>
          {error
            ? t(
                "This share was revoked or is unavailable.",
                "分享已撤销或不可用。",
              )
            : t("Loading…", "加载中…")}
        </p>
      )}
    </div>
  );
}
export function DiscoveryMethod() {
  const { t, locale } = useCharts();
  return (
    <div className="discovery-page method-copy">
      <div className="page-heading">
        <h1>{t("How discovery works", "收录与发现规则")}</h1>
        <p>
          {t(
            "Free discovery, with conditions you can understand.",
            "免费发现，规则清楚。",
          )}
        </p>
      </div>
      <p className="brand-positioning">{brand[locale].positioning}</p>
      <p>{brand[locale].vision}</p>
      <p>{brand[locale].platformFree}</p>
      <p>
        {t(
          "Platform curation covers a project introduction and official website link. Owners claim management access and supply extended details, optionally using the on-page AI prompt. AI drafts do not grant identity, verification or publication.",
          "平台整理项目简介与官网链接；扩展资料由项目方认领后补充，可使用页面提供的 AI 核实提示词。AI 草稿不授予身份、核验状态或公开权限。",
        )}
      </p>
      <section id="data-and-order" className="transparent-rules">
        <h2>{t("Sources & sorting", "资料与排序说明")}</h2>
        <p>
          {t(
            "Category navigation uses a stable name order. Alternative charts include confirmed task relationships only, sorted by name A–Z by default; you can switch to first public listing date. Neither is an external traffic or quality ranking.",
            "分类基础导航按名称保持稳定。替代榜单仅纳入已确认的任务关系，默认按名称 A–Z 排列，可切换首次公开收录时间；这些顺序不代表外部访问量或产品质量。",
          )}
        </p>
        <p>
          {t(
            "New listings are ordered by first public listing date, not the product's launch date. Edits do not reset it. Estimated historical dates and missing dates are identified; unknown values are not invented.",
            "最新收录榜按首次审核公开时间倒序，不代表产品首发时间；编辑不重置该时间。历史日期为估计或尚未记录时如实标明，不补造日期。",
          )}
        </p>
        <p>
          {t(
            "Tool profiles show maintained sources and update dates when available; missing sources and dates remain unconfirmed. A recorded update is not an independent pricing verification. Use each profile's correction entry to report errors. New discovery and contribution slots rotate separately from the directory.",
            "项目档案在有记录时显示资料来源与更新时间，缺失则标为待补充；资料更新不等于价格已独立核验。可通过各项目的纠错入口反馈错误。新发现与贡献推荐在独立区域轮换，不改变基础导航。",
          )}
        </p>
        <p>
          {t(
            "Source links identify the recorded reference, not who supplied it. When contributor identity or a verification date is not recorded, neither is inferred. Profile update dates are separate from recorded source-check dates.",
            "来源链接表示记录的资料出处，不代表已记录提供者身份。没有提供方或实际核验记录时，不推断为项目方提供、平台独立核验；资料更新时间与来源核对日期分别展示。",
          )}
        </p>
      </section>
      {[
        [
          "Free listing",
          "免费收录",
          "Submit your tool, explain its task and conditions, and suggest 3–5 relevant peers. Niche projects may explain their exception and related methods. Normal review is free.",
          "提交官网、用途和使用条件，推荐 3–5 个相关同行。小众项目可以说明原因并提供相关替代方式。正常审核免费。",
        ],
        [
          "Reviewed relationships",
          "用途关系审核",
          "A nomination is a lead. Confirmed shared tasks create alternatives pages automatically, even with one useful candidate. Claiming identity does not certify quality.",
          "提名是一条线索。确认共同任务后，自动更新替代方案页；一个有效候选也可发布。身份认领不认证产品质量。",
        ],
        [
          "Daily stable discovery",
          "每日稳定发现",
          "Filter by relevance first. Eligible profiles enter the next UTC daily cycle: one newcomer, one adopted contribution and four ordinary low-exposure slots. Missing special candidates return to the ordinary pool. One controlling party per round. Editing more text earns no score.",
          "先匹配用途及筛选条件。合格资料进入下个 UTC 每日周期：一个新人、一个贡献推荐、四个低曝光普通轮换位。特殊候选不足时回到普通池，同轮排除同一控制主体。增加文字不加分。",
        ],
        [
          "Clear free conditions",
          "免费条件清楚",
          "Sustained free use and sustained free plans qualify for the free list. Trials do not. Open source is a separate attribute; hosting and API use may still cost money. Unknown prices stay unknown.",
          "持续免费使用与持续免费方案进入免费榜，限时试用不进入。开源单独判断，托管和 API 仍可能收费。未知价格保持未知。",
        ],
        [
          "Useful contributions",
          "有用贡献",
          "Only adopted new relationships, confirmed corrections and meaningful new information earn extra rotation eligibility. Repeated information earns nothing. Eligibility expires after 30 days; caps: one per project and two per controlling party every seven days.",
          "采纳的新关系、确认纠错和实质新资料才能获得额外轮换资格。重复资料不重复奖励。资格有效期三十天，每七天每项目一次、每控制主体两次。",
        ],
        [
          "Honest results",
          "真实反馈",
          "Impressions, profile views and outbound clicks are separate. Visitor-day deduplication and bot, self and test exclusions provide estimates, not customers or successful website loads.",
          "展示、项目页浏览与官网外跳分开记录，按访客与日期去重并排除机器人、自测及内部流量。它们是估计，不等于客户或官网成功加载。",
        ],
        [
          "Voluntary sharing & future sponsorship",
          "自愿分享与后续赞助",
          "Listing cards describe purpose and confirmed conditions. Sharing is optional. Future sponsorship buys clearly marked independent positions, not review priority or natural discovery order. External traffic, OCR and APIs are deferred.",
          "收录卡表达用途及已确认条件，分享自愿。后续赞助购买独立标记的位置，不购买审核插队或自然发现顺序。外部流量、OCR 和 API 延后。",
        ],
      ].map(([en, zh, body, cn]) => (
        <section key={en}>
          <h2>{t(en, zh)}</h2>
          <p>{t(body, cn)}</p>
        </section>
      ))}
    </div>
  );
}
