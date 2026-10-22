import {
  ConsolePageHeader,
  DiscoveryShell,
  EvidencePanel,
  EvidenceStat,
} from "@/components/public-ui";
import SubmitForm from "@/components/submit-form";
import { noIndex, siteDescription, siteTitle } from "@/lib/seo";
import { FileText, Search, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: siteTitle("Submit a Project"),
  description: siteDescription(
    "Submit a free AI project profile to 123Charts for editorial review."
  ),
  ...noIndex(),
};

const BENEFITS = [
  {
    icon: FileText,
    title: "Public project profile",
    description:
      "Eligible submissions may become public profiles after editorial review.",
  },
  {
    icon: Search,
    title: "Reviewed public signals",
    description:
      "Use public source links so reviewers can verify the project surface.",
  },
  {
    icon: ShieldCheck,
    title: "Founder correction path",
    description:
      "Founders can request corrections after a claim review is completed.",
  },
];

export default function SubmitPage() {
  return (
    <DiscoveryShell className="space-y-8">
      <ConsolePageHeader
        eyebrow="Submit for review"
        title="Submit a Project"
        description="Share public project information for editorial review. Submission does not guarantee publication, placement, or search treatment."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/founding-slots"
              className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-sky-300 hover:text-slate-950"
            >
              Founder FAQ
            </Link>
            <Link
              href="/methodology"
              className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-sky-300 hover:text-slate-950"
            >
              Review policy
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <EvidenceStat
          label="Submission"
          value="Review"
          detail="Human approval required"
        />
        <EvidenceStat
          label="Public fields"
          value="Source links"
          detail="Official website, docs, launch URL"
        />
        <EvidenceStat
          label="Indexing"
          value="Not automatic"
          detail="Only approved public profiles"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="grid gap-4 self-start">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <EvidencePanel
                key={benefit.title}
                title={benefit.title}
                icon={<Icon className="h-4 w-4 text-slate-500" />}
              >
                <p className="text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>
              </EvidencePanel>
            );
          })}
        </aside>

        <EvidencePanel title="Project submission form">
          <SubmitForm />
        </EvidencePanel>
      </div>
    </DiscoveryShell>
  );
}
