/**
 * The rhythms that keep the platform current.
 *
 * Reporting was never the problem. The dashboard correctly showed three
 * in-house projects a quarter past their end date and thirty-one overdue
 * milestones; what it could not show was the five live engagements carrying no
 * milestones at all, because a project with nothing in it cannot be late.
 * Nobody owned the job of typing into these records, so nobody did it.
 *
 * Three standing jobs fix that, and they sit in Rhythm alongside the invoice
 * run rather than in anyone's head:
 *
 *   The engagement manager posts an update and re-dates or kills the milestones
 *   that have passed. Monday, because a week that starts honest tends to stay
 *   honest.
 *
 *   Abigail puts newly closed clients and projects on the platform. The gap
 *   between winning work and recording it is where the portfolio view dies.
 *
 *   Ezinne sweeps for records that are structurally incomplete, which is the
 *   failure mode no alert catches.
 *
 *   npx tsx --env-file=.env.local scripts/seed-platform-upkeep-rhythms.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const PARTNER = "cmmrqc54q0000e2u6w13qh5vh";   // Dr. Debo Odulana
const OKELEYE = "cmmte5htc000bybewb4cc3dvh";   // Dr Adediwura Okeleye, Director
const ABIGAIL = "cmtx00rvv0000wqbtbp68pe4f";
const EZINNE = "cmupss8n80000ma2h80hrdl50";

const RHYTHMS = [
  {
    title: "Project records, weekly update",
    assigneeId: OKELEYE,
    brief:
      "Every active engagement you manage needs a written update, and every milestone that has passed needs either closing or a new date. A milestone nobody intends to hit should be killed rather than carried; carrying it is what trained everyone here to read the red on the dashboard as decoration. The partner reads the portfolio view without asking you first, so what is in the record is what he believes.",
    definitionOfDone:
      "Each active engagement you manage has an update posted this week. No milestone on them is in the past unless it is marked COMPLETED or SKIPPED. Any deliverable that is finished is off DRAFT.",
    dayOfWeek: 1,
    leadTimeDays: 0,
    estimatedMinutes: 45,
  },
  {
    title: "New clients and projects onto the platform",
    assigneeId: ABIGAIL,
    brief:
      "Work that has been won but not recorded is invisible to every report the firm produces. Check what closed since last week against the platform: the client exists, the engagement exists, it has an engagement manager, a start and end date, a budget and its milestones. Where you cannot get the commercial terms, raise the record anyway and flag what is missing rather than waiting.",
    definitionOfDone:
      "Every client and engagement closed in the last week is on the platform with an engagement manager, dates and a budget, or is listed back to the partner with the specific detail you could not get.",
    dayOfWeek: 3,
    leadTimeDays: 0,
    estimatedMinutes: 30,
  },
  {
    title: "Platform data sweep",
    assigneeId: EZINNE,
    brief:
      "An engagement with no milestones cannot be overdue, so it never appears in any alert and can sit untouched for months. That is how Lyfe Place and Arabella went unnoticed. Go through the active engagements and find the ones that are structurally incomplete rather than merely late: no engagement manager, no end date, no milestones, no deliverables, deliverables with no due date, duplicate milestones.",
    definitionOfDone:
      "A written list of every active engagement missing a manager, an end date, milestones or deliverable due dates, sent to the engagement manager responsible and copied to the partner. Duplicates removed.",
    dayOfWeek: 4,
    leadTimeDays: 0,
    estimatedMinutes: 30,
  },
];

async function main() {
  for (const r of RHYTHMS) {
    const existing = await prisma.recurringTask.findFirst({
      where: { title: r.title, assigneeId: r.assigneeId },
      select: { id: true },
    });
    if (existing) {
      console.log(`  exists, skipped: ${r.title}`);
      continue;
    }
    console.log(`  ${APPLY ? "creating" : "would create"}: ${r.title}`);
    if (!APPLY) continue;
    await prisma.recurringTask.create({
      data: {
        title: r.title,
        brief: r.brief,
        definitionOfDone: r.definitionOfDone,
        assigneeId: r.assigneeId,
        assignerId: PARTNER,
        cadence: "WEEKLY",
        dayOfWeek: r.dayOfWeek,
        leadTimeDays: r.leadTimeDays,
        estimatedMinutes: r.estimatedMinutes,
        active: true,
      },
    });
  }
  console.log(APPLY ? "APPLIED" : "DRY RUN");
}

main().finally(() => prisma.$disconnect());
