import crypto from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { CURRENT_INTAKE, MAX_PREFERENCES, QUALIFICATIONS } from "@/lib/cadreHealth/internship/programme";
import { sendInternshipLink } from "@/lib/cadreHealth/internship/email";

const thisYear = new Date().getFullYear();

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(8).max(20),
  qualification: z.enum(QUALIFICATIONS.map((q) => q.value) as [string, ...string[]]),
  school: z.string().trim().min(2).max(160),
  graduationYear: z.number().int().min(thisYear - 5).max(thisYear + 1),
  nmcnNumber: z.string().trim().max(40).optional(),
  centreIds: z.array(z.string().min(1)).min(1).max(MAX_PREFERENCES),
  consent: z.literal(true),
});

/**
 * POST /api/cadre/internships/apply
 *
 * Public: most applicants are new graduates with no CadreHealth account. The
 * application creates or reuses the professional record by email and returns
 * nothing secret; the assessment link goes to the email address, so only the
 * owner of that inbox can sit the paper.
 */
export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`internship-apply:${ip}`)).success) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please complete every field and choose at least one centre." }, { status: 400 });
  const a = parsed.data;

  const centreIds = [...new Set(a.centreIds)];
  const centres = await prisma.cadreInternshipCentre.count({ where: { id: { in: centreIds }, stage: { not: "DECLINED" } } });
  if (centres !== centreIds.length) return Response.json({ error: "One of the centres you chose is no longer taking applications." }, { status: 400 });

    let professional = await prisma.cadreProfessional.findUnique({ where: { email: a.email }, select: { id: true, firstName: true, phone: true } });
  if (!professional) {
    const [firstName, ...rest] = a.name.split(/\s+/);
    professional = await prisma.cadreProfessional.create({
      data: { firstName, lastName: rest.join(" "), email: a.email, phone: a.phone, cadre: "NURSING", state: "Lagos", accountStatus: "UNVERIFIED", availability: "ACTIVELY_LOOKING" },
      select: { id: true, firstName: true, phone: true },
    });
  } else if (!professional.phone) {
    await prisma.cadreProfessional.update({ where: { id: professional.id }, data: { phone: a.phone } });
  }

  const key = { professionalId_intake: { professionalId: professional.id, intake: CURRENT_INTAKE } };
  const existing = await prisma.cadreInternshipApplication.findUnique({ where: key, select: { id: true, accessToken: true } });

  // Someone applying twice has usually lost the email. Send the same link again
  // rather than opening a second paper.
  if (existing) {
    await sendInternshipLink({ to: a.email, firstName: professional.firstName, token: existing.accessToken, resent: true });
    return Response.json({ ok: true, resent: true });
  }

  const accessToken = crypto.randomBytes(24).toString("base64url");
  await prisma.cadreInternshipApplication.create({
    data: {
      professionalId: professional.id,
      intake: CURRENT_INTAKE,
      qualification: a.qualification,
      school: a.school,
      graduationYear: a.graduationYear,
      nmcnNumber: a.nmcnNumber || null,
      phone: a.phone,
      accessToken,
      consentAt: new Date(),
      preferences: { create: centreIds.map((centreId, i) => ({ centreId, rank: i + 1 })) },
    },
  });

  await sendInternshipLink({ to: a.email, firstName: professional.firstName, token: accessToken, resent: false });
  return Response.json({ ok: true, resent: false });
});
