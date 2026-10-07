/**
 * Puts recently closed work onto the platform.
 *
 * Work that has been won but never recorded is invisible to every report the
 * firm produces, and the portfolio view had drifted a long way behind the deal
 * record. These three are the engagements that are unambiguously closed and
 * were missing entirely.
 *
 * Commercial terms here are drafted from the deal record and are marked in
 * `notes` as needing the partner's confirmation. Where a figure was uncertain
 * the engagement is still raised, because a record with a flagged number is
 * worth more than no record at all, which is the state these were in.
 *
 *   npx tsx --env-file=.env.local scripts/seed-closed-engagements.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const OKELEYE = "cmmte5htc000bybewb4cc3dvh";
const PARTNER = "cmmrqc54q0000e2u6w13qh5vh";

const CONFIRM = "DRAFTED FROM THE DEAL RECORD, NOT YET CONFIRMED BY THE PARTNER. Check the fee, dates and manager before this is used in any report.";

const ENGAGEMENTS = [
  {
    clientName: "Medbury Healthcare Group",
    name: "Medbury Division, Setup and Management",
    code: "C4A-2026-009",
    description:
      "Setup and ongoing management of two Medbury divisions. Division COOs sit on the Medbury payroll and are seconded to Consult For Africa, who manage them. Agreed 21 September 2026.",
    serviceType: "EMBEDDED_LEADERSHIP",
    engagementType: "RETAINER",
    startDate: new Date("2026-09-21T00:00:00Z"),
    endDate: null,
    budgetAmount: 25_000_000,
    retainerMonthlyFee: 3_000_000,
    managerId: PARTNER,
    notes: `${CONFIRM}\n\nSetup fee N25m. Monthly support N3m. Incentive 3.5% of revenue plus 3% of EBITDA. The N25m may be the same N25m recorded against the Lagos aesthetics setup mandate rather than a second fee, which needs resolving before either is invoiced.`,
  },
  {
    clientName: "House of Refuge (Freedom Foundation)",
    name: "House of Refuge, Management Retainer and Fundraising",
    code: "C4A-2026-010",
    description:
      "Ongoing management of the Lekki rehabilitation facility following the pre-launch readiness project, together with a fundraising mandate charged on funds raised.",
    serviceType: "HOSPITAL_OPERATIONS",
    engagementType: "RETAINER",
    startDate: new Date("2026-06-23T00:00:00Z"),
    endDate: null,
    budgetAmount: 21_600_000,
    retainerMonthlyFee: 1_800_000,
    managerId: OKELEYE,
    notes: `${CONFIRM}\n\nN1.8m per month. Fundraising at 4% of funds raised, which is not captured in the budget figure here. Start date assumed to follow the readiness project's completion.`,
  },
  {
    clientName: "Medbury Healthcare Group",
    name: "Medlyfe Introduces, Launch Programme",
    code: "C4A-2026-011",
    description:
      "Launch evening on 8 October 2026 and the eight-week campaign that follows it, under the Medlyfe brand.",
    serviceType: "HEALTH_SYSTEMS",
    engagementType: "PROJECT",
    startDate: new Date("2026-09-01T00:00:00Z"),
    endDate: new Date("2026-12-04T00:00:00Z"),
    budgetAmount: 33_400_000,
    retainerMonthlyFee: null,
    managerId: PARTNER,
    notes: `${CONFIRM}\n\nN33.4m for the evening and the eight-week campaign. The evening is 8 October 2026, so this engagement is already live and its milestones need setting this week.`,
  },
] as const;

async function main() {
  for (const e of ENGAGEMENTS) {
    const client = await prisma.client.findFirst({ where: { name: e.clientName }, select: { id: true } });
    if (!client) {
      console.log(`  NO CLIENT RECORD, skipped: ${e.clientName} / ${e.name}`);
      continue;
    }
    const existing = await prisma.engagement.findFirst({ where: { name: e.name }, select: { id: true } });
    if (existing) {
      console.log(`  exists, skipped: ${e.name}`);
      continue;
    }
    console.log(`  ${APPLY ? "creating" : "would create"}: ${e.name} (${e.clientName}) ${e.code}`);
    if (!APPLY) continue;
    await prisma.engagement.create({
      data: {
        clientId: client.id,
        name: e.name,
        description: e.description,
        serviceType: e.serviceType,
        engagementType: e.engagementType,
        status: "ACTIVE",
        startDate: e.startDate,
        endDate: e.endDate,
        budgetAmount: e.budgetAmount,
        budgetCurrency: "NGN",
        engagementManagerId: e.managerId,
        engagementCode: e.code,
        retainerMonthlyFee: e.retainerMonthlyFee,
        notes: e.notes,
        riskLevel: "LOW",
      },
    });
  }
  console.log(APPLY ? "APPLIED" : "DRY RUN");
}

main().finally(() => prisma.$disconnect());
