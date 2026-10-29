import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { serviceState, clearNotices } from "@/lib/estate/service";

/**
 * Logging a generator service.
 *
 * Writing this record is what resets the clock: hours-since-service is counted
 * from the date of the last one, so a service that happened and was never
 * entered leaves the set reading as permanently overdue and everybody learns to
 * ignore the banner.
 *
 * The cost posts to the service charge as an expense in the same transaction,
 * because a number typed twice is a number that ends up disagreeing.
 */

const schema = z.object({
  buildingId: z.string().min(1).max(40),
  servicedAt: z.string().nullable().optional(),
  performedBy: z.string().min(2).max(140),
  performedById: z.string().max(40).nullable().optional(),
  meterHoursAtService: z.number().nonnegative().max(1_000_000).nullable().optional(),
  costNaira: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
  workDone: z.string().max(2000).nullable().optional(),
});

export const POST = handler(async function POST(req: Request) {
  const { error, session } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Say who serviced it." }, { status: 400 });
  }
  const d = parsed.data;

  const building = await prisma.estateBuilding.findUnique({
    where: { id: d.buildingId },
    select: { id: true, name: true },
  });
  if (!building) return Response.json({ error: "That building does not exist." }, { status: 404 });

  // Read the clock before resetting it, so the record says what it was done at.
  const state = await serviceState(d.buildingId);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  const servicedAt = d.servicedAt ? new Date(d.servicedAt) : new Date();

  const service = await prisma.$transaction(async (tx) => {
    const row = await tx.estateGeneratorService.create({
      data: {
        buildingId: d.buildingId,
        servicedAt,
        hoursAtService: state.hoursSinceService,
        meterHoursAtService: d.meterHoursAtService ?? null,
        performedBy: d.performedBy.trim(),
        performedById: d.performedById || null,
        costNaira: d.costNaira ?? null,
        workDone: d.workDone?.trim() || null,
        recordedById: user?.id ?? null,
      },
      select: { id: true, servicedAt: true, hoursAtService: true },
    });

    if (d.costNaira && d.costNaira > 0) {
      await tx.estateExpense.create({
        data: {
          buildingId: d.buildingId,
          category: "MAINTENANCE",
          amount: d.costNaira,
          paidAt: servicedAt,
          payee: d.performedBy.trim(),
          description: `Generator service at ${state.hoursSinceService} hours`,
          recordedById: user?.id ?? null,
        },
      });
    }

    return row;
  });

  // Both notices re-arm for the next cycle.
  await clearNotices(d.buildingId);

  return Response.json(
    {
      ok: true,
      id: service.id,
      hoursAtService: Number(service.hoursAtService),
      message: `${building.name} generator logged as serviced at ${state.hoursSinceService} hours. The clock restarts now.`,
    },
    { status: 201 },
  );
});
