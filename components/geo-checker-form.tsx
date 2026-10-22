"use client";
import Link from "next/link";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

interface CheckResult {
  readiness_score: number;
  grade: string;
  normalized_url: string;
  checks: { id: string; label: string; status: string; score: number; summary: string; detail?: string }[];
  missing_items: string[];
  recommendations: string[];
}

export default function GeoCheckerForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/geo-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setResult(json.data);
        setStatus("done");
      } else {
        setErrorMsg(json?.error?.detail || json?.error?.title || "Check failed");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const scoreColor =
    result
      ? result.readiness_score >= 70 ? "text-emerald-400" :
        result.readiness_score >= 50 ? "text-sky-400" :
        result.readiness_score >= 30 ? "text-amber-400" : "text-red-400"
      : "";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 rounded-md border border-terminal-border bg-terminal-surface px-3 py-2 text-xs text-terminal-fg placeholder:text-terminal-dim/50 focus:border-terminal-ring focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-terminal-border px-4 py-2 text-xs font-semibold",
            "bg-terminal-fg text-terminal-bg hover:bg-terminal-muted transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          Check
        </button>
      </form>

      {status === "error" && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Score header */}
          <div className="flex items-center gap-4 rounded-lg border border-terminal-border bg-terminal-surface p-4">
            <div className="text-center">
              <div className={cn("text-3xl font-mono font-bold tabular-nums", scoreColor)}>
                {result.readiness_score}
              </div>
              <div className={cn("text-xs font-mono font-semibold", scoreColor)}>
                {result.grade}
              </div>
            </div>
            <div className="text-xs text-terminal-dim leading-relaxed">
              <span className="text-terminal-fg font-medium">Readiness Score</span>
              <br />
              {result.normalized_url}
            </div>
          </div>

          {/* Checks grid */}
          <div className="grid gap-2 sm:grid-cols-2">
            {result.checks.map((check) => (
              <div
                key={check.id}
                className={cn(
                  "flex items-start gap-2 rounded-md border p-2.5 text-xs",
                  check.status === "pass" ? "border-emerald-500/20 bg-emerald-500/5" :
                  check.status === "partial" ? "border-amber-500/20 bg-amber-500/5" :
                  check.status === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                  "border-terminal-border bg-terminal-surface"
                )}
              >
                <span className={cn(
                  "mt-0.5 font-mono text-[10px] w-6 shrink-0",
                  check.status === "pass" ? "text-emerald-400" :
                  check.status === "partial" ? "text-amber-400" :
                  check.status === "warning" ? "text-amber-400" : "text-terminal-dim"
                )}>
                  {check.score > 0 ? `+${check.score}` : check.status === "warning" ? "WARN" : "0"}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-terminal-fg">{check.label}</div>
                  <div className="text-[10px] text-terminal-dim leading-relaxed">
                    {check.summary}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Missing */}
          {result.missing_items.length > 0 && (
            <div className="rounded-lg border border-terminal-border bg-terminal-surface p-4">
              <h3 className="mb-2 text-xs font-semibold text-terminal-fg">
                Missing or Incomplete
              </h3>
              <ul className="space-y-1">
                {result.missing_items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[10px] text-terminal-dim">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-terminal-dim" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-lg border border-terminal-border bg-terminal-surface p-4">
            <h3 className="mb-2 text-xs font-semibold text-terminal-fg">
              Recommended Next Steps
            </h3>
            <ul className="space-y-1.5">
              {result.recommendations.map((rec) => (
                <li key={rec} className="flex items-start gap-2 text-[10px] text-terminal-dim">
                  <span className="mt-0.5 text-terminal-muted">&rarr;</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="rounded-lg border border-terminal-border bg-terminal-surface p-4 text-center">
            <p className="mb-2 text-xs text-terminal-dim">
              Create a free structured AI project profile on 123Charts.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-border px-4 py-1.5 text-[10px] font-semibold text-terminal-fg hover:bg-terminal-elevated transition-colors"
            >
              Submit Project
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-terminal-dim/60 text-center leading-relaxed">
            This check does not guarantee search ranking, traffic, indexing, or AI citations. Results are heuristic and based on publicly accessible HTML signals only.
          </p>
        </div>
      )}
    </div>
  );
}
