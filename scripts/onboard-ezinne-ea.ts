/**
 * Onboard the Executive Assistant onto the office surfaces.
 *
 *   npx tsx --env-file=.env.local scripts/onboard-ezinne-ea.ts
 *
 * The account itself is created by scripts/invite-office-staff.ts. This script
 * does the three things that have to happen after it, and it is idempotent, so
 * it can be re-run safely.
 *
 * 1. Moves the monthly evaluation of the Administrative Assistant onto the EA.
 *    Its own brief says it sits with the Founding Partner "only until the
 *    Executive Assistant hire lands, at which point it moves to her".
 * 2. Makes the EA the assigner on the four recurring items Abigail carries, so
 *    that from the next cycle her work is reviewed by the EA rather than by the
 *    Founding Partner. The assigner is the reviewer, which is the whole point.
 *    Tasks already generated are deliberately left alone: she should not be
 *    reviewing work she did not brief.
 * 3. Raises her first-week tasks, each with a brief and a definition of done,
 *    because the office cannot ask that of her and not do it for her.
 *
 * Due dates are counted in working days from her start date, which is Friday
 * 2 October 2026. Pass a different ISO date as argv[1] to shift the whole week,
 * and add --redate to move the dates on tasks that already exist and are still
 * ASSIGNED, which is what a change of start date actually needs.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EA_EMAIL = "ogeriorji845@gmail.com";
const PARTNER_EMAIL = "debo.odulana@consultforafrica.com";
const AA_EMAIL = "abigail.ayomide04@gmail.com";

/**
 * Working-day offsets from the start date, so a start late in the week does not
 * land half of somebody's first week on a Saturday. Offset 0 is the start date
 * itself, and each step after it skips the weekend.
 */
function day(start: Date, offset: number, hour = 17): Date {
  const d = new Date(start);
  let moved = 0;
  while (moved < offset) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) moved += 1;
  }
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

type Seed = {
  title: string;
  brief: string;
  definitionOfDone: string;
  dueOffset: number;
  checkInOffset?: number;
  estimatedMinutes: number;
  workedExample?: string;
};

/**
 * Seeds are matched by title, so renaming one creates a second task and leaves
 * the first orphaned on her desk. Retiring the old title here removes it, and
 * only while it is untouched: once somebody has worked on a task it is theirs
 * and gets left alone, duplicate or not, for a human to resolve.
 */
const RETIRED_TITLES = [
  // Superseded 2 Oct when Debo narrowed Arabella to the diagnostic audit, by
  // "The audit scope in writing, and the two documents we need from Dr Chito".
  "The three things we need from Dr Chito",
];

