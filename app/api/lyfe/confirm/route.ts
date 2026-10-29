import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIpFrom } from "@/lib/lyfe";
import { emailLyfeAttendanceConfirmed } from "@/lib/lyfeEmail";

/**
 * An invited guest answering their invitation.
 *
 * The token is the only credential, which is the same trust model as a paper
 * invitation: whoever holds it can answer. What the token cannot do is anything
 * other than answer, so the worst case is a wrong yes, which a telephone call
 * fixes and which is strictly better than a guest who could not be bothered to
 * make an account.
 */
const schema = z.object({
  token: z.string().trim().min(8).max(200),
  reply: z.enum(["CONFIRMED", "DECLINED"]),
  guestCount: z.number().int().min(0).max(4).default(0),
});

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(ip, "lyfe-confirm", { windowMs: 60 * 60 * 1000, max: 30 })) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "That link did not look right." }, { status: 400 });
  }
  const { token, reply, guestCount } = parsed.data;

  const guest = await prisma.lyfeEnquiry.findUnique({
    where: { inviteToken: token },
    select: { id: true, fullName: true, email: true, eventStage: true },
  });
  if (!guest) {
    return NextResponse.json({ error: "We could not find that invitation." }, { status: 404 });
  }
  if (guest.eventStage === "ATTENDED" || guest.eventStage === "NO_SHOW") {
    return NextResponse.json({ error: "That evening has already happened." }, { status: 409 });
  }

  const now = new Date();
  const updated = await prisma.lyfeEnquiry.update({
    where: { id: guest.id },
    data:
      reply === "CONFIRMED"
        ? { eventStage: "CONFIRMED", confirmedAt: now, declinedAt: null, guestCount }
        : { eventStage: "DECLINED", declinedAt: now, confirmedAt: null, guestCount: 0 },
    select: { guestCount: true },
  });

  if (reply === "CONFIRMED") {
    const firstName = guest.fullName.trim().split(/\s+/)[0] ?? guest.fullName;
    try {
      await emailLyfeAttendanceConfirmed({
        to: guest.email,
        firstName,
        guestCount: updated.guestCount,
      });
    } catch (err) {
      // The answer is recorded. A failed receipt is not a reason to tell a
      // guest their confirmation did not work.
      console.error("[lyfe/confirm] receipt email failed:", err);
    }
  }

  return NextResponse.json({ ok: true, stage: reply });
});
