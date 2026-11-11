import { prisma } from "@/lib/prisma";
import {
  SIGNED_STAGES,
  addWorkingDays,
  checkInText,
  endOfLagosDay,
  fmtDay,
  isOverdueForEscalation,
  startOfLagosDay,
  todayInLagos,
  weekOf,
} from "@/lib/outreach";

type Sprint = { id: string; name: string; clientName: string | null; goal: number; baseline: number; weeklyTargets: unknown };

const first = (n: string | null | undefined) => (n ?? "").replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(" ")[0];

/** Everything the board, the queue header and the roll-up read. One query set, so they agree. */
export async function sprintStats(sprint: Sprint, now = new Date()) {
  const today = todayInLagos(now);
  const dayStart = startOfLagosDay(today);
  const dayEnd = endOfLagosDay(today);
  const tomorrowEnd = addWorkingDays(now, 1);
  const week = weekOf(sprint.weeklyTargets as { from: string; label: string; target: number }[] | null, now);

  const [members, stageCounts, signedRows, touchesToday, open, escalated, heard] = await Promise.all([
    prisma.sprintMember.findMany({ where: { sprintId: sprint.id }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.sprintTarget.groupBy({ by: ["stage"], where: { sprintId: sprint.id }, _count: true }),
    prisma.sprintTarget.findMany({ where: { sprintId: sprint.id, signedAt: { not: null } }, select: { signedAt: true, ownerId: true, hospital: { select: { name: true } } } }),
    prisma.sprintTouch.findMany({ where: { target: { sprintId: sprint.id }, createdAt: { gte: dayStart, lte: dayEnd } }, select: { channel: true, outcome: true, createdAt: true, userId: true, target: { select: { hospital: { select: { name: true } } } } } }),
    prisma.sprintTarget.findMany({
      where: { sprintId: sprint.id, stage: { notIn: ["HANDED_OVER", "PARKED", "DECLINED", "ALREADY_SIGNED"] } },
      select: { id: true, stage: true, ownerId: true, nextActionAt: true, sentAt: true, escalatedAt: true },
    }),
    prisma.sprintTarget.findMany({
      where: { sprintId: sprint.id, escalatedAt: { not: null }, stage: { notIn: ["HANDED_OVER", "PARKED", "DECLINED", "ALREADY_SIGNED"] } },
      orderBy: { escalatedAt: "asc" },
      include: { hospital: { select: { name: true, lga: true } }, owner: { select: { name: true } } },
    }),
    prisma.sprintTouch.findMany({
      where: { target: { sprintId: sprint.id }, OR: [{ said: { not: null } }, { needs: { isEmpty: false } }] },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { select: { name: true } }, target: { select: { id: true, hospital: { select: { name: true, lga: true } } } } },
    }),
  ]);

  const signedInSprint = stageCounts.filter((s) => SIGNED_STAGES.includes(s.stage as never)).reduce((n, s) => n + s._count, 0);
  const total = sprint.baseline + signedInSprint;
  const target = sprint.baseline + sprint.goal;
  const signedThisWeek = week ? signedRows.filter((r) => r.signedAt! >= week.start && (!week.end || r.signedAt! < week.end)).length : null;
  const signedToday = signedRows.filter((r) => r.signedAt! >= dayStart && r.signedAt! <= dayEnd);

  // A chase past day 8 that nobody logged still counts as escalated.
  const silentlyOverdue = open.filter((t) => isOverdueForEscalation(t, now)).length;
  const overdue = open.filter((t) => t.nextActionAt && t.nextActionAt < dayStart).length;
  const out = open.filter((t) => t.stage === "SENT").length;

  const people = members.map((m) => {
    const mine = open.filter((t) => t.ownerId === m.userId);
    const myTouches = touchesToday.filter((t) => t.userId === m.userId);
    const mySigned = signedToday.filter((r) => r.ownerId === m.userId).map((r) => r.hospital.name);
    const card = {
      touchesToday: myTouches,
      sentToday: myTouches.filter((t) => t.outcome === "SENT").length,
      signedToday: mySigned,
      out: mine.filter((t) => t.stage === "SENT").length,
      dueTomorrow: mine.filter((t) => t.nextActionAt && t.nextActionAt > dayEnd && t.nextActionAt <= tomorrowEnd).length,
    };
    return {
      userId: m.userId,
      name: m.user.name,
      first: first(m.user.name),
      role: m.role,
      area: m.area,
      openCount: mine.length,
      fresh: mine.filter((t) => t.stage === "TARGET").length,
      dueNow: mine.filter((t) => t.nextActionAt && t.nextActionAt <= dayEnd).length,
      overdue: mine.filter((t) => t.nextActionAt && t.nextActionAt < dayStart).length,
      signedTotal: signedRows.filter((r) => r.ownerId === m.userId).length,
      contactsToday: myTouches.length,
      ...card,
      checkIn: checkInText(card),
    };
  });

  const client = (sprint.clientName ?? sprint.name).replace(/ HMO$/, "");
  const lead = members.find((m) => m.role === "LEAD");
  const byPerson = people.filter((p) => p.signedToday.length).map((p) => `${p.first} ${p.signedToday.length}`);
  const rollUp = [
    `- ${client}, ${fmtDay(now)}`,
    `- Signed today: ${signedToday.length}${byPerson.length ? ` (${byPerson.join(", ")})` : ""}`,
    `- Total: ${total} of ${target}.${week ? ` This week: ${signedThisWeek} of ${week.target}.` : ""}`,
    `- SLAs out: ${out}. Follow-ups overdue: ${overdue}.`,
    `- For ${first(lead?.user.name) || "the lead"}: ${escalated.length ? escalated.slice(0, 6).map((e) => e.hospital.name).join("; ") : "nothing"}`,
  ].join("\n");

  return {
    today,
    week,
    total,
    target,
    signedInSprint,
    signedThisWeek,
    signedToday,
    out,
    overdue,
    silentlyOverdue,
    stageCounts: Object.fromEntries(stageCounts.map((s) => [s.stage, s._count])) as Record<string, number>,
    people,
    escalated,
    heard,
    rollUp,
  };
}