const FIRST_WEEK: Seed[] = [
  {
    title: "Read the onboarding pack, then sit with me on Arabella and Medbury",
    brief:
      "The pack in docs/office carries the firm, the office, the platform and every live piece of work, with Abuja in the most detail. It exists so that you are not inferring the shape of this place for a month. The two files that carry the most risk between now and Christmas are Arabella and the Medbury division, and I want to go through both with you once you have read Part Four rather than before.",
    definitionOfDone:
      "You have read Parts One to Four, the session with me has happened, and anything in the pack that is wrong or out of date has been written down so it gets corrected rather than worked around.",
    dueOffset: 1,
    checkInOffset: 0,
    estimatedMinutes: 240,
  },
  {
    title: "Dr Chito's contact details, and the Arabella link sent",
    brief:
      "Arabella is the largest thing starting this month, and the diagnostic audit is the gate to a management contract that has been proposed and not yet agreed. Everything the client needs for the audit sits on one unindexed page at consultforafrica.com/ArabellaProject, which is live and verified in production and has never been sent, because her email address is not recorded anywhere in our systems. Debo has her details, so ask him directly rather than hunting for them. Our team is on her site today, so this is already late.",
    definitionOfDone:
      "Dr Chito Nwana's email and phone are on the client record, the link has gone to her and to Tolu her Chief of Staff, and the send is logged in Communications with a next action against it.",
    dueOffset: 0,
    estimatedMinutes: 60,
  },
  {
    title: "The audit scope in writing, and the two documents we need from Dr Chito",
    brief:
      "We are doing the diagnostic audit at Arabella and nothing else, but the proposals Dr Chito already holds describe a full two month foundation phase including marketing, public relations, a records system with staff training, an insurance successor programme, a secondment and a dashboard. She will reasonably expect what she has read, and nobody has written down that the scope is narrower, so the largest risk on this file is the gap between the two rather than delivery. Alongside closing that, the audit needs two documents from her that are evidence rather than paperwork: the Arabella certificate of incorporation with its RC number, which is where the succession question starts, and the list of health insurance panels Tabitha currently holds with tariff rates where available, which is how the payer and receivables picture gets built. The signed introduction letter in the proposals belongs to the unsold phase, so do not chase it.",
    definitionOfDone:
      "The in scope list is confirmed with Debo and has gone to Dr Chito as a short written note, so the audit scope is agreed on both sides rather than inferred from an older proposal. Both documents are either received and filed against the engagement, or each has a named person and a promised date on the commitment register.",
    dueOffset: 4,
    checkInOffset: 2,
    estimatedMinutes: 120,
  },
  {
    title: "Rebuild the commitment register from July onward",
    brief:
      "The commitments register and the decisions register were both built for this office and neither has ever been used, so every promise made in a meeting since July exists only in somebody's memory. Four of the five standing rhythm items depend on a register that currently has nothing in it, which is why the Thursday sweep has nowhere to put the things it finds. Work from the meeting records, the sent mail and the message threads.",
    definitionOfDone:
      "Every open promise since July is on the register with who owes it, who it is owed to, a due date where one exists and a next chase date. Anything owed by us that nobody is holding has been raised as a task. Anything that needs the Founding Partner is on the decisions register with options and your recommendation.",
    dueOffset: 3,
    checkInOffset: 1,
    estimatedMinutes: 300,
  },
  {
    title: "Chase the three overdue balances and record a promised date for each",
    brief:
      "Four client balances are outstanding on the Invoices surface and three of them are already past their due date. Read the figures there rather than from any document, because that is the only place they are current. A chase is not finished because a call happened, it is finished when there is a date the client actually promised, because a promise with a date can be chased against and a note saying you called cannot. Before chasing Aman, check the engagement figure against the signed commercial, because the two do not obviously reconcile.",
    definitionOfDone:
      "Each of the three has a promised payment date recorded on the commitment register with the name of the person who gave it. Anything disputed is escalated to me rather than chased again. The Aman reconciliation question has an answer.",
    dueOffset: 2,
    checkInOffset: 1,
    estimatedMinutes: 150,
  },
  {
    title: "Clear the review backlog, then take the Monday pack",
    brief:
      "Two of Abigail's tasks have been sitting submitted and unreviewed since mid September and the Monday partner meeting pack has generated three times without being completed. I do not want it closed quietly. Go through it with me, because the point of the chain is that the review happens, and from the next cycle the recurring items come to you for review rather than to me.",
    definitionOfDone:
      "The submitted work has been reviewed, with either an approval or a written note under changes requested. The reason the Monday pack kept failing is written down in one paragraph. The pack for the coming Monday went out on the Friday evening before it.",
    dueOffset: 4,
    checkInOffset: 2,
    estimatedMinutes: 180,
  },
  {
    title: "Get the missing engagements onto the platform",
    brief:
      "Two of our largest commercial arrangements are invisible to the invoice run because they have no engagement record. The Medbury division deal closed on 21 September with a setup fee in four tranches, a monthly support fee from month six and a share of collected net revenue. House of Refuge runs a monthly management retainer and a fundraising mandate charged as a share of funds raised. The figures are in the memorandum and in the engagement records. A retainer that the invoice run cannot see is a retainer that quietly goes unbilled.",
    definitionOfDone:
      "Both Medbury and both House of Refuge strands exist as engagements with the right fee structure, start date and payment schedule, so the run on the 1st picks them up. Where a start date is not yet settled, it is on the decisions register rather than guessed.",
    dueOffset: 4,
    checkInOffset: 2,
    estimatedMinutes: 120,
  },
];

