"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FormState {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
}

interface ClaimFormProps {
  projectSlug: string;
  projectName: string;
}

const CLAIM_METHODS = [
  { value: "domain_email", label: "Domain Email" },
  { value: "dns_txt", label: "DNS TXT Record" },
  { value: "github_repo", label: "GitHub Repository" },
  { value: "website_meta_tag", label: "Website Meta Tag" },
  { value: "manual", label: "Manual Review" },
];

export default function ClaimForm({
  projectSlug,
  projectName,
}: ClaimFormProps) {
  const [form, setForm] = useState<FormState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForm({ status: "submitting", message: "" });

    const formData = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      project_slug: projectSlug,
    };
    formData.forEach((value, key) => {
      const v = value.toString().trim();
      if (v) body[key] = v;
    });

    try {
      const res = await fetch("/api/project-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        setForm({
          status: "success",
          message:
            "Claim submitted for review. The editorial team will verify your claim and follow up.",
        });
        e.currentTarget.reset();
      } else {
        const detail = json?.error?.detail ?? "Claim submission failed.";
        setForm({ status: "error", message: detail });
      }
    } catch {
      setForm({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="project_slug" value={projectSlug} />

      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-terminal-muted" />
          <span className="text-xs font-semibold uppercase tracking-wider text-terminal-muted">
            Claim {projectName}
          </span>
        </div>

        <Field
          name="claimant_name"
          label="Your Name"
          required
          placeholder="Jane Founder"
        />
        <Field
          name="claimant_email"
          label="Email"
          type="email"
          required
          placeholder="jane@example.com"
        />
        <Field
          name="claimant_role"
          label="Your Role"
          placeholder="Founder, Maintainer, etc."
        />

        <div>
          <label
            htmlFor="field-claim_method"
            className="block mb-1.5 text-xs font-medium text-terminal-muted"
          >
            Verification Method<span className="ml-0.5 text-terminal-dim">*</span>
          </label>
          <select
            id="field-claim_method"
            name="claim_method"
            required
            className="w-full rounded-md border border-terminal-border bg-terminal-bg px-3 py-2 text-xs text-terminal-fg focus:border-terminal-ring focus:outline-none"
          >
            <option value="">Select a method...</option>
            {CLAIM_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          name="proof_url"
          label="Proof URL"
          type="url"
          placeholder="https://github.com/your-org/repo/blob/main/.well-known/123charts-claim"
        />
        <Field
          name="proof_note"
          label="Additional Notes"
          maxLength={1000}
          placeholder="Any additional information to verify your claim."
          textarea
          inputClassName="h-20"
        />
      </div>

      {/* Honeypot fields — hidden from users, filled by bots */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
        <input type="text" name="contact_company" tabIndex={-1} autoComplete="off" />
        <input type="text" name="website_confirm" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col items-start gap-3">
        <button
          type="submit"
          disabled={form.status === "submitting"}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-terminal-border px-6 py-2.5 text-sm font-semibold",
            "bg-terminal-fg text-terminal-bg hover:bg-terminal-muted transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {form.status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Submit Claim
            </>
          )}
        </button>

        {form.status === "success" && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="text-emerald-400">{form.message}</span>
          </div>
        )}

        {form.status === "error" && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
            <span className="text-red-400">{form.message}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-terminal-dim leading-relaxed">
        Claims are reviewed by the 123Charts editorial team. No ranking guarantees.
        No link placement promises. Verification is for public signal accuracy only.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  type,
  placeholder,
  maxLength,
  textarea,
  inputClassName,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  textarea?: boolean;
  inputClassName?: string;
}) {
  const inputId = `field-${name}`;
  const baseClass = cn(
    "w-full rounded-md border border-terminal-border bg-terminal-bg px-3 py-2 text-xs text-terminal-fg",
    "placeholder:text-terminal-dim/50 focus:border-terminal-ring focus:outline-none",
    inputClassName
  );

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block mb-1.5 text-xs font-medium text-terminal-muted"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-terminal-dim">*</span>
        )}
      </label>
      {textarea ? (
        <textarea
          id={inputId}
          name={name}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={baseClass}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type ?? "text"}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={baseClass}
        />
      )}
    </div>
  );
}
