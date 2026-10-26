import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];

const text = (max: number) => z.string().trim().max(max).nullable().optional();
const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max).nullable().optional();

const schema = z.object({
  stage: z.enum(["PROSPECT", "CONTACTED", "MEETING", "COMMITTED", "DECLINED"]).optional(),
  ownerUserId: text(40),
  contactName: text(120),
  contactRole: text(120),
  contactEmail: z.string().trim().email().nullable().optional(),
  contactPhone: text(30),
  nextAction: text(300),
  nextActionDue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  slotsOffered: int(0, 1000),
  minScore: int(0, 100),
  intakeNote: text(200),
  employerOrgId: text(40),
  notes: text(5000),
});

/** PATCH /api/cadre/admin/internships/centres/[id]: the BD tracker's one write. */
export const PATCH = handler(async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !ALLOWED.includes(session.user.role)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Check the fields: " + parsed.error.issues.map((i) => i.path.join(".")).join(", ") }, { status: 400 });
  const d = parsed.data;

  const { id } = await params;
  const centre = await prisma.cadreInternshipCentre.findUnique({ where: { id }, select: { stage: true, committedAt: true } });
  if (!centre) return Response.json({ error: "Not found." }, { status: 404 });

  if (d.employerOrgId) {
    const taken = await prisma.cadreInternshipCentre.findFirst({ where: { employerOrgId: d.employerOrgId, id: { not: id } }, select: { name: true } });
    if (taken) return Response.json({ error: `That login is already linked to ${taken.name}.` }, { status: 409 });
  }

  await prisma.cadreInternshipCentre.update({
    where: { id },
    data: {
      ...d,
      nextActionDue: d.nextActionDue === undefined ? undefined : d.nextActionDue ? new Date(d.nextActionDue) : null,
      // The date a centre first said yes is kept even if it later wavers.
      ...(d.stage === "COMMITTED" && !centre.committedAt ? { committedAt: new Date() } : {}),
    },
  });
  return Response.json({ ok: true });
});
