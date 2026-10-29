import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { sendCadreEmail } from "@/lib/cadreEmail";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

/**
 * POST /api/admin/cadre-employers/[id]/verify
 *
 * Verification is what releases a professional's contact details to a hospital,
 * so it is an explicit act by a named person rather than a flag. The id is the
 * org's, not an individual account's: a hospital is verified once and every seat
 * on it inherits that.
 *
 * Body: { verified: boolean, note?: string }
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

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const verified = !!body.verified;
  const note = typeof body.note === "string" ? body.note.trim() || null : null;

  // Withdrawing verification takes contact access away from a hospital that may
  // be mid-hire, so it has to be explained. Granting it does not.
  if (!verified && !note) {
    return NextResponse.json(
      { error: "Give a reason when withdrawing verification." },
      { status: 400 },
    );
  }

  const org = await prisma.cadreEmployerOrg.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isVerified: true,
      members: { select: { id: true, contactName: true, contactEmail: true, role: true } },
    },
  });
  if (!org) return NextResponse.json({ error: "Employer not found" }, { status: 404 });

  if (org.isVerified === verified) {
    return NextResponse.json({
      ok: true,
      unchanged: true,
      isVerified: org.isVerified,
    });
  }

  await prisma.$transaction([
    prisma.cadreEmployerOrg.update({
      where: { id: org.id },
      data: {
        isVerified: verified,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? session.user.id : null,
        verifiedNote: note,
      },
    }),
    // The mirror on each seat exists so older reads do not silently see an
    // unverified employer. The org remains the authority.
    prisma.cadreEmployerAccount.updateMany({
      where: { orgId: org.id },
      data: { isVerified: verified },
    }),
  ]);

  // Told only on the way in. Withdrawing verification is a conversation someone
  // should have, not an email that arrives unannounced.
  let emailSent = false;
  if (verified) {
    const owner = org.members.find((m) => m.role === "OWNER") ?? org.members[0];
    if (owner) {
      try {
        await sendCadreEmail({
          to: owner.contactEmail,
          subject: `${org.name} is verified on CadreHealth`,
          heading: "You are verified",
          body: `Hi ${owner.contactName}, we have verified ${org.name}. You can now approach professionals directly and your roles carry a verified badge on the job board. Professionals still choose whether to share their contact details with you, and we pass on their answer either way.`,
          ctaText: "Go to your dashboard",
          ctaHref: `${process.env.NEXTAUTH_URL ?? "https://oncadre.com"}/oncadre/employer/dashboard`,
        });
        emailSent = true;
      } catch (err) {
        console.error("[admin employer verify] email send failed:", err);
      }
    }
  }

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "CadreEmployerOrg",
    entityId: org.id,
    entityName: org.name,
    details: { verified, note, emailSent },
  });

  return NextResponse.json({ ok: true, isVerified: verified, emailSent });
});
