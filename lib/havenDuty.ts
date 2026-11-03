import { prisma } from "@/lib/prisma";

/**
 * Is this person on duty on this day?
 *
 * Staff who were off were getting the morning task email and being flagged for
 * tasks on days they were not in the building. A system that chases people on
 * their rest day teaches them to ignore it on their working days.
 *
 *   LEAVE    approved leave covers the day. Nothing is sent, nothing is owed.
 *   OFF      the department's rota for the month is in, and there is no shift.
 *            Nothing is owed; one short module is offered instead.
 *   ON       there is a shift.
 *   UNKNOWN  the department has no rota for the month. Treated as ON, which is
 *            the incentive to put the rota in: the people chased on their days
 *            off are the ones who will push for it.
 */
export type Duty = "ON" | "OFF" | "LEAVE" | "UNKNOWN";

export function dayKey(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function daysBetween(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let t = dayKey(from).getTime(); t <= dayKey(to).getTime(); t += 864e5) out.push(new Date(t));
  return out;
}

export interface DutyBook {
  duty(staffId: string, day: Date): Duty;
  shift(staffId: string, day: Date): string | null;
  /** Departments with no rota in for the month of `day`. */
  missingRota(day: Date): string[];
}

/**
 * Everything needed to answer duty() for a set of people across a date range,
 * in three queries, so a grid of twenty people by fourteen days is not 280.
 */
export async function dutyBook(
  clientId: string,
  people: { id: string; department: string }[],
  from: Date,
  to: Date,
): Promise<DutyBook> {
  const ids = people.map((p) => p.id);
  const start = dayKey(from);
  const end = dayKey(to);
  const months = Array.from(new Set(daysBetween(start, end).map(monthKey)));

  // If the rota tables are not there yet (code deployed before the
  // migration), everybody reads UNKNOWN, which is exactly the old behaviour,
  // rather than the staff page and the flag job falling over.
  const soft = <T,>(p: Promise<T[]>) => p.catch((err) => { console.error("[havenDuty]", err); return [] as T[]; });
  const [rotas, shifts, leave] = await Promise.all([
    soft(prisma.staffRota.findMany({ where: { clientId, month: { in: months } }, select: { department: true, month: true } })),
    soft(prisma.staffShift.findMany({
      where: { staffId: { in: ids }, date: { gte: start, lte: end } },
      select: { staffId: true, date: true, code: true },
    })),
    prisma.staffLeaveRequest.findMany({
      where: { staffId: { in: ids }, status: "APPROVED", startDate: { lte: end }, endDate: { gte: start } },
      select: { staffId: true, startDate: true, endDate: true },
    }),
  ]);

  const hasRota = new Set(rotas.map((r) => `${r.department}|${r.month}`));
  const shiftAt = new Map(shifts.map((s) => [`${s.staffId}|${s.date.getTime()}`, s.code]));
  const deptOf = new Map(people.map((p) => [p.id, p.department]));
  const allDepts = Array.from(new Set(people.map((p) => p.department)));

  return {
    duty(staffId, day) {
      const d = dayKey(day);
      if (leave.some((l) => l.staffId === staffId && dayKey(l.startDate) <= d && dayKey(l.endDate) >= d)) return "LEAVE";
      if (shiftAt.has(`${staffId}|${d.getTime()}`)) return "ON";
      return hasRota.has(`${deptOf.get(staffId)}|${monthKey(d)}`) ? "OFF" : "UNKNOWN";
    },
    shift(staffId, day) {
      return shiftAt.get(`${staffId}|${dayKey(day).getTime()}`) ?? null;
    },
    missingRota(day) {
      const m = monthKey(day);
      return allDepts.filter((dep) => !hasRota.has(`${dep}|${m}`));
    },
  };
}

/** Owed nothing today: off, or on leave. UNKNOWN is owed, on purpose. */
export const EXCUSED: Duty[] = ["OFF", "LEAVE"];

/** Title-cased department for people to read. The data holds "NURSING". */
export function deptLabel(d: string) {
  return d.charAt(0) + d.slice(1).toLowerCase().replace(/_/g, " ");
}
