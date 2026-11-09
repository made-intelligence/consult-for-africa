import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { safetyPATCH } from "@/lib/staffRoutes/safety";

export const dynamic = "force-dynamic";

// Report something that went wrong, nearly went wrong, or is broken. Signed in,
// so we know which practice it belongs to, but the person is not recorded
// unless they choose to give a name. A report people fear being named on is a
// report they do not file.

const schema = z.object({
  kind: z.enum(["NEAR_MISS", "BROKEN"]),
  what: z.string().trim().min(5).max(4000),
  why: z.string().trim().max(2000).optional(),
  reachedPatient: z.enum(["Yes", "No", "Not sure"]).optional(),
  name: z.string().trim().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Say what happened in a sentence." }, { status: 400 });
  const d = parsed.data;

  await prisma.safetyReport.create({
    data: {
      clientId: session.clientId,
      kind: d.kind,
      sourceId: `arabella-staff:${crypto.randomUUID()}`,
      what: d.what,
      why: d.why || null,
      reachedPatient: d.reachedPatient ?? null,
      reportedBy: d.name || null,
      reportedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true });
}

// Take it, agree what changes, close it: the same steps as Haven's register.
export const PATCH = safetyPATCH(() => getSiteSession(ARABELLA));
