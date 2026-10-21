"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  FileImage,
  ShieldCheck,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import type {
  Application,
  Evidence,
  TrafficFields,
  Project,
} from "@/lib/charts/types";
import { useCharts, Empty, Status, Field, numberFormat } from "./context";
export function Admin() {
  const { data, t, href, dataset, api, busy } = useCharts(),
    params = useSearchParams(),
    [tab, setTab] = useState("applications"),
    [selection, setSelection] = useState(params.get("application") ?? "");
  if (!data.user)
    return (
      <Empty title={t("Administrator sign in", "管理员登录")}>
        <Link className="button primary" href={href("/login?next=admin")}>
          {t("Sign in", "登录")}
        </Link>
      </Empty>
    );
  if (!data.isAdmin)
    return (
      <Empty title={t("Administrator access required", "需要管理员权限")}>
        <Link className="button" href={href("/dashboard")}>
          {t("Back to your workspace", "返回个人工作台")}
        </Link>
      </Empty>
    );
  const applications = data.applications.filter(
    (a) => a.demo === (dataset === "demo"),
  );
  const active =
    applications.find((a) => a.id === selection) ??
    applications.find((a) =>
      ["submitted", "verifying", "needs_info"].includes(a.status),
    ) ??
    applications[0];
  const tabs = [
    ["applications", t("Applications", "申请审核")],
    ["research", t("Research profiles", "项目资料")],
    ["evidence", t("Evidence & data", "证据与数据")],
    ["snapshots", t("Months & snapshots", "月份与快照")],
    ["claims", t("Claims & corrections", "认领与纠错")],
    ["operations", t("Jobs & rotation", "任务与推荐")],
  ];
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          123Charts / {t("Review console", "审核工作台")}
        </div>
        <h1>{t("Review the evidence.", "让每个结论有据可查。")}</h1>
        <p>
          {t(
            "Resolve attribution, period and scope before verification. Publication and recommendation remain separate from data ranking.",
            "先核对归属、期间与口径，再作核验决定。发布和推荐不改变数据名次。",
          )}
        </p>
      </div>
      <div className="stat-row">
        <div>
          <strong>
            {
              applications.filter((a) =>
                ["submitted", "verifying"].includes(a.status),
              ).length
            }
          </strong>
          <span>{t("Applications to review", "待审核申请")}</span>
        </div>
        <div>
          <strong>
            {
              data.evidence.filter(
                (e) =>
                  e.demo === (dataset === "demo") &&
                  e.state === "pending_review",
              ).length
            }
          </strong>
          <span>{t("Extracted, awaiting review", "已识别，待复核")}</span>
        </div>
        <div>
          <strong>
            {data.evidence.filter((e) => e.state === "conflict").length}
          </strong>
          <span>{t("Conflicts to resolve", "待解决冲突")}</span>
        </div>
        <div>
          <strong>
            {data.jobs.filter((j) => j.state === "failed").length}
          </strong>
          <span>{t("Failed jobs", "失败任务")}</span>
        </div>
      </div>
      <div className="filter-tabs" style={{ marginBottom: 23 }}>
        {tabs.map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "applications" && (
        <>
          <div className="filters">
            <select
              aria-label={t("Select application", "选择申请")}
              value={active?.id ?? ""}
              onChange={(e) => setSelection(e.target.value)}
            >
              {applications.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.draft.name || a.id.slice(0, 8)} · {a.status} ·{" "}
                  {a.id.slice(0, 8)}
                </option>
              ))}
            </select>
            <span className="muted small">
              {applications.length}{" "}
              {t("applications in this dataset", "份当前数据集申请")}
            </span>
          </div>
          {active ? (
            <ApplicationReview key={active.id} application={active} />
          ) : (
            <Empty
              title={t("No applications in this dataset", "当前数据集没有申请")}
            />
          )}
        </>
      )}
      {tab === "research" && <ResearchConsole />}
      {tab === "evidence" && (
        <>
          {data.evidence
            .filter((e) => e.demo === (dataset === "demo"))
            .map((e) => (
              <EvidenceReview key={e.id} evidence={e} />
            ))}
          {!data.evidence.some((e) => e.demo === (dataset === "demo")) && (
            <Empty title={t("No screenshot evidence yet", "尚无截图证据")} />
          )}
          <section className="panel">
            <h2>{t("Traffic versions", "访问数据版本")}</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("Domain", "域名")}</th>
                    <th>{t("Month", "月份")}</th>
                    <th>{t("Visits", "访问量")}</th>
                    <th>{t("Version / state", "版本 / 状态")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.traffic.map((row) => (
                    <tr key={row.id}>
                      <td className="mono">{row.domain}</td>
                      <td className="mono">{row.month}</td>
                      <td className="numeric">{numberFormat(row.value)}</td>
                      <td>
                        v{row.version} · {row.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {tab === "snapshots" && <SnapshotConsole />}
      {tab === "claims" && (
        <>
          <section className="panel">
            <h2>{t("Management identity claims", "管理者身份认领")}</h2>
            <p>
              {t(
                "Record the verified ownership basis. Approval grants project management rights without completing enrollment contribution.",
                "记录核实后的管理权依据。认领通过授予资料管理权限，不代表已完成入驻贡献。",
              )}
            </p>
            {data.claims
              .filter((c) => c.state === "pending")
              .map((c) => (
                <DecisionReview
                  key={c.id}
                  id={c.id}
                  title={
                    data.projects.find((p) => p.id === c.project_id)?.name ??
                    c.project_id
                  }
                  content={c.evidence}
                  type="claim"
                />
              ))}
            {!data.claims.some((c) => c.state === "pending") && (
              <p>{t("No pending claims.", "暂无待处理认领。")}</p>
            )}
          </section>
          <section className="panel">
            <h2>{t("Free factual corrections", "免费事实纠错")}</h2>
            {data.corrections
              .filter((c) => c.state === "pending")
              .map((c) => (
                <DecisionReview
                  key={c.id}
                  id={c.id}
                  title={
                    data.projects.find((p) => p.id === c.project_id)?.name ??
                    c.project_id
                  }
                  content={c.message}
                  type="correction"
                />
              ))}
            {!data.corrections.some((c) => c.state === "pending") && (
              <p>{t("No pending corrections.", "暂无待处理纠错。")}</p>
            )}
          </section>
        </>
      )}
      {tab === "operations" && (
        <>
          <section className="panel">
            <div className="row between">
              <h2>{t("Daily recommendation rotation", "每日推荐轮换")}</h2>
              <button
                className="button"
                disabled={busy}
                onClick={() => {
                  void api("admin/recommendations").catch(() => {});
                }}
              >
                <RefreshCw size={12} />
                {t("Queue missing rotations", "补齐缺失轮换")}
              </button>
            </div>
            <p>
              {t(
                "Daily selections are stable. Re-running fills missing contexts; it does not refresh an existing day’s winners. Two new, one adopted contribution and one low-exposure slot; duplicate controllers excluded.",
                "每日选择保持稳定。再次运行只补齐缺失上下文，不刷新已有当日结果。两个新入驻位、一个有效贡献位、一个低曝光位，同轮排除重复控制主体。",
              )}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("Context", "位置")}</th>
                    <th>{t("Project", "项目")}</th>
                    <th>{t("Reason", "推荐依据")}</th>
                    <th>{t("Slot", "位次")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recommendations.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.context}</td>
                      <td>
                        {data.projects.find((p) => p.id === r.project_id)?.name}
                      </td>
                      <td className="muted small">{r.reason}</td>
                      <td className="mono">{r.slot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel">
            <h2>{t("Asynchronous jobs", "异步任务")}</h2>
            <p>
              {t(
                "Claims are atomic. Interrupted work is recoverable after the lease expires. Three attempts precede a visible failure.",
                "任务采用原子领取，中断任务在租约过期后可恢复，三次尝试后明确显示失败。",
              )}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("Type / ID", "类型 / ID")}</th>
                    <th>{t("State", "状态")}</th>
                    <th>{t("Attempts", "尝试次数")}</th>
                    <th>{t("Details", "详情")}</th>
                    <th>{t("Action", "操作")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.jobs.map((j) => (
                    <tr key={j.id}>
                      <td>
                        {j.kind}
                        <div className="domain mono">{j.id.slice(0, 8)}</div>
                      </td>
                      <td>
                        <Status value={j.state} />
                      </td>
                      <td className="numeric">{j.attempts}</td>
                      <td
                        className="muted small"
                        style={{ maxWidth: 330, whiteSpace: "normal" }}
                      >
                        {j.error ??
                          (j.result?.elapsed_ms
                            ? `${j.result.elapsed_ms} ms`
                            : "—")}
                      </td>
                      <td>
                        {j.state === "failed" && (
                          <button
                            className="button"
                            disabled={busy}
                            onClick={() => {
                              void api("admin/retry", { id: j.id }).catch(
                                () => {},
                              );
                            }}
                          >
                            {t("Retry", "重试")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
function ApplicationReview({ application: a }: { application: Application }) {
  const { data, t, api, busy, href, locale } = useCharts(),
    [feedback, setFeedback] = useState(a.feedback ?? "");
  const relations = data.relations.filter((r) => r.application_id === a.id),
    evidence = data.evidence.filter((e) => e.application_id === a.id);
  const verified = new Set(
    evidence.filter((e) => e.state === "verified").map((e) => e.peer_domain),
  ).size;
  return (
    <>
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="row between">
          <div>
            <h2>
              {a.draft.name} {a.demo && <span className="tag demo">DEMO</span>}
            </h2>
            <span className="mono muted small">
              {a.draft.domain} · {a.id.slice(0, 8)}
            </span>
          </div>
          <Status value={a.status} />
        </div>
        <p>
          {a.draft.description_en}
          <br />
          {a.draft.description_zh}
        </p>
        <dl className="definition-list">
          <dt>{t("Application type", "申请类型")}</dt>
          <dd>
            {a.kind === "update"
              ? t("Information update", "资料更新")
              : t("Initial enrollment", "首次入驻")}
          </dd>
          <dt>{t("Peers approved", "同行关系已通过")}</dt>
          <dd>{relations.filter((r) => r.status === "approved").length}/10</dd>
          <dt>{t("Verified peers", "合格证据同行数")}</dt>
          <dd>{verified}/5–10</dd>
          <dt>{t("Source calendar", "来源月份日历")}</dt>
          <dd>
            {data.months
              .filter((m) => m.accepted)
              .map((m) => m.month)
              .join(", ") || "—"}
          </dd>
        </dl>
        <div className="notice">
          {t(
            "Check relevance individually. A filled count is not approval; unresolved evidence conflicts prevent final enrollment.",
            "逐个核对相关性。数量填满不代表通过，未解决的证据冲突会阻止最终入驻。",
          )}
        </div>
        {a.status !== "approved" && (
          <>
            <Field label={t("Specific review feedback", "具体审核反馈")}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t(
                  "Identify the peer, image, month or missing item that needs attention.",
                  "指出具体同行、图片、月份或缺失项。",
                )}
              />
            </Field>
            <div className="review-actions">
              <button
                className="button"
                disabled={busy}
                onClick={() => {
                  void api("admin/application", {
                    id: a.id,
                    action: "verifying",
                  }).catch(() => {});
                }}
              >
                {t("Start verification", "开始核验")}
              </button>
              <button
                className="button"
                disabled={busy || feedback.trim().length < 5}
                onClick={() => {
                  void api("admin/application", {
                    id: a.id,
                    action: "needs_info",
                    feedback,
                  }).catch(() => {});
                }}
              >
                {t("Request information", "要求补充")}
              </button>
              <button
                className="button danger"
                disabled={busy || feedback.trim().length < 5}
                onClick={() => {
                  void api("admin/application", {
                    id: a.id,
                    action: "rejected",
                    feedback,
                  }).catch(() => {});
                }}
              >
                {t("Reject", "不予通过")}
              </button>
              <button
                className="button primary"
                disabled={
                  busy ||
                  (a.kind === "initial" &&
                    (verified < 5 ||
                      relations.filter((r) => r.status === "approved")
                        .length !== 10))
                }
                onClick={() => {
                  void api("admin/application", {
                    id: a.id,
                    action: "approve",
                  }).catch(() => {});
                }}
              >
                <Check size={12} />
                {t("Approve & deliver", "通过并交付")}
              </button>
            </div>
          </>
        )}
      </section>
      <section className="panel">
        <h2>{t("Review peer relevance", "核对同行相关性")}</h2>
        {relations.map((r) => (
          <div className="review-block" key={r.id}>
            <div className="row between">
              <div>
                <strong className="project-name">{r.peer_name}</strong>
                <div className="domain mono">{r.peer_domain}</div>
              </div>
              <Status value={r.status} />
            </div>
            <p>
              {r.task}
              <br />
              {r.rationale}
            </p>
            <div className="review-actions">
              <button
                className="button"
                disabled={
                  busy || a.status === "approved" || r.status === "approved"
                }
                onClick={() => {
                  void api("admin/relation", {
                    id: r.id,
                    state: "approved",
                  }).catch(() => {});
                }}
              >
                <Check size={12} />
                {t("Relevant", "相关")}
              </button>
              <button
                className="button ghost"
                disabled={busy || a.status === "approved"}
                onClick={() => {
                  void api("admin/relation", {
                    id: r.id,
                    state: "rejected",
                    feedback: t(
                      "Shared task not established.",
                      "共同任务尚未得到说明。",
                    ),
                  }).catch(() => {});
                }}
              >
                {t("Not established", "相关性未成立")}
              </button>
              <a
                className="button ghost"
                href={`https://${r.peer_domain}`}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
              >
                {t("Open website", "打开网站")}
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ))}
      </section>
      <h2 style={{ fontSize: 16, margin: "25px 0 15px" }}>
        {t("Original screenshots and extracted fields", "原始截图与提取字段")}
      </h2>
      {evidence.map((e) => (
        <EvidenceReview key={e.id} evidence={e} />
      ))}
    </>
  );
}
function EvidenceReview({ evidence: e }: { evidence: Evidence }) {
  const { data, t, api, busy, notify } = useCharts();
  const [fields, setFields] = useState<TrafficFields>(
      e.extracted ?? {
        domain: "",
        source: "",
        month: "",
        metric: "",
        scope: "",
        value: null,
      },
    ),
    [channel, setChannel] = useState(e.review_channel ?? ""),
    [reference, setReference] = useState(e.review_reference ?? ""),
    [note, setNote] = useState(e.review_note ?? ""),
    [revision, setRevision] = useState(false),
    [url, setUrl] = useState("");
  useEffect(() => {
    if (e.extracted) setFields(e.extracted);
  }, [JSON.stringify(e.extracted)]);
  async function original() {
    const r = await fetch(`/api/charts/evidence/${e.id}`);
    const x = await r.json();
    if (r.ok) setUrl(x.url);
    else notify(x.error);
  }
  function update<K extends keyof TrafficFields>(k: K, v: TrafficFields[K]) {
    setFields((x) => ({ ...x, [k]: v }));
  }
  return (
    <section className="panel">
      <div className="row between">
        <div className="row">
          <FileImage size={18} className="blue" />
          <div>
            <h2 style={{ margin: 0 }}>{e.peer_domain}</h2>
            <div className="domain">{e.original_name}</div>
          </div>
        </div>
        <Status value={e.state} />
      </div>
      <button
        className="button"
        style={{ marginTop: 15 }}
        onClick={() => {
          void original();
        }}
      >
        <ExternalLink size={12} />
        {t("Load private original", "读取私有原图")}
      </button>
      {url && (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            alt={t("Original submitted screenshot", "投稿原始截图")}
            src={url}
            style={{
              display: "block",
              width: "100%",
              maxHeight: 420,
              objectFit: "contain",
              background: "#171b25",
              margin: "15px 0",
              borderRadius: 6,
            }}
          />
        </a>
      )}
      {e.raw_text && (
        <details style={{ margin: "15px 0" }}>
          <summary className="muted small">
            {t("OCR text — untrusted extraction", "OCR 文字 — 未核验提取结果")}
          </summary>
          <pre
            className="mono small"
            style={{
              whiteSpace: "pre-wrap",
              color: "#8f9ab0",
              maxHeight: 160,
              overflow: "auto",
            }}
          >
            {e.raw_text}
          </pre>
        </details>
      )}
      {e.state !== "verified" ? (
        <>
          <div className="form-grid" style={{ marginTop: 15 }}>
            <Field label={t("Measured domain", "被统计域名")}>
              <input
                className="input"
                value={fields.domain}
                onChange={(x) => update("domain", x.target.value)}
              />
            </Field>
            <Field
              label={t(
                "Absolute visits · not K/M shorthand",
                "绝对访问量 · 非 K/M 简写",
              )}
            >
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={fields.value ?? ""}
                onChange={(x) =>
                  update(
                    "value",
                    x.target.value === "" ? null : Number(x.target.value),
                  )
                }
              />
            </Field>
            <Field label={t("Source", "来源")}>
              <select
                value={fields.source}
                onChange={(x) => update("source", x.target.value)}
              >
                <option value="">{t("Confirm source", "确认来源")}</option>
                <option value="AITDK">AITDK</option>
              </select>
            </Field>
            <Field label={t("Statistical month", "统计月份")}>
              <input
                className="input"
                type="month"
                value={fields.month}
                onChange={(x) => update("month", x.target.value)}
              />
            </Field>
            <Field label={t("Metric", "指标")}>
              <select
                value={fields.metric}
                onChange={(x) => update("metric", x.target.value)}
              >
                <option value="">{t("Confirm metric", "确认指标")}</option>
                <option value="visits">{t("Visits", "访问量")}</option>
              </select>
            </Field>
            <Field label={t("Measurement scope", "测量范围")}>
              <select
                value={fields.scope}
                onChange={(x) => update("scope", x.target.value)}
              >
                <option value="">
                  {t("Confirm scope from evidence", "根据证据确认范围")}
                </option>
                <option value="worldwide-all-devices-domain">
                  {t(
                    "Worldwide / all devices / domain",
                    "全球 / 全部设备 / 域名",
                  )}
                </option>
              </select>
            </Field>
            <Field label={t("Review channel", "复核渠道")}>
              <input
                className="input"
                value={channel}
                onChange={(x) => setChannel(x.target.value)}
                placeholder={
                  e.demo
                    ? "Demo fixture review"
                    : t(
                        "Same-source record / independent check",
                        "同源记录核对 / 独立渠道检查",
                      )
                }
              />
            </Field>
            <Field label={t("Review reference", "复核依据")}>
              <input
                className="input"
                value={reference}
                onChange={(x) => setReference(x.target.value)}
                placeholder={
                  e.demo
                    ? "demo://synthetic-traffic-never-real"
                    : t(
                        "Source URL or traceable reference",
                        "来源地址或可追溯依据",
                      )
                }
              />
            </Field>
            <Field
              full
              label={t(
                "Review note / correction explanation",
                "复核说明 / 更正理由",
              )}
            >
              <textarea
                value={note}
                onChange={(x) => setNote(x.target.value)}
              />
            </Field>
          </div>
          <label className="row muted small" style={{ marginTop: 14 }}>
            <input
              type="checkbox"
              checked={revision}
              onChange={(x) => setRevision(x.target.checked)}
            />
            {t(
              "Confirmed source revision: retain old version and record the explanation.",
              "已确认来源修订：保留旧版本并记录更正原因。",
            )}
          </label>
          <div className="review-actions">
            <button
              className="button primary"
              disabled={
                busy ||
                e.state === "pending_extraction" ||
                !channel ||
                !reference
              }
              onClick={() => {
                void api("admin/evidence", {
                  id: e.id,
                  fields,
                  channel,
                  reference,
                  note,
                  revision,
                }).catch(() => {});
              }}
            >
              <ShieldCheck size={12} />
              {t("Verify evidence", "核验通过")}
            </button>
            <button
              className="button danger"
              disabled={busy || note.trim().length < 5}
              onClick={() => {
                void api("admin/evidence", {
                  id: e.id,
                  action: "invalid",
                  note,
                }).catch(() => {});
              }}
            >
              {t("Mark invalid", "标为不合格")}
            </button>
          </div>
        </>
      ) : (
        <p>
          {t("Reviewed via", "复核渠道")}: {e.review_channel}
          <br />
          {t("Reference", "依据")}: {e.review_reference}
          <br />
          {t("Review note", "说明")}: {e.review_note ?? "—"}
        </p>
      )}
    </section>
  );
}
function SnapshotConsole() {
  const { data, t, dataset, locale, api, busy, notify } = useCharts();
  const [month, setMonth] = useState(
      data.months.find((m) => m.accepted)?.month ?? "",
    ),
    [category, setCategory] = useState("ai-coding"),
    [note, setNote] = useState(""),
    [releasedMonth, setReleasedMonth] = useState(""),
    [reference, setReference] = useState("");
  return (
    <>
      <section className="panel">
        <h2>{t("Published source calendar", "来源已发布月份日历")}</h2>
        <p>
          {t(
            "Only confirmed released months are accepted. Demo publication references cannot authorize real data. Keep the three latest accepted months.",
            "仅接受已确认发布的月份。演示发布依据不能授权真实数据。保留最近三个可接受月份。",
          )}
        </p>
        <div className="row">
          {data.months.map((m) => (
            <span
              className={`tag ${m.accepted ? "verified" : ""}`}
              key={m.month}
            >
              {m.month} ·{" "}
              {m.accepted ? t("accepted", "接受") : t("history", "历史")}
            </span>
          ))}
        </div>
        <div className="form-grid" style={{ marginTop: 20 }}>
          <Field label={t("Released month", "已发布月份")}>
            <input
              className="input"
              type="month"
              value={releasedMonth}
              onChange={(e) => setReleasedMonth(e.target.value)}
            />
          </Field>
          <Field label={t("Publication reference", "发布依据")}>
            <input
              className="input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <div className="review-actions">
          <button
            className="button"
            disabled={busy || !releasedMonth || reference.length < 8}
            onClick={() => {
              void api("admin/month", {
                month: releasedMonth,
                reference,
                accepted: true,
                demo: dataset === "demo",
              }).catch(() => {});
            }}
          >
            {t("Record released month", "记录已发布月份")}
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>{t("Publish a monthly chart snapshot", "发布月榜快照")}</h2>
        <p>
          {t(
            "Snapshots preserve category coverage, source, metric, scope, ordering, data versions and generation time. Revisions require a specific explanation.",
            "快照保留分类覆盖、来源、指标、范围、排序、数据版本与生成时间，修订需要具体说明。",
          )}
        </p>
        <div className="form-grid">
          <Field label={t("Category", "分类")}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {data.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {locale === "zh" ? c.name_zh : c.name_en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Month", "月份")}>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">{t("Select month", "选择月份")}</option>
              {data.months.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.month}
                </option>
              ))}
            </select>
          </Field>
          <Field
            full
            label={t("Revision or coverage explanation", "修订或覆盖变更说明")}
          >
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <div className="review-actions">
          <button
            className="button primary"
            disabled={busy || !month}
            onClick={async () => {
              try {
                await api("admin/snapshot", {
                  category,
                  month,
                  demo: dataset === "demo",
                  note,
                });
                notify(
                  t(
                    "Snapshot is ready. Identical inputs reuse the existing version.",
                    "快照已准备好，相同输入复用既有版本。",
                  ),
                );
              } catch {}
            }}
          >
            {t("Generate snapshot", "生成快照")}
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>{t("Published snapshot history", "已发布快照历史")}</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Category / month", "分类 / 月份")}</th>
                <th>{t("Version", "版本")}</th>
                <th>{t("Coverage", "覆盖")}</th>
                <th>{t("Correction", "更正说明")}</th>
              </tr>
            </thead>
            <tbody>
              {data.snapshots.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.category}
                    <div className="domain mono">
                      {s.month} · {s.source}
                    </div>
                  </td>
                  <td className="mono">v{s.version}</td>
                  <td className="mono">
                    {s.coverage_count}/{s.total_count}
                  </td>
                  <td
                    className="muted small"
                    style={{ whiteSpace: "normal", maxWidth: 250 }}
                  >
                    {s.correction_note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function DecisionReview({
  id,
  title,
  content,
  type,
}: {
  id: string;
  title: string;
  content: string;
  type: "claim" | "correction";
}) {
  const { api, t, busy } = useCharts(),
    [feedback, setFeedback] = useState(""),
    [name, setName] = useState(""),
    [url, setUrl] = useState(""),
    [en, setEn] = useState(""),
    [zh, setZh] = useState("");
  return (
    <div className="review-block">
      <h3>{title}</h3>
      <p>{content}</p>
      <Field label={t("Review basis and feedback", "复核依据与反馈")}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Field>
      {type === "correction" && (
        <details style={{ marginTop: 15 }}>
          <summary className="muted small">
            {t("Apply reviewed factual corrections", "应用已核对的事实更正")}
          </summary>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <Field label={t("Correct name · optional", "更正名称 · 可选")}>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field
              label={t(
                "Correct official URL · optional",
                "更正官网地址 · 可选",
              )}
            >
              <input
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Field>
            <Field label="English description">
              <textarea value={en} onChange={(e) => setEn(e.target.value)} />
            </Field>
            <Field label="中文介绍">
              <textarea value={zh} onChange={(e) => setZh(e.target.value)} />
            </Field>
          </div>
        </details>
      )}
      <div className="review-actions">
        <button
          className="button primary"
          disabled={busy || feedback.length < 10}
          onClick={() => {
            const patch = Object.fromEntries(
              Object.entries({
                name,
                website_url: url,
                description_en: en,
                description_zh: zh,
              }).filter(([, v]) => v.trim()),
            );
            void api(`admin/${type}`, {
              id,
              state: type === "claim" ? "approved" : "adopted",
              feedback,
              patch,
            }).catch(() => {});
          }}
        >
          {type === "claim"
            ? t("Approve identity", "认领通过")
            : t("Adopt correction", "采用更正")}
        </button>
        <button
          className="button danger"
          disabled={busy || feedback.length < 10}
          onClick={() => {
            void api(`admin/${type}`, {
              id,
              state: "rejected",
              feedback,
            }).catch(() => {});
          }}
        >
          {t("Reject with reason", "说明理由并拒绝")}
        </button>
      </div>
    </div>
  );
}

function ResearchConsole() {
  const { data, t, dataset } = useCharts();
  const candidates = [...data.researchQueue, ...data.projects].filter(
    (p) => p.demo === (dataset === "demo") || (!p.demo && dataset === "demo"),
  );
  const [selected, setSelected] = useState(candidates[0]?.id ?? "");
  const project = candidates.find((p) => p.id === selected) ?? candidates[0];
  return (
    <>
      <div className="notice">
        {t(
          "Newly adopted peer websites enter this research queue. Complete and review their profile before publication; peer nomination alone never publishes a page.",
          "新采用的同行网站进入研究队列，完成资料并审核后再发布。同行提名本身不会自动发布页面。",
        )}
      </div>
      <div className="filters">
        <select
          value={project?.id ?? ""}
          aria-label={t("Choose research profile", "选择项目资料")}
          onChange={(e) => setSelected(e.target.value)}
        >
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.publication === "published" ? "✓" : "○"} {p.name} · {p.domain}
            </option>
          ))}
        </select>
      </div>
      {project ? (
        <ResearchEditor key={project.id} project={project} />
      ) : (
        <Empty title={t("No research profiles", "暂无项目资料")} />
      )}
    </>
  );
}
function ResearchEditor({ project: p }: { project: Project }) {
  const { data, t, locale, api, busy, href, notify } = useCharts();
  const [name, setName] = useState(p.name),
    [category, setCategory] = useState(p.category),
    [en, setEn] = useState(p.description_en),
    [zh, setZh] = useState(p.description_zh),
    [price, setPrice] = useState(p.price_type),
    [verified, setVerified] = useState(p.price_verified ?? false),
    [reference, setReference] = useState(p.official_source ?? p.website_url);
  const metadata = data.jobs.find(
    (j) => j.kind === "metadata" && j.payload.project_id === p.id,
  );
  async function save(publication: string) {
    try {
      await api("admin/project", {
        id: p.id,
        publication,
        reference,
        price_verified: verified,
        project: {
          name,
          website_url: p.website_url,
          category,
          price_type: price,
          description_en: en,
          description_zh: zh,
        },
      });
      notify(t("Reviewed profile saved.", "项目资料已保存。"));
    } catch {}
  }
  return (
    <section className="panel" style={{ marginTop: 18 }}>
      <div className="row between">
        <h2>{p.name}</h2>
        <span className="tag">{p.publication}</span>
      </div>
      <p className="mono">
        {p.domain} · {t("Measurement domain", "测量域名")}:{" "}
        {p.measurement_domain}
      </p>
      {metadata && (
        <div className="notice">
          <Status value={metadata.state} />
          <p>
            {String(
              metadata.result?.name ??
                metadata.error ??
                t("Metadata extraction is queued.", "资料提取已排队。"),
            )}
          </p>
          {typeof metadata.result?.description === "string" && (
            <p>
              {t("Unreviewed source excerpt", "未审核来源摘录")}:{" "}
              {String(metadata.result.description)}
            </p>
          )}
        </div>
      )}
      <div className="form-grid">
        <Field label={t("Project name", "项目名称")}>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t("Primary category", "主分类")}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {data.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {locale === "zh" ? c.name_zh : c.name_en}
              </option>
            ))}
          </select>
        </Field>
        <Field label="English description">
          <textarea
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="Original factual description of the actual task."
          />
        </Field>
        <Field label="中文介绍">
          <textarea
            value={zh}
            onChange={(e) => setZh(e.target.value)}
            placeholder="请用原创文字说明项目的实际用途。"
          />
        </Field>
        <Field label={t("Price type", "价格类型")}>
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value as Project["price_type"])}
          >
            {["free", "freemium", "trial", "paid"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Factual source reference", "事实来源依据")}>
          <input
            className="input"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </Field>
      </div>
      <label className="row muted small" style={{ marginTop: 17 }}>
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
        />
        {t(
          "Price type has been checked against the source.",
          "价格类型已根据来源核对。",
        )}
      </label>
      <div className="review-actions">
        <button
          className="button"
          disabled={busy}
          onClick={() => {
            void save("draft");
          }}
        >
          {t("Save unpublished", "保存为未发布")}
        </button>
        <button
          className="button primary"
          disabled={
            busy ||
            !name ||
            en.trim().length < 20 ||
            zh.trim().length < 10 ||
            reference.length < 8
          }
          onClick={() => {
            void save("published");
          }}
        >
          {t("Publish reviewed profile", "发布已审核资料")}
        </button>
        {p.publication === "published" && (
          <Link className="button ghost" href={href(`/projects/${p.slug}`)}>
            {t("Open public profile", "打开公开资料")} ↗
          </Link>
        )}
      </div>
    </section>
  );
}
