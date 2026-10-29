import { prisma } from "@/lib/prisma";
import { costRun, splitRun, weightedAverageCost, type SplitUnit } from "@/lib/estate/diesel";
import { notifyServiceDue } from "@/lib/estate/service";

/**
 * Starting, stopping and costing a generator run.
 *
 * This is the only place in the section that creates money out of an operational
 * event, so it is the only place that really has to be right. Three rules hold
 * it together:
 *
 *   One run at a time per building. Each building has its own generator, its own
 *   tank and its own rate card, so a building and a machine are the same thing
 *   here — which is what makes this guard correct. A second RUNNING row would
 *   mean two overlapping claims on one set and no honest way to bill either. If
 *   a building ever gains a second generator this is the assumption that breaks
 *   first, and runs would need to hang off a generator rather than a building.
 *
 *   The rates are frozen at stop. A run carries the litres-per-hour and the
 *   naira-per-litre it was costed at, so moving the rate card tomorrow cannot
 *   restate what somebody was charged yesterday.
 *
 *   Allocation happens once. The status transition and the ledger writes are the
 *   same transaction, and the transition is conditional on the row still being
 *   STOPPED, so two clicks on a slow connection cannot bill twelve people twice.
 */

/** The naira-per-litre a building should cost a run at, right now. */
export async function currentPricePerLitre(buildingId: string): Promise<number> {
  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: buildingId },
    select: { dieselPricePerLitre: true, dieselPricingMode: true },
  });

  if (building.dieselPricingMode === "MANUAL_RATE") {
    return Number(building.dieselPricePerLitre);
  }

  // Weighted average across the recent deliveries — the fuel plausibly still in
  // the tank. Falls back to the manual rate when nothing has been delivered yet,
  // because a building with no delivery history still has runs to bill.
  const deliveries = await prisma.estateDieselDelivery.findMany({
    where: { buildingId },
    orderBy: { deliveredAt: "desc" },
    take: 6,
    select: { litres: true, pricePerLitre: true },
  });

  const wac = weightedAverageCost(
    deliveries.map((d) => ({ litres: Number(d.litres), pricePerLitre: Number(d.pricePerLitre) })),
  );
  return wac ?? Number(building.dieselPricePerLitre);
}

export async function runningRun(buildingId: string) {
  return prisma.estateGeneratorRun.findFirst({
    where: { buildingId, status: "RUNNING" },
    orderBy: { startedAt: "desc" },
  });
}

export async function startRun(args: {
  buildingId: string;
  staffId?: string | null;
  userId?: string | null;
  startedAt?: Date;
  meterHours?: number | null;
  photoKey?: string | null;
  note?: string | null;
}) {
  const open = await runningRun(args.buildingId);
  if (open) {
    throw new EstateRunError(
      "This generator is already logged as running. Stop the open run before starting another.",
      "ALREADY_RUNNING",
    );
  }

  return prisma.estateGeneratorRun.create({
    data: {
      buildingId: args.buildingId,
      startedAt: args.startedAt ?? new Date(),
      startedByStaffId: args.staffId ?? null,
      recordedById: args.userId ?? null,
      startMeterHours: args.meterHours ?? null,
      startPhotoKey: args.photoKey ?? null,
      note: args.note ?? null,
      status: "RUNNING",
    },
  });
}

/**
 * Stop a run, cost it, and push it to the ledgers in one go.
 *
 * Costing and allocation are not separated into a review step on purpose. A
 * stopped-but-unallocated run is a bill nobody has been charged for, and the
 * pile of them builds up quietly until a month has to be reconstructed from
 * memory. Corrections happen afterwards, in the open, by voiding.
 */
