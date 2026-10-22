"use client";
import Link from "next/link";
import { useState } from "react";
import { useCharts, Empty, Status } from "./context";
import { prices } from "@/lib/charts/discovery";
import type { Application, Project } from "@/lib/charts/types";
function ApplicationReview({ a }: { a: Application }) {
  const { data, api, t, busy } = useCharts();
  const [reference, setReference] = useState(""),
    [price, setPrice] = useState(false);
  const relations = data.relations.filter((r) => r.application_id === a.id);
  const act = (action: string) =>
    void api("admin/application", {
      id: a.id,
      action,
      reference,
      feedback: reference,
      pricing_confirmed: price,
      expected_updated_at: a.updated_at,
    }).catch(() => {});
  return (
    <div className="review-card">
      <div className="row">
        <h2>{a.draft.name}</h2>
        <Status value={a.status} />
        <span className="tag">{a.demo ? "DEMO" : "REAL"}</span>
      </div>
      <p>
        {a.draft.website_url} · {a.draft.category} · {a.draft.task}
      </p>
      <p>
        {a.draft.description_en}
        <br />
        {a.draft.description_zh}
      </p>
      <p>{a.draft.differentiator}</p>
      <p>
        {a.draft.price_type} · {a.draft.conditions} ·{" "}
        {a.draft.supported_languages?.join(", ")}
      </p>
      {a.draft.is_open_source && (
        <p>
          {t("Open source evidence", "开源依据")}: {a.draft.open_source_url}
        </p>
      )}
      {!!a.draft.owner_sources?.length && (
        <details className="owner-assist">
          <summary>
            {t(
              "Owner-submitted sources — review required",
              "项目方来源依据 · 待审核",
            )}
          </summary>
          {a.draft.owner_sources.map((source, i) => (
            <p key={i}>
              {source.field} ·{" "}
              <a href={source.url} target="_blank" rel="noopener nofollow">
                {source.url}
              </a>{" "}
              · {source.checked_at || t("Date not recorded", "未记录日期")}
              <br />
              {source.note}
            </p>
          ))}
        </details>
      )}
      {a.draft.peer_exception_reason && (
        <div className="notice">
          <strong>
            {t("Niche exception — assess explicitly", "小众例外，需明确判断")}
          </strong>
          <p>{a.draft.peer_exception_reason}</p>
          <p>{a.draft.supplementary_alternatives}</p>
        </div>
      )}
      {relations.map((r) => (
        <div className="comparison-detail" key={r.id}>
          <strong>
            {r.peer_name} · {r.peer_domain}
          </strong>
          <p>
            {r.task} · {r.rationale}
          </p>
          <div className="row">
            <Status value={r.status} />
            {["approved", "rejected"].map((state) => (
              <button
                disabled={busy}
                className="button"
                key={state}
                onClick={() =>
                  void api("admin/relation", {
                    id: r.id,
                    state,
                    feedback: reference,
                  }).catch(() => {})
                }
              >
                {state === "approved"
                  ? t("Confirm relation", "确认相关")
                  : t("Reject relation", "否决关系")}
              </button>
            ))}
          </div>
        </div>
      ))}
      {a.status === "approved" &&
        relations.some((r) => r.status === "pending") && (
          <label>
            {t("Relationship decision basis", "关系处理依据")}
            <textarea
              aria-label={"Review basis " + a.draft.name}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
        )}
      {a.status !== "approved" && a.status !== "draft" && (
        <>
          <label>
            {t(
              "Review sources / actionable feedback / niche decision",
              "复核来源／具体补充意见／小众判断依据",
            )}
            <textarea
              aria-label={"Review basis " + a.draft.name}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t(
                "Official documentation and specific shared task, or what needs correcting.",
                "官网文档与共同任务依据，或需要补充的问题。",
              )}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={price}
              onChange={(e) => setPrice(e.target.checked)}
            />
            {t(
              "Pricing conditions independently checked",
              "已独立核对价格与使用条件",
            )}
          </label>
          <div className="row">
            <button
              disabled={busy}
              className="button primary"
              onClick={() => act("approve")}
            >
              {a.kind === "update"
                ? t("Approve profile update", "通过资料更新")
                : t("Approve listing", "通过收录")}
            </button>
            <button
              disabled={busy}
              className="button"
              onClick={() => act("needs_info")}
            >
              {t("Request details", "要求补充")}
            </button>
            <button
              disabled={busy}
              className="button"
              onClick={() => act("verifying")}
            >
              {t("Start review", "开始审核")}
            </button>
            <button
              disabled={busy}
              className="button"
              onClick={() => act("rejected")}
            >
              {t("Reject", "不予通过")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
function ProfileEditor({ p }: { p: Project }) {
  const { api, t, locale, busy } = useCharts();
  const [value, setValue] = useState(p),
    [reference, setReference] = useState(p.official_source || ""),
    [verified, setVerified] = useState(!!p.price_verified);
  return (
    <details className="review-card">
      <summary>
        {p.name} · {p.domain} · {p.publication}
      </summary>
      <div className="discovery-form">
        {(
          [
            "name",
            "description_en",
            "description_zh",
            "task",
            "differentiator",
            "conditions",
            "open_source_url",
          ] as const
        ).map((key) => (
          <label key={key}>
            {
              {
                name: t("Name", "名称"),
                description_en: "English description",
                description_zh: "中文简介",
                task: t("Task", "用途"),
                differentiator: t("Focus & audience", "特点与人群"),
                conditions: t("Conditions & limits", "条件与限制"),
                open_source_url: t("License source URL", "许可证来源地址"),
              }[key]
            }
            <textarea
              value={value[key] || ""}
              onChange={(e) =>
                setValue((v) => ({ ...v, [key]: e.target.value }))
              }
            />
          </label>
        ))}
        <label>
          {t("Supported languages", "支持语言")}
          <input
            value={value.supported_languages?.join(", ") || ""}
            onChange={(e) =>
              setValue((v) => ({
                ...v,
                supported_languages: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>
        <label>
          {t("Pricing", "价格类型")}
          <select
            value={value.price_type}
            onChange={(e) =>
              setValue((v) => ({
                ...v,
                price_type: e.target.value as Project["price_type"],
              }))
            }
          >
            {Object.entries(prices).map(([v, l]) => (
              <option key={v} value={v}>
                {l[locale === "zh" ? 1 : 0]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
          {t("Pricing checked", "已核对价格")}
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.is_open_source || false}
            onChange={(e) =>
              setValue((v) => ({ ...v, is_open_source: e.target.checked }))
            }
          />
          {t("Open source license checked", "已核对开源许可证")}
        </label>
        <label>
          {t("Official review sources", "官网复核来源")}
          <textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </label>
        <div className="row">
          {["published", "draft", "archived"].map((publication) => (
            <button
              className="button"
              disabled={busy}
              key={publication}
              onClick={() =>
                void api("admin/project", {
                  id: p.id,
                  project: value,
                  publication,
                  reference,
                  price_verified: verified,
                }).catch(() => {})
              }
            >
              {publication === "published"
                ? t("Save & publish", "保存并公开")
                : publication === "draft"
                  ? t("Keep as draft", "保留草稿")
                  : t("Archive unavailable website", "归档失效网站")}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
function Decision({ item, kind }: { item: any; kind: "claim" | "correction" }) {
  const { api, t, data, busy } = useCharts();
  const project = [
    ...data.projects,
    ...data.managedProjects,
    ...data.researchQueue,
  ].find((p) => p.id === item.project_id);
  const [feedback, setFeedback] = useState(""),
    [patch, setPatch] = useState("");
  return (
    <div className="review-card">
      <h3>
        {kind === "claim"
          ? t("Management claim", "管理身份认领")
          : t("Free correction", "免费纠错")}
      </h3>
      <strong>{project?.name || item.project_id}</strong>
      {project && (
        <p className="muted">
          {project.website_url} · {project.demo ? "DEMO" : "REAL"}
        </p>
      )}
      <p>{item.evidence || item.message}</p>
      <Status value={item.state} />
      {item.feedback && <p>{item.feedback}</p>}
      {item.state === "pending" && (
        <p className="muted">
          {t(
            "Record a specific decision basis (at least 10 characters) to enable the action.",
            "请填写具体处理依据（至少 10 个字）后再操作。",
          )}
        </p>
      )}
      <textarea
        aria-label={t("Decision basis", "处理依据")}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={t("Specific review basis", "具体处理依据")}
      />
      {kind === "correction" && (
        <textarea
          aria-label={t("Confirmed correction JSON", "已核实纠错 JSON")}
          value={patch}
          onChange={(e) => setPatch(e.target.value)}
          placeholder={'{"description_en":"...", "description_zh":"..."}'}
        />
      )}
      <div className="row">
        {[kind === "claim" ? "approved" : "adopted", "rejected"].map(
          (state) => (
            <button
              className="button"
              disabled={
                busy || item.state !== "pending" || feedback.trim().length < 10
              }
              key={state}
              onClick={() => {
                try {
                  void api("admin/" + kind, {
                    id: item.id,
                    state,
                    feedback,
                    patch: patch ? JSON.parse(patch) : {},
                  }).catch(() => {});
                } catch {}
              }}
            >
              {state === "rejected"
                ? t("Reject", "否决")
                : kind === "claim"
                  ? t("Confirm management identity", "确认管理身份")
                  : t("Adopt correction", "采纳纠错")}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
export function DiscoveryAdmin({ section }: { section?: string }) {
  const { data, t, dataset } = useCharts();
  const [tab, setTab] = useState(
    section === "products"
      ? "profiles"
      : section === "discovery"
        ? "rotation"
        : section === "relations"
          ? "relations"
          : section === "categories"
            ? "categories"
            : "applications",
  );
  if (!data.isAdmin)
    return (
      <Empty title={t("Administrator access required", "需要管理员权限")} />
    );
  return (
    <div className="discovery-page">
      <div className="page-heading">
        <div className="eyebrow">REVIEW / DISCOVERY MVP</div>
        <h1>
          {t(
            "Useful facts. Relevant relationships.",
            "审核资料，确认有用关系。",
          )}
        </h1>
        <p>
          {t(
            "Review once to update shared profiles, categories and task-specific alternatives. Traffic evidence is historical and outside this MVP.",
            "一次审核更新公共资料、分类与用途替代入口。流量证据保留历史，本期不执行。",
          )}
        </p>
      </div>
      <div className="row">
        {[
          "applications",
          "profiles",
          "claims",
          "corrections",
          "rotation",
          "categories",
          "relations",
        ].map((v, i) => (
          <button
            className={"button " + (tab === v ? "primary" : "")}
            key={v}
            onClick={() => setTab(v)}
          >
            {
              [
                t("Applications", "申请"),
                t("Shared profiles", "统一资料库"),
                t("Claims", "认领"),
                t("Corrections", "纠错"),
                t("Discovery cycle", "发现周期"),
                t("Categories", "分类与用途"),
                t("Relations", "关系维护"),
              ][i]
            }
          </button>
        ))}
      </div>
      {tab === "applications" &&
        data.applications
          .filter((a) => a.demo === (dataset === "demo"))
          .map((a) => <ApplicationReview key={a.id} a={a} />)}
      {tab === "categories" &&
        data.categories.map((c) => (
          <CategoryEditor key={c.slug} category={c} />
        ))}
      {tab === "relations" &&
        data.relations.map((r) => (
          <RelationshipEditor key={r.id} relation={r} />
        ))}
      {tab === "profiles" &&
        [...data.researchQueue, ...data.projects].map((p) => (
          <ProfileEditor key={p.id} p={p} />
        ))}
      {tab === "claims" &&
        data.claims.map((item) => (
          <Decision key={item.id} item={item} kind="claim" />
        ))}
      {tab === "corrections" &&
        data.corrections.map((item) => (
          <Decision key={item.id} item={item} kind="correction" />
        ))}
      {tab === "rotation" && (
        <>
          <p className="notice">
            {t(
              "Stable UTC daily pool. Candidates must match filters; one new listing, one adopted contribution, four ordinary slots. Special slot shortages fall back to ordinary candidates.",
              "UTC 每日稳定候选池，先匹配筛选条件；一个新收录、一个贡献推荐、四个普通位置。特殊候选不足时回到普通池。",
            )}
          </p>
          {data.discoveryCycle.map((e) => (
            <p key={e.id}>
              {data.projects.find((p) => p.id === e.id)?.name} ·{" "}
              {e.fresh ? t("New listing", "新收录") : t("Ordinary", "普通")} ·{" "}
              {e.contributor ? t("Adopted contribution", "贡献已采纳") : ""} ·{" "}
              {e.exposure}{" "}
              {t("eligible prior-week impressions", "上周有效展示")}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

function CategoryEditor({
  category,
}: {
  category: import("@/lib/charts/types").Category;
}) {
  const { api, t } = useCharts();
  const [value, setValue] = useState(category);
  return (
    <div className="review-card discovery-form">
      <h2>{category.slug}</h2>
      {(
        ["name_en", "name_zh", "description_en", "description_zh"] as const
      ).map((key) => (
        <label key={key}>
          {key}
          <textarea
            value={value[key]}
            onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.value }))}
          />
        </label>
      ))}
      <button
        className="button"
        onClick={() => void api("admin/category", value).catch(() => {})}
      >
        {t("Save category definition", "保存分类定义")}
      </button>
    </div>
  );
}
function RelationshipEditor({
  relation: r,
}: {
  relation: import("@/lib/charts/types").Relation;
}) {
  const { data, api, t } = useCharts();
  const [basis, setBasis] = useState(r.feedback || "");
  return (
    <div className="review-card">
      <h3>
        {r.peer_name} → {data.projects.find((p) => p.id === r.project_id)?.name}
      </h3>
      <p>
        {r.task} · {r.rationale}
      </p>
      <Status value={r.status} />
      {r.withdrawn_at && <span className="tag">{t("Revoked", "已撤销")}</span>}
      <textarea
        aria-label={t("Relationship review basis", "关系复核依据")}
        value={basis}
        onChange={(e) => setBasis(e.target.value)}
      />
      <div className="row">
        {["approved", "rejected", "revoked"].map((state) => (
          <button
            key={state}
            className="button"
            onClick={() =>
              void api("admin/relation", {
                id: r.id,
                state,
                feedback: basis,
              }).catch(() => {})
            }
          >
            {state === "approved"
              ? t("Accept", "接受")
              : state === "rejected"
                ? t("Reject", "拒绝")
                : t("Revoke", "撤销")}
          </button>
        ))}
      </div>
    </div>
  );
}
