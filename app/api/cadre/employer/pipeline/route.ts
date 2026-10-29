import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";
import { replyOverdueCutoff } from "@/lib/cadreHealth/matchStages";

/**
 * Everyone in play, across every role.
 *
 * Kept separate by how they arrived. An applicant chose this hospital and is
 * owed an answer; a sourced candidate has not been approached yet and is owed
 * nothing until someone acts. Merging them, as the old Applications page did,
 * meant the one real applicant sat among fifty the matcher swept in and the
 * count on the dashboard could not be trusted.
 */
export const GET = handler(async function GET(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mandateId = searchParams.get("mandateId");
  const source = searchParams.get("source");

  const matches = await prisma.cadreMandateMatch.findMany({
    where: {
      mandate: {
        employerOrgId: ctx.org.id,
        ...(mandateId ? { id: mandateId } : {}),
      },
      ...(source ? { source: source as "APPLIED" | "SOURCED" | "INVITED" } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      status: true,
      source: true,
      matchScore: true,
      matchExplanation: true,
      notes: true,
      createdAt: true,
      contactedAt: true,
      mandate: { select: { id: true, title: true, cadre: true, status: true } },
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

  return NextResponse.json({
    entries: matches.map((m) => ({
      id: m.id,
      status: m.status,
      source: m.source,
      matchScore: m.matchScore,
      matchExplanation: m.matchExplanation,
      notes: m.notes,
      createdAt: m.createdAt,
      // Only an applicant can be overdue. Nobody is owed a reply to a message
      // they never sent.
      overdue:
        m.source === "APPLIED" && m.status === "NEW" && m.createdAt < overdueBefore,
      mandate: {
        ...m.mandate,
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
          [m.professional.city, m.professional.state].filter(Boolean).join(", ") ||
          "Nigeria",
        licenceVerified: m.professional.accountStatus === "VERIFIED",
        profileCompleteness: m.professional.profileCompleteness,
        hasCv: !!m.professional.cvFileUrl,
      },
    })),
  });
});
