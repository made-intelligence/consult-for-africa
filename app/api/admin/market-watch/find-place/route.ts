import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";
import { watchSession, forbidden } from "@/lib/market-watch/access";
import { findPlaces } from "@/lib/market-watch/sources/dataforseo";

// Look a business up on Google Maps so its reviews can be followed. About $0.002 a search.

export const GET = handler(async function GET(req: NextRequest) {
  if (!(await watchSession())) return forbidden();
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) return Response.json({ error: "Type the business name" }, { status: 400 });
  try {
    return Response.json({ places: await findPlaces(q) });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
});
