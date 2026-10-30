import { NextRequest, NextResponse } from "next/server";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { recomputeCompleteness } from "@/lib/cadreHealth/completeness";

const VALID_TYPES = [
  "PRIMARY_DEGREE",
  "POSTGRADUATE",
  "FELLOWSHIP",
  "CERTIFICATION",
  "INTERNATIONAL_EXAM",
];

export const GET = handler(async function GET() {
  try {
    const session = await getCadreSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qualifications = await prisma.cadreQualification.findMany({
      where: { professionalId: session.sub },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(qualifications);
  } catch (error) {
    console.error("Qualifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch qualifications" },
      { status: 500 }
    );
  }
});

export const POST = handler(async function POST(req: NextRequest) {
  try {
    const session = await getCadreSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, name, institution, yearObtained, score, expiryDate, documentUrl } =
      body;

    if (!type || !name) {
      return NextResponse.json(
        { error: "Type and name are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid qualification type" },
        { status: 400 }
      );
    }

    const qualification = await prisma.cadreQualification.create({
      data: {
        professionalId: session.sub,
        type,
        name: name.trim(),
        institution: institution?.trim() || null,
        yearObtained: yearObtained ? parseInt(yearObtained) : null,
        score: score?.trim() || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentUrl: documentUrl || null,
        verificationStatus: "PENDING",
      },
    });

    // Recompute completeness
    await recomputeCompleteness(session.sub);

    return NextResponse.json(qualification, { status: 201 });
  } catch (error) {
    console.error("Qualification creation error:", error);
    return NextResponse.json(
      { error: "Failed to add qualification" },
      { status: 500 }
    );
  }
});

export const PATCH = handler(async function PATCH(req: NextRequest) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Qualification ID is required" }, { status: 400 });
  }

  const existing = await prisma.cadreQualification.findUnique({ where: { id } });
  if (!existing || existing.professionalId !== session.sub) {
    return NextResponse.json({ error: "Qualification not found" }, { status: 404 });
  }

  // Only the fields sent are changed: the documents page sends documentUrl alone.
  const data: Record<string, unknown> = {};
  if ("documentUrl" in body) data.documentUrl = body.documentUrl || null;
  if ("type" in body) {
    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid qualification type" }, { status: 400 });
    }
    data.type = body.type;
  }
  if ("name" in body) {
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = body.name.trim();
  }
  if ("institution" in body) data.institution = body.institution?.trim() || null;
  if ("yearObtained" in body) data.yearObtained = body.yearObtained ? parseInt(body.yearObtained) : null;
  if ("score" in body) data.score = body.score?.trim() || null;
  if ("expiryDate" in body) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
  // A changed qualification has not been checked, whatever the old one was.
  if (["type", "name", "institution", "yearObtained"].some((k) => k in data && data[k] !== (existing as Record<string, unknown>)[k])) {
    data.verificationStatus = "PENDING";
  }

  const updated = await prisma.cadreQualification.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = handler(async function DELETE(req: NextRequest) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Qualification ID is required" }, { status: 400 });
  }

  const deleted = await prisma.cadreQualification.deleteMany({
    where: { id, professionalId: session.sub },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Qualification not found" }, { status: 404 });
  }

  await recomputeCompleteness(session.sub);
  return NextResponse.json({ ok: true });
});
