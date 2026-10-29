import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIpFrom, hashIp } from "@/lib/lyfe";

/**
 * Live questions at an AGELESS evening. Guests post and vote from their
 * phones at /ageless/live; the chair reads them, top votes first, at
 * /ageless/live/chair behind a PIN (AGELESS_CHAIR_PIN, else the door PIN).
 *
 * New questions show at once. The chair hides anything unsuitable, which is
 * quicker on the night than holding every question for approval.
 */
const AGELESS_EDITION = "2026-10";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ask"),
    text: z.string().trim().min(5).max(500),
    name: z.string().trim().max(60).optional(),
    forWhom: z.string().trim().max(80).optional(),
  }),
  z.object({ action: z.literal("vote"), id: z.string().max(40) }),
  z.object({ action: z.literal("chair"), pin: z.string() }),
  z.object({
    action: z.literal("mark"),
    pin: z.string(),
    id: z.string().max(40),
    set: z.enum(["answered", "unanswered", "hidden", "shown"]),
  }),
]);

function pinOk(pin: string): boolean {
  const want = process.env.AGELESS_CHAIR_PIN || process.env.AGELESS_DOOR_PIN;
  if (!want) return false;
  const a = Buffer.from(pin.trim());
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

const select = { id: true, text: true, askerName: true, forWhom: true, votes: true, answered: true, hidden: true, createdAt: true };

async function list(includeHidden: boolean) {
  return prisma.agelessQuestion.findMany({
    where: { edition: AGELESS_EDITION, ...(includeHidden ? {} : { hidden: false }) },
    orderBy: [{ answered: "asc" }, { votes: "desc" }, { createdAt: "asc" }],
    select,
    take: 300,
  });
}

export const GET = handler(async () => {
  return NextResponse.json({ ok: true, questions: await list(false) });
});

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please write a question of at least a few words." }, { status: 400 });
  }
  const body = parsed.data;

  if (body.action === "ask") {
    if (isRateLimited(ip, "ageless-ask", { windowMs: 10 * 60 * 1000, max: 8 })) {
      return NextResponse.json({ error: "You have asked a lot already. Give the speakers a moment." }, { status: 429 });
    }
    await prisma.agelessQuestion.create({
      data: {
        edition: AGELESS_EDITION,
        text: body.text,
        askerName: body.name || null,
        forWhom: body.forWhom || null,
        ipHash: hashIp(ip),
      },
    });
    return NextResponse.json({ ok: true, questions: await list(false) });
  }

  if (body.action === "vote") {
    if (isRateLimited(ip, "ageless-vote", { windowMs: 60 * 1000, max: 60 })) {
      return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
    }
    await prisma.agelessQuestion.updateMany({
      where: { id: body.id, edition: AGELESS_EDITION, hidden: false },
      data: { votes: { increment: 1 } },
    });
    return NextResponse.json({ ok: true, questions: await list(false) });
  }

  // The chair's actions.
  if (!pinOk(body.pin)) {
    if (isRateLimited(ip, "ageless-chair-pin", { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json({ error: "Too many wrong PINs. Wait fifteen minutes." }, { status: 429 });
    }
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  if (body.action === "mark") {
    const data =
      body.set === "answered" ? { answered: true }
      : body.set === "unanswered" ? { answered: false }
      : body.set === "hidden" ? { hidden: true }
      : { hidden: false };
    await prisma.agelessQuestion.updateMany({ where: { id: body.id, edition: AGELESS_EDITION }, data });
  }
  return NextResponse.json({ ok: true, questions: await list(true) });
});
