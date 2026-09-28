import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";

/** Adding and removing people from a shortlist. */

async function ownedShortlist(shortlistId: string, orgId: string) {
  return prisma.cadreShortlist.findFirst({
    where: { id: shortlistId, orgId },
    select: { id: true },
  });
}

export const POST = handler(async function POST(
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
  if (!(await ownedShortlist(id, ctx.org.id))) {
    return NextResponse.json({ error: "Shortlist not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const professionalId =
    typeof body.professionalId === "string" ? body.professionalId : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  if (!professionalId) {
    return NextResponse.json({ error: "professionalId is required" }, { status: 400 });
  }

  const professional = await prisma.cadreProfessional.findFirst({
    where: { id: professionalId, accountStatus: { not: "SUSPENDED" } },
    select: { id: true, availability: true },
  });
  if (!professional) {
    return NextResponse.json({ error: "Professional not found" }, { status: 404 });
  }
  // Someone who has opted out of being approached is not shown in search and is
  // not addable from a guessed id either.
  if (professional.availability === "NOT_LOOKING") {
    return NextResponse.json(
      { error: "This professional is not open to approaches." },
      { status: 403 },
    );
  }

  // Adding the same person twice is a double click, not an error worth showing.
  const entry = await prisma.cadreShortlistEntry.upsert({
    where: { shortlistId_professionalId: { shortlistId: id, professionalId } },
    create: { shortlistId: id, professionalId, note, addedById: ctx.accountId },
    update: note ? { note } : {},
    select: { id: true },
  });

  await prisma.cadreShortlist.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, id: entry.id });
});

export const DELETE = handler(async function DELETE(
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
  if (!(await ownedShortlist(id, ctx.org.id))) {
    return NextResponse.json({ error: "Shortlist not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const professionalId = searchParams.get("professionalId");
  if (!professionalId) {
    return NextResponse.json({ error: "professionalId is required" }, { status: 400 });
  }

  await prisma.cadreShortlistEntry.deleteMany({
    where: { shortlistId: id, professionalId },
  });

  return NextResponse.json({ ok: true });
});
