/**
 * Tells the seven takers blocked by the module-completion fault (fixed 16 Oct
 * 2026, PR #71) that their answers were saved and they can finish now.
 * Re-runs skip anyone already sent.
 *
 *   npx tsx --env-file=.env.local scripts/send-maarova-fix-notice.ts --to=me@x   # test copy
 *   npx tsx --env-file=.env.local scripts/send-maarova-fix-notice.ts --send
 */
import fs from "fs";
import { sendViaZeptoMail } from "@/lib/zeptomail";

const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const FROM = process.env.MAAROVA_SMTP_FROM ?? process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const PORTAL = "https://www.consultforafrica.com/maarova/portal/assessment";
const LOG = "scripts/out/maarova-fix-notice-sent.json";

const PEOPLE = [
  { email: "pharmifeanyiorjikalu@gmail.com", first: "Ifeanyichukwu", wrote: true },
  { email: "jndwiga@gmail.com", first: "Jackline", wrote: true },
  { email: "mikailolabanji@gmail.com", first: "Olabanji", wrote: true },
  { email: "sonia.elkara@gmail.com", first: "Sonia", wrote: true },
  { email: "adegboyedavies@gmail.com", first: "Oluwatobiloba", wrote: false },
  { email: "debbyali99@gmail.com", first: "Deborah", wrote: false },
  { email: "focus.anita@gmail.com", first: "Anita", wrote: false },
];

const parse = (addr: string) => {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
};

function body(first: string, wrote: boolean) {
  const lines = [
    `Dear ${first},`,
    wrote
      ? "Thank you for writing to us, and for the detail you gave. It took us straight to the cause."
      : "You may have found that some modules of your Maarova assessment would not complete.",
    "A fault on our side stopped DISC Behavioural Style, Values & Drivers and Emotional Intelligence from completing even when every question had been answered, and left the leadership identity module empty. It is now fixed. Every answer you gave was saved, so there is nothing to redo.",
    "When you next sign in you can complete those modules straight away. The identity module now opens with its questions. We have extended your session to Friday 23 October so you have the full week.",
    "We are sorry for the time this cost you.",
  ];
  const sign = ["With warm regards,", "Dr Debo Odulana", "Founding Partner, Consult for Africa"];
  const p = (t: string) => `<p style="margin:0 0 14px;">${t}</p>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;font-size:15px;line-height:1.6;">
${lines.slice(0, 4).map(p).join("\n")}
<p style="margin:4px 0 18px;"><a href="${PORTAL}" style="display:inline-block;padding:12px 24px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">Continue your assessment</a></p>
${p(lines[4])}
<p style="margin:18px 0 4px;">${sign[0]}</p>
<p style="margin:0;font-weight:600;">${sign[1]}</p>
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${sign[2]}</p>
</div></body></html>`;
  const text = [...lines.slice(0, 4), PORTAL, lines[4], "", ...sign].join("\n\n").replace(/\n\n(Dr Debo|Founding)/g, "\n$1");
  return { html, text };
}

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set.");
  const subject = "Your Maarova assessment: the modules now complete";
  if (!SEND) {
    const { html, text } = body(PEOPLE[0].first, true);
    if (!TO) return console.log(text, "\n\nDRY RUN. --to=address for a test, --send to send.");
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: TO }], replyTo: parse(FROM), subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
    return console.log(TO, r.ok ? "sent" : r.error);
  }
  const sent: string[] = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : [];
  for (const person of PEOPLE) {
    if (sent.includes(person.email)) { console.log(person.email, "already sent"); continue; }
    const { html, text } = body(person.first, person.wrote);
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: person.email, name: person.first }], replyTo: parse(FROM), subject, htmlbody: html, textbody: text });
    console.log(person.email, r.ok ? "sent" : r.error);
    if (r.ok) { sent.push(person.email); fs.mkdirSync("scripts/out", { recursive: true }); fs.writeFileSync(LOG, JSON.stringify(sent, null, 2)); }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
