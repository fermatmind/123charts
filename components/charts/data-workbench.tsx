"use client";
import { useState } from "react";
import { useCharts, Field, Status, Empty } from "./context";
export function DataWorkbench() {
  const { data, t, api, refresh, notify } = useCharts();
  const cfg = data.verificationSettings ?? {};
  const [domains, setDomains] = useState(
    (cfg.domains ?? ["cursor.com"]).join("\n"),
  );
  const [mode, setMode] = useState(cfg.mode ?? "selected");
  const [domain, setDomain] = useState("cursor.com"),
    [month, setMonth] = useState("2026-09"),
    [sourceImage, setSourceImage] = useState(""),
    [uploading, setUploading] = useState(false);
  const tasks = data.verificationTasks;
  const [pid, setPid] = useState(data.projects[0]?.id ?? ""),
    [cat, setCat] = useState("ai-coding"),
    [placement, setPlacement] = useState("main"),
    [state, setState] = useState("confirmed"),
    [basis, setBasis] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [openReceipt, setOpenReceipt] = useState("");
  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("domain", domain);
      form.set("month", month);
      const r = await fetch("/api/charts/admin/source-upload", {
        method: "POST",
        body: form,
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setSourceImage(result.id);
      await refresh();
      notify(t("Original saved; OCR is queued.", "原图已保存，OCR 已排队。"));
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <section className="panel">
        <h2>{t("Continuous source verification", "持续来源核验")}</h2>
        <p className="small muted">
          {t(
            "Semrush public pages are a separate source. AITDK screenshots are never automatically certified by a cross-source comparison. Daily incremental checks and weekly due-date reviews share one queue.",
            "Semrush 公开页面作为独立来源。跨来源对照不会自动认证 AITDK 截图。每日增量与每周到期轮检共用一条队列。",
          )}
        </p>
        <div className="form-grid">
          <Field label={t("Scheduled coverage", "轮检范围")}>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="selected">
                {t("Selected domains", "指定域名")}
              </option>
              <option value="library">
                {t("All published research websites", "全部已发布研究网站")}
              </option>
            </select>
          </Field>
          <Field
            label={t(
              "Approved source domains (one per line)",
              "获准核验的域名（每行一个）",
            )}
          >
            <textarea
              className="input"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />
          </Field>
          <div>
            <p className="mono small">
              {t("Daily request limit", "每日请求上限")}:{" "}
              {cfg.max_requests_daily ?? 5}
              <br />
              {t("Daily budget", "每日费用预算")}: $
              {cfg.budget_usd_daily ?? 0.05}
              <br />
              {t("Retries", "重试上限")}: {cfg.max_retries ?? 3}
              <br />
              {t("Run time limit", "每轮时限")}:{" "}
              {(cfg.max_runtime_ms ?? 25000) / 1000}s
            </p>
            <button
              className="button primary"
              onClick={() =>
                void api("admin/verification-settings", {
                  enabled: !cfg.enabled,
                  domains: domains.split(/\s+/).filter(Boolean),
                  mode,
                }).catch(() => {})
              }
            >
              {cfg.enabled
                ? t("Pause source queries", "暂停来源查询")
                : t("Enable source queries", "启用来源查询")}
            </button>
            <button
              className="button"
              onClick={() =>
                void api("admin/verification-settings", {
                  enabled: !!cfg.enabled,
                  domains: domains.split(/\s+/).filter(Boolean),
                  mode,
                }).catch(() => {})
              }
            >
              {t("Save domains", "保存域名")}
            </button>
          </div>
        </div>
      </section>
      <section className="panel">
        <h2>{t("Check one source record", "核对单条来源记录")}</h2>
        <div className="form-grid">
          <Field label={t("Measured domain", "测量域名")}>
            <input
              className="input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </Field>
          <Field label={t("Statistical month", "统计月份")}>
            <input
              type="month"
              className="input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Field>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button
            className="button primary"
            onClick={() =>
              void api("admin/verification", {
                domain,
                month,
                force_refresh: true,
              }).catch(() => {})
            }
          >
            {t("Queue source verification", "排队来源核验")}
          </button>
          <label className="button">
            {uploading
              ? t("Uploading…", "上传中…")
              : t("Attach source screenshot for OCR", "上传来源截图并识别")}
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload(file);
              }}
            />
          </label>
          <button className="button" onClick={() => void refresh()}>
            {t("Refresh status", "刷新状态")}
          </button>
        </div>
        {sourceImage && (
          <button
            className="button"
            style={{ marginTop: 10 }}
            onClick={async () => {
              const r = await fetch(
                `/api/charts/source-evidence/${sourceImage}`,
              );
              const e = await r.json();
              if (!r.ok) {
                notify(e.error);
                return;
              }
              notify(`${e.state}: ${JSON.stringify(e.extracted)}`);
              window.open(e.signed_url, "_blank", "noopener,noreferrer");
            }}
          >
            {t(
              "Inspect private original & extraction",
              "查看私有原图与提取结果",
            )}
          </button>
        )}
      </section>
      <section className="panel">
        <h2>{t("Verification queue", "核验队列")}</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Domain / period", "域名 / 期间")}</th>
                <th>{t("State", "状态")}</th>
                <th>
                  {t("Last success / last attempt", "最近成功 / 最近尝试")}
                </th>
                <th>{t("Next check / calls", "下次检查 / 调用数")}</th>
                <th>{t("Action", "操作")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="mono">
                    {task.domain}
                    <small className="block muted">
                      {task.month} · {task.source}
                    </small>
                  </td>
                  <td>
                    <Status value={task.state} />
                    <small className="block muted">{task.error}</small>
                  </td>
                  <td className="mono small">
                    {task.last_success_at ?? "—"}
                    <small className="block muted">
                      {task.last_attempt_at ?? "—"}
                    </small>
                  </td>
                  <td className="mono small">
                    {task.next_check_at}
                    <small className="block muted">
                      {task.actual_calls} {t("actual calls", "次实际调用")} ·{" "}
                      {task.attempts} {t("attempts", "次尝试")}
                    </small>
                  </td>
                  <td>
                    <button
                      className="button"
                      onClick={() =>
                        void api("admin/verification", {
                          domain: task.domain,
                          month: task.month,
                          force_refresh: true,
                        }).catch(() => {})
                      }
                    >
                      {t("Retry", "重试")}
                    </button>
                    {task.source_evidence_id && (
                      <button
                        className="button"
                        onClick={async () => {
                          const response = await fetch(
                            `/api/charts/source-evidence/${task.source_evidence_id}`,
                          );
                          const e = await response.json();
                          if (response.ok)
                            window.open(
                              e.signed_url,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          else notify(e.error);
                        }}
                      >
                        {t("Private original", "私有原图")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!tasks.length && (
          <Empty title={t("No queued source records", "暂无来源核验任务")} />
        )}
      </section>
      <section className="panel">
        <h2>{t("Actual source receipts", "实际来源核验回执")}</h2>
        {data.receipts.map((r) => (
          <details
            key={r.id}
            open={openReceipt === r.id}
            onToggle={(e) => {
              if (e.currentTarget.open) setOpenReceipt(r.id);
            }}
          >
            <summary
              className="small"
              style={{ padding: "12px 0", cursor: "pointer" }}
            >
              {r.attempted_at.slice(0, 19)} UTC · {r.outcome} · {r.actual_calls}{" "}
              {t("actual calls", "次实际调用")}
            </summary>
            <div className="rank-evidence">
              <a
                className="blue"
                href={r.source_url}
                target="_blank"
                rel="noreferrer"
              >
                {r.source_url}
              </a>
              <p>{r.detail}</p>
              <p>
                {t("Success time", "成功时间")}: {r.success_at ?? "—"}
                <br />
                {t("Response SHA-256", "响应 SHA-256")}:{" "}
                <code>{r.response_hash ?? "—"}</code>
              </p>
              {r.outcome === "conflict" && (
                <div>
                  <Field
                    label={t(
                      "Confirmed source revision reason",
                      "已确认的来源修订理由",
                    )}
                  >
                    <textarea
                      className="input"
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                    />
                  </Field>
                  <button
                    className="button primary"
                    disabled={correctionReason.trim().length < 10}
                    onClick={() =>
                      void api("admin/source-correction", {
                        id: r.id,
                        reason: correctionReason,
                      }).catch(() => {})
                    }
                  >
                    {t(
                      "Confirm correction and publish new version",
                      "确认纠错并发布新版本",
                    )}
                  </button>
                </div>
              )}
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(r.extracted, null, 2)}
              </pre>
            </div>
          </details>
        ))}
      </section>
      <section className="panel">
        <h2>{t("Reviewed website classifications", "网站归类审核")}</h2>
        <p className="small muted">
          {t(
            "Every relationship requires a purpose-based explanation. Broad platforms stay contextual, and unconfirmed scopes stay off the main chart. Changes retain an audit trail and create affected snapshot revisions.",
            "每条分类关系都要说明用途依据。综合平台放在相关区域，范围不明的记录不进主榜。调整保留记录，并修订受影响的快照。",
          )}
        </p>
        <div className="form-grid">
          <Field label={t("Website", "网站")}>
            <select value={pid} onChange={(e) => setPid(e.target.value)}>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.domain}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Category", "分类")}>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {data.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {t(c.name_en, c.name_zh)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Classification state", "归类状态")}>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="pending">{t("Pending", "待审核")}</option>
              <option value="confirmed">{t("Confirmed", "已确认")}</option>
              <option value="adjusted">{t("Adjusted", "已调整")}</option>
            </select>
          </Field>
          <Field label={t("Placement", "榜单位置")}>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
            >
              <option value="main">
                {t("Main category chart", "分类主榜")}
              </option>
              <option value="general">
                {t("Related broad platform", "相关综合平台")}
              </option>
              <option value="scope_unknown">
                {t("Scope unknown", "测量范围未确认")}
              </option>
            </select>
          </Field>
          <Field
            label={t(
              "Common purpose and measurement basis",
              "用途与测量范围依据",
            )}
            full
          >
            <textarea
              className="input"
              value={basis}
              onChange={(e) => setBasis(e.target.value)}
            />
          </Field>
        </div>
        <button
          className="button primary"
          disabled={basis.trim().length < 10}
          onClick={() =>
            void api("admin/membership", {
              project_id: pid,
              category: cat,
              state,
              placement,
              basis,
            }).catch(() => {})
          }
        >
          {t("Save classification decision", "保存分类决定")}
        </button>
        <div className="category-update-list">
          {data.memberships
            .filter((m) => m.project_id === pid)
            .map((m) => (
              <div
                key={m.category}
                className="small"
                style={{ padding: "12px 0" }}
              >
                {m.category} · {m.state} · {m.placement}
                <p className="muted">{m.basis}</p>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
