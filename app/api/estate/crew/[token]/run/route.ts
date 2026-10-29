import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { startRun, stopRun, EstateRunError } from "@/lib/estate/runs";
import { isEstateKey } from "@/lib/estate/photos";
import { duration } from "@/lib/estate/ledger";

/**
 * The switch. NO PLATFORM AUTH — the link plus the PIN is the credential.
 *
 * This is the single most consequential button in the estate: stopping a run is
 * what freezes the meter on twelve people's bills, and starting one is what
 * begins spending their deposits. It is also the button that gets pressed by
 * somebody standing next to a generator in the rain, so everything else about
 * this route bends towards being hard to get wrong — one action name, a clear
 * refusal when a run is already open, and an hour-meter reading that is optional
 * rather than a thing that blocks the log.
 */

const schema = z.object({
  action: z.enum(["start", "stop"]),
  buildingId: z.string().min(1).max(40),
  meterHours: z.number().nonnegative().max(1_000_000).nullable().optional(),
  photoKey: z.string().max(400).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-run", { windowMs: 60_000, max: 20 })) {
    return Response.json({ error: "Too many attempts. Wait a moment." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  if (!crewMayTouch(gate.ctx, d.buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const photoKey = d.photoKey && isEstateKey(d.photoKey, "run") ? d.photoKey : null;

  try {
    if (d.action === "start") {
      const run = await startRun({
        buildingId: d.buildingId,
        staffId: gate.ctx.staffId,
        meterHours: d.meterHours ?? null,
        photoKey,
        note: d.note ?? null,
      });
      return Response.json(
        { ok: true, runId: run.id, startedAt: run.startedAt, message: "Generator logged as ON." },
        { status: 201 },
      );
    }

    const open = await import("@/lib/estate/runs").then((m) => m.runningRun(d.buildingId));
    if (!open) {
      return Response.json(
        { error: "There is no open run for this generator to stop." },
        { status: 409 },
      );
    }

    const run = await stopRun({
      runId: open.id,
      staffId: gate.ctx.staffId,
      meterHours: d.meterHours ?? null,
      photoKey,
      note: d.note ?? null,
    });

    return Response.json({
      ok: true,
      runId: run.id,
      runMinutes: run.runMinutes,
      litresUsed: run.litresUsed === null ? null : Number(run.litresUsed),
      message: `Generator logged as OFF after ${duration(run.runMinutes ?? 0)}.`,
    });
  } catch (err) {
    if (err instanceof EstateRunError) {
      // These are operator mistakes with a sensible thing to say, not faults.
      return Response.json({ error: err.message, code: err.code }, { status: 409 });
    }
    throw err;
  }
});