export async function stopRun(args: {
  runId: string;
  staffId?: string | null;
  userId?: string | null;
  endedAt?: Date;
  meterHours?: number | null;
  photoKey?: string | null;
  note?: string | null;
}) {
  const run = await prisma.estateGeneratorRun.findUnique({
    where: { id: args.runId },
    select: { id: true, buildingId: true, startedAt: true, status: true, note: true },
  });
  if (!run) throw new EstateRunError("That run no longer exists.", "NOT_FOUND");
  if (run.status !== "RUNNING") {
    throw new EstateRunError("That run has already been stopped.", "NOT_RUNNING");
  }

  const endedAt = args.endedAt ?? new Date();
  if (endedAt.getTime() <= run.startedAt.getTime()) {
    throw new EstateRunError("A run cannot end before it started.", "BAD_TIMES");
  }

  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: run.buildingId },
    select: { litresPerHour: true, name: true },
  });
  const litresPerHour = Number(building.litresPerHour);
  const pricePerLitre = await currentPricePerLitre(run.buildingId);

  const cost = costRun({ startedAt: run.startedAt, endedAt, litresPerHour, pricePerLitre });

  await prisma.estateGeneratorRun.update({
    where: { id: run.id },
    data: {
      endedAt,
      endedByStaffId: args.staffId ?? null,
      endMeterHours: args.meterHours ?? null,
      endPhotoKey: args.photoKey ?? null,
      note: args.note ?? run.note,
      runMinutes: cost.runMinutes,
      litresPerHour,
      pricePerLitre,
      litresUsed: cost.litresUsed,
      costNaira: cost.costNaira,
      status: "STOPPED",
      ...(args.userId ? { recordedById: args.userId } : {}),
    },
  });

  const allocated = await allocateRun(run.id);

  // The hours that just landed may have tipped the set over its service
  // interval. Best effort and deliberately after allocation: a mail server
  // having a bad afternoon must never be able to fail a generator stop.
  notifyServiceDue(run.buildingId).catch(() => {});

  return allocated;
}

/**
 * A run that happened, entered after the fact.
 *
 * The live buttons only capture what somebody was present to press. Most of the
 * history arrives the other way — a supervisor with a week of gatehouse
 * handwriting, or a spreadsheet. This takes a finished on/off pair and puts it
 * through exactly the same costing and allocation as a live run, because a
 * backdated hour spends a tenant's deposit no differently from a live one.
 *
 * The overlap check is the whole reason this is not just two calls to the
 * functions above. A supervisor uploading Monday's log when Monday was already
 * captured live would otherwise bill every flat in the building twice, and the
 * second charge looks exactly like the first.
 */
export async function logRun(args: {
  buildingId: string;
  startedAt: Date;
  endedAt: Date;
  staffId?: string | null;
  userId?: string | null;
  note?: string | null;
}) {
  if (args.endedAt.getTime() <= args.startedAt.getTime()) {
    throw new EstateRunError("A run cannot end before it started.", "BAD_TIMES");
  }
  if (args.startedAt.getTime() > Date.now()) {
    throw new EstateRunError("That run starts in the future.", "FUTURE");
  }

  const clash = await overlappingRun(args.buildingId, args.startedAt, args.endedAt);
  if (clash) {
    throw new EstateRunError(
      `That overlaps a run already logged from ${clash.startedAt.toLocaleString("en-NG")}.`,
      "OVERLAP",
    );
  }

  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: args.buildingId },
    select: { litresPerHour: true },
  });
  const litresPerHour = Number(building.litresPerHour);
  const pricePerLitre = await currentPricePerLitre(args.buildingId);
  const cost = costRun({
    startedAt: args.startedAt,
    endedAt: args.endedAt,
    litresPerHour,
    pricePerLitre,
  });

  const run = await prisma.estateGeneratorRun.create({
    data: {
      buildingId: args.buildingId,
      startedAt: args.startedAt,
      endedAt: args.endedAt,
      startedByStaffId: args.staffId ?? null,
      endedByStaffId: args.staffId ?? null,
      recordedById: args.userId ?? null,
      runMinutes: cost.runMinutes,
      litresPerHour,
      pricePerLitre,
      litresUsed: cost.litresUsed,
      costNaira: cost.costNaira,
      note: args.note ?? null,
      status: "STOPPED",
    },
    select: { id: true },
  });

  const allocated = await allocateRun(run.id);
  notifyServiceDue(args.buildingId).catch(() => {});
  return allocated;
}

/**
 * Any live or logged run whose window touches this one.
 *
 * A run still RUNNING has no end, so it is treated as running up to now — which
 * is true, and which stops a backdated entry being slipped underneath one.
 */
export async function overlappingRun(buildingId: string, startedAt: Date, endedAt: Date) {
  return prisma.estateGeneratorRun.findFirst({
    where: {
      buildingId,
      status: { not: "VOID" },
      startedAt: { lt: endedAt },
      OR: [{ endedAt: { gt: startedAt } }, { endedAt: null }],
    },
    orderBy: { startedAt: "asc" },
    select: { id: true, startedAt: true, endedAt: true },
  });
}

