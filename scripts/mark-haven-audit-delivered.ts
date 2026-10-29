/**
 * The Operational and Clinical Governance Audit Report went to the board.
 * Confirmed by Debo, 6 October 2026. Until now the platform record showed all
 * five Haven deliverables at DRAFT, so our own file said nothing had been
 * delivered on an engagement that is 46 per cent paid.
 *
 * The date used is the report's own date, 18 August 2026. There are zero
 * Communication records for Haven, so there is no log to take a send date from.
 * That is recorded in the note rather than a precise-looking date being invented.
 *
 * clientVisible is deliberately LEFT FALSE. Portal access is per client, not per
 * contact, so flipping this would put the full audit report, integrity material
 * included, in front of every Haven portal contact the moment anyone's access is
 * turned on. The audit report is board-tier. Section 2 of the town hall deck is
 * how the findings reach anybody else.
 *
 *   npx tsx --env-file=.env.local scripts/mark-haven-audit-delivered.ts
 *   npx tsx --env-file=.env.local scripts/mark-haven-audit-delivered.ts --apply
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const DELIVERED_ON = new Date("2026-08-18");

async function main() {
  const eng = await prisma.engagement.findFirst({
    where: { name: { contains: "Haven" } },
    select: { id: true, name: true },
  });
  if (!eng) throw new Error("Haven engagement not found.");

  const d = await prisma.deliverable.findFirst({
    where: { engagementId: eng.id, name: { contains: "Audit Report" } },
  });
  if (!d) throw new Error("Audit report deliverable not found.");

  console.log(`  ${d.name}`);
  console.log(`  before: status=${d.status} reviewStage=${d.reviewStage} clientVisible=${d.clientVisible}`);

  if (!APPLY) {
    console.log(`\n  would set: status=DELIVERED_TO_CLIENT, submitted and approved ${DELIVERED_ON.toISOString().slice(0, 10)}`);
    console.log("  would NOT touch clientVisible. See the note at the top of this file.");
    console.log("\n  DRY RUN. Re-run with --apply.\n");
    return;
  }

  await prisma.deliverable.update({
    where: { id: d.id },
    data: {
      status: "DELIVERED_TO_CLIENT",
      reviewStage: "APPROVED",
      submittedAt: DELIVERED_ON,
      approvedAt: DELIVERED_ON,
    },
  });

  const after = await prisma.deliverable.findMany({
    where: { engagementId: eng.id },
    orderBy: { dueDate: "asc" },
    select: { name: true, status: true, dueDate: true },
  });
  console.log("\n  Haven deliverables now:");
  for (const x of after) {
    console.log(`    ${x.status.padEnd(20)} due=${x.dueDate?.toISOString().slice(0, 10)}  ${x.name}`);
  }
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
