import { z } from "zod";
import bcrypt from "bcryptjs";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { mintAccessToken, isValidPin } from "@/lib/estate/access";

/** Adding someone to the ground team, with their link and their PIN. */

const schema = z.object({
  name: z.string().min(2).max(120),
  role: z.enum(["SECURITY", "TECHNICIAN", "SUPERVISOR", "CLEANER", "GARDENER", "POOL"]),
  phone: z.string().max(40).nullable().optional(),
  /** Narrowest wins. A building pins them to it; an area covers every building
   *  in it — the supervisor case; neither means all three. */
  buildingId: z.string().max(40).nullable().optional(),
  area: z.enum(["BANANA_ISLAND", "OSBORNE_FORESHORE"]).nullable().optional(),
  pin: z.string().max(6).nullable().optional(),
});

export const POST = handler(async function POST(req: Request) {
  const { error } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name and role are required." }, { status: 400 });
  const d = parsed.data;

  if (d.pin && !isValidPin(d.pin)) {
    return Response.json({ error: "A PIN is four to six digits." }, { status: 400 });
  }
  if (d.buildingId && d.area) {
    return Response.json(
      { error: "Pick a building or an area, not both." },
      { status: 400 },
    );
  }

  const staff = await prisma.estateStaff.create({
    data: {
      name: d.name.trim(),
      role: d.role,
      phone: d.phone?.trim() || null,
      buildingId: d.buildingId || null,
      area: d.buildingId ? null : (d.area ?? null),
      accessToken: mintAccessToken(),
      pinHash: d.pin ? await bcrypt.hash(d.pin, 10) : null,
    },
    select: { id: true, name: true, accessToken: true },
  });

  // The PIN is echoed back exactly once, here, so it can be handed over. It is
  // stored as a bcrypt hash and is not readable again from anywhere.
  return Response.json({ ok: true, ...staff, pin: d.pin ?? null }, { status: 201 });
});
