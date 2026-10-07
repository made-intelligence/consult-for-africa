import type { EstateArea } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCrewSession } from "@/lib/estate/access";

/**
 * Turning a token in a URL into somebody the rest of the code can trust.
 *
 * Every public estate route starts here. The checks are deliberately
 * uninteresting — does this token exist, is the person still active — and the
 * important part is that they happen in exactly one place, so no route can
 * accidentally skip the "still active" half and keep serving a tenant who moved
 * out in March.
 */

export type Gate<T> = { ok: true; ctx: T } | { ok: false; status: number; error: string };

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitLabel: string;
  buildingId: string;
  buildingName: string;
}

export async function gateTenant(token: string): Promise<Gate<TenantContext>> {
  if (!token || token.length < 20) return { ok: false, status: 404, error: "Unknown link." };

  const tenant = await prisma.estateTenant.findUnique({
    where: { accessToken: token },
    select: {
      id: true,
      name: true,
      active: true,
      unit: {
        select: { id: true, label: true, building: { select: { id: true, name: true } } },
      },
    },
  });

  if (!tenant) return { ok: false, status: 404, error: "This link is not recognised." };
  if (!tenant.active) {
    return { ok: false, status: 403, error: "This link has been closed. Please contact the estate office." };
  }

  // Best effort. A failed heartbeat must never cost somebody their page.
  prisma.estateTenant
    .update({ where: { id: tenant.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});

  return {
    ok: true,
    ctx: {
      tenantId: tenant.id,
      tenantName: tenant.name,
      unitId: tenant.unit.id,
      unitLabel: tenant.unit.label,
      buildingId: tenant.unit.building.id,
      buildingName: tenant.unit.building.name,
    },
  };
}

export interface CrewContext {
  staffId: string;
  name: string;
  role: string;
  /**
   * The buildings this person may act on, resolved to a concrete list.
   *
   * Scope is stored narrowest-first — a building, or an area, or neither
   * meaning all of them — and it is flattened here so that no caller has to
   * re-implement the precedence. A route that gets this wrong does not fail
   * loudly; it quietly lets somebody bill twelve strangers.
   */
  buildingIds: string[];
  /** How the patch reads on screen: "H18", "Banana Island", "All buildings". */
  scopeLabel: string;
  /** True when a PIN is set and has not been entered this shift. */
  locked: boolean;
}

export async function gateCrew(token: string): Promise<Gate<CrewContext>> {
  if (!token || token.length < 20) return { ok: false, status: 404, error: "Unknown link." };

  const staff = await prisma.estateStaff.findUnique({
    where: { accessToken: token },
    select: {
      id: true, name: true, role: true, active: true,
      buildingId: true, area: true, pinHash: true,
      building: { select: { name: true } },
    },
  });

  if (!staff) return { ok: false, status: 404, error: "This link is not recognised." };
  if (!staff.active) return { ok: false, status: 403, error: "This link has been closed." };

  let buildingIds: string[];
  let scopeLabel: string;

  if (staff.buildingId) {
    buildingIds = [staff.buildingId];
    scopeLabel = staff.building?.name ?? "One building";
  } else {
    const rows = await prisma.estateBuilding.findMany({
      where: { active: true, ...(staff.area ? { area: staff.area } : {}) },
      select: { id: true },
    });
    buildingIds = rows.map((b) => b.id);
    scopeLabel = staff.area ? areaLabel(staff.area) : "All buildings";
  }

  const session = await getCrewSession();
  const unlocked = !staff.pinHash || session?.sub === staff.id;

  prisma.estateStaff.update({ where: { id: staff.id }, data: { lastSeenAt: new Date() } }).catch(() => {});

  return {
    ok: true,
    ctx: {
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      buildingIds,
      scopeLabel,
      locked: !unlocked,
    },
  };
}

export function areaLabel(area: EstateArea): string {
  return area === "BANANA_ISLAND" ? "Banana Island" : "Osborne Foreshore";
}

/**
 * Which buildings this person may act on.
 *
 * A guard assigned to H18 logging a run against Osborne is not an attack, it is
 * a mis-tap on a small screen, and it puts a charge on twelve strangers' bills.
 */
export function crewMayTouch(ctx: CrewContext, buildingId: string): boolean {
  return ctx.buildingIds.includes(buildingId);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
