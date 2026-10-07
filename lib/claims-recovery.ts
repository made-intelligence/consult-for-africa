/**
 * Claims Recovery: the first product sold through the hospital sales suite.
 *
 * One definition shared by the public page, the receivables check, the
 * enquiry route and the admin funnel, so the copy and the numbers cannot drift.
 *
 * The early payment line (60% of vetted claims within 48 hours) depends on a
 * funding partner signing. Until ADVANCE_LIVE is true the public page only
 * invites interest in it and never promises it.
 */

export const PRODUCT_KEY = "claims-recovery";
export const SERVICE_NAME = "Claims Recovery";
export const SERVICE_PATH = "/services/claims-recovery";
export const LEAD_SOURCE = "CLAIMS_RECOVERY";
export const SERVICE_LINE_HOOK = "Claims Recovery & Early Payment";

/** Flip when the funding partner has signed and the first advance has moved. */
export const ADVANCE_LIVE = false;
export const ADVANCE_RATE = 0.6;
export const ADVANCE_HOURS = 48;

/**
 * The funding partner's discount, charged monthly and deducted at
 * disbursement rather than recovered out of the payor's settlement.
 *
 * This is the number a hospital's accountant will go at first, and it should
 * be: four to five per cent a month is fifty to eighty per cent annualised.
 * On a receivable that takes ninety days to settle it is twelve to fifteen
 * per cent of the advance, so the sum only works where the alternative is
 * waiting, not where the alternative is a bank.
 *
 * It also means speed is worth money twice. Every month taken off the
 * settlement is a month of discount the hospital does not pay, which is the
 * strongest argument for buying the recovery work and the advance together
 * rather than the advance alone.
 */
export const DISCOUNT_MONTHLY_LOW = 0.04;
export const DISCOUNT_MONTHLY_HIGH = 0.05;

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
  /**
   * The gross advance against vetted claims, before the funding partner's
   * discount. The discount comes off at disbursement, so the hospital
   * receives less than this and the label has to say so.
   */
  earlyPayment: number;
  /** What the discount costs over the expected wait, at both ends of the range. */
  discountLow: number;
  discountHigh: number;
  /** What actually lands, after the discount is deducted at disbursement. */
  netLow: number;
  netHigh: number;
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
  // Charged for as long as the money is out, which is however long the payor
  // takes. A minimum of one month, because nobody discounts for nothing.
  const months = Math.max(1, d / 30);
  const discountLow = advance * DISCOUNT_MONTHLY_LOW * months;
  const discountHigh = advance * DISCOUNT_MONTHLY_HIGH * months;
  return {
    outstanding,
    inDispute,
    per30Days: d > 30 ? m : (m * d) / 30,
    earlyPayment: advance,
    discountLow,
    discountHigh,
    netLow: Math.max(0, advance - discountHigh),
    netHigh: Math.max(0, advance - discountLow),
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
