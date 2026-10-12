import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ADVANCE_HOURS, CFA_FEE_RATE, FUNDER, MAX_DUE_DAYS, MONTHLY_RATE } from "@/lib/claims-recovery";

/**
 * The money side of the pilot with Carbon: advances, interest, the collection
 * account and its waterfall. Terms are in lib/claims-recovery.ts.
 *
 * Every receipt into the collection account is split once, when it is
 * recorded, and the split is stored: the funder first (interest beyond the
 * minimum, then principal), then any overdue advance on the same hospital's
 * book (the recourse sweep), then the hospital, within 48 hours. Our fee was
 * withheld at disbursement and is released only when an advance is repaid and
 * nothing on the hospital's book is overdue.
 */

type Dec = Prisma.Decimal;
const D = (n: number | string | Dec) => new Prisma.Decimal(n);
const ZERO = D(0);
const DAY = 86_400_000;
const r2 = (d: Dec) => d.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
const min = (a: Dec, b: Dec) => (a.lt(b) ? a : b);

// ── Pure arithmetic ──────────────────────────────────────────────────────

export function advanceTerms(principal: Dec, payer: { expectedDaysToPay: number; dueDays: number }, at: Date) {
  const minDays = Math.max(1, payer.expectedDaysToPay);
  const monthlyRate = D(MONTHLY_RATE);
  const feeRate = D(CFA_FEE_RATE);
  const discount = r2(principal.mul(monthlyRate).mul(minDays).div(30));
  const fee = r2(principal.mul(feeRate));
  const dueDays = Math.min(MAX_DUE_DAYS, Math.max(minDays, payer.dueDays));
  return {
    principal,
    monthlyRate,
    minDays,
    discount,
    feeRate,
    fee,
    netDisbursed: principal.sub(discount).sub(fee),
    disbursedAt: at,
    dueAt: new Date(at.getTime() + dueDays * DAY),
    // Nothing accrues until the minimum period, already paid, has run out.
    interestAccruedTo: new Date(at.getTime() + minDays * DAY),
  };
}

export type AdvanceState = {
  principal: Dec;
  principalRepaid: Dec;
  monthlyRate: Dec;
  extraInterest: Dec;
  extraInterestPaid: Dec;
  interestAccruedTo: Date;
  dueAt: Date;
  status: string;
};

/** Interest beyond the minimum, accrued daily on the principal still out, up to `to`. */
export function accrue(a: AdvanceState, to: Date): { extraInterest: Dec; interestAccruedTo: Date } {
  const days = Math.floor((to.getTime() - a.interestAccruedTo.getTime()) / DAY);
  if (days <= 0 || a.status !== "OPEN") return { extraInterest: a.extraInterest, interestAccruedTo: a.interestAccruedTo };
  const out = a.principal.sub(a.principalRepaid);
  const add = r2(out.mul(a.monthlyRate).mul(days).div(30));
  return { extraInterest: a.extraInterest.add(add), interestAccruedTo: new Date(a.interestAccruedTo.getTime() + days * DAY) };
}

/** Interest first, then principal. Returns what was taken and what is left over. */
export function apply(a: AdvanceState, amount: Dec) {
  const interestDue = a.extraInterest.sub(a.extraInterestPaid);
  const toInterest = min(amount, interestDue);
  const toPrincipal = min(amount.sub(toInterest), a.principal.sub(a.principalRepaid));
  return { toInterest, toPrincipal, left: amount.sub(toInterest).sub(toPrincipal) };
}

export const isOverdue = (a: { status: string; dueAt: Date }, now = new Date()) => a.status === "OPEN" && a.dueAt < now;

/** What the funder is owed on an advance today, with interest accrued to today. */
export function owedNow(a: AdvanceState, now = new Date()) {
  const acc = accrue(a, now);
  const interest = acc.extraInterest.sub(a.extraInterestPaid);
  const principal = a.principal.sub(a.principalRepaid);
  return { principal, interest, total: principal.add(interest) };
}

// ── Advances ─────────────────────────────────────────────────────────────

/** The funder has paid the hospital: the advance and its terms are fixed now. */
export async function disburse(claimId: string, at: Date, userId: string) {
  return prisma.$transaction(async (tx) => {
    const c = await tx.recoveryClaim.findUniqueOrThrow({ where: { id: claimId }, include: { payer: true, advance: true } });
    if (c.advance) throw new Error("This claim already has an advance");
    if (c.decision !== "ADVANCE" || !c.approvedAt || !c.decisionAmount) throw new Error("Approve the advance first");
    const t = advanceTerms(c.decisionAmount, c.payer, at);
    const adv = await tx.recoveryAdvance.create({
      data: { claimId, accountId: c.accountId, payerId: c.payerId, funder: FUNDER, ...t, createdById: userId },
    });
    await tx.recoveryClaim.update({ where: { id: claimId }, data: { status: "ADVANCED", advanceAmount: t.principal, advancedAt: at } });
    await tx.recoveryActivity.create({
      data: {
        accountId: c.accountId, claimId, payerId: c.payerId, kind: "STATUS", amount: t.principal, createdById: userId,
        summary: `${FUNDER} advanced ₦${t.principal.toFixed(2)}: discount ₦${t.discount.toFixed(2)} for ${t.minDays} days, our fee ₦${t.fee.toFixed(2)} withheld, ₦${t.netDisbursed.toFixed(2)} to the hospital. Due ${t.dueAt.toISOString().slice(0, 10)}.`,
      },
    });
    return adv;
  });
}

