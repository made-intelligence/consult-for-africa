/**
 * Put Term 1 of the CFA MBA on the desks of Ezinne Orji and Abigail Oladejo:
 * the Care Coordinator Safety Card this week, C1 Medicine and the Hospital
 * (9 Nov to 18 Dec, exam 7 Jan) and C2 Managing Through Others (9 Nov to
 * 4 Dec). Dr Okeleye assigns and therefore reviews every one, and gets a task
 * for each course's review and exam.
 *
 * The teaching is in docs/office/mba-c1-* and mba-c2-*; the C1 answers are in
 * docs/office/mba-c1-marking-key-cfa (Dr Okeleye only).
 *
 * Idempotent: a task is matched on assignee and title.
 *
 *   npx tsx --env-file=.env.local scripts/onboard-cfa-mba.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/onboard-cfa-mba.ts --apply  # write
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EZINNE = "cmupss8n80000ma2h80hrdl50";
const ABIGAIL = "cmtx00rvv0000wqbtbp68pe4f";
const OKELEYE = "cmmte5htc000bybewb4cc3dvh";
const DEBO = "cmmrqc54q0000e2u6w13qh5vh";

const lagos = (d: string, hh = 17) => new Date(`${d}T${String(hh).padStart(2, "0")}:00:00+01:00`);
const partner = (id: string) => (id === EZINNE ? "Abigail" : "Ezinne");

const C1_WEEKS = [
  { n: 1, friday: "2026-11-13", tuesday: "2026-11-10", subject: "How medical words are built", exercise: "Exercise 1: the medical terms in your last three client notes, broken down and spell-checked." },
  { n: 2, friday: "2026-11-20", tuesday: "2026-11-17", subject: "The body by system I", exercise: "Exercise 2: three conditions in plain English and why each matters to a hospital's business." },
  { n: 3, friday: "2026-11-27", tuesday: "2026-11-24", subject: "The body by system II", exercise: "Exercise 3: each of eight clients in one line: specialty, specialist title, two services." },
  { n: 4, friday: "2026-12-04", tuesday: "2026-12-01", subject: "Who does what, and how they write it down", exercise: "Exercise 4: the discharge summary rewritten in plain English, every abbreviation expanded, the follow-up named." },
  { n: 5, friday: "2026-12-11", tuesday: "2026-12-08", subject: "Tests, scans, theatre and procedures", exercise: "Exercise 5: the theatre list decoded, and what the hospital must have ready for each case." },
  { n: 6, friday: "2026-12-18", tuesday: "2026-12-15", subject: "How a patient moves and how money moves", exercise: "Exercise 6: one client's patient journey with its payment points (Ezinne: Arabella; Abigail: Haven)." },
];

const C2_WEEKS = [
  { n: 1, friday: "2026-11-13", wednesday: "2026-11-11", subject: "The brief", ezinne: "Write and assign three real tasks on the platform: one each to Favour, Ruth and Abigail.", abigail: "Write three real requests: to a Mezo facility, to a doctor's office, and to a colleague." },
  { n: 2, friday: "2026-11-20", wednesday: "2026-11-18", subject: "Who, how much, and breaking work down", ezinne: "Break one large item on your desk into at least three sub-tasks, and assign two more real tasks, one a stretch task.", abigail: "Map every handoff in one Mezo request from start to finish, and mark where a better brief would have saved time." },
  { n: 3, friday: "2026-11-27", wednesday: "2026-11-25", subject: "Check-ins, review and feedback", ezinne: "Review everything waiting on you within one working day; paste two review notes; hold one check-in with each analyst.", abigail: "Write situation, behaviour, impact feedback on two real Mezo interactions, one good and one not. No patient names." },
  { n: 4, friday: "2026-12-04", wednesday: "2026-12-02", subject: "Running a small team's week", ezinne: "Run the full weekly routine for your team: three priorities on Monday, a five-line note on Friday.", abigail: "Run the weekly routine on your Mezo queue: every open request, its next step and its owner." },
];

function traineeTasks(id: string) {
  const isEzinne = id === EZINNE;
  const safety = {
    assigneeId: id,
    assignerId: OKELEYE,
    title: "CFA MBA: read the Care Coordinator Safety Card",
    brief:
      "You coordinate care for Mezo patients. The Safety Card sets out the red flags that mean emergency care before any booking, what to say, what a coordinator never does (diagnose, reassure, advise on medicines), and how patient information is handled. It applies on every Mezo request from today.",
    definitionOfDone:
      "Card read. A comment here confirming you will apply it, and any question about it. Keep a copy beside you on calls.",
    dueDate: lagos("2026-11-06"),
    checkInAt: null,
    estimatedMinutes: 30,
    workedExample: null,
  };
  const c1 = C1_WEEKS.map((w) => ({
    assigneeId: id,
    assignerId: OKELEYE,
    title: `CFA MBA C1 week ${w.n}: ${w.subject}`,
    brief: `Week ${w.n} of C1, Medicine and the Hospital (workbook section ${w.n}, including its Mezo section). Tuesday: read the section, add every term to your glossary sheet, and do the 30-minute pair drill on a call with ${partner(id)}. ${w.exercise} Friday: Test ${w.n}, closed book, 25 minutes. If a term confuses you, ask in a comment here.`,
    definitionOfDone:
      "Pasted or attached here by Friday 5pm: (1) the exercise, (2) your answers to the test, taken closed book, (3) the number of terms now in your glossary sheet. Submit for review.",
    dueDate: lagos(w.friday),
    checkInAt: lagos(w.tuesday, 16),
    estimatedMinutes: 150,
    workedExample:
      "Test 1: 1. chole (bile) + cyst (sac) + ectomy (removal): removal of the gallbladder. 2. ... Glossary: 64 terms. Exercise attached as a one-page document.",
  }));
  const c1Exam = {
    assigneeId: id,
    assignerId: OKELEYE,
    title: "CFA MBA C1 exam: written paper and oral with Dr Okeleye",
    brief:
      "The C1 exam. Written paper, 45 minutes, closed book, then a 20-minute oral: read an unseen clinical letter and explain it, spell ten dictated terms (eight is the floor), explain one client's clinical service in two minutes, and show your glossary. Revise by repeating every weekly test between 21 December and 6 January.",
    definitionOfDone:
      "Glossary sheet shared with Dr Okeleye by 6 January with at least 400 terms. Written paper and oral sat on 7 January. Dr Okeleye records the result here.",
    dueDate: lagos("2027-01-07"),
    checkInAt: lagos("2027-01-04", 12),
    estimatedMinutes: 90,
    workedExample: null,
  };
  const c2 = C2_WEEKS.map((w) => ({
    assigneeId: id,
    assignerId: OKELEYE,
    title: `CFA MBA C2 week ${w.n}: ${w.subject}`,
    brief: `Week ${w.n} of C2, Managing Through Others (workbook section ${w.n}). This course is done on real work, not beside it. This week: ${isEzinne ? w.ezinne : w.abigail}`,
    definitionOfDone:
      "Pasted here by Friday 5pm: the briefs, notes or map the exercise asks for, and your answers to the week's test. Dr Okeleye marks the briefs against the rubric in section 1.6.",
    dueDate: lagos(w.friday),
    checkInAt: lagos(w.wednesday, 12),
    estimatedMinutes: 75,
    workedExample: w.n === 1 ? "The Medbury brief in section 1.5 of the workbook." : null,
  }));
  const c2Practical = {
    assigneeId: id,
    assignerId: OKELEYE,
    title: "CFA MBA C2 practical with Dr Okeleye",
    brief: isEzinne
      ? "Dr Okeleye picks five tasks you assigned during C2 and marks them against the rubric, then a 20-minute conversation in which you brief a task out loud for a scenario you are given."
      : "Dr Okeleye picks five of your Mezo requests and briefs from C2 and marks them against the rubric, then a 20-minute conversation in which you brief a request out loud for a scenario you are given.",
    definitionOfDone: "Practical sat. Pass is an average of 4 on the rubric. Dr Okeleye records the result here.",
    dueDate: lagos("2026-12-04"),
    checkInAt: null,
    estimatedMinutes: 30,
    workedExample: null,
  };
  return [safety, ...c1, c1Exam, ...c2, c2Practical];
}

const REVIEWER_TASKS = [
  {
    title: "CFA MBA: review C1 Medicine and the Hospital weekly",
    brief:
      "Ezinne and Abigail are taking C1 of the CFA MBA. Each Friday from 13 November their week's task comes to you: a 22-question test and a short exercise. The C1 Marking Key (emailed to you, not to them) has every answer. A safety failure on the two Mezo questions fails the test. About ten minutes per person per week.",
    definitionOfDone:
      "Each weekly task marked by the following Tuesday: test score, exercise mark out of 5, one line on what to work on. Then approved, or changes requested.",
    dueDate: lagos("2026-12-22"),
    checkInAt: lagos("2026-11-17", 12),
    estimatedMinutes: 120,
    workedExample: "Test 19/22, pass. Exercise 4/5. Work on: ectomy versus otomy versus ostomy.",
  },
  {
    title: "CFA MBA: review C2 Managing Through Others weekly",
    brief:
      "C2 builds delegation. So far the team's tasks have come from standing rhythms and onboarding scripts, so this is where Ezinne writes and assigns her own. Each Friday from 13 November their week's task comes to you with the real briefs they wrote. Mark each brief against the rubric in section 1.6 of the C2 workbook (5 = could be finished without a single question). About ten minutes per person per week.",
    definitionOfDone: "Each weekly task marked by the following Tuesday: a rubric mark per brief and one line on how to make the weakest one a 5.",
    dueDate: lagos("2026-12-08"),
    checkInAt: lagos("2026-11-17", 12),
    estimatedMinutes: 80,
    workedExample: "Brief 1: 5. Brief 2: 3, done is clear but no why. Brief 3: 4. Next: say the delegation level in every brief.",
  },
  {
    title: "CFA MBA: C2 practical with Ezinne and Abigail",
    brief: "Friday 4 December. For each: pick five briefs from the course and mark them on the rubric, then 20 minutes in which they brief a task out loud for a scenario you give.",
    definitionOfDone: "Both examined; result on each trainee's practical task. Pass is an average of 4.",
    dueDate: lagos("2026-12-04"),
    checkInAt: null,
    estimatedMinutes: 60,
    workedExample: null,
  },
  {
    title: "CFA MBA: examine Ezinne and Abigail on C1",
    brief: "Thursday 7 January: the written paper and a 20-minute oral each. The C1 Marking Key has the paper's construction, the two unseen documents, the oral marking and the weights.",
    definitionOfDone: "Both examined. On each trainee's exam task: written score, oral marks, weighted total, pass or not, and one line of feedback.",
    dueDate: lagos("2027-01-08"),
    checkInAt: null,
    estimatedMinutes: 90,
    workedExample: null,
  },
].map((t) => ({ ...t, assigneeId: OKELEYE, assignerId: DEBO }));

const TASKS = [...traineeTasks(EZINNE), ...traineeTasks(ABIGAIL), ...REVIEWER_TASKS];

async function main() {
  const apply = process.argv.includes("--apply");
  const host = new URL((process.env.DATABASE_URL ?? "").replace(/^postgres(ql)?:/, "http:")).hostname;
  if (!host.endsWith("pooler.supabase.com")) throw new Error(`Refusing: DATABASE_URL host is ${host}, not the production pooler.`);
  console.log(`DB ${host}  ${apply ? "APPLY" : "dry run"}\n`);

  const people = await prisma.user.findMany({ where: { id: { in: [EZINNE, ABIGAIL, OKELEYE, DEBO] } }, select: { id: true, name: true } });
  if (people.length !== 4) throw new Error(`Expected 4 users, found ${people.length}`);
  const name = new Map(people.map((p) => [p.id, p.name]));

  let n = 0;
  for (const t of TASKS) {
    const has = await prisma.task.findFirst({ where: { assigneeId: t.assigneeId, title: t.title } });
    if (has) continue;
    n++;
    console.log(`+ ${name.get(t.assigneeId)}: ${t.title}  (due ${t.dueDate.toISOString().slice(0, 10)})`);
    if (apply) await prisma.task.create({ data: t });
  }
  console.log(`\n${n} task(s) ${apply ? "created" : "to create"}.`);
}

main().finally(() => prisma.$disconnect());
