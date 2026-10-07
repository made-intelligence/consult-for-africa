import { Prisma } from "@prisma/client";

/**
 * Advance decisioning. Fixed rules, in this order, and the first failure
 * decides. The AI vetting result is one input (verdict and likelihood); it can
 * stop an advance but can never authorise one on its own. A person approves
 * every ADVANCE before money moves, and the funder's own credit check sits
 * after that.
 */

export const MIN_LIKELIHOOD = 75;
const CONCENTRATION_FLOOR = new Prisma.Decimal(5_000_000);

export type DecisionInput = {
  status: string;
  vetVerdict: string | null;
  vetLikelihood: number | null;
  vetConfirmed: boolean;
  vetPayable: Prisma.Decimal | null;
  billedAmount: Prisma.Decimal;
  tariffAmount: Prisma.Decimal | null;
  ageDays: number | null;
  payer: { advanceEligible: boolean; conflict: boolean };
  account: {
    status: string;
    advanceRate: Prisma.Decimal;
    maxClaimAgeDays: number;
    payerCap: Prisma.Decimal;
    facilityLimit: Prisma.Decimal | null;
    agreementSigned: boolean;
  };
  /** Already advanced and not yet recovered, across the hospital. */
  outstandingTotal: Prisma.Decimal;
  /** Already advanced and not yet recovered, for this payer. */
  outstandingPayer: Prisma.Decimal;
  fundingLive: boolean;
};

export type Decision = { decision: "ADVANCE" | "HOLD" | "DECLINE"; amount: Prisma.Decimal; reasons: string[] };

const D = (n: number | string) => new Prisma.Decimal(n);

export function decide(i: DecisionInput): Decision {
  const zero = D(0);
  const hold = (r: string): Decision => ({ decision: "HOLD", amount: zero, reasons: [r] });
  const decline = (r: string): Decision => ({ decision: "DECLINE", amount: zero, reasons: [r] });

  if (!i.fundingLive) return hold("Early payment is not live yet: no funder has signed.");
  if (i.account.status !== "ACTIVE" || !i.account.agreementSigned) return hold("The hospital's agreement is not signed and active.");
  if (i.status !== "VETTED") return hold(`Claim is ${i.status}, not freshly vetted.`);
  if (!i.vetVerdict) return hold("Not vetted yet.");
  if (!i.vetConfirmed) return hold("Vetting has not been confirmed by a person.");
  if (i.vetVerdict === "FAIL") return decline("Vetting says the payer is unlikely to pay.");
  if (i.vetVerdict === "REPAIR") return hold("Needs repair before it can be funded.");
  if ((i.vetLikelihood ?? 0) < MIN_LIKELIHOOD) return hold(`Likelihood ${i.vetLikelihood ?? 0}% is under ${MIN_LIKELIHOOD}%.`);
  if (i.payer.conflict) return decline("CFA advises this payer, so its claims are never advanced.");
  if (!i.payer.advanceEligible) return decline("This payer is not eligible for advances.");
  if (i.ageDays == null) return hold("Service or submission date missing, so the claim's age is unknown.");
  if (i.ageDays > i.account.maxClaimAgeDays) return decline(`Claim is ${i.ageDays} days old, over the ${i.account.maxClaimAgeDays} day limit.`);

  // The payer can pay at most the tariff, and the desk's own view of payable.
  let base = i.billedAmount;
  if (i.tariffAmount && i.tariffAmount.lt(base)) base = i.tariffAmount;
  if (i.vetPayable && i.vetPayable.lt(base)) base = i.vetPayable;
  const amount = base.mul(i.account.advanceRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
  if (amount.lte(0)) return decline("Nothing payable to advance against.");

  const newTotal = i.outstandingTotal.add(amount);
  if (i.account.facilityLimit && newTotal.gt(i.account.facilityLimit)) return hold("Would take the hospital over its facility limit.");
  // Concentration only means something once there is a book: one claim is
  // always 100% of an empty one. The cap bites above a quarter of the facility
  // limit, or ₦5m where no limit is set.
  const newPayer = i.outstandingPayer.add(amount);
  const floor = i.account.facilityLimit ? i.account.facilityLimit.mul(0.25) : CONCENTRATION_FLOOR;
  if (newTotal.gt(floor) && newPayer.div(newTotal).gt(i.account.payerCap)) {
    return hold(`Would put more than ${i.account.payerCap.mul(100).toFixed(0)}% of this hospital's advanced book on one payer.`);
  }

  return {
    decision: "ADVANCE",
    amount,
    reasons: [`Vetted PASS at ${i.vetLikelihood}% and confirmed`, `Advance ${i.account.advanceRate.mul(100).toFixed(0)}% of ₦${base.toFixed(2)}`, "Within age, facility and payer limits"],
  };
}

export function ageDays(serviceDate: Date | null, submittedAt: Date | null, now = new Date()): number | null {
  const from = submittedAt ?? serviceDate;
  return from ? Math.floor((now.getTime() - from.getTime()) / 86_400_000) : null;
}
