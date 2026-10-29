/**
 * Repairs the sessions the portal's old "Begin assessment" action created.
 *
 * That action asked no track, so the session took the CLINICAL default and the
 * clinical twins, but it served PLTI (the non-clinical identity module), which
 * has no clinical items and so opened empty. It also took a slot at the start,
 * which the complete route takes again at the end.
 *
 * For each open session holding an unanswered PLTI on the clinical form: PLTI
 * is swapped for CILTI, the user's track is recorded as CLINICAL (the form they
 * have already been answering, agreed by Debo 16 Oct 2026), the session gets
 * seven days from today, and the slot taken at the start is returned.
 *
 *   npx tsx --env-file=.env.local scripts/repair-maarova-legacy-sessions.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/repair-maarova-legacy-sessions.ts --apply
 */
import { prisma } from "@/lib/prisma";

const APPLY = process.argv.includes("--apply");

async function main() {
  const cilti = await prisma.maarovaModule.findFirst({ where: { type: "CILTI", isActive: true }, select: { id: true } });
  if (!cilti) throw new Error("No active CILTI module.");

  const rows = await prisma.maarovaModuleResponse.findMany({
    where: {
      module: { type: "PLTI" },
      status: "NOT_STARTED",
      itemResponses: { none: {} },
      session: { track: "CLINICAL", status: { in: ["NOT_STARTED", "IN_PROGRESS"] } },
    },
    include: {
      session: {
        include: {
          user: { select: { id: true, email: true, track: true, organisationId: true } },
          moduleResponses: { select: { moduleId: true } },
        },
      },
    },
  });

  const week = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  for (const r of rows) {
    const s = r.session;
    const hasCilti = s.moduleResponses.some((m) => m.moduleId === cilti.id);
    const expiresAt = s.expiresAt > week ? s.expiresAt : week;
    console.log(`${s.user.email}  session ${s.id}  ${hasCilti ? "drop PLTI" : "PLTI -> CILTI"}  expires ${expiresAt.toISOString().slice(0, 10)}`);
    if (!APPLY) continue;
    await prisma.$transaction([
      prisma.maarovaModuleResponse.delete({ where: { id: r.id } }),
      ...(hasCilti ? [] : [prisma.maarovaModuleResponse.create({ data: { sessionId: s.id, moduleId: cilti.id, status: "NOT_STARTED" } })]),
      prisma.maarovaAssessmentSession.update({ where: { id: s.id }, data: { expiresAt } }),
      ...(s.user.track ? [] : [prisma.maarovaUser.update({ where: { id: s.user.id }, data: { track: "CLINICAL" } })]),
      prisma.maarovaOrganisation.update({ where: { id: s.user.organisationId }, data: { usedAssessments: { decrement: 1 } } }),
    ]);
  }
  console.log(`${rows.length} session(s)${APPLY ? " repaired" : ". DRY RUN, pass --apply"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
