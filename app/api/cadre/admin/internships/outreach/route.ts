import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";
import { unknownFields } from "@/lib/cadreHealth/internship/outreach";
import { sendTest, sendToCentres } from "@/lib/cadreHealth/internship/outreachSend";

export const maxDuration = 300;

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];

const schema = z.object({
  centreIds: z.array(z.string().min(1)).max(60),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(20).max(8000),
  template: z.string().max(40).nullable().optional(),
  test: z.boolean().optional(),
});

/**
 * POST /api/cadre/admin/internships/outreach
 *
 * The bulk email to centres. `test: true` sends one copy, rendered for the
 * first chosen centre, to the sender. Otherwise each centre gets its own copy;
 * sixty at most per send so a request finishes inside the function limit.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !ALLOWED.includes(session.user.role)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Add a subject and a message, and choose at most 60 centres." }, { status: 400 });
  const d = parsed.data;

  const bad = unknownFields(d.subject + d.body);
  if (bad.length) return Response.json({ error: `Not a merge field: ${bad.map((b) => `{{${b}}}`).join(", ")}` }, { status: 400 });

  const sender = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { id: true, name: true, email: true } });

  if (d.test) {
    const r = await sendTest({ centreId: d.centreIds[0] ?? null, subject: d.subject, body: d.body, sender });
    if (!r.ok) return Response.json({ error: r.error ?? "The test did not send." }, { status: 502 });
    return Response.json({ ok: true, test: true, to: sender.email });
  }

  if (!d.centreIds.length) return Response.json({ error: "Choose at least one centre." }, { status: 400 });
  const result = await sendToCentres({ centreIds: d.centreIds, subject: d.subject, body: d.body, template: d.template ?? null, sender });
  return Response.json({ ok: true, ...result });
});
