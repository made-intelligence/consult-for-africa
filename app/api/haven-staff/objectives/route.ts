import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { canAgree, canEdit, quarterOf, readiness } from "@/lib/havenObjectives";

export const dynamic = "force-dynamic";

const s = (n: number) => z.string().trim().max(n);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), level: z.enum(["BOARD", "TEAM"]), teamId: z.string().optional(), parentId: z.string().optional(), title: s(160).min(3), why: s(600).optional() }),
  z.object({ action: z.literal("addKr"), objectiveId: z.string(), kind: z.enum(["RESULT", "GUARD"]), title: s(200).min(3), baseline: s(60).optional(), target: s(60).optional() }),
  z.object({ action: z.literal("removeKr"), keyResultId: z.string() }),
  z.object({ action: z.literal("checkIn"), keyResultId: z.string(), value: s(60).min(1), confidence: z.number().int().min(1).max(10).optional(), note: s(400).optional() }),
  z.object({ action: z.literal("propose"), objectiveId: z.string(), note: s(600).optional() }),
  z.object({ action: z.literal("agree"), objectiveId: z.string() }),
  z.object({ action: z.literal("sendBack"), objectiveId: z.string(), note: s(600).min(3) }),
]);

const scopeInclude = { team: { select: { leadId: true } }, keyResults: { select: { kind: true } } } as const;

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the fields and try again." }, { status: 400 });
  const b = parsed.data;
  const deny = () => NextResponse.json({ error: "Not allowed" }, { status: 403 });

  if (b.action === "create") {
    let leadId: string | null = null;
    if (b.level === "TEAM") {
      if (!b.teamId) return NextResponse.json({ error: "Pick the team" }, { status: 400 });
      const team = await prisma.staffTeam.findFirst({ where: { id: b.teamId, clientId: session.clientId }, select: { leadId: true } });
      if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
      leadId = team.leadId;
    }
    if (!canEdit(session, { level: b.level, teamLeadId: leadId })) return deny();
    const o = await prisma.objective.create({
      data: { clientId: session.clientId, level: b.level, teamId: b.level === "TEAM" ? b.teamId : null, parentId: b.parentId || null, quarter: quarterOf(), title: b.title, why: b.why || null },
    });
    return NextResponse.json({ ok: true, id: o.id });
  }

  // Everything else acts on an existing objective, found through it or its result.
  const objectiveId =
    "objectiveId" in b
      ? b.objectiveId
      : (await prisma.keyResult.findUnique({ where: { id: b.keyResultId }, select: { objectiveId: true } }))?.objectiveId;
  if (!objectiveId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const o = await prisma.objective.findUnique({ where: { id: objectiveId }, include: scopeInclude });
  if (!o || o.clientId !== session.clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const scope = { level: o.level, teamLeadId: o.team?.leadId ?? null };

  switch (b.action) {
    case "addKr": {
      if (!canEdit(session, scope)) return deny();
      if (o.status === "AGREED" || o.status === "CLOSED") return NextResponse.json({ error: "Agreed objectives are fixed for the quarter. Check in against them instead." }, { status: 409 });
      await prisma.keyResult.create({ data: { objectiveId: o.id, kind: b.kind, title: b.title, baseline: b.baseline || null, target: b.target || null, sortOrder: o.keyResults.length } });
      break;
    }
    case "removeKr": {
      if (!canEdit(session, scope)) return deny();
      if (o.status === "AGREED" || o.status === "CLOSED") return NextResponse.json({ error: "Agreed objectives are fixed for the quarter." }, { status: 409 });
      await prisma.keyResult.delete({ where: { id: b.keyResultId } });
      break;
    }
    case "checkIn": {
      if (!canEdit(session, scope)) return deny();
      await prisma.$transaction([
        prisma.keyResultCheckIn.create({ data: { keyResultId: b.keyResultId, value: b.value, confidence: b.confidence ?? null, note: b.note || null, byId: session.sub } }),
        prisma.keyResult.update({ where: { id: b.keyResultId }, data: { current: b.value, confidence: b.confidence ?? undefined } }),
      ]);
      break;
    }
    case "propose": {
      if (!canEdit(session, scope)) return deny();
      const why = readiness(o.keyResults);
      if (why) return NextResponse.json({ error: why }, { status: 422 });
      await prisma.objective.update({ where: { id: o.id }, data: { status: "PROPOSED", proposalNote: b.note || null } });
      break;
    }
    case "agree": {
      if (!canAgree(session, scope)) return deny();
      if (o.status !== "PROPOSED") return NextResponse.json({ error: "Only a proposed objective can be agreed." }, { status: 409 });
      const why = readiness(o.keyResults);
      if (why) return NextResponse.json({ error: why }, { status: 422 });
      await prisma.objective.update({ where: { id: o.id }, data: { status: "AGREED", agreedById: session.sub, agreedAt: new Date() } });
      break;
    }
    case "sendBack": {
      if (!canAgree(session, scope)) return deny();
      await prisma.objective.update({ where: { id: o.id }, data: { status: "DRAFT", proposalNote: b.note } });
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
