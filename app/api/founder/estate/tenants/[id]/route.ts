import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { mintAccessToken } from "@/lib/estate/access";

/**
 * Rotating or closing a tenant's link.
 *
 * Rotation is the revocation mechanism: there is no session to kill, so issuing
 * a new token is what makes the old link stop working. It is the thing to do the
 * day a tenancy ends, and the day a tenant says they forwarded the link to
 * somebody.
 */

const schema = z.object({
  action: z.enum(["rotate", "deactivate", "reactivate", "update"]),
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(160).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
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

  const tenant = await prisma.estateTenant.findUnique({ where: { id }, select: { id: true, unitId: true } });
  if (!tenant) return Response.json({ error: "Not found." }, { status: 404 });

  const data =
    d.action === "rotate"
      ? { accessToken: mintAccessToken(), tokenIssuedAt: new Date() }
      : d.action === "deactivate"
        ? { active: false, movedOutAt: new Date() }
        : d.action === "reactivate"
          ? { active: true, movedOutAt: null }
          : {
              ...(d.name ? { name: d.name.trim() } : {}),
              ...(d.email !== undefined ? { email: d.email?.trim() || null } : {}),
              ...(d.phone !== undefined ? { phone: d.phone?.trim() || null } : {}),
            };

  const updated = await prisma.estateTenant.update({
    where: { id },
    data,
    select: { id: true, name: true, accessToken: true, active: true },
  });

  // A unit with nobody in it stops being billable and falls to the landlord.
  if (d.action === "deactivate") {
    const others = await prisma.estateTenant.count({
      where: { unitId: tenant.unitId, active: true },
    });
    if (others === 0) {
      await prisma.estateUnit.update({ where: { id: tenant.unitId }, data: { status: "VACANT" } });
    }
  }

  return Response.json({ ok: true, ...updated });
});
