import { NextRequest, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { sendCentreDecision } from "@/lib/cadreHealth/internship/email";

const schema = z.object({ action: z.enum(["invite", "offer", "decline"]) });

const TRANSITIONS = {
  invite: { from: ["PENDING"], to: "INVITED" },
  offer: { from: ["PENDING", "INVITED"], to: "OFFERED" },
  decline: { from: ["PENDING", "INVITED"], to: "DECLINED" },
} as const;

/**
 * POST /api/cadre/employer/internships/[id]
 *
 * A centre moves one candidate on its own list. Scoped by the centre linked to
 * the caller's org, so one centre can never act on another's candidates.
 */
export const POST = handler(async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) return Response.json({ error: "Please sign in." }, { status: 401 });
  if (ctx.role === "VIEWER") return Response.json({ error: "Your seat can view but not act." }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const t = TRANSITIONS[parsed.data.action];

  const { id } = await params;
  const pref = await prisma.cadreInternshipPreference.findFirst({
    where: { id, centre: { employerOrgId: ctx.org.id } },
    select: {
      id: true,
      status: true,
      centre: { select: { name: true } },
      application: { select: { accessToken: true, professional: { select: { firstName: true, email: true } } } },
    },
  });
  if (!pref) return Response.json({ error: "Not found." }, { status: 404 });

  const moved = await prisma.cadreInternshipPreference.updateMany({
    where: { id: pref.id, status: { in: [...t.from] } },
    data: { status: t.to, decidedAt: new Date() },
  });
  if (moved.count === 0) return Response.json({ error: "This candidate has already moved on." }, { status: 409 });

  after(() =>
    sendCentreDecision({
      to: pref.application.professional.email,
      firstName: pref.application.professional.firstName,
      token: pref.application.accessToken,
      centre: pref.centre.name,
      status: t.to,
    }).catch((err) => console.error("[internships] decision email failed", err)),
  );

  return Response.json({ ok: true, status: t.to });
});
