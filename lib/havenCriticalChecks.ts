import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/havenDuty";

/**
 * The safety checks founders follow day by day: was it recorded by anyone on
 * shift, today and on each of the last fourteen days. A check is critical if it
 * is named below or set to escalate when missed.
 */
const NAMED = ["n-crashtrolley", "n-drugchart", "n-handover"];
const DAYS = 14;

export interface CriticalRow {
  code: string;
  title: string;
  today: { done: boolean; by: string[] };
  days: { date: string; done: boolean }[];
  doneDays: number;
  lastDone: string | null;
  missedRecent: string[];
}

export async function criticalChecks(clientId: string): Promise<CriticalRow[]> {
  const tasks = await prisma.staffTask.findMany({
    where: { clientId, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY"] }, OR: [{ code: { in: NAMED } }, { flagLevel: "ESCALATE" }] },
    select: { id: true, code: true, title: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
  if (tasks.length === 0) return [];
  const today = dayKey();
  const from = new Date(today.getTime() - (DAYS - 1) * 864e5);
  const done = await prisma.staffTaskCompletion.findMany({
    where: { taskId: { in: tasks.map((t) => t.id) }, forDate: { gte: from, lte: today } },
    select: { taskId: true, forDate: true, staff: { select: { name: true } } },
  });
  const days = Array.from({ length: DAYS }, (_, i) => new Date(from.getTime() + i * 864e5));
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return tasks.map((t) => {
    const mine = done.filter((d) => d.taskId === t.id);
    const on = (d: Date) => mine.some((m) => m.forDate.getTime() === d.getTime());
    const strip = days.map((d) => ({ date: d.toISOString().slice(0, 10), done: on(d) }));
    const last = [...days].reverse().find(on) ?? null;
    return {
      code: t.code,
      title: t.title,
      today: { done: on(today), by: mine.filter((m) => m.forDate.getTime() === today.getTime()).map((m) => m.staff.name) },
      days: strip,
      doneDays: strip.filter((s) => s.done).length,
      lastDone: last ? fmt(last) : null,
      missedRecent: days.slice(-7, -1).filter((d) => !on(d)).map(fmt),
    };
  });
}
