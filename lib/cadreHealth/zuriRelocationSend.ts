/**
 * Sends the relocation questions to everyone still in play on a Zuri Health
 * role. It runs on the server because the links are signed with production's
 * NEXTAUTH_SECRET, which Vercel will not release to a laptop.
 *
 * Only applications that passed the screening gates and have not been declined
 * are asked. Anyone who has answered, is suppressed, or was already sent the
 * link is skipped; a sent link is recorded as a line in the match notes, so a
 * second press of the button never mails anyone twice.
 */
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { salutationFor } from "@/lib/cadreSalutation";
import { KENYA_FACILITY_SLUG } from "@/lib/cadreHealth/kenyaScreen";
import { readRelocationFit, relocationToken } from "@/lib/cadreHealth/zuriRelocationFit";

const SITE = "https://www.consultforafrica.com";
const FROM_NAME = "Consult For Africa";
const FROM_EMAIL = "hello@consultforafrica.com";
const STILL_IN_PLAY = ["NEW", "REVIEWING", "SHORTLISTED"] as const;
const SENT_LINE = "Relocation questions sent";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const roleName = (title: string) => title.replace(/\s*\(Nairobi, Kenya\)\s*$/, "");

export function renderRelocationEmail(p: { id: string; firstName: string; lastName: string }, matchId: string, title: string) {
  const url = `${SITE}/oncadre/relocation/${relocationToken(matchId)}`;
  const unsub = `${SITE}/oncadre/unsubscribe/${p.id}`;
  const hello = salutationFor(p, { assumeDoctor: true });
  const role = roleName(title);
  const subject = `Your Zuri Health application: the move to Nairobi`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:580px;margin:0 auto;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px;">${esc(hello)}</p>
<p style="margin:0 0 14px;">Thank you for applying for the ${esc(role)} role with Zuri Health in Nairobi.</p>
<p style="margin:0 0 14px;">Before we introduce you, Zuri have asked what a move would involve for each applicant: when you could start, what you would need to wind down here, and who would move with you. Nine short questions, about two minutes.</p>
<p style="margin:0 0 20px;">Your answers go with your application to Zuri's medical team and to nobody else.</p>
<p style="margin:0 0 24px;"><a href="${esc(url)}" style="display:inline-block;padding:12px 26px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">Answer the questions</a></p>
<p style="margin:0 0 4px;">With kind regards,</p>
<p style="margin:0;font-weight:600;">Dr Debo Odulana</p>
<p style="margin:2px 0 24px;font-size:13px;color:#6b7280;">Founding Partner, Consult for Africa</p>
<p style="margin:0;font-size:12px;color:#9ca3af;">You are receiving this because you applied for a Zuri Health role through CadreHealth. <a href="${esc(unsub)}" style="color:#6b7280;">Unsubscribe</a>.</p>
</div></body></html>`;

  const text = `${hello}

Thank you for applying for the ${role} role with Zuri Health in Nairobi.

Before we introduce you, Zuri have asked what a move would involve for each applicant: when you could start, what you would need to wind down here, and who would move with you. Nine short questions, about two minutes:
${url}

Your answers go with your application to Zuri's medical team and to nobody else.

With kind regards,
Dr Debo Odulana
Founding Partner, Consult for Africa

You are receiving this because you applied for a Zuri Health role through CadreHealth. Unsubscribe: ${unsub}`;
  return { subject, html, text, url };
}

export async function relocationQueue() {
  const matches = await prisma.cadreMandateMatch.findMany({
    where: { source: "APPLIED", status: { in: [...STILL_IN_PLAY] }, mandate: { facility: { slug: KENYA_FACILITY_SLUG } } },
    select: {
      id: true,
      status: true,
      notes: true,
      mandate: { select: { title: true, subSpecialty: true } },
      professional: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const suppressed = new Set((await prisma.communicationSuppression.findMany({ select: { email: true } })).map((s) => s.email?.toLowerCase()));

  const skipped = { screenedOut: 0, answered: 0, suppressed: 0, alreadySent: 0 };
  const queue = matches.filter((m) => {
    if (m.notes?.includes("Screened out:")) return !++skipped.screenedOut;
    if (readRelocationFit(m.notes)) return !++skipped.answered;
    if (suppressed.has(m.professional.email.toLowerCase())) return !++skipped.suppressed;
    if (m.notes?.includes(SENT_LINE)) return !++skipped.alreadySent;
    return true;
  });
  const byRole: Record<string, number> = {};
  for (const m of queue) byRole[m.mandate.subSpecialty ?? "Other"] = (byRole[m.mandate.subSpecialty ?? "Other"] ?? 0) + 1;
  const answered = matches.filter((m) => readRelocationFit(m.notes)).length;
  return { inPlay: matches.length, answered, skipped, byRole, queue };
}

/** One copy to the person pressing the button, carrying a real applicant's link so it proves the page they will land on. */
export async function sendRelocationTest(to: string) {
  const { queue } = await relocationQueue();
  if (!queue[0]) return { ok: false, error: "Nobody left to send to." };
  const { subject, html, text } = renderRelocationEmail({ id: "test", firstName: "Debo", lastName: "Odulana" }, queue[0].id, queue[0].mandate.title);
  const r = await sendViaZeptoMail({ from: { name: FROM_NAME, email: FROM_EMAIL }, to: [{ email: to }], replyTo: { name: FROM_NAME, email: FROM_EMAIL }, subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function sendRelocationAll() {
  const { queue } = await relocationQueue();
  let sent = 0;
  const failed: string[] = [];
  for (const m of queue) {
    const { subject, html, text } = renderRelocationEmail(m.professional, m.id, m.mandate.title);
    const r = await sendViaZeptoMail({ from: { name: FROM_NAME, email: FROM_EMAIL }, to: [{ email: m.professional.email }], replyTo: { name: FROM_NAME, email: FROM_EMAIL }, subject, htmlbody: html, textbody: text, trackingTag: "zuri-relocation" });
    if (r.ok) {
      sent++;
      const line = `${SENT_LINE} ${new Date().toISOString().slice(0, 10)}.`;
      await prisma.cadreMandateMatch.update({ where: { id: m.id }, data: { notes: m.notes ? `${m.notes}\n${line}` : line } });
    } else failed.push(`${m.professional.email}: ${r.error}`);
    await new Promise((res) => setTimeout(res, 300));
  }
  return { sent, failed };
}
