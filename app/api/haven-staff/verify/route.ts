import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashLoginCode, signStaffJWT, STAFF_COOKIE, MAX_ATTEMPTS } from "@/lib/staffAuth";

// Takes the email and the six-digit code and, if they match, sets the session.
//
// The attempt counter is what actually protects six digits. No hash choice can
// make a million possibilities safe; killing the code after five wrong tries
// can. Every failure answers the same way, so a wrong code and an unknown email
// are indistinguishable from outside.

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(200),
  code: z.string().regex(/^\d{6}$/),
});

const CLIENT_NAME = "Haven Paediatric Centre";
const no = () => NextResponse.json({ ok: false, error: "That code is not right, or it has expired." }, { status: 400 });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return no();

  const email = parsed.data.email.trim().toLowerCase();

  const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME }, select: { id: true } });
  if (!client) return no();

  const staff = await prisma.staffMember.findFirst({
    where: { clientId: client.id, email, isActive: true },
    select: { id: true, clientId: true, name: true, tier: true },
  });
  if (!staff) return no();

  const token = await prisma.staffLoginToken.findFirst({
    where: { staffId: staff.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.expiresAt < new Date()) return no();

  if (token.tokenHash !== hashLoginCode(staff.id, parsed.data.code)) {
    const attempts = token.attempts + 1;
    await prisma.staffLoginToken.update({
      where: { id: token.id },
      // Burn the code at the cap. They ask for another one, which costs them
      // ten seconds and costs an attacker the whole attempt budget.
      data: { attempts, ...(attempts >= MAX_ATTEMPTS ? { usedAt: new Date() } : {}) },
    });
    return no();
  }

  // Burn before issuing, so a code submitted twice in parallel cannot mint two
  // sessions. If this does not claim exactly one row, somebody else just did.
  const burned = await prisma.staffLoginToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (burned.count !== 1) return no();

  await prisma.staffMember.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    STAFF_COOKIE,
    signStaffJWT({ sub: staff.id, clientId: staff.clientId, name: staff.name, tier: staff.tier }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    }
  );
  return res;
}
