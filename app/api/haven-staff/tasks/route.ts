import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";

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

/** Midnight UTC, matching how completions are keyed everywhere else. */
function dayKey(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const task = await prisma.staffTask.findUnique({
    where: { id: parsed.data.taskId },
    select: { id: true, clientId: true, isActive: true },
  });
  if (!task || task.clientId !== session.clientId || !task.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const forDate = dayKey();

  if (!parsed.data.done) {
    // Unticking is allowed. Somebody who ticks the wrong row and cannot undo it
    // learns to be careful rather than to be honest, and we would rather have
    // honest.
    await prisma.staffTaskCompletion.deleteMany({
      where: { taskId: task.id, staffId: session.sub, forDate },
    });
    return NextResponse.json({ ok: true, done: false });
  }

  await prisma.staffTaskCompletion.upsert({
    where: { taskId_staffId_forDate: { taskId: task.id, staffId: session.sub, forDate } },
    update: { note: parsed.data.note?.trim() || null },
    create: {
      taskId: task.id,
      staffId: session.sub,
      forDate,
      note: parsed.data.note?.trim() || null,
    },
  });

  // Ticking it late still clears the chase. The flag stays on the record as
  // history, because deleting it would hide that the system worked.
  await prisma.staffTaskFlag.updateMany({
    where: { taskId: task.id, staffId: session.sub, forDate, resolvedAt: null },
    data: { resolvedAt: new Date(), resolution: "Completed" },
  });

  return NextResponse.json({ ok: true, done: true });
}
