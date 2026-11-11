import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { addWorkingDays } from "@/lib/outreach";
import { canWork, sprintAccess } from "@/lib/outreach-server";

// Edit a target: the signatory (anyone who works it), and the steering moves
// (owner, priority, park, reopen, clear an escalation) for the lead and runner.

const body = z.object({
  signatoryName: z.string().trim().max(160).optional(),
  signatoryRole: z.string().trim().max(120).optional(),
  signatoryPhone: z.string().trim().max(60).optional(),
  signatoryEmail: z.union([z.string().trim().toLowerCase().email("That email does not look right").max(200), z.literal("")]).optional(),
  notes: z.string().trim().max(4000).optional(),
  ownerId: z.string().min(1).optional(),
  priority: z.number().int().min(-10).max(100).optional(),
  action: z.enum(["park", "reopen", "resolve"]).optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const PATCH = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string; id: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug, id } = await ctx.params;
  const a = await sprintAccess(slug, session.user);
  if (!a) return Response.json({ error: "You are not on this sprint" }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const b = parsed.data;

  const t = await prisma.sprintTarget.findFirst({ where: { id, sprintId: a.sprint.id } });
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });
  if (!canWork(a, t, session.user.id)) return Response.json({ error: "This provider is on someone else's list" }, { status: 403 });
  const steering = b.ownerId !== undefined || b.priority !== undefined || b.action !== undefined;
  if (steering && !a.steer) return Response.json({ error: "Only the lead or the runner can do that" }, { status: 403 });

  if (b.ownerId) {
    const m = await prisma.sprintMember.findUnique({ where: { sprintId_userId: { sprintId: a.sprint.id, userId: b.ownerId } } });
    if (!m) return Response.json({ error: "That person is not on the sprint" }, { status: 400 });
  }
  if (b.action === "park" && !b.reason) return Response.json({ error: "Say why it is parked" }, { status: 400 });

  const now = new Date();
  const data: Record<string, unknown> = {};
  for (const k of ["signatoryName", "signatoryRole", "signatoryPhone", "signatoryEmail", "notes"] as const) if (b[k] !== undefined) data[k] = b[k] || null;
  if (b.ownerId) data.ownerId = b.ownerId;
  if (b.priority !== undefined) data.priority = b.priority;
  if (b.action === "park") Object.assign(data, { stage: "PARKED", closedReason: b.reason, nextAction: null, nextActionAt: null, escalatedAt: null });
  if (b.action === "reopen") Object.assign(data, { stage: t.sentAt ? "SENT" : "CONTACTED", closedReason: null, nextAction: "Pick this back up", nextActionAt: addWorkingDays(now, 0) });
  // Clearing an escalation gives the chase one more round from today.
  if (b.action === "resolve") Object.assign(data, { escalatedAt: null, escalationNote: b.reason ? `Resolved: ${b.reason}` : null, chaseStep: 2, nextAction: b.reason || "Escalation handled: chase the MD again", nextActionAt: addWorkingDays(now, 1) });

  const updated = await prisma.sprintTarget.update({ where: { id }, data });
  if (steering || b.action) {
    await prisma.sprintTouch.create({
      data: { targetId: id, userId: session.user.id, channel: "NOTE", outcome: b.action ? b.action.toUpperCase() : "STEER", note: [b.action, b.ownerId ? "reassigned" : "", b.reason].filter(Boolean).join(": ") || null, stageFrom: t.stage, stageTo: updated.stage },
    });
  }
  return Response.json({ ok: true });
});
