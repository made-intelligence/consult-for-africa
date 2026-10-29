/**
 * Send Esther, Ejiro and Abigail the nurse internship deck and one-pager, with
 * the 31 Lagos centres split between them, for their engagements with the
 * hospitals. ZeptoMail from hello@, Debo copied, replies to Debo.
 *
 *   npx tsx --env-file=.env.local scripts/send-nurse-internship-pack.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-nurse-internship-pack.ts --apply  # send
 *
 * Build first: python3 scripts/build-nurse-internship-pitch.py
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const TO = [
  { address: "estherolowoloba@gmail.com", name: "Esther Olowoloba" },
  { address: "ejiroalechenu0@gmail.com", name: "Ejiro Alechenu" },
  { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" },
];
const CC = [{ address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" }];
const REPLY_TO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };

const DIR = join(process.cwd(), "docs", "cadrehealth");
const BUILDER = join(process.cwd(), "scripts", "build-nurse-internship-pitch.py");
const FILES = [
  { path: join(DIR, "nurse-internship-deck-cfa.pdf"), name: "Nurse Internship Placement, Lagos - Deck.pdf" },
  { path: join(DIR, "nurse-internship-one-pager-cfa.pdf"), name: "Nurse Internship Placement, Lagos - One Page.pdf" },
];

const SUBJECT = "Nurse internship placement: the deck, the one-pager and your centres";

const SPLIT: { who: string; why: string; centres: string[] }[] = [
  {
    who: "Abigail",
    why: "public sector, by formal letter to the head of nursing services",
    centres: [
      "Lagos State Health Service Commission (it recruits for the three state hospitals below, so approach the Commission first)",
      "General Hospital Odan",
      "Lagos Island Maternity Hospital",
      "Ebute Metta Health Centre",
      "Lagos University Teaching Hospital",
      "National Orthopaedic Hospital, Igbobi",
      "661 NAF Hospital, Ikeja",
      "Police Hospital, Falomo",
    ],
  },
  {
    who: "Esther",
    why: "private hospitals on the Island and in Lekki",
    centres: [
      "Evercare Hospital Lekki (warm route through Debo: speak to him before any approach)",
      "Euracare Multi-Specialist Hospital",
      "Reddington Hospital",
      "Vedic Lifecare Hospital",
      "Etta Atlantic Memorial Hospital",
      "St Nicholas Hospital, Lagos Island",
      "South Shore Women's and Children's Hospital",
      "Upsillon Care Hospital, Agungi",
      "The Health Arena",
      "Kelina Hospital",
      "Cerba Lancet Nigeria, Victoria Island",
    ],
  },
  {
    who: "Ejiro",
    why: "private and mission hospitals on the Mainland",
    centres: [
      "Duchess International Hospital (an existing client: speak to Debo before any approach)",
      "The Eko Hospital",
      "Motayo Hospital",
      "Duro Soleye Hospital",
      "Ave Maria Hospital (Headquarters)",
      "Anna Maria Hospital",
      "Coptic Hospital",
      "Healing Stripes Hospital",
      "United Heart Hospital and Clinics",
      "Best Care Hospital",
      "Faith City Hospital",
      "Outreach Signature Hospitals",
    ],
  },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const splitHtml = SPLIT.map(
  (s) => `<p style="margin:16px 0 6px"><strong>${s.who}</strong>, ${s.centres.length} centres, ${esc(s.why)}:</p>
  <ul style="margin:0;padding-left:20px">${s.centres.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`,
).join("");

const splitText = SPLIT.map((s) => `${s.who}, ${s.centres.length} centres, ${s.why}:\n${s.centres.map((c) => `- ${c}`).join("\n")}`).join("\n\n");

const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937;max-width:640px">
  <p>Esther, Ejiro and Abigail,</p>
  <p>We are opening a new piece of health systems strengthening work, and the three of you will lead the conversations with the hospitals.</p>
  <p><strong>The problem.</strong> Every BNSc nursing graduate must spend twelve months as an intern at an NMCN-approved centre before full registration. The places are far fewer than the graduates. Each hospital runs its own advert and its own exam, and graduates apply one hospital at a time, some for up to two years.</p>
  <p><strong>What we offer.</strong> Graduates apply once and sit one assessment with us. Each centre receives a ranked list of the graduates who chose it, and keeps the interview and the decision. It is free to graduates, and there is no fee to centres for the 2027 intake.</p>
  <p><strong>What we ask each centre for.</strong> Four things: how many places it will take, the minimum score it would interview, a named contact (usually the head of nursing), and a decision within three weeks of receiving its list.</p>
  <p><strong>What is attached.</strong> The deck, to take into meetings, and the one-pager, to send ahead or leave behind. Neither carries a fee table or a client name. Please keep it that way in any edit or email.</p>

  <p style="margin-top:20px"><strong>Your centres</strong></p>
  ${splitHtml}

  <p style="margin-top:20px"><strong>How to run it</strong></p>
  <ul style="padding-left:20px">
    <li>Ask for the head of nursing services first, then the medical director. The nursing side owns the internship and feels the pain of the exam most.</li>
    <li>Graduates may choose any approved centre from the day applications open, whether or not it has joined. When we can, tell a centre how many graduates have already chosen it. That is the strongest thing we can say.</li>
    <li>Do not promise any nurse a place, and do not quote fees beyond "no fee to the centre for the 2027 intake". Anything else about money goes to Debo.</li>
    <li>Name another centre as a participant only once that centre has agreed to be named.</li>
  </ul>

  <p><strong>Where to record it.</strong> Every centre has a row at consultforafrica.com/admin/cadre-internships, with its owner, stage, contact, next action, places and minimum score. The page goes live this week, once Debo approves the release. Until then, keep your notes and enter them on the day it opens.</p>
  <p><strong>Proposed targets</strong> (Debo to confirm): a first conversation with every centre by Friday 20 November, and ten centres committed by Tuesday 15 December, ahead of applications opening in January.</p>
  <p>Questions to Debo, who is copied.</p>
  <p>With best regards,<br/>Consult for Africa</p>
</div>`;

const text = `Esther, Ejiro and Abigail,

We are opening a new piece of health systems strengthening work, and the three of you will lead the conversations with the hospitals.

THE PROBLEM. Every BNSc nursing graduate must spend twelve months as an intern at an NMCN-approved centre before full registration. The places are far fewer than the graduates. Each hospital runs its own advert and its own exam, and graduates apply one hospital at a time, some for up to two years.

WHAT WE OFFER. Graduates apply once and sit one assessment with us. Each centre receives a ranked list of the graduates who chose it, and keeps the interview and the decision. It is free to graduates, and there is no fee to centres for the 2027 intake.

WHAT WE ASK EACH CENTRE FOR. Four things: how many places it will take, the minimum score it would interview, a named contact (usually the head of nursing), and a decision within three weeks of receiving its list.

WHAT IS ATTACHED. The deck, to take into meetings, and the one-pager, to send ahead or leave behind. Neither carries a fee table or a client name. Please keep it that way in any edit or email.

YOUR CENTRES

${splitText}

HOW TO RUN IT
- Ask for the head of nursing services first, then the medical director. The nursing side owns the internship and feels the pain of the exam most.
- Graduates may choose any approved centre from the day applications open, whether or not it has joined. When we can, tell a centre how many graduates have already chosen it. That is the strongest thing we can say.
- Do not promise any nurse a place, and do not quote fees beyond "no fee to the centre for the 2027 intake". Anything else about money goes to Debo.
- Name another centre as a participant only once that centre has agreed to be named.

WHERE TO RECORD IT. Every centre has a row at consultforafrica.com/admin/cadre-internships, with its owner, stage, contact, next action, places and minimum score. The page goes live this week, once Debo approves the release. Until then, keep your notes and enter them on the day it opens.

PROPOSED TARGETS (Debo to confirm): a first conversation with every centre by Friday 20 November, and ten centres committed by Tuesday 15 December, ahead of applications opening in January.

Questions to Debo, who is copied.

With best regards,
Consult for Africa`;

async function main() {
  const apply = process.argv.includes("--apply");
  const total = SPLIT.reduce((n, s) => n + s.centres.length, 0);
  if (total !== 31) throw new Error(`The split covers ${total} centres, not 31.`);
  if (/—/.test(html + text + readFileSync(BUILDER, "utf8"))) throw new Error("Em dash found. House rule: none, anywhere.");

  const builderTime = statSync(BUILDER).mtimeMs;
  const attachments = FILES.map((f) => {
    if (!existsSync(f.path)) throw new Error(`Not found: ${f.path}. Run python3 scripts/build-nurse-internship-pitch.py.`);
    if (statSync(f.path).mtimeMs < builderTime) throw new Error(`${f.name} is older than its builder. Rebuild first.`);
    const buf = readFileSync(f.path);
    console.log(`Attachment: ${f.name} (${Math.round(buf.length / 1024)} KB)`);
    return { name: f.name, content: buf.toString("base64"), mime_type: "application/pdf" };
  });

  console.log(`From:     ${FROM.name} <${FROM.address}>`);
  console.log(`To:       ${TO.map((t) => `${t.name} <${t.address}>`).join(", ")}`);
  console.log(`Cc:       ${CC.map((c) => `${c.name} <${c.address}>`).join(", ")}`);
  console.log(`Subject:  ${SUBJECT}`);
  if (!apply) return console.log("\nDRY RUN. Re-run with --apply to send.");

  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (!key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");

  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: TO.map((t) => ({ email_address: t })),
      cc: CC.map((c) => ({ email_address: c })),
      reply_to: [REPLY_TO],
      subject: SUBJECT,
      htmlbody: html,
      textbody: text,
      attachments,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${body}`);
  console.log(`Sent. ${body}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
