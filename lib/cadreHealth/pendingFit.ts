import { prisma } from "@/lib/prisma";
import { fitToken } from "@/lib/cadreHealth/fitProfile";
import { givenNameFor, surnameFor } from "@/lib/cadreSalutation";

/**
 * Roles we are running for an organisation that it cannot see yet, because the
 * introduction terms on the fit request have not been accepted.
 *
 * Dr Ike's first login (13 Oct 2026) showed him an empty account and a "Get
 * verified" box: nothing said his three roles existed, had applicants, or
 * waited on one form. The portal now leads with that.
 *
 * Before the terms, candidates appear as initials with facts from their own
 * screening answers (Debo, 13 Oct: give the initials). Never a name, never a
 * hospital, and not the written assessment, which can name the hospital they
 * work at: initials and a hospital together identify someone.
 */

const line = (notes: string | null, label: string) => notes?.match(new RegExp(`^${label}: (.*)$`, "m"))?.[1] ?? null;

function initials(p: { firstName: string; lastName: string }): string {
  const parts = [givenNameFor(p.firstName), surnameFor(p.lastName)].filter(Boolean) as string[];
  const letters = parts.map((w) => w.trim()[0]?.toUpperCase()).filter(Boolean);
  return letters.length ? letters.join(".") + "." : "?";
}
export async function pendingFitFor(org: { id: string; facilityId: string | null }) {
  if (!org.facilityId) return null;
  const mandates = await prisma.cadreMandate.findMany({
    where: { facilityId: org.facilityId, status: "OPEN", employerOrgId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      matches: {
        where: { source: "APPLIED" },
        orderBy: { matchScore: { sort: "desc", nulls: "last" } },
        select: { status: true, matchScore: true, notes: true, professional: { select: { firstName: true, lastName: true } } },
      },
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
      candidates: m.matches
        .filter((x) => x.status === "SHORTLISTED" || x.status === "REVIEWING")
        .map((x) => ({
          initials: initials(x.professional),
          shortlisted: x.status === "SHORTLISTED",
          score: x.matchScore,
          years: line(x.notes, "Years as a specialist"),
          qualification: line(x.notes, "Qualification")
            ?.replace("Fellowship of the West African or National Postgraduate College", "Postgraduate college fellowship")
            .replace(/^UK membership or CCT.*/, "UK membership or CCT") ?? null,
          relocate: line(x.notes, "Relocate to Nairobi"),
        })),
    })),
  };
}

export type PendingFit = NonNullable<Awaited<ReturnType<typeof pendingFitFor>>>;
