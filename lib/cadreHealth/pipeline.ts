import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";
import { replyOverdueCutoff } from "@/lib/cadreHealth/matchStages";
import type { PipelineEntry } from "@/app/(oncadre-employer)/oncadre/employer/pipeline/PipelineBoard";

/**
 * Loads a pipeline, scoped to the organisation and optionally to one role.
 *
 * Shared by the cross-role board and a single role's board so the two cannot
 * disagree about what "overdue" means or how a name is rendered.
 */
export async function loadPipeline(orgId: string, mandateId?: string) {
  const matches = await prisma.cadreMandateMatch.findMany({
    where: {
      mandate: { employerOrgId: orgId, ...(mandateId ? { id: mandateId } : {}) },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      status: true,
      source: true,
      matchScore: true,
      matchExplanation: true,
      notes: true,
      createdAt: true,
      mandate: { select: { id: true, title: true, cadre: true } },
      professional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          cadre: true,
          subSpecialty: true,
          specialtyConfirmedAt: true,
          yearsOfExperience: true,
          state: true,
          city: true,
          accountStatus: true,
          profileCompleteness: true,
          cvFileUrl: true,
        },
      },
    },
  });

  const overdueBefore = replyOverdueCutoff();

  return matches.map<PipelineEntry>((m) => ({
    id: m.id,
    status: m.status,
    source: m.source,
    matchScore: m.matchScore,
    matchExplanation: m.matchExplanation,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    // Only an applicant can be overdue. Nobody is owed a reply to a message they
    // never sent.
    overdue: m.source === "APPLIED" && m.status === "NEW" && m.createdAt < overdueBefore,
    mandate: {
      id: m.mandate.id,
      title: m.mandate.title,
      cadreLabel: getCadreLabel(m.mandate.cadre),
    },
    professional: {
      id: m.professional.id,
      name: displayNameFor(m.professional),
      cadreLabel: getCadreLabel(m.professional.cadre),
      subSpecialty: m.professional.subSpecialty,
      specialtyConfirmed: !!m.professional.specialtyConfirmedAt,
      yearsOfExperience: m.professional.yearsOfExperience,
      location:
        [m.professional.city, m.professional.state].filter(Boolean).join(", ") || "Nigeria",
      licenceVerified: m.professional.accountStatus === "VERIFIED",
      profileCompleteness: m.professional.profileCompleteness,
      hasCv: !!m.professional.cvFileUrl,
    },
  }));
}
