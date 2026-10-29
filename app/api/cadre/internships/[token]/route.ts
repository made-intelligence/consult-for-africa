import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { apiLimiter } from "@/lib/rate-limit-redis";
import { drawPaper, GRACE_MS, readPaper } from "@/lib/cadreHealth/internship/assessment";
import { closeAttempt, loadApplication, publicView } from "@/lib/cadreHealth/internship/state";
import { MAX_PREFERENCES } from "@/lib/cadreHealth/internship/programme";
import { PUBLIC_CENTRE } from "@/lib/cadreHealth/internship/listing";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({ action: z.literal("answer"), questionId: z.string().min(1).max(10), choice: z.number().int().min(0).max(3) }),
  z.object({ action: z.literal("submit") }),
  z.object({ action: z.literal("accept"), preferenceId: z.string().min(1) }),
  z.object({ action: z.literal("decline"), preferenceId: z.string().min(1) }),
  z.object({ action: z.literal("choose"), centreIds: z.array(z.string().min(1)).max(MAX_PREFERENCES) }),
]);

type Ctx = { params: Promise<{ token: string }> };

export const GET = handler(async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const app = await loadApplication(token);
  if (!app) return Response.json({ error: "This link is not valid." }, { status: 404 });
  return Response.json(publicView(app));
});

/**
 * POST /api/cadre/internships/[token]
 *
 * The token is the applicant's credential, sent only to their inbox. Every
 * timing decision is the server's: the browser's clock is shown, never trusted.
 */
export const POST = handler(async function POST(req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  if (!(await apiLimiter.limit(`internship:${token}`)).success) {
    return Response.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const body = parsed.data;

  const app = await loadApplication(token);
  if (!app) return Response.json({ error: "This link is not valid." }, { status: 404 });
  if (app.status === "WITHDRAWN") return Response.json({ error: "This application has been withdrawn." }, { status: 409 });

  switch (body.action) {
    case "start": {
      if (!app.attempt) {
        const { bankVersion, paper, deadlineAt } = drawPaper();
        // applicationId is unique, so a double click cannot open two papers.
        await prisma.cadreInternshipAttempt
          .create({ data: { applicationId: app.id, bankVersion, paper: paper as unknown as object, deadlineAt } })
          .catch((err: { code?: string }) => {
            if (err.code !== "P2002") throw err;
          });
      }
      break;
    }

    case "answer": {
      const a = app.attempt;
      if (!a || a.submittedAt) return Response.json({ error: "The assessment is closed." }, { status: 409 });
      if (Date.now() > a.deadlineAt.getTime() + GRACE_MS) return Response.json({ error: "Time is up." }, { status: 409 });
      if (!readPaper(a.paper).some((p) => p.id === body.questionId)) return Response.json({ error: "Unknown question." }, { status: 400 });
      // Merged in the database, so two answers saved a moment apart cannot
      // overwrite each other the way a read-modify-write of the JSON would.
      await prisma.$executeRaw`
        UPDATE "CadreInternshipAttempt"
        SET "answers" = "answers" || jsonb_build_object(${body.questionId}::text, ${body.choice}::int)
        WHERE "id" = ${a.id} AND "submittedAt" IS NULL`;
      return Response.json({ ok: true });
    }

    case "submit": {
      if (!app.attempt) return Response.json({ error: "The assessment has not been started." }, { status: 409 });
      await closeAttempt(app.attempt.id);
      break;
    }

    case "accept":
    case "decline": {
      const pref = app.preferences.find((p) => p.id === body.preferenceId);
      if (!pref || pref.status !== "OFFERED") return Response.json({ error: "There is no open offer to answer." }, { status: 409 });
      if (body.action === "decline") {
        await prisma.cadreInternshipPreference.update({ where: { id: pref.id }, data: { status: "WITHDRAWN", decidedAt: new Date() } });
      } else {
        // Taking one place releases every other choice, so those centres can
        // offer the place to the next person on their list.
        await prisma.$transaction([
          prisma.cadreInternshipPreference.update({ where: { id: pref.id }, data: { status: "ACCEPTED", decidedAt: new Date() } }),
          prisma.cadreInternshipPreference.updateMany({
            where: { applicationId: app.id, id: { not: pref.id }, status: { in: ["PENDING", "INVITED", "OFFERED"] } },
            data: { status: "WITHDRAWN", decidedAt: new Date() },
          }),
          prisma.cadreInternshipApplication.update({ where: { id: app.id }, data: { status: "PLACED" } }),
        ]);
      }
      break;
    }
  }

  if (body.action === "choose") {
    // Choices can change until any centre acts. After that, the record of what
    // a centre was shown stays as it was.
    if (app.status === "PLACED" || app.preferences.some((p) => p.status !== "PENDING")) {
      return Response.json({ error: "A centre has already acted on your application, so your choices are fixed." }, { status: 409 });
    }
    const ids = [...new Set(body.centreIds)];
    const ok = await prisma.cadreInternshipCentre.count({ where: { id: { in: ids }, ...PUBLIC_CENTRE } });
    if (ok !== ids.length) return Response.json({ error: "One of those centres is not taking part." }, { status: 400 });
    await prisma.$transaction([
      prisma.cadreInternshipPreference.deleteMany({ where: { applicationId: app.id } }),
      prisma.cadreInternshipPreference.createMany({ data: ids.map((centreId, i) => ({ applicationId: app.id, centreId, rank: i + 1 })) }),
    ]);
  }

  const fresh = await loadApplication(token);
  return Response.json(publicView(fresh!));
});
