import { NextRequest } from "next/server";
import { checkAdminGuard } from "@/lib/auth/admin";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { success, errorResponse } from "@/lib/api/response";
import { badRequest, forbidden, methodNotAllowed, notFound, unauthorized } from "@/lib/api/problem";
import {
  isEditorialDraftAction,
  isPublicationSideEffectBlocked,
} from "@/lib/editorial/draft-pipeline";
import {
  getEditorialDraftById,
  reviewEditorialDraft,
} from "@/lib/admin/editorial-draft-queries";
import { insertAuditEvent } from "@/lib/admin/review-queries";

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

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const instance = `/api/admin/editorial-drafts/${params.id}`;
  const { error, guard } = await requireAdmin(requestId, instance);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(badRequest("Request body must be valid JSON.", instance, undefined, requestId), requestId);
  }

  const action = typeof body === "object" && body ? (body as { action?: unknown }).action : undefined;
  if (typeof action !== "string") {
    return errorResponse(badRequest("Action is required.", instance, undefined, requestId), requestId);
  }
  if (isPublicationSideEffectBlocked(action)) {
    return errorResponse(badRequest("Editorial draft review cannot publish or index a project.", instance, undefined, requestId), requestId);
  }
  if (!isEditorialDraftAction(action)) {
    return errorResponse(badRequest("Unsupported editorial draft action.", instance, undefined, requestId), requestId);
  }

  const draft = await getEditorialDraftById(params.id);
  if (!draft) {
    return errorResponse(notFound("Editorial draft not found.", instance, requestId), requestId);
  }

  const reviewerNote =
    typeof body === "object" && body && typeof (body as { reviewer_note?: unknown }).reviewer_note === "string"
      ? (body as { reviewer_note: string }).reviewer_note.slice(0, 2000)
      : undefined;

  const ok = await reviewEditorialDraft(params.id, action, guard!.userId ?? "unknown", reviewerNote);
  if (!ok) {
    return errorResponse(badRequest("Editorial draft action failed.", instance, undefined, requestId), requestId);
  }

  await insertAuditEvent(
    `editorial_draft_${action}`,
    "admin_editorial_review",
    { editorial_draft_id: params.id, project_id: draft.project_id, reviewer: guard!.userId ?? "unknown" },
    requestId
  );

  return success({ message: `Editorial draft ${action} recorded. No publication side effect was executed.` }, requestId);
}

export async function GET() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("GET is not supported. Use the admin page.", "/api/admin/editorial-drafts", requestId), requestId);
}

export async function PUT() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("PUT is not supported. Use PATCH.", "/api/admin/editorial-drafts", requestId), requestId);
}

export async function DELETE() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("DELETE is not supported.", "/api/admin/editorial-drafts", requestId), requestId);
}
