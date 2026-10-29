import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { signCadreEmployerJWT } from "@/lib/cadreEmployerAuth";
import { notifyEnquiry, REPLY_TO } from "@/lib/cadreHealth/internship/outreachSend";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(30),
  password: z.string().min(8).max(200),
  places: z.coerce.number().int().min(0).max(1000).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  intakeNote: z.string().trim().max(200).optional(),
  authorised: z.literal(true),
  consent: z.literal(true),
});

/**
 * POST /api/cadre/internships/claim/[token]
 *
 * A centre claims its account from the private link the programme lead sent.
 * Claiming is the consent: it creates the centre's login (or joins an existing
 * one), records who agreed, and only then lists the centre for graduates.
 */
export const POST = handler(async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`internship-claim:${ip}`)).success) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const { token } = await params;
  const centre = await prisma.cadreInternshipCentre.findUnique({
    where: { claimToken: token },
    select: { id: true, name: true, listed: true, stage: true, employerOrgId: true, ownerUserId: true, committedAt: true, contactName: true, contactRole: true, contactEmail: true, contactPhone: true },
  });
  if (!centre) return Response.json({ error: "This link is not valid. Please ask us for a new one." }, { status: 404 });
  if (centre.listed && centre.employerOrgId) {
    return Response.json({ error: "This centre has already been claimed. Log in with the account that claimed it.", code: "CLAIMED" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    const pw = parsed.error.issues.some((i) => i.path[0] === "password");
    return Response.json({ error: pw ? "Choose a password of at least 8 characters." : "Please complete every field and tick both boxes." }, { status: 400 });
  }
  const d = parsed.data;

  // One login per person. Someone who already has a CadreHealth employer login
  // proves it with their password, and their organisation takes the centre.
  let account = await prisma.cadreEmployerAccount.findUnique({
    where: { contactEmail: d.email },
    select: { id: true, passwordHash: true, contactEmail: true, companyName: true, contactName: true, isVerified: true, orgId: true, org: { select: { facilityId: true, internshipCentre: { select: { id: true } } } } },
  });
  if (account) {
    if (!(await bcrypt.compare(d.password, account.passwordHash))) {
      return Response.json({ error: "This email already has a CadreHealth employer login. Enter that password, or reset it from the employer login page.", code: "EMAIL_EXISTS" }, { status: 401 });
    }
    if (account.org.internshipCentre && account.org.internshipCentre.id !== centre.id) {
      return Response.json({ error: "That login already belongs to another centre. Use a different email." }, { status: 409 });
    }
  }
  if (centre.employerOrgId && account?.orgId !== centre.employerOrgId) {
    return Response.json({ error: `${centre.name} already has a CadreHealth login. Contact us at ${REPLY_TO} and we will add you to it.` }, { status: 409 });
  }

  if (!account) {
    account = await prisma.cadreEmployerAccount.create({
      data: {
        companyName: centre.name,
        contactName: d.name,
        contactEmail: d.email,
        contactPhone: d.phone,
        passwordHash: await bcrypt.hash(d.password, 12),
        role: "OWNER",
        acceptedAt: new Date(),
        org: { create: { name: centre.name } },
      },
      select: { id: true, passwordHash: true, contactEmail: true, companyName: true, contactName: true, isVerified: true, orgId: true, org: { select: { facilityId: true, internshipCentre: { select: { id: true } } } } },
    });
  }

  const now = new Date();
  await prisma.cadreInternshipCentre.update({
    where: { id: centre.id },
    data: {
      employerOrgId: account.orgId,
      listed: true,
      consentAt: now,
      consentName: d.name,
      consentRole: d.role,
      consentSource: "CLAIMED",
      consentById: null,
      consentNote: `Claimed online by ${d.email}`,
      stage: "COMMITTED",
      ...(!centre.committedAt ? { committedAt: now } : {}),
      ...(d.places != null ? { slotsOffered: d.places } : {}),
      ...(d.minScore != null ? { minScore: d.minScore } : {}),
      ...(d.intakeNote ? { intakeNote: d.intakeNote } : {}),
      ...(!centre.contactName ? { contactName: d.name } : {}),
      ...(!centre.contactRole ? { contactRole: d.role } : {}),
      ...(!centre.contactEmail ? { contactEmail: d.email } : {}),
      ...(!centre.contactPhone ? { contactPhone: d.phone } : {}),
      nextAction: "Welcome call: check places, minimum score and who reviews candidates",
      nextActionDue: new Date(now.getTime() + 2 * 24 * 3600_000),
    },
  });

  const lines = [
    `Centre: ${centre.name}`,
    `Claimed by: ${d.name}, ${d.role}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    `Places: ${d.places ?? "not given"}`,
    `Minimum score: ${d.minScore ?? "not given"}`,
    ...(d.intakeNote ? [`Intake: ${d.intakeNote}`] : []),
    "The centre consented to be listed and is now shown to graduates.",
  ];
  await prisma.cadreInternshipOutreach.create({
    data: { centreId: centre.id, direction: "IN", email: d.email, subject: `${centre.name} claimed its account`, body: lines.join("\n"), status: "RECEIVED" },
  });
  const ownerEmail = centre.ownerUserId ? (await prisma.user.findUnique({ where: { id: centre.ownerUserId }, select: { email: true } }))?.email : null;
  await notifyEnquiry({ to: [REPLY_TO, ...(ownerEmail ? [ownerEmail] : [])], centre: centre.name, lines, subject: `${centre.name} claimed its internship account` });

  const jwt = signCadreEmployerJWT({
    sub: account.id,
    email: account.contactEmail,
    companyName: account.companyName,
    contactName: account.contactName,
    isVerified: account.isVerified,
    facilityId: account.org.facilityId,
  });
  (await cookies()).set("cadre_employer_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return Response.json({ ok: true, next: "/oncadre/employer/internships" });
});
