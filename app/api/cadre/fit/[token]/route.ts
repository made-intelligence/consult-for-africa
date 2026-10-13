import { NextRequest, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { notifyInternal } from "@/lib/email";
import { orgFromFitToken, fitProfileSchema } from "@/lib/cadreHealth/fitProfile";
import { rescoreMandate } from "@/lib/cadreHealth/fitScreen";
import { FEE_OPTIONS, INTRO_TERMS, INTRO_TERMS_VERSION } from "@/lib/cadreHealth/introductionTerms";

const text = (max: number) => z.string().trim().max(max).default("");

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  shared: z.object({ relocation: text(2000), process: text(2000) }),
  roles: z.record(
    z.string(),
    z.object({ mustHave: text(3000), dealBreakers: text(3000), standOut: text(3000), pay: text(1000), questions: text(2000), payShareable: z.boolean().default(false) }),
  ),
  feeOption: z.enum(["fixed", "percent"]),
  acceptTerms: z.literal(true),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Saves a client's fit answers and their acceptance of the introduction terms.
 *
 * Acceptance is what attaches the roles to the client's dashboard and verifies
 * the organisation; until then they can see nobody. The terms as accepted, the
 * name, the time and the address are emailed to us, which is the record.
 */
export const POST = handler(async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const orgId = orgFromFitToken(token);
  if (!orgId) return Response.json({ error: "This link is not valid." }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`fit:${ip}`)).success) return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please add your name, choose a fee basis and accept the terms." }, { status: 400 });
  const b = parsed.data;

  const org = await prisma.cadreEmployerOrg.findUnique({ where: { id: orgId }, select: { id: true, name: true, facilityId: true } });
  if (!org?.facilityId) return Response.json({ error: "This link is not valid." }, { status: 404 });

  const mandates = await prisma.cadreMandate.findMany({
    where: { facilityId: org.facilityId, status: "OPEN", id: { in: Object.keys(b.roles) } },
    select: { id: true, title: true },
  });

  const now = new Date();
  for (const m of mandates) {
    const fit = fitProfileSchema.parse({
      ...b.shared,
      ...b.roles[m.id],
      answeredBy: b.name,
      termsAcceptedBy: b.name,
      termsAcceptedAt: now.toISOString(),
      termsVersion: INTRO_TERMS_VERSION,
      feeOption: b.feeOption,
    });
    await prisma.cadreMandate.update({ where: { id: m.id }, data: { fitProfile: fit, fitProfileAt: now, employerOrgId: org.id } });
  }

  const fee = FEE_OPTIONS.find((f) => f.value === b.feeOption)!;
  await prisma.cadreEmployerOrg.update({
    where: { id: org.id },
    data: {
      isVerified: true,
      verifiedAt: now,
      verifiedNote: `Introduction terms v${INTRO_TERMS_VERSION} accepted by ${b.name} on ${now.toISOString()} from ${ip} via the fit request. Fee basis: ${fee.short}.`,
    },
  });
  await prisma.cadreEmployerAccount.updateMany({ where: { orgId: org.id }, data: { isVerified: true } });

  await notifyInternal(
    process.env.CADRE_ALERT_EMAIL ?? "hello@consultforafrica.com",
    `${org.name}: fit answers in, terms accepted (${fee.short})`,
    `<p style="margin:0 0 12px;"><strong>${esc(b.name)}</strong> answered the fit request for ${esc(org.name)} and accepted the introduction terms (version ${INTRO_TERMS_VERSION}) at ${now.toISOString()} from ${esc(ip)}.</p>
     <p style="margin:0 0 12px;"><strong>Fee basis chosen:</strong> ${esc(fee.label)}</p>
     <p style="margin:0 0 6px;"><strong>Terms as accepted</strong></p>
     <ol style="margin:0 0 16px;padding-left:20px;">${INTRO_TERMS.map((t) => `<li style="margin:0 0 6px;">${esc(t)}</li>`).join("")}</ol>
     <p style="margin:0 0 6px;"><strong>Relocation offer:</strong> ${esc(b.shared.relocation || "(blank)")}</p>
     <p style="margin:0 0 12px;"><strong>Their process:</strong> ${esc(b.shared.process || "(blank)")}</p>
     ${mandates
       .map((m) => {
         const r = b.roles[m.id];
         return `<p style="margin:12px 0 4px;"><strong>${esc(m.title)}</strong></p><p style="margin:0;white-space:pre-line;">Must have: ${esc(r.mustHave)}\nRules out: ${esc(r.dealBreakers)}\nStands out: ${esc(r.standOut)}\nPay: ${esc(r.pay)}${r.payShareable ? " (may be shared)" : " (not for sharing)"}\nQuestions: ${esc(r.questions)}</p>`;
       })
       .join("")}`,
  ).catch((err) => console.error("[fit] record email failed", err));

  // Everyone who has applied so far is scored again against the real rubric.
  after(async () => {
    for (const m of mandates) await rescoreMandate(m.id);
  });

  return Response.json({ ok: true, roles: mandates.length });
});
