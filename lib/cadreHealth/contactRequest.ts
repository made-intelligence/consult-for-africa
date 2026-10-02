import { prisma } from "@/lib/prisma";
import { sendCadreEmail } from "@/lib/cadreEmail";
import { greetingFor } from "@/lib/cadreSalutation";

/**
 * Asking a professional whether an employer may contact them.
 *
 * Shared by the employer's own route and the admin route CFA uses to approach
 * on a client's behalf, so the two cannot drift apart on the guards that matter:
 * a previous no, an opt-out, a duplicate, or an unverified employer.
 */

/** How long a professional has to answer before the request lapses. */
const EXPIRY_DAYS = 30;

export const MIN_MESSAGE_LENGTH = 20;

/**
 * What the professional is told the employer is called.
 *
 * `publicName` is set when the client is running a confidential search. Using
 * `name` here is what leaked the client in the first message, after the board
 * had carefully not named them.
 */
export function publicNameFor(org: { name: string; publicName?: string | null }): string {
  return org.publicName?.trim() || org.name;
}

export function isAnonymousEmployer(org: { publicName?: string | null }): boolean {
  return !!org.publicName?.trim();
}

export type ContactRequestResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string; code?: string };

export async function createContactRequest(input: {
  orgId: string;
  professionalId: string;
  mandateId: string | null;
  message: string;
  /** Null when CFA staff raise it for the client rather than the client doing it. */
  requestedById: string | null;
}): Promise<ContactRequestResult> {
  const { orgId, professionalId, mandateId, requestedById } = input;
  const message = input.message.trim().slice(0, 1000);

  if (!professionalId) {
    return { ok: false, status: 400, error: "professionalId is required" };
  }
  if (message.length < MIN_MESSAGE_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: "Say something about the role. A bare request is rarely answered.",
    };
  }

  const org = await prisma.cadreEmployerOrg.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, publicName: true, isVerified: true },
  });
  if (!org) return { ok: false, status: 404, error: "Employer not found" };

  // Verification is the point at which we are willing to put an employer's name
  // in front of a doctor, and it holds whoever is doing the asking.
  if (!org.isVerified) {
    return {
      ok: false,
      status: 403,
      code: "NOT_VERIFIED",
      error: "This employer needs to be verified before anyone can be approached for them.",
    };
  }

  const professional = await prisma.cadreProfessional.findUnique({
    where: { id: professionalId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      cadre: true,
      email: true,
      availability: true,
      accountStatus: true,
    },
  });
  if (!professional) {
    return { ok: false, status: 404, error: "Professional not found" };
  }
  if (professional.availability === "NOT_LOOKING" || professional.accountStatus === "SUSPENDED") {
    return { ok: false, status: 403, error: "This professional is not open to approaches." };
  }

  if (mandateId) {
    const owned = await prisma.cadreMandate.findFirst({
      where: { id: mandateId, employerOrgId: orgId },
      select: { id: true },
    });
    if (!owned) return { ok: false, status: 404, error: "Role not found" };
  }

  // A previous no stands. Asking again through a new request would turn a
  // consent gate into a nuisance.
  const declined = await prisma.cadreContactRequest.findFirst({
    where: { orgId, professionalId, status: "DECLINED" },
    select: { id: true },
  });
  if (declined) {
    return {
      ok: false,
      status: 409,
      code: "DECLINED",
      error: "This professional has already declined an approach from this employer.",
    };
  }

  // findFirst, not findUnique on the composite key: mandateId is nullable, and
  // Postgres treats NULLs in a unique index as distinct, so the constraint does
  // not stop a second request with no role attached. This check does.
  const existing = await prisma.cadreContactRequest.findFirst({
    where: { orgId, professionalId, mandateId },
    select: { id: true, status: true },
  });
  if (existing) {
    return {
      ok: false,
      status: 409,
      code: existing.status,
      error:
        existing.status === "ACCEPTED"
          ? "They have already agreed. Their details are on their profile."
          : "They have already been asked. We will pass on the answer.",
    };
  }

  const request = await prisma.cadreContactRequest.create({
    data: {
      orgId,
      professionalId,
      mandateId,
      message,
      requestedById,
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const shownAs = publicNameFor(org);
  const anonymous = isAnonymousEmployer(org);

  await prisma.cadreNotification.create({
    data: {
      professionalId,
      type: "CONTACT_REQUEST",
      title: anonymous
        ? "An employer would like to contact you"
        : `${shownAs} would like to contact you`,
      message: message.length > 140 ? `${message.slice(0, 140)}...` : message,
      link: "/oncadre/approaches",
    },
  });

  // Best effort. The notification in the portal is the record; the email is the
  // nudge, and a bounced address should not fail the request.
  try {
    await sendCadreEmail({
      to: professional.email,
      subject: anonymous
        ? "An employer would like to contact you"
        : `${shownAs} would like to contact you`,
      heading: "An employer has asked to reach you",
      body: anonymous
        ? `${greetingFor(professional)}, we are recruiting for ${shownAs} and they would like to get in touch with you. We will name them if you take it further. They wrote:\n\n"${message}"\n\nWe have not given them your phone number or email. You decide whether they get it, and you can say no without giving a reason.`
        : `${greetingFor(professional)}, ${shownAs} found you on CadreHealth and would like to get in touch. They wrote:\n\n"${message}"\n\nWe have not given them your phone number or email. You decide whether they get it, and you can say no without giving a reason.`,
      ctaText: "See the request",
      ctaHref: `${process.env.NEXTAUTH_URL ?? "https://oncadre.com"}/oncadre/approaches`,
      footer:
        "If you would rather not hear from employers at all, you can turn approaches off in your profile.",
    });
  } catch (err) {
    console.error("[contact request] email send failed:", err);
  }

  return { ok: true, id: request.id };
}
