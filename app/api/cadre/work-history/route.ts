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
