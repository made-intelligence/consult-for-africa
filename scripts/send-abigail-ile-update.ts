/**
 * The ilé update to Abigail: the one-page overview and the seven-page summary.
 *
 * Internal send to the Administrative Assistant, cc Ezinne as her line manager
 * and Debo. Both PDFs are confidential, so the note says not to forward them.
 *
 *   npx tsx --env-file=.env.local scripts/send-abigail-ile-update.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const TO = { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" };
const CC = ["ogeriorji845@gmail.com", "debo.odulana@consultforafrica.com"];
const FILES = [
  { file: "docs/Ile - Investor Summary, One Page.pdf", name: "Ile-Overview-One-Page.pdf" },
  { file: "docs/Ile - Investor Summary, Seven Pages (Deck).pdf", name: "Ile-Summary-Seven-Pages.pdf" },
];
const SUBJECT = "Ilé update: overview and summary";

const TEXT = `Abigail,

Attached are the two current documents on Ilé, the care venture Dr Debo is building.

1. Overview, one page. Read this first.
2. Summary, seven pages. The same story in more detail.

In short: Ilé is care for the last years of life in Lagos, built for families abroad, from care at home through to residential and palliative care.

Both documents are confidential. Please keep them on file and do not forward them outside Consult for Africa.

Thank you,

Sent on behalf of Dr Debo Odulana
Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553`;

async function main() {
  const atts = FILES.map(({ file, name }) => {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
    return { name, buf: fs.readFileSync(p) };
  });

  console.log(`  To:       ${TO.address}\n  Cc:       ${CC.join(", ")}\n  Subject:  ${SUBJECT}`);
  for (const a of atts) console.log(`  Attached: ${a.name} (${Math.round(a.buf.length / 1024)}kb)`);
  console.log("\n" + TEXT.split("\n").map((l) => `  | ${l}`).join("\n"));

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
      attachments: atts.map((a) => ({ content: a.buf.toString("base64"), mime_type: "application/pdf", name: a.name })),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
