/**
 * Chase invoice CFA-HAV-2026-002 (instalment 1 of 3, N2,500,000).
 *
 * The board had the reissue on 17 September. This is the follow-up, to Kabir
 * alone so it reads as a nudge rather than a second board-wide notice.
 *
 *   To:  kabir@aurorahills.co
 *   Cc:  usman.g@aurorahills.co, debo.odulana@consultforafrica.com
 *   Att: docs/haven-invoice-instalment-1-reissued-cfa.pdf
 *
 * ZeptoMail HTTP API only. Zoho SMTP is unreachable from here and throttles.
 * Dry run by default; pass --send to deliver.
 *
 * Run:  npx tsx --env-file=.env.local scripts/send-haven-instalment-reminder.ts --send
 */
import fs from "fs";
import path from "path";

for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const TO = ["kabir@aurorahills.co"];
// Usman for the client's records; Debo because ZeptoMail is an API send and
// nothing lands in the hello@ Sent folder.
const CC = ["usman.g@aurorahills.co", "debo.odulana@consultforafrica.com"];
// --copy sends the identical message to Debo alone, without touching the client.
const COPY_ONLY = ["debo.odulana@consultforafrica.com", "dodulana@gmail.com"];
const PDF = path.resolve(process.cwd(), "docs/haven-invoice-instalment-1-reissued-cfa.pdf");

const SUBJECT = "A short note on invoice CFA-HAV-2026-002";

const TEXT = `Dear Kabir,

A short note on invoice CFA-HAV-2026-002, the first monthly instalment of N2,500,000, which I reissued to the board on 17 September. I do not believe it has reached us yet, so it is attached again here.

Where things stand: the agreed fee is N9,300,000, of which N1,800,000 is paid and N7,500,000 remains. The audit, the survey work and the growth strategy are delivered and with you. Instalment 2 falls due on 21 October, and I would rather the two did not land on you together, which is why I am following up now rather than later.

The payment details are on the invoice: Zenith Bank, account 1312352157, Consult for Africa Management Services Limited, with CFA-HAV-2026-002 as the reference.

If the timing is difficult, tell me what works on your side and we will shape the balance around it. I am a call away.

Warm regards,
Debo

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

const SEND = process.argv.includes("--send");
const COPY = process.argv.includes("--copy");

async function main() {
  if (!fs.existsSync(PDF)) throw new Error(`Invoice not found at ${PDF} - run build-haven-invoice-instalment-reissue.py first.`);

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Run with: npx tsx --env-file=.env.local scripts/send-haven-instalment-reminder.ts --send");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const replyTo = process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com";

  const pdf = fs.readFileSync(PDF);
  const attachment = {
    content: pdf.toString("base64"),
    mime_type: "application/pdf",
    name: "Consult-for-Africa-Invoice-CFA-HAV-2026-002.pdf",
  };

  const to = COPY ? COPY_ONLY : TO;
  const cc = COPY ? [] : CC;

  console.log(`
  From:    ${from.name} <${from.address}>
  To:      ${to.join(", ")}
  Cc:      ${cc.join(", ") || "(none)"}
  Subject: ${SUBJECT}${COPY ? "\n  Mode:    RECORD COPY, client not contacted" : ""}
  Attach:  ${attachment.name} (${Math.round(pdf.length / 1024)}KB)`);

  if (!SEND) {
    console.log("\n  DRY RUN, not sent. Validated and encoded OK.");
    console.log("  To send: npx tsx --env-file=.env.local scripts/send-haven-instalment-reminder.ts --send");
    return;
  }

  const body = {
    from,
    to: to.map((address) => ({ email_address: { address } })),
    ...(cc.length && { cc: cc.map((address) => ({ email_address: { address } })) }),
    reply_to: [{ address: replyTo }],
    subject: SUBJECT,
    htmlbody: TEXT.replace(/\n/g, "<br>"),
    textbody: TEXT,
    attachments: [attachment],
  };

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.details?.[0]?.message ?? data?.error?.message ?? data?.message ?? `HTTP ${res.status}`;
    throw new Error(`send failed: ${msg}`);
  }
  console.log(`\n  Sent. requestId: ${data?.request_id}  messageId: ${data?.data?.[0]?.message_id}`);
}

main().catch((e) => {
  console.error("SEND FAILED:", e?.message ?? e);
  process.exitCode = 1;
});
