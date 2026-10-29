import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";

// One click opt out from hospital sales email. Suppresses the address on the
// email channel, which every CFA bulk sender checks, so it also stops any
// other product's campaign reaching the same inbox.

const body = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{16,40}$/) });

export const POST = handler(async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const send = await prisma.salesCampaignSend.findUnique({
    where: { token: parsed.data.token },
    select: { id: true, email: true, unsubscribedAt: true },
  });
  if (!send) return NextResponse.json({ ok: false }, { status: 404 });
  if (!send.unsubscribedAt) {
    await prisma.$transaction([
      prisma.salesCampaignSend.update({ where: { id: send.id }, data: { unsubscribedAt: new Date() } }),
      prisma.communicationSuppression.upsert({
        where: { email_channel: { email: send.email, channel: "EMAIL" } },
        create: { email: send.email, channel: "EMAIL", reason: "OPTED_OUT", notes: "Hospital sales email opt out" },
        update: {},
      }),
    ]);
  }
  return NextResponse.json({ ok: true });
});
