import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession, atLeast } from "@/lib/staffAuth";

// Request leave, and decide on it.
//
// Both ends are here because they are the same object seen from two sides, and
// splitting them would mean two places that have to agree about who may do what.

export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "COMPASSIONATE", "STUDY", "UNPAID"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().int().min(1).max(90),
  reason: z.string().max(1000).optional(),
});

const decideSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["APPROVED", "DECLINED"]),
  decisionNote: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the dates and days." }, { status: 400 });

  const start = new Date(`${parsed.data.startDate}T00:00:00Z`);
  const end = new Date(`${parsed.data.endDate}T00:00:00Z`);
  if (end < start) return NextResponse.json({ error: "The end date is before the start date." }, { status: 400 });

  await prisma.staffLeaveRequest.create({
    data: {
      staffId: session.sub,
      type: parsed.data.type,
      startDate: start,
      endDate: end,
      days: parsed.data.days,
      reason: parsed.data.reason?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  // Deciding is a supervisor job. A nurse approving her own leave is the whole
  // reason this is not a WhatsApp message.
  if (!atLeast(session, "SUPERVISOR")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const parsed = decideSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const target = await prisma.staffLeaveRequest.findUnique({
    where: { id: parsed.data.id },
    include: { staff: { select: { id: true, clientId: true } } },
  });
  if (!target || target.staff.clientId !== session!.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.staffId === session!.sub) {
    return NextResponse.json({ error: "You cannot decide your own leave." }, { status: 403 });
  }
  if (target.status !== "REQUESTED") {
    return NextResponse.json({ error: "That request has already been decided." }, { status: 409 });
  }

  await prisma.staffLeaveRequest.update({
    where: { id: target.id },
    data: {
      status: parsed.data.decision,
      decidedById: session!.sub,
      decidedAt: new Date(),
      decisionNote: parsed.data.decisionNote?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}

/**
 * Who else from the same department is already approved off across a range.
 *
 * This is the point of the whole feature. A request on its own tells a
 * supervisor nothing; a request plus "two of your six nurses are already off
 * that week" is a decision.
 */
export async function GET(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const me = await prisma.staffMember.findUnique({
    where: { id: session.sub },
    select: { department: true },
  });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);

  const clashes = await prisma.staffLeaveRequest.findMany({
    where: {
      status: "APPROVED",
      staff: { clientId: session.clientId, department: me.department, isActive: true },
      // Any overlap at all, not containment.
      startDate: { lte: end },
      endDate: { gte: start },
      NOT: { staffId: session.sub },
    },
    select: {
      startDate: true,
      endDate: true,
      staff: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const headcount = await prisma.staffMember.count({
    where: { clientId: session.clientId, department: me.department, isActive: true },
  });

  return NextResponse.json({
    department: me.department,
    headcount,
    alreadyOff: clashes.map((c) => ({
      name: c.staff.name,
      from: c.startDate.toISOString().slice(0, 10),
      to: c.endDate.toISOString().slice(0, 10),
    })),
  });
}
