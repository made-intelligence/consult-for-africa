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

  const { id, documentUrl } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Qualification ID is required" }, { status: 400 });
  }

  const existing = await prisma.cadreQualification.findUnique({ where: { id } });
  if (!existing || existing.professionalId !== session.sub) {
    return NextResponse.json({ error: "Qualification not found" }, { status: 404 });
  }

  const updated = await prisma.cadreQualification.update({
    where: { id },
    data: { documentUrl: documentUrl || null },
  });

  return NextResponse.json(updated);
});
