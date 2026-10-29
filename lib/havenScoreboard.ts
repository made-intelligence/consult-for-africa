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

/**
 * The operations manager's weekly inputs. Debo's call: everything weekly.
 *
 * These never appear on a staff surface. Entries carry visibility LEADERSHIP,
 * which the capability map grants LEADERSHIP to enter and LEADERSHIP plus BOARD
 * to view. Staff hear a revenue figure as a conversation about their pay, and
 * the six measures above are the ones they can actually move.
 *
 * Grounded in what the audit could and could not establish, so entering them is
 * also how the gaps close. Receivables by payer and claims outcomes were the
 * two critical items never supplied; once they are entered weekly the recovery
 * plan can finally be sized.
 */
export const FINANCIAL_MEASURES: Measure[] = [
  {
    key: "revenue-billed",
    label: "Revenue billed",
    howToCount: "Everything invoiced this week, self-pay and insured together.",
    better: "UP",
  },
  {
    key: "cash-collected",
    label: "Cash collected",
    howToCount: "What actually reached the account. Billed and collected are different questions.",
    better: "UP",
  },
  {
    key: "selfpay-share",
    label: "Self-pay share of revenue",
    howToCount: "Self-pay as a percentage of the week's billing. The mix is a decision, not a fact.",
    better: "UP",
    suffix: "%",
  },
  {
    key: "receivables-outstanding",
    label: "Receivables outstanding",
    howToCount: "Total owed across all payers, after the non-payer lines are stripped out.",
    better: "DOWN",
  },
  {
    key: "claims-submitted",
    label: "Claims submitted",
    howToCount: "Count submitted this week. Late submission is a refusal that has nothing to do with the care.",
    better: "UP",
  },
  {
    key: "claims-rejected",
    label: "Claims rejected",
    howToCount: "Count refused this week, with the reason recorded against each one.",
    better: "DOWN",
  },
  {
    key: "admissions",
    label: "Admissions",
    howToCount: "Paediatric and NICU together.",
    better: "UP",
  },
  {
    key: "nicu-admissions",
    label: "NICU admissions",
    howToCount: "Separately, because it is the highest-yield bed in the building and the growth plan rests on it.",
    better: "UP",
  },
  {
    key: "pharmacy-stock-value",
    label: "Pharmacy stock value",
    howToCount: "Cash standing on the shelf. Falls when consignment lands, not before.",
    better: "DOWN",
  },
  {
    key: "tariff-lines-priced",
    label: "Tariff lines priced",
    howToCount: "Out of 2,413. Started at 461.",
    better: "UP",
  },
];

/**
 * Payroll is the exception and is asked for monthly rather than weekly. A
 * weekly payroll figure in a hospital that pays on the twenty-fifth is a
 * quarter of a number, and entering it four times teaches people the scoreboard
 * tolerates guesses.
 */
export const MONTHLY_MEASURES: Measure[] = [
  {
    key: "payroll",
    label: "Payroll",
    howToCount: "The month's total cost of employment, not the gross salary bill.",
    better: "DOWN",
  },
];

export const ALL_MEASURES = [...MEASURES, ...FINANCIAL_MEASURES, ...MONTHLY_MEASURES];
export const ALL_MEASURE_BY_KEY = Object.fromEntries(ALL_MEASURES.map((m) => [m.key, m]));
export const FINANCIAL_KEYS = new Set(
  [...FINANCIAL_MEASURES, ...MONTHLY_MEASURES].map((m) => m.key)
);
