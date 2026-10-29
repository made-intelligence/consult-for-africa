import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { saveWeeklyDraft } from "@/lib/market-watch/compose";

// Compose this week now, as a draft. Nothing reaches the client until a partner publishes it.

export const maxDuration = 120;

export const POST = handler(async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { id } = await ctx.params;
  const { dashboardId, composed } = await saveWeeklyDraft(id);
  return Response.json({ dashboardId, headline: composed.data.headline });
});
