import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { mintAccessToken } from "@/lib/estate/access";

/** Adding a tenant, and minting the link that is their whole credential. */

const schema = z.object({
  unitId: z.string().min(1).max(40),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  movedInAt: z.string().nullable().optional(),
});

export const POST = handler(async function POST(req: Request) {
  const { error } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name and unit are required." }, { status: 400 });
  const d = parsed.data;

  const unit = await prisma.estateUnit.findUnique({
    where: { id: d.unitId },
    select: { id: true, status: true },
  });
  if (!unit) return Response.json({ error: "That unit does not exist." }, { status: 404 });

  const tenant = await prisma.$transaction(async (tx) => {
    const created = await tx.estateTenant.create({
      data: {
        unitId: d.unitId,
        name: d.name.trim(),
        email: d.email?.trim() || null,
        phone: d.phone?.trim() || null,
        movedInAt: d.movedInAt ? new Date(d.movedInAt) : new Date(),
        accessToken: mintAccessToken(),
      },
      select: { id: true, name: true, accessToken: true },
    });

    // A unit with somebody living in it is occupied, and occupancy is what
    // decides whether it carries fuel or the landlord does. Letting those two
    // drift apart is how a tenant ends up paying nothing all year.
    if (unit.status === "VACANT") {
      await tx.estateUnit.update({ where: { id: d.unitId }, data: { status: "OCCUPIED" } });
    }
    return created;
  });

  return Response.json({ ok: true, ...tenant }, { status: 201 });
});
