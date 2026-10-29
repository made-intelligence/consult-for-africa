import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { SECTOR_NAMES } from "@/lib/market-watch/taxonomy";

const body = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  sector: z.enum(SECTOR_NAMES as [string, ...string[]]).optional(),
  clientId: z.string().nullable().optional(),
  engagementId: z.string().nullable().optional(),
  context: z.string().max(2000).nullable().optional(),
  alertEmails: z.array(z.string().trim().email()).max(20).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
});

export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { id } = await ctx.params;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const d = parsed.data;
  await prisma.marketWatch.update({
    where: { id },
    data: { ...d, clientId: d.clientId === "" ? null : d.clientId, engagementId: d.engagementId === "" ? null : d.engagementId },
  });
  return Response.json({ ok: true });
});
