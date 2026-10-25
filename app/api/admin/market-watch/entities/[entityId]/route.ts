import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { entityBody, entityData } from "@/lib/market-watch/entityShape";

export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ entityId: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { entityId } = await ctx.params;
  const parsed = entityBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  await prisma.watchEntity.update({
    where: { id: entityId },
    data: { ...(parsed.data.name ? { name: parsed.data.name } : {}), ...entityData(parsed.data) },
  });
  return Response.json({ ok: true });
});

export const DELETE = handler(async function DELETE(_req: NextRequest, ctx: { params: Promise<{ entityId: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { entityId } = await ctx.params;
  // Mentions keep their reading; they just lose the brand they were filed under.
  await prisma.watchEntity.delete({ where: { id: entityId } });
  return Response.json({ ok: true });
});
