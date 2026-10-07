import { prisma } from "@/lib/prisma";

/**
 * The 200-hour service clock.
 *
 * The same run log that splits the fuel bill drives this, and that is the point:
 * hours are logged once and answer two questions. How much diesel came to each
 * flat, and how close the set is to its next service.
 *
 * Counted in running hours rather than on a calendar, because a generator that
 * ran four hundred hours in a month is due before one that ran forty, and a
 * date-based schedule cannot see the difference. It is also why nobody can keep
 * this in their head: the number only exists if something is adding it up.
 */

export const DEFAULT_INTERVAL_HOURS = 200;

/** Hours left before a service stops being a plan and becomes a problem. */
const WARN_AT_HOURS_REMAINING = 20;

export type ServiceStatus = "OK" | "DUE_SOON" | "DUE" | "OVERDUE";

export interface ServiceState {
  buildingId: string;
  intervalHours: number;
  /** Running hours since the last service, or since records began. */
  hoursSinceService: number;
  hoursRemaining: number;
  status: ServiceStatus;
  lastServicedAt: Date | null;
  lastServicedBy: string | null;
  /** Never serviced through this system. The first figure is hours logged. */
  everServiced: boolean;
  /** Plain English, because this is what goes in the email and on the banner. */
  reading: string;
}

export function statusFor(hoursSince: number, interval: number): ServiceStatus {
  const remaining = interval - hoursSince;
  if (remaining <= -interval * 0.25) return "OVERDUE";
  if (remaining <= 0) return "DUE";
  if (remaining <= WARN_AT_HOURS_REMAINING) return "DUE_SOON";
  return "OK";
}

/** Where the service state for one building stands right now. */
export async function serviceState(buildingId: string): Promise<ServiceState> {
  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: buildingId },
    select: { id: true, name: true, serviceIntervalHours: true },
  });

  const last = await prisma.estateGeneratorService.findFirst({
    where: { buildingId },
    orderBy: { servicedAt: "desc" },
    select: { servicedAt: true, performedBy: true },
  });

  const agg = await prisma.estateGeneratorRun.aggregate({
    where: {
      buildingId,
      status: { in: ["STOPPED", "ALLOCATED"] },
      ...(last ? { startedAt: { gte: last.servicedAt } } : {}),
    },
    _sum: { runMinutes: true },
  });

  const hoursSince = round1((agg._sum.runMinutes ?? 0) / 60);
  const interval = building.serviceIntervalHours;
  const remaining = round1(interval - hoursSince);
  const status = statusFor(hoursSince, interval);

  return {
    buildingId,
    intervalHours: interval,
    hoursSinceService: hoursSince,
    hoursRemaining: remaining,
    status,
    lastServicedAt: last?.servicedAt ?? null,
    lastServicedBy: last?.performedBy ?? null,
    everServiced: !!last,
    reading: read(building.name, status, hoursSince, remaining, interval, !!last),
  };
}

export async function serviceStates(buildingIds: string[]): Promise<Map<string, ServiceState>> {
  const states = await Promise.all(buildingIds.map((id) => serviceState(id)));
  return new Map(states.map((s) => [s.buildingId, s]));
}

function read(
  name: string,
  status: ServiceStatus,
  hoursSince: number,
  remaining: number,
  interval: number,
  everServiced: boolean,
): string {
  const basis = everServiced
    ? `${hoursSince} hours since the last service`
    : `${hoursSince} hours logged and no service recorded yet`;

  switch (status) {
    case "OVERDUE":
      return `The ${name} generator is ${Math.abs(remaining)} hours past its ${interval}-hour service — ${basis}. Running a set this far over is how a rewind starts.`;
    case "DUE":
      return `The ${name} generator is due its ${interval}-hour service now: ${basis}.`;
    case "DUE_SOON":
      return `The ${name} generator is ${remaining} hours from its ${interval}-hour service. Worth booking now — ${basis}.`;
    default:
      return `${remaining} hours to the next service on the ${name} generator: ${basis}.`;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Should a notice go out, and which one?
 *
 * Two stamps rather than one, because "book it" and "stop putting it off" are
 * different messages and each should arrive once. Without them every stop past
 * two hundred hours would send another email until everybody filtered the
 * sender, which is the failure mode that makes a reminder system worse than no
 * reminder system at all.
 */
export function noticeDue(
  status: ServiceStatus,
  warnNotifiedAt: Date | null,
  dueNotifiedAt: Date | null,
): "WARN" | "DUE" | null {
  if ((status === "DUE" || status === "OVERDUE") && !dueNotifiedAt) return "DUE";
  if (status === "DUE_SOON" && !warnNotifiedAt) return "WARN";
  return null;
}

/**
 * Send the service notice, and stamp it so it does not send again.
 *
 * Addressed to whoever holds the SERVICE_ENGINEER role for that building, with
 * the estate manager copied. Best effort throughout: a mail server having a bad
 * afternoon must never be able to fail the generator stop that triggered it.
 */
export async function notifyServiceDue(buildingId: string): Promise<"WARN" | "DUE" | null> {
  const [state, building] = await Promise.all([
    serviceState(buildingId),
    prisma.estateBuilding.findUniqueOrThrow({
      where: { id: buildingId },
      select: { name: true, area: true, serviceWarnNotifiedAt: true, serviceDueNotifiedAt: true },
    }),
  ]);

  const notice = noticeDue(
    state.status,
    building.serviceWarnNotifiedAt,
    building.serviceDueNotifiedAt,
  );
  if (!notice) return null;

  const engineers = await prisma.estateStaff.findMany({
    where: {
      active: true,
      role: "SERVICE_ENGINEER",
      email: { not: null },
      OR: [{ buildingId }, { area: building.area }, { AND: [{ buildingId: null }, { area: null }] }],
    },
    select: { name: true, email: true },
  });

  const to = [
    ...engineers.map((e) => e.email!),
    ...(process.env.ESTATE_MANAGER_EMAIL ? [process.env.ESTATE_MANAGER_EMAIL] : []),
  ];

  // Stamp first. A notice that failed to send and can be retried forever is
  // worse than one that was missed: the retry loop is what floods the inbox.
  await prisma.estateBuilding.update({
    where: { id: buildingId },
    data: notice === "DUE" ? { serviceDueNotifiedAt: new Date() } : { serviceWarnNotifiedAt: new Date() },
  });

  if (to.length > 0) {
    const { notifyInternal } = await import("@/lib/email");
    await notifyInternal(
      to,
      notice === "DUE"
        ? `Generator service due — ${building.name}`
        : `Generator service approaching — ${building.name}`,
      `<p>${state.reading}</p><p>Hours since last service: <strong>${state.hoursSinceService}</strong> of ${state.intervalHours}.</p>` +
        (state.lastServicedAt
          ? `<p>Last serviced ${state.lastServicedAt.toDateString()} by ${state.lastServicedBy}.</p>`
          : `<p>No previous service is recorded for this set.</p>`),
    ).catch(() => {});
  }

  return notice;
}

/** Logging a service clears both stamps, so the next cycle can notify again. */
export async function clearNotices(buildingId: string): Promise<void> {
  await prisma.estateBuilding.update({
    where: { id: buildingId },
    data: { serviceWarnNotifiedAt: null, serviceDueNotifiedAt: null },
  });
}