// ── Receipts and the waterfall ───────────────────────────────────────────

export type ReceiptLine = { claimRef: string; amount: string };

/** Parse pasted remittance lines: "claim ref, amount" one per line. */
export function parseRemittance(text: string): ReceiptLine[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)[,\t;]\s*[₦N]?\s*([\d,]+(?:\.\d{1,2})?)\s*$/i);
      if (!m) throw new Error(`Cannot read "${l}". Use: claim ref, amount`);
      return { claimRef: m[1].trim(), amount: m[2].replace(/,/g, "") };
    });
}

type Tx = Prisma.TransactionClient;

async function payAdvance(tx: Tx, adv: AdvanceState & { id: string }, amount: Dec, at: Date) {
  const acc = accrue(adv, at);
  const state = { ...adv, ...acc };
  const p = apply(state, amount);
  const principalRepaid = adv.principalRepaid.add(p.toPrincipal);
  const repaid = principalRepaid.gte(adv.principal) && acc.extraInterest.lte(adv.extraInterestPaid.add(p.toInterest));
  await tx.recoveryAdvance.update({
    where: { id: adv.id },
    data: {
      extraInterest: acc.extraInterest,
      interestAccruedTo: acc.interestAccruedTo,
      extraInterestPaid: adv.extraInterestPaid.add(p.toInterest),
      principalRepaid,
      ...(repaid ? { status: "REPAID", repaidAt: at } : {}),
    },
  });
  return p;
}

/**
 * Record money into the collection account and split it. `lines` say which
 * claims an HMO remittance covers; anything not matched to a claim goes to the
 * hospital, after any overdue advance. A HOSPITAL receipt is a recourse
 * payment: its lines name the advances it repays.
 */
