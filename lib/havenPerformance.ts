import { prisma } from "@/lib/prisma";
import type { StaffSession } from "@/lib/staffAuth";
import { SECTION_WEIGHTS } from "@/lib/haven-roles";

/**
 * Performance at Haven: personal objectives, monthly updates, one-to-ones and
 * the appraisal. The rules in one place.
 *
 * Who sees what. A person sees all of their own. Their line manager sees and
 * runs theirs. Leadership sees everyone's. Founders see objective status by
 * person (the same record as tasks) but appraisal scores only as team totals:
 * a score is a judgement about a person, and in a hospital of twenty it is
 * read as a verdict by everyone who sees it.
 *
 * Nothing here is tied to pay. That is stated on every surface that scores.
 */

export function monthKey(d = new Date()) {
  const l = new Date(d.getTime() + 3600 * 1000);
  return `${l.getUTCFullYear()}-${String(l.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** The cycle running today, if any. */
export async function currentCycle(clientId: string) {
  const now = new Date();
  return prisma.reviewCycle.findFirst({
    where: { clientId, closedAt: null, startsOn: { lte: now } },
    orderBy: { startsOn: "desc" },
  });
}

export const isLeadership = (s: StaffSession) => s.tiers.includes("LEADERSHIP");

/** Runs this person's objectives, one-to-ones and manager appraisal. */
export function canManage(s: StaffSession, person: { id: string; lineManagerId: string | null }) {
  return person.lineManagerId === s.sub || isLeadership(s);
}

/** Sees this person's appraisal scores. */
export function canSeeScores(s: StaffSession, person: { id: string; lineManagerId: string | null }) {
  return person.id === s.sub || canManage(s, person);
}

/** Objectives 80%, conduct 20%, each 0 to 5. Null until both parts are scored. */
export function overallScore(
  objectives: { id: string; weight: number }[],
  scores: Record<string, number> | null | undefined,
  conduct: Record<string, number> | null | undefined,
) {
  if (!scores || !conduct) return null;
  const totalW = objectives.reduce((a, o) => a + o.weight, 0) || 1;
  const obj = objectives.reduce((a, o) => a + (o.weight / totalW) * (scores[o.id] ?? 0), 0);
  const c = Object.values(conduct);
  const con = c.length ? c.reduce((a, b) => a + b, 0) / c.length : 0;
  return Math.round((SECTION_WEIGHTS.kpis * obj + SECTION_WEIGHTS.conduct * con) * 100) / 100;
}

export const RAG_COLOUR: Record<string, string> = { GREEN: "#166534", AMBER: "#92400E", RED: "#B0392B" };
export const RAG_BG: Record<string, string> = { GREEN: "#DCFCE7", AMBER: "#FEF3C7", RED: "#FEE2E2" };
