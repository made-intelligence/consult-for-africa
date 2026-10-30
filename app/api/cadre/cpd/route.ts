import { NextRequest, NextResponse } from "next/server";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { recomputeCompleteness } from "@/lib/cadreHealth/completeness";

const VALID_CATEGORIES = [
  "CONFERENCE",
  "WORKSHOP",
  "ONLINE_COURSE",
  "PUBLICATION",
  "TEACHING",
  "CLINICAL_AUDIT",
  "SELF_STUDY",
];

export const GET = handler(async function GET() {
  try {
    const session = await getCadreSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.cadreCPDEntry.findMany({
      where: { professionalId: session.sub },
      orderBy: { dateCompleted: "desc" },
    });

    // Compute summary: total points this cycle (Jan 1 to Dec 31 of current year)
    const cycleStart = new Date(new Date().getFullYear(), 0, 1);
    const cycleEnd = new Date(new Date().getFullYear(), 11, 31);
    const cycleEntries = entries.filter(
      (e) => e.dateCompleted >= cycleStart && e.dateCompleted <= cycleEnd
    );
    const totalPoints = cycleEntries.reduce(
      (sum, e) => sum + Number(e.points),
      0
    );

    // Standard CPD target: varies by body, use 25 as default
    const targetPoints = 25;
    const daysUntilRenewal = Math.max(
      0,
      Math.ceil(
        (cycleEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    );

    return NextResponse.json({
      entries,
      summary: {
        totalPoints,
        targetPoints,
        daysUntilRenewal,
        cycleYear: new Date().getFullYear(),
      },
    });
  } catch (error) {
    console.error("CPD fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CPD entries" },
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
    const { activity, category, provider, points, dateCompleted, certificateUrl } =
      body;

    if (!activity || !category || !points || !dateCompleted) {
      return NextResponse.json(
        { error: "Activity, category, points, and date are required" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid CPD category" },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(points)) || parseFloat(points) <= 0) {
      return NextResponse.json(
        { error: "Points must be a positive number" },
        { status: 400 }
      );
    }

    const entry = await prisma.cadreCPDEntry.create({
      data: {
        professionalId: session.sub,
        activity: activity.trim(),
        category,
        provider: provider?.trim() || null,
        points: parseFloat(points),
        dateCompleted: new Date(dateCompleted),
        certificateUrl: certificateUrl || null,
      },
    });

    // Recompute completeness
    await recomputeCompleteness(session.sub);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("CPD creation error:", error);
    return NextResponse.json(
      { error: "Failed to log CPD activity" },
      { status: 500 }
    );
  }
});

export const PATCH = handler(async function PATCH(req: NextRequest) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, activity, category, provider, points, dateCompleted, certificateUrl } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
  }
  if (!activity?.trim() || !category || !points || !dateCompleted) {
    return NextResponse.json(
      { error: "Activity, category, points, and date are required" },
      { status: 400 }
    );
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid CPD category" }, { status: 400 });
  }
  if (isNaN(parseFloat(points)) || parseFloat(points) <= 0) {
    return NextResponse.json({ error: "Points must be a positive number" }, { status: 400 });
  }

  const existing = await prisma.cadreCPDEntry.findFirst({
    where: { id, professionalId: session.sub },
  });
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const updated = await prisma.cadreCPDEntry.update({
    where: { id },
    data: {
      activity: activity.trim(),
      category,
      provider: provider?.trim() || null,
      points: parseFloat(points),
      dateCompleted: new Date(dateCompleted),
      certificateUrl: certificateUrl || null,
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

  const deleted = await prisma.cadreCPDEntry.deleteMany({
    where: { id, professionalId: session.sub },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await recomputeCompleteness(session.sub);
  return NextResponse.json({ ok: true });
});
