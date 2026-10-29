import { prisma } from "@/lib/prisma";
import { GRACE_MS, paperForClient, readAnswers, readPaper, scorePaper } from "./assessment";
import { SECTIONS, type SectionKey } from "./questionBank";

/**
 * Load an application by its access token, closing the paper first if the
 * clock has run out. An applicant who starts and walks away still gets a
 * score: what they answered in time counts, the rest does not.
 */
export async function loadApplication(token: string) {
  const app = await prisma.cadreInternshipApplication.findUnique({
    where: { accessToken: token },
    include: {
      professional: { select: { firstName: true, lastName: true, email: true } },
      attempt: true,
      preferences: { orderBy: { rank: "asc" }, include: { centre: { select: { id: true, name: true, stage: true, listed: true, minScore: true } } } },
    },
  });
  if (!app) return null;

  if (app.attempt && !app.attempt.submittedAt && Date.now() > app.attempt.deadlineAt.getTime() + GRACE_MS) {
    await closeAttempt(app.attempt.id);
    return loadApplication(token);
  }
  return app;
}

export async function closeAttempt(attemptId: string) {
  const attempt = await prisma.cadreInternshipAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.submittedAt) return;
  const { score, sectionScores } = scorePaper(readPaper(attempt.paper), readAnswers(attempt.answers));
  await prisma.$transaction([
    // Guarded on submittedAt so two closes racing each other score once.
    prisma.cadreInternshipAttempt.updateMany({
      where: { id: attemptId, submittedAt: null },
      data: { submittedAt: new Date(), score, sectionScores: sectionScores as object },
    }),
    prisma.cadreInternshipApplication.update({ where: { id: attempt.applicationId }, data: { status: "ASSESSED" } }),
  ]);
}

export type LoadedApplication = NonNullable<Awaited<ReturnType<typeof loadApplication>>>;

/** What the applicant's page is given. Never the answer key. */
export function publicView(app: LoadedApplication) {
  const attempt = app.attempt;
  const sectionScores = (attempt?.sectionScores ?? null) as Record<string, { correct: number; total: number }> | null;
  return {
    firstName: app.professional.firstName,
    status: app.status,
    attempt: attempt
      ? {
          submitted: Boolean(attempt.submittedAt),
          deadlineAt: attempt.deadlineAt.toISOString(),
          score: attempt.score,
          sections: sectionScores
            ? Object.entries(sectionScores).map(([k, v]) => ({ label: SECTIONS[k as SectionKey] ?? k, ...v }))
            : [],
          questions: attempt.submittedAt ? [] : paperForClient(readPaper(attempt.paper)),
          answers: attempt.submittedAt ? {} : readAnswers(attempt.answers),
        }
      : null,
    preferences: app.preferences.map((p) => ({
      id: p.id,
      rank: p.rank,
      centre: p.centre.name,
      centreId: p.centre.id,
      participating: p.centre.listed && p.centre.stage !== "DECLINED",
      status: p.status,
    })),
  };
}
