/**
 * Send Dr Aisha (The Ambulance Company) Debo's speaker bio and headshots for
 * her conference.
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/send-aisha-speaker-bio.ts           # dry run
 *   npx tsx --env-file=.env.local scripts/send-aisha-speaker-bio.ts --apply   # send
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM_RAW = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const fm = FROM_RAW.match(/^\s*(.*?)\s*<(.+)>\s*$/);
const FROM = fm ? { name: fm[1], address: fm[2] } : { name: "Consult For Africa", address: FROM_RAW };
const TO = { address: "draisha@theambulancecompany.com", name: "Dr Aisha" };
const CC = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const REPLY_TO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };

const apply = process.argv.includes("--apply");

const PHOTOS = [
  { path: "public/debo-odulana.jpg", name: "Dr-Debo-Odulana-headshot.jpg" },
  { path: "public/lyfe/debo-portrait.jpg", name: "Dr-Debo-Odulana-headshot-close.jpg" },
];

const BIO = [
  "Dr Debo Odulana is a physician and healthcare operator with sixteen years in hospital leadership, health system strategy and healthcare venture building across Africa, the Middle East and the UK.",
  "He is Founding Partner of Consult for Africa, a healthcare advisory and venture firm that takes build and operate mandates for hospital groups, specialist practices, HMOs and owners.",
  "He was previously Chief Executive of Cedarcrest Hospitals Abuja, where he led the strongest financial year in the hospital's sixteen-year history, and held senior leadership at Evercare Hospital Lekki. He founded Doctoora, a private healthcare network across 21 states that was acquired by Evercare.",
  "He holds an MBBS from the University of Sharjah and an MSc in International Health Management from Imperial College Business School, London.",
];

const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
  <p>Dear Dr Aisha,</p>
  <p>Thank you for the invitation to your conference. I am glad to take part.</p>
  <p>My bio is below and two headshots are attached. Do let me know if you need a shorter version or anything else for the programme.</p>
  <p style="margin-top:24px"><strong>Dr Debo Odulana</strong><br/>Founding Partner, Consult for Africa</p>
  ${BIO.map((p) => `<p>${p}</p>`).join("\n  ")}
  <p style="margin-top:24px">Kind regards,<br/>Debo</p>
</div>`;

const text =
  `Dear Dr Aisha,\n\nThank you for the invitation to your conference. I am glad to take part.\n\n` +
  `My bio is below and two headshots are attached. Do let me know if you need a shorter version or anything else for the programme.\n\n` +
  `Dr Debo Odulana\nFounding Partner, Consult for Africa\n\n${BIO.join("\n\n")}\n\nKind regards,\nDebo\n`;

const attachments = PHOTOS.map((p) => ({
  name: p.name,
  mime_type: "image/jpeg",
  content: readFileSync(join(process.cwd(), p.path)).toString("base64"),
}));

async function main() {
  console.log(`From: ${FROM.name} <${FROM.address}>`);
  console.log(`To:   ${TO.address}   Cc: ${CC.address}`);
  console.log(`Attachments: ${attachments.map((a) => a.name).join(", ")}\n`);
  console.log(text);
  if (!apply) {
    console.log("\nDry run. Re-run with --apply to send.");
    return;
  }
  const key = process.env.ZEPTOMAIL_API_KEY;
  if (!key) throw new Error("ZEPTOMAIL_API_KEY not set (run with --env-file=.env.local)");
  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: key.startsWith("Zoho-enczapikey") ? key : `Zoho-enczapikey ${key}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [{ email_address: TO }],
      cc: [{ email_address: CC }],
      reply_to: [REPLY_TO],
      subject: "Dr Debo Odulana: speaker bio and headshot",
      htmlbody: html,
      textbody: text,
      attachments,
    }),
  });
  const body = await res.text();
  console.log(`\nZeptoMail ${res.status}: ${body}`);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
