import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import type { Prisma } from "@prisma/client";

/**
 * Roles an employer is hiring for.
 *
 * Replaces the old post-role endpoint, which could only create. A role could not
 * be edited, paused, closed or marked filled once posted, so every role a
 * hospital had ever advertised stayed live on the job board for ever and
 * professionals applied to posts that were filled months earlier.
 */

function generateSlug(title: string, facility: string | null, state: string | null): string {
  return [title, facility, state]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const GET = handler(async function GET(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const roles = await prisma.cadreMandate.findMany({
    // Scoped on the org, not on a company-name string comparison. Two accounts
    // that typed the same hospital name previously saw each other's roles.
    where: {
      employerOrgId: ctx.org.id,
      ...(status ? { status: status as Prisma.EnumCadreMandateStatusFilter["equals"] } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      cadre: true,
      subSpecialty: true,
      type: true,
      status: true,
      isPublished: true,
      locationState: true,
      locationCity: true,
      urgency: true,
      createdAt: true,
      publishedAt: true,
      slug: true,
      _count: { select: { matches: true } },
      matches: {
        where: { source: "APPLIED" },
        select: { id: true, status: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({
    roles: roles.map((r) => {
      const applied = r.matches;
      return {
        id: r.id,
        title: r.title,
        cadre: r.cadre,
        subSpecialty: r.subSpecialty,
        type: r.type,
        status: r.status,
        isPublished: r.isPublished,
        locationState: r.locationState,
        locationCity: r.locationCity,
        urgency: r.urgency,
        createdAt: r.createdAt,
        publishedAt: r.publishedAt,
        slug: r.slug,
        // Counted apart, because they mean different things. Total includes
        // everyone we surfaced; applicants are the people owed an answer.
        totalCandidates: r._count.matches,
        applicants: applied.length,
        unreadApplicants: applied.filter((m) => m.status === "NEW").length,
      };
    }),
  });
});

export const POST = handler(async function POST(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canWrite(ctx)) {
    return NextResponse.json(
      { error: "Your access does not allow posting roles." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { title, cadre, type } = body;

  if (!title?.trim() || !cadre || !type) {
    return NextResponse.json(
      { error: "A title, a cadre and an employment type are required." },
      { status: 400 },
    );
  }

  const salaryMin = body.salaryRangeMin ? Number(body.salaryRangeMin) : null;
  const salaryMax = body.salaryRangeMax ? Number(body.salaryRangeMax) : null;
  if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
    return NextResponse.json(
      { error: "The minimum salary is above the maximum." },
      { status: 400 },
    );
  }

  // A draft is a real state. A hospital writing a consultant post over two days
  // should not have it live on the job board in the meantime.
  const publish = body.publish !== false;

  const mandate = await prisma.cadreMandate.create({
    data: {
      title: title.trim(),
      description: body.description?.trim() || null,
      cadre,
      subSpecialty: body.subSpecialty?.trim() || null,
      type,
      minYearsExperience: body.minYearsExperience || null,
      locationState: body.locationState || null,
      locationCity: body.locationCity?.trim() || null,
      salaryRangeMin: salaryMin,
      salaryRangeMax: salaryMax,
      salaryCurrency: "NGN",
      urgency: body.urgency || "MEDIUM",
      requiredQualifications: body.requiredQualifications || [],
      preferredQualifications: body.preferredQualifications || [],
      isRemoteOk: !!body.isRemoteOk,
      isRelocationRequired: !!body.isRelocationRequired,
      employerOrgId: ctx.org.id,
      facilityId: ctx.org.facilityId,
      facilityName: ctx.org.facilityId ? null : ctx.org.name,
      status: "OPEN",
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
  });

  const slug =
    generateSlug(title, ctx.org.name, body.locationState) + "-" + mandate.id.slice(-6);
  await prisma.cadreMandate.update({ where: { id: mandate.id }, data: { slug } });

  return NextResponse.json({ id: mandate.id, slug, isPublished: publish });
});
