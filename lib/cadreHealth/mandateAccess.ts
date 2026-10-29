import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Who on the platform side may see a CadreHealth role and its applicants.
 *
 * The admin mandate pages only checked that someone was logged in, and
 * /api/cadre/mandates checked nothing at all. Any of the hundred-odd consultant
 * logins could open every role and read who had applied, which is how a
 * recruiter found his own CMD on another hospital's shortlist. An applicant's
 * job search is the most sensitive thing this product holds.
 *
 * Partner and Admin see every role. Everyone else sees only the roles they are
 * named owner of (pilotOwnerId). DIRECTOR is not on the list because most of the
 * Director seats belong to people outside CFA's core team, some of whom work at
 * hospitals that hire from the register.
 */
export const CADRE_ADMIN_ROLES = ["PARTNER", "ADMIN"];

type StaffUser = { id: string; role: string };

export function canSeeAllMandates(user: StaffUser): boolean {
  return CADRE_ADMIN_ROLES.includes(user.role);
}

/** The where clause that limits mandate reads to what this user may see. */
export function mandateScope(user: StaffUser): Prisma.CadreMandateWhereInput {
  return canSeeAllMandates(user) ? {} : { pilotOwnerId: user.id };
}

/** Pages that are register-wide and have no per-role owner: Partner and Admin only. */
export async function requireCadreAdmin() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canSeeAllMandates(session.user)) redirect("/dashboard");
  return session;
}

/** Pages scoped per role: any logged-in staff, narrowed by mandateScope. */
export async function requireMandateViewer() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

/**
 * API counterpart: the signed-in staff user, or null. Callers answer 401 or 403
 * themselves so a route can still choose to narrow rather than refuse.
 */
export async function staffUser(): Promise<StaffUser | null> {
  const session = await auth();
  return session?.user ? { id: session.user.id, role: session.user.role } : null;
}

export async function isCadreAdmin(): Promise<boolean> {
  const user = await staffUser();
  return !!user && canSeeAllMandates(user);
}
