import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { createContactRequest } from "@/lib/cadreHealth/contactRequest";

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

/**
 * POST /api/admin/cadre-employers/[id]/approach
 *
 * CFA approaching a professional on a client's behalf.
 *
 * On these mandates CFA is the recruiter, not the hospital, and the hospital
 * has no login at all. Without this the whole outbound side was unreachable:
 * raising a contact request needed an employer session, an employer session
 * needed a seat, and a seat needed an email address at the client that we have
 * no business creating. Contact email is unique per account, so one CFA person
 * could not have held seats on several client orgs anyway.
 *
 * Everything else is identical to the employer's own route, because both call
 * the same function. A staff-raised request leaves `requestedById` null, which
 * is how the two are told apart afterwards.
 *
 * Body: { professionalId, mandateId?, message }
 */
export const POST = handler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: orgId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await createContactRequest({
    orgId,
    professionalId: typeof body.professionalId === "string" ? body.professionalId : "",
    mandateId: typeof body.mandateId === "string" && body.mandateId ? body.mandateId : null,
    message: typeof body.message === "string" ? body.message : "",
    // Raised by CFA, not by a seat on the client's account.
    requestedById: null,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.code ? { code: result.code } : {}) },
      { status: result.status },
    );
  }

  const org = await prisma.cadreEmployerOrg.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  // Approaching a doctor on a client's behalf is done in CFA's name, so it is
  // recorded against the person who did it.
  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "CadreContactRequest",
    entityId: result.id,
    entityName: org?.name ?? orgId,
    details: {
      professionalId: body.professionalId,
      mandateId: body.mandateId ?? null,
      onBehalfOf: org?.name ?? orgId,
    },
  });

  return NextResponse.json({ ok: true, id: result.id, status: "PENDING" });
});
