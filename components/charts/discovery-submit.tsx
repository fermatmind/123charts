"use client";
import { OwnerProfileAssist } from "./owner-profile-assist";
import Link from "next/link";
import { brand } from "@/lib/charts/brand";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCharts, Empty, Status } from "./context";
import { prices } from "@/lib/charts/discovery";
import type { Application, Draft, Peer } from "@/lib/charts/types";
const blank: Draft = {
  name: "",
  slug: "",
  website_url: "",
  domain: "",
  category: "ai-coding",
  price_type: "unknown",
  description_en: "",
  description_zh: "",
  task: "",
  supported_languages: ["English"],
  differentiator: "",
  conditions: "",
  is_open_source: false,
  open_source_url: "",
  peer_exception_reason: "",
  supplementary_alternatives: "",
  peers: [],
};
export function DiscoverySubmit() {
  const { data, t, api, href, locale, dataset, busy, notify } = useCharts();
  const params = useSearchParams();
  const existing = data.applications.find((a) => a.id === params.get("id"));
  const project = [...data.projects, ...data.managedProjects].find(
    (p) =>
      p.id ===
      (params.get("project") ||
        (existing?.kind === "update" ? existing.project_id : null)),
  );
  const canEditProject =
    !project ||
    data.claims.some(
      (c) =>
        c.project_id === project.id &&
        c.owner_id === data.user?.id &&
        c.state === "approved",
    );
  const activeRelations = [
    ...new Map(
      data.relations
        .filter(
          (r) =>
            r.project_id === project?.id &&
            r.status === "approved" &&
            !r.withdrawn_at,
        )
        .map((r) => [r.peer_domain, r]),
    ).values(),
  ];
  const [draft, setDraft] = useState<Draft>(
    () =>
      existing?.draft ||
      (project
        ? {
            ...blank,
            ...project,
            peers: activeRelations.slice(0, 5).map((r) => ({
              domain: r.peer_domain,
              name: r.peer_name,
              task: r.task,
              rationale: r.rationale,
            })),
          }
        : blank),
  );
  const [id, setId] = useState<string | null>(existing?.id || null),
    [step, setStep] = useState(1),
    [batch, setBatch] = useState(""),
    [query, setQuery] = useState(""),
    [saved, setSaved] = useState(""),
    [job, setJob] = useState(""),
    [submitted, setSubmitted] = useState(false);
  const metadataJob = data.jobs.find((item) => item.id === job);
  const metadataPending =
    !!job &&
    (!metadataJob || ["pending", "running"].includes(metadataJob.state));
  const metadataFailed = metadataJob?.state === "failed";
  const savedJSON = useRef(existing ? JSON.stringify(existing.draft) : "");
  const [languageInput, setLanguageInput] = useState(
    (draft.supported_languages || []).join(", "),
  );
  const current = useRef(draft);
  current.current = draft;
  const saveLock = useRef<Promise<Application> | null>(null);
  const idRef = useRef(id);
  const dirty = JSON.stringify(draft) !== savedJSON.current;
  const editable =
    !existing || ["draft", "needs_info"].includes(existing.status);
  async function save() {
    if (!canEditProject)
      throw Error(t("Approved owner claim required", "请先通过管理身份认领"));
    if (saveLock.current) {
      const saved = await saveLock.current;
      if (JSON.stringify(current.current) !== savedJSON.current) return save();
      return saved;
    }
    const value = current.current;
    const saveURL = new URL(window.location.href);
    const promise = api<Application>("draft", {
      id: idRef.current,
      draft: value,
      demo: dataset === "demo",
      project_id: project?.id,
    }).then((a) => {
      idRef.current = a.id;
      setId(a.id);
      savedJSON.current = JSON.stringify(value);
      setSaved(new Date().toLocaleTimeString());
      // Keep the saved revision on refresh without discarding in-progress edits.
      if (
        window.location.pathname === saveURL.pathname &&
        window.location.search === saveURL.search
      ) {
        saveURL.searchParams.set("id", a.id);
        window.history.replaceState(
          null,
          "",
          saveURL.pathname + saveURL.search + saveURL.hash,
        );
      }
      return a;
    });
    saveLock.current = promise;
    try {
      return await promise;
    } finally {
      saveLock.current = null;
    }
  }
  useEffect(() => {
    if (
      !data.user ||
      !canEditProject ||
      !dirty ||
      !editable ||
      !draft.website_url ||
      !draft.name
    )
      return;
    const timer = setTimeout(() => void save().catch(() => {}), 1300);
    return () => clearTimeout(timer);
  }, [draft, dirty, editable, data.user, canEditProject]);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(current.current) !== savedJSON.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);
  useEffect(() => {
    const j = data.jobs.find((j) => j.id === job);
    if (j?.state === "done" && j.result) {
      setDraft((d) => ({
        ...d,
        name: d.name || String(j.result!.name || ""),
        description_en: d.description_en || String(j.result!.description || ""),
        category: String(j.result!.suggested_category || d.category),
      }));
      setJob("");
      notify(
        t(
          "Metadata ready. Confirm the facts below.",
          "资料已提取，请确认下方事实。",
        ),
      );
    }
  }, [data.jobs, job]);
  const metadataURL = useRef("");
  useEffect(() => {
    const value = draft.website_url.trim();
    if (
      !data.user ||
      !canEditProject ||
      !/^(?:https?:\/\/)?[^/\s]+\.[^/\s]+/.test(value) ||
      metadataURL.current === value ||
      /\.example(?:\/|$)/.test(value)
    )
      return;
    const timer = setTimeout(() => {
      if (metadataURL.current === value) return;
      metadataURL.current = value;
      void api<{ id: string }>("metadata", { url: value })
        .then((j) => setJob(j.id))
        .catch(() => {});
    }, 900);
    return () => clearTimeout(timer);
  }, [draft.website_url, data.user, canEditProject]);
  const update = (key: keyof Draft, value: any) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const add = (peer: Peer) => {
    try {
      const u = new URL(
        /^https?:/.test(peer.domain) ? peer.domain : "https://" + peer.domain,
      );
      const domain = u.hostname.toLowerCase().replace(/^www\./, "");
      if (draft.peers.length >= 5)
        throw Error(t("Up to five peers.", "最多五个同行。"));
      if (draft.peers.some((p) => p.domain === domain))
        throw Error(t("Duplicate website.", "网站重复。"));
      setDraft((d) => ({
        ...d,
        peers: [
          ...d.peers,
          {
            ...peer,
            domain,
            task: peer.task || draft.task || "",
            rationale:
              peer.rationale || "Proposed shared task: " + (draft.task || ""),
          },
        ],
      }));
    } catch (e) {
      notify((e as Error).message);
    }
  };
  if (!data.user)
    return (
      <div className="discovery-page">
        <Empty title={t("Submit your tool for free", "免费提交你的工具")}>
          <p>
            {t(
              "Create a free account. Share the task, conditions and 3–5 relevant peers.",
              "注册免费账户，提交用途、使用条件和 3–5 个相关同行。",
            )}
          </p>
          <Link className="button primary" href={href("/login")}>
            {t("Sign in or register", "登录或注册")}
          </Link>
        </Empty>
      </div>
    );
  if (!canEditProject)
    return (
      <div className="discovery-page">
        <Empty
          title={t(
            "Claim this project before updating",
            "认领通过后才能补充资料",
          )}
        >
          <p>
            {t(
              "AI output cannot replace management verification. Return to the profile to submit a claim; free corrections remain available.",
              "AI 资料不能替代管理身份核实。请先到项目页提交认领；免费纠错仍独立开放。",
            )}
          </p>
          <Link
            className="button"
            href={href("/products/" + project.slug) + "#owner-claim"}
          >
            {t("Go to project claim", "前往项目认领")}
          </Link>
        </Empty>
      </div>
    );
  if (submitted || (!editable && existing))
    return (
      <div className="discovery-page">
        <h1>
          {project
            ? existing?.status === "approved"
              ? t("Your profile update is approved", "资料更新已审核通过")
              : existing?.status === "rejected"
                ? t("Your profile update was declined", "资料更新未通过审核")
                : t("Your profile update is in review", "资料更新已提交审核")
            : t("Your profile preview is ready", "档案预览已准备好")}
        </h1>
        {project && (
          <p className="notice">
            {t(
              existing?.status === "approved"
                ? "Your changes are now on the public profile. Your first listing date stays unchanged."
                : "The current public profile remains online. Approved changes replace it after review; your first listing date stays unchanged.",
              existing?.status === "approved"
                ? "资料已更新至公开档案，首次收录时间保持不变。"
                : "现有公开资料继续在线；审核通过后才更新公开页面，首次收录时间保持不变。",
            )}
          </p>
        )}
        <h2>{draft.name}</h2>
        <Status value={existing?.status || "submitted"} />
        <p>{locale === "zh" ? draft.description_zh : draft.description_en}</p>
        <p>
          {draft.task} · {draft.peers.length}{" "}
          {t("related peers submitted", "个相关同行已提交")}
        </p>
        <p className="submission-benefits">{brand[locale].benefits}</p>
        <p className="notice">
          {t(
            "See your application status here or in the workspace. Peer candidates become public alternatives only after separate relationship review.",
            "处理状态以申请和工作台记录为准。同行是关系候选，单独审核确认后才成为公开替代入口。",
          )}
        </p>
        <Link className="button" href={href("/dashboard")}>
          {t("View status in workspace", "在工作台查看处理状态")}
        </Link>
        {project && (
          <Link className="button" href={href("/products/" + project.slug)}>
            {t("View current public profile", "查看当前公开档案")}
          </Link>
        )}
      </div>
    );
  return (
    <div className="discovery-page discovery-form">
      <div className="page-heading">
        <div className="eyebrow">
          FREE LISTING /{" "}
          {project ? t("UPDATE", "后续更新") : t("THREE STEPS", "三步提交")}
        </div>
        <h1>
          {t("Help people discover your tool.", "让需要的人发现你的工具。")}
        </h1>
        <p>{brand[locale].freeListing}</p>
      </div>
      {project && (
        <p className="notice">
          {t(
            "Your management claim is approved. Copy the AI prompt, upload its JSON, check the imported facts and submit for review. No new peer task is required for a profile update.",
            "管理身份已通过认领。复制 AI 提示词、上传生成的 JSON，核对表单后提交审核。仅更新资料无需重新提交同行任务。",
          )}
        </p>
      )}
      <p className="platform-free-note">{brand[locale].platformFree}</p>
      <p className="submission-benefits">{brand[locale].benefits}</p>
      <p className="muted">
        {t(
          "The platform maintains the introduction and official link. These extended details are supplied by the project owner and remain subject to review.",
          "平台维护简介与官网入口；下列扩展资料由项目方补充，提交后仍需审核。",
        )}
      </p>
      {!!draft.website_url && !!draft.name && (
        <OwnerProfileAssist
          name={draft.name}
          websiteURL={draft.website_url}
          onImport={(patch) => {
            setDraft((d) => ({ ...d, ...patch }));
            if (patch.supported_languages)
              setLanguageInput(patch.supported_languages.join(", "));
            setStep(2);
          }}
        />
      )}
      {!!draft.owner_sources?.length && (
        <details className="owner-assist">
          <summary>
            {t("Owner-supplied source references", "项目方提交的来源依据")}
          </summary>
          <p>
            {t(
              "These references are submitted evidence, not independent platform verification.",
              "以下为提交的资料依据，不代表平台已独立核验。",
            )}
          </p>
          {draft.owner_sources.map((source, i) => (
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
      <div className="discovery-steps">
        {[
          t("1 · Website", "1 · 官网"),
          t("2 · Purpose & conditions", "2 · 用途与条件"),
          project
            ? t("3 · Peers (optional)", "3 · 同行维护（可选）")
            : t("3 · Related peers", "3 · 相关同行"),
        ].map((text, i) => (
          <button
            className={"button " + (step === i + 1 ? "primary" : "")}
            key={text}
            onClick={() => setStep(i + 1)}
          >
            {text}
          </button>
        ))}
      </div>
      {existing && (
        <div className="row">
          <Status value={existing.status} />
        </div>
      )}
      {existing?.feedback && (
        <div className="notice" role="status">
          <strong>{t("Review feedback", "审核反馈")}</strong>
          <p>{existing.feedback}</p>
        </div>
      )}
      {step === 1 && (
        <>
          <label>
            {t("Official website URL", "官网 URL")}
            <input
              aria-label="Official website URL"
              value={draft.website_url}
              onChange={(e) => update("website_url", e.target.value)}
              placeholder="https://your-website.com"
            />
          </label>
          <button
            className="button"
            disabled={busy || metadataPending}
            onClick={async () => {
              try {
                metadataURL.current = draft.website_url.trim();
                const j = await api<{ id: string }>("metadata", {
                  url: draft.website_url,
                });
                setJob(j.id);
              } catch {}
            }}
          >
            {metadataPending
              ? t("Extracting…", "正在提取…")
              : metadataFailed
                ? t("Retry extraction", "重新提取资料")
                : t("Prefill tool details", "提取工具资料")}
          </button>
          {metadataFailed && (
            <p className="notice" role="status">
              {t(
                "Could not extract website details. Check the URL and retry, or continue manually. Your existing entries are kept.",
                "暂时无法提取官网资料。请检查网址后重试，或继续手动填写；已填内容会保留。",
              )}
              <button className="button ghost" onClick={() => setJob("")}>
                {t("Continue manually", "继续手填")}
              </button>
            </p>
          )}
          <label>
            {t("Tool name", "工具名称")}
            <input
              aria-label="Tool name"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label>
            {t("English description", "英文简介")}
            <textarea
              aria-label="English description"
              value={draft.description_en}
              onChange={(e) => update("description_en", e.target.value)}
            />
          </label>
          <label>
            {t("Chinese description", "中文简介")}
            <textarea
              aria-label="Chinese description"
              value={draft.description_zh}
              onChange={(e) => update("description_zh", e.target.value)}
            />
          </label>
          <p className="muted">
            {t(
              "If automatic extraction fails, you can complete these fields yourself. Confirm facts before submitting.",
              "自动提取失败时可手动填写，提交前请确认事实。",
            )}
          </p>
        </>
      )}
      {step === 2 && (
        <>
          <label>
            {t("Primary category", "主要分类")}
            <select
              aria-label="Primary category"
              value={draft.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {data.categories.map((c) => (
                <option value={c.slug} key={c.slug}>
                  {locale === "zh" ? c.name_zh : c.name_en}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Main task", "主要解决的任务")}
            <input
              aria-label="Main task"
              value={draft.task || ""}
              onChange={(e) => update("task", e.target.value)}
              placeholder={t(
                "Search documents for a small team",
                "面向小团队搜索内部文档",
              )}
            />
          </label>
          <label>
            {t("Who it suits & distinguishing focus", "适用人群与一句话特点")}
            <textarea
              aria-label="Distinguishing focus"
              value={draft.differentiator || ""}
              onChange={(e) => update("differentiator", e.target.value)}
            />
          </label>
          <label>
            {t("Price type", "价格类型")}
            <select
              aria-label="Price type"
              value={draft.price_type}
              onChange={(e) => update("price_type", e.target.value)}
            >
              {Object.entries(prices).map(([v, l]) => (
                <option value={v} key={v}>
                  {l[locale === "zh" ? 1 : 0]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Pricing conditions & limits", "价格条件与使用限制")}
            <textarea
              aria-label="Conditions and limits"
              value={draft.conditions || ""}
              onChange={(e) => update("conditions", e.target.value)}
              placeholder={t(
                "Sustained allowance, hosting/API costs, trial duration, or unknown.",
                "持续免费额度、托管或 API 费用、试用时限，未知请注明。",
              )}
            />
          </label>
          <label>
            {t("Supported languages (comma separated)", "支持语言（逗号分隔）")}
            <input
              aria-label="Supported languages"
              value={languageInput}
              onChange={(e) => {
                setLanguageInput(e.target.value);
                update(
                  "supported_languages",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="English, 中文"
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.is_open_source || false}
              onChange={(e) => update("is_open_source", e.target.checked)}
            />
            {t("Open source (independent of price)", "开源（独立于价格）")}
          </label>
          {draft.is_open_source && (
            <label>
              {t("Open source / license URL", "开源与许可证地址")}
              <input
                aria-label="Open source URL"
                value={draft.open_source_url || ""}
                onChange={(e) => update("open_source_url", e.target.value)}
              />
            </label>
          )}
        </>
      )}
      {step === 3 && (
        <>
          <h2>
            {project
              ? t("Maintain your relevant peers", "维护相关同行")
              : t("Suggest 3–5 relevant peers", "推荐 3–5 个相关同行")}
          </h2>
          {project && (
            <label>
              <input
                type="checkbox"
                checked={!!draft.replace_peer_group}
                onChange={(e) => update("replace_peer_group", e.target.checked)}
              />
              {t(
                "Replace the previous peer group after review (removed relationships leave public discovery; history is retained)",
                "审核后替换原同行组（移除的关系退出公开发现，保留历史）",
              )}
            </label>
          )}
          <p className="muted">
            {t(
              "Existing tools count. Explain the shared task, not a broad claim to replace the entire product.",
              "可以选择已有工具，说明共同任务；不要把局部比较写成全面替代。",
            )}
          </p>
          <label>
            {t("Find in the research library", "从研究库选择")}
            <input
              aria-label="Find peer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Tool name or domain", "工具名或域名")}
            />
          </label>
          {query && (
            <div className="row">
              {data.projects
                .filter(
                  (p) =>
                    [p.name, p.domain]
                      .join(" ")
                      .toLowerCase()
                      .includes(query.toLowerCase()) &&
                    !draft.peers.some((x) => x.domain === p.domain),
                )
                .slice(0, 6)
                .map((p) => (
                  <button
                    className="button"
                    key={p.id}
                    onClick={() => {
                      add({
                        domain: p.domain,
                        name: p.name,
                        task: draft.task || "",
                        rationale:
                          "Proposed shared task: " + (draft.task || ""),
                      });
                      setQuery("");
                    }}
                  >
                    {p.name} +
                  </button>
                ))}
            </div>
          )}
          <label>
            {t("Paste website URLs, one per line", "批量粘贴官网，每行一个")}
            <textarea
              aria-label="Peer URLs"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </label>
          <button
            className="button"
            onClick={() => {
              const list = batch.split(/[\s,]+/).filter(Boolean);
              if (list.length + draft.peers.length > 5) {
                notify(t("A maximum of five peers.", "最多五个同行。"));
                return;
              }
              try {
                const next = list.map((raw) => {
                  const u = new URL(
                    /^https?:/.test(raw) ? raw : "https://" + raw,
                  );
                  const domain = u.hostname.replace(/^www\./, "").toLowerCase();
                  return {
                    domain,
                    name: domain,
                    task: draft.task || "",
                    rationale: "Proposed shared task: " + (draft.task || ""),
                  };
                });
                if (
                  new Set([...draft.peers, ...next].map((p) => p.domain))
                    .size !==
                  draft.peers.length + next.length
                )
                  throw Error(t("Duplicate websites found.", "存在重复网站。"));
                setDraft((d) => ({ ...d, peers: [...d.peers, ...next] }));
                setBatch("");
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            {t("Add URLs", "添加网址")}
          </button>
          {draft.peers.map((p, i) => (
            <div className="discovery-peer" key={p.domain}>
              <div className="row">
                <strong>
                  {i + 1}. {p.domain}
                </strong>
                <button
                  className="button ghost"
                  onClick={() =>
                    update(
                      "peers",
                      draft.peers.filter((_, j) => j !== i),
                    )
                  }
                >
                  {t("Remove", "移除")}
                </button>
              </div>
              {(["name", "task", "rationale"] as const).map((key) => (
                <label key={key}>
                  {key === "name"
                    ? t("Name", "名称")
                    : key === "task"
                      ? t("Common task", "共同任务")
                      : t("Why this is relevant", "关联依据")}
                  <input
                    aria-label={`Peer ${i + 1} ${key}`}
                    value={p[key]}
                    onChange={(e) =>
                      update(
                        "peers",
                        draft.peers.map((peer, j) =>
                          j === i ? { ...peer, [key]: e.target.value } : peer,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          ))}
          {!project && draft.peers.length < 3 && (
            <details>
              <summary>
                {t(
                  "Niche project with fewer direct peers?",
                  "创新或小众项目，直接同行不足？",
                )}
              </summary>
              <label>
                {t("Explain why fewer peers exist", "说明直接同行不足的原因")}
                <textarea
                  aria-label="Niche exception reason"
                  value={draft.peer_exception_reason || ""}
                  onChange={(e) =>
                    update("peer_exception_reason", e.target.value)
                  }
                />
              </label>
              <label>
                {t(
                  "Related alternative methods (reviewed separately)",
                  "相关替代方式（单独判断）",
                )}
                <textarea
                  aria-label="Supplementary alternatives"
                  value={draft.supplementary_alternatives || ""}
                  onChange={(e) =>
                    update("supplementary_alternatives", e.target.value)
                  }
                />
              </label>
              <p className="muted">
                {t(
                  "Reviewers decide whether the exception is justified. Unrelated websites are not needed to fill a quota.",
                  "审核员判断例外是否合理，不需要填入无关网站凑数。",
                )}
              </p>
            </details>
          )}
          <p className="notice">
            {t(
              "A draft preview is available immediately. Approval delivers your public profile, comparison shortlist and sharing materials. No traffic screenshots required.",
              "草稿可立即预览，审核通过后交付公开档案、同类对照清单与分享材料，无需流量截图。",
            )}
          </p>
        </>
      )}
      <div className="row">
        <button
          className="button"
          disabled={busy}
          onClick={() => void save().catch(() => {})}
        >
          {t("Save draft", "保存草稿")}
        </button>
        {step > 1 && (
          <button className="button" onClick={() => setStep(step - 1)}>
            {t("Previous", "上一步")}
          </button>
        )}
        {step < 3 && !(project && step === 2) ? (
          <button className="button primary" onClick={() => setStep(step + 1)}>
            {t("Continue", "继续")}
          </button>
        ) : (
          <button
            className="button primary"
            disabled={busy}
            onClick={async () => {
              try {
                let a = await save();
                if (JSON.stringify(current.current) !== savedJSON.current)
                  a = await save();
                await api("submit", { id: a.id });
                setSubmitted(true);
              } catch {}
            }}
          >
            {project
              ? t("Submit profile update for review", "提交资料更新审核")
              : t("Submit for free review", "提交免费审核")}
          </button>
        )}
      </div>
      <p className="muted" aria-live="polite">
        {saved
          ? t("Saved at ", "已保存于 ") + saved
          : existing
            ? t(
                "Saved draft restored. Further edits save automatically.",
                "已恢复保存的草稿；后续修改自动保存。",
              )
            : t(
                "Drafts save automatically after edits.",
                "修改后自动保存草稿。",
              )}{" "}
        {id && (
          <Link href={href("/submit?id=" + id)}>
            {t("Resume link", "继续编辑链接")}
          </Link>
        )}
      </p>
    </div>
  );
}
