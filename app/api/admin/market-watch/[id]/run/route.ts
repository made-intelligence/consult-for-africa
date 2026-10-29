import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { runWatch } from "@/lib/market-watch/ingest";
import { classifyPending } from "@/lib/market-watch/classify";
import { raiseAlerts, sendAlerts } from "@/lib/market-watch/alerts";

// "Run now": every available source, whether due or not, then read and alert.

export const maxDuration = 300;

export const POST = handler(async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) return forbidden();
  const { id } = await ctx.params;
  const sources = await runWatch(id, { force: true });
  const read = await classifyPending(id);
  const raised = await raiseAlerts(id);
  const emailed = await sendAlerts(id);
  return Response.json({ sources, read, raised, emailed });
});
