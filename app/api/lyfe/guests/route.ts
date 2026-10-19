import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIpFrom } from "@/lib/lyfe";

/**
 * A confirmed guest naming the people they are bringing.
 *
 * Each named guest becomes a confirmed row of their own, so they get their own
 * access pass and the door has their name. The host's guestCount comes down by
 * the same number, so the headcount (1 + guestCount per row) does not count
 * anybody twice. Passes are sent by scripts/send-ageless-passes.ts, which picks
 * up any confirmed row that has not had one.
 *
 * Same trust model as /api/lyfe/confirm: the token is the credential, and all
 * it can do is fill the places the host already holds.
 */
const person = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
});

const schema = z.object({
  token: z.string().trim().min(8).max(200),
  guests: z.array(person).min(1).max(4),
});

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(ip, "lyfe-guests", { windowMs: 60 * 60 * 1000, max: 30 })) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please give each guest a full name and an email address." }, { status: 400 });
  }
  const { token, guests } = parsed.data;

  const host = await prisma.lyfeEnquiry.findUnique({
    where: { inviteToken: token },
    select: { id: true, fullName: true, email: true, guestCount: true, eventStage: true },
  });
  if (!host) {
    return NextResponse.json({ error: "We could not find that invitation." }, { status: 404 });
  }
  if (host.eventStage !== "CONFIRMED") {
    return NextResponse.json({ error: "This invitation is not confirmed, so it has no guest places." }, { status: 409 });
  }
  const open = host.guestCount ?? 0;
  if (guests.length > open) {
    return NextResponse.json(
      { error: open === 0 ? "Your guest places are already named." : `You have ${open} guest ${open === 1 ? "place" : "places"} left.` },
      { status: 409 },
    );
  }
  const emails = guests.map((g) => g.email);
  if (new Set(emails).size !== emails.length || emails.includes(host.email.toLowerCase())) {
    return NextResponse.json({ error: "Each guest needs their own email address." }, { status: 400 });
  }

  const now = new Date();
  const consentText =
    `Details given by ${host.fullName} (${host.email}) as their guest at the ${now.getFullYear()} AGELESS evening, ` +
    "to send an access pass and the evening's details. Used for nothing else without the guest's own consent.";

  const already = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", email: { in: emails, mode: "insensitive" } },
    select: { email: true },
  });
  const known = new Set(already.map((r) => r.email.toLowerCase()));

  await prisma.$transaction([
    ...guests
      .filter((g) => !known.has(g.email))
      .map((g) =>
        prisma.lyfeEnquiry.create({
          data: {
            fullName: g.fullName,
            email: g.email,
            phone: g.phone,
            intent: "EVENT_RSVP",
            guestCount: 0,
            eventStage: "CONFIRMED",
            confirmedAt: now,
            source: "FRIEND_OR_FAMILY",
            sourceDetail: `guest-of:${host.id}`,
            consentedAt: now,
            consentText,
            ipHash: null,
          },
        }),
      ),
    prisma.lyfeEnquiry.update({
      where: { id: host.id },
      data: { guestCount: open - guests.length },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    added: guests.filter((g) => !known.has(g.email)).map((g) => g.fullName),
    alreadyRegistered: guests.filter((g) => known.has(g.email)).map((g) => g.fullName),
  });
});
