import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { isEstateKey } from "@/lib/estate/photos";
import { checkDelivery } from "@/lib/estate/diesel";

/**
 * Fuel arriving. NO PLATFORM AUTH — the link plus the PIN is the credential.
 *
 * The dips either side of the discharge are the point of this form. Waybill
 * litres against the rise in the tank is the one measurement in the whole
 * diesel chain where both sides are real, which makes it the only place a short
 * delivery can be caught while the truck is still on the premises.
 */

const schema = z.object({
  buildingId: z.string().min(1).max(40),
  litres: z.number().positive().max(100_000),
  pricePerLitre: z.number().positive().max(100_000),
  supplier: z.string().max(140).nullable().optional(),
  waybillRef: z.string().max(80).nullable().optional(),
  tankBeforeL: z.number().nonnegative().max(1_000_000).nullable().optional(),
  tankAfterL: z.number().nonnegative().max(1_000_000).nullable().optional(),
  receiptKey: z.string().max(400).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-delivery", { windowMs: 60_000, max: 15 })) {
    return Response.json({ error: "Too many submissions. Wait a moment." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Enter the litres and the price per litre." }, { status: 400 });
  }
  const d = parsed.data;

  if (!crewMayTouch(gate.ctx, d.buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const receiptKey = d.receiptKey && isEstateKey(d.receiptKey) ? d.receiptKey : null;

  const delivery = await prisma.estateDieselDelivery.create({
    data: {
      buildingId: d.buildingId,
      deliveredAt: new Date(),
      litres: d.litres,
      pricePerLitre: d.pricePerLitre,
      totalNaira: Math.round(d.litres * d.pricePerLitre * 100) / 100,
      supplier: d.supplier ?? null,
      waybillRef: d.waybillRef ?? null,
      tankBeforeL: d.tankBeforeL ?? null,
      tankAfterL: d.tankAfterL ?? null,
      receiptKey,
      recordedByStaffId: gate.ctx.staffId,
      note: d.note ?? null,
    },
    select: { id: true },
  });

  // The tank level after the discharge is also a dip, so record it as one rather
  // than making somebody enter the same number twice on the next screen.
  if (d.tankAfterL !== null && d.tankAfterL !== undefined) {
    await prisma.estateTankReading.create({
      data: {
        buildingId: d.buildingId,
        readAt: new Date(),
        litres: d.tankAfterL,
        recordedByStaffId: gate.ctx.staffId,
        note: "Dip taken after delivery",
      },
    });
  }

  const check = checkDelivery({
    waybillLitres: d.litres,
    tankBeforeL: d.tankBeforeL ?? null,
    tankAfterL: d.tankAfterL ?? null,
    pricePerLitre: d.pricePerLitre,
  });

  return Response.json({ ok: true, id: delivery.id, check }, { status: 201 });
});
