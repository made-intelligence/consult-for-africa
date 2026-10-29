import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];

const field = (max: number) => z.string().trim().max(max).optional();
const schema = z.object({
  rows: z
    .array(
      z.object({
        centreId: z.string().min(1),
        contactName: field(120),
        contactRole: field(120),
        contactEmail: z.string().trim().toLowerCase().email().optional(),
        contactPhone: field(30),
      }),
    )
    .min(1)
    .max(200),
  /** Replace contact details already on a centre. Off by default so a paste never wipes work. */
  overwrite: z.boolean().optional(),
});

/** POST /api/cadre/admin/internships/contacts: contacts pasted from a spreadsheet, matched to centres in the browser. */
export const POST = handler(async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !ALLOWED.includes(session.user.role)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Check the rows: " + parsed.error.issues.map((i) => i.path.join(".")).slice(0, 5).join(", ") }, { status: 400 });
  const { rows, overwrite } = parsed.data;

  const existing = new Map(
    (await prisma.cadreInternshipCentre.findMany({
      where: { id: { in: rows.map((r) => r.centreId) } },
      select: { id: true, contactName: true, contactRole: true, contactEmail: true, contactPhone: true },
    })).map((c) => [c.id, c]),
  );

  let updated = 0;
  let unchanged = 0;
  for (const r of rows) {
    const c = existing.get(r.centreId);
    if (!c) continue;
    const data: Record<string, string> = {};
    for (const k of ["contactName", "contactRole", "contactEmail", "contactPhone"] as const) {
      const v = r[k];
      if (v && (overwrite || !c[k])) data[k] = v;
    }
    if (!Object.keys(data).length) { unchanged++; continue; }
    await prisma.cadreInternshipCentre.update({ where: { id: c.id }, data });
    updated++;
  }
  return Response.json({ ok: true, updated, unchanged });
});
