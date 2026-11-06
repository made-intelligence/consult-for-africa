import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { appointLead, currentTerm } from "@/lib/havenLeadTerm";

// Appoint the next rotating lead (leadership or the Head of Clinical Services),
// or save the current lead's handover note (the lead themselves).

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("appoint"), teamId: z.string(), staffId: z.string(), startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  z.object({ action: z.literal("handover"), teamId: z.string(), note: z.string().trim().min(3).max(4000) }),
]);

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const b = parsed.data;

  if (b.action === "appoint") {
    const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { roleCode: true } });
    if (!session.tiers.includes("LEADERSHIP") && me?.roleCode !== "HCS") return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    try {
      const { endsOn } = await appointLead({ clientId: session.clientId, teamId: b.teamId, staffId: b.staffId, startsOn: new Date(`${b.startsOn}T00:00:00Z`) });
      return NextResponse.json({ ok: true, endsOn });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 422 });
    }
  }

  const term = await currentTerm(b.teamId);
  if (!term || term.staffId !== session.sub) return NextResponse.json({ error: "Only the current lead writes the handover note" }, { status: 403 });
  await prisma.leadTerm.update({ where: { id: term.id }, data: { handoverNote: b.note } });
  return NextResponse.json({ ok: true });
}
