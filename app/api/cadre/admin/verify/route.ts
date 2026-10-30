import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";

// Verified means "licence checked against the regulator", so only staff who can
// make that assertion may set it, and every change is audited.
const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

export const POST = handler(async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { professionalId } = await req.json();

    if (!professionalId) {
      return NextResponse.json({ error: "Professional ID required" }, { status: 400 });
    }

    const professional = await prisma.cadreProfessional.update({
      where: { id: professionalId },
      data: { accountStatus: "VERIFIED" },
    });

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "CadreProfessional",
      entityId: professional.id,
      entityName: `${professional.firstName} ${professional.lastName} -> VERIFIED`,
    });

    return NextResponse.json({
      id: professional.id,
      accountStatus: professional.accountStatus,
    });
  } catch (error) {
    console.error("Error verifying professional:", error);
    return NextResponse.json({ error: "Failed to verify professional" }, { status: 500 });
  }
});
