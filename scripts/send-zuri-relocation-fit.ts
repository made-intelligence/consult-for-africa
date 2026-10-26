/**
 * The relocation questions, to everyone still in play on a Zuri Health role.
 *
 * Zuri's CEO wants people with little standing between them and the move
 * (Debo, 26 Oct 2026). Each applicant gets a signed link to
 * /oncadre/relocation/[token]; their answers land on the application and
 * Dr Ike's pipeline ranks on the band. Questions and scoring live in
 * lib/cadreHealth/zuriRelocationFit.ts.
 *
 * Only applications that passed the screening gates and have not been declined
 * are asked. Anyone who has already answered is skipped, and so is anyone in
 * the send log, scripts/out/zuri-relocation-sent.json.
 *
 * The links are signed with NEXTAUTH_SECRET, and .env.local's is not
 * production's. Pull the production secret into a scratch env file and pass it
 * as a second --env-file, or every link 404s. --send refuses to run until the
 * first link returns 200 from production.
 *
 *   npx tsx --env-file=.env.local scripts/send-zuri-relocation-fit.ts                       # dry run + preview
 *   npx tsx --env-file=.env.local --env-file=<prod-secret> scripts/send-zuri-relocation-fit.ts --to=me@x   # one test
 *   npx tsx --env-file=.env.local --env-file=<prod-secret> scripts/send-zuri-relocation-fit.ts --send
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { salutationFor } from "@/lib/cadreSalutation";
import { KENYA_FACILITY_SLUG } from "@/lib/cadreHealth/kenyaScreen";
import { readRelocationFit, relocationToken } from "@/lib/cadreHealth/zuriRelocationFit";

const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const OUT = path.join(process.cwd(), "scripts/out");
const LOG = path.join(OUT, "zuri-relocation-sent.json");
const STILL_IN_PLAY = ["NEW", "REVIEWING", "SHORTLISTED"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const roleName = (title: string) => title.replace(/\s*\(Nairobi, Kenya\)\s*$/, "");

function render(p: { id: string; firstName: string; lastName: string }, matchId: string, title: string) {
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

function parse(addr: string) {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
}

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set. Bulk mail does not fall back to Zoho.");

  const matches = await prisma.cadreMandateMatch.findMany({
    where: { source: "APPLIED", status: { in: STILL_IN_PLAY }, mandate: { facility: { slug: KENYA_FACILITY_SLUG } } },
    select: {
      id: true,
      status: true,
      notes: true,
      mandate: { select: { title: true, subSpecialty: true } },
      professional: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
  const suppressed = new Set((await prisma.communicationSuppression.findMany({ select: { email: true } })).map((s) => s.email?.toLowerCase()));
  const sent: { email: string; matchId: string; at: string; id?: string }[] = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : [];
  const done = new Set(sent.map((s) => s.matchId));

  const skipped = { screenedOut: 0, answered: 0, suppressed: 0, alreadySent: 0 };
  const queue = matches.filter((m) => {
    if (m.notes?.includes("Screened out:")) return !++skipped.screenedOut;
    if (readRelocationFit(m.notes)) return !++skipped.answered;
    if (suppressed.has(m.professional.email.toLowerCase())) return !++skipped.suppressed;
    if (done.has(m.id)) return !++skipped.alreadySent;
    return true;
  });

  const byRole: Record<string, number> = {};
  for (const m of queue) byRole[m.mandate.subSpecialty ?? "?"] = (byRole[m.mandate.subSpecialty ?? "?"] ?? 0) + 1;
  const byStatus: Record<string, number> = {};
  for (const m of queue) byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
  console.log({ inPlay: matches.length, skipped, toSend: queue.length, byRole, byStatus });

  fs.mkdirSync(OUT, { recursive: true });
  if (queue[0]) fs.writeFileSync(path.join(OUT, "zuri-relocation-preview.html"), render({ id: "preview", firstName: "Adaeze", lastName: "Okafor" }, queue[0].id, queue[0].mandate.title).html);

  if (TO) {
    if (!queue[0]) throw new Error("Nobody to test against.");
    // A real applicant's link, so the test proves the page they will land on.
    const { subject, html, text } = render({ id: "test", firstName: "Debo", lastName: "Odulana" }, queue[0].id, queue[0].mandate.title);
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: TO }], replyTo: parse(FROM), subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
    console.log(r.ok ? "test sent" : r.error);
    return;
  }

  if (!SEND) {
    console.log("DRY RUN. Preview in scripts/out/zuri-relocation-preview.html. Pass --send to send.");
    return;
  }

  // Proves the route is deployed and the secret is production's.
  const probe = await fetch(render(queue[0].professional, queue[0].id, queue[0].mandate.title).url);
  if (probe.status !== 200) throw new Error(`The first link returned ${probe.status} from production. Deployed? Production NEXTAUTH_SECRET loaded?`);

  let ok = 0;
  const failed: string[] = [];
  for (const m of queue) {
    const { subject, html, text } = render(m.professional, m.id, m.mandate.title);
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: m.professional.email }], replyTo: parse(FROM), subject, htmlbody: html, textbody: text, trackingTag: "zuri-relocation" });
    if (r.ok) {
      ok++;
      sent.push({ email: m.professional.email.toLowerCase(), matchId: m.id, at: new Date().toISOString(), id: r.messageId });
      fs.writeFileSync(LOG, JSON.stringify(sent, null, 1));
    } else failed.push(`${m.professional.email}: ${r.error}`);
    await new Promise((res) => setTimeout(res, 300));
  }
  console.log({ sent: ok, failed: failed.length });
  if (failed.length) console.log(failed.join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
