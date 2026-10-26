import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";

export const POST = handler(async function POST(_req: NextRequest, ctx: { params: Promise<{ alertId: string }> }) {
  const session = await watchSession();
  if (!session) return forbidden();
  const { alertId } = await ctx.params;
  await prisma.watchAlert.update({
    where: { id: alertId },
    data: { acknowledgedAt: new Date(), acknowledgedBy: session.user.name ?? session.user.email ?? "staff" },
  });
  return Response.json({ ok: true });
});
