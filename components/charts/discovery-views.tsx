"use client";
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
  const { locale, href, t } = useCharts();
  const ref = useEvent(p.id, "impression", surface);
  return (
    <div className="discovery-row" ref={ref}>
      <Link href={href("/products/" + p.slug)} className="discovery-identity">
        <Avatar name={p.name} />
        <div>
          <strong>{p.name}</strong>
          <small>{p.domain}</small>
        </div>
      </Link>
      <div className="discovery-description">
        <p>{locale === "zh" ? p.description_zh : p.description_en}</p>
        <small>{task || p.task}</small>
        {reason && (
          <span className="tag">
            {reason === "adopted_contribution"
              ? t("Contribution recommendation", "贡献推荐")
              : reason === "newly_listed"
                ? t("Newly listed", "新收录")
                : t("Discovery rotation", "发现轮换")}
          </span>
        )}
      </div>
      <div className="discovery-conditions">
        <span className="tag">{priceLabel(p, locale === "zh")}</span>
        {p.is_open_source && <small>{t("Open source", "开源")}</small>}
        <small>
          {p.supported_languages?.join(" · ") ||
            t("Language unconfirmed", "语言待确认")}
        </small>
      </div>
      <div className="row">
        <OfficialLink
          productId={p.id}
          surface={surface}
          className="button official-link"
        >
          {t("Website", "官网")} ↗
        </OfficialLink>
        <SaveButton p={p} />
        <Link
          className="button"
          href={href("/products/" + p.slug)}
          aria-label={t("View " + p.name, "查看 " + p.name)}
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
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
                {t("websites", "个网站")} <ArrowRight size={12} />
              </small>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
export function DiscoveryHome() {
  const { data, t, href } = useCharts();
  const [q, setQ] = useState("");
  const rotation = discover(data.projects, data.discoveryCycle);
  const latest = data.projects
    .filter(profileReady)
    .sort((a, b) =>
      (b.first_published_at || "").localeCompare(a.first_published_at || ""),
    )
    .slice(0, 4);
  const targets = data.projects
    .filter((p) => alternatives(p, data.projects, data.relations).length)
    .slice(0, 6);
  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="eyebrow">
          123CHARTS / DISCOVER WEBSITES, EXPLORE ALTERNATIVES.
        </div>
        <h1>
          {t("Find a website that fits.", "发现好网站，")}
          <br />
          <span>{t("Explore another way.", "找到更合适的替代方案。")}</span>
        </h1>
        <p>
          {t(
            "Compare what websites do, who they suit, and the conditions that matter. Free to explore. Free to submit.",
            "从用途、价格条件和特点出发，找到适合自己的选择。免费浏览，免费提交。",
          )}
        </p>
        <form action={href("/projects")} className="discovery-search">
          <Search size={20} />
          <input
            aria-label={t("Find a task or website", "搜索任务或网站")}
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(
              "What do you want to do? Or find alternatives to a website.",
              "你想完成什么任务？或输入一个网站，寻找替代方案。",
            )}
          />
          <input
            type="hidden"
            name="dataset"
            value={data.projects.some((p) => p.demo) ? "demo" : "real"}
          />
          <button className="button primary">
            {t("Explore", "开始发现")}
            <ArrowRight size={14} />
          </button>
        </form>
      </section>
      <CategoryLinks />
      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / DISCOVER</div>
            <h2>{t("This period’s discoveries", "本期发现")}</h2>
          </div>
          <Link href={href("/categories")}>
            {t("Explore categories", "探索分类")} →
          </Link>
        </div>
        <p className="muted">
          {t(
            "Relevant, complete profiles in a daily stable rotation. Display order does not indicate traffic or popularity.",
            "相关且资料完整的项目每日稳定轮换。展示顺序不代表访问量或受欢迎程度。",
          )}
        </p>
        {rotation.length ? (
          rotation.map((x) => (
            <WebsiteRow
              key={x.project.id}
              p={x.project}
              reason={x.reason}
              surface="/discover"
            />
          ))
        ) : (
          <p className="notice">
            {t(
              "No eligible projects in this cycle. Newly approved profiles enter the next daily cycle.",
              "本周期暂无合格候选。新通过的项目将在下一个每日周期参与轮换。",
            )}
          </p>
        )}
      </section>
      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">02 / NEWLY LISTED</div>
            <h2>{t("New to 123Charts", "新收录")}</h2>
          </div>
          <Link href={href("/new")}>{t("View all", "查看全部")} →</Link>
        </div>
        <p className="muted">
          {t(
            "Ordered by first public listing, not product release date. Editing a profile never resets this date.",
            "按首次公开收录时间排列，区别于产品发布日期；修改资料不重置收录时间。",
          )}
        </p>
        {latest.map((p) => (
          <WebsiteRow key={p.id} p={p} surface="/new" />
        ))}
      </section>
      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">03 / ANOTHER WAY</div>
            <h2>{t("Explore familiar websites differently", "找替代方案")}</h2>
          </div>
          <Link href={href("/alternatives")}>
            {t("All alternatives", "全部替代入口")} →
          </Link>
        </div>
        <div className="alternative-targets">
          {targets.map((p) => (
            <Link key={p.id} href={href("/alternatives/" + p.slug)}>
              <Avatar name={p.name} />
              <span>
                {p.name}
                <small>
                  {alternatives(p, data.projects, data.relations).length}{" "}
                  {t("task-specific choices", "个用途相关选择")}
                </small>
              </span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      <section className="discovery-save">
        <Bookmark size={25} />
        <div>
          <h2>{t("Keep your shortlist.", "留下你的候选清单。")}</h2>
          <p>
            {t(
              "Save websites and follow useful alternatives. Return when your next choice comes along.",
              "收藏网站，关注任务分类与替代方案。下次遇到选择时，继续比较。",
            )}
          </p>
        </div>
        <Link className="button" href={href("/following")}>
          {t("Your saved websites", "我的收藏")} →
        </Link>
      </section>
    </div>
  );
}
export function DiscoveryListing({
  category,
  mode = "discover",
}: {
  category?: string;
  mode?: "discover" | "new" | "free" | "open-source";
}) {
  const { data, t, href, locale, api } = useCharts();
  const params = useSearchParams(),
    router = useRouter();
  const [filterQuery, setFilterQuery] = useState(params.toString());
  useEffect(() => setFilterQuery(params.toString()), [params]);
  const filters = new URLSearchParams(filterQuery);
  const q = filters.get("q") || "",
    price = filters.get("price") || "",
    language = filters.get("language") || "",
    oss = filters.get("oss") === "1";
  const view = filters.get("view") || mode;
  const sort = view === "new" ? "new" : filters.get("sort") || "discover";
  const selectedCategory = category || filters.get("category") || "";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setFilterQuery(next.toString());
    window.history.replaceState(null, "", "?" + next.toString());
  };
  const c = data.categories.find((c) => c.slug === category);
  const filtered = data.projects
    .filter(profileReady)
    .filter(
      (p) =>
        (!selectedCategory || p.category === selectedCategory) &&
        (!q ||
          [
            p.name,
            p.domain,
            p.task,
            p.description_en,
            p.description_zh,
            p.differentiator,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!price || (p.price_verified ? p.price_type : "unknown") === price) &&
        (!language || p.supported_languages?.includes(language)) &&
        (!oss || p.is_open_source) &&
        (view !== "free" || sustainedFree(p)) &&
        (mode !== "open-source" || p.is_open_source),
    );
  const cycle = new Map(
    discover(filtered, data.discoveryCycle, filtered.length).map((x, i) => [
      x.project.id,
      { ...x, order: i },
    ]),
  );
  const ordered =
    sort === "new"
      ? [...filtered].sort(
          (a, b) =>
            (b.first_published_at || "").localeCompare(
              a.first_published_at || "",
            ) || a.id.localeCompare(b.id),
        )
      : [...filtered].sort(
          (a, b) =>
            (cycle.get(a.id)?.order ?? 1e6) - (cycle.get(b.id)?.order ?? 1e6) ||
            a.id.localeCompare(b.id),
        );
  const page = Math.max(1, Number(params.get("page")) || 1),
    rows = ordered.slice((page - 1) * 12, page * 12);
  return (
    <div className="discovery-page">
      <div className={category ? "compact-category-heading" : "page-heading"}>
        <div className="eyebrow">123CHARTS / {mode.toUpperCase()}</div>
        <h1>
          {c
            ? locale === "zh"
              ? c.name_zh
              : c.name_en
            : mode === "free"
              ? t("Free to use", "免费可用榜")
              : mode === "open-source"
                ? t("Open source websites", "开源发现")
                : mode === "new"
                  ? t("Newly listed", "新收录榜")
                  : t("Discover websites", "发现网站")}
        </h1>
        <p>
          {c
            ? locale === "zh"
              ? c.description_zh
              : c.description_en
            : t(
                "Choose by task, pricing and language. Explore the conditions before visiting.",
                "按用途、价格和语言选择，先了解使用条件，再前往官网。",
              )}
        </p>
      </div>
      {category && (
        <button
          className="button"
          onClick={() =>
            data.user
              ? void apiFollow()
              : router.push(
                  href(
                    "/login?returnTo=" +
                      encodeURIComponent(
                        `/${locale}/categories/${category}?${params}`,
                      ),
                  ),
                )
          }
        >
          {data.follows.some(
            (f) => f.kind === "category" && f.target === category,
          )
            ? t("Following category", "已关注分类")
            : t("Follow category", "关注分类")}
        </button>
      )}
      {category && (
        <nav className="view-tabs" aria-label={t("Category views", "分类视图")}>
          {[
            ["discover", t("Discover", "发现推荐")],
            ["new", t("Newly listed", "新收录")],
            ["free", t("Free to use", "免费可用")],
            ["alternatives", t("Alternatives", "找替代方案")],
          ].map(([v, label]) => (
            <Link
              className={view === v ? "active" : ""}
              key={v}
              href={href(
                `/categories/${category}?` +
                  new URLSearchParams({
                    ...Object.fromEntries(filters),
                    view: v,
                  }).toString(),
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      {view === "alternatives" && category ? (
        <div className="alternative-targets">
          {data.projects
            .filter((p) => p.category === category)
            .map((p) => (
              <Link key={p.id} href={href("/alternatives/" + p.slug)}>
                <Avatar name={p.name} />
                <span>
                  {p.name}
                  <small>{t("Choose this target", "选择此目标网站")}</small>
                </span>
              </Link>
            ))}
        </div>
      ) : (
        <>
          <div className="discovery-filters">
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
            <label>
              <Search size={14} />
              <input
                aria-label={t("Search websites", "搜索网站")}
                value={q}
                onChange={(e) => set("q", e.target.value)}
                placeholder={t("Task, website, domain…", "任务、网站、域名…")}
              />
            </label>
            <select
              aria-label={t("Price type", "价格类型")}
              value={price}
              onChange={(e) => set("price", e.target.value)}
            >
              <option value="">{t("All prices", "全部价格")}</option>
              {Object.entries(prices).map(([v, labels]) => (
                <option key={v} value={v}>
                  {labels[locale === "zh" ? 1 : 0]}
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
            <select
              aria-label={t("Order", "排序")}
              value={sort === "free" ? "discover" : sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              <option value="discover">
                {t("Discovery rotation", "发现轮换")}
              </option>
              <option value="new">
                {t("First public listing", "首次公开收录")}
              </option>
            </select>
          </div>
          <p className="muted">
            {filtered.length}{" "}
            {t(
              "matching websites · stable daily rotation, with a newcomer and contribution slot. New approvals enter the next cycle.",
              "个匹配网站 · 每日稳定轮换，保留新人及贡献位置。新通过项目参与下个周期。",
            )}{" "}
            {mode === "free" &&
              t(
                "Trials excluded. Open source is a separate condition.",
                "不含限时试用；开源与免费分开判断。",
              )}
          </p>
          {rows.length ? (
            rows.map((p) => (
              <div key={p.id}>
                <WebsiteRow
                  p={p}
                  surface={
                    category
                      ? "/categories/" + category
                      : mode === "free"
                        ? "/free"
                        : "/discover"
                  }
                  reason={sort === "new" ? undefined : cycle.get(p.id)?.reason}
                />
                {sort === "new" && (
                  <small className="muted">
                    {t("First listed", "首次收录")}{" "}
                    {p.first_published_at?.slice(0, 10)}
                    {p.first_publication_inferred &&
                      t(" · historical date estimated", " · 历史日期为估计")}
                  </small>
                )}
              </div>
            ))
          ) : (
            <Empty title={t("No matches yet", "暂无匹配网站")}>
              {t(
                "Clear a filter or explore another task.",
                "调整筛选，或探索其他用途。",
              )}
              <Link
                className="button"
                href={href(
                  category
                    ? "/categories/" + category
                    : mode === "free"
                      ? "/free"
                      : mode === "open-source"
                        ? "/open-source"
                        : "/projects",
                )}
              >
                {t("Clear filters", "清除筛选")}
              </Link>
              <Link className="button ghost" href={href("/categories")}>
                {t("Explore categories", "探索相近分类")}
              </Link>
            </Empty>
          )}
          <div className="row" style={{ marginTop: 20 }}>
            {[...Array(Math.ceil(filtered.length / 12))].map((_, i) => (
              <button
                className={"button " + (page === i + 1 ? "primary" : "")}
                key={i}
                onClick={() => {
                  const next = new URLSearchParams(params.toString());
                  next.set("page", String(i + 1));
                  router.push("?" + next);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
  async function apiFollow() {
    await api("follow", {
      kind: "category",
      target: category,
      remove: data.follows.some(
        (f) => f.kind === "category" && f.target === category,
      ),
    });
  }
}
export function DiscoveryCategories() {
  const { t } = useCharts();
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <h1>{t("Category discovery charts", "分类发现榜")}</h1>
        <p>
          {t(
            "Find websites for the task at hand. A discovery order, with clear conditions.",
            "围绕具体用途发现网站，按条件筛选、轮换展示。",
          )}
        </p>
      </div>
      <CategoryLinks />
      <DiscoveryListing />
    </div>
  );
}
export function AlternativesPage({ slug }: { slug?: string }) {
  const { data, href, t, locale } = useCharts();
  const params = useSearchParams(),
    router = useRouter();
  const target = data.projects.find((p) => p.slug === slug);
  if (!target)
    return (
      <div className="discovery-page">
        <div className="page-heading">
          <h1>{t("Find alternatives", "找替代方案")}</h1>
          <p>
            {t(
              "Start with a familiar website, then compare ways to complete a specific task.",
              "从熟悉的网站出发，比较完成具体任务的其他选择。",
            )}
          </p>
        </div>
        <div className="alternative-targets">
          {data.projects
            .filter(
              (p) => alternatives(p, data.projects, data.relations).length,
            )
            .map((p) => (
              <Link href={href("/alternatives/" + p.slug)} key={p.id}>
                <Avatar name={p.name} />
                <span>
                  {p.name}
                  <small>{p.task}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
        </div>
      </div>
    );
  const choices = alternatives(target, data.projects, data.relations);
  const tasks = [...new Set(choices.map((x) => x.task))];
  const task = params.get("task") || "";
  const matched = choices.filter((x) => !task || x.task === task);
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <div className="eyebrow">TASK-SPECIFIC ALTERNATIVES</div>
        <h1>
          {t("Alternatives to " + target.name, target.name + " 替代方案")}
        </h1>
        <p>
          {t(
            "Compare by use, pricing and language. A shared task does not imply complete product equivalence.",
            "按用途、价格和语言比较。共同任务仅说明局部可比较，不代表产品功能全面等同。",
          )}
        </p>
        <SaveButton p={target} kind="alternatives" />
      </div>
      <select
        aria-label={t("Common task", "共同任务")}
        value={task}
        onChange={(e) => {
          const q = new URLSearchParams(params.toString());
          e.target.value ? q.set("task", e.target.value) : q.delete("task");
          router.replace("?" + q);
        }}
      >
        <option value="">{t("All reviewed tasks", "全部已确认用途")}</option>
        {tasks.map((task) => (
          <option key={task}>{task}</option>
        ))}
      </select>
      <p className="muted">
        {t(
          "Relationships reviewed against their stated tasks. Conditions are read from each current project profile.",
          "关系根据具体任务审核；价格与使用条件读取各项目当前资料。",
        )}
      </p>
      {matched.length ? (
        matched.map((x) => (
          <div key={x.project.id + x.task}>
            <WebsiteRow
              p={x.project}
              task={x.task}
              surface={"/alternatives/" + target.slug}
            />
            <div className="comparison-detail">
              <strong>
                {t("Why compare: ", "比较依据：")}
                {x.rationale}
              </strong>
              <p>{x.project.differentiator}</p>
              <p>
                {t("Conditions: ", "使用条件：")}
                {x.project.conditions || t("To be confirmed", "待补充")}
              </p>
              <small>
                {t("Updated", "资料更新")} {x.project.updated_at.slice(0, 10)} ·{" "}
                <OfficialLink
                  productId={x.project.id}
                  surface={"/alternatives/" + target.slug}
                >
                  {t("Visit website", "前往官网")} ↗
                </OfficialLink>
              </small>
            </div>
          </div>
        ))
      ) : (
        <Empty
          title={t(
            "No reviewed choices for this task yet",
            "此用途暂无已确认选择",
          )}
        />
      )}
      {data.relations.some(
        (r) => r.peer_domain === target.domain && r.status === "pending",
      ) && (
        <section className="source-pending">
          <h2>
            {t(
              "Submitted comparison leads · pending review",
              "新提交的比较线索 · 待审核",
            )}
          </h2>
          <p>
            {t(
              "These projects proposed a shared task. The relationship has not been confirmed.",
              "以下项目提出了共同用途线索，关系尚未确认。",
            )}
          </p>
          {data.relations
            .filter(
              (r) => r.peer_domain === target.domain && r.status === "pending",
            )
            .map((r) => {
              const p = data.projects.find((p) => p.id === r.project_id);
              return p ? (
                <WebsiteRow
                  key={r.id}
                  p={p}
                  task={r.task}
                  surface={"/alternatives/" + target.slug}
                />
              ) : null;
            })}
        </section>
      )}
      <Link className="button" href={href("/products/" + target.slug)}>
        {t("About " + target.name, "了解 " + target.name)}
      </Link>
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
  const [action, setAction] = useState<"claim" | "correction">("correction");
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
          <span className="tag">{priceLabel(p, locale === "zh")}</span>
          {p.is_open_source && (
            <a className="tag" href={p.open_source_url} rel="nofollow noopener">
              {t("Open source", "开源")}
            </a>
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
        <SaveButton p={p} kind="alternatives" />
        <Link className="button" href={href("/alternatives/" + p.slug)}>
          {t("Compare alternatives", "比较替代方案")} →
        </Link>
      </div>
      <div className="discovery-facts">
        <div>
          <small>{t("PRIMARY TASK", "主要用途")}</small>
          <h2>{p.task || t("To be confirmed", "待补充")}</h2>
          <p>
            {p.differentiator ||
              t("Details are being maintained.", "详细资料待完善。")}
          </p>
        </div>
        <div>
          <small>{t("CONDITIONS & LIMITS", "使用条件与限制")}</small>
          <p>
            {p.conditions ||
              t(
                "Pricing conditions have not yet been confirmed. Check the official website.",
                "价格与使用条件尚未确认，请查看官网。",
              )}
          </p>
          <p>
            {t("Languages", "支持语言")} ·{" "}
            {p.supported_languages?.join(" / ") || t("Unconfirmed", "待确认")}
          </p>
        </div>
      </div>
      <div className="row">
        <small className="muted">
          {t("First public listing", "首次公开收录")} ·{" "}
          {p.first_published_at?.slice(0, 10) || t("Unknown", "未知")}
          {p.first_publication_inferred &&
            t(" (estimated historical date)", "（历史日期为估计）")}
          <br />
          {t("Profile updated", "资料更新")} · {p.updated_at.slice(0, 10)}
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
            "Shows listing, purpose and current pricing conditions. Sharing is optional.",
            "展示真实收录状态、用途与当前价格条件，分享完全自愿。",
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
      <section>
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
              "/login?returnTo=" + encodeURIComponent(pathname + "?" + query),
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
        · {p.source_checked_at?.slice(0, 10)}
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
  const { t } = useCharts();
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
      {[
        [
          "Free listing",
          "免费收录",
          "Submit your website, explain its task and conditions, and suggest 3–5 relevant peers. Niche projects may explain their exception and related methods. Normal review is free.",
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
