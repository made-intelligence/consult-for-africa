import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://consultforafrica.com";

/**
 * The only centres anyone outside the team sees: those that consented to be
 * listed and have not since declined. Every public read and every applicant
 * write filters on this, so a centre on NMCN's list is never presented as
 * taking part before it has said so.
 */
export const PUBLIC_CENTRE: Prisma.CadreInternshipCentreWhereInput = { listed: true, stage: { not: "DECLINED" } };

export function claimUrl(token: string) {
  return `${BASE_URL}/oncadre/internships/claim/${token}`;
}

/** The centre's private claim link, made the first time anyone needs it. */
export async function ensureClaimToken(centreId: string): Promise<string> {
  const c = await prisma.cadreInternshipCentre.findUniqueOrThrow({ where: { id: centreId }, select: { claimToken: true } });
  if (c.claimToken) return c.claimToken;
  const token = crypto.randomBytes(18).toString("base64url");
  // Conditional, so two people generating at once end up with the same link.
  await prisma.cadreInternshipCentre.updateMany({ where: { id: centreId, claimToken: null }, data: { claimToken: token } });
  return (await prisma.cadreInternshipCentre.findUniqueOrThrow({ where: { id: centreId }, select: { claimToken: true } })).claimToken!;
}
