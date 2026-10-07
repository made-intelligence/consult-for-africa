import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { handler } from "@/lib/api-handler";
import { createContactRequest } from "@/lib/cadreHealth/contactRequest";

/**
 * Asking a professional whether a hospital may approach them.
 *
 * 9,300 people on the register were imported from their regulatory body and have
 * never claimed a profile. They did not agree to be contacted by employers, so
 * an employer never receives an email address or a phone number from search.
 * They raise one of these instead, the professional answers, and the answer is
 * recorded either way so nobody is asked twice by the same hospital.
 *
 * The guards and the wording live in lib/cadreHealth/contactRequest.ts, shared
 * with the admin route CFA uses to approach on a client's behalf.
 */

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

  const body = await req.json().catch(() => ({}));

  const result = await createContactRequest({
    orgId: ctx.org.id,
    professionalId: typeof body.professionalId === "string" ? body.professionalId : "",
    mandateId: typeof body.mandateId === "string" && body.mandateId ? body.mandateId : null,
    message: typeof body.message === "string" ? body.message : "",
    requestedById: ctx.accountId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        // An employer asking on their own behalf should read it as "your
        // organisation", not as a third-person description of themselves.
        error:
          result.code === "NOT_VERIFIED"
            ? "Your organisation needs to be verified before you can approach professionals."
            : result.error,
        ...(result.code ? { code: result.code } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true, id: result.id, status: "PENDING" });
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
