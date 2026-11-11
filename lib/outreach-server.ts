import { prisma } from "@/lib/prisma";
import { SPRINT_ADMIN_ROLES, type MemberRole } from "@/lib/outreach";

export type SprintAccess = {
  sprint: NonNullable<Awaited<ReturnType<typeof prisma.outreachSprint.findUnique>>>;
  /** The viewer's place on the team; null for a partner or admin looking in. */
  role: MemberRole | null;
  isAdmin: boolean;
  /** Can reassign, park and work anyone's targets. */
  steer: boolean;
};

/** Null when the sprint does not exist or the viewer is not on it. */
export async function sprintAccess(slug: string, user: { id: string; role: string }): Promise<SprintAccess | null> {
  const sprint = await prisma.outreachSprint.findUnique({ where: { slug } });
  if (!sprint) return null;
  const m = await prisma.sprintMember.findUnique({ where: { sprintId_userId: { sprintId: sprint.id, userId: user.id } } });
  const isAdmin = SPRINT_ADMIN_ROLES.includes(user.role);
  if (!m && !isAdmin) return null;
  const role = (m?.role as MemberRole) ?? null;
  return { sprint, role, isAdmin, steer: isAdmin || role === "LEAD" || role === "RUNNER" };
}

/** A caller may work their own targets; a lead, runner or admin may work any. */
export function canWork(a: SprintAccess, target: { ownerId: string | null }, userId: string): boolean {
  return a.steer || target.ownerId === userId;
}

const OPEN = { notIn: ["HANDED_OVER", "PARKED", "DECLINED", "ALREADY_SIGNED"] };
const queueInclude = {
  hospital: { select: { id: true, name: true, lga: true, category: true, contacts: { select: { phone: true, email: true, name: true, isPrimary: true } } } },
  touches: { orderBy: { createdAt: "desc" as const }, take: 1, select: { outcome: true, said: true, note: true, createdAt: true, channel: true } },
};

/**
 * A caller's day, in the order to work it: anything due (overdue first), then
 * fresh providers by priority, then what is coming up. Nothing else is shown,
 * so the list is the plan.
 */
export async function queueFor(sprintId: string, ownerId: string, dayEnd: Date, freshTake = 15) {
  const [due, fresh, upcoming] = await Promise.all([
    prisma.sprintTarget.findMany({
      where: { sprintId, ownerId, stage: OPEN, nextActionAt: { lte: dayEnd } },
      orderBy: [{ nextActionAt: "asc" }, { priority: "desc" }],
      include: queueInclude,
    }),
    prisma.sprintTarget.findMany({
      where: { sprintId, ownerId, stage: "TARGET", nextActionAt: null },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: freshTake,
      include: queueInclude,
    }),
    prisma.sprintTarget.findMany({
      where: { sprintId, ownerId, stage: OPEN, nextActionAt: { gt: dayEnd } },
      orderBy: { nextActionAt: "asc" },
      take: 25,
      include: queueInclude,
    }),
  ]);
  return { due, fresh, upcoming };
}
export type QueueTarget = Awaited<ReturnType<typeof queueFor>>["due"][number];
