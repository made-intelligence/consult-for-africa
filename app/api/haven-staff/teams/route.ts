import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession, can } from "@/lib/staffAuth";
import { dayKey } from "@/lib/havenDuty";

// Team membership and leads (leadership), and the daily huddle (the lead).

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign"), staffId: z.string(), teamId: z.string().nullable() }),
  z.object({ action: z.literal("lead"), teamId: z.string(), staffId: z.string().nullable() }),
  z.object({
    action: z.literal("huddle"),
    teamId: z.string(),
    attendees: z.array(z.string()).max(60),
    safety: z.string().trim().max(500).optional(),
    focus: z.string().trim().max(500).optional(),
    blocker: z.string().trim().max(500).optional(),
  }),
]);

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const b = parsed.data;

  if (b.action === "huddle") {
    const team = await prisma.staffTeam.findFirst({ where: { id: b.teamId, clientId: session.clientId }, select: { id: true, leadId: true, members: { select: { id: true } } } });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // The lead runs it; leadership can record it when covering.
    if (team.leadId !== session.sub && !session.tiers.includes("LEADERSHIP")) return NextResponse.json({ error: "Only the team lead records the huddle" }, { status: 403 });
    const members = new Set(team.members.map((m) => m.id));
    const attendees = b.attendees.filter((a) => members.has(a));
    const date = dayKey();
    await prisma.teamHuddle.upsert({
      where: { teamId_date: { teamId: team.id, date } },
      create: { teamId: team.id, date, ledById: session.sub, attendees, safety: b.safety || null, focus: b.focus || null, blocker: b.blocker || null },
      update: { ledById: session.sub, attendees, safety: b.safety || null, focus: b.focus || null, blocker: b.blocker || null },
    });
    return NextResponse.json({ ok: true });
  }

  if (!can(session, "MANAGE_TEAMS")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const staff = b.staffId
    ? await prisma.staffMember.findFirst({ where: { id: b.staffId, clientId: session.clientId }, select: { id: true } })
    : null;
  if (b.staffId && !staff) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const teamId = b.teamId;
  if (teamId) {
    const team = await prisma.staffTeam.findFirst({ where: { id: teamId, clientId: session.clientId }, select: { id: true } });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (b.action === "assign") {
    await prisma.staffMember.update({ where: { id: b.staffId }, data: { teamId: b.teamId } });
  } else {
    // A lead is a member of the team they lead.
    await prisma.$transaction([
      prisma.staffTeam.update({ where: { id: b.teamId }, data: { leadId: b.staffId } }),
      ...(b.staffId ? [prisma.staffMember.update({ where: { id: b.staffId }, data: { teamId: b.teamId } })] : []),
    ]);
  }
  return NextResponse.json({ ok: true });
}
