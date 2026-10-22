import { getProjectBySlug } from "@/lib/demo-projects";
import { CLAIM_METHODS } from "@/lib/constants";
import { siteTitle, siteDescription, noIndex } from "@/lib/seo";
import { ShieldCheck } from "lucide-react";
import ClaimForm from "@/components/claim-form";
import Link from "next/link";
import type { Metadata } from "next";

interface ClaimPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ClaimPageProps): Promise<Metadata> {
  const params = await props.params;
  const project = getProjectBySlug(params.slug);
  const name = project?.name ?? params.slug;

  return {
    title: siteTitle(`Claim ${name}`),
    description: siteDescription(
      `Claim the ${name} free AI project profile on 123Charts. Verify ownership through domain email, DNS TXT, GitHub repository, or manual review.`
    ),
    ...noIndex(),
  };
}

export default async function ClaimPage(props: ClaimPageProps) {
  const params = await props.params;
  const project = getProjectBySlug(params.slug);
  const name = project?.name ?? params.slug;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
          <ShieldCheck className="h-5 w-5 text-terminal-muted" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-terminal-fg">
          Claim {name}
        </h1>
        <p className="text-sm text-terminal-dim leading-relaxed max-w-lg mx-auto">
          {project
            ? `Verify your ownership of ${project.name} to manage this free AI project profile and its public growth signals.`
            : "Verify ownership of this project to manage its free AI project profile and public growth signals."}
        </p>
        <Link
          href="/founding-slots"
          className="mt-4 inline-flex rounded-md border border-terminal-border px-3 py-2 text-xs text-terminal-muted transition-colors hover:bg-terminal-surface hover:text-terminal-fg"
        >
          Review correction and removal guidance
        </Link>
      </div>

      <div className="mb-10">
        <h2 className="mb-5 text-sm font-semibold tracking-tight text-terminal-fg">
          Verification Methods
        </h2>
        <div className="space-y-3">
          {CLAIM_METHODS.map((method, i) => (
            <div
              key={method.title}
              className="flex items-start gap-4 rounded-lg border border-terminal-border bg-terminal-surface p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-terminal-border bg-terminal-bg text-[10px] font-mono font-semibold text-terminal-dim">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-terminal-fg">
                  {method.title}
                </h3>
                <p className="mt-0.5 text-xs text-terminal-dim leading-relaxed">
                  {method.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ClaimForm projectSlug={params.slug} projectName={name} />
    </div>
  );
}
