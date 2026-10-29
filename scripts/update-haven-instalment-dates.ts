/**
 * Rebase the Haven instalment due dates to match the reissued invoice
 * CFA-HAV-2026-002 sent to the board on 17 September 2026.
 *
 *   Instalment 2 of 3: 23 Sep 2026 -> 21 Oct 2026
 *   Instalment 3 of 3: 22 Oct 2026 -> 18 Nov 2026
 *
 * Instalment 1 keeps its 25 August due date so the ageing of the debt stays
 * honest internally, even though the client was told "due on receipt".
 *
 *   npx tsx --env-file=.env.local scripts/update-haven-instalment-dates.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CHANGES: [string, Date][] = [
  ["Monthly instalment 2 of 3", new Date("2026-10-21")],
  ["Monthly instalment 3 of 3", new Date("2026-11-18")],
];

async function main() {
  const invoice = await prisma.invoice.findUnique({ where: { invoiceNumber: "CFA-HAV-2026-001" } });
  if (!invoice) throw new Error("Invoice CFA-HAV-2026-001 not found.");

  for (const [name, dueDate] of CHANGES) {
    const m = await prisma.paymentMilestone.findFirst({ where: { invoiceId: invoice.id, name } });
    if (!m) { console.warn(`! milestone "${name}" not found`); continue; }
    await prisma.paymentMilestone.update({ where: { id: m.id }, data: { dueDate } });
    console.log(`✓ "${name}"  ${m.dueDate?.toISOString().slice(0, 10)} -> ${dueDate.toISOString().slice(0, 10)}`);
  }

  const after = await prisma.paymentMilestone.findMany({
    where: { invoiceId: invoice.id }, orderBy: { dueDate: "asc" },
  });
  console.log("\nSchedule now:");
  for (const m of after) console.log(`  ${m.dueDate?.toISOString().slice(0, 10)}  ${m.status.padEnd(8)}  ${m.name}`);
}

main().finally(() => prisma.$disconnect());
