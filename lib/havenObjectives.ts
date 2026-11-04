import { can, type StaffSession } from "@/lib/staffAuth";

/**
 * Objectives and key results at Haven: the rules in one place.
 *
 * Board objectives are the founders' and leadership's, and may carry money,
 * so only those who can see the financials see them. Team objectives are seen
 * by the whole hospital, so they carry no naira figures.
 *
 * Catchball: an objective is written (DRAFT), sent up (PROPOSED), then agreed
 * (AGREED) or sent back with a note. Nothing is agreed without a guard: the
 * thing that must not get worse while the result is pushed.
 */

export function quarterOf(d = new Date()) {
  const lagos = new Date(d.getTime() + 3600 * 1000);
  return `${lagos.getUTCFullYear()}-Q${Math.floor(lagos.getUTCMonth() / 3) + 1}`;
}

export function quarterLabel(q: string) {
  const [y, n] = q.split("-Q").map(Number);
  const months = ["January to March", "April to June", "July to September", "October to December"][n - 1];
  return `${months} ${y}`;
}

export interface ObjectiveScope {
  level: "BOARD" | "TEAM";
  teamLeadId: string | null;
}

export function canSeeBoard(session: StaffSession) {
  return can(session, "VIEW_FINANCIALS");
}

/** Write, add results, check in, propose. */
export function canEdit(session: StaffSession, o: ObjectiveScope) {
  if (o.level === "BOARD") return can(session, "VIEW_FINANCIALS");
  return session.tiers.includes("LEADERSHIP") || o.teamLeadId === session.sub;
}

/** Agree, or send back. */
export function canAgree(session: StaffSession, o: ObjectiveScope) {
  return o.level === "BOARD" ? can(session, "AGREE_BOARD_OBJECTIVES") : can(session, "AGREE_TEAM_OBJECTIVES");
}

/** What blocks sending an objective up or agreeing it, in words. */
export function readiness(krs: { kind: "RESULT" | "GUARD" }[]): string | null {
  if (!krs.some((k) => k.kind === "RESULT")) return "Add at least one key result.";
  if (!krs.some((k) => k.kind === "GUARD")) return "Add a guard: what must not get worse while this is pushed.";
  if (krs.filter((k) => k.kind === "RESULT").length > 5) return "Five key results at most. Fewer is better.";
  return null;
}
