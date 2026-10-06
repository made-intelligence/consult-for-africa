/**
 * The six measures, and the week they are counted in.
 *
 * Six because a scoreboard nobody can hold in their head is a report. Each one
 * is something the people on shift can actually move, which is why none of them
 * is revenue: staff cannot move revenue and they hear it as a conversation
 * about their pay.
 */

export interface Measure {
  key: string;
  label: string;
  /** How to count it, in the words of the person doing the counting. */
  howToCount: string;
  /** Which way is good. Used only to colour the movement, never to judge. */
  better: "UP" | "DOWN";
  suffix?: string;
}

export const MEASURES: Measure[] = [
  {
    key: "beds-in-use",
    label: "Beds and cots in use",
    howToCount: "Average across the week, out of five beds and three cots.",
    better: "UP",
  },
  {
    key: "discharges-before-noon",
    label: "Discharges finished before noon",
    howToCount: "Of everyone who went home this week, how many were finished before midday.",
    better: "UP",
    suffix: "%",
  },
  {
    key: "stockouts",
    label: "Stockouts",
    howToCount: "Count every time somebody reached for something and it was not there.",
    better: "DOWN",
  },
  {
    key: "near-misses-reported",
    label: "Near misses reported",
    howToCount: "How many came in. Going up is a good week, not a bad one.",
    better: "UP",
  },
  {
    key: "standards-in-use",
    label: "Standards written and in use",
    howToCount: "Only counts once that team has signed off its own.",
    better: "UP",
  },
  {
    key: "rota-four-weeks",
    label: "Weeks the rota was published four weeks ahead",
    howToCount: "A streak. It resets to zero when it breaks.",
    better: "UP",
  },
];

export const MEASURE_BY_KEY = Object.fromEntries(MEASURES.map((m) => [m.key, m]));

/** ISO week key, e.g. 2026-W41. Weeks start Monday. */
export function isoWeek(d = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Thursday decides the year, which is what makes week 1 unambiguous.
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function previousWeek(period: string): string {
  const [y, w] = period.split("-W").map(Number);
  if (w > 1) return `${y}-W${String(w - 1).padStart(2, "0")}`;
  return `${y - 1}-W52`;
}

/**
 * Movement between two weeks. Returns null rather than guessing when either
 * value is not a number, because one of the six is a streak and another could
 * be entered as "3 of 8".
 */
export function movement(current: string, previous?: string) {
  const a = Number(String(current).replace(/[^\d.-]/g, ""));
  const b = previous === undefined ? NaN : Number(String(previous).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Number((a - b).toFixed(1));
}
