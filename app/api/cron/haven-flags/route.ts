import { prisma } from "@/lib/prisma";
import { released } from "@/lib/staffTaskRelease";
import { NextRequest, NextResponse } from "next/server";
import { periodKey } from "@/lib/havenTaskPeriod";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { dutyBook, daysBetween, EXCUSED } from "@/lib/havenDuty";

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

/**
 * Every practice whose staff tasks are chased. Haven first, as it always was;
 * Arabella from its first week. Each runs independently, so one practice's
 * failure never stops the other's.
 */
const CLIENT_NAMES = ["Haven Paediatric Centre", "Arabella Women's Health"];

/**
 * A task is not flagged in the week it first reaches people. The first week is
 * for learning it; a miss on day one is a question, not a lapse. Haven's tasks
 * have no start date, so this never applies to them.
 */
const LEARNING_DAYS = 7;

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

  const results: Record<string, unknown> = {};
  for (const name of CLIENT_NAMES) {
    const client = await prisma.client.findFirst({ where: { name }, select: { id: true } });
    if (!client) { results[name] = "no client"; continue; }
    try {
      results[name] = await flagsFor(client.id);
    } catch (err) {
      console.error("[haven-flags]", name, err);
      results[name] = "failed";
    }
  }
  return NextResponse.json({ ok: true, results });
}

async function flagsFor(clientId: string) {
  const client = { id: clientId };
  const [tasks, staff] = await Promise.all([
    prisma.staffTask.findMany({
      where: { ...released(), clientId: client.id, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY", "WEEKLY"] } },
      select: { id: true, roles: true, graceHours: true, flagLevel: true, cadence: true, startsOn: true },
    }),
    prisma.staffMember.findMany({
      // Nobody who has never signed in. You cannot fail to record something you
      // have never been shown, and the first run of this flagged sixteen people
      // eighty-eight times for exactly that. A chase arriving before the
      // onboarding is not a chase, it is an accusation, and it costs the
      // reporting culture far more than the tasks are worth.
      //
      // The consequence is deliberate: until somebody is onboarded, the only
      // thing that reaches them is the invitation. Flags begin the day they
      // first sign in.
      where: { ...staffWhere(client.id, ONBOARDED), lastLoginAt: { not: null } },
      select: { id: true, position: true, department: true },
    }),
  ]);

  // lastLoginAt is the latest sign-in, not the first, so it cannot answer "was
  // this person here for that period". The first used code can. Without it the
  // job flagged Dr Tanwa at 20:00 on the Monday she first signed in, for all
  // four weekly tasks of the week before, which she had never seen.
  const firstIn = new Map<string, Date>();
  const used = await prisma.staffLoginToken.groupBy({
    by: ["staffId"],
    where: { staffId: { in: staff.map((s: { id: string }) => s.id) }, usedAt: { not: null } },
    _min: { usedAt: true },
  });
  for (const u of used) if (u._min.usedAt) firstIn.set(u.staffId, u._min.usedAt);

  const now = new Date();

  // Let old chases lapse. Nothing ever closed a flag except ticking the task,
  // so a missed day stayed open for good: 144 sat open by late October, more
  // than six for every person signed in, and a list that long says ticking
  // changes nothing. A nudge is about one day and is stale after two; a flag
  // stands for a week. Escalations are a human's to close and never lapse.
  // The row stays, resolved, so the record of the miss is not lost.
  const lapsed = await prisma.staffTaskFlag.updateMany({
    where: {
      resolvedAt: null,
      staff: { clientId: client.id },
      OR: [
        // Aged from when it was raised, not forDate: a weekly flag is keyed to
        // the Monday of a week that has already closed, so it would lapse the
        // hour it was raised.
        { level: "NUDGE", createdAt: { lt: new Date(now.getTime() - 2 * 864e5) } },
        { level: "FLAG", createdAt: { lt: new Date(now.getTime() - 7 * 864e5) } },
      ],
    },
    data: { resolvedAt: now, resolution: "Lapsed" },
  });

  // Yesterday, not today. A task with a two hour grace is still inside it for
  // most of the morning, and flagging a nurse at 08:00 for a shift that ends at
  // 14:00 is how a system loses credibility on its first day.
  const target = dayKey(new Date(now.getTime() - 24 * 3600 * 1000));

  // Nobody is flagged for a day they were off or on leave. Weekly tasks are
  // owed only by somebody who was on (or not known to be off) at least one day
  // of that week. A department with no rota is UNKNOWN and still owes, which is
  // the point: see lib/havenDuty.ts.
  const weekStart = periodKey("WEEKLY", new Date(now.getTime() - 7 * 24 * 3600 * 1000));
  const book = await dutyBook(client.id, staff, weekStart, target);
  const excused = (staffId: string, period: Date, weekly: boolean) =>
    weekly
      ? daysBetween(period, new Date(period.getTime() + 6 * 864e5)).every((d) => EXCUSED.includes(book.duty(staffId, d)))
      : EXCUSED.includes(book.duty(staffId, period));

  let raised = 0;
  for (const t of tasks) {
    // A weekly task is only late once its week has closed. Chasing somebody on
    // Tuesday for a task they have until Sunday to do is how a chase stops
    // being believed.
    const period = t.cadence === "WEEKLY"
      ? periodKey("WEEKLY", new Date(now.getTime() - 7 * 24 * 3600 * 1000))
      : target;
    const hoursSince = (now.getTime() - period.getTime()) / 3600000;
    if (hoursSince < t.graceHours) continue;
    if (t.startsOn && period.getTime() < t.startsOn.getTime() + LEARNING_DAYS * 864e5) continue;

    // Only people who were signed up before the period began owe it.
    const owed = staff.filter((s: { id: string; position: string; department: string }) => {
      const first = firstIn.get(s.id);
      return (
        first !== undefined &&
        first <= period &&
        appliesTo(t.roles, s.position, s.department) &&
        !excused(s.id, period, t.cadence === "WEEKLY")
      );
    });
    if (owed.length === 0) continue;

    const done = await prisma.staffTaskCompletion.findMany({
      where: { taskId: t.id, forDate: period, staffId: { in: owed.map((o: { id: string }) => o.id) } },
      select: { staffId: true },
    });
    const doneIds = new Set(done.map((d: { staffId: string }) => d.staffId));

    for (const s of owed) {
      if (doneIds.has(s.id)) continue;
      // One flag per level per person per day. A task undone for a week
      // escalates once, not seven times.
      const made = await prisma.staffTaskFlag.createMany({
        data: [{ taskId: t.id, staffId: s.id, forDate: period, level: t.flagLevel }],
        skipDuplicates: true,
      });
      raised += made.count;
    }
  }

  console.log(`[haven-flags] ${clientId} raised=${raised} lapsed=${lapsed.count} for ${target.toISOString().slice(0, 10)}`);
  return { raised, lapsed: lapsed.count, forDate: target.toISOString().slice(0, 10) };
}
