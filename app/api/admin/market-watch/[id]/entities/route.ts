import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { entityBody, entityData } from "@/lib/market-watch/entityShape";

export const POST = handler(async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { id } = await ctx.params;
  const parsed = entityBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !parsed.data.name) return Response.json({ error: "Give the brand a name" }, { status: 400 });
  const e = await prisma.watchEntity.create({ data: { watchId: id, name: parsed.data.name, ...entityData(parsed.data) }, select: { id: true } });
  return Response.json({ id: e.id });
});
