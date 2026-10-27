import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { contactLimiter } from "@/lib/rate-limit-redis";
import { notifyInternal } from "@/lib/email";
import { KENYA_FACILITY_SLUG } from "@/lib/cadreHealth/kenyaScreen";
import {
  BAND_LABEL,
  RELOCATION_MAX,
  matchFromRelocationToken,
  relocationBlock,
  scoreRelocation,
  withRelocationBlock,
} from "@/lib/cadreHealth/zuriRelocationFit";

const schema = z.object({
  answers: z.record(z.string(), z.string().max(40)),
  note: z.string().trim().max(2000).default(""),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Saves an applicant's relocation answers onto their Zuri application.
 *
 * The status is not touched: a band ranks, it does not decide, and a flag is
 * for Dr Ike to read, not for the system to act on.
 */
export const POST = handler(async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const matchId = matchFromRelocationToken(token);
  if (!matchId) return Response.json({ error: "This link is not valid." }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await contactLimiter.limit(`relocation:${ip}`)).success) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Please answer every question." }, { status: 400 });

  const result = scoreRelocation(parsed.data.answers);
  if (!result) return Response.json({ error: "Please answer every question." }, { status: 400 });

  const match = await prisma.cadreMandateMatch.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      notes: true,
      mandate: { select: { title: true, facility: { select: { slug: true } } } },
      professional: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  if (!match || match.mandate.facility?.slug !== KENYA_FACILITY_SLUG) {
    return Response.json({ error: "This link is not valid." }, { status: 404 });
  }

  const block = relocationBlock({ ...parsed.data.answers, note: parsed.data.note }, result);
  await prisma.cadreMandateMatch.update({ where: { id: match.id }, data: { notes: withRelocationBlock(match.notes, block) } });

  const p = match.professional;
  await notifyInternal(
    process.env.CADRE_ALERT_EMAIL ?? "hello@consultforafrica.com",
    `Zuri relocation fit: ${p.firstName} ${p.lastName}, ${BAND_LABEL[result.band]} (${result.score}/${RELOCATION_MAX})`,
    `<p style="margin:0 0 12px;"><strong>${esc(`${p.firstName} ${p.lastName}`)}</strong> (${esc(p.email)}) answered the relocation questions for ${esc(match.mandate.title)}.</p>
     <p style="margin:0;white-space:pre-line;">${esc(block)}</p>`,
  ).catch((err) => console.error("[relocation] alert failed", err));

  return Response.json({ ok: true });
});
