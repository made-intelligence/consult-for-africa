import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashLoginToken, signStaffJWT, STAFF_COOKIE } from "@/lib/staffAuth";

// Follows the link from the email: checks the token, sets the session, lands
// the person on the staff page. A bad or expired link redirects back to sign-in
// with a reason rather than showing an error page, because the only sensible
// next step is asking for another link.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("token");
  const back = (why: string) => NextResponse.redirect(new URL(`/HavenStaff/login?e=${why}`, req.url));

  if (!raw) return back("missing");

  const token = await prisma.staffLoginToken.findUnique({
    where: { tokenHash: hashLoginToken(raw) },
    include: {
      staff: { select: { id: true, clientId: true, name: true, tier: true, isActive: true } },
    },
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) return back("expired");
  if (!token.staff.isActive) return back("inactive");

  // Burn the token before issuing the session, so a link that is somehow
  // replayed in parallel cannot mint two sessions.
  const burned = await prisma.staffLoginToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (burned.count !== 1) return back("expired");

  await prisma.staffMember.update({
    where: { id: token.staff.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.redirect(new URL("/HavenStaff", req.url));
  res.cookies.set(STAFF_COOKIE, signStaffJWT({
    sub: token.staff.id,
    clientId: token.staff.clientId,
    name: token.staff.name,
    tier: token.staff.tier,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
