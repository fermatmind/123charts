import { NextResponse } from "next/server";
import {
  isChangelogPublicationSideEffectBlocked,
  isChangelogReviewAction,
  nextChangelogStatus,
} from "@/lib/changelog/engine";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: unknown;
  };

  if (!isChangelogReviewAction(body.action)) {
    return NextResponse.json(
      {
        error: "invalid_changelog_action",
        detail: "Changelog entries support draft review actions only.",
      },
      { status: 400 }
    );
  }

  if (isChangelogPublicationSideEffectBlocked(body.action)) {
    return NextResponse.json(
      {
        error: "changelog_publication_blocked",
        detail: "PR53 does not publish changelog entries or mutate scores.",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    id: params.id,
    status: nextChangelogStatus(body.action),
    public_visible: false,
    affects_signal_score: false,
    affects_source_confidence: false,
  });
}
