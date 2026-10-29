/**
 * Send the Ethereal Healthcare Centre management engagement proposal.
 *
 *   To:  Cassy Alfred, HR, Invealth Partners (the route to management and board)
 *   Cc:  Debo, so there is a copy in a mailbox he reads
 *   Att: the engagement proposal. Add the deck or the data request only by flag.
 *
 * Dry run by default. Pass --send to deliver.
 *   npx tsx --env-file=.env.local scripts/send-ethereal-proposal.ts
 *   npx tsx --env-file=.env.local scripts/send-ethereal-proposal.ts --deck
 *   npx tsx --env-file=.env.local scripts/send-ethereal-proposal.ts --send
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

const TO = ["hrsupport@invealthpartners.com"];
const CC = ["debo.odulana@consultforafrica.com"];

/** The pitch pack lives in the Mezo repo, not this one. */
const PITCH = "/Users/debo/Downloads/Mezo_v2/pitch";

/** Explicit allowlist. Anything not on it cannot be attached. */
const ATTACH: Array<readonly [string, string]> = [
  [`${PITCH}/Mezo_Ethereal_Proposal.pdf`, "Mezo-Ethereal-Management-Engagement-Proposal.pdf"],
  [`${PITCH}/Mezo_Ethereal_Deck.pdf`, "Mezo-Ethereal-Presentation.pdf"],
];
if (process.argv.includes("--data-request")) {
  ATTACH.push([`${PITCH}/Mezo_Ethereal_Data_Request.pdf`, "Mezo-Ethereal-Diagnostic-Audit-Information-Request.pdf"]);
}

const SUBJECT = "Ethereal Healthcare Centre: management engagement proposal";

const TEXT = `Dear Cassy,

Following our visit to Ethereal Healthcare Centre, attached is the management engagement proposal we were asked to prepare, together with the presentation that goes with it.

It answers the question put to us directly. You asked whether Mezo would manage the hospital, or place a hospital administrator to run it. The document answers the first in full and folds the second into it: under management, the administrator and the management team are part of what we bring.

Two things are worth knowing before the board reads it.

Ethereal remains one hundred per cent yours. Ownership, brand, premises and clinical governance are unchanged. Mezo takes on the day to day operations, runs the hospital on our operating platform to targets your board agrees, and reports weekly against the numbers.

And nothing in it is fixed on our assumptions. Every target and every number is settled against the hospital's own figures in a Diagnostic Audit, which we carry out at our cost over two to three weeks, before any agreement is signed. Our fee is 7.5% of collected revenue plus 3% of EBITDA, so we are paid as the cash arrives and as the profit improves, never ahead of either.

Could you pass this to management and the board, and tell me who we should be speaking to next. I am glad to take them through it in thirty minutes, in Abuja or on a call, at whatever time suits them.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

const SEND = process.argv.includes("--send");

async function main() {
  const attachments = ATTACH.map(([abs, name]) => {
    if (/PRIVATE|prep|internal|benchmark/i.test(abs)) throw new Error(`REFUSING to attach an internal document: ${abs}`);
    if (!fs.existsSync(abs)) throw new Error(`Missing ${abs}. Rebuild before sending.`);
    const buf = fs.readFileSync(abs);
    return { content: buf.toString("base64"), mime_type: "application/pdf", name, _kb: Math.round(buf.length / 1024) };
  });

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  console.log(`
  From:    ${from.name ?? ""} <${from.address}>
  To:      ${TO.join(", ")}
  Cc:      ${CC.join(", ")}
  Subject: ${SUBJECT}
  Attach:  ${attachments.map((a) => `${a.name} (${a._kb}KB)`).join("\n           ")}
`);

  if (!SEND) {
    console.log("  DRY RUN. Nothing sent. Encoded and validated OK.");
    console.log("  To send: npx tsx --env-file=.env.local scripts/send-ethereal-proposal.ts --send\n");
    return;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((address) => ({ email_address: { address } })),
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: TEXT.replace(/\n/g, "<br>"),
      textbody: TEXT,
      attachments: attachments.map(({ _kb, ...a }) => a),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
