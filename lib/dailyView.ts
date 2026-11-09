import { prisma } from "@/lib/prisma";
import {
  addDays,
  isoDay,
  ownersFor,
  practiceDay,
  sectionStatus,
  visibleSections,
  type DailyConfig,
  type DailySection,
  type SectionStatus,
  type Values,
} from "@/lib/dailyReturn";

/**
 * Everything the principal's daily view and her morning email show, loaded
 * once. One loader for both, because the first time the email says three areas
 * were missing and the page says two, she stops believing either.
 */

export interface DayCell {
  status: SectionStatus;
  values: Values;
  note: string | null;
  enteredBy: string | null;
  submittedAt: Date | null;
}

export interface SectionRow {
  section: DailySection;
  /** Keyed by YYYY-MM-DD, the last 30 days ending today. */
  days: Record<string, DayCell>;
  owners: string[];
}

export interface OpenDecision {
  id: string;
  title: string;
  detail: string | null;
  raisedBy: string | null;
  raisedAt: Date;
  neededBy: Date | null;
  ageDays: number;
}

export interface OpenIssue {
  id: string;
  kind: string;
  what: string;
  status: string;
  severity: string | null;
  reportedAt: Date;
  ageDays: number;
}

export interface DailyView {
  today: Date;
  yesterday: Date;
  /** Oldest first, 30 days ending today. */
  days: Date[];
  rows: SectionRow[];
  decisions: OpenDecision[];
  issues: OpenIssue[];
  openFlags: number;
  rotaToday: { name: string; position: string; code: string }[];
}

const ageDays = (from: Date, now: Date) => Math.max(0, Math.floor((now.getTime() - from.getTime()) / 864e5));

export async function loadDailyView(
  clientId: string,
  config: DailyConfig,
  opts: { canSeeFinancials: boolean; now?: Date }
): Promise<DailyView> {
  const now = opts.now ?? new Date();
  const today = practiceDay(config, now);
  const yesterday = addDays(today, -1);
  const from = addDays(today, -29);
  const days = Array.from({ length: 30 }, (_, i) => addDays(from, i));
  const sections = visibleSections(config, opts.canSeeFinancials);

  const [returns, staff, decisions, issues, openFlags, shifts] = await Promise.all([
    prisma.dailyReturn.findMany({
      where: { clientId, day: { gte: from, lte: today }, section: { in: sections.map((s) => s.code) } },
      select: { day: true, section: true, values: true, note: true, submittedAt: true, enteredBy: { select: { name: true } } },
    }),
    prisma.staffMember.findMany({
      where: { clientId, isActive: true, kind: { in: ["EMPLOYEE", "PARTNER"] } },
      select: { name: true, position: true, department: true },
    }),
    prisma.decisionRequest.findMany({
      where: { clientId, status: "OPEN" },
      select: { id: true, title: true, detail: true, raisedAt: true, neededBy: true, raisedBy: { select: { name: true } } },
      orderBy: { raisedAt: "asc" },
    }),
    prisma.safetyReport.findMany({
      where: { clientId, NOT: { status: "CLOSED" } },
      select: { id: true, kind: true, what: true, status: true, severity: true, reportedAt: true },
      orderBy: { reportedAt: "asc" },
    }),
    prisma.staffTaskFlag.count({ where: { resolvedAt: null, task: { clientId } } }),
    prisma.staffShift.findMany({
      where: { date: today, staff: { clientId, isActive: true } },
      select: { code: true, staff: { select: { name: true, position: true } } },
    }),
  ]);

  const byKey = new Map(returns.map((r) => [`${r.section}|${isoDay(r.day)}`, r]));

  const rows: SectionRow[] = sections.map((section) => {
    const cells: Record<string, DayCell> = {};
    for (const d of days) {
      const r = byKey.get(`${section.code}|${isoDay(d)}`);
      cells[isoDay(d)] = {
        status: sectionStatus(config, section, d, !!r, now),
        values: (r?.values as Values | undefined) ?? {},
        note: r?.note ?? null,
        enteredBy: r?.enteredBy?.name ?? null,
        submittedAt: r?.submittedAt ?? null,
      };
    }
    return { section, days: cells, owners: ownersFor(section, staff).map((s) => s.name) };
  });

  return {
    today,
    yesterday,
    days,
    rows,
    decisions: decisions.map((d) => ({
      id: d.id,
      title: d.title,
      detail: d.detail,
      raisedBy: d.raisedBy?.name ?? null,
      raisedAt: d.raisedAt,
      neededBy: d.neededBy,
      ageDays: ageDays(d.raisedAt, now),
    })),
    issues: issues.map((i) => ({ ...i, ageDays: ageDays(i.reportedAt, now) })),
    openFlags,
    rotaToday: shifts.map((s) => ({ name: s.staff.name, position: s.staff.position, code: s.code })),
  };
}

/** "Today", "3 days", for an age on screen and in the email. */
export function ageLabel(days: number) {
  return days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`;
}
