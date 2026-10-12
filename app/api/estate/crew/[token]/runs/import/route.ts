import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { parseRunSheet, internalOverlaps, type ParsedRun } from "@/lib/estate/runImport";
import { logRun, overlappingRun, EstateRunError } from "@/lib/estate/runs";

/**
 * A week of gatehouse handwriting, arriving as a spreadsheet.
 *
 * NO PLATFORM AUTH — link plus PIN, and supervisors only. This is the one
 * action here that can create dozens of charges in a single tap, which is a
 * different kind of mistake from mistyping one run.
 *
 * Always previews first. The upload returns what it read, what it could not
 * read, and what clashes with runs already logged; nothing is written until the
 * same file comes back with confirm set. Rows that clash are dropped rather than
 * failing the batch, because a supervisor re-uploading a sheet after adding two
 * days to the bottom of it is the normal case, not an error.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 400;

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-run-import", { windowMs: 60_000, max: 10 })) {
    return Response.json({ error: "Too many uploads. Wait a moment." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });
  if (gate.ctx.role !== "SUPERVISOR") {
    return Response.json(
      { error: "Uploading a log is a supervisor's job. Enter single runs by hand instead." },
      { status: 403 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const buildingId = String(form?.get("buildingId") ?? "");
  const confirm = String(form?.get("confirm") ?? "") === "true";

  if (!(file instanceof File)) return Response.json({ error: "Attach a file." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That file is too large. The limit is 5MB." }, { status: 400 });
  }
  if (!crewMayTouch(gate.ctx, buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const parsed = parseRunSheet(await file.arrayBuffer());
  if (parsed.runs.length === 0) {
    return Response.json({ ok: false, ...parsed, clashes: [], wrote: 0 }, { status: 400 });
  }
  if (parsed.runs.length > MAX_ROWS) {
    return Response.json(
      { error: `That sheet has ${parsed.runs.length} runs on it. Split it into months.` },
      { status: 400 },
    );
  }

  const errors = [...parsed.errors, ...internalOverlaps(parsed.runs)];
  const clashingRows = new Set(errors.map((e) => e.row));

  // Against what is already in the book, not just against itself.
  const clashes: Array<{ row: number; reason: string }> = [];
  const clean: ParsedRun[] = [];
  for (const r of parsed.runs) {
    if (clashingRows.has(r.row)) continue;
    const existing = await overlappingRun(buildingId, r.startedAt, r.endedAt);
    if (existing) {
      clashes.push({
        row: r.row,
        reason: `Already logged from ${existing.startedAt.toLocaleString("en-NG")}.`,
      });
    } else {
      clean.push(r);
    }
  }

  const totalMinutes = clean.reduce((s, r) => s + r.minutes, 0);
  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: buildingId },
    select: { name: true, litresPerHour: true, dieselPricePerLitre: true },
  });
  const litres = (totalMinutes / 60) * Number(building.litresPerHour);

  const preview = {
    columns: parsed.columns,
    building: building.name,
    readable: clean.length,
    errors,
    clashes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    estimatedLitres: Math.round(litres * 10) / 10,
    estimatedCost: Math.round(litres * Number(building.dieselPricePerLitre) * 100) / 100,
    runs: clean.slice(0, 50).map((r) => ({
      row: r.row,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      minutes: r.minutes,
      crossedMidnight: r.crossedMidnight,
    })),
  };

  if (!confirm) return Response.json({ ok: true, preview, wrote: 0 });

  // Sequential on purpose. Each write re-checks for overlap, and running them
  // in parallel would let two rows in the same sheet race past that check.
  let wrote = 0;
  const failed: Array<{ row: number; reason: string }> = [];
  for (const r of clean) {
    try {
      await logRun({
        buildingId,
        startedAt: r.startedAt,
        endedAt: r.endedAt,
        staffId: gate.ctx.staffId,
        note: `Imported from a log sheet, row ${r.row}`,
      });
      wrote++;
    } catch (err) {
      failed.push({
        row: r.row,
        reason: err instanceof EstateRunError ? err.message : "Could not be saved.",
      });
    }
  }

  return Response.json({ ok: true, preview, wrote, failed });
});
