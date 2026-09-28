import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import type { Prisma } from "@prisma/client";
import { handler } from "@/lib/api-handler";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";
import {
  CANDIDATE_CARD_SELECT,
  toCandidateCard,
  type CandidateCardRow,
} from "@/lib/cadreHealth/candidateVisibility";

/**
 * Employer candidate search.
 *
 * This used to open every query with
 * `availability IN (ACTIVELY_LOOKING, OPEN_TO_OFFERS)`. Nothing in the product
 * ever wrote that column, so it was set on 30 rows out of 10,229 and a hospital
 * that signed up searched a register of ten thousand doctors and was shown
 * thirty. Availability is now a ranking signal. Someone who was never asked a
 * question is not deleted from the product for failing to answer it.
 *
 * Contact details are never in the response. The select list is an allow list in
 * candidateVisibility.ts, so a field added to the model later does not leak by
 * default, and reaching anyone runs through CadreContactRequest.
 */

const PAGE_SIZE = 24;
const MAX_PAGE = 40; // 960 results deep is past the point of useful browsing

export const GET = handler(async function GET(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cadre = searchParams.get("cadre") || undefined;
  const subSpecialty = searchParams.get("subSpecialty")?.trim() || undefined;
  const state = searchParams.get("state") || undefined;
  const q = searchParams.get("q")?.trim() || undefined;
  const minYears = searchParams.get("minYears");
  const maxYears = searchParams.get("maxYears");
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";
  const openOnly = searchParams.get("openOnly") === "true";
  const withCv = searchParams.get("withCv") === "true";
  const page = Math.min(
    MAX_PAGE,
    Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1),
  );

  const where: Prisma.CadreProfessionalWhereInput = {
    // Suspended records are an integrity matter and are never shown to an
    // employer regardless of filters.
    accountStatus: { not: "SUSPENDED" },
    // NOT_LOOKING is the one answer that removes someone from search. The member
    // side asks the question as "you do not want to be approached about roles at
    // the moment", so listing them to hospitals anyway would break the promise
    // the moment it was made. Everyone who has simply not answered stays in.
    //
    // The null branch is not optional. Prisma renders `not` as a plain SQL
    // inequality, which is null for a null column and therefore false, so
    // `availability: { not: "NOT_LOOKING" }` on its own drops every record that
    // has never answered: 10,199 of 10,229, which is the original bug wearing a
    // different hat.
    AND: [
      {
        OR: [{ availability: null }, { availability: { not: "NOT_LOOKING" } }],
      },
    ],
  };

  if (cadre) where.cadre = cadre as Prisma.CadreProfessionalWhereInput["cadre"];
  if (subSpecialty) where.subSpecialty = { contains: subSpecialty, mode: "insensitive" };
  if (state) where.state = state;
  if (verifiedOnly) where.accountStatus = "VERIFIED";
  if (withCv) where.cvFileUrl = { not: null };

  // "Open to approach" as an explicit choice the employer makes, rather than a
  // filter applied to them without their knowledge.
  if (openOnly) where.availability = { in: ["ACTIVELY_LOOKING", "OPEN_TO_OFFERS"] };

  // Years of experience is recorded for 233 records out of 10,229. Filtering on
  // it silently drops everyone whose record predates the field, so a range only
  // narrows within those who have stated it.
  if (minYears || maxYears) {
    const range: Prisma.IntNullableFilter = {};
    if (minYears) range.gte = parseInt(minYears);
    if (maxYears) range.lte = parseInt(maxYears);
    where.yearsOfExperience = range;
  }

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { subSpecialty: { contains: q, mode: "insensitive" } },
      { currentRole: { contains: q, mode: "insensitive" } },
      { currentFacility: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total, facets] = await Promise.all([
    prisma.cadreProfessional.findMany({
      where,
      select: CANDIDATE_CARD_SELECT,
      // The database cannot order by the tier, which is derived. It can get the
      // ordering approximately right so that paging is stable and the strongest
      // records surface first, and the page is then sorted exactly in memory.
      orderBy: [
        { availability: { sort: "asc", nulls: "last" } },
        { lastLoginAt: { sort: "desc", nulls: "last" } },
        { profileCompleteness: "desc" },
        { id: "asc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.cadreProfessional.count({ where }),
    buildFacets(where),
  ]);

  const candidates = (rows as CandidateCardRow[])
    .map((row) =>
      toCandidateCard(row, {
        cadreLabel: getCadreLabel,
        displayName: displayNameFor,
      }),
    )
    .sort((a, b) => b.tier.weight - a.tier.weight);

  return NextResponse.json({
    candidates,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.min(MAX_PAGE, Math.ceil(total / PAGE_SIZE)),
    facets,
    /** Drives the approach control: an unverified employer can look, not reach. */
    employerVerified: ctx.org.isVerified,
  });
});

/**
 * Counts for the filters the employer has not yet applied, so no combination
 * ever returns a silent zero with no explanation of which filter emptied it.
 */
async function buildFacets(where: Prisma.CadreProfessionalWhereInput) {
  const [byCadre, byState, tierCounts] = await Promise.all([
    prisma.cadreProfessional.groupBy({
      by: ["cadre"],
      where: { ...where, cadre: undefined },
      _count: true,
      orderBy: { _count: { cadre: "desc" } },
    }),
    prisma.cadreProfessional.groupBy({
      by: ["state"],
      where: { ...where, state: undefined },
      _count: true,
      orderBy: { _count: { state: "desc" } },
      take: 40,
    }),
    prisma.cadreProfessional.groupBy({
      by: ["availability"],
      where,
      _count: true,
    }),
  ]);

  const open = tierCounts
    .filter(
      (t) => t.availability === "ACTIVELY_LOOKING" || t.availability === "OPEN_TO_OFFERS",
    )
    .reduce((sum, t) => sum + t._count, 0);

  return {
    cadres: byCadre.map((c) => ({
      value: c.cadre,
      label: getCadreLabel(c.cadre),
      count: c._count,
    })),
    states: byState
      .filter((s) => s.state)
      .map((s) => ({ value: s.state as string, count: s._count })),
    openToApproach: open,
  };
}
