/**
 * Move the Aman HMO signing team onto the signing desk (/sprints/aman).
 *
 * Puts one task on each person's desk, in the house task format: why it
 * matters, what done looks like, a check-in, and a worked example for anything
 * new. Matthew assigns the team's tasks and reviews them; Debo assigns
 * Matthew's. Run after scripts/seed-aman-sprint.ts has loaded the sprint.
 *
 * Idempotent: a task already there is updated in place unless it is done.
 *
 *   npx tsx --env-file=.env.local scripts/onboard-aman-signing-desk.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/onboard-aman-signing-desk.ts --apply  # write
 */
import { prisma } from "@/lib/prisma";

const MATTHEW = "cmmrqc6uf0001e2u69j8ejht6";
const GIDADO = "cmmuyd8nz000a5av986ac7my3";
const RUTH = "cmvtv7zyp0000q49re8gtrxfo";
const FAVOUR = "cmvtv7u0w0000grgh0n7ov1dc";
const DEBO = "cmmrqc54q0000e2u6w13qh5vh";
const EXPECT: Record<string, string> = {
  [MATTHEW]: "matthew.aloba@consultforafrica.com",
  [GIDADO]: "gidadosulaiman2@gmail.com",
  [RUTH]: "ruthpelumi04@gmail.com",
  [FAVOUR]: "soromidayo101@gmail.com",
};
const DESK = "https://www.consultforafrica.com/sprints/aman";
const lagos = (d: string, hh = 17) => new Date(`${d}T${String(hh).padStart(2, "0")}:00:00+01:00`);

type T = { assigneeId: string; assignerId: string; title: string; brief: string; definitionOfDone: string; dueDate: Date; checkInAt: Date | null; estimatedMinutes: number; workedExample: string | null };

const callerTask = (id: string, name: string, area: string, count: number): T => ({
  assigneeId: id,
  assignerId: MATTHEW,
  title: "Move onto the signing desk: log 20 contacts there",
  brief:
    `The Aman sprint now runs on the platform, at Sprints in your menu (${DESK}). Your list is loaded: ${count} providers in ${area}, hospitals and clinics first. Favour checked them against Aman's signed list, so none of them has signed, and any earlier Aman contact reached the front desk only.\n\n` +
    "Open My queue and work down it. It shows what is due first, then fresh providers. Tap a provider to call or WhatsApp them, then tap what happened. The desk moves the provider to the right stage and sets the next step, including every step of the SLA chase in the brief, so you no longer track dates yourself.\n\n" +
    "Every time you log a contact, the desk asks what the provider said, in their own words. Write it down even when it has nothing to do with Aman, such as HMOs owing them money, staff shortages or problems with records. That is how the firm learns what these hospitals need.\n\n" +
    "From Thursday the desk is the record for your list. The spreadsheet is not.",
  definitionOfDone:
    "20 providers from your queue contacted and logged on the desk, each with an outcome. For every provider where you reached a person: the signatory's name and number saved under Who signs, and what they said in their own words. The SLA sent the same day to every provider who was interested, logged as SLA sent. Your 5pm check-ins on Thursday and Friday copied from the check-in box at the bottom of My queue. Any provider from your own earlier pipeline that is not on the desk added with Add a provider, logged at its real stage and date.",
  dueDate: lagos("2026-11-13"),
  checkInAt: lagos("2026-11-12", 12),
  estimatedMinutes: 300,
  workedExample:
    "Mother and Child Hospital, Ikeja. How: Call. What happened: Front desk only. Who you spoke to: Mrs Bello, HMO desk. What did they say: \"The MD handles all HMO agreements and he is in on Thursdays. Two HMOs still owe us from last year.\" Did they mention: HMOs pay late. Who signs: Dr Okafor, MD, 0803 000 0000. The desk then sets the next step itself: call the signatory by name, tomorrow.",
});