export async function recordReceipt(input: {
  accountId: string;
  payerId: string | null;
  source: "HMO" | "HOSPITAL";
  amount: string;
  receivedAt: Date;
  reference: string | null;
  lines: ReceiptLine[];
  userId: string;
}) {
  const amount = D(input.amount);
  if (amount.lte(0)) throw new Error("Amount must be positive");
  const lineTotal = input.lines.reduce((s, l) => s.add(D(l.amount)), ZERO);
  if (lineTotal.gt(amount)) throw new Error(`The lines add up to ₦${lineTotal.toFixed(2)}, more than the ₦${amount.toFixed(2)} received`);
  const at = input.receivedAt;

  return prisma.$transaction(async (tx) => {
    const claims = await tx.recoveryClaim.findMany({
      where: { accountId: input.accountId, claimRef: { in: input.lines.map((l) => l.claimRef) }, ...(input.payerId ? { payerId: input.payerId } : {}) },
      include: { advance: true },
    });
    const byRef = new Map(claims.map((c) => [c.claimRef.toLowerCase(), c]));
    if (byRef.size < claims.length) throw new Error("A claim reference appears under more than one payor. Choose the payor for this receipt.");
    const missing = input.lines.filter((l) => !byRef.has(l.claimRef.toLowerCase())).map((l) => l.claimRef);
    if (missing.length) throw new Error(`Not on this hospital's book${input.payerId ? " for this payor" : ""}: ${missing.slice(0, 5).join(", ")}`);

    const receipt = await tx.recoveryReceipt.create({
      data: { accountId: input.accountId, payerId: input.payerId, source: input.source, amount, receivedAt: at, reference: input.reference, recordedById: input.userId },
    });

    let toFunder = ZERO;
    let pool = amount.sub(lineTotal); // unmatched money belongs to the hospital, after any overdue advance
    for (const l of input.lines) {
      const c = byRef.get(l.claimRef.toLowerCase())!;
      const amt = D(l.amount);
      let p = { toInterest: ZERO, toPrincipal: ZERO, left: amt };
      if (c.advance && c.advance.status === "OPEN") p = await payAdvance(tx, c.advance, amt, at);
      toFunder = toFunder.add(p.toInterest).add(p.toPrincipal);
      pool = pool.add(p.left);
      const kind = input.source === "HOSPITAL" ? "RECOURSE" : "CLAIM";
      await tx.recoveryAllocation.create({
        data: { receiptId: receipt.id, claimId: c.id, advanceId: c.advance?.id ?? null, kind, amount: amt, toInterest: p.toInterest, toPrincipal: p.toPrincipal },
      });
      if (kind === "CLAIM") {
        // Payor money against its own claim counts as recovered; a hospital's recourse payment does not.
        const recovered = c.recoveredAmount.add(amt);
        const target = c.acceptedAmount ?? c.vetPayable ?? c.tariffAmount ?? c.billedAmount;
        const status = recovered.gte(target) ? "PAID" : "PART_PAID";
        await tx.recoveryClaim.update({ where: { id: c.id }, data: { recoveredAmount: recovered, status, closedAt: status === "PAID" ? at : null, nextAction: status === "PAID" ? null : c.nextAction } });
        await tx.recoveryPayment.create({ data: { claimId: c.id, amount: amt, receivedAt: at, reference: input.reference, recordedById: input.userId } });
      }
    }

    // The recourse sweep: what would go to the hospital first clears any
    // advance on its book that is past due, oldest first.
    if (pool.gt(0)) {
      const overdue = await tx.recoveryAdvance.findMany({ where: { accountId: input.accountId, status: "OPEN", dueAt: { lt: at } }, orderBy: { dueAt: "asc" } });
      for (const a of overdue) {
        if (pool.lte(0)) break;
        const p = await payAdvance(tx, a, pool, at);
        const used = p.toInterest.add(p.toPrincipal);
        if (used.lte(0)) continue;
        toFunder = toFunder.add(used);
        pool = p.left;
        await tx.recoveryAllocation.create({ data: { receiptId: receipt.id, claimId: null, advanceId: a.id, kind: "RECOURSE", amount: used, toInterest: p.toInterest, toPrincipal: p.toPrincipal } });
      }
    }

    const feesReleased = await releaseFees(tx, input.accountId, at);
    const toHospital = pool;
    await tx.recoveryReceipt.update({
      where: { id: receipt.id },
      data: { toFunder, feesReleased, toHospital, hospitalDueBy: toHospital.gt(0) ? new Date(at.getTime() + ADVANCE_HOURS * 3_600_000) : null },
    });
    await tx.recoveryActivity.create({
      data: {
        accountId: input.accountId, payerId: input.payerId, kind: "PAYMENT", amount, createdById: input.userId,
        summary: `₦${amount.toFixed(2)} into the collection account${input.reference ? ` (${input.reference})` : ""} from ${input.source === "HOSPITAL" ? "the hospital" : "the payor"}: ₦${toFunder.toFixed(2)} to ${FUNDER}, ₦${toHospital.toFixed(2)} to the hospital within ${ADVANCE_HOURS} hours${feesReleased.gt(0) ? `, ₦${feesReleased.toFixed(2)} of our withheld fees released` : ""}.`,
      },
    });
    return { receiptId: receipt.id, toFunder: toFunder.toFixed(2), toHospital: toHospital.toFixed(2), feesReleased: feesReleased.toFixed(2) };
  });
}

/**
 * Our fee on a repaid advance is released only while nothing on the
 * hospital's book is overdue. The test is nothing overdue, not nothing
 * outstanding, because a revolving book is never at zero.
 */
async function releaseFees(tx: Tx, accountId: string, at: Date) {
  const overdue = await tx.recoveryAdvance.count({ where: { accountId, status: "OPEN", dueAt: { lt: at } } });
  if (overdue) return ZERO;
  const held = await tx.recoveryAdvance.findMany({ where: { accountId, status: "REPAID", feeStatus: "WITHHELD" }, select: { id: true, fee: true } });
  if (!held.length) return ZERO;
  await tx.recoveryAdvance.updateMany({ where: { id: { in: held.map((h) => h.id) } }, data: { feeStatus: "RELEASED", feeReleasedAt: at } });
  return held.reduce((s, h) => s.add(h.fee), ZERO);
}

export async function markHospitalPaid(receiptId: string, userId: string) {
  const r = await prisma.recoveryReceipt.update({ where: { id: receiptId }, data: { hospitalPaidAt: new Date() } });
  await prisma.recoveryActivity.create({ data: { accountId: r.accountId, kind: "STATUS", amount: r.toHospital, createdById: userId, summary: `₦${r.toHospital.toFixed(2)} paid out to the hospital's operating account` } });
  return r;
}

// ── The book ─────────────────────────────────────────────────────────────

export function bookSummary(advances: (AdvanceState & { fee: Dec; feeStatus: string })[], now = new Date()) {
  let principal = ZERO, interest = ZERO, overdueAmount = ZERO, withheld = ZERO, released = ZERO;
  let overdue = 0, open = 0;
  for (const a of advances) {
    if (a.feeStatus === "RELEASED") released = released.add(a.fee);
    else withheld = withheld.add(a.fee);
    if (a.status !== "OPEN") continue;
    open++;
    const o = owedNow(a, now);
    principal = principal.add(o.principal);
    interest = interest.add(o.interest);
    if (isOverdue(a, now)) {
      overdue++;
      overdueAmount = overdueAmount.add(o.total);
    }
  }
  return { open, principal, interest, overdue, overdueAmount, withheld, released };
}
