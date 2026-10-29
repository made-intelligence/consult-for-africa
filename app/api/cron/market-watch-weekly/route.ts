/**
 * Market Watch, Monday 06:00 Lagos. Each active watch's week becomes a draft
 * client dashboard for a partner to publish, and the brief goes by email to
 * the watch's CFA recipients. Nothing reaches the client from here. Also
 * clears mentions past the retention period.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { saveWeeklyDraft } from "@/lib/market-watch/compose";
import { pruneOld } from "@/lib/market-watch/ingest";
import { sendBrief } from "@/lib/market-watch/brief";

export const maxDuration = 300;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export const POST = handler(async function POST(req: NextRequest) { return run(req); });
export const GET = handler(async function GET(req: NextRequest) { return run(req); });

async function run(req: NextRequest): Promise<Response> {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const watches = await prisma.marketWatch.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true, alertEmails: true } });
  const out: Record<string, unknown>[] = [];
  for (const w of watches) {
    try {
      const { dashboardId, composed } = await saveWeeklyDraft(w.id);
      await sendBrief(w, dashboardId, composed.data);
      out.push({ watch: w.name, dashboardId });
    } catch (err) {
      console.error(`[cron market-watch-weekly] ${w.name}`, err);
      out.push({ watch: w.name, error: (err as Error).message });
    }
  }
  const pruned = await pruneOld();
  return Response.json({ ok: true, watches: out, pruned });
}
