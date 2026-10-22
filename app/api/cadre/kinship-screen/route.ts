import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { notifyInternal } from "@/lib/email";
import {
  KINSHIP_FACILITY_SLUG,
  KINSHIP_QUESTIONS,
  KINSHIP_QUESTION_KEYS,
  KINSHIP_ROLES,
  answerLines,
  explanation,
  scoreKinship,
} from "@/lib/cadreHealth/kinshipScreen";

const oneOf = (values: readonly string[]) => z.string().refine((v) => values.includes(v));

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(8).max(20),
  role: oneOf(KINSHIP_ROLES.map((r) => r.value)),
  salary: z.string().trim().min(2).max(120),
  update: z.string().trim().min(10).max(1000),
  ...Object.fromEntries(KINSHIP_QUESTION_KEYS.map((k) => [k, oneOf(KINSHIP_QUESTIONS[k].options.map((o) => o.value))])),
});

/** The shortlist alert goes to whoever is running the search. */
const ALERT_TO = (process.env.KINSHIP_ALERT_EMAIL ?? "abigail.ayomide04@gmail.com,hello@consultforafrica.com").split(",").map((e) => e.trim());

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const POST = handler(async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`kinship-screen:${ip}`)).success) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please answer every question." }, { status: 400 });
  const a = parsed.data as z.infer<typeof schema> & Parameters<typeof scoreKinship>[0];

  const role = KINSHIP_ROLES.find((r) => r.value === a.role)!;
  const mandate = await prisma.cadreMandate.findFirst({
    where: { facility: { slug: KINSHIP_FACILITY_SLUG }, subSpecialty: role.subSpecialty, status: "OPEN", isPublished: true },
    select: { id: true, title: true },
  });
  if (!mandate) return Response.json({ error: "This role is no longer open." }, { status: 404 });

  let professional = await prisma.cadreProfessional.findUnique({ where: { email: a.email } });
  if (!professional) {
    const [firstName, ...rest] = a.name.split(/\s+/);
    professional = await prisma.cadreProfessional.create({
      data: { firstName, lastName: rest.join(" "), email: a.email, phone: a.phone, cadre: "NURSING", accountStatus: "UNVERIFIED", availability: "ACTIVELY_LOOKING" },
    });
  } else if (!professional.phone) {
    await prisma.cadreProfessional.update({ where: { id: professional.id }, data: { phone: a.phone } });
  }

  const s = scoreKinship(a);
  const notes = [`Kinship screening, ${new Date().toISOString().slice(0, 10)}. ${s.score}/100.`, ...answerLines(a), `Pay asked: ${a.salary}`, `Update to the daughter:\n  ${a.update}`].join("\n");
  const data = { notes, status: s.status, matchScore: s.score, matchExplanation: explanation(a, s) };

  const key = { mandateId_professionalId: { mandateId: mandate.id, professionalId: professional.id } };
  const existing = await prisma.cadreMandateMatch.findUnique({ where: key, select: { id: true, notes: true } });
  if (existing) {
    // A second submission replaces the first; the Google Form summary from the import stays above it.
    const form = existing.notes?.split("\n\nKinship screening")[0];
    const keep = form && !form.startsWith("Kinship screening") ? `${form}\n\n` : "";
    await prisma.cadreMandateMatch.update({ where: key, data: { ...data, notes: keep + notes } });
  } else {
    await prisma.cadreMandateMatch.create({ data: { ...data, mandateId: mandate.id, professionalId: professional.id, source: "APPLIED" } });
    await prisma.cadreMandate.update({ where: { id: mandate.id }, data: { applicationCount: { increment: 1 } } });
  }

  if (s.status === "SHORTLISTED") {
    await notifyInternal(
      ALERT_TO,
      `Kinship shortlist: ${a.name}, ${role.label} (${s.score})`,
      `<p style="margin:0 0 12px;"><strong>${esc(a.name)}</strong> (${esc(a.email)}, ${esc(a.phone)}) scored ${s.score}/100 for ${esc(mandate.title)}.</p>
       <p style="margin:0 0 12px;white-space:pre-line;">${esc(data.matchExplanation)}</p>
       <p style="margin:0;"><a href="https://www.consultforafrica.com/admin/cadrehealth/mandates/${mandate.id}">Open the mandate</a></p>`,
    ).catch((err) => console.error("[kinship-screen] alert failed", err));
  }

  return Response.json({ ok: true, screenedOut: s.status === "REJECTED", isNew: !professional.passwordHash });
});
