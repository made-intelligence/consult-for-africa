/**
 * Market Watch, every three hours. For each active watch: ask the sources that
 * are due, collect slow jobs that have finished, read what came in, raise
 * alerts and email them. Sources keep their own cadence (see
 * lib/market-watch/sources), so most runs only touch the cheap, fast ones.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { runWatch } from "@/lib/market-watch/ingest";
import { classifyPending } from "@/lib/market-watch/classify";
import { raiseAlerts, sendAlerts } from "@/lib/market-watch/alerts";

export const maxDuration = 300;

/** Leave room to finish the watch in hand before the function is killed. */
const BUDGET_MS = 240_000;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export const POST = handler(async function POST(req: NextRequest) { return run(req); });
export const GET = handler(async function GET(req: NextRequest) { return run(req); });

async function run(req: NextRequest): Promise<Response> {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const started = Date.now();
  // Least recently run first, so a slow day still reaches every watch in turn.
  const watches = await prisma.marketWatch.findMany({
    where: { status: "ACTIVE" },
    orderBy: { lastRunAt: { sort: "asc", nulls: "first" } },
    select: { id: true, name: true },
  });
  const out: Record<string, unknown>[] = [];
  for (const w of watches) {
    if (Date.now() - started > BUDGET_MS) {
      out.push({ watch: w.name, deferred: true });
      continue;
    }
    try {
      const sources = await runWatch(w.id);
      const read = await classifyPending(w.id);
      const raised = await raiseAlerts(w.id);
      const emailed = await sendAlerts(w.id);
      out.push({ watch: w.name, sources, read, raised, emailed });
    } catch (err) {
      console.error(`[cron market-watch] ${w.name}`, err);
      out.push({ watch: w.name, error: (err as Error).message });
    }
  }
  return Response.json({ ok: true, watches: out });
}
