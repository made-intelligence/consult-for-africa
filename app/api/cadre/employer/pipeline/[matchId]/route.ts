import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import { isMatchStage } from "@/lib/cadreHealth/matchStages";

/**
 * Moving one candidate along, or writing a note about them.
 *
 * The stage values come from lib/cadreHealth/matchStages.ts rather than a
 * literal array kept here. The previous version of this allow-list had drifted
 * out of step with the apply route, which wrote a status it did not contain.
 */
export const PATCH = handler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canWrite(ctx)) {
    return NextResponse.json({ error: "Your access is read only." }, { status: 403 });
  }

  const { matchId } = await params;

  // Ownership is checked through the role's org, so a match id from another
  // hospital's pipeline is a 404 rather than an edit.
  const match = await prisma.cadreMandateMatch.findFirst({
    where: { id: matchId, mandate: { employerOrgId: ctx.org.id } },
    select: { id: true, status: true, source: true },
  });
  if (!match) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!isMatchStage(body.status)) {
      return NextResponse.json({ error: "Unknown stage" }, { status: 400 });
    }
    data.status = body.status;
    // First move off NEW is the moment someone actually looked, which is what
    // the overdue count on the dashboard is measuring.
    if (match.status === "NEW" && body.status !== "NEW") {
      data.contactedAt = new Date();
    }
  }

  if (body.notes !== undefined) {
    data.notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim().slice(0, 2000)
        : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  const updated = await prisma.cadreMandateMatch.update({
    where: { id: matchId },
    data,
    select: { id: true, status: true, notes: true },
  });

  return NextResponse.json({ ok: true, ...updated });
});
