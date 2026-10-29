import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreSession } from "@/lib/cadreAuth";
import { handler } from "@/lib/api-handler";
import { sendCadreEmail } from "@/lib/cadreEmail";
import { displayNameFor } from "@/lib/cadreSalutation";

/**
 * A professional answering a hospital that asked to contact them.
 *
 * The answer is recorded either way. A no is as useful as a yes: it stops the
 * same hospital asking again, and it is the only way the platform can promise
 * the register cohort that being listed does not mean being pestered.
 *
 * PATCH body: { accept: boolean }
 */
export const PATCH = handler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCadreSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const accept = !!body.accept;

  const request = await prisma.cadreContactRequest.findFirst({
    // Scoped to the signed-in professional, so an id from someone else's inbox
    // is a 404 rather than an answer on their behalf.
    where: { id, professionalId: session.sub },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      mandateId: true,
      org: {
        select: {
          id: true,
          name: true,
          members: {
            where: { role: { in: ["OWNER", "RECRUITER"] } },
            select: { contactEmail: true, contactName: true },
            take: 1,
          },
        },
      },
      professional: {
        select: { id: true, firstName: true, lastName: true, cadre: true, email: true, phone: true },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json(
      { error: "You have already answered this one.", status: request.status },
      { status: 409 },
    );
  }
  if (request.expiresAt && request.expiresAt < new Date()) {
    await prisma.cadreContactRequest.update({
      where: { id: request.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "This request has lapsed." }, { status: 410 });
  }

  const status = accept ? "ACCEPTED" : "DECLINED";

  await prisma.cadreContactRequest.update({
    where: { id: request.id },
    data: { status, respondedAt: new Date() },
  });

  // A yes against a named role puts them in that role's pipeline as someone who
  // agreed to be approached, which is a different thing from having applied.
  if (accept && request.mandateId) {
    await prisma.cadreMandateMatch.upsert({
      where: {
        mandateId_professionalId: {
          mandateId: request.mandateId,
          professionalId: session.sub,
        },
      },
      create: {
        mandateId: request.mandateId,
        professionalId: session.sub,
        source: "INVITED",
        status: "NEW",
      },
      // Someone who already applied stays an applicant. Accepting an approach
      // does not demote how they arrived.
      update: {},
    });
  }

  const recipient = request.org.members[0];
  if (recipient) {
    const name = displayNameFor(request.professional);
    try {
      await sendCadreEmail({
        to: recipient.contactEmail,
        subject: accept
          ? `${name} agreed to be contacted`
          : `${name} declined your approach`,
        heading: accept ? "They said yes" : "They said no",
        body: accept
          ? `Hi ${recipient.contactName}, ${name} has agreed to hear from ${request.org.name}. Their contact details are now on their profile in your Candidates area.`
          : `Hi ${recipient.contactName}, ${name} has declined the approach from ${request.org.name}. We will not ask them again on your behalf.`,
        ...(accept
          ? {
              details: [
                { label: "Email", value: request.professional.email },
                ...(request.professional.phone
                  ? [{ label: "Phone", value: request.professional.phone }]
                  : []),
              ],
              ctaText: "Open your candidates",
              ctaHref: `${process.env.NEXTAUTH_URL ?? "https://oncadre.com"}/oncadre/employer/candidates/approaches`,
            }
          : {}),
      });
    } catch (err) {
      console.error("[contact request response] email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true, status });
});
