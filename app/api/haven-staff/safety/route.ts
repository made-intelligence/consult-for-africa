import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession, can } from "@/lib/staffAuth";

// Move a safety register case along: take it, agree what changes, close it.
//
// Three explicit steps rather than a status dropdown, because each one asks for
// the thing that makes it real. Taking it names an investigator. Agreeing names
// an action, an owner and a date. Closing says, in words the whole team will
// read, what changed. A case cannot be closed with nothing to tell the person
// who reported it.

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal("take"),
    id: z.string().min(1),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  }),
  z.object({
    step: z.literal("agree"),
    id: z.string().min(1),
    findings: z.string().trim().min(10).max(4000),
    action: z.string().trim().min(5).max(2000),
    actionOwner: z.string().trim().min(2).max(160),
    actionDueAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  z.object({
    step: z.literal("close"),
    id: z.string().min(1),
    teamNote: z.string().trim().min(10).max(1000),
  }),
]);

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  // The same people who may read the detail. Investigating is leadership's
  // job, and the reporter's anonymity is only as good as that line.
  if (!can(session, "VIEW_NEAR_MISS_DETAIL")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in every box. The findings need a sentence, not a word." }, { status: 400 });
  }
  const d = parsed.data;

  const r = await prisma.safetyReport.findUnique({ where: { id: d.id }, select: { id: true, clientId: true, status: true } });
  if (!r || r.clientId !== session!.clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (d.step === "take") {
    if (r.status !== "NEW") return NextResponse.json({ error: "Somebody has already taken this one." }, { status: 409 });
    await prisma.safetyReport.update({
      where: { id: r.id },
      data: { status: "INVESTIGATING", investigatorId: session!.sub, takenAt: new Date(), severity: d.severity },
    });
  } else if (d.step === "agree") {
    if (r.status === "CLOSED" || r.status === "NEW") {
      return NextResponse.json({ error: "Take it first, then agree the action." }, { status: 409 });
    }
    await prisma.safetyReport.update({
      where: { id: r.id },
      data: {
        status: "ACTION_AGREED",
        findings: d.findings,
        action: d.action,
        actionOwner: d.actionOwner,
        actionDueAt: new Date(`${d.actionDueAt}T00:00:00Z`),
      },
    });
  } else {
    if (r.status !== "ACTION_AGREED") {
      return NextResponse.json({ error: "Agree what changes before closing it." }, { status: 409 });
    }
    await prisma.safetyReport.update({
      where: { id: r.id },
      data: { status: "CLOSED", closedAt: new Date(), teamNote: d.teamNote },
    });
  }

  return NextResponse.json({ ok: true });
}
