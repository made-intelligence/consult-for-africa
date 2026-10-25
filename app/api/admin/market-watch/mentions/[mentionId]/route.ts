import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";

// Staff working the feed: mark handled, star, or correct the reading.
// A correction is recorded so the reader never overwrites it.

const body = z.object({
  handled: z.boolean().optional(),
  starred: z.boolean().optional(),
  relevant: z.boolean().optional(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"]).optional(),
  isLead: z.boolean().optional(),
  isComplaint: z.boolean().optional(),
  isRisk: z.boolean().optional(),
});

export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ mentionId: string }> }) {
  const session = await watchSession();
  if (!session) return forbidden();
  const { mentionId } = await ctx.params;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { handled, starred, ...reading } = parsed.data;
  const who = session.user.name ?? session.user.email ?? "staff";
  const corrected = Object.keys(reading).length > 0;
  await prisma.watchMention.update({
    where: { id: mentionId },
    data: {
      ...reading,
      ...(starred !== undefined ? { starred } : {}),
      ...(handled !== undefined ? { handledAt: handled ? new Date() : null, handledBy: handled ? who : null } : {}),
      ...(corrected ? { correctedBy: who, classifiedAt: new Date() } : {}),
    },
  });
  return Response.json({ ok: true });
});
