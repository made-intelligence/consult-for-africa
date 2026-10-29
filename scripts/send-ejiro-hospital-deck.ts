/**
 * Send Ejiro the services deck for her hospital email blast, as a PDF to attach
 * and a PPTX to edit, via ZeptoMail from hello@ so the send is evidenced in the
 * mailbox Debo checks. Debo and Nimi, who leads the team, are copied.
 *
 *   npx tsx --env-file=.env.local scripts/send-ejiro-hospital-deck.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ejiro-hospital-deck.ts --apply  # send
 *
 * Build the deck first: python3 scripts/build-cfa-hospital-services-deck.py
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const TO = { address: "ejiroalechenu0@gmail.com", name: "Ejiro Alechenu" };
const CC = [
  { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" },
  { address: "toluwanimiolayeni@gmail.com", name: "Toluwanimi Olayeni" },
];
const REPLY_TO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };

const DIR = join(process.cwd(), "docs", "growth");
const BUILDER = join(process.cwd(), "scripts", "build-cfa-hospital-services-deck.py");
const FILES = [
  {
    path: join(DIR, "cfa-hospital-services-deck.pdf"),
    name: "Consult for Africa - Services for Hospitals.pdf",
    mime: "application/pdf",
  },
  {
    path: join(DIR, "cfa-hospital-services-deck.pptx"),
    name: "Consult for Africa - Services for Hospitals (editable).pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

const SUBJECT = "The hospital services deck for your email blast";

const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937">
  <p>Ejiro,</p>
  <p>Attached is the deck for your hundred hospitals, in two forms: the <strong>PDF</strong> to attach to the
     email, and the <strong>PowerPoint</strong> to edit if a hospital or a call needs something changed.</p>
  <p>It is thirteen slides. It opens with everything on one page, then claims and debt recovery, patients and
     referrals, turnaround and the organisational audit, one slide each, then strategy, people, governance and
     systems, and closes on three ways to start, with your name on the contact slide.</p>
  <p>The lead offer is the <strong>free claims review</strong>: a hospital sends its list of unpaid HMO and
     corporate claims and we tell it what is recoverable. That is the easiest yes on a follow up call, and it
     opens the door to the rest.</p>
  <p>Three rules hold in any edit. No fees or rates. No client names. No platform names; describe the service,
     not the product that delivers it.</p>
  <p>Please send the blast through hello@ rather than a personal address, so replies and bounces are kept in
     one place.</p>
  <p>With best regards,<br/>Consult for Africa</p>
</div>`;

const text = `Ejiro,

Attached is the deck for your hundred hospitals, in two forms: the PDF to attach to the email, and the PowerPoint to edit if a hospital or a call needs something changed.

It is thirteen slides. It opens with everything on one page, then claims and debt recovery, patients and referrals, turnaround and the organisational audit, one slide each, then strategy, people, governance and systems, and closes on three ways to start, with your name on the contact slide.

The lead offer is the free claims review: a hospital sends its list of unpaid HMO and corporate claims and we tell it what is recoverable. That is the easiest yes on a follow up call, and it opens the door to the rest.

Three rules hold in any edit. No fees or rates. No client names. No platform names; describe the service, not the product that delivers it.

Please send the blast through hello@ rather than a personal address, so replies and bounces are kept in one place.

With best regards,
Consult for Africa`;

async function main() {
  const apply = process.argv.includes("--apply");

  const builderTime = statSync(BUILDER).mtimeMs;
  const attachments = FILES.map((f) => {
    if (!existsSync(f.path)) throw new Error(`Not found: ${f.path}. Run python3 scripts/build-cfa-hospital-services-deck.py.`);
    if (statSync(f.path).mtimeMs < builderTime) throw new Error(`${f.name} is older than its builder. Rebuild first.`);
    const buf = readFileSync(f.path);
    console.log(`Attachment: ${f.name} (${Math.round(buf.length / 1024)} KB)`);
    return { name: f.name, content: buf.toString("base64"), mime_type: f.mime };
  });

  const src = readFileSync(BUILDER, "utf8");
  if (/—/.test(src) || /—/.test(html)) throw new Error("Em dash found. House rule: none, anywhere.");
  if (/Maarova|CadreHealth|HospitlOS|Mezo/.test(src.split("# ================================================================ content ===")[1] ?? "")) {
    throw new Error("A platform name is in the deck copy.");
  }

  console.log(`From:     ${FROM.name} <${FROM.address}>`);
  console.log(`To:       ${TO.name} <${TO.address}>`);
  console.log(`Cc:       ${CC.map((c) => `${c.name} <${c.address}>`).join(", ")}`);
  console.log(`Reply-To: ${REPLY_TO.name} <${REPLY_TO.address}>`);
  console.log(`Subject:  ${SUBJECT}`);

  if (!apply) {
    console.log("\nDRY RUN. Re-run with --apply to send.");
    return;
  }

  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (!key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");

  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [{ email_address: TO }],
      cc: CC.map((c) => ({ email_address: c })),
      reply_to: [REPLY_TO],
      subject: SUBJECT,
      htmlbody: html,
      textbody: text,
      attachments,
    }),
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = data?.error?.details?.[0]?.message ?? data?.error?.message ?? data?.message ?? `HTTP ${res.status}`;
    throw new Error(`ZeptoMail send failed: ${msg}`);
  }
  console.log(`\nSent. request_id=${data?.request_id ?? "?"} message_id=${data?.data?.[0]?.message_id ?? "?"}`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
