export const SUBMISSION_CHANNELS_REPORT_SLUG =
  "ai-project-submission-channels-2026";
export const SUBMISSION_CHANNELS_REPORT_PATH = `/reports/${SUBMISSION_CHANNELS_REPORT_SLUG}`;
export const SUBMISSION_CHANNELS_REPORT_TITLE =
  "AI Project Submission Channels for Founders";
export const SUBMISSION_CHANNELS_REPORT_SUBTITLE =
  "A restrained field guide to reviewed launch surfaces, founder-owned materials, and 123Charts profile flows.";

export interface SubmissionChannel {
  name: string;
  category: string;
  useCase: string;
  readinessSignals: string[];
  boundary: string;
}

export interface SubmissionChannelStep {
  title: string;
  body: string;
  href?: string;
}

export const submissionChannels: SubmissionChannel[] = [
  {
    name: "Founder-owned launch page",
    category: "Owned surface",
    useCase:
      "Maintain one canonical page that explains the product, audience, docs, pricing status, and public source links.",
    readinessSignals: [
      "Clear product name",
      "Canonical URL",
      "Public docs or repository",
      "Structured metadata",
    ],
    boundary:
      "Owned pages should be factual. Avoid claims that depend on unverified adoption or external placement.",
  },
  {
    name: "Official repository or documentation",
    category: "Technical surface",
    useCase:
      "Use official docs, changelogs, examples, and repository metadata to help technical evaluators understand the project.",
    readinessSignals: [
      "README clarity",
      "Release notes",
      "Install path",
      "License visibility",
    ],
    boundary:
      "Development signals are useful context, not proof of commercial traction or future outcomes.",
  },
  {
    name: "Curated founder submission forms",
    category: "Reviewed surface",
    useCase:
      "Submit to editorially reviewed lists or databases when the channel has clear inclusion criteria and update controls.",
    readinessSignals: [
      "Review policy",
      "Correction path",
      "Source attribution",
      "No paid placement dependency",
    ],
    boundary:
      "A reviewed listing should not be treated as distribution certainty. Keep the submitted facts auditable.",
  },
  {
    name: "Community announcement threads",
    category: "Community surface",
    useCase:
      "Announce meaningful launches, changelogs, or open calls in communities where the audience is already relevant.",
    readinessSignals: [
      "Specific release note",
      "Useful demo",
      "Open feedback request",
      "Maintainer contact path",
    ],
    boundary:
      "Avoid generic repetition. Community posts should add context rather than repeat the same pitch.",
  },
  {
    name: "123Charts project profile flow",
    category: "123Charts surface",
    useCase:
      "Use 123Charts to submit a project, check machine-readable basics, and later claim a reviewed public profile.",
    readinessSignals: [
      "Project submission",
      "AI Search Readiness Checker",
      "Public source links",
      "Founder claim path",
    ],
    boundary:
      "123Charts review is editorial and signal-based. It does not promise external placement or business results.",
  },
];

export const submissionChannelSteps: SubmissionChannelStep[] = [
  {
    title: "Prepare a canonical project page",
    body:
      "Write one stable public page with product scope, target user, docs, source links, and founder-controlled update paths.",
  },
  {
    title: "Check machine-readable basics",
    body:
      "Run a deterministic audit for title, description, canonical, schema, Open Graph, robots, and sitemap signals.",
    href: "/geo-checker",
  },
  {
    title: "Submit to 123Charts review",
    body:
      "Send a structured project submission for admin review. Submitted projects do not publish automatically.",
    href: "/submit",
  },
  {
    title: "Claim or correct a profile",
    body:
      "If a reviewed profile exists, founders can request claim, correction, or removal review from the public profile flow.",
    href: "/projects",
  },
];

export const submissionChannelsMethodology = [
  "Channels are grouped by surface type rather than promotional value.",
  "The page favors channels with clear review, source, and correction boundaries.",
  "No third-party directory content, screenshots, logos, or descriptions are copied.",
  "No automated posting workflow, public API exposure, payment path, or external service integration is introduced.",
];
