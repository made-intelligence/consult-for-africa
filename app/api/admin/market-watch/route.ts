import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { SECTOR_NAMES } from "@/lib/market-watch/taxonomy";

// Start a watch: who it is for and what the business does. Brands come next, on the setup page.

const body = z.object({
  name: z.string().trim().min(2).max(120),
  sector: z.enum(SECTOR_NAMES as [string, ...string[]]).default("healthcare"),
  clientId: z.string().nullable().optional(),
  engagementId: z.string().nullable().optional(),
  context: z.string().max(2000).nullable().optional(),
});

export const POST = handler(async function POST(req: NextRequest) {
  const session = await watchSession();
  if (!session) return forbidden();
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name the watch" }, { status: 400 });
  const d = parsed.data;
  const watch = await prisma.marketWatch.create({
    data: {
      name: d.name,
      sector: d.sector,
      clientId: d.clientId || null,
      engagementId: d.engagementId || null,
      context: d.context || null,
      alertEmails: session.user.email ? [session.user.email] : [],
      createdById: session.user.id,
    },
    select: { id: true },
  });
  return Response.json({ id: watch.id });
});
