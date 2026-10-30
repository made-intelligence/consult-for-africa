import { NextRequest, NextResponse } from "next/server";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { recomputeCompleteness } from "@/lib/cadreHealth/completeness";

const VALID_TYPES = [
  "PRACTICING_LICENSE",
  "FULL_REGISTRATION",
  "COGS",
  "SPECIALIST_REGISTRATION",
  "ADDITIONAL_LICENSE",
];

const VALID_BODIES = [
  "MDCN",
  "NMCN",
  "PCN",
  "MLSCN",
  "RRBN",
  "MRTB",
  "ODORBN",
  "CHPRBN",
  "EHORECON",
  "ICNDN",
  "COREN",
];

export const GET = handler(async function GET() {
  try {
    const session = await getCadreSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = await prisma.cadreCredential.findMany({
      where: { professionalId: session.sub },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Credentials fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
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
    const { type, regulatoryBody, licenseNumber, issuedDate, expiryDate, documentUrl } =
      body;

    if (!type || !regulatoryBody) {
      return NextResponse.json(
        { error: "Type and regulatory body are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid credential type" },
        { status: 400 }
      );
    }

    if (!VALID_BODIES.includes(regulatoryBody)) {
      return NextResponse.json(
        { error: "Invalid regulatory body" },
        { status: 400 }
      );
    }

    // One record per credential. Members re-enter a licence when they cannot see
    // that it was saved, so a second entry with the same type and number (or a
    // second blank one) updates the first instead of adding a duplicate.
    const number = licenseNumber?.trim() || null;
    const existing = await prisma.cadreCredential.findFirst({
      where: {
        professionalId: session.sub,
        type,
        OR: number
          ? [{ licenseNumber: { equals: number, mode: "insensitive" } }, { licenseNumber: null }]
          : [{ licenseNumber: null }],
      },
      orderBy: { createdAt: "asc" },
    });

    const data = {
      regulatoryBody,
      licenseNumber: number ?? existing?.licenseNumber ?? null,
      issuedDate: issuedDate ? new Date(issuedDate) : existing?.issuedDate ?? null,
      expiryDate: expiryDate ? new Date(expiryDate) : existing?.expiryDate ?? null,
      documentUrl: documentUrl || existing?.documentUrl || null,
    };
    const status =
      existing?.verificationStatus === "VERIFIED" && data.licenseNumber === existing.licenseNumber
        ? "VERIFIED"
        : data.licenseNumber
          ? "PENDING"
          : "NOT_SUBMITTED";

    const credential = existing
      ? await prisma.cadreCredential.update({
          where: { id: existing.id },
          data: { ...data, verificationStatus: status },
        })
      : await prisma.cadreCredential.create({
          data: { professionalId: session.sub, type, ...data, verificationStatus: status },
        });

    // Recompute completeness
    await recomputeCompleteness(session.sub);

    return NextResponse.json(credential, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Credential creation error:", error);
    return NextResponse.json(
      { error: "Failed to add credential" },
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
    return NextResponse.json({ error: "Credential ID is required" }, { status: 400 });
  }

  const existing = await prisma.cadreCredential.findUnique({ where: { id } });
  if (!existing || existing.professionalId !== session.sub) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Only the fields sent are changed: the documents page sends documentUrl alone.
  const data: Record<string, unknown> = {};
  if ("documentUrl" in body) data.documentUrl = body.documentUrl || null;
  if ("issuedDate" in body) data.issuedDate = body.issuedDate ? new Date(body.issuedDate) : null;
  if ("expiryDate" in body) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
  if ("licenseNumber" in body) {
    const number = body.licenseNumber?.trim() || null;
    data.licenseNumber = number;
    // A changed number has not been checked, whatever the old one was.
    if (number !== existing.licenseNumber) {
      data.verificationStatus = number ? "PENDING" : "NOT_SUBMITTED";
      data.verifiedAt = null;
      data.verifiedBy = null;
    }
  }
  if (data.documentUrl && existing.verificationStatus === "NOT_SUBMITTED" && (data.licenseNumber ?? existing.licenseNumber)) {
    data.verificationStatus = "PENDING";
  }

  const updated = await prisma.cadreCredential.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = handler(async function DELETE(req: NextRequest) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Credential ID is required" }, { status: 400 });
  }

  const deleted = await prisma.cadreCredential.deleteMany({
    where: { id, professionalId: session.sub },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  await recomputeCompleteness(session.sub);
  return NextResponse.json({ ok: true });
});
