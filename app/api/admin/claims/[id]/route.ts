import { NextRequest } from "next/server";
import { checkAdminGuard } from "@/lib/auth/admin";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { success, errorResponse } from "@/lib/api/response";
import { badRequest, unauthorized, forbidden, notFound, methodNotAllowed } from "@/lib/api/problem";
import { adminReviewActionSchema } from "@/lib/validation/admin-review";
import { getClaimById, getPendingClaims } from "@/lib/admin/review-queries";
import { approveClaim, rejectClaim, needsInfoClaim } from "@/lib/admin/review-actions";

async function requireAdmin(requestId: string, instance: string) {
  const guard = await checkAdminGuard();
  if (!guard.isAuthenticated) {
    return {
      error: errorResponse(unauthorized("Authentication required.", instance, requestId), requestId),
      guard: null,
    };
  }
  if (!guard.isAdmin) {
    return {
      error: errorResponse(forbidden("Admin privileges required.", instance, requestId), requestId),
      guard: null,
    };
  }
  return { error: null, guard };
}

export async function GET() {
  const requestId = getOrCreateRequestId();
  const { error } = await requireAdmin(requestId, "/api/admin/claims");
  if (error) return error;

  const list = await getPendingClaims();
  return success(list, requestId);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const instance = `/api/admin/claims/${params.id}`;

  const { error, guard } = await requireAdmin(requestId, instance);
  if (error) return error;

  const claim = await getClaimById(params.id);
  if (!claim) {
    return errorResponse(notFound("Claim not found.", instance, requestId), requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(badRequest("Request body must be valid JSON.", instance, undefined, requestId), requestId);
  }

  const parsed = adminReviewActionSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return errorResponse(badRequest("Validation failed.", instance, fieldErrors, requestId), requestId);
  }

  const { action } = parsed.data;
  const reviewer = guard!.userId ?? "unknown";

  if (action === "publish") {
    return errorResponse(badRequest("Publish is not a valid action for claims.", instance, undefined, requestId), requestId);
  }

  let result;
  if (action === "approve") result = await approveClaim(params.id, reviewer, requestId);
  else if (action === "reject") result = await rejectClaim(params.id, reviewer, requestId);
  else result = await needsInfoClaim(params.id, reviewer, requestId);

  if (!result.success) {
    return errorResponse(badRequest(result.error ?? "Action failed.", instance, undefined, requestId), requestId);
  }

  return success({ message: `Claim ${action}d.` }, requestId);
}

export async function PUT() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("PUT is not supported. Use PATCH.", "/api/admin/claims", requestId), requestId);
}

export async function DELETE() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("DELETE is not supported.", "/api/admin/claims", requestId), requestId);
}
