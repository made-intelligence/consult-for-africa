import type { EstateIssueCategory, EstateIssuePriority, EstateIssueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Complaints, and the clocks that run on them.
 *
 * The loudest complaint residents of Lagos estates make is not that the service
 * charge is high. It is that they cannot see anything happening for it. So the
 * unit of value here is not the work order, it is the evidence: an
 * acknowledgement within hours, a name against the job, and a photograph at the
 * end. A ticket closed without a photograph has not really been closed.
 */

/**
 * Two clocks, not one.
 *
 * A tenant forgives a repair that takes three days far more readily than silence
 * that takes three hours, and the two are reported separately for that reason.
 * Both start when the office acknowledges, not when the tenant sends: the
 * response target has to be one somebody can actually be held to, and nobody is
 * accountable for a message that arrived at 03:00.
 */
export const SLA: Record<EstateIssuePriority, { respondHours: number; resolveHours: number; label: string }> = {
  EMERGENCY: { respondHours: 1, resolveHours: 8, label: "Someone is unsafe or the building is being damaged" },
  HIGH: { respondHours: 4, resolveHours: 48, label: "A service is out or a safety issue is developing" },
  NORMAL: { respondHours: 24, resolveHours: 120, label: "Needs doing, nothing is at risk" },
  LOW: { respondHours: 48, resolveHours: 240, label: "Cosmetic, or can wait for the next visit" },
};

export function slaTargets(priority: EstateIssuePriority, from: Date = new Date()) {
  const { respondHours, resolveHours } = SLA[priority];
  const hour = 60 * 60 * 1000;
  return {
    respondBy: new Date(from.getTime() + respondHours * hour),
    resolveBy: new Date(from.getTime() + resolveHours * hour),
  };
}

/** Past its target and still not there. */
export function isBreached(
  issue: { respondBy: Date | null; resolveBy: Date | null; acknowledgedAt: Date | null; resolvedAt: Date | null },
  now: Date = new Date(),
): { response: boolean; resolution: boolean } {
  return {
    response: !!issue.respondBy && !issue.acknowledgedAt && now > issue.respondBy,
    resolution: !!issue.resolveBy && !issue.resolvedAt && now > issue.resolveBy,
  };
}

export const CATEGORY_LABELS: Record<EstateIssueCategory, string> = {
  POWER: "Power and generator",
  WATER: "Water supply",
  SECURITY: "Security and access",
  PLUMBING: "Plumbing and leaks",
  ELECTRICAL: "Electrical",
  AIR_CONDITIONING: "Air conditioning",
  APPLIANCE: "Appliances",
  STRUCTURAL: "Structural and finishes",
  CLEANING: "Cleaning and common areas",
  WASTE: "Waste collection",
  LIFT: "Lift",
  PEST: "Pests and fumigation",
  POOL: "Swimming pool",
  INTERNET: "Internet and cable",
  OTHER: "Something else",
};

/**
 * Ordered for a tenant staring at a form during a blackout, not alphabetically.
 * Power and water sit at the top because that is what nearly every message is
 * about, and a form whose first option is "Air conditioning" is a form people
 * fill in wrongly.
 */
export const CATEGORY_ORDER: EstateIssueCategory[] = [
  "POWER",
  "WATER",
  "SECURITY",
  "PLUMBING",
  "ELECTRICAL",
  "AIR_CONDITIONING",
  "APPLIANCE",
  "CLEANING",
  "WASTE",
  "LIFT",
  "PEST",
  "POOL",
  "STRUCTURAL",
  "INTERNET",
  "OTHER",
];

export const STATUS_LABELS: Record<EstateIssueStatus, string> = {
  SUBMITTED: "Sent",
  ACKNOWLEDGED: "Seen by the office",
  SCHEDULED: "Visit booked",
  IN_PROGRESS: "Being worked on",
  AWAITING_PARTS: "Waiting on a part",
  RESOLVED: "Fixed",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

export const STATUS_TONE: Record<EstateIssueStatus, { bg: string; color: string }> = {
  SUBMITTED: { bg: "#FEF3C7", color: "#92400E" },
  ACKNOWLEDGED: { bg: "#DBEAFE", color: "#1E40AF" },
  SCHEDULED: { bg: "#DBEAFE", color: "#1E40AF" },
  IN_PROGRESS: { bg: "#E0E7FF", color: "#3730A3" },
  AWAITING_PARTS: { bg: "#FEE2E2", color: "#991B1B" },
  RESOLVED: { bg: "#D1FAE5", color: "#065F46" },
  CLOSED: { bg: "#F3F4F6", color: "#4B5563" },
  REOPENED: { bg: "#FEE2E2", color: "#991B1B" },
};

export const PRIORITY_TONE: Record<EstateIssuePriority, { bg: string; color: string }> = {
  EMERGENCY: { bg: "#FEE2E2", color: "#991B1B" },
  HIGH: { bg: "#FFEDD5", color: "#9A3412" },
  NORMAL: { bg: "#F3F4F6", color: "#4B5563" },
  LOW: { bg: "#F3F4F6", color: "#9CA3AF" },
};

/** Statuses where the job is still somebody's problem. */
export const OPEN_STATUSES: EstateIssueStatus[] = [
  "SUBMITTED",
  "ACKNOWLEDGED",
  "SCHEDULED",
  "IN_PROGRESS",
  "AWAITING_PARTS",
  "REOPENED",
];

/**
 * A reference a tenant can read down the phone: "H18-041".
 *
 * Sequential within a building rather than a slice of the cuid, because the
 * point of it is that somebody can say it out loud without spelling it. The
 * count-and-retry is honest about the race: two complaints landing in the same
 * millisecond is not a thing twelve units will do, and if it ever happens the
 * unique index catches it and the next number is taken.
 */
export async function nextIssueReference(buildingId: string, prefix: string): Promise<string> {
  const clean = prefix.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "EST";
  const count = await prisma.estateIssue.count({ where: { buildingId } });

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = `${clean}-${String(count + 1 + attempt).padStart(3, "0")}`;
    const taken = await prisma.estateIssue.findUnique({
      where: { reference: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  // Twenty-five collisions is not a race, it is a bug somewhere else. Fall back
  // to something guaranteed unique rather than looping or throwing at a tenant.
  return `${clean}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Resolving requires a photograph.
 *
 * This is the whole accountability product and it is enforced here rather than
 * left to the interface, because it is exactly the rule that gets quietly
 * dropped at 8pm when the job is finished and the technician wants to go home.
 */
export function canResolve(args: { photoCount: number; note: string | null }): { ok: boolean; why: string | null } {
  if (args.photoCount < 1) {
    return { ok: false, why: "Add at least one photograph of the finished work before marking this fixed." };
  }
  if (!args.note || args.note.trim().length < 3) {
    return { ok: false, why: "Say briefly what was done." };
  }
  return { ok: true, why: null };
}

/**
 * The categories a particular building's tenants should be offered.
 *
 * Only the two Banana Island houses have pools, and offering "Swimming pool" to
 * a tenant at Osborne is how a report about something else ends up filed under
 * Other — which is the category nobody can route.
 */
export function categoriesFor(facilities: { hasPool: boolean }): EstateIssueCategory[] {
  return CATEGORY_ORDER.filter((c) => c !== "POOL" || facilities.hasPool);
}
