/**
 * One page per person on how the office's interns are developing: work done,
 * sent back, blocked and overdue this month, Academy progress against the
 * curriculum, engagements, and the last evaluation. Read-only.
 *
 *   npx tsx --env-file=.env.local scripts/office-development-report.ts            # this month
 *   npx tsx --env-file=.env.local scripts/office-development-report.ts 2026-11    # a given month
 *
 * Run it before the 28th so the evaluation is written from the record rather
 * than from memory. "Supervising the Analysts", Section 5, says how to use it.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COHORT_ID = "cmtx0fn6e000a2n7zg19ocr8k"; // Office of the Founding Partner, 2026

/** The order of the foundation curriculum and the month each is due finished by. */
const CURRICULUM: [slug: string, dueBy: string][] = [
  ["cfa-platform-engagement", "2026-11-30"],
  ["professional-standards", "2026-11-30"],
  ["core-consulting-skills", "2026-12-31"],
  ["healthcare-fundamentals", "2027-01-31"],
  ["financial-literacy-healthcare", "2027-02-28"],
];

async function main() {
  const arg = process.argv[2];
  const from = arg ? new Date(`${arg}-01T00:00:00Z`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  const now = new Date();
  console.log(`Office development report, ${from.toLocaleString("en-GB", { month: "long", year: "numeric" })}\n`);

  const rotations = await prisma.internRotation.findMany({
    where: { cohortId: COHORT_ID, status: "ACTIVE" },
    include: {
      intern: { select: { id: true, name: true } },
      supervisor: { select: { name: true } },
      evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { startDate: "asc" },
  });

  for (const r of rotations) {
    const id = r.intern.id;
    const [done, sentBack, blocked, overdue, open, enrolments, assignments] = await Promise.all([
      prisma.task.count({ where: { assigneeId: id, completedAt: { gte: from, lt: to } } }),
      prisma.taskEvent.count({ where: { task: { assigneeId: id }, toStatus: "CHANGES_REQUESTED", createdAt: { gte: from, lt: to } } }),
      prisma.taskEvent.count({ where: { task: { assigneeId: id }, toStatus: "BLOCKED", createdAt: { gte: from, lt: to } } }),
      prisma.task.findMany({ where: { assigneeId: id, status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: now } }, select: { title: true, dueDate: true } }),
      prisma.task.count({ where: { assigneeId: id, status: { notIn: ["DONE", "CANCELLED"] } } }),
      prisma.trainingEnrollment.findMany({
        where: { userId: id },
        include: { track: { select: { slug: true, name: true } }, moduleProgress: { select: { status: true, completedAt: true, score: true } } },
      }),
      prisma.assignment.findMany({ where: { consultantId: id, status: "ACTIVE" }, select: { engagement: { select: { name: true } } } }),
    ]);

    const modulesThisMonth = enrolments.flatMap((e) => e.moduleProgress).filter((m) => m.completedAt && m.completedAt >= from && m.completedAt < to).length;

    console.log(`== ${r.intern.name}  (supervisor: ${r.supervisor?.name ?? "none"}; rotation to ${r.endDate.toISOString().slice(0, 10)})`);
    console.log(`Work this month: ${done} done, ${sentBack} sent back, ${blocked} blocks raised, ${open} open, ${overdue.length} overdue`);
    for (const t of overdue) console.log(`   overdue: ${t.title} (due ${t.dueDate!.toISOString().slice(0, 10)})`);
    console.log(`Engagements: ${assignments.map((a) => a.engagement.name).join("; ") || "none"}`);
    console.log(`Academy: ${modulesThisMonth} module(s) completed this month`);
    for (const [slug, dueBy] of CURRICULUM) {
      const e = enrolments.find((x) => x.track.slug === slug);
      if (!e) { console.log(`   ${slug}: not enrolled`); continue; }
      const total = e.moduleProgress.length;
      const complete = e.moduleProgress.filter((m) => m.status === "COMPLETED").length;
      const late = complete < total && new Date(dueBy) < now ? "  BEHIND" : "";
      console.log(`   ${e.track.name}: ${complete}/${total} modules, due by ${dueBy}${late}`);
    }
    const ev = r.evaluations[0];
    console.log(ev
      ? `Last evaluation: ${ev.period}, overall ${ev.overallScore} (tech ${ev.technicalSkills}, comms ${ev.communication}, prof ${ev.professionalism}, init ${ev.initiative}, team ${ev.teamwork})`
      : "Last evaluation: none yet");
    console.log("");
  }
}

main()
  .catch((err) => {
    console.error(String(err instanceof Error ? err.message : err));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
