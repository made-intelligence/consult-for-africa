import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { gateCrew } from "@/lib/estate/gate";
import { STATUS_LABELS, OPEN_STATUSES } from "@/lib/estate/issues";
import { serviceStates } from "@/lib/estate/service";

/**
 * Everything the ground-team screen needs, in one call.
 *
 * One call rather than five because this is a cheap handset on a Lagos mobile
 * network, and a screen that renders in five staggered pieces is a screen where
 * somebody taps "start" before the "already running" banner has arrived.
 */

export const GET = handler(async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  const ctx = gate.ctx;

  if (ctx.locked) {
    return Response.json({ locked: true, name: ctx.name });
  }

  const buildings = await prisma.estateBuilding.findMany({
    where: { id: { in: ctx.buildingIds }, active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      litresPerHour: true,
      dieselPricePerLitre: true,
      tankCapacityL: true,
      generatorLabel: true,
      runs: {
        where: { status: "RUNNING" },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          startedAt: true,
          // Two guards to a building means a run is often started on one shift
          // and stopped on the next. Whoever walks in needs to know the set was
          // left running and by whom, without ringing anybody.
          startedByStaff: { select: { id: true, name: true } },
        },
      },
      tankReadings: {
        orderBy: { readAt: "desc" },
        take: 1,
        select: { litres: true, readAt: true },
      },
    },
  });

  const buildingIds = buildings.map((b) => b.id);
  const services = await serviceStates(buildingIds);

  const [recentRuns, openIssues] = await Promise.all([
    prisma.estateGeneratorRun.findMany({
      where: { buildingId: { in: buildingIds }, status: { in: ["STOPPED", "ALLOCATED"] } },
      orderBy: { startedAt: "desc" },
      take: 8,
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        runMinutes: true,
        litresUsed: true,
        building: { select: { name: true } },
        startedByStaff: { select: { name: true } },
        endedByStaff: { select: { name: true } },
      },
    }),
    prisma.estateIssue.findMany({
      where: { buildingId: { in: buildingIds }, status: { in: OPEN_STATUSES } },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 25,
      select: {
        id: true,
        reference: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        assignedStaffId: true,
        unit: { select: { label: true } },
        building: { select: { name: true } },
      },
    }),
  ]);

  return Response.json({
    locked: false,
    name: ctx.name,
    role: ctx.role,
    scopeLabel: ctx.scopeLabel,
    buildings: buildings.map((b) => ({
      id: b.id,
      name: b.name,
      generatorLabel: b.generatorLabel,
      litresPerHour: Number(b.litresPerHour),
      pricePerLitre: Number(b.dieselPricePerLitre),
      tankCapacityL: b.tankCapacityL,
      running: b.runs[0]
        ? {
            id: b.runs[0].id,
            startedAt: b.runs[0].startedAt,
            startedBy: b.runs[0].startedByStaff?.name ?? null,
            startedByMe: b.runs[0].startedByStaff?.id === ctx.staffId,
          }
        : null,
      lastDip: b.tankReadings[0]
        ? { litres: Number(b.tankReadings[0].litres), readAt: b.tankReadings[0].readAt }
        : null,
      service: {
        hoursRemaining: services.get(b.id)!.hoursRemaining,
        status: services.get(b.id)!.status,
      },
    })),
    recentRuns: recentRuns.map((r) => ({
      id: r.id,
      building: r.building.name,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      runMinutes: r.runMinutes,
      litresUsed: r.litresUsed === null ? null : Number(r.litresUsed),
      startedBy: r.startedByStaff?.name ?? null,
      endedBy: r.endedByStaff?.name ?? null,
    })),
    issues: openIssues.map((i) => ({
      id: i.id,
      reference: i.reference,
      title: i.title,
      category: i.category,
      priority: i.priority,
      status: i.status,
      statusLabel: STATUS_LABELS[i.status],
      building: i.building.name,
      unit: i.unit?.label ?? null,
      mine: i.assignedStaffId === ctx.staffId,
      createdAt: i.createdAt,
    })),
  });
});
