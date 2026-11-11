import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { NEEDS, OUTCOMES, applyTouch, outcome, type OutcomeKey } from "@/lib/outreach";
import { canWork, sprintAccess } from "@/lib/outreach-server";

// Log one contact with a provider. The outcome moves the stage and sets the
// next action; the chase cadence and escalation run from here.

const body = z.object({
  targetId: z.string().min(1),
  channel: z.enum(["CALL", "WHATSAPP", "EMAIL", "VISIT", "NOTE"]),
  outcome: z.enum(OUTCOMES.map((o) => o.key) as [OutcomeKey, ...OutcomeKey[]]),
  spokeTo: z.string().trim().max(160).optional().default(""),
  said: z.string().trim().max(4000).optional().default(""),
  needs: z.array(z.enum(NEEDS.map((n) => n.key) as [string, ...string[]])).max(NEEDS.length).optional().default([]),
  note: z.string().trim().max(2000).optional().default(""),
  /** YYYY-MM-DD, for a callback on a day the provider chose. */
  nextOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** YYYY-MM-DD, to back-fill an SLA sent or signed before it was logged. */
  happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug } = await ctx.params;
  const a = await sprintAccess(slug, session.user);
  if (!a) return Response.json({ error: "You are not on this sprint" }, { status: 403 });

  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const b = parsed.data;
  if (outcome(b.outcome)?.needsWords && !b.said) return Response.json({ error: "Write down what they said, in their words" }, { status: 400 });

  const t = await prisma.sprintTarget.findFirst({ where: { id: b.targetId, sprintId: a.sprint.id } });
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });
  if (!canWork(a, t, session.user.id)) return Response.json({ error: "This provider is on someone else's list" }, { status: 403 });

  let now = new Date();
  if (b.happenedOn && (b.outcome === "SENT" || b.outcome === "SIGNED")) {
    const d = new Date(`${b.happenedOn}T12:00:00+01:00`);
    if (d > now) return Response.json({ error: "That date is in the future" }, { status: 400 });
    if (d < a.sprint.startsAt) return Response.json({ error: "That date is before the sprint began" }, { status: 400 });
    now = d;
  }
  const nextOn = b.nextOn ? new Date(`${b.nextOn}T17:00:00+01:00`) : null;
  const eff = applyTouch(t, b.outcome, now, nextOn);

  const [touch] = await prisma.$transaction([
    prisma.sprintTouch.create({
      data: {
        targetId: t.id,
        userId: session.user.id,
        channel: b.channel,
        outcome: b.outcome,
        spokeTo: b.spokeTo || null,
        said: b.said || null,
        needs: b.needs,
        note: b.note || null,
        stageFrom: t.stage,
        stageTo: eff.stage,
      },
    }),
    prisma.sprintTarget.update({
      where: { id: t.id },
      data: {
        stage: eff.stage,
        nextAction: eff.nextAction,
        nextActionAt: eff.nextActionAt,
        chaseStep: eff.chaseStep,
        ...(eff.sentAt ? { sentAt: eff.sentAt } : {}),
        ...(eff.signedAt ? { signedAt: eff.signedAt } : {}),
        ...(eff.docsAt ? { docsAt: eff.docsAt } : {}),
        ...(eff.handedOverAt ? { handedOverAt: eff.handedOverAt } : {}),
        ...(eff.escalatedAt !== undefined ? { escalatedAt: eff.escalatedAt } : {}),
        ...(eff.escalationNote ? { escalationNote: eff.escalationNote } : {}),
        ...(b.outcome === "DECLINED" || b.outcome === "ALREADY_SIGNED" ? { closedReason: b.said || b.note || null } : {}),
        lastTouchAt: new Date(),
        touchCount: { increment: 1 },
      },
    }),
  ]);

  return Response.json({ ok: true, touchId: touch.id, stage: eff.stage, nextAction: eff.nextAction, nextActionAt: eff.nextActionAt });
});
