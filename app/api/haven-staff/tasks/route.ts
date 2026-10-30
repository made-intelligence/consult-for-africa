import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { periodKey, type Cadence } from "@/lib/havenTaskPeriod";
import { checkAnswer } from "@/lib/havenTaskPrompts";
import { raiseFromTaskNote } from "@/lib/havenSafety";

// Tick a task, or untick it.
//
// This did not exist. Ten tasks were seeded, the morning email listed them, and
// there was no way anywhere to mark one done. Three days produced zero
// completions and the reason was not behavioural.

export const dynamic = "force-dynamic";

const schema = z.object({
  taskId: z.string().min(1),
  done: z.boolean(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const task = await prisma.staffTask.findUnique({
    where: { id: parsed.data.taskId },
    select: { id: true, clientId: true, isActive: true, cadence: true, code: true },
  });
  if (!task || task.clientId !== session.clientId || !task.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // A weekly task ticked on Thursday must still read as ticked on Friday.
  const forDate = periodKey(task.cadence as Cadence);

  if (!parsed.data.done) {
    // Unticking is allowed. Somebody who ticks the wrong row and cannot undo it
    // learns to be careful rather than to be honest, and we would rather have
    // honest.
    await prisma.staffTaskCompletion.deleteMany({
      where: { taskId: task.id, staffId: session.sub, forDate },
    });
    return NextResponse.json({ ok: true, done: false });
  }

  // Tasks that are an answer need the answer. See lib/havenTaskPrompts.
  const missing = checkAnswer(task.code, parsed.data.note);
  if (missing) return NextResponse.json({ error: missing }, { status: 422 });

  const completion = await prisma.staffTaskCompletion.upsert({
    where: { taskId_staffId_forDate: { taskId: task.id, staffId: session.sub, forDate } },
    update: { note: parsed.data.note?.trim() || null },
    create: {
      taskId: task.id,
      staffId: session.sub,
      forDate,
      note: parsed.data.note?.trim() || null,
    },
  });

  // A near miss written into the weekly task is still a near miss. One came in
  // this way, two look-alike medicines nearly mixed up, and sat in a task note
  // where no one investigating would ever look.
  try {
    await raiseFromTaskNote({
      clientId: session.clientId,
      taskCode: task.code,
      completionId: completion.id,
      note: parsed.data.note,
      at: completion.completedAt,
    });
  } catch (err) {
    console.error("[haven-staff/tasks] safety register raise failed:", err);
  }

  // Ticking it late still clears the chase. The flag stays on the record as
  // history, because deleting it would hide that the system worked.
  await prisma.staffTaskFlag.updateMany({
    where: { taskId: task.id, staffId: session.sub, forDate, resolvedAt: null },
    data: { resolvedAt: new Date(), resolution: "Completed" },
  });
  // And an older period's chase on the same task. There is nowhere on the page
  // to record last week, so without this a flag from a missed week sat beside
  // a ticked box saying "Not recorded yet" for ever, and the person was left
  // believing the tick had not saved.
  await prisma.staffTaskFlag.updateMany({
    where: { taskId: task.id, staffId: session.sub, forDate: { lt: forDate }, resolvedAt: null },
    data: { resolvedAt: new Date(), resolution: "Completed in a later period" },
  });

  return NextResponse.json({ ok: true, done: true });
}
