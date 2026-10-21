"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Plus,
  X,
  Save,
  Check,
  LoaderCircle,
  FileImage,
  ExternalLink,
  Search,
} from "lucide-react";
import type { Draft, Peer, Application } from "@/lib/charts/types";
import { useCharts, Field, Empty, Status } from "./context";
const blank: Draft = {
  name: "",
  slug: "",
  website_url: "",
  domain: "",
  category: "ai-coding",
  price_type: "freemium",
  description_en: "",
  description_zh: "",
  peers: [],
};
function clientSite(input: string) {
  const u = new URL(
    /^https?:\/\//i.test(input.trim())
      ? input.trim()
      : `https://${input.trim()}`,
  );
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.port ||
    !u.hostname.includes(".")
  )
    throw new Error("Use a public website URL.");
  return {
    domain: u.hostname.toLowerCase().replace(/^www\./, ""),
    website_url: `https://${u.hostname.toLowerCase().replace(/^www\./, "")}`,
  };
}
export function SubmissionWizard() {
  const { data, t, href, locale, dataset, api, refresh, notify, busy } =
    useCharts();
  const params = useSearchParams(),
    queryId = params.get("id"),
    projectId = params.get("project");
  const existing = data.applications.find((a) => a.id === queryId);
  const updateProject = data.projects.find((p) => p.id === projectId);
  const initialDraft =
    existing?.draft ??
    (updateProject
      ? {
          ...blank,
          name: updateProject.name,
          slug: updateProject.slug,
          website_url: updateProject.website_url,
          domain: updateProject.domain,
          category: updateProject.category,
          price_type: updateProject.price_type,
          description_en: updateProject.description_en,
          description_zh: updateProject.description_zh,
          peers:
            data.reports
              .find(
                (r) =>
                  r.project_id === updateProject.id &&
                  r.owner_id === data.user?.id,
              )
              ?.peers.map((p) => ({
                domain: p.domain,
                name: p.name,
                task: p.task,
                rationale: p.rationale,
              })) ?? [],
        }
      : blank);
  const [draft, setDraft] = useState<Draft>(initialDraft),
    [id, setId] = useState<string | null>(queryId),
    [step, setStep] = useState(1),
    [batch, setBatch] = useState(""),
    [peerSearch, setPeerSearch] = useState(""),
    [uploadDomain, setUploadDomain] = useState(
      initialDraft.peers[0]?.domain ?? "",
    ),
    [uploading, setUploading] = useState(false),
    [saved, setSaved] = useState(false),
    [metadataJob, setMetadataJob] = useState("");
  const saving = useRef<Promise<Application> | null>(null),
    lastSaved = useRef(existing ? JSON.stringify(existing.draft) : ""),
    latest = useRef(draft);
  latest.current = draft;
  const current = data.applications.find((a) => a.id === id);
  const editable = !current || ["draft", "needs_info"].includes(current.status);
  const evidence = data.evidence.filter((e) => e.application_id === id),
    uploadedCount = new Set(
      evidence.filter((e) => e.state !== "invalid").map((e) => e.peer_domain),
    ).size,
    verifiedCount = new Set(
      evidence.filter((e) => e.state === "verified").map((e) => e.peer_domain),
    ).size;
  const isUpdate = existing?.kind === "update" || !!updateProject;
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }
  const idRef = useRef(id);
  async function save(): Promise<Application> {
    if (saving.current) {
      const result = await saving.current;
      if (lastSaved.current === JSON.stringify(latest.current)) return result;
    }
    const payload = JSON.stringify(latest.current);
    const promise = api<Application>("draft", {
      id: idRef.current,
      draft: JSON.parse(payload),
      demo: current?.demo ?? dataset === "demo",
      project_id: updateProject?.id ?? null,
    });
    saving.current = promise;
    try {
      const result = await promise;
      idRef.current = result.id;
      setId(result.id);
      lastSaved.current = payload;
      setSaved(payload === JSON.stringify(latest.current));
      if (!queryId)
        window.history.replaceState(null, "", href(`/submit?id=${result.id}`));
      return result;
    } finally {
      saving.current = null;
    }
  }
  useEffect(() => {
    if (
      !data.user ||
      !editable ||
      !draft.website_url ||
      !draft.name ||
      lastSaved.current === JSON.stringify(draft)
    )
      return;
    const timer = setTimeout(() => {
      void save().catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft, data.user, editable]); // autosave only after a deliberate draft change
  useEffect(() => {
    if (!metadataJob) return;
    const job = data.jobs.find((j) => j.id === metadataJob);
    if (job?.state === "done" && job.result) {
      setDraft((d) => ({
        ...d,
        name: d.name || String(job.result?.name ?? ""),
        description_en:
          d.description_en || String(job.result?.description ?? ""),
      }));
      setMetadataJob("");
    }
    if (job?.state === "failed") setMetadataJob("");
  }, [data.jobs, metadataJob]);
  if (!data.user)
    return (
      <Empty
        title={t(
          "Create your free project workspace",
          "创建免费的项目工作空间",
        )}
      >
        <p>
          {t(
            "Sign in to save drafts, upload evidence and receive your peer report.",
            "登录后可以保存草稿、上传证据并获得同行报告。",
          )}
        </p>
        <Link className="button primary" href={href("/login?next=submit")}>
          {t("Sign in or create account", "登录或注册")}
        </Link>
      </Empty>
    );
  if (!editable)
    return (
      <>
        <div className="page-heading">
          <h1>{draft.name}</h1>
          <Status value={current!.status} />
          <p style={{ marginTop: 15 }}>
            {current?.feedback ??
              t(
                "Your application is being reviewed. The workspace shows feedback and delivered reports.",
                "申请正在审核中，可在工作台查看反馈及报告。",
              )}
          </p>
        </div>
        <Link className="button primary" href={href("/dashboard")}>
          {t("Open workspace", "打开工作台")}
          <ArrowRight size={13} />
        </Link>
      </>
    );
  function addPeers(items: { domain: string; name?: string }[]) {
    try {
      const peers = [...draft.peers];
      for (const item of items) {
        const site = clientSite(item.domain);
        if (peers.some((p) => p.domain === site.domain)) continue;
        if (site.domain === draft.domain)
          throw new Error(
            t("Your own site is not a peer.", "自己的网站不能计为同行。"),
          );
        peers.push({
          domain: site.domain,
          name: item.name ?? site.domain,
          task: "",
          rationale: "",
        });
      }
      if (peers.length > 10)
        throw new Error(
          t("Keep exactly ten distinct peers.", "请保留十个不同同行。"),
        );
      change("peers", peers);
      if (!uploadDomain) setUploadDomain(peers[0]?.domain ?? "");
      setBatch("");
      setPeerSearch("");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function upload(files: FileList | File[] | null) {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    if (!uploadDomain) {
      notify(
        t("Choose the corresponding peer first.", "请先选择截图对应的同行。"),
      );
      return;
    }
    setUploading(true);
    try {
      const saved = await save();
      for (const file of selectedFiles) {
        const form = new FormData();
        form.set("application_id", saved.id);
        form.set("peer_domain", uploadDomain);
        form.set("file", file);
        const r = await fetch("/api/charts/upload", {
          method: "POST",
          body: form,
        });
        const value = await r.json();
        if (!r.ok) throw new Error(value.error);
      }
      await refresh();
      notify(
        t(
          "Images saved. OCR is queued; verification follows review.",
          "图片已保存并进入识别队列，核验由后续审核完成。",
        ),
      );
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit() {
    try {
      const saved = await save();
      await api("submit", { id: saved.id });
      notify(t("Application submitted for review.", "申请已提交审核。"));
    } catch {}
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          {isUpdate
            ? t("Keep your project current", "维护项目资料")
            : t("Free enrollment / shared research", "免费入驻 / 共建研究库")}
        </div>
        <h1>
          {isUpdate
            ? t("Update your project.", "更新你的项目。")
            : t("Bring your project. Meet your peers.", "提交项目，认识同行。")}
        </h1>
        <p>
          {isUpdate
            ? t(
                "Maintain your saved observation group and submit only the changed information.",
                "保留既有同行组，仅提交变化的信息。",
              )
            : t(
                "Contribute ten relevant peers and evidence for five to ten. Receive a useful report, a public profile and free recommendation eligibility.",
                "贡献十个相关同行及其中五至十个的截图证据，获得同行报告、公开项目页与免费推荐资格。",
              )}
        </p>
      </div>
      {current?.feedback && (
        <div className="notice">
          {t("Review feedback", "审核反馈")}: {current.feedback}
        </div>
      )}
      <div className="wizard-steps">
        {[
          t("Your website", "自己的网站"),
          t("10 peer websites", "十个同行"),
          t("Screenshot evidence", "截图证据"),
        ].map((s, i) => (
          <button
            key={s}
            className={`wizard-step ${step === i + 1 ? "active" : ""}`}
            onClick={() => setStep(i + 1)}
          >
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <section className="panel">
        <div className="form-title row between">
          <h2 style={{ margin: 0 }}>
            {
              [
                t("Start with your website", "从自己的网站开始"),
                t("Who solves a similar task?", "哪些网站解决相近任务？"),
                t("Attach the evidence", "提供截图证据"),
              ][step - 1]
            }
          </h2>
          <span className="small muted">{step}/3</span>
        </div>
        {step === 1 && (
          <div className="form-grid">
            <Field
              full
              label={t("Official website URL", "官网地址")}
              hint={t(
                "We can suggest basic details; review and complete both languages.",
                "平台可辅助提取基础资料，请核对并补齐中英文。",
              )}
            >
              <div className="row" style={{ flexWrap: "nowrap" }}>
                <input
                  className="input"
                  value={draft.website_url}
                  onChange={(e) => change("website_url", e.target.value)}
                  onBlur={() => {
                    try {
                      if (draft.website_url) {
                        const site = clientSite(draft.website_url);
                        setDraft((d) => ({ ...d, ...site }));
                      }
                    } catch {}
                  }}
                  placeholder="https://your-project.com"
                />
                <button
                  disabled={!!metadataJob || busy || !draft.website_url}
                  className="button"
                  onClick={async () => {
                    try {
                      const j = await api<{ id: string }>("metadata", {
                        url: draft.website_url,
                      });
                      setMetadataJob(j.id);
                    } catch {}
                  }}
                >
                  {metadataJob ? (
                    <LoaderCircle size={13} />
                  ) : (
                    <Search size={13} />
                  )}{" "}
                  {t("Fetch details", "提取资料")}
                </button>
              </div>
            </Field>
            {metadataJob && (
              <div className="field full">
                <div className="skeleton" />
                <small>
                  {t(
                    "Retrieving metadata. You can continue editing.",
                    "正在提取资料，可以继续手动编辑。",
                  )}
                </small>
              </div>
            )}
            <Field label={t("Project name", "项目名称")}>
              <input
                required
                className="input"
                value={draft.name}
                maxLength={200}
                onChange={(e) => change("name", e.target.value)}
                placeholder={t("Your project name", "你的项目名称")}
              />
            </Field>
            <Field label={t("Primary category", "主分类")}>
              <select
                value={draft.category}
                onChange={(e) => change("category", e.target.value)}
              >
                {data.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {locale === "zh" ? c.name_zh : c.name_en}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t("Pricing type", "产品价格类型")}
              hint={t(
                "123Charts enrollment is free for every price type.",
                "无论产品是否收费，123Charts 核心入驻服务免费。",
              )}
            >
              <select
                value={draft.price_type}
                onChange={(e) =>
                  change("price_type", e.target.value as Draft["price_type"])
                }
              >
                {["free", "freemium", "trial", "paid"].map((v, i) => (
                  <option key={v} value={v}>
                    {
                      [
                        t("Free", "免费"),
                        t("Free tier", "提供免费额度"),
                        t("Trial", "试用"),
                        t("Paid", "收费"),
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </Field>
            <div />
            <Field label="English description">
              <textarea
                value={draft.description_en}
                maxLength={2000}
                onChange={(e) => change("description_en", e.target.value)}
                placeholder="What does your project help people do?"
              />
            </Field>
            <Field label="中文介绍">
              <textarea
                value={draft.description_zh}
                maxLength={2000}
                onChange={(e) => change("description_zh", e.target.value)}
                placeholder="你的项目帮助用户完成什么任务？"
              />
            </Field>
          </div>
        )}
        {step === 2 && (
          <>
            <div className="notice">
              {t(
                "Ten independent websites, with a specific shared task. Duplicate aliases, unrelated popular sites and GitHub repositories do not fill a slot.",
                "需要十个独立网站，并说明具体共同任务。重复别名、无关知名站点和 GitHub 仓库不能凑数。",
              )}
            </div>
            <div className="form-grid">
              <Field label={t("Paste website URLs in bulk", "批量粘贴网址")}>
                <textarea
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder={"https://peer-one.com\nhttps://peer-two.com"}
                />
                <button
                  className="button"
                  type="button"
                  onClick={() =>
                    addPeers(
                      batch
                        .split(/[\s,，;；]+/)
                        .filter(Boolean)
                        .map((domain) => ({ domain })),
                    )
                  }
                  disabled={!batch.trim()}
                >
                  <Plus size={12} />
                  {t("Add websites", "添加网站")}
                </button>
              </Field>
              <Field label={t("Or choose existing profiles", "或选择已有资料")}>
                <input
                  className="input"
                  value={peerSearch}
                  onChange={(e) => setPeerSearch(e.target.value)}
                  placeholder={t("Search name or domain", "搜索名称或域名")}
                />
                <div style={{ maxHeight: 135, overflow: "auto" }}>
                  {data.projects
                    .filter(
                      (p) =>
                        !p.demo &&
                        !draft.peers.some((x) => x.domain === p.domain) &&
                        (p.name + p.domain)
                          .toLowerCase()
                          .includes(peerSearch.toLowerCase()),
                    )
                    .slice(0, 8)
                    .map((p) => (
                      <button
                        key={p.id}
                        className="button ghost"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                        onClick={() =>
                          addPeers([{ domain: p.domain, name: p.name }])
                        }
                      >
                        {p.name}
                        <Plus size={12} />
                      </button>
                    ))}
                </div>
              </Field>
            </div>
            <div className="section-header">
              <h2>{t("Your selected peers", "已选择的同行")}</h2>
              <span className="mono small">{draft.peers.length}/10</span>
            </div>
            <div className="peer-list">
              {draft.peers.map((p, i) => (
                <div className="peer-item" key={p.domain}>
                  <span className="mono muted small">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="row">
                      <input
                        className="input"
                        aria-label={t(
                          `Peer ${i + 1} name`,
                          `同行 ${i + 1} 名称`,
                        )}
                        value={p.name}
                        onChange={(e) =>
                          change(
                            "peers",
                            draft.peers.map((x, n) =>
                              n === i ? { ...x, name: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <span className="mono small muted">{p.domain}</span>
                    </div>
                    <Field label={t("Shared task", "共同任务")}>
                      <input
                        className="input"
                        value={p.task}
                        onChange={(e) =>
                          change(
                            "peers",
                            draft.peers.map((x, n) =>
                              n === i ? { ...x, task: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder={t(
                          "e.g. search internal documents",
                          "例如：搜索内部文档",
                        )}
                      />
                    </Field>
                    <Field
                      label={t(
                        "Why can these products be compared?",
                        "这些产品在哪方面可比较？",
                      )}
                    >
                      <input
                        className="input"
                        value={p.rationale}
                        onChange={(e) =>
                          change(
                            "peers",
                            draft.peers.map((x, n) =>
                              n === i ? { ...x, rationale: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder={t(
                          "Specific overlap, target users and limits",
                          "说明具体重合任务、用户及比较边界",
                        )}
                      />
                    </Field>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={t(`Remove ${p.name}`, `移除 ${p.name}`)}
                    onClick={() =>
                      change(
                        "peers",
                        draft.peers.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="stat-row">
              <div>
                <strong>
                  {draft.peers.length}
                  <span>/10</span>
                </strong>
                <span>{t("Peer websites", "同行网站")}</span>
              </div>
              <div>
                <strong>
                  {uploadedCount}
                  <span>/5–10</span>
                </strong>
                <span>
                  {t("Different peers with uploads", "已上传截图的不同同行")}
                </span>
              </div>
              <div>
                <strong>{verifiedCount}</strong>
                <span>
                  {t("Evidence verified after review", "经复核通过的同行证据")}
                </span>
              </div>
            </div>
            <div className="notice">
              {t("Accepted released months", "可接受的已发布月份")}:{" "}
              {data.months
                .filter((m) => m.accepted)
                .map((m) => m.month)
                .join(", ") ||
                t(
                  "Not yet configured — uploads stay pending review.",
                  "尚未配置，上传材料保留待复核。",
                )}
              <br />
              {t(
                "Include domain, source, visits, unit, month and scope. Multiple images for one peer count once.",
                "请包含域名、来源、访问量、单位、月份与范围。同一同行多张图只计一次。",
              )}
            </div>
            <Field label={t("This batch belongs to", "本批截图对应同行")}>
              <select
                value={uploadDomain}
                onChange={(e) => setUploadDomain(e.target.value)}
              >
                <option value="">{t("Choose a peer", "选择同行")}</option>
                {draft.peers.map((p) => (
                  <option value={p.domain} key={p.domain}>
                    {p.name} · {p.domain}
                  </option>
                ))}
              </select>
            </Field>
            <div
              className="dropzone"
              style={{ marginTop: 15 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!uploading) void upload(e.dataTransfer.files);
              }}
            >
              <UploadCloud size={27} className="blue" />
              <strong>
                {uploading
                  ? t("Uploading images…", "正在上传图片…")
                  : t("Drop screenshots here", "拖拽截图到这里")}
              </strong>
              <span>
                {t(
                  "PNG, JPG or WebP · up to 10 MB each",
                  "PNG、JPG 或 WebP · 每张最多 10 MB",
                )}
              </span>
              <input
                aria-label={t("Upload screenshots", "上传截图")}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={uploading || !draft.peers.length}
                onChange={(e) => {
                  void upload(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploading && (
                <div className="progress-track" style={{ width: "100%" }}>
                  <div />
                </div>
              )}
            </div>
            {evidence.map((e) => (
              <div className="evidence-card" key={e.id}>
                <FileImage size={18} className="muted" />
                <div style={{ flex: 1 }}>
                  <div className="project-name">{e.peer_domain}</div>
                  <p>{e.original_name}</p>
                  <Status value={e.state} />
                  {e.extracted && (
                    <p className="mono">
                      {e.extracted.domain || "?"} ·{" "}
                      {e.extracted.value ?? t("No numeric value", "无数值")}{" "}
                      {e.extracted.metric} ·{" "}
                      {e.extracted.month || t("Month missing", "缺少月份")}
                    </p>
                  )}
                  {e.review_note && <p>{e.review_note}</p>}
                  {e.state === "pending_extraction" && (
                    <div className="progress-track">
                      <div />
                    </div>
                  )}
                </div>
                <div className="row">
                  <button
                    className="icon-button"
                    aria-label={t("View original image", "查看原图")}
                    onClick={async () => {
                      const r = await fetch(`/api/charts/evidence/${e.id}`);
                      const x = await r.json();
                      if (r.ok)
                        window.open(x.url, "_blank", "noopener,noreferrer");
                      else notify(x.error);
                    }}
                  >
                    <ExternalLink size={12} />
                  </button>
                  {e.state !== "verified" && (
                    <button
                      className="icon-button"
                      aria-label={t("Remove evidence", "移除证据")}
                      disabled={busy}
                      onClick={() => {
                        void api("delete-evidence", { id: e.id }).catch(
                          () => {},
                        );
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        <div className="wizard-actions">
          <small>
            {saved ? (
              <>
                <Check size={11} style={{ display: "inline" }} />{" "}
                {t("Saved to your account", "已保存到账户")}
              </>
            ) : (
              t("Draft saves automatically after edits", "编辑后自动保存草稿")
            )}
            {id && <span className="mono"> · {id.slice(0, 8)}</span>}
          </small>
          {step > 1 && (
            <button className="button" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={12} />
              {t("Back", "上一步")}
            </button>
          )}
          <button
            className="button"
            disabled={busy || !draft.name || !draft.website_url}
            onClick={() => {
              void save().catch(() => {});
            }}
          >
            <Save size={12} />
            {t("Save draft", "保存草稿")}
          </button>
          {step < 3 ? (
            <button
              className="button primary"
              onClick={() => setStep((s) => s + 1)}
            >
              {t("Continue", "继续")}
              <ArrowRight size={12} />
            </button>
          ) : (
            <button
              className="button primary"
              disabled={
                busy ||
                uploading ||
                (!isUpdate && (draft.peers.length !== 10 || uploadedCount < 5))
              }
              onClick={() => {
                void submit();
              }}
            >
              {t("Submit for review", "提交审核")}
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </section>
      <p className="muted small">
        {t(
          "Completing the counts does not guarantee approval. Management identity is verified separately. Unknown values are never filled in.",
          "填满数量不代表自动通过，管理者身份单独核实，未知数值保持未知。",
        )}
      </p>
    </>
  );
}
