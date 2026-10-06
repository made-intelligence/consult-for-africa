import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession, atLeast } from "@/lib/staffAuth";
import { MEASURE_BY_KEY, isoWeek } from "@/lib/havenScoreboard";

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
  if (!MEASURE_BY_KEY[parsed.data.measure]) {
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
    },
    create: {
      clientId: session!.clientId,
      measure: parsed.data.measure,
      period,
      value: parsed.data.value,
      movedBy: parsed.data.movedBy?.trim() || null,
      enteredById: session!.sub,
    },
  });

  return NextResponse.json({ ok: true });
}
