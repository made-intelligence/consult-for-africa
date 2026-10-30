import { prisma } from "@/lib/prisma";

/**
 * The one profile completeness score. Every route that changes a section of a
 * member's profile calls this; until 30 Oct 2026 each route carried its own
 * copy with different weights, so a member's score moved depending on which
 * section they saved last, and a salary report added 10 on every submission.
 *
 * Weights sum to 100.
 */
export async function recomputeCompleteness(professionalId: string): Promise<number | null> {
  const prof = await prisma.cadreProfessional.findUnique({
    where: { id: professionalId },
    select: {
      phone: true,
      cadre: true,
      subSpecialty: true,
      yearsOfExperience: true,
      state: true,
      isDiaspora: true,
      practiceLocation: true,
      openTo: true,
      availability: true,
      salaryReportedAt: true,
      _count: { select: { credentials: true, qualifications: true, cpdEntries: true, workHistory: true } },
    },
  });
  if (!prof) return null;

  let completeness = 20; // base for registering
  if (prof.phone) completeness += 5;
  if (prof.cadre) completeness += 5;
  if (prof.subSpecialty) completeness += 5;
  if (prof.yearsOfExperience != null && prof.yearsOfExperience >= 0) completeness += 5;
  if (prof.state || prof.isDiaspora || prof.practiceLocation === "DIASPORA") completeness += 5;
  if (prof.openTo && prof.openTo.length > 0) completeness += 3;
  if (prof.availability) completeness += 2;
  if (prof._count.credentials > 0) completeness += 15;
  if (prof._count.qualifications > 0) completeness += 10;
  if (prof._count.cpdEntries > 0) completeness += 10;
  if (prof._count.workHistory > 0) completeness += 10;
  if (prof.salaryReportedAt) completeness += 5;
  completeness = Math.min(completeness, 100);

  await prisma.cadreProfessional.update({
    where: { id: professionalId },
    data: { profileCompleteness: completeness },
  });
  return completeness;
}
