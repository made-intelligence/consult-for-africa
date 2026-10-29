/**
 * Send Abigail Oladejo her guide to the Haven people workstream: staff
 * realignment, job description reviews, new contracts and objective setting,
 * working alongside Dr Omotanwa Gbadebo. The counterpart of the operations
 * lead brief. The guide is INTERNAL and carries the May 2026 framing rule.
 *
 * Cc Dr Tanwa (her partner on site), Ezinne (her line manager) and Debo.
 * ZeptoMail HTTP API from hello@, because Zoho SMTP is unreachable from here.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-people-guide.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-people-guide.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const TO = { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" };
const CC = ["adebusayogbadebo@gmail.com", "ogeriorji845@gmail.com", "debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: your guide to the people work";

const ATTACHMENTS = [
  { file: "docs/haven-people-lead-guide-cfa.pdf", name: "The-People-Work-at-Haven-Guide-INTERNAL.pdf" },
  { file: "docs/haven-culture-plan-cfa.pdf", name: "Haven-Cultural-Transformation-Plan-INTERNAL.pdf" },
  { file: "docs/haven-organisational-audit-report-cfa.pdf", name: "Haven-Organisational-Audit-Report.pdf" },
];

const TEXT = `Dear Abigail,

Thank you for taking on the people work at Haven with Dr Tanwa. There are four pieces: getting everyone into the right post, reviewing the job descriptions, new contracts for every member of staff, and setting objectives. This is the largest part of the culture work, and I want you to have everything you need for it in one place.

The guide is attached. It is internal, so it does not go to anybody at Haven. Please read section 2 before you speak to any member of staff. It covers what we never raise, how to handle pay questions, and why nobody's job is ours to promise or threaten.

Section 10 has finished examples to copy: a nurse's job description, two sets of department objectives, a contract checklist, a personnel file checklist and the tracker. Use them as your starting point and change whatever does not fit what you find.

Two more documents are attached for reference. The culture plan covers the sprints this work runs alongside. The audit report is what we found in August, and section 19 covers people systems in depth.

The first milestone is the realignment table, which goes to the founders by Friday 6 November. Please ask me before you store any signed document anywhere, and send Dr Tanwa and me a one-page note every Friday.

Call me once you have read it, and mark anything blocked the moment you are unsure.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

async function main() {
  const files = ATTACHMENTS.map((a) => {
    const p = path.resolve(process.cwd(), a.file);
    if (!fs.existsSync(p)) throw new Error(`Attachment missing: ${a.file}`);
    return { ...a, buf: fs.readFileSync(p) };
  });

  console.log(`  To:       ${TO.address}\n  Cc:       ${CC.join(", ")}\n  Subject:  ${SUBJECT}\n  Attached: ${files.map((f) => `${f.name} (${Math.round(f.buf.length / 1024)}kb)`).join(", ")}\n`);
  console.log(TEXT.split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) { console.log("\n  DRY RUN. Re-run with --send.\n"); return; }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: TO }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: TEXT.replace(/\n/g, "<br>"),
      textbody: TEXT,
      attachments: files.map((f) => ({ content: f.buf.toString("base64"), mime_type: "application/pdf", name: f.name })),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
