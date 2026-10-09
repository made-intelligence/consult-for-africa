import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Raise flags on tasks that were not recorded in time.
 *
 * Nothing wrote to StaffTaskFlag. The table existed, the today view read it,
 * and no job ever created a row, so not doing a task cost precisely nothing.
 *
 * A flag is a FACT about a record and never a judgement about a person. The
 * system can know a handover has no record against it. It cannot know the
 * handover was poor. Quality is sampled by a human and fed back privately.
 *
 * Runs hourly because grace periods are in hours and a daily job would make a
 * two hour grace meaningless.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CLIENT_NAME = "Haven Paediatric Centre";

function dayKey(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function appliesTo(roles: string[], position: string, department: string) {
  if (roles.length === 0) return true;
  const hay = `${position} ${department}`.toLowerCase();
  return roles.some((r) => {
    const needle = r.toLowerCase().replace(/^every /, "").replace(/s$/, "");
    return hay.includes(needle) || needle.includes("everybody") || needle.includes("all ");
  });
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "No client" }, { status: 404 });

  const [tasks, staff] = await Promise.all([
    prisma.staffTask.findMany({
      where: { clientId: client.id, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY"] } },
      select: { id: true, roles: true, graceHours: true, flagLevel: true },
    }),
    prisma.staffMember.findMany({
      where: { clientId: client.id, isActive: true, NOT: { department: "BOARD" } },
      select: { id: true, position: true, department: true },
    }),
  ]);

  const now = new Date();
  // Yesterday, not today. A task with a two hour grace is still inside it for
  // most of the morning, and flagging a nurse at 08:00 for a shift that ends at
  // 14:00 is how a system loses credibility on its first day.
  const target = dayKey(new Date(now.getTime() - 24 * 3600 * 1000));

  let raised = 0;
  for (const t of tasks) {
    const hoursSince = (now.getTime() - target.getTime()) / 3600000;
    if (hoursSince < t.graceHours) continue;

    const owed = staff.filter((s) => appliesTo(t.roles, s.position, s.department));
    if (owed.length === 0) continue;

    const done = await prisma.staffTaskCompletion.findMany({
      where: { taskId: t.id, forDate: target, staffId: { in: owed.map((o) => o.id) } },
      select: { staffId: true },
    });
    const doneIds = new Set(done.map((d) => d.staffId));

    for (const s of owed) {
      if (doneIds.has(s.id)) continue;
      // One flag per level per person per day. A task undone for a week
      // escalates once, not seven times.
      const made = await prisma.staffTaskFlag.createMany({
        data: [{ taskId: t.id, staffId: s.id, forDate: target, level: t.flagLevel }],
        skipDuplicates: true,
      });
      raised += made.count;
    }
  }

  console.log(`[haven-flags] raised=${raised} for ${target.toISOString().slice(0, 10)}`);
  return NextResponse.json({ ok: true, raised, forDate: target.toISOString().slice(0, 10) });
}
