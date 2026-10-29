/**
 * Reissue invoice CFA-HAV-2026-002 (instalment 1 of 3, N2,500,000) to the full
 * Haven board, addressed to Kabir, and notify them of the rebased dates for
 * instalments 2 and 3.
 *
 *   To:  the five founders (Kabir first)
 *   Cc:  usman.g@aurorahills.co
 *   Att: docs/haven-invoice-instalment-1-reissued-cfa.pdf
 *
 * Sends via the ZeptoMail HTTP API (Zoho SMTP is unreachable from here).
 * Dry run by default; pass --send to actually deliver.
 *
 * Run:  npx tsx --env-file=.env.local scripts/send-haven-invoice-reissue.ts --send
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

const FOUNDERS = [
  "kabir@aurorahills.co",
  "abisodunalli@yahoo.com",
  "shakirahsaliu@gmail.com",
  "gbajoodedina@gmail.com",
  "odumogo@gmail.com",
];
// Usman for the client's records; Debo on every client send so there is a copy
// in a mailbox he actually reads (ZeptoMail is an API send, so nothing lands in
// the hello@ Sent folder).
const CC = ["usman.g@aurorahills.co", "debo.odulana@consultforafrica.com"];
// --copy sends the identical message to Debo alone, without re-sending to the board.
const COPY_ONLY = ["debo.odulana@consultforafrica.com", "dodulana@gmail.com"];
const PDF = path.resolve(process.cwd(), "docs/haven-invoice-instalment-1-reissued-cfa.pdf");

const SUBJECT = "Invoice CFA-HAV-2026-002 reissued, and revised dates for the remaining instalments";

const TEXT = `Dear Kabir,

Reattaching invoice CFA-HAV-2026-002, the first monthly instalment of the Haven engagement, N2,500,000. It was issued on 6 September and I do not believe it has reached us yet, so I am sending it again with the schedule brought up to date. This is the same invoice, not an additional charge.

The agreed fee is unchanged at N9,300,000, of which N1,800,000 is paid. What has changed is the timing of the two instalments that follow, so that they fall a month apart from this one rather than on top of it:

Instalment 1 of 3, N2,500,000, due on receipt (originally 25 August)
Instalment 2 of 3, N2,500,000, 21 October 2026 (originally 23 September)
Instalment 3 of 3, N2,500,000, 18 November 2026 (originally 22 October)

Bank details and the payment reference are set out on the invoice: Zenith Bank, account 1312352157, Consult for Africa Management Services Limited, reference CFA-HAV-2026-002.

I am copying the full board so that everyone has sight of where the engagement stands, and Usman for his records. The audit, the survey work and the growth strategy are delivered and with you; the work continues on that basis.

If a different split of the remaining balance would sit better on your side, say the word and we will shape it around your cash flow.

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
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Run with: npx tsx --env-file=.env.local scripts/send-haven-invoice-reissue.ts --send");
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

  const to = COPY ? COPY_ONLY : FOUNDERS;
  const cc = COPY ? [] : CC;

  console.log(`
  From:    ${from.name} <${from.address}>
  To:      ${to.join(", ")}
  Cc:      ${cc.join(", ") || "(none)"}
  Subject: ${SUBJECT}${COPY ? "\n  Mode:    RECORD COPY, board not re-sent" : ""}
  Attach:  ${attachment.name} (${Math.round(pdf.length / 1024)}KB)`);

  if (!SEND) {
    console.log("\n  DRY RUN, not sent. Validated and encoded OK.");
    console.log("  To send: npx tsx --env-file=.env.local scripts/send-haven-invoice-reissue.ts --send");
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
