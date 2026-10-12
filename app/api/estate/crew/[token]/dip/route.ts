import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { isEstateKey } from "@/lib/estate/photos";

/**
 * A dip of the tank. NO PLATFORM AUTH — the link plus the PIN is the credential.
 *
 * The cheapest and most valuable thing the ground team does. A dipstick has no
 * opinion about whose shift it was, which makes this the only independent number
 * in the diesel chain and the one the whole reconciliation hangs off.
 */

const schema = z.object({
  buildingId: z.string().min(1).max(40),
  litres: z.number().nonnegative().max(1_000_000),
  photoKey: z.string().max(400).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-dip", { windowMs: 60_000, max: 20 })) {
    return Response.json({ error: "Too many submissions. Wait a moment." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter the level in litres." }, { status: 400 });
  const d = parsed.data;

  if (!crewMayTouch(gate.ctx, d.buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const reading = await prisma.estateTankReading.create({
    data: {
      buildingId: d.buildingId,
      readAt: new Date(),
      litres: d.litres,
      photoKey: d.photoKey && isEstateKey(d.photoKey, "dip") ? d.photoKey : null,
      recordedByStaffId: gate.ctx.staffId,
      note: d.note ?? null,
    },
    select: { id: true, readAt: true },
  });

  return Response.json({ ok: true, ...reading }, { status: 201 });
});
