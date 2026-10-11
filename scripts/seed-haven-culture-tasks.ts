/**
 * The culture tasks.
 *
 * The ten tasks already seeded are operational: handover, drug chart, crash
 * trolley, billing. All necessary and none of them is the transformation. The
 * cultural outcome asks that people know the goal, have what they need, can
 * see how it is going and say so when something is wrong, and nothing on the
 * page asked anybody to do any of that.
 *
 * Three rules these were written against.
 *
 * Every one is a BEHAVIOUR, not a sentiment. "Tell us about a near miss or say
 * there was nothing" is a thing a person does. "Care about safety" is not, and
 * a hospital can tell the difference immediately.
 *
 * Every one is NUDGE and never FLAG or ESCALATE. Chasing somebody for not
 * recognising a colleague, or escalating because they did not speak to their
 * buddy, would be grotesque and would poison the operational flags with it.
 * These are prompts. The system asks and does not insist.
 *
 * "Nothing this week" counts as doing it. A weekly prompt that can only be
 * satisfied by producing an incident teaches people to manufacture one, and
 * the habit we want is answering, not reporting.
 *
 *   npx tsx --env-file=.env.local scripts/seed-haven-culture-tasks.ts --apply
 */
import { randomBytes } from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const cuid = () => "c" + randomBytes(12).toString("hex");

type T = [code: string, title: string, roles: string, cadence: string, order: number, evidence: string, why: string];

const TASKS: T[] = [
  ["c-nearmiss",
   "Tell us about a near miss, or say there was nothing this week",
   "", "WEEKLY", 20,
   "A submission either way, including a nil return",
   "A near miss is the cheapest lesson a hospital gets. Saying there was nothing counts: the habit is answering, not reporting."],

  ["c-timewaster",
   "Name one thing that wasted your time this week",
   "", "WEEKLY", 21,
   "One line on the staff page",
   "You know where this hospital leaks time better than anybody who arrives with a clipboard. This is the list we work through."],

  ["c-buddy",
   "Fifteen minutes with your buddy, on shift",
   "", "WEEKLY", 22,
   "Both of you mark it",
   "On shift rather than after it. A buddy system that asks people to stay late is one that quietly ends in month two."],

  ["c-teach",
   "Show one colleague one thing you know how to do",
   "", "WEEKLY", 23,
   "Who you showed, and what",
   "A practice that arrives from someone under the same constraints is believed in a way an outside expert is not. It also spreads capability instead of concentrating it."],

  ["c-standard",
   "Read one standard for your area",
   "Registered nurse, Medical officer, Pharmacy, Medical Lab Scientist", "WEEKLY", 24,
   "Which one you read",
   "The audit found the procedures exist and almost nobody has been trained on them. Ten minutes a week closes that faster than any course."],

  ["c-recognise",
   "Name one person who did something well, out loud, in front of others",
   "Senior Registered Nurse, Head of Admin, Head of Customer Service, Head of Finance, Chief Medical Director", "WEEKLY", 25,
   "Who, and what they did",
   "Costs nothing, is the strongest protection the staff survey result has, and no competitor can match it by paying more."],

  ["c-worry",
   "At handover, say the one thing you are worried about",
   "Registered nurse, Medical officer", "EVERY_SHIFT", 26,
   "Recorded in the handover",
   "The thing somebody is uneasy about and does not mention is the thing that goes wrong at four in the morning."],
];

async function main() {
  const c = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = 'Haven Paediatric Centre' LIMIT 1`;
  const clientId = c[0].id;

  for (const [code, title, roles, cadence, order, evidence, why] of TASKS) {
    console.log(`  ${cadence.padEnd(12)} ${title}`);
    if (!APPLY) continue;
    await prisma.$executeRaw`
      INSERT INTO "StaffTask" ("id","clientId","code","title","roles","departments","cadence","evidence","why","graceHours","flagLevel","escalatesTo","isActive","sortOrder","createdAt","updatedAt")
      VALUES (${cuid()}, ${clientId}, ${code}, ${title},
              ${roles ? roles.split(", ") : []}, ARRAY[]::text[],
              ${Prisma.raw(`'${cadence}'::"StaffTaskCadence"`)}, ${evidence}, ${why},
              ${cadence === "WEEKLY" ? 72 : 24},
              ${Prisma.raw(`'NUDGE'::"FlagLevel"`)}, NULL, true, ${order}, NOW(), NOW())
      ON CONFLICT ("clientId","code") DO UPDATE SET
        "title"=EXCLUDED."title","roles"=EXCLUDED."roles","cadence"=EXCLUDED."cadence",
        "evidence"=EXCLUDED."evidence","why"=EXCLUDED."why","graceHours"=EXCLUDED."graceHours",
        "flagLevel"=EXCLUDED."flagLevel","sortOrder"=EXCLUDED."sortOrder","updatedAt"=NOW()`;
  }

  if (!APPLY) { console.log(`\n  DRY RUN. ${TASKS.length} culture tasks ready.\n`); return; }
  const n = await prisma.$queryRaw<{ cadence: string; n: bigint }[]>`
    SELECT "cadence"::text AS cadence, COUNT(*)::bigint AS n FROM "StaffTask" WHERE "clientId"=${clientId} GROUP BY 1 ORDER BY 1`;
  const lv = await prisma.$queryRaw<{ level: string; n: bigint }[]>`
    SELECT "flagLevel"::text AS level, COUNT(*)::bigint AS n FROM "StaffTask" WHERE "clientId"=${clientId} GROUP BY 1`;
  console.log(`\n  ${TASKS.length} culture tasks seeded. All tasks now:`);
  for (const r of n) console.log(`    ${r.cadence}: ${r.n}`);
  console.log(`  by flag level: ${lv.map((x) => `${x.level}=${x.n}`).join(", ")}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
