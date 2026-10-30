import { NextRequest, NextResponse } from "next/server";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { recomputeCompleteness } from "@/lib/cadreHealth/completeness";

export const GET = handler(async function GET() {
  try {
    const session = await getCadreSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.cadreWorkHistory.findMany({
      where: { professionalId: session.sub },
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Work history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch work history" },
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
    const { facilityName, facilityId, role, department, startDate, endDate, isCurrent } =
      body;

    if (!facilityName || !role || !startDate) {
      return NextResponse.json(
        { error: "Facility name, role, and start date are required" },
        { status: 400 }
      );
    }

    // If marking as current, unmark any existing current positions
    if (isCurrent) {
      await prisma.cadreWorkHistory.updateMany({
        where: {
          professionalId: session.sub,
          isCurrent: true,
        },
        data: { isCurrent: false },
      });
    }

    const entry = await prisma.cadreWorkHistory.create({
      data: {
        professionalId: session.sub,
        facilityName: facilityName.trim(),
        facilityId: facilityId || null,
        role: role.trim(),
        department: department?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: !!isCurrent,
      },
    });

    // Recompute completeness
    await recomputeCompleteness(session.sub);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Work history creation error:", error);
    return NextResponse.json(
      { error: "Failed to add work history" },
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
  const { id, facilityName, facilityId, role, department, startDate, endDate, isCurrent } = body;
  if (!id) {
    return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
  }
  if (!facilityName?.trim() || !role?.trim() || !startDate) {
    return NextResponse.json(
      { error: "Facility name, role, and start date are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.cadreWorkHistory.findFirst({
    where: { id, professionalId: session.sub },
  });
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (isCurrent) {
    await prisma.cadreWorkHistory.updateMany({
      where: { professionalId: session.sub, isCurrent: true, id: { not: id } },
      data: { isCurrent: false },
    });
  }

  const updated = await prisma.cadreWorkHistory.update({
    where: { id },
    data: {
      facilityName: facilityName.trim(),
      // A renamed facility no longer points at the one picked from the list.
      facilityId: facilityId || (facilityName.trim() === existing.facilityName ? existing.facilityId : null),
      role: role.trim(),
      department: department?.trim() || null,
      startDate: new Date(startDate),
      endDate: isCurrent || !endDate ? null : new Date(endDate),
      isCurrent: !!isCurrent,
    },
  });

  return NextResponse.json(updated);
});

export const DELETE = handler(async function DELETE(req: NextRequest) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
  }

  const deleted = await prisma.cadreWorkHistory.deleteMany({
    where: { id, professionalId: session.sub },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await recomputeCompleteness(session.sub);
  return NextResponse.json({ ok: true });
});
