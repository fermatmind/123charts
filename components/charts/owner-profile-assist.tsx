"use client";
import { useState } from "react";
import { ownerPrompt, parseOwnerProfile } from "@/lib/charts/owner-profile";
import type { Draft } from "@/lib/charts/types";
import { useCharts } from "./context";
export function OwnerProfileAssist({
  name,
  websiteURL,
  onImport,
}: {
  name: string;
  websiteURL: string;
  onImport?: (patch: Partial<Draft>) => void;
}) {
  const { locale, t } = useCharts();
  const [raw, setRaw] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [message, setMessage] = useState("");
  const prompt = ownerPrompt(name, websiteURL, locale);
  return (
    <details className="owner-assist">
      <summary>
        {t(
          "Use AI to prepare your own project details",
          "用 AI 核实并准备我的项目资料",
        )}
      </summary>
      <p>
        {t(
          "Copy this prompt into an AI tool with browsing. Review its sources and output yourself. AI output is not platform verification; approved management access is required to update an existing project.",
          "复制提示词交给可联网的 AI，核对来源和输出后再补充资料。AI 输出不等于平台核验；已有项目需先通过认领才能更新。",
        )}
      </p>
      <textarea
        aria-label={t("Project verification prompt", "项目资料核实提示词")}
        readOnly
        value={prompt}
        rows={9}
      />
      <button
        type="button"
        className="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(prompt);
            setMessage(t("Prompt copied", "提示词已复制"));
          } catch {
            setMessage(
              t("Select and copy the prompt above", "请选中上方提示词手动复制"),
            );
          }
        }}
      >
        {t("Copy verification prompt", "复制核实提示词")}
      </button>
      {onImport && (
        <div className="owner-import">
          <p>
            {t(
              "Upload the AI JSON or paste it below. Only profile fields enter your draft; identity, publication, price verification and relationships cannot be imported.",
              "上传 AI 生成的 JSON 文件，或粘贴到下方。只导入项目资料草稿，不导入身份、公开状态、价格核验或同行关系。",
            )}
          </p>
          <label>
            {t("Upload profile JSON", "上传项目资料 JSON")}
            <input
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 65536) {
                  setMessage(t("File exceeds 64 KB", "文件超过 64 KB"));
                  return;
                }
                setRaw(await f.text());
                setConfirmed(false);
                setMessage("");
              }}
            />
          </label>
          <textarea
            aria-label={t("Profile JSON", "项目资料 JSON")}
            value={raw}
            maxLength={65536}
            rows={7}
            onChange={(e) => {
              setRaw(e.target.value);
              setConfirmed(false);
              setMessage("");
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            {t(
              "I checked the facts and sources; import only to my draft",
              "我已逐项核对事实与来源，仅导入草稿",
            )}
          </label>
          <button
            type="button"
            className="button"
            disabled={!confirmed || !raw.trim()}
            onClick={() => {
              try {
                onImport(parseOwnerProfile(raw, websiteURL));
                setRaw("");
                setConfirmed(false);
                setMessage(
                  t(
                    "Imported into your draft. Review the form before submitting.",
                    "已导入草稿，请检查表单后再提交审核。",
                  ),
                );
              } catch (e) {
                setMessage(
                  t("Cannot import: ", "无法导入：") + (e as Error).message,
                );
              }
            }}
          >
            {t("Import into draft", "导入资料草稿")}
          </button>
        </div>
      )}
      <p className="muted" role="status">
        {message}
      </p>
    </details>
  );
}