async function main() {
  const args = process.argv.slice(2);
  const redate = args.includes("--redate");
  const startArg = args.find((a) => !a.startsWith("--"));
  const start = new Date(`${startArg ?? "2026-10-02"}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new Error(`Bad start date: ${startArg}`);
  if (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
    throw new Error(`${start.toISOString().slice(0, 10)} is a weekend. Give a working day as the start date.`);
  }
  console.log(`start ${start.toISOString().slice(0, 10)}, working-day offsets${redate ? ", re-dating existing ASSIGNED tasks" : ""}`);

  const [ea, partner, aa] = await Promise.all([
    prisma.user.findUnique({ where: { email: EA_EMAIL }, select: { id: true, name: true, role: true } }),
    prisma.user.findUnique({ where: { email: PARTNER_EMAIL }, select: { id: true, name: true } }),
    prisma.user.findUnique({ where: { email: AA_EMAIL }, select: { id: true, name: true } }),
  ]);
  if (!ea) throw new Error(`No account for ${EA_EMAIL}. Run scripts/invite-office-staff.ts first.`);
  if (ea.role !== "EXECUTIVE_ASSISTANT" && ea.role !== "ADMIN") throw new Error(`${EA_EMAIL} is ${ea.role}, not EXECUTIVE_ASSISTANT or ADMIN.`);
  if (!partner) throw new Error(`No account for ${PARTNER_EMAIL}.`);
  if (!aa) throw new Error(`No account for ${AA_EMAIL}.`);

  // 1. The monthly evaluation moves to her, as its own brief says it should.
  const evaluation = await prisma.recurringTask.findFirst({
    where: { title: { contains: "Monthly evaluation" } },
    select: { id: true, title: true, assigneeId: true },
  });
  if (evaluation && evaluation.assigneeId !== ea.id) {
    await prisma.recurringTask.update({ where: { id: evaluation.id }, data: { assigneeId: ea.id } });
    console.log(`moved "${evaluation.title}" to ${ea.name}`);
  } else {
    console.log(`"Monthly evaluation" already sits with ${ea.name}`);
  }

  // 2. She becomes the reviewer on everything Abigail carries on a cadence.
  const moved = await prisma.recurringTask.updateMany({
    where: { assigneeId: aa.id, assignerId: { not: ea.id } },
    data: { assignerId: ea.id },
  });
  console.log(`${moved.count} recurring item(s) now reviewed by ${ea.name} rather than ${partner.name}`);

  // 3. Retire any seed title that has since been renamed, before seeding, so a
  //    rename does not leave two tasks saying overlapping things.
  const retired = await prisma.task.deleteMany({
    where: { assigneeId: ea.id, title: { in: RETIRED_TITLES }, status: "ASSIGNED" },
  });
  if (retired.count) console.log(`${retired.count} superseded task(s) removed`);

  // 4. Her first week, raised to the standard the office asks of everybody else.
  let created = 0;
  let reconciled = 0;
  for (const seed of FIRST_WEEK) {
    const existing = await prisma.task.findFirst({
      where: { title: seed.title, assigneeId: ea.id },
      select: { id: true, status: true },
    });
    // Re-running reconciles the wording rather than skipping, so an edit to a
    // brief here reaches a task that is already on her desk. Dates are only
    // moved on --redate, and only while a task is still ASSIGNED, because once
    // she is working on something the date may be hers rather than ours.
    if (existing) {
      if (existing.status === "ASSIGNED") {
        await prisma.task.update({
          where: { id: existing.id },
          data: {
            brief: seed.brief,
            definitionOfDone: seed.definitionOfDone,
            estimatedMinutes: seed.estimatedMinutes,
            ...(redate
              ? {
                  dueDate: day(start, seed.dueOffset),
                  checkInAt: seed.checkInOffset === undefined ? null : day(start, seed.checkInOffset, 12),
                }
              : {}),
          },
        });
        reconciled += 1;
      }
      continue;
    }
    await prisma.task.create({
      data: {
        title: seed.title,
        brief: seed.brief,
        definitionOfDone: seed.definitionOfDone,
        assigneeId: ea.id,
        assignerId: partner.id,
        dueDate: day(start, seed.dueOffset),
        checkInAt: seed.checkInOffset === undefined ? null : day(start, seed.checkInOffset, 12),
        estimatedMinutes: seed.estimatedMinutes,
        workedExample: seed.workedExample ?? null,
      },
    });
    created += 1;
  }
  console.log(`${created} first-week task(s) created, ${reconciled} reconciled, ${FIRST_WEEK.length - created - reconciled} left as they are`);

  const open = await prisma.task.count({ where: { assigneeId: ea.id, status: { notIn: ["DONE", "CANCELLED"] } } });
  console.log(`${ea.name} now has ${open} open task(s) on her desk.`);
}

main()
  .catch((err) => {
    console.error(String(err instanceof Error ? err.message : err));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
