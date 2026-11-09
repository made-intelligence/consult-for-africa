import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { ARABELLA_DAILY } from "@/lib/arabella-daily";
import { addDays, cleanValues, findSection, isoDay, parseIsoDay, practiceDay } from "@/lib/dailyReturn";

// Save one area's return for one day. Anyone signed in may enter any area:
// at a practice this size the owner is often off and somebody else closes the
// day, and a return nobody was allowed to enter is the gap this exists to
// close. Who entered it is recorded and shown.
//
// Today or yesterday only, so a forgotten evening can be put right next
// morning, and last month cannot be rewritten.

export const dynamic = "force-dynamic";

const schema = z.object({
  section: z.string().min(1).max(60),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  values: z.record(z.string(), z.unknown()),
  note: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const section = findSection(ARABELLA_DAILY, parsed.data.section);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const day = parseIsoDay(parsed.data.day);
  const today = practiceDay(ARABELLA_DAILY);
  const allowed = [isoDay(today), isoDay(addDays(today, -1))];
  if (!day || !allowed.includes(isoDay(day))) {
    return NextResponse.json({ error: "Only today or yesterday can be entered." }, { status: 400 });
  }

  const { values, errors } = cleanValues(section, parsed.data.values);
  if (errors.length) return NextResponse.json({ error: errors.join(" ") }, { status: 422 });
  if (Object.keys(values).length === 0 && !parsed.data.note?.trim()) {
    return NextResponse.json({ error: "Fill in at least one box." }, { status: 422 });
  }

  await prisma.dailyReturn.upsert({
    where: { clientId_day_section: { clientId: session.clientId, day, section: section.code } },
    update: { values, note: parsed.data.note?.trim() || null, enteredById: session.sub, submittedAt: new Date() },
    create: {
      clientId: session.clientId,
      day,
      section: section.code,
      values,
      note: parsed.data.note?.trim() || null,
      enteredById: session.sub,
    },
  });

  return NextResponse.json({ ok: true });
}
