import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSession } from "@/lib/staffAuth";
import { canDecide } from "@/lib/arabella-daily";
import { ARABELLA } from "@/lib/staffSites";

// Decisions waiting on the principal. Anyone signed in can raise one; only the
// principal (BOARD) answers it; the person who raised it can withdraw it.
// Each one shows its age on her page until it is answered, which is the whole
// point: nothing waits on her silently.

export const dynamic = "force-dynamic";

const raise = z.object({
  title: z.string().trim().min(5).max(200),
  detail: z.string().trim().max(2000).optional(),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const answer = z.object({
  id: z.string().min(1),
  action: z.enum(["decide", "decline", "withdraw"]),
  decision: z.string().trim().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = raise.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Say what needs deciding in a few words." }, { status: 400 });

  const row = await prisma.decisionRequest.create({
    data: {
      clientId: session.clientId,
      title: parsed.data.title,
      detail: parsed.data.detail || null,
      neededBy: parsed.data.neededBy ? new Date(`${parsed.data.neededBy}T00:00:00Z`) : null,
      raisedById: session.sub,
    },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function PATCH(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = answer.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { id, action, decision } = parsed.data;

  const row = await prisma.decisionRequest.findUnique({ where: { id }, select: { clientId: true, status: true, raisedById: true } });
  if (!row || row.clientId !== session.clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "OPEN") return NextResponse.json({ error: "This has already been answered." }, { status: 409 });

  if (action === "withdraw") {
    if (row.raisedById !== session.sub) return NextResponse.json({ error: "Only the person who raised it can withdraw it." }, { status: 403 });
    await prisma.decisionRequest.update({ where: { id }, data: { status: "WITHDRAWN" } });
    return NextResponse.json({ ok: true });
  }

  if (!canDecide(session.tiers)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (action === "decline" && !decision) {
    return NextResponse.json({ error: "Say why, in a line, so the person who asked knows what to do next." }, { status: 422 });
  }
  await prisma.decisionRequest.update({
    where: { id },
    data: {
      status: action === "decide" ? "DECIDED" : "DECLINED",
      decision: decision || null,
      decidedById: session.sub,
      decidedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true });
}
