"use client";
import Link from "next/link";
import { brand } from "@/lib/charts/brand";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  ArrowUpRight,
  Star,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { useCharts, Avatar } from "./context";
import { OfficialLink } from "./official-link";
import { useEvent } from "./use-event";
import {
  alternatives,
  profileReady,
  priceLabel,
  discover,
} from "@/lib/charts/discovery";
import {
  localText,
  stableProjects,
  searchScore,
} from "@/lib/charts/navigation";
import type { Project } from "@/lib/charts/types";
export function FavoriteButton({
  p,
  compact = false,
}: {
  p: Project;
  compact?: boolean;
}) {
  const { favoriteIds, toggleFavorite, t } = useCharts(),
    active = favoriteIds.includes(p.id);
  return (
    <button
      className={"favorite-button " + (active ? "is-saved" : "")}
      aria-label={
        active
          ? t("Remove " + p.name + " from favorites", "移除常用 " + p.name)
          : t("Add " + p.name + " to favorites", "添加常用 " + p.name)
      }
      aria-pressed={active}
      title={
        active
          ? t("Remove favorite", "移除常用")
          : t("Add favorite", "添加常用")
      }
      onClick={() => void toggleFavorite(p.id).catch(() => {})}
    >
      <Star size={15} fill={active ? "currentColor" : "none"} />
      {!compact && (
        <span>{active ? t("Saved", "已常用") : t("Save", "常用")}</span>
      )}
    </button>
  );
}
export function SiteUnit({
  p,
  compact = false,
  surface = "/directory",
  task,
  reason,
}: {
  p: Project;
  compact?: boolean;
  surface?: string;
  task?: string;
  reason?: string;
}) {
  const { data, locale, href, t } = useCharts(),
    ref = useEvent(p.id, "impression", surface);
  const hasAlternatives =
    alternatives(p, data.projects, data.relations).length > 0;
  return (
    <div
      className={"site-unit " + (compact ? "compact" : "list-unit")}
      ref={ref}
      data-product-id={p.id}
    >
      <div className="site-primary">
        <OfficialLink
          productId={p.id}
          surface={surface}
          target="_blank"
          rel="noopener"
          className="site-name"
          title={p.domain + " ↗"}
        >
          <Avatar name={p.name} />
          <strong>{p.name}</strong>
          <ArrowUpRight size={12} />
        </OfficialLink>
        <FavoriteButton p={p} compact />
      </div>
      <div className="site-purpose">
        <span>
          {localText(task, locale) ||
            (locale === "zh" ? p.description_zh : p.description_en)}
        </span>
      </div>
      {!compact && (
        <div className="site-access">
          <span>
            {priceLabel(p, locale === "zh")}
            {p.is_open_source ? " · " + t("Open source", "开源") : ""}
          </span>
          <small>{p.domain}</small>
        </div>
      )}
      <div className="site-links">
        <Link href={href("/products/" + p.slug)}>{t("Details", "简介")}</Link>
        <Link
          href={href(
            hasAlternatives
              ? "/alternatives/" + p.slug
              : "/categories/" + p.category,
          )}
        >
          {hasAlternatives
            ? t("Alternatives", "找替代")
            : t("Similar", "查看同类")}
        </Link>
        {reason && (
          <small className="discovery-badge">
            {reason === "adopted_contribution"
              ? t("Contribution pick", "贡献推荐")
              : reason === "newly_listed"
                ? t("New listing", "新收录")
                : t("Discovery pick", "发现推荐")}
          </small>
        )}
      </div>
    </div>
  );
}
export function UnifiedSearch({
  dialog = false,
  onChoose,
}: {
  dialog?: boolean;
  onChoose?: () => void;
}) {
  const { data, t, href, locale, dataset } = useCharts(),
    [q, setQ] = useState(""),
    [intent, setIntent] = useState("website"),
    [focused, setFocused] = useState(false);
  const matches = stableProjects(data.projects.filter(profileReady))
    .filter((p) => searchScore(p, q) > 0)
    .sort((a, b) => searchScore(b, q) - searchScore(a, q))
    .slice(0, 5);
  const targets = data.projects
    .filter((p) => alternatives(p, data.projects, data.relations).length > 0)
    .filter((p) => searchScore(p, q) > 0)
    .sort((a, b) => searchScore(b, q) - searchScore(a, q))
    .slice(0, 5);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (dialog) input.current?.focus();
  }, [dialog]);
  return (
    <div className={"unified-search " + (dialog ? "dialog-search" : "")}>
      <div
        className="search-intents"
        role="tablist"
        aria-label={t("Search intent", "搜索方式")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={intent === "website"}
          onClick={() => setIntent("website")}
        >
          {t("Websites", "找网站")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={intent === "alternatives"}
          onClick={() => setIntent("alternatives")}
        >
          {t("Alternatives", "找替代")}
        </button>
      </div>
      <form
        action={`/${locale}/projects`}
        className="navigation-search"
        onSubmit={onChoose}
      >
        <Search size={18} />
        <input
          ref={input}
          aria-label={t("Find a website or task", "搜索网站或任务")}
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={
            intent === "website"
              ? t("Website, domain or task", "网站名称、域名，或你要做的事")
              : t(
                  "Which website would you like to replace?",
                  "你想找哪个网站的替代方案？",
                )
          }
          autoComplete="off"
        />
        <input type="hidden" name="dataset" value={dataset} />
        {intent === "alternatives" && (
          <input type="hidden" name="intent" value="alternatives" />
        )}
        <button className="button primary">
          {intent === "website"
            ? t("Search", "搜索")
            : t("Find alternatives", "找替代")}
        </button>
      </form>
      {q.trim() && (focused || dialog) && (
        <div className="search-suggestions">
          <div className="row between">
            <small>
              {t(
                "Choose an action, or Enter for all results",
                "选择明确操作；直接回车查看全部结果",
              )}
            </small>
            <button
              aria-label={t("Close suggestions", "关闭建议")}
              onClick={() => setFocused(false)}
            >
              <X size={14} />
            </button>
          </div>
          {(intent === "website" ? matches : targets).map((p) => (
            <div className="suggestion-row" key={p.id}>
              {intent === "website" ? (
                <OfficialLink
                  productId={p.id}
                  surface="/search"
                  target="_blank"
                  rel="noopener"
                  className="site-name"
                >
                  <Avatar name={p.name} />
                  {p.name}
                  <ArrowUpRight size={12} />
                </OfficialLink>
              ) : (
                <Link href={href("/alternatives/" + p.slug)} onClick={onChoose}>
                  {p.name} · {t("Alternatives", "替代方案")} →
                </Link>
              )}
              <small>
                {locale === "zh" ? p.description_zh : p.description_en}
              </small>
              <Link href={href("/products/" + p.slug)} onClick={onChoose}>
                {t("Details", "简介")}
              </Link>
            </div>
          ))}
          {data.categories
            .filter((c) =>
              (c.name_en + c.name_zh + c.description_en + c.description_zh)
                .toLowerCase()
                .includes(q.toLowerCase()),
            )
            .map((c) => (
              <Link
                className="suggestion-category"
                key={c.slug}
                href={href("/categories/" + c.slug)}
                onClick={onChoose}
              >
                {t("Category", "分类")} ·{" "}
                {locale === "zh" ? c.name_zh : c.name_en} →
              </Link>
            ))}
          {!(intent === "website" ? matches : targets).length && (
            <p>
              {intent === "alternatives"
                ? t(
                    "No confirmed alternative target. Search the directory for related websites.",
                    "暂无匹配的有效替代入口，可回车查找相关网站。",
                  )
                : t(
                    "No exact suggestion. Search all results or explore categories.",
                    "暂无匹配建议，可回车搜索全部资料或浏览分类。",
                  )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export function FavoritesArea({ manage = false }: { manage?: boolean }) {
  const {
      data,
      href,
      t,
      favoriteIds,
      favoriteSync,
      retryFavoriteSync,
      favoriteStorageError,
      toggleFavorite,
      moveFavorite,
    } = useCharts(),
    [editing, setEditing] = useState(manage);
  const selected = favoriteIds.map((id) =>
    data.projects.find((p) => p.id === id),
  );
  const picks = [
    "cursor.com",
    "n8n.io",
    "dify.ai",
    "aider.chat",
    "activepieces.com",
    "haystack.deepset.ai",
  ]
    .map((domain) =>
      data.projects.find((p) => p.domain === domain && profileReady(p)),
    )
    .filter((p): p is Project => !!p);
  const mine = favoriteIds.length > 0,
    rows = mine ? selected : manage ? [] : picks;
  return (
    <section id="favorites" className="favorites-area">
      <div className="nav-section-heading">
        <h2>
          {mine || manage
            ? t("My favorites", "我的常用")
            : t("Editor shortcuts", "精选直达")}
        </h2>
        <span>
          {mine || manage
            ? data.user
              ? t(
                  "Account favorites · order saved in this browser",
                  "账号收藏 · 排序保存在此浏览器",
                )
              : t("Saved only in this browser", "仅保存在此浏览器")
            : t(
                "Editor selection · not a popularity chart",
                "编辑选择 · 非热度榜",
              )}
        </span>
        <div>
          {mine && (
            <button
              className="text-button"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? t("Done", "完成") : t("Reorder", "调整顺序")}
            </button>
          )}
          {!manage && (
            <Link
              href={href(data.user ? "/dashboard/bookmarks" : "/following")}
            >
              {t("Manage / more", "管理／更多")} →
            </Link>
          )}
        </div>
      </div>
      {favoriteStorageError && (
        <p role="alert">
          {t(
            data.user
              ? "Account favorites saved; browser order unavailable."
              : "Browser storage unavailable. Favorites were not saved.",
            data.user
              ? "账号收藏已保存，本机排序不可用。"
              : "浏览器存储不可用，常用未保存。",
          )}
        </p>
      )}
      {favoriteSync === "merging" && (
        <p role="status">
          {t(
            "Merging browser favorites into your account…",
            "正在合并浏览器常用到账户…",
          )}
        </p>
      )}
      {favoriteSync === "failed" && (
        <p role="alert">
          {t("Some favorites have not synced.", "部分常用尚未同步。")}
          <button onClick={retryFavoriteSync}>{t("Retry", "重试")}</button>
        </p>
      )}
      <div className="shortcut-grid">
        {rows.slice(0, manage ? rows.length : 6).map((p, i) =>
          p ? (
            <div className="shortcut-item" key={p.id}>
              <SiteUnit
                p={p}
                compact
                surface={manage ? "/following" : "/home/favorites"}
              />
              {editing && mine && (
                <div className="favorite-order">
                  <button
                    disabled={i === 0}
                    aria-label={t("Move " + p.name + " up", "上移 " + p.name)}
                    onClick={() => moveFavorite(p.id, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={i === favoriteIds.length - 1}
                    aria-label={t("Move " + p.name + " down", "下移 " + p.name)}
                    onClick={() => moveFavorite(p.id, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div key={favoriteIds[i]} className="unavailable-favorite">
              <span>
                {t(
                  "Saved project currently unavailable",
                  "已保存项目目前不可用",
                )}
              </span>
              <button
                onClick={() =>
                  void toggleFavorite(favoriteIds[i]).catch(() => {})
                }
              >
                {t("Remove", "移除")}
              </button>
            </div>
          ),
        )}
      </div>
      {manage && !rows.length && (
        <p>
          {t(
            "No favorites yet. Add websites from any list.",
            "还没有常用，从任意网站列表点击星标即可添加。",
          )}
        </p>
      )}
    </section>
  );
}
export function NavigationHome() {
  const { data, locale, t, href } = useCharts(),
    ready = stableProjects(data.projects.filter(profileReady)),
    rotation = discover(ready, data.discoveryCycle, 4),
    targets = data.projects
      .filter((p) => alternatives(p, data.projects, data.relations).length > 0)
      .slice(0, 6);
  return (
    <div className="navigation-home">
      <div className="home-search-heading">
        <h1>{brand[locale].headline}</h1>
        <nav>
          {data.categories.map((c) => (
            <a href={"#map-" + c.slug} key={c.slug}>
              {locale === "zh" ? c.name_zh : c.name_en}
            </a>
          ))}
        </nav>
      </div>
      <div className="brand-promises">
        <span>{t("Free submission", "免费提交")}</span>
        <i>·</i>
        <span>{t("Free listing", "免费收录")}</span>
        <i>·</i>
        <span>{t("Clear categories", "分类清晰")}</span>
        <i>·</i>
        <Link href={href("/how-it-works") + "#data-and-order"}>
          {t("Transparent data", "数据透明")}
        </Link>
      </div>
      <UnifiedSearch />
      <FavoritesArea />
      {!!rotation.length && (
        <section className="new-discoveries">
          <div className="nav-section-heading">
            <h2>{t("New discoveries", "新发现")}</h2>
            <span>
              {t("Daily picks · limited rotation", "每日精选 · 有限轮换")}
            </span>
          </div>
          <div className="discoveries-grid">
            {rotation.map((x) => (
              <SiteUnit
                key={x.project.id}
                p={x.project}
                compact
                reason={x.reason}
                surface="/home/discover"
              />
            ))}
          </div>
        </section>
      )}
      <div className="website-map">
        {data.categories.map((c) => (
          <section id={"map-" + c.slug} className="map-group" key={c.slug}>
            <div className="nav-section-heading">
              <h2>
                <Link href={href("/categories/" + c.slug)}>
                  {locale === "zh" ? c.name_zh : c.name_en}
                </Link>
              </h2>
              <span>
                {locale === "zh" ? c.description_zh : c.description_en}
              </span>
              <Link href={href("/categories/" + c.slug)}>
                {t("View all", "查看全部")} →
              </Link>
            </div>
            <div className="map-grid">
              {ready
                .filter((p) => p.category === c.slug)
                .slice(0, 8)
                .map((p) => (
                  <SiteUnit
                    key={p.id}
                    p={p}
                    compact
                    surface={"/home/categories/" + c.slug}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
      <section className="home-alternatives">
        <div className="nav-section-heading">
          <h2>{t("Find alternatives that fit", "找到更合适的替代方案")}</h2>
          <Link href={href("/alternatives")}>
            {t("Alternative charts", "替代榜单")} →
          </Link>
        </div>
        <p className="brand-section-note">
          {t(
            "Compare purpose, pricing and conditions. Confirmed relationships only.",
            "按用途、价格与使用条件比较同类网站，仅展示已确认关系。",
          )}
        </p>
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
        </div>
      </section>
      <aside className="maker-line">
        <p>
          {t(
            "Help the right people find your website. ",
            "让需要的人发现你的网站。",
          )}
          {brand[locale].freeListing}
        </p>
        <Link href={href("/submit")}>
          {t("Submit a website — free", "免费提交网站")} →
        </Link>
      </aside>
    </div>
  );
}
