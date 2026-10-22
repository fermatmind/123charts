import { SubmissionOnboardingFaq } from "@/components/founder/submission-onboarding-faq";
import { siteDescription, siteTitle } from "@/lib/seo";
import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: siteTitle("Founder Submission Onboarding"),
  description: siteDescription(
    "Founder-ready onboarding for submitting, claiming, correcting, and removing 123Charts AI project profiles through reviewed public-source workflows."
  ),
  robots: { index: true, follow: true },
};

export default function FoundingSlotsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10 border-b border-terminal-border pb-8">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Founder Onboarding
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-4xl">
          Founder-Ready Submission FAQ
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-terminal-dim">
          A practical onboarding surface for founders preparing public-source
          submissions, reviewed profile claims, corrections, and removal
          requests on 123Charts.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-widest text-terminal-dim">
          <span>Mode: public-source review</span>
          <span>Boundary: no automatic publication</span>
          <span>Scope: submit, claim, correct, remove</span>
        </div>
      </header>

      <SubmissionOnboardingFaq />
    </div>
  );
}
