/**
 * Raise a safety register case for every near miss and what-is-broken already
 * filed, from the forms and from the written answers to the reporting tasks.
 *
 * Fourteen form responses and the task notes predate the register, so none of
 * them has a case and none was investigated. Idempotent on sourceId: safe to
 * re-run. Dry run by default.
 *
 *   npx tsx scripts/backfill-haven-safety-register.ts          # show what it would raise
 *   npx tsx scripts/backfill-haven-safety-register.ts --apply  # raise them
 */
import { prisma } from "../lib/prisma";
import { raiseFromForm, raiseFromTaskNote, isNothing, REPORTING_TASKS, HAVEN_CLIENT_NAME } from "../lib/havenSafety";

const APPLY = process.argv.includes("--apply");

async function main() {
  const client = await prisma.client.findFirst({ where: { name: HAVEN_CLIENT_NAME }, select: { id: true } });
  if (!client) throw new Error("No Haven client");

  const forms = await prisma.auditSurveyResponse.findMany({
    where: { survey: { in: ["haven-near-miss", "haven-whats-broken"] } },
    orderBy: { createdAt: "asc" },
  });
  const notes = await prisma.staffTaskCompletion.findMany({
    where: { task: { clientId: client.id, code: { in: Object.keys(REPORTING_TASKS) } }, note: { not: null } },
    include: { task: { select: { code: true } } },
    orderBy: { completedAt: "asc" },
  });

  let raised = 0;
  for (const f of forms) {
    const p = f.payload as Record<string, unknown>;
    if (isNothing(String(p.what ?? ""))) continue;
    console.log(`${f.createdAt.toISOString().slice(0, 10)}  ${f.survey.padEnd(18)}  ${String(p.what).slice(0, 90)}`);
    raised++;
    if (APPLY) await raiseFromForm({ clientId: client.id, survey: f.survey, responseId: f.id, payload: p, at: f.createdAt });
  }
  for (const n of notes) {
    if (isNothing(n.note)) continue;
    console.log(`${n.completedAt.toISOString().slice(0, 10)}  task:${n.task.code!.padEnd(13)}  ${n.note!.slice(0, 90)}`);
    raised++;
    if (APPLY) await raiseFromTaskNote({ clientId: client.id, taskCode: n.task.code, completionId: n.id, note: n.note, at: n.completedAt });
  }
  console.log(`\n${raised} case${raised === 1 ? "" : "s"} ${APPLY ? "raised (existing ones left untouched)" : "would be raised. Re-run with --apply."}`);
}

main().finally(() => prisma.$disconnect());
