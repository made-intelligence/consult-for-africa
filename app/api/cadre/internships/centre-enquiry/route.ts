import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { notifyEnquiry, REPLY_TO } from "@/lib/cadreHealth/internship/outreachSend";
import { matchCentre } from "@/lib/cadreHealth/internship/outreach";

const schema = z.object({
  centre: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(30),
  places: z.coerce.number().int().min(0).max(1000).optional(),
  message: z.string().trim().max(2000).optional(),
});

/**
 * POST /api/cadre/internships/centre-enquiry
 *
 * Public: a centre asking to join from /oncadre/internships/centres. It lands
 * on the BD tracker as In conversation with the contact filled in, so whoever
 * owns the centre sees it without reading an inbox.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`internship-centre:${ip}`)).success) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please complete your name, role, email and phone." }, { status: 400 });
  const d = parsed.data;
  // Typed, not picked from a list: the public page does not name centres that
  // have not agreed to be listed. Matched here, and refused when unclear.
  const all = await prisma.cadreInternshipCentre.findMany({ select: { id: true, name: true, stage: true, ownerUserId: true, contactName: true, contactRole: true, contactEmail: true, contactPhone: true } });
  const centre = matchCentre(d.centre, all);

  const centreName = centre?.name ?? d.centre;
  const lines = [
    centre ? `Centre: ${centre.name} (they typed "${d.centre}")` : `Centre: ${d.centre} (not matched to our list)`,
    `From: ${d.name}, ${d.role}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    ...(d.places != null ? [`Places this intake: ${d.places}`] : []),
    ...(d.message ? [`Message: ${d.message}`] : []),
  ];

  await prisma.cadreInternshipOutreach.create({
    data: { centreId: centre?.id ?? null, direction: "IN", email: d.email, subject: `Enquiry from ${centreName}`, body: lines.join("\n"), status: "RECEIVED" },
  });

  let ownerEmail: string | null = null;
  if (centre) {
    // Fill what we do not have; never overwrite a contact someone has already worked.
    await prisma.cadreInternshipCentre.update({
      where: { id: centre.id },
      data: {
        ...(!centre.contactName ? { contactName: d.name } : {}),
        ...(!centre.contactRole ? { contactRole: d.role } : {}),
        ...(!centre.contactEmail ? { contactEmail: d.email } : {}),
        ...(!centre.contactPhone ? { contactPhone: d.phone } : {}),
        ...(centre.stage === "PROSPECT" || centre.stage === "CONTACTED" ? { stage: "MEETING" } : {}),
        nextAction: `Reply to ${d.name} and send the claim link`,
        nextActionDue: new Date(Date.now() + 24 * 3600_000),
      },
    });
    if (centre.ownerUserId) {
      ownerEmail = (await prisma.user.findUnique({ where: { id: centre.ownerUserId }, select: { email: true } }))?.email ?? null;
    }
  }

  await notifyEnquiry({ to: [REPLY_TO, ...(ownerEmail ? [ownerEmail] : [])], centre: centreName, lines });
  return Response.json({ ok: true });
});
