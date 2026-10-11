/**
 * Which day a completion is keyed to, given the task's cadence.
 *
 * Daily and per-shift tasks key to the day. Weekly ones key to the Monday of
 * the week, which lets one unique constraint carry both without a second table
 * and means a weekly task ticked on Thursday is still ticked on Friday.
 *
 * Shared by the page, the tick endpoint and the flag job, because three
 * different opinions about what "this period" means would quietly let a nurse
 * tick a task on Monday and be flagged for it on Tuesday.
 */
export type Cadence = "EVERY_SHIFT" | "DAILY" | "WEEKLY" | "MONTHLY";

export function periodKey(cadence: Cadence, now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (cadence === "WEEKLY") {
    const dow = d.getUTCDay() || 7; // Monday is 1, Sunday becomes 7
    d.setUTCDate(d.getUTCDate() - dow + 1);
    return d;
  }
  if (cadence === "MONTHLY") {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }
  return d;
}

/** Cadences that belong on the today view at all. */
export const ON_TODAY: Cadence[] = ["EVERY_SHIFT", "DAILY", "WEEKLY"];
