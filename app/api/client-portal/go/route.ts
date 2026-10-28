import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";
import { signClientPortalJWT } from "@/lib/clientPortalAuth";
import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";

/**
 * Sign in with a short one-time code, for a client who cannot get a password
 * typed in on a phone. The code is minted by an admin script into the same
 * resetToken fields the password reset uses, and is cleared on first use.
 *
 * The link opens a page with a button rather than signing in on GET, because
 * WhatsApp and Outlook fetch links to preview them and would spend the code.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip, "client-go", { windowMs: 600_000, max: 10 })) {
    return Response.json({ error: "Too many attempts. Please wait ten minutes." }, { status: 429 });
  }

  const { code } = await req.json();
  const normalised = String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalised.length < 8) {
    return Response.json({ error: "This sign-in link is incomplete." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(normalised).digest("hex");
  const contact = await prisma.clientContact.findFirst({
    where: { resetToken: tokenHash, resetTokenExpiry: { gt: new Date() }, isPortalEnabled: true },
    select: { id: true, clientId: true, name: true, email: true },
  });
  if (!contact) {
    return Response.json(
      { error: "This sign-in link has expired or has already been used. Please ask us for a new one." },
      { status: 400 }
    );
  }

  const token = signClientPortalJWT({
    sub: contact.id,
    clientId: contact.clientId,
    name: contact.name,
    email: contact.email,
  });

  const cookieStore = await cookies();
  cookieStore.set("client_portal_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/client",
  });

  await prisma.clientContact.update({
    where: { id: contact.id },
    data: { lastLoginAt: new Date(), resetToken: null, resetTokenExpiry: null },
  });

  return Response.json({ ok: true });
});
