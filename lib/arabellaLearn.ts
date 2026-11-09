import { prisma } from "@/lib/prisma";
import { myModules, type LearnRow } from "@/lib/havenLearn";
import { GO_LIVE, weekStart } from "@/lib/arabella-plan";

/**
 * Arabella's training, a module a week or so. The shared myModules does the
 * matching and the status; this adds the trickle: a module reaches a person
 * once it is approved AND its week's Monday has passed (Protocol.startsOn).
 */

const WEEK = 7 * 864e5;

/** Which week of the plan a date falls in. 0 or less is before go-live. */
export function planWeek(at: Date = new Date(), goLive: string = GO_LIVE): number {
  return Math.floor((at.getTime() - weekStart(1, goLive).getTime()) / WEEK) + 1;
}

/** The plan week a module opens in, from its startsOn. Null is live now. */
export function weekOfStart(startsOn: Date | null | undefined): number | null {
  return startsOn ? planWeek(startsOn) : null;
}

export function isOpen(row: { approved: boolean; startsOn?: Date | null }, now: Date = new Date()) {
  return row.approved && (!row.startsOn || row.startsOn.getTime() <= now.getTime());
}

export interface ArabellaLearn {
  /** Open to me now: approved and its week has started. */
  open: LearnRow[];
  /** Opened in the current week, shown first. */
  thisWeek: LearnRow[];
  /** Mine but not open yet (later week, or not approved). Count and date only. */
  later: LearnRow[];
  nextOpens: Date | null;
}

export async function arabellaLearn(clientId: string, staffId: string, now: Date = new Date()): Promise<ArabellaLearn> {
  const rows = await myModules(clientId, staffId);
  const open = rows.filter((r) => isOpen(r, now)).sort(byStart);
  const later = rows.filter((r) => !isOpen(r, now)).sort(byStart);
  const current = planWeek(now);
  const thisWeek = open.filter((r) => weekOfStart(r.startsOn) === current);
  const future = later.map((r) => r.startsOn).filter((d): d is Date => !!d && d.getTime() > now.getTime());
  return { open, thisWeek, later, nextOpens: future.length ? future[0] : null };
}

function byStart(a: LearnRow, b: LearnRow) {
  const x = a.startsOn?.getTime() ?? 0;
  const y = b.startsOn?.getTime() ?? 0;
  return x - y || a.code.localeCompare(b.code);
}

/** Every module still waiting on the approver, in teaching order. */
export async function awaitingApproval(clientId: string) {
  return prisma.protocol.findMany({
    where: { clientId, isActive: true, approvedAt: null },
    select: { id: true, code: true, domain: true, title: true, summary: true, startsOn: true, sentBackAt: true, approvalNote: true, _count: { select: { questions: true } } },
    orderBy: [{ startsOn: "asc" }, { code: "asc" }],
  });
}

export const dayLabel = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" });