const TASKS: T[] = [
  callerTask(RUTH, "Ruth", "Island and Lekki", 120),
  callerTask(FAVOUR, "Favour", "Mainland north", 119),
  {
    assigneeId: GIDADO,
    assignerId: MATTHEW,
    title: "Move the sprint's live pipeline onto the signing desk, and set up the hospital page",
    brief:
      `The signing desk (${DESK}) holds the 358 warm providers, split between Ruth, Favour and you: 119 in Mainland west are yours. It does not yet hold the work done since 2 November: Esther's pipeline, the SLAs that are out, and anything signed in the sprint. Until those are on it, the board under-counts and those chases do not run.\n\n` +
      "As runner you can see everyone's queue, reassign a provider, park one, and take the escalations: any SLA still unsigned on working day 8 lands in With the runner on the Board.",
    definitionOfDone:
      "Every provider in the shared tracker that is not on the desk is added with Add a provider, on its owner's list, and logged at its real stage: SLA sent with the date it went out, Signed with the date it was signed. Signed in the sprint on the Board matches the shared tracker. A comment here with the number of rows moved, the number signed in the sprint, and the number of SLAs out. If more than 40 rows need moving, send the sheet to Debo as a file instead and they will be imported in one go. From Friday the 6pm roll-up is copied from the bottom of the Board. In Settings: the agreement uploaded, Aman's documents checklist and the why-join lines entered, and each of the three emails sent to yourself as a test, once Matthew has confirmed the wording with Aman. Switch on automatic emails only after that.",
    dueDate: lagos("2026-11-12"),
    checkInAt: null,
    estimatedMinutes: 240,
    workedExample:
      "Grace Clinic, Alimosho, SLA sent on 5 November, owner Favour. Add a provider: name Grace Clinic, LGA Alimosho, type Clinic, came from Esther pipeline, on Favour's list. Then on its page log Call, SLA sent, Sent on 5 Nov. The desk puts it on day 5 of the chase: Call the MD and ask what is stopping them.",
  },
  {
    assigneeId: GIDADO,
    assignerId: MATTHEW,
    title: "Run the signing desk every working day until 30 November",
    brief:
      "The desk does the counting. Your job is to keep it honest and keep providers moving: overdue follow-ups chased the same day, escalations decided within a working day, and no provider on two lists.",
    definitionOfDone:
      "Every working day: the Board checked at the 8:45 stand-up. Every provider under With the runner either handled (Handled: chase again, with what you decided) or parked with a reason, within one working day. Follow-ups overdue below 10 at 5pm. The 6pm roll-up posted from the Board. On Friday 27 November, a comment here with the total signed, the three stages where providers dropped out most, and what the Board's What providers are saying shows.",
    dueDate: lagos("2026-11-30"),
    checkInAt: lagos("2026-11-18", 12),
    estimatedMinutes: 600,
    workedExample: null,
  },
  {
    assigneeId: MATTHEW,
    assignerId: DEBO,
    title: "Run the Aman sprint from the signing desk board",
    brief:
      `The sprint now runs on the platform (${DESK}). The Board shows the total against 300, each week against its target, each person's day, where providers stop, what has escalated, and what providers are saying in their own words. The 6pm roll-up is written from it. You are the lead: anything Gidado escalates comes to you.\n\n` +
      "One number needs checking. The brief starts from 150 signed before the sprint, but Favour's list of Aman's signed providers has 120. The Board's total uses 150 until Aman confirms the real figure.",
    definitionOfDone:
      "The Board reviewed at the stand-up on Thursday and Friday. Aman's real count of providers signed before the sprint confirmed, and a comment here with it, so the total can be corrected. The Monday 16 November weekly plan made from the Board: each person's target, the stage where providers drop out, and the groups you are working. A comment here with week 2 signed against 40 and the three objections heard most, from What providers are saying.",
    dueDate: lagos("2026-11-16", 12),
    checkInAt: lagos("2026-11-13", 12),
    estimatedMinutes: 120,
    workedExample: null,
  },
];

async function main() {
  const apply = process.argv.includes("--apply");
  const host = new URL((process.env.DATABASE_URL ?? "").replace(/^postgres(ql)?:/, "http:")).hostname;
  if (!host.endsWith("pooler.supabase.com")) throw new Error(`Refusing: DATABASE_URL host is ${host}, not the production pooler.`);
  for (const [id, email] of Object.entries(EXPECT)) {
    const u = await prisma.user.findUniqueOrThrow({ where: { id } });
    if (u.email !== email) throw new Error(`Wrong user ${id}: ${u.email}`);
  }
  const sprint = await prisma.outreachSprint.findUnique({ where: { slug: "aman" } }).catch(() => null);
  if (!sprint && apply) throw new Error("The sprint is not loaded. Run scripts/seed-aman-sprint.ts --apply first.");

  for (const t of TASKS) {
    const has = await prisma.task.findFirst({ where: { assigneeId: t.assigneeId, title: t.title } });
    if (!has) {
      console.log(` - Task: ${t.title} (${t.assigneeId}, due ${t.dueDate.toISOString().slice(0, 10)})`);
      if (apply) await prisma.task.create({ data: { ...t, linkedEntityType: "SPRINT", linkedEntityId: "aman" } });
      continue;
    }
    if (has.status === "DONE" || has.status === "CANCELLED") continue;
    console.log(` - Update task: ${t.title} (${t.assigneeId})`);
    if (apply) await prisma.task.update({ where: { id: has.id }, data: { linkedEntityType: "SPRINT", linkedEntityId: "aman", brief: t.brief, definitionOfDone: t.definitionOfDone, workedExample: t.workedExample, dueDate: t.dueDate, checkInAt: t.checkInAt, estimatedMinutes: t.estimatedMinutes } });
  }
  if (!apply) return console.log("DRY RUN. Pass --apply to write.");
  const n = await prisma.task.count({ where: { OR: TASKS.map((t) => ({ assigneeId: t.assigneeId, title: t.title })) } });
  if (n < TASKS.length) throw new Error(`Verification failed: ${n} of ${TASKS.length} tasks`);
  console.log(`APPLIED: ${n} tasks on desks`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
