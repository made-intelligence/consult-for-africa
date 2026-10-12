import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Moving a building's rate card.
 *
 * Forward-looking only, and that is a property of the data model rather than of
 * this route: every generator run carries the rates it was costed at, so nothing
 * changed here can reach a charge already made. The office can correct a price
 * in October without quietly restating June.
 *
 * Every move is written to EstateRateChange with whoever made it and why. "Why
 * is this month more than last month" is the first question a tenant asks, and a
 * mutable settings field cannot answer it.
 */

const schema = z.object({
  buildingId: z.string().min(1).max(40),
  dieselPricePerLitre: z.number().positive().max(100_000).optional(),
  litresPerHour: z.number().positive().max(1000).optional(),
  dieselPricingMode: z.enum(["MANUAL_RATE", "WEIGHTED_AVERAGE"]).optional(),
  dieselLowBalanceNaira: z.number().nonnegative().max(100_000_000).optional(),
  dieselLowCoverDays: z.number().int().min(1).max(120).optional(),
  allocationNote: z.string().max(2000).nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
});

export const POST = handler(async function POST(req: Request) {
  const { error, session } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  const building = await prisma.estateBuilding.findUnique({
    where: { id: d.buildingId },
    select: { id: true, dieselPricePerLitre: true, litresPerHour: true },
  });
  if (!building) return Response.json({ error: "That building does not exist." }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  const changes: Array<{ field: string; oldValue: number; newValue: number }> = [];
  if (d.dieselPricePerLitre !== undefined && Number(building.dieselPricePerLitre) !== d.dieselPricePerLitre) {
    changes.push({
      field: "dieselPricePerLitre",
      oldValue: Number(building.dieselPricePerLitre),
      newValue: d.dieselPricePerLitre,
    });
  }
  if (d.litresPerHour !== undefined && Number(building.litresPerHour) !== d.litresPerHour) {
    changes.push({
      field: "litresPerHour",
      oldValue: Number(building.litresPerHour),
      newValue: d.litresPerHour,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.estateBuilding.update({
      where: { id: d.buildingId },
      data: {
        ...(d.dieselPricePerLitre !== undefined ? { dieselPricePerLitre: d.dieselPricePerLitre } : {}),
        ...(d.litresPerHour !== undefined ? { litresPerHour: d.litresPerHour } : {}),
        ...(d.dieselPricingMode ? { dieselPricingMode: d.dieselPricingMode } : {}),
        ...(d.dieselLowBalanceNaira !== undefined ? { dieselLowBalanceNaira: d.dieselLowBalanceNaira } : {}),
        ...(d.dieselLowCoverDays !== undefined ? { dieselLowCoverDays: d.dieselLowCoverDays } : {}),
        ...(d.allocationNote !== undefined ? { allocationNote: d.allocationNote?.trim() || null } : {}),
      },
    });

    if (changes.length > 0) {
      await tx.estateRateChange.createMany({
        data: changes.map((c) => ({
          buildingId: d.buildingId,
          field: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue,
          reason: d.reason?.trim() || null,
          changedById: user?.id ?? null,
        })),
      });
    }
  });

  return Response.json({ ok: true, changes: changes.length });
});
