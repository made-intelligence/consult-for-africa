import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";

/**
 * A single role: read it, edit it, and change where it is in its life.
 *
 * None of this existed. A role could be created and never touched again, so the
 * job board accumulated filled posts that professionals kept applying to.
 */

/** Status changes an employer can make, and what each one does to the listing. */
const TRANSITIONS: Record<
  string,
  { to: string; publish?: boolean; stamp?: "shortlistedAt" | "interviewingAt" | "placedAt" | "lostAt" }
> = {
  publish: { to: "OPEN", publish: true },
  pause: { to: "SOURCING", publish: false },
  shortlisting: { to: "SHORTLISTED", stamp: "shortlistedAt" },
  interviewing: { to: "INTERVIEWING", stamp: "interviewingAt" },
  filled: { to: "PLACED", publish: false, stamp: "placedAt" },
  close: { to: "CLOSED", publish: false, stamp: "lostAt" },
  cancel: { to: "CANCELLED", publish: false, stamp: "lostAt" },
};

async function owned(id: string, orgId: string) {
  return prisma.cadreMandate.findFirst({
    where: { id, employerOrgId: orgId },
    select: { id: true, status: true, title: true },
  });
}

export const GET = handler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const role = await prisma.cadreMandate.findFirst({
    where: { id, employerOrgId: ctx.org.id },
  });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json({
    role: {
      ...role,
      salaryRangeMin: role.salaryRangeMin ? Number(role.salaryRangeMin) : null,
      salaryRangeMax: role.salaryRangeMax ? Number(role.salaryRangeMax) : null,
    },
  });
});

export const PATCH = handler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canWrite(ctx)) {
    return NextResponse.json({ error: "Your access is read only." }, { status: 403 });
  }

  const { id } = await params;
  const role = await owned(id, ctx.org.id);
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  // A status change and a content edit are different requests and are not mixed.
  if (typeof body.action === "string") {
    const transition = TRANSITIONS[body.action];
    if (!transition) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const data: Record<string, unknown> = { status: transition.to };
    if (transition.publish !== undefined) {
      data.isPublished = transition.publish;
      if (transition.publish) data.publishedAt = new Date();
    }
    if (transition.stamp) data[transition.stamp] = new Date();
    if (transition.to === "CLOSED" || transition.to === "CANCELLED") {
      data.closedAt = new Date();
      if (typeof body.reason === "string" && body.reason.trim()) {
        data.lostReason = body.reason.trim().slice(0, 500);
      }
    }

    const updated = await prisma.cadreMandate.update({ where: { id }, data });
    return NextResponse.json({ ok: true, status: updated.status, isPublished: updated.isPublished });
  }

  const data: Record<string, unknown> = {};
  const setString = (key: string, max = 200) => {
    if (body[key] !== undefined) {
      data[key] = typeof body[key] === "string" && body[key].trim()
        ? body[key].trim().slice(0, max)
        : null;
    }
  };

  if (body.title !== undefined) {
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "A role needs a title." }, { status: 400 });
    }
    data.title = body.title.trim().slice(0, 200);
  }
  setString("description", 8000);
  setString("subSpecialty");
  setString("locationCity");
  setString("locationState");
  setString("urgency", 20);
  if (body.cadre !== undefined) data.cadre = body.cadre;
  if (body.type !== undefined) data.type = body.type;
  if (body.minYearsExperience !== undefined) {
    data.minYearsExperience = body.minYearsExperience || null;
  }
  if (body.isRemoteOk !== undefined) data.isRemoteOk = !!body.isRemoteOk;
  if (body.isRelocationRequired !== undefined) {
    data.isRelocationRequired = !!body.isRelocationRequired;
  }
  if (body.requiredQualifications !== undefined) {
    data.requiredQualifications = body.requiredQualifications || [];
  }
  if (body.preferredQualifications !== undefined) {
    data.preferredQualifications = body.preferredQualifications || [];
  }

  const salaryMin =
    body.salaryRangeMin !== undefined
      ? body.salaryRangeMin
        ? Number(body.salaryRangeMin)
        : null
      : undefined;
  const salaryMax =
    body.salaryRangeMax !== undefined
      ? body.salaryRangeMax
        ? Number(body.salaryRangeMax)
        : null
      : undefined;
  if (
    salaryMin != null &&
    salaryMax != null &&
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    salaryMin > salaryMax
  ) {
    return NextResponse.json(
      { error: "The minimum salary is above the maximum." },
      { status: 400 },
    );
  }
  if (salaryMin !== undefined) data.salaryRangeMin = salaryMin;
  if (salaryMax !== undefined) data.salaryRangeMax = salaryMax;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  const updated = await prisma.cadreMandate.update({ where: { id }, data });
  return NextResponse.json({ ok: true, id: updated.id });
});
