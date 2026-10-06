/**
 * Seed the daily and shift tasks from lib/haven-playbook.ts.
 *
 * Without these the today view is empty for everyone, and an empty today view
 * on first contact teaches people the thing is decoration.
 *
 * Raw SQL: this checkout sits on another session's branch and its generated
 * client has no StaffTask model.
 *
 *   npx tsx --env-file=.env.local scripts/seed-haven-tasks.ts --apply
 */
import { randomBytes } from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const cuid = () => "c" + randomBytes(12).toString("hex");

type T = [code: string, title: string, roles: string, cadence: string, grace: number, level: string, escalatesTo: string, evidence: string, why: string];

const TASKS: T[] = [
  ["n-handover","Record the handover at the end of your shift","Registered nurse, Medical officer","EVERY_SHIFT",2,"NUDGE","Senior Registered Nurse",
   "A handover record for the shift, with a name and a time","Handover is where most hospital harm is prevented or created."],
  ["n-drugchart","Sign the drug chart as you give the dose","Registered nurse","EVERY_SHIFT",4,"NUDGE","Senior Registered Nurse",
   "Administration entries timed at or near the dose","The next nurse has to be able to trust the chart."],
  ["n-crashtrolley","Check the crash trolley and sign it","Registered nurse","DAILY",12,"FLAG","Senior Registered Nurse, then the Chief Medical Director",
   "A dated, named check for each calendar day","The one check where a gap is never a paperwork question."],
  ["sn-huddle","Run the morning huddle","Senior Registered Nurse","DAILY",3,"NUDGE","Head of Admin and Operations",
   "Huddle logged with the day's discharge list","A hospital that decides at nine has the bed by noon."],
  ["mo-notes","Document the ward round today","Medical officer","DAILY",24,"NUDGE","Chief Medical Director",
   "A note per patient per round day","The record is clinical, legal, and the evidence behind every claim."],
  ["mo-discharge","Complete discharge summaries on the day","Medical officer","DAILY",24,"NUDGE","Chief Medical Director",
   "Summary dated the same day as the discharge","A summary written three days later is the commonest reason a claim is queried."],
  ["fd-registration","Complete payer details before the encounter","Front desk, Admin and Billing Officer","EVERY_SHIFT",8,"NUDGE","Head of Customer Service",
   "No encounter against an incomplete payer record","Incomplete details at the desk become a refused claim six weeks later."],
  ["bill-capture","Capture and bill yesterday's activity","Admin and Billing Officer","DAILY",24,"FLAG","Head of Finance",
   "Unbilled items older than one working day","Four tariff lines in five carry no price. Capture is the other half of fixing that."],
  ["ops-flags","Clear the overnight flag queue","Head of Admin and Operations","DAILY",24,"ESCALATE","Chief Medical Director",
   "No flag older than a working day without an owner","A flag nobody picks up teaches everyone that flags are decoration."],
  ["ph-fastmovers","Count the fast movers against the reorder point","Pharmacy","WEEKLY",48,"FLAG","Head of Admin and Operations",
   "A dated count covering the agreed fast mover list","A stockout in a children's hospital is a clinical event first."],
];

async function main() {
  const c = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = 'Haven Paediatric Centre' LIMIT 1`;
  const clientId = c[0].id;

  for (const [code, title, roles, cadence, grace, level, esc, evidence, why] of TASKS) {
    if (!APPLY) continue;
    await prisma.$executeRaw`
      INSERT INTO "StaffTask" ("id","clientId","code","title","roles","departments","cadence","evidence","why","graceHours","flagLevel","escalatesTo","isActive","sortOrder","createdAt","updatedAt")
      VALUES (${cuid()}, ${clientId}, ${code}, ${title}, ${roles.split(", ")}, ARRAY[]::text[],
              ${Prisma.raw(`'${cadence}'::"StaffTaskCadence"`)}, ${evidence}, ${why}, ${grace},
              ${Prisma.raw(`'${level}'::"FlagLevel"`)}, ${esc}, true, 0, NOW(), NOW())
      ON CONFLICT ("clientId","code") DO UPDATE SET
        "title"=EXCLUDED."title","roles"=EXCLUDED."roles","cadence"=EXCLUDED."cadence",
        "evidence"=EXCLUDED."evidence","why"=EXCLUDED."why","graceHours"=EXCLUDED."graceHours",
        "flagLevel"=EXCLUDED."flagLevel","escalatesTo"=EXCLUDED."escalatesTo","updatedAt"=NOW()`;
  }

  if (!APPLY) { console.log(`  DRY RUN. ${TASKS.length} tasks ready.`); return; }
  const n = await prisma.$queryRaw<{ cadence: string; n: bigint }[]>`
    SELECT "cadence"::text AS cadence, COUNT(*)::bigint AS n FROM "StaffTask" WHERE "clientId" = ${clientId} GROUP BY 1`;
  console.log(`  ${TASKS.length} tasks seeded.`);
  for (const r of n) console.log(`   ${r.cadence}: ${r.n}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
