import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession, atLeast } from "@/lib/staffAuth";
import { ALL_MEASURE_BY_KEY, FINANCIAL_KEYS, isoWeek } from "@/lib/havenScoreboard";

// Entering the week's numbers. Supervisors and above, because this is the
// hospital telling itself the truth and it needs a name against it.

export const dynamic = "force-dynamic";

const schema = z.object({
  measure: z.string().min(1),
  period: z.string().regex(/^\d{4}-W\d{2}$/).optional(),
  value: z.string().trim().min(1).max(40),
  movedBy: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!atLeast(session, "SUPERVISOR")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the number." }, { status: 400 });
  if (!ALL_MEASURE_BY_KEY[parsed.data.measure]) {
    return NextResponse.json({ error: "Unknown measure" }, { status: 400 });
  }

  const period = parsed.data.period ?? isoWeek();

  await prisma.scoreboardEntry.upsert({
    where: {
      clientId_measure_period: {
        clientId: session!.clientId,
        measure: parsed.data.measure,
        period,
      },
    },
    update: {
      value: parsed.data.value,
      movedBy: parsed.data.movedBy?.trim() || null,
      enteredById: session!.sub,
      // Changing the figure withdraws the agreement. Otherwise a number can be
      // agreed and then quietly edited, which is worse than never agreeing it.
      agreedById: null,
      agreedAt: null,
      agreedNote: null,
    },
    create: {
      clientId: session!.clientId,
      measure: parsed.data.measure,
      period,
      value: parsed.data.value,
      movedBy: parsed.data.movedBy?.trim() || null,
      enteredById: session!.sub,
      visibility: FINANCIAL_KEYS.has(parsed.data.measure) ? "LEADERSHIP" : "ALL_STAFF",
    },
  });

  return NextResponse.json({ ok: true });
}

const agreeSchema = z.object({
  measure: z.string().min(1),
  period: z.string().regex(/^\d{4}-W\d{2}$/),
  note: z.string().max(500).optional(),
});

/** A second person agrees the figure. Never the person who entered it. */
export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  if (!atLeast(session, "SUPERVISOR")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const parsed = agreeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const entry = await prisma.scoreboardEntry.findUnique({
    where: {
      clientId_measure_period: {
        clientId: session!.clientId,
        measure: parsed.data.measure,
        period: parsed.data.period,
      },
    },
    select: { id: true, enteredById: true, agreedAt: true },
  });
  if (!entry) return NextResponse.json({ error: "Nothing entered for that week" }, { status: 404 });
  if (entry.enteredById === session!.sub) {
    return NextResponse.json(
      { error: "Somebody else has to agree this one. You entered it." },
      { status: 403 }
    );
  }
  if (entry.agreedAt) return NextResponse.json({ error: "Already agreed" }, { status: 409 });

  await prisma.scoreboardEntry.update({
    where: { id: entry.id },
    data: { agreedById: session!.sub, agreedAt: new Date(), agreedNote: parsed.data.note?.trim() || null },
  });

  return NextResponse.json({ ok: true });
}
