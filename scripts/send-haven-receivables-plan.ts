/**
 * Send the Working Capital and Receivables Recovery Plan to the Haven board.
 *
 * This is the second of the two deliverables promised from workstream 1. It was
 * due 6 August. The covering note does not pretend otherwise, and neither does
 * the document: the receivables ageing and claims schedules were marked
 * critical in our information request and were never supplied, which the audit
 * itself records.
 *
 * Five individual emails, one per founder. Never a group To or Cc: Debo's rule,
 * and on a board where the owners' relationships are live it also means nobody
 * is reading the room through a header. Usman is deliberately not copied on
 * board sends.
 *
 * ZeptoMail HTTP API only. Dry run unless --send.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-receivables-plan.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-receivables-plan.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: the working capital and receivables plan";
const PDF = path.resolve(process.cwd(), "docs/haven-receivables-recovery-plan-cfa.pdf");

const BOARD = [
  { name: "Kabir Aregbesola", greeting: "Kabir", email: "kabir@aurorahills.co" },
  { name: "Mrs Abisodun Alli", greeting: "Mrs Alli", email: "abisodunalli@yahoo.com" },
  { name: "Dr Shakirah Saliu", greeting: "Dr Saliu", email: "shakirahsaliu@gmail.com" },
  { name: "Dr Odedina", greeting: "Dr Odedina", email: "gbajoodedina@gmail.com" },
  { name: "Mr Ogochukwu Odum", greeting: "Mr Odum", email: "odumogo@gmail.com" },
];

function body(greeting: string) {
  return `Dear ${greeting},

Attached is the Working Capital and Receivables Recovery Plan, the second of the two deliverables from the diagnostic audit.

It is late, and the document opens by saying why rather than letting it pass. We asked for the receivables ageing by payer and for claims submitted, paid, rejected and outstanding by payer. Both were marked critical in our information request and neither was supplied, which the audit report records. A recovery plan built on figures we had not seen would have been worth nothing to you.

What the audit could establish turns out to carry most of the work. Two payers account for 72.1 per cent of insured revenue, so this is two relationships handled properly rather than a collections campaign, and those relationships are worth protecting as much as collecting from. Two lines in the ageing schedule totalling N399,253 are not payers at all, one of them a patient name, so any figure quoted today is wrong before anybody starts. And nothing anywhere records why a claim was refused, which means no one at Haven can currently say whether claims fail for authorisation, documentation, tariff or timing.

That last one is the smallest change in the document and the most valuable. It is a field, not a system, and it is what stops this recurring.

The first fortnight set out in section 6 needs none of the missing data. It can begin the day you read this. What we need from you is in section 7, and only one item is urgent: a single named owner on your side, which on the evidence is your Head of Finance.

The money here is money Haven has already earned, for care already given, with staff already paid. It needs no additional patients.

I am a call away on any of it.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  if (!fs.existsSync(PDF)) throw new Error(`Not found: ${PDF}. Run scripts/build-haven-receivables-plan.py first.`);
  const buf = fs.readFileSync(PDF);

  console.log(`
  Recipients: ${BOARD.length}, one email each
  Cc:         ${CC.join(", ")}
  Subject:    ${SUBJECT}
  Attached:   Haven-Working-Capital-and-Receivables-Plan.pdf (${Math.round(buf.length / 1024)}kb)
`);
  for (const b of BOARD) console.log(`    ${b.name.padEnd(22)} ${b.email}`);
  console.log(`\n  Sample (${BOARD[0].greeting}):\n`);
  console.log(body(BOARD[0].greeting).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) {
    console.log("\n  DRY RUN. Nothing sent. Re-run with --send.\n");
    return;
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const attachments = [{
    content: buf.toString("base64"),
    mime_type: "application/pdf",
    name: "Haven-Working-Capital-and-Receivables-Plan.pdf",
  }];

  let sent = 0, failed = 0;
  for (const b of BOARD) {
    const text = body(b.greeting);
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: b.email, name: b.name } }],
        cc: CC.map((address) => ({ email_address: { address } })),
        reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
        subject: SUBJECT,
        htmlbody: text.replace(/\n/g, "<br>"),
        textbody: text,
        attachments,
      }),
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) { failed++; console.error(`  FAILED ${b.email}: ${res.status} ${JSON.stringify(data)}`); }
    else { sent++; console.log(`  sent ${b.email} request=${data?.request_id ?? "?"}`); }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\n  ${sent} sent, ${failed} failed, of ${BOARD.length}.`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
