/**
 * PATCH /api/admin/cadrehealth/credentials/[id]
 *
 * The reviewer's verdict on one credential after checking it against the
 * regulator's register. Body: { status: "VERIFIED" | "FAILED" | "PENDING" }.
 *
 * Until this existed no credential had ever been verified: the member saw
 * "pending" forever and had no way to tell whether they still owed something.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
const SETTABLE = ["VERIFIED", "FAILED", "PENDING"] as const;
type Settable = (typeof SETTABLE)[number];

export const PATCH = handler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status as Settable | undefined;
  if (!status || !SETTABLE.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.cadreCredential.findUnique({
    where: { id },
    include: { professional: { select: { firstName: true, lastName: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (status === "VERIFIED" && !existing.licenseNumber) {
    return NextResponse.json({ error: "A credential without a number cannot be verified" }, { status: 400 });
  }

  const updated = await prisma.cadreCredential.update({
    where: { id },
    data: {
      verificationStatus: status,
      verifiedAt: status === "PENDING" ? null : new Date(),
      verifiedBy: status === "PENDING" ? null : session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "STATUS_CHANGE",
    entityType: "CadreCredential",
    entityId: id,
    entityName: `${existing.professional.firstName} ${existing.professional.lastName} ${existing.type} ${existing.licenseNumber ?? ""} -> ${status}`,
    details: { from: existing.verificationStatus, to: status },
  });

  return NextResponse.json(updated);
});
