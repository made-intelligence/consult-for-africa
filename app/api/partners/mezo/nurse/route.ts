import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/admin-notify";
import { verifyMezoSignature } from "@/lib/mezo/improvement-lead";
import {
  NurseRegistrationSchema,
  allowedSubSpecialty,
  loginUrl,
  planNurseRegistration,
  referralCode,
  setPasswordExpiry,
  setPasswordUrl,
} from "@/lib/mezo/nurse-register";

/**
 * POST /api/partners/mezo/nurse
 *
 * A nurse or midwife signed up on Mezo's /for-nurses form; open (or find)
 * their CadreHealth profile. Signed with MEZO_PARTNER_SECRET
 * (x-mezo-signature: hex HMAC-SHA256 of the raw body), the same as
 * /api/partners/mezo/improvement. Idempotent on email.
 *
 * Answers { status: "created" | "invited", setPasswordUrl } or
 * { status: "existing", loginUrl }. The set-password link is for Mezo's
 * email to that address only.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.MEZO_PARTNER_SECRET;
  if (!secret) return Response.json({ error: "Not configured" }, { status: 503 });

  const raw = await req.text();
  if (!verifyMezoSignature(raw, req.headers.get("x-mezo-signature"), secret)) {
    return Response.json({ error: "Bad signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Not JSON" }, { status: 400 });
  }
  const parsed = NurseRegistrationSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid registration", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const input = parsed.data;

  const existing = await prisma.cadreProfessional.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      passwordHash: true,
      passwordResetToken: true,
      passwordResetExpiry: true,
      phone: true,
      state: true,
      city: true,
      subSpecialty: true,
      openTo: true,
    },
  });
  const plan = planNurseRegistration(existing, input);

  if (plan.kind === "EXISTING") {
    return Response.json({ status: "existing", professionalId: existing!.id, loginUrl: loginUrl() });
  }

  if (plan.kind === "INVITE") {
    await prisma.cadreProfessional.update({
      where: { id: existing!.id },
      data: {
        ...plan.fill,
        passwordResetToken: plan.token,
        passwordResetExpiry: setPasswordExpiry(),
      },
    });
    return Response.json({ status: "invited", professionalId: existing!.id, setPasswordUrl: setPasswordUrl(plan.token) });
  }

  let created: { id: string };
  try {
    created = await prisma.cadreProfessional.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        passwordHash: null,
        cadre: input.cadre,
        subSpecialty: allowedSubSpecialty(input.cadre, input.subSpecialty),
        yearsOfExperience: input.yearsOfExperience ?? null,
        state: input.state || null,
        city: input.city || null,
        openTo: input.openTo,
        referralCode: referralCode(),
        passwordResetToken: plan.token,
        passwordResetExpiry: setPasswordExpiry(),
      },
      select: { id: true },
    });
  } catch (err: unknown) {
    // Two submissions racing on one email: the loser reports the winner's profile.
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return Response.json({ status: "existing", loginUrl: loginUrl() });
    }
    throw err;
  }

  await notifyAdmins({
    type: "SYSTEM",
    severity: "INFO",
    title: `${input.cadre === "MIDWIFERY" ? "Midwife" : "Nurse"} joined CadreHealth from Mezo: ${input.firstName} ${input.lastName}`,
    body: [input.state, input.source ? `via ${input.source}` : null].filter(Boolean).join(", ") || "From the Mezo nurses page",
    href: `/admin/cadrehealth/${created.id}`,
    metadata: { mezoRef: input.mezoRef, source: input.source ?? null },
    emailAdmins: false,
  }).catch((e) => console.error("[partners/mezo/nurse] admin notify failed", e));

  return Response.json({ status: "created", professionalId: created.id, setPasswordUrl: setPasswordUrl(plan.token) });
}
