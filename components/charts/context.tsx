"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Bootstrap, Dataset, Locale } from "@/lib/charts/types";
interface ChartsContext {
  data: Bootstrap;
  locale: Locale;
  dataset: Dataset;
  t: (en: string, zh: string) => string;
  href: (path: string) => string;
  refresh: () => Promise<void>;
  api: <T = any>(route: string, body?: unknown) => Promise<T>;
  notify: (text: string) => void;
  busy: boolean;
}
const Context = createContext<ChartsContext | null>(null);
export function ChartsProvider({
  initial,
  locale,
  dataset,
  children,
}: {
  initial: Bootstrap;
  locale: Locale;
  dataset: Dataset;
  children: React.ReactNode;
}) {
  const [data, setData] = useState(initial),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState(0);
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    setData(initial);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [initial, locale]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);
  const refresh = useCallback(async () => {
    const r = await fetch(`/api/charts/bootstrap?dataset=${dataset}`, {
      cache: "no-store",
    });
    if (r.ok) setData(await r.json());
  }, [dataset]);
  const href = useCallback(
    (target: string) => {
      const [pathname, qs] = target.split("?");
      const q = new URLSearchParams(qs);
      q.set("dataset", dataset);
      return `/${locale}${pathname === "/" ? "" : pathname}?${q}`;
    },
    [locale, dataset],
  );
  const api = useCallback(
    async <T,>(route: string, body?: unknown): Promise<T> => {
      setPending((x) => x + 1);
      try {
        const r = await fetch(`/api/charts/${route}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
          keepalive: true,
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error ?? "Request failed");
        await refresh();
        if (route === "auth") router.refresh();
        return result;
      } catch (e) {
        setMessage(
          (locale === "zh" ? "操作未完成：" : "Action incomplete: ") +
            (e as Error).message,
        );
        throw e;
      } finally {
        setPending((x) => x - 1);
      }
    },
    [refresh, router, locale],
  );
  const poll = data.jobs.some(
    (j) => j.state === "pending" || j.state === "running",
  );
  useEffect(() => {
    if (!poll) return;
    const timer = setInterval(() => {
      void refresh();
    }, 2500);
    return () => clearInterval(timer);
  }, [poll, refresh]);
  // Preserve the exact query while switching language, including category, month and pagination.
  void params;
  return (
    <Context.Provider
      value={{
        data,
        locale,
        dataset,
        t: (en, zh) => (locale === "zh" ? zh : en),
        href,
        refresh,
        api,
        notify: setMessage,
        busy: pending > 0,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </Context.Provider>
  );
}
export function useCharts() {
  const value = useContext(Context);
  if (!value) throw new Error("Charts context missing");
  return value;
}
export const statusLabels: Record<string, [string, string]> = {
  draft: ["Draft", "草稿"],
  submitted: ["Submitted", "已提交"],
  verifying: ["Verifying", "核验中"],
  approved: ["Approved", "审核通过"],
  needs_info: ["Needs information", "待补资料"],
  rejected: ["Rejected", "不予通过"],
  pending_extraction: ["Queued for OCR", "等待识别"],
  pending_review: ["Awaiting review", "待复核"],
  verified: ["Evidence verified", "证据已核验"],
  conflict: ["Conflict", "存在冲突"],
  invalid: ["Invalid evidence", "不合格"],
  pending: ["Pending", "待处理"],
  running: ["Processing", "处理中"],
  done: ["Complete", "已完成"],
  failed: ["Failed", "处理失败"],
  adopted: ["Adopted", "已采用"],
};
export function Status({ value }: { value: string }) {
  const { t } = useCharts(),
    pair = statusLabels[value] ?? [value, value];
  return (
    <span
      className={`tag ${["verified", "approved", "adopted", "done"].includes(value) ? "verified" : ["needs_info", "conflict", "invalid", "failed", "rejected"].includes(value) ? "warning" : ""}`}
    >
      {["verified", "approved"].includes(value) && (
        <span className="status-dot" />
      )}
      {t(pair[0], pair[1])}
    </span>
  );
}
export function Avatar({ name, size = "" }: { name: string; size?: string }) {
  return (
    <span aria-hidden="true" className={`avatar ${size}`}>
      {name
        .split(/[\s-]+/)
        .map((x) => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </span>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  full?: boolean;
}) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function numberFormat(n: number, locale = "en") {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(n);
}
export function compact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}
