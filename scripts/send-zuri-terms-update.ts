/**
 * Tells Dr Ike the introduction terms now carry the 5 per cent agreed on
 * 16 Oct 2026, and points him back to the fit request, where he accepts them.
 *
 *   npx tsx --env-file=.env.local scripts/send-zuri-terms-update.ts --to=me@x   # test copy
 *   npx tsx --env-file=.env.local scripts/send-zuri-terms-update.ts --send      # send to Dr Ike
 */
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { fitToken } from "@/lib/cadreHealth/fitProfile";
import { INTRO_TERMS, NETWORK_FEE_PERCENT } from "@/lib/cadreHealth/introductionTerms";

const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const IKE = { email: "ikechukwu@zuri.health", name: "Dr Ikechukwu" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const parse = (addr: string) => {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
};

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set.");

  const facility = await prisma.cadreFacility.findUnique({ where: { slug: "zuri-health" }, select: { id: true } });
  const org = facility && (await prisma.cadreEmployerOrg.findUnique({ where: { facilityId: facility.id }, select: { id: true, isVerified: true } }));
  if (!org) throw new Error("No Zuri Health employer org.");
  if (org.isVerified) throw new Error("Zuri has already accepted the terms; this notice would be out of date.");
  const fitUrl = `${SITE}/oncadre/fit/${fitToken(org.id)}`;

  const subject = `Your CadreHealth terms: ${NETWORK_FEE_PERCENT} per cent, as agreed`;
  const p = (t: string) => `<p style="margin:0 0 14px;">${t}</p>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;font-size:15px;line-height:1.6;">
${p("Dear Dr Ike,")}
${p(`Thank you for the conversation. Your introduction terms now show the fee we agreed: ${NETWORK_FEE_PERCENT} per cent of annual gross for each person you engage, charged once, with no minimum. There is no fee unless you engage someone.`)}
${p("The terms sit at the foot of the fit request. Accepting them there attaches the three roles and every shortlisted candidate to your dashboard, and releases the roles to the wider register.")}
<p style="margin:4px 0 18px;"><a href="${esc(fitUrl)}" style="display:inline-block;padding:12px 24px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">Review and accept the terms</a></p>
<p style="margin:0 0 6px;font-weight:700;color:#0B3C5D;">The terms in full</p>
<ol style="margin:0 0 16px;padding-left:20px;font-size:14px;">${INTRO_TERMS.map((t) => `<li style="margin:0 0 6px;">${esc(t)}</li>`).join("")}</ol>
<p style="margin:18px 0 4px;">With warm regards,</p>
<p style="margin:0;font-weight:600;">Dr Debo Odulana</p>
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Founding Partner, Consult for Africa</p>
</div></body></html>`;

  const text = `Dear Dr Ike,

Thank you for the conversation. Your introduction terms now show the fee we agreed: ${NETWORK_FEE_PERCENT} per cent of annual gross for each person you engage, charged once, with no minimum. There is no fee unless you engage someone.

The terms sit at the foot of the fit request. Accepting them there attaches the three roles and every shortlisted candidate to your dashboard, and releases the roles to the wider register.
${fitUrl}

THE TERMS IN FULL
${INTRO_TERMS.map((t, i) => `${i + 1}. ${t}`).join("\n\n")}

With warm regards,
Dr Debo Odulana
Founding Partner, Consult for Africa`;

  const to = SEND ? IKE.email : TO;
  if (!to) {
    console.log(text);
    console.log("\nDRY RUN. Pass --to=address for a test or --send to send to Dr Ike.");
    return;
  }
  const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: to, name: SEND ? IKE.name : undefined }], replyTo: parse(FROM), subject: SEND ? subject : `[TEST] ${subject}`, htmlbody: html, textbody: text });
  console.log(to, r.ok ? "sent" : r.error);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
