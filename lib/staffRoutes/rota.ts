import { prisma } from "@/lib/prisma";
import type { StaffSession } from "@/lib/staffAuth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { can } from "@/lib/staffAuth";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";

// Save one department's rota for one month. Replaces the month for the people
// sent, so a correction is a re-save rather than a hunt for the wrong cell.
// Saving at all marks the month as in: from then on a blank day is a day off,
// and nobody in that department is chased on it.

const schema = z.object({
  department: z.string().min(1).max(60),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  rows: z
    .array(z.object({ staffId: z.string().min(1), codes: z.array(z.string().max(3)).max(31) }))
    .max(80),
});

export function rotaPOST(getSession: () => Promise<StaffSession | null>) {
  return async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (!can(session, "ENTER_ROTA")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const { department, month, rows } = parsed.data;

    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const nextMonth = new Date(Date.UTC(y, m, 1));
    const daysInMonth = Math.round((nextMonth.getTime() - first.getTime()) / 864e5);

    // Only people of this hospital, in this department. Anything else in the
    // payload is ignored rather than trusted.
    const valid = await prisma.staffMember.findMany({
      where: { ...staffWhere(session.clientId, ONBOARDED), department, id: { in: rows.map((r) => r.staffId) } },
      select: { id: true },
    });
    const ok = new Set(valid.map((v) => v.id));
    const keep = rows.filter((r) => ok.has(r.staffId));

    const shifts = keep.flatMap((r) =>
      r.codes.slice(0, daysInMonth).flatMap((raw, i) => {
        const code = raw.trim().toUpperCase();
        // Blank, O and OFF all mean off. Anything else is a shift, as typed.
        if (!code || code === "O" || code === "OFF" || code === "-") return [];
        return [{ staffId: r.staffId, date: new Date(Date.UTC(y, m - 1, i + 1)), code }];
      })
    );

    await prisma.$transaction([
      prisma.staffShift.deleteMany({
        where: { staffId: { in: keep.map((r) => r.staffId) }, date: { gte: first, lt: nextMonth } },
      }),
      prisma.staffShift.createMany({ data: shifts, skipDuplicates: true }),
      prisma.staffRota.upsert({
        where: { clientId_department_month: { clientId: session.clientId, department, month } },
        update: { enteredById: session.sub },
        create: { clientId: session.clientId, department, month, enteredById: session.sub },
      }),
    ]);

    return NextResponse.json({ ok: true, people: keep.length, shifts: shifts.length });
  };
}
