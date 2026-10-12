import { z } from "zod";
import bcrypt from "bcryptjs";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { mintAccessToken, isValidPin } from "@/lib/estate/access";

const schema = z.object({
  action: z.enum(["rotate", "deactivate", "reactivate", "setPin", "setScope"]),
  pin: z.string().max(6).nullable().optional(),
  buildingId: z.string().max(40).nullable().optional(),
  area: z.enum(["BANANA_ISLAND", "OSBORNE_FORESHORE"]).nullable().optional(),
});

export const PATCH = handler(async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  if (d.action === "setPin" && d.pin && !isValidPin(d.pin)) {
    return Response.json({ error: "A PIN is four to six digits." }, { status: 400 });
  }
  if (d.action === "setScope" && d.buildingId && d.area) {
    return Response.json({ error: "Pick a building or an area, not both." }, { status: 400 });
  }

  const data =
    d.action === "rotate"
      ? { accessToken: mintAccessToken(), tokenIssuedAt: new Date() }
      : d.action === "deactivate"
        ? { active: false }
        : d.action === "reactivate"
          ? { active: true }
          : d.action === "setScope"
            ? {
                buildingId: d.buildingId || null,
                // Scope takes effect on the next request, not at the end of the
                // shift: gateCrew resolves it from here every time rather than
                // from anything the cookie remembers.
                area: d.buildingId ? null : (d.area ?? null),
              }
            : { pinHash: d.pin ? await bcrypt.hash(d.pin, 10) : null };

  const updated = await prisma.estateStaff.update({
    where: { id },
    data,
    select: { id: true, name: true, accessToken: true, active: true },
  });

  return Response.json({ ok: true, ...updated, pin: d.action === "setPin" ? (d.pin ?? null) : undefined });
});
