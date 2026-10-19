import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * A hospital never sees its own people in the register.
 *
 * Search ranks on availability and the card says "actively looking", so a
 * hospital searching the register could find out which of its own doctors are
 * job hunting. That is the one thing a professional most needs kept from their
 * employer. Their own staff are left out of search, the profile, shortlists and
 * approaches. If someone applies to one of this hospital's roles, the hospital
 * sees them, because they chose to tell it.
 *
 * Matching errs towards hiding. The register's current-workplace data is free
 * text, so a name match counts as well as the linked facility. Hiding someone
 * from a hospital they do not work at costs that hospital one candidate.
 * Showing someone to the hospital they do work at can cost them their job.
 */

type Org = { id: string; name: string; facilityId: string | null };

// A short or generic name ("Clinic") would match half the register.
const MIN_NAME_LENGTH = 5;

async function staffWhere(org: Org): Promise<Prisma.CadreProfessionalWhereInput | null> {
  const names = new Set<string>();
  if (org.name.trim().length >= MIN_NAME_LENGTH) names.add(org.name.trim());
  if (org.facilityId) {
    const facility = await prisma.cadreFacility.findUnique({
      where: { id: org.facilityId },
      select: { name: true },
    });
    if (facility && facility.name.trim().length >= MIN_NAME_LENGTH) names.add(facility.name.trim());
  }

  const OR: Prisma.CadreProfessionalWhereInput[] = [];
  if (org.facilityId) {
    OR.push({ currentFacilityId: org.facilityId });
    OR.push({ workHistory: { some: { isCurrent: true, facilityId: org.facilityId } } });
  }
  for (const name of names) {
    OR.push({ currentFacility: { contains: name, mode: "insensitive" } });
    OR.push({
      workHistory: { some: { isCurrent: true, facilityName: { contains: name, mode: "insensitive" } } },
    });
  }
  return OR.length ? { OR } : null;
}

/**
 * Ids of this hospital's current staff. Returned as a list and excluded with
 * notIn, rather than as a NOT clause: Prisma's NOT over nullable text columns
 * also drops every row where the column is null, which is most of the register.
 */
export async function ownStaffIds(org: Org): Promise<string[]> {
  const where = await staffWhere(org);
  if (!where) return [];
  const rows = await prisma.cadreProfessional.findMany({ where, select: { id: true } });
  return rows.map((r) => r.id);
}

/**
 * Whether this professional works at this hospital and has not applied to one of
 * its roles. True means the hospital must not see them.
 */
export async function hiddenAsOwnStaff(org: Org, professionalId: string): Promise<boolean> {
  const where = await staffWhere(org);
  if (!where) return false;
  const staff = await prisma.cadreProfessional.findFirst({
    where: { id: professionalId, ...where },
    select: { id: true },
  });
  if (!staff) return false;
  const applied = await prisma.cadreMandateMatch.findFirst({
    where: { professionalId, source: "APPLIED", mandate: { employerOrgId: org.id } },
    select: { id: true },
  });
  return !applied;
}
