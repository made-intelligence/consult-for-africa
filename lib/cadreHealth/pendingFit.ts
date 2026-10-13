import { prisma } from "@/lib/prisma";
import { fitToken } from "@/lib/cadreHealth/fitProfile";

/**
 * Roles we are running for an organisation that it cannot see yet, because the
 * introduction terms on the fit request have not been accepted.
 *
 * Dr Ike's first login (13 Oct 2026) showed him an empty account and a "Get
 * verified" box: nothing said his three roles existed, had applicants, or
 * waited on one form. The portal now leads with that. Counts only, never
 * names, so the terms still come before the candidates.
 */
export async function pendingFitFor(org: { id: string; facilityId: string | null }) {
  if (!org.facilityId) return null;
  const mandates = await prisma.cadreMandate.findMany({
    where: { facilityId: org.facilityId, status: "OPEN", employerOrgId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      matches: { where: { source: "APPLIED" }, select: { status: true } },
    },
  });
  if (!mandates.length) return null;
  return {
    href: `/oncadre/fit/${fitToken(org.id)}`,
    roles: mandates.map((m) => ({
      id: m.id,
      title: m.title,
      applied: m.matches.length,
      shortlisted: m.matches.filter((x) => x.status === "SHORTLISTED").length,
    })),
  };
}

export type PendingFit = NonNullable<Awaited<ReturnType<typeof pendingFitFor>>>;