/**
 * Split a stopped run across the building's units and write the ledger rows.
 *
 * Safe to call twice. The update is conditioned on the row still being STOPPED,
 * so the second caller's `updateMany` matches nothing and it returns without
 * writing — which is what a double-tapped "stop" button on a bad connection in a
 * gatehouse looks like.
 */
export async function allocateRun(runId: string) {
  const run = await prisma.estateGeneratorRun.findUniqueOrThrow({
    where: { id: runId },
    include: { building: { select: { name: true, slug: true } } },
  });

  if (run.status === "ALLOCATED") return run;
  if (run.status !== "STOPPED") {
    throw new EstateRunError("Only a stopped run can be allocated.", "NOT_STOPPED");
  }
  if (run.costNaira === null || run.litresUsed === null) {
    throw new EstateRunError("That run has not been costed.", "NOT_COSTED");
  }

  const units = await prisma.estateUnit.findMany({
    where: { buildingId: run.buildingId },
    select: { id: true, label: true, dieselShare: true, status: true },
  });

  const splitUnits: SplitUnit[] = units.map((u) => ({
    id: u.id,
    dieselShare: Number(u.dieselShare),
    // Only a let, occupied unit is chased for fuel. A vacancy is the family's
    // cost, not a surcharge quietly spread over whoever is still paying.
    billable: u.status === "OCCUPIED",
    inService: u.status !== "OUT_OF_SERVICE",
  }));

  const split = splitRun({
    costNaira: Number(run.costNaira),
    litresUsed: Number(run.litresUsed),
    units: splitUnits,
  });

  const when = run.endedAt ?? new Date();
  const hours = ((run.runMinutes ?? 0) / 60).toFixed(2);
  const description =
    `Generator ${run.building.name}: ${hours}h at ${Number(run.litresPerHour)} l/hr, ` +
    `₦${Number(run.pricePerLitre).toLocaleString("en-NG")}/litre`;

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.estateGeneratorRun.updateMany({
      where: { id: runId, status: "STOPPED" },
      data: { status: "ALLOCATED", allocatedAt: new Date(), ownerCostNaira: split.ownerAmount },
    });
    // Somebody else got there first. Their rows are already written.
    if (claimed.count === 0) return;

    if (split.lines.length > 0) {
      await tx.estateLedgerEntry.createMany({
        data: split.lines.map((line) => ({
          unitId: line.unitId,
          account: "DIESEL" as const,
          kind: "DIESEL_USAGE" as const,
          // Usage draws the deposit down, so it is negative. The sign convention
          // holds across the whole ledger: positive is credit to the tenant.
          amount: -line.amount,
          litres: line.litres,
          occurredAt: when,
          description,
          generatorRunId: runId,
        })),
      });
    }
  });

  return prisma.estateGeneratorRun.findUniqueOrThrow({ where: { id: runId } });
}

/**
 * Undo a run that should not have been billed.
 *
 * The ledger rows are reversed rather than deleted, and the run is kept as VOID
 * rather than removed. A tenant who saw a charge yesterday should be able to see
 * it cancelled today; a charge that simply vanishes is the thing that makes
 * people start keeping their own records.
 */
export async function voidRun(args: { runId: string; userId: string; reason: string }) {
  const run = await prisma.estateGeneratorRun.findUniqueOrThrow({
    where: { id: args.runId },
    include: { ledgerEntries: true, building: { select: { name: true } } },
  });
  if (run.status === "VOID") return run;

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.estateGeneratorRun.updateMany({
      where: { id: args.runId, status: { not: "VOID" } },
      data: { status: "VOID" },
    });
    if (claimed.count === 0) return;

    const reversals = run.ledgerEntries
      .filter((e) => e.kind === "DIESEL_USAGE")
      .map((e) => ({
        unitId: e.unitId,
        account: e.account,
        kind: "ADJUSTMENT" as const,
        amount: Number(e.amount) * -1,
        litres: e.litres === null ? null : Number(e.litres) * -1,
        occurredAt: new Date(),
        description: `Reversal of ${run.building.name} generator charge: ${args.reason}`,
        generatorRunId: args.runId,
        recordedById: args.userId,
      }));

    if (reversals.length > 0) await tx.estateLedgerEntry.createMany({ data: reversals });
  });

  return prisma.estateGeneratorRun.findUniqueOrThrow({ where: { id: args.runId } });
}

export class EstateRunError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "EstateRunError";
  }
}
