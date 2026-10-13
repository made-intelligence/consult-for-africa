import { NextRequest, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { notifyInternal } from "@/lib/email";
import { scoreApplication } from "@/lib/cadreHealth/fitScreen";
import { candidateQuestions, readFitProfile } from "@/lib/cadreHealth/fitProfile";
import { KENYA_FACILITY_SLUG, KENYA_QUESTIONS, KENYA_ROLES, answerLines, screenReasons } from "@/lib/cadreHealth/kenyaScreen";

const oneOf = (values: readonly string[]) => z.string().refine((v) => values.includes(v));
const values = (key: keyof typeof KENYA_QUESTIONS) => KENYA_QUESTIONS[key].options.map((o) => o.value);

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(8).max(20),
  role: oneOf(KENYA_ROLES.map((r) => r.value)),
  relocate: oneOf(values("relocate")),
  qualification: oneOf(values("qualification")),
  years: oneOf(values("years")),
  kmpdc: oneOf(values("kmpdc")),
  notice: oneOf(values("notice")),
  caesarean: z.boolean().optional(),
  currentPost: z.string().trim().min(2).max(160),
  answers: z.array(z.string().trim().max(2000)).max(5).default([]),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`kenya-screen:${ip}`)).success) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please answer every question." }, { status: 400 });
  const a = parsed.data;

  const role = KENYA_ROLES.find((r) => r.value === a.role)!;
  const mandate = await prisma.cadreMandate.findFirst({
    where: { facility: { slug: KENYA_FACILITY_SLUG }, subSpecialty: role.subSpecialty, status: "OPEN", isPublished: true },
    select: { id: true, title: true, fitProfile: true },
  });
  if (!mandate) return Response.json({ error: "This role is no longer open." }, { status: 404 });

  let professional = await prisma.cadreProfessional.findUnique({ where: { email: a.email } });
  if (!professional) {
    const [firstName, ...rest] = a.name.split(/\s+/);
    professional = await prisma.cadreProfessional.create({
      data: {
        firstName,
        lastName: rest.join(" "),
        email: a.email,
        phone: a.phone,
        cadre: "MEDICINE",
        subSpecialty: role.subSpecialty,
        accountStatus: "UNVERIFIED",
        availability: "ACTIVELY_LOOKING",
      },
    });
  } else if (!professional.phone) {
    await prisma.cadreProfessional.update({ where: { id: professional.id }, data: { phone: a.phone } });
  }

  const reasons = screenReasons(a);
  const qualified = reasons.length === 0;
  const notes = [
    `Kenya screening, ${new Date().toISOString().slice(0, 10)}. ${qualified ? "Meets the bar." : `Screened out: ${reasons.join("; ")}.`}`,
    ...answerLines(a),
    // The client's own questions, asked in the order they wrote them.
    ...candidateQuestions(readFitProfile(mandate.fitProfile)).flatMap((q, i) => [`\nQ: ${q}`, `A: ${a.answers[i] || "(no answer)"}`]),
  ].join("\n");

  const key = { mandateId_professionalId: { mandateId: mandate.id, professionalId: professional.id } };
  const existing = await prisma.cadreMandateMatch.findUnique({ where: key });
  let matchId: string;
  if (existing) {
    // A second submission replaces the first; people correct themselves.
    await prisma.cadreMandateMatch.update({ where: key, data: { notes, status: qualified ? "NEW" : "REJECTED", matchScore: null, matchExplanation: null } });
    matchId = existing.id;
  } else {
    const row = await prisma.cadreMandateMatch.create({
      data: { mandateId: mandate.id, professionalId: professional.id, source: "APPLIED", status: qualified ? "NEW" : "REJECTED", notes },
    });
    matchId = row.id;
    await prisma.cadreMandate.update({ where: { id: mandate.id }, data: { applicationCount: { increment: 1 } } });
  }

  if (qualified) {
    // Scored after the response, so the applicant is not kept waiting on it.
    after(async () => {
      const outcome = await scoreApplication(matchId);
      if (outcome !== "SHORTLISTED") return;
      const fresh = await prisma.cadreMandateMatch.findUnique({ where: { id: matchId }, select: { matchScore: true, matchExplanation: true } });
      await notifyInternal(
        process.env.CADRE_ALERT_EMAIL ?? "hello@consultforafrica.com",
        `Zuri shortlist: ${a.name}, ${role.label} (${fresh?.matchScore ?? "?"})`,
        `<p style="margin:0 0 12px;"><strong>${esc(a.name)}</strong> (${esc(a.email)}, ${esc(a.phone)}) has been shortlisted for ${esc(mandate.title)}.</p>
         <p style="margin:0 0 12px;white-space:pre-line;">${esc(fresh?.matchExplanation ?? "")}</p>
         <p style="margin:0;white-space:pre-line;color:#6b7280;">${esc(notes)}</p>`,
      ).catch((err) => console.error("[kenya-screen] alert failed", err));
    });
  }

  return Response.json({ ok: true, qualified, isNew: !professional.passwordHash });
});
