import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const onboardingSteps = [
  {
    title: "Prepare public source material",
    body:
      "Use a canonical website, repository, documentation page, pricing page, or launch note that a reviewer can open without private access.",
  },
  {
    title: "Submit structured facts",
    body:
      "Project name, category, one-line summary, public URLs, and founder contact details help the editorial team review the profile without private artifacts.",
  },
  {
    title: "Wait for review",
    body:
      "A submission creates a review record. It does not publish automatically, does not create a public profile immediately, and does not change sitemap coverage.",
  },
  {
    title: "Claim, correct, or remove",
    body:
      "After a reviewed profile exists, founders can request ownership review, factual corrections, or removal review through the claim workflow.",
  },
];

const faqItems = [
  {
    question: "What should a founder prepare before submitting?",
    answer:
      "Prepare a stable public project page, a short description, category fit, public repository or documentation links when available, and a contact path for review follow-up.",
  },
  {
    question: "What information should stay out of the form?",
    answer:
      "Do not send private analytics, payment screenshots, API keys, customer lists, identity documents, bank data, investor files, or private credentials.",
  },
  {
    question: "When does a submission become public?",
    answer:
      "Only after admin review and publication. Submitted and pending-review records remain outside public indexing and outside the public sitemap.",
  },
  {
    question: "How do corrections work?",
    answer:
      "Founders can use the claim flow to request factual corrections, owner verification, or removal review. The request is reviewed before public profile changes are made.",
  },
  {
    question: "What does 123Charts review?",
    answer:
      "123Charts reviews public source clarity, category fit, machine-readable basics, lifecycle state, and whether submitted facts can be checked from public sources.",
  },
];

const boundaries = [
  "Submissions are reviewed before publication.",
  "Public profiles rely on public sources only.",
  "Correction and removal requests stay in review until accepted.",
  "123Charts does not promise visibility outcomes, placement, or commercial results.",
];

export function SubmissionOnboardingFaq() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-terminal-muted" />
          <h2 className="text-sm font-semibold text-terminal-fg">
            Founder Submission Sequence
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {onboardingSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-md border border-terminal-border bg-terminal-surface p-4"
            >
              <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
                Step {index + 1}
              </div>
              <h3 className="text-xs font-semibold text-terminal-fg">
                {step.title}
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-terminal-dim">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-terminal-muted" />
          <h2 className="text-sm font-semibold text-terminal-fg">
            Submission FAQ
          </h2>
        </div>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-md border border-terminal-border bg-terminal-surface p-4"
            >
              <h3 className="text-xs font-semibold text-terminal-fg">
                {item.question}
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-terminal-dim">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-terminal-muted" />
          <h2 className="text-sm font-semibold text-terminal-fg">
            Reviewed Publication Boundary
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {boundaries.map((boundary) => (
            <div
              key={boundary}
              className="rounded-md border border-terminal-border bg-terminal-surface p-4"
            >
              <p className="text-[11px] leading-relaxed text-terminal-dim">
                {boundary}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-terminal-border bg-terminal-elevated p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-terminal-muted" />
          <h2 className="text-sm font-semibold text-terminal-fg">
            Founder Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/submit"
            className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            Submit a Project
          </Link>
          <Link
            href="/geo-checker"
            className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            Check Readiness
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            View Public Profiles
          </Link>
        </div>
      </section>
    </div>
  );
}
