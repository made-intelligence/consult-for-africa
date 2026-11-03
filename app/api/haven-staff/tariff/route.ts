import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { ownsTariffFixes } from "@/lib/haven-tariff";

// Mark a tariff fix done, or reopen it.

export const dynamic = "force-dynamic";

const schema = z.object({ fixId: z.string().min(1), done: z.boolean(), note: z.string().trim().max(500).optional() });

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { position: true } });
  if (!ownsTariffFixes(session.tiers, me?.position ?? "")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const fix = await prisma.tariffFix.findFirst({ where: { id: parsed.data.fixId, clientId: session.clientId } });
  if (!fix) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.tariffFix.update({
    where: { id: fix.id },
    data: parsed.data.done
      ? { doneAt: new Date(), doneById: session.sub, doneNote: parsed.data.note || null }
      : { doneAt: null, doneById: null, doneNote: null },
  });
  return NextResponse.json({ ok: true });
}
