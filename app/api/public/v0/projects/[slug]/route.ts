import { getProjectBySlug } from "@/lib/demo-projects";
import { errorResponse, success } from "@/lib/api/response";
import { notFound } from "@/lib/api/problem";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { isPublicApiEnabled } from "@/lib/public-api/feature-flags";
import { publicApiDisabledProblem } from "@/lib/public-api/problem";
import { serializePublicApiProject } from "@/lib/public-api/serializer";

export async function GET(_request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const instance = `/api/public/v0/projects/${params.slug}`;

  if (!isPublicApiEnabled()) {
    return errorResponse(publicApiDisabledProblem(instance, requestId), requestId);
  }

  const project = getProjectBySlug(params.slug);
  const serialized = project ? serializePublicApiProject(project) : null;

  if (!serialized) {
    return errorResponse(
      notFound("Public API project record not found.", instance, requestId),
      requestId
    );
  }

  return success(serialized, requestId);
}
