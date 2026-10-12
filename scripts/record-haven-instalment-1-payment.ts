/**
 * Record the Haven instalment 1 payment (received the evening of 23 September 2026).
 *   - "Monthly instalment 1 of 3" milestone -> PAID
 *   - CONFIRMED Payment record of N2,500,000 against CFA-HAV-2026-001
 *   - Invoice roll-up recomputed from confirmed payments: paid N4.3M, balance N5.0M
 *
 * This is the instalment invoiced as CFA-HAV-2026-002 and reissued to the board
 * on 17 September; there is no separate Invoice row for it, it is a milestone on
 * the engagement invoice CFA-HAV-2026-001.
 *
 * Idempotent: skips the payment if one with this reference already exists, and
 * recomputes the roll-up from the payment rows rather than adding to a running
 * total, so a re-run cannot double-count.
 *
 *   npx tsx --env-file=.env.local scripts/record-haven-instalment-1-payment.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const INVOICE_NUMBER = "CFA-HAV-2026-001";
const MILESTONE = "Monthly instalment 1 of 3";
const AMOUNT = 2_500_000;
const REFERENCE = "CFA-HAV-2026-002";
const PAID_ON = new Date("2026-09-23T19:00:00Z");

async function main() {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: INVOICE_NUMBER },
    include: { payments: true },
  });
  if (!invoice) throw new Error(`Invoice ${INVOICE_NUMBER} not found.`);

  // 1. Milestone -> PAID
  const milestone = await prisma.paymentMilestone.findFirst({
    where: { invoiceId: invoice.id, name: MILESTONE },
  });
  if (milestone) {
    await prisma.paymentMilestone.update({
      where: { id: milestone.id },
      data: { status: "PAID", paidDate: PAID_ON },
    });
    console.log(`✓ Milestone "${milestone.name}" -> PAID (${PAID_ON.toISOString().slice(0, 10)})`);
  } else {
    console.warn(`! Milestone "${MILESTONE}" not found.`);
  }

  // 2. Payment record
  const dup = invoice.payments.find((p) => p.reference === REFERENCE);
  if (!dup) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: AMOUNT,
        currency: "NGN",
        paymentDate: PAID_ON,
        paymentMethod: "bank_transfer",
        bankName: "Zenith Bank",
        reference: REFERENCE,
        status: "CONFIRMED",
        confirmedAt: PAID_ON,
        notes:
          "First monthly instalment, invoiced as CFA-HAV-2026-002 and reissued to the board on 17 September. " +
          "Received the evening of 23 September 2026. Instalment 2 remains due 21 October.",
      },
    });
    console.log(`✓ Payment recorded: N${AMOUNT.toLocaleString()} (Zenith Bank, CONFIRMED)`);
  } else {
    console.log(`• Payment with reference ${REFERENCE} already recorded — skipped.`);
  }

  // 3. Roll-up, recomputed from confirmed payments
  const confirmed = await prisma.payment.findMany({
    where: { invoiceId: invoice.id, status: "CONFIRMED" },
  });
  const paid = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(invoice.total);
  const balance = total - paid;
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      paidAmount: paid,
      balanceDue: balance,
      status: balance <= 0 ? "PAID" : "PARTIALLY_PAID",
      paidDate: balance <= 0 ? PAID_ON : null,
    },
  });

  // read-back
  const v = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: { paymentMilestones: { orderBy: { dueDate: "asc" } }, payments: { orderBy: { paymentDate: "asc" } } },
  });
  console.log("\n" + "=".repeat(64));
  console.log(`  ${INVOICE_NUMBER}  ${v?.status}  paid=N${Number(v?.paidAmount).toLocaleString()}  balance=N${Number(v?.balanceDue).toLocaleString()}`);
  for (const m of v?.paymentMilestones ?? []) {
    console.log(`   ${m.dueDate?.toISOString().slice(0, 10)}  ${m.status.padEnd(8)} N${Number(m.amount).toLocaleString().padStart(10)}  ${m.name}`);
  }
  for (const p of v?.payments ?? []) {
    console.log(`   PMT ${p.paymentDate.toISOString().slice(0, 10)}  ${p.status.padEnd(9)} N${Number(p.amount).toLocaleString().padStart(10)}  ${p.reference}`);
  }
  console.log("=".repeat(64));
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
