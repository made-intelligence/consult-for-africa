import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { logRun, EstateRunError } from "@/lib/estate/runs";
import { duration } from "@/lib/estate/ledger";

/**
 * Writing up a run nobody was there to press a button for.
 *
 * NO PLATFORM AUTH — link plus PIN. Open to anyone on the ground, not just
 * supervisors: the commonest reason a run is missing is that the guard was
 * dealing with the thing that made the power go out, and making him wait for a
 * supervisor to enter it is how it never gets entered at all.
 *
 * It goes through the same costing and allocation as a live run, and the same
 * overlap check, so a run written up twice cannot bill twice.
 */

const schema = z.object({
  buildingId: z.string().min(1).max(40),
  startedAt: z.string().min(10).max(40),
  endedAt: z.string().min(10).max(40),
  note: z.string().max(500).nullable().optional(),
});

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-run-manual", { windowMs: 60_000, max: 30 })) {
    return Response.json({ error: "Too many entries at once. Wait a moment." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter the on and off times." }, { status: 400 });
  const d = parsed.data;

  if (!crewMayTouch(gate.ctx, d.buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const startedAt = new Date(d.startedAt);
  const endedAt = new Date(d.endedAt);
  if (isNaN(startedAt.getTime()) || isNaN(endedAt.getTime())) {
    return Response.json({ error: "Those times could not be read." }, { status: 400 });
  }

  try {
    const run = await logRun({
      buildingId: d.buildingId,
      startedAt,
      endedAt,
      staffId: gate.ctx.staffId,
      note: d.note ?? null,
    });
    return Response.json(
      {
        ok: true,
        runId: run.id,
        message: `Logged ${duration(run.runMinutes ?? 0)} and charged to the flats.`,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof EstateRunError) {
      return Response.json({ error: err.message, code: err.code }, { status: 409 });
    }
    throw err;
  }
});
