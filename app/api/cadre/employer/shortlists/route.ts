import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";

/**
 * Shortlists belong to the organisation, not to the person who made them, so a
 * hospital does not lose the list it spent a fortnight building when the
 * recruiter who built it leaves.
 */

export const GET = handler(async function GET() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const shortlists = await prisma.cadreShortlist.findMany({
    where: { orgId: ctx.org.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      mandate: { select: { id: true, title: true } },
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  });

  return NextResponse.json({
    shortlists: shortlists.map((s) => ({
      id: s.id,
      name: s.name,
      mandate: s.mandate,
      updatedAt: s.updatedAt,
      count: s._count.entries,
    })),
  });
});

export const POST = handler(async function POST(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canWrite(ctx)) {
    return NextResponse.json({ error: "Your access is read only." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const mandateId = typeof body.mandateId === "string" && body.mandateId ? body.mandateId : null;

  if (!name) {
    return NextResponse.json({ error: "Give the list a name." }, { status: 400 });
  }

  if (mandateId) {
    const owned = await prisma.cadreMandate.findFirst({
      where: { id: mandateId, employerOrgId: ctx.org.id },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const shortlist = await prisma.cadreShortlist.create({
    data: { orgId: ctx.org.id, name, mandateId },
  });

  return NextResponse.json({ id: shortlist.id, name: shortlist.name });
});
