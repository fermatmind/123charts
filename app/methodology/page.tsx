import {
  ConsolePageHeader,
  DiscoveryShell,
  EvidencePanel,
  EvidenceStat,
  ProjectSignalPill,
} from "@/components/public-ui";
import { siteDescription, siteTitle } from "@/lib/seo";
import {
  CheckCircle2,
  Link as LinkIcon,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Methodology"),
  description: siteDescription(
    "How 123Charts builds public project pages from reviewed projections, official source links, and timestamped public signals."
  ),
};

const PRINCIPLES = [
  {
    title: "Reviewed public projection",
    body: "Public pages render from the reviewed published projection layer only.",
    icon: ShieldCheck,
  },
  {
    title: "Official source links",
    body: "Project pages keep official website, docs, and public repository links visible for verification.",
    icon: LinkIcon,
  },
  {
    title: "Timestamped review",
    body: "Cards and detail pages show when the public projection was last reviewed.",
    icon: TimerReset,
  },
  {
    title: "Finite navigation",
    body: "Collections use explicit inclusion criteria and avoid broad generated query pages.",
    icon: CheckCircle2,
  },
];

export default function MethodologyPage() {
  return (
    <DiscoveryShell className="space-y-8">
      <ConsolePageHeader
        eyebrow="Public methodology"
        title="How 123Charts builds public pages"
        description="123Charts is a reviewed public signal directory. The interface is built to make source checking fast while keeping non-public workspace material out of the public product."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <EvidenceStat
          label="Public source"
          value="Reviewed"
          detail="Published projection only"
        />
        <EvidenceStat
          label="Navigation"
          value="Finite"
          detail="Collections over broad facets"
        />
        <EvidenceStat
          label="Ordering"
          value="Neutral"
          detail="No ranking or paid boost"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon;

          return (
            <EvidencePanel
              key={principle.title}
              title={principle.title}
              icon={<Icon className="h-4 w-4 text-slate-500" />}
            >
              <p className="text-sm leading-6 text-slate-600">
                {principle.body}
              </p>
            </EvidencePanel>
          );
        })}
      </div>

      <EvidencePanel title="Public data boundary">
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            "Project name",
            "Summary",
            "Category",
            "Official links",
            "Signal chips",
            "Review timestamp",
          ].map((label) => (
            <ProjectSignalPill key={label} label={label} tone="slate" />
          ))}
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Public UI shows project name, summary, category, public model, signal
          chips, official links, collection membership, lifecycle display, and
          review timestamps. Non-public workspace material is excluded from the
          product surface.
        </p>
      </EvidencePanel>

      <EvidencePanel title="Indexing boundary">
        <p className="text-sm leading-6 text-slate-600">
          Sitemaps include eligible published projections and published
          collections only. Search and listing pages paginate results instead
          of generating broad query landing pages.
        </p>
      </EvidencePanel>
    </DiscoveryShell>
  );
}
