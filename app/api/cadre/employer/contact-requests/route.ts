import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import { sendCadreEmail } from "@/lib/cadreEmail";
import { greetingFor } from "@/lib/cadreSalutation";

/**
 * Asking a professional whether a hospital may approach them.
 *
 * 9,300 people on the register were imported from their regulatory body and have
 * never claimed a profile. They did not agree to be contacted by employers, so
 * an employer never receives an email address or a phone number from search.
 * They raise one of these instead, the professional answers, and the answer is
 * recorded either way so nobody is asked twice by the same hospital.
 */

/** How long a professional has to answer before the request lapses. */
const EXPIRY_DAYS = 30;

export const POST = handler(async function POST(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canWrite(ctx)) {
    return NextResponse.json(
      { error: "Your access does not allow approaching candidates." },
      { status: 403 },
    );
  }

  // Verification is the point at which we are willing to put a hospital's name
  // in front of a doctor. Until then they can search, not reach.
  if (!ctx.org.isVerified) {
    return NextResponse.json(
      {
        error:
          "Your organisation needs to be verified before you can approach professionals.",
        code: "NOT_VERIFIED",
      },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const professionalId = typeof body.professionalId === "string" ? body.professionalId : "";
  const mandateId = typeof body.mandateId === "string" && body.mandateId ? body.mandateId : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!professionalId) {
    return NextResponse.json({ error: "professionalId is required" }, { status: 400 });
  }
  if (message.length < 20) {
    return NextResponse.json(
      { error: "Say something about the role. A bare request is rarely answered." },
      { status: 400 },
    );
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
    return NextResponse.json({ error: "Professional not found" }, { status: 404 });
  }
  // Someone who has said they do not want to be approached is not shown in
  // search, and is not reachable by guessing an id either.
  if (professional.availability === "NOT_LOOKING" || professional.accountStatus === "SUSPENDED") {
    return NextResponse.json(
      { error: "This professional is not open to approaches." },
      { status: 403 },
    );
  }

  // If the role is named, it has to be one of ours.
  if (mandateId) {
    const owned = await prisma.cadreMandate.findFirst({
      where: { id: mandateId, employerOrgId: ctx.org.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
  }

  // A previous no stands. Asking again through a new request would turn a
  // consent gate into a nuisance.
  const declined = await prisma.cadreContactRequest.findFirst({
    where: { orgId: ctx.org.id, professionalId, status: "DECLINED" },
    select: { id: true },
  });
  if (declined) {
    return NextResponse.json(
      { error: "This professional has already declined an approach from you.", code: "DECLINED" },
      { status: 409 },
    );
  }

  const existing = await prisma.cadreContactRequest.findUnique({
    where: {
      orgId_professionalId_mandateId: { orgId: ctx.org.id, professionalId, mandateId },
    },
    select: { id: true, status: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.status === "ACCEPTED"
            ? "They have already agreed. Their details are on their profile."
            : "You have already asked. We will tell you when they answer.",
        code: existing.status,
      },
      { status: 409 },
    );
  }

  const request = await prisma.cadreContactRequest.create({
    data: {
      orgId: ctx.org.id,
      professionalId,
      mandateId,
      message,
      requestedById: ctx.accountId,
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.cadreNotification.create({
    data: {
      professionalId,
      type: "CONTACT_REQUEST",
      title: `${ctx.org.name} would like to contact you`,
      message:
        message.length > 140 ? `${message.slice(0, 140)}...` : message,
      link: "/oncadre/approaches",
    },
  });

  // Best effort. The notification in the portal is the record; the email is the
  // nudge, and a bounced address should not fail the request.
  try {
    await sendCadreEmail({
      to: professional.email,
      subject: `${ctx.org.name} would like to contact you`,
      heading: "A hospital has asked to reach you",
      body: `${greetingFor(professional)}, ${ctx.org.name} found you on CadreHealth and would like to get in touch. They wrote:\n\n"${message}"\n\nWe have not given them your phone number or email. You decide whether they get it, and you can say no without giving a reason.`,
      ctaText: "See the request",
      ctaHref: `${process.env.NEXTAUTH_URL ?? "https://oncadre.com"}/oncadre/approaches`,
      footer: "If you would rather not hear from employers at all, you can turn approaches off in your profile.",
    });
  } catch (err) {
    console.error("[contact request] email send failed:", err);
  }

  return NextResponse.json({ ok: true, id: request.id, status: request.status });
});

/** The org's own requests, for the Candidates area to show what is outstanding. */
export const GET = handler(async function GET(req: NextRequest) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const requests = await prisma.cadreContactRequest.findMany({
    where: {
      orgId: ctx.org.id,
      ...(status ? { status: status as "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      respondedAt: true,
      professionalId: true,
      mandate: { select: { id: true, title: true } },
      professional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          cadre: true,
          subSpecialty: true,
          state: true,
          city: true,
          // Released only on a yes. An accepted request is the consent.
          email: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      message: r.message,
      createdAt: r.createdAt,
      respondedAt: r.respondedAt,
      mandate: r.mandate,
      professional: {
        id: r.professional.id,
        firstName: r.professional.firstName,
        lastName: r.professional.lastName,
        cadre: r.professional.cadre,
        subSpecialty: r.professional.subSpecialty,
        state: r.professional.state,
        city: r.professional.city,
        ...(r.status === "ACCEPTED"
          ? { email: r.professional.email, phone: r.professional.phone }
          : {}),
      },
    })),
  });
});
