/**
 * Claims Recovery: the first product sold through the hospital sales suite.
 *
 * One definition shared by the public page, the receivables check, the
 * enquiry route and the admin funnel, so the copy and the numbers cannot drift.
 *
 * The early payment line (60% of payor-accepted claims within 48 hours)
 * depends on the funding partner signing. Until ADVANCE_LIVE is true the public page only
 * invites interest in it and never promises it.
 */

export const PRODUCT_KEY = "claims-recovery";
export const SERVICE_NAME = "Claims Recovery";
export const SERVICE_PATH = "/services/claims-recovery";
export const LEAD_SOURCE = "CLAIMS_RECOVERY";
export const SERVICE_LINE_HOOK = "Claims Recovery & Early Payment";

/**
 * On when Carbon has signed the facility agreement. An env var, so the pilot
 * can open without a deploy: RECOVERY_ADVANCE_LIVE=true.
 */
export const ADVANCE_LIVE = process.env.RECOVERY_ADVANCE_LIVE === "true";
export const FUNDER = "Carbon";
export const ADVANCE_RATE = 0.6;
export const ADVANCE_HOURS = 48;

/**
 * Pilot terms agreed with Carbon, 12 October 2026.
 *
 * Carbon lends 60% of a claim the payor has already accepted, with full
 * recourse to the hospital. Its interest is 2.5% a month (30-day months) on
 * the days the money is out, with the payor's expected time to pay as the
 * minimum. That minimum is taken as a discount at disbursement; days beyond it
 * accrue daily and come out of the payor's remittance. Our fee is a fixed 1%
 * of the advance, withheld at disbursement and released once Carbon has been
 * repaid and nothing on the hospital's book is overdue.
 */
export const MONTHLY_RATE = 0.025;
export const CFA_FEE_RATE = 0.01;
export const DEFAULT_MIN_DAYS = 60;
/** An advance is due by this many days at most, whatever the payor's record. */
export const MAX_DUE_DAYS = 120;
/** Private HMOs only: no NHIA, state scheme, military or corporate payors. */
export const FUNDABLE_PAYER_TYPES = ["HMO"];
/** A hospital draws once payors covering this share of its HMO billing have signed the acknowledgment letter. */
export const ACK_COVERAGE = 0.6;

/** Carbon's interest plus our fee on an advance out for `days`, minimum period applied. */
export function advanceCost(advance: number, days: number, minDays = DEFAULT_MIN_DAYS) {
  const interest = (advance * MONTHLY_RATE * Math.max(days, minDays)) / 30;
  const fee = advance * CFA_FEE_RATE;
  return { interest, fee, total: interest + fee };
}

/** The conversion offer: a free review of a sample of claims. */
export const SAMPLE_SIZE = 20;

export const NOTIFY_TO = ["debo.odulana@consultforafrica.com", "hello@consultforafrica.com"];

export const ROLES = [
  "Owner or Medical Director",
  "Chief Executive or Administrator",
  "Finance or Accounts",
  "Billing or Claims Officer",
  "Other",
] as const;

export const PAYER_COUNTS = ["1 to 3", "4 to 8", "9 to 15", "More than 15"] as const;

export const OLDEST_UNPAID = [
  "Under 3 months",
  "3 to 6 months",
  "6 to 12 months",
  "Over a year",
  "Not sure",
] as const;

export type CheckInput = {
  /** What the hospital bills payors, corporates and schemes in a month. */
  monthlyBilled: number;
  /** Average days from submitting a claim to the money arriving. */
  daysToPay: number;
  /** Share of claims queried, cut or rejected, 0 to 100. */
  queriedPct: number;
};

export type CheckResult = {
  /** Owed to the hospital at any one time. */
  outstanding: number;
  /** Of that, the part tied up in queries and disputes. */
  inDispute: number;
  /** Released for good by getting paid 30 days faster. */
  per30Days: number;
  /** The advance against claims the payors have accepted, before the discount. */
  earlyPayment: number;
  /** Interest and fee over the hospital's own days to pay, minimum period applied. */
  cost: number;
};

/**
 * Arithmetic on the hospital's own numbers. Nothing here is a forecast of what
 * we will recover, and the page says so.
 */
export function check({ monthlyBilled, daysToPay, queriedPct }: CheckInput): CheckResult {
  const m = Math.max(0, monthlyBilled);
  const d = Math.min(720, Math.max(0, daysToPay));
  const q = Math.min(100, Math.max(0, queriedPct)) / 100;
  const outstanding = (m * d) / 30;
  const inDispute = outstanding * q;
  const advance = (outstanding - inDispute) * ADVANCE_RATE;
  return {
    outstanding,
    inDispute,
    per30Days: d > 30 ? m : (m * d) / 30,
    earlyPayment: advance,
    cost: advanceCost(advance, d).total,
  };
}

export type Score = "HOT" | "WARM" | "COLD";

/** Size and pain decide who gets a call first. */
export function score(input: CheckInput, role: string): Score {
  const { outstanding } = check(input);
  const decides = role === ROLES[0] || role === ROLES[1] || role === ROLES[2];
  if (outstanding >= 50_000_000 && input.daysToPay >= 60) return decides ? "HOT" : "WARM";
  if (outstanding >= 10_000_000) return decides ? "WARM" : "COLD";
  return "COLD";
}

export function naira(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}bn`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${Math.round(n)}`;
}
