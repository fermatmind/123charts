import { FounderValueCard } from "@/components/founder-value-card";
import { webPageJSONLD } from "@/lib/structured-data";
import { siteTitle, siteDescription } from "@/lib/seo";
import Link from "next/link";
import {
  FileText,
  Shield,
  Edit3,
  TrendingUp,
  Award,
  Ban,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("For Founders"),
  description: siteDescription(
    "Why founders should create a free AI project profile on 123Charts. Clean structured public profiles, source confidence improvement, and verified signal tracking."
  ),
  robots: { index: true, follow: true },
};

const VALUES = [
  {
    icon: FileText,
    title: "Create a Clean, Structured Public Profile",
    description:
      "A free AI project profile on 123Charts gives your project a structured public page. The profile includes your project name, description, category, public sources, and growth signal indicators in one consistent format for potential users and collaborators.",
  },
  {
    icon: Shield,
    title: "Improve Source Confidence",
    description:
      "By claiming your project and connecting verified public sources such as an official website, GitHub repository, or documentation, you improve the source confidence level of your public profile. Higher source confidence means more reliable signal data and clearer representation in the index.",
  },
  {
    icon: Edit3,
    title: "Add Public Project Details",
    description:
      "Claimed projects can maintain up-to-date public information including product description, category classification, public links, and growth milestones. This ensures your project is accurately represented in the 123Charts index and discovered through relevant category and collection pages.",
  },
  {
    icon: TrendingUp,
    title: "Become Tracked by 123Charts",
    description:
      "A claimed project can move from a basic listing into a more complete public signal profile. Tracked by 123Charts means the profile is organized around reviewed public sources, lifecycle state, and visible growth-signal dimensions.",
  },
  {
    icon: Award,
    title: "Optional Genesis Badge",
    description:
      "Verified projects may become eligible for the Genesis Badge, an optional informational signal display for early projects with reviewed public growth signals. Founder Claimed status is one input, but the badge is not an endorsement or commercial certification.",
  },
  {
    icon: Ban,
    title: "What We Do Not Promise",
    description:
      "123Charts does not promise external outcomes from listing, claiming, or badge display. The index is a public discovery tool based on reviewed growth signals. Project profiles and badges are informational.",
  },
];

export default function FoundersPage() {
  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/founders`;

  const webPageLD = webPageJSONLD(
    pageUrl,
    "For Founders",
    "Why founders should create a free AI project profile on 123Charts."
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLD) }}
      />

      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
          <FileText className="h-5 w-5 text-terminal-muted" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-terminal-fg">
          For Founders
        </h1>
        <p className="text-sm text-terminal-dim leading-relaxed max-w-lg mx-auto">
          Why claim your AI project on 123Charts, how public signal profiles work,
          and what optional badge display does and does not mean.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {VALUES.map((value) => (
          <FounderValueCard
            key={value.title}
            icon={value.icon}
            title={value.title}
            description={value.description}
          />
        ))}
      </div>

      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
        <h2 className="mb-3 text-sm font-semibold text-terminal-fg">
          How to Get Started
        </h2>
        <div className="space-y-3 text-xs text-terminal-dim leading-relaxed">
          <p>
            The founder claim system is under development. When active, project
            founders will be able to:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-1">
            <li>Locate their project on 123Charts (if already indexed)</li>
            <li>
              Submit a new project for editorial review (if not yet indexed)
            </li>
            <li>
              Claim an existing project profile through domain email, DNS
              TXT, GitHub repository verification, or manual review
            </li>
            <li>
              Update public project information after claim verification
            </li>
            <li>
              Track public growth signals and Signal Score changes over time
            </li>
          </ol>
          <p>
            All claims are subject to editorial review. Claiming a project is
            free. There are no paid placement options, no sponsored ordering,
            and no commercial obligations.
          </p>
          <p>
            Founders can also review the{" "}
            <Link
              href="/founding-slots"
              className="text-terminal-muted underline underline-offset-4 hover:text-terminal-fg"
            >
              submission FAQ and correction workflow
            </Link>{" "}
            before sending a project or claim request.
          </p>
        </div>
      </div>
    </div>
  );
}
