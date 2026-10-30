import { prisma } from "@/lib/prisma";

/**
 * The safety register: every near miss and every what-is-broken, with an owner
 * and an end.
 *
 * The forms on the staff page stored a response and stopped. Fourteen reports
 * in the first three weeks, among them a caught overdose and two look-alike
 * medicines nearly mixed up, and not one investigated. Nothing gave a report an
 * owner, so nobody owned one.
 *
 * Two clocks, both short on purpose. Taken within two days, so the reporter
 * can see somebody picked it up. Closed within fourteen, which is the promise
 * in lib/haven-people.ts: a near miss channel "visibly acted on within a
 * fortnight". A near miss that reached a patient is HIGH from the moment it
 * lands.
 *
 * Shared by the form endpoint, the task tick, the backfill and the page, so
 * what counts as "a report" and when it is late cannot drift between them.
 */

export const TAKE_WITHIN_DAYS = 2;
export const CLOSE_WITHIN_DAYS = 14;

export const HAVEN_CLIENT_NAME = "Haven Paediatric Centre";

/** Task codes whose written answer is itself a report. See lib/havenTaskPrompts. */
export const REPORTING_TASKS: Record<string, "NEAR_MISS" | "BROKEN"> = {
  "c-nearmiss": "NEAR_MISS",
  "c-timewaster": "BROKEN",
};

/**
 * "Nil", "Nothing this week", "none for now". The near miss task offers
 * nothing as an honest answer and it must stay one: it is a tick, not a case.
 */
export function isNothing(text: string | null | undefined): boolean {
  const t = (text ?? "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  if (t.length === 0) return true;
  return /^(nil|nill|none|no|n a|nothing|nothing (this|for|to report|reported|now|this week|for now)( week| now)?|there (was|is) nothing( this week)?|no near miss( this week)?)$/.test(t);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function reachedAPatient(reached: string | null | undefined): boolean {
  return /^yes/i.test((reached ?? "").trim());
}

/**
 * Raise a case from a form submission. Returns null when there is nothing to
 * raise. Idempotent on sourceId, so a re-run of the backfill is harmless.
 */
export async function raiseFromForm(input: {
  clientId: string;
  survey: string;
  responseId: string;
  payload: Record<string, unknown>;
  at: Date;
}) {
  const kind = input.survey === "haven-near-miss" ? "NEAR_MISS" : input.survey === "haven-whats-broken" ? "BROKEN" : null;
  if (!kind) return null;
  const p = input.payload;
  const what = str(p.what);
  if (isNothing(what)) return null;

  // What-is-broken asks where and what would fix it; both go to the
  // investigator, who is otherwise starting from one line.
  const why = kind === "NEAR_MISS"
    ? str(p.why)
    : [str(p.where) && `Where: ${str(p.where)}`, str(p.fix) && `Suggested fix: ${str(p.fix)}`].filter(Boolean).join("\n");
  const reached = kind === "NEAR_MISS" ? str(p.reachedPatient) || null : null;

  return prisma.safetyReport.upsert({
    where: { sourceId: input.responseId },
    update: {},
    create: {
      clientId: input.clientId,
      kind,
      sourceId: input.responseId,
      what: what.slice(0, 4000),
      why: why ? why.slice(0, 4000) : null,
      reachedPatient: reached,
      reportedBy: str(p.name) || null,
      reportedAt: input.at,
      severity: reachedAPatient(reached) ? "HIGH" : null,
    },
  });
}

/** Raise a case from the written answer to a reporting task. */
export async function raiseFromTaskNote(input: {
  clientId: string;
  taskCode: string | null;
  completionId: string;
  note: string | null | undefined;
  at: Date;
}) {
  const kind = input.taskCode ? REPORTING_TASKS[input.taskCode] : undefined;
  if (!kind || isNothing(input.note)) return null;
  // Not named: the task is ticked under a login, but the form promises
  // anonymity and the two routes to the same register must not differ on it.
  return prisma.safetyReport.upsert({
    where: { sourceId: input.completionId },
    update: { what: input.note!.trim().slice(0, 4000) },
    create: {
      clientId: input.clientId,
      kind,
      sourceId: input.completionId,
      what: input.note!.trim().slice(0, 4000),
      reportedAt: input.at,
    },
  });
}

const DAY = 864e5;

/** Is this case past either clock? */
export function lateness(r: { status: string; reportedAt: Date; takenAt: Date | null; actionDueAt: Date | null }, now = Date.now()) {
  if (r.status === "CLOSED") return null;
  const age = (now - r.reportedAt.getTime()) / DAY;
  if (r.status === "NEW" && age > TAKE_WITHIN_DAYS) return "Not taken";
  if (r.actionDueAt && r.actionDueAt.getTime() < now) return "Action overdue";
  if (age > CLOSE_WITHIN_DAYS) return "Open past 14 days";
  return null;
}
