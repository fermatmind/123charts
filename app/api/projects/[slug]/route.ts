import { getProjectBySlug, getPublishedProjects } from "@/lib/demo-projects";
import { INDEXABLE_STATES } from "@/lib/constants";
import { success, errorResponse } from "@/lib/api/response";
import { notFound, forbidden } from "@/lib/api/problem";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import type { DemoProject } from "@/lib/demo-projects";

interface ProjectApiData {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  website: string;
  status: string;
  signalScore: number;
  scores: Record<string, number>;
  sourceConfidence: string;
  verificationStatus: string;
  publicSources: string[];
}

function toPublicProject(p: DemoProject): ProjectApiData {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    website: p.website,
    status: p.status,
    signalScore: p.signalScore,
    scores: p.scores,
    sourceConfidence: p.sourceConfidence,
    verificationStatus: p.verificationStatus,
    publicSources: p.publicSources,
  };
}

export async function GET(_request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return errorResponse(
      notFound(
        `No project found with slug "${params.slug}".`,
        `/api/projects/${params.slug}`,
        requestId
      ),
      requestId
    );
  }

  if (!INDEXABLE_STATES.has(project.status)) {
    return errorResponse(
      forbidden(
        `Project "${params.slug}" is not publicly accessible.`,
        `/api/projects/${params.slug}`,
        requestId
      ),
      requestId
    );
  }

  return success(toPublicProject(project), requestId);
}
