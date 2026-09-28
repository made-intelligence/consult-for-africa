import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canManageTeam } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import { sendCadreEmail } from "@/lib/cadreEmail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Inviting a colleague onto an employer account.
 *
 * A hospital could previously hold exactly one login, because the facility link
 * carried a unique constraint on the account row. The practical result was one
 * shared password between an HR manager and a medical director.
 *
 * An invited seat is created with an unusable password hash and a reset token:
 * they set their own password from the link, so no plaintext ever travels.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canManageTeam(ctx)) {
    return NextResponse.json(
      { error: "Only an owner can invite colleagues." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim().slice(0, 120) : "";
  const contactEmail =
    typeof body.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
  const role = ["OWNER", "RECRUITER", "VIEWER"].includes(body.role)
    ? (body.role as "OWNER" | "RECRUITER" | "VIEWER")
    : "RECRUITER";

  if (!contactName || !contactEmail) {
    return NextResponse.json(
      { error: "A name and a work email are required." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
  }

  const existing = await prisma.cadreEmployerAccount.findUnique({
    where: { contactEmail },
    select: { id: true, orgId: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.orgId === ctx.org.id
            ? "They are already on your team."
            : "That email already has a CadreHealth employer account.",
      },
      { status: 409 },
    );
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.cadreEmployerAccount.create({
    data: {
      orgId: ctx.org.id,
      role,
      companyName: ctx.org.name,
      contactName,
      contactEmail,
      // Not a usable password: a random secret nobody holds. The seat becomes
      // usable only by way of the reset link below.
      passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
      isVerified: ctx.org.isVerified,
      invitedById: ctx.accountId,
      invitedAt: new Date(),
      passwordResetToken: token,
      passwordResetExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const setupLink = `${
    process.env.NEXTAUTH_URL ?? "https://oncadre.com"
  }/oncadre/employer/reset-password/${token}`;

  try {
    await sendCadreEmail({
      to: contactEmail,
      subject: `${ctx.contactName} has added you to ${ctx.org.name} on CadreHealth`,
      heading: "You have been added to the team",
      body: `Hi ${contactName}, ${ctx.contactName} has given you access to the ${ctx.org.name} hiring account on CadreHealth. Choose a password to get in. This link is good for seven days.`,
      ctaText: "Set your password",
      ctaHref: setupLink,
    });
  } catch (err) {
    console.error("[employer team invite] email send failed:", err);
  }

  // Returned so an owner can pass it on by hand when email does not arrive,
  // which on this platform it sometimes does not.
  return NextResponse.json({ ok: true, setupLink });
});
