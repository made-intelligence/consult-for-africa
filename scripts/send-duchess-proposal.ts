/**
 * Send the re-scoped Duchess International Hospital proposal.
 *
 *   To:  Duchess (recipients below)
 *   Cc:  Debo, so there is a copy in a mailbox he reads
 *   Att: the deck and the fee schedule. NOTHING ELSE.
 *
 * Dry run by default. Pass --send to deliver.
 *   npx tsx --env-file=.env.local scripts/send-duchess-proposal.ts
 *   npx tsx --env-file=.env.local scripts/send-duchess-proposal.ts --send
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

const TO = ["bukola.ladipo@duchesshospital.com"];
const CC = ["debo.odulana@consultforafrica.com"];

/** Explicit allowlist. Anything not on it cannot be attached. */
const ATTACH = [
  ["docs/duchess/duchess-pitch-deck-cfa.pdf", "Consult-for-Africa-Duchess-Risk-Management-Proposal.pdf"],
  ["docs/duchess/duchess-fee-schedule-cfa.pdf", "Consult-for-Africa-Duchess-Fee-Schedule.pdf"],
] as const;

const SUBJECT = "Duchess International Hospital: the revised approach and fee schedule";

const TEXT = `Dear Mrs Ladipo,

Thank you for your time this morning. The conversation was genuinely useful to us, because it changed what we think this engagement should be.

Attached are two documents. The first is the revised presentation, and the second is the fee schedule that goes with it.

Three things moved as a result of the meeting, and I want to set them out plainly.

The first is scope. You were clear that the majority of clinical risk management is already in place, and that what the Hospital wants is an enterprise grade framework reaching operational, financial, cultural and reputational risk, with clinical integrated into it rather than rebuilt. We have rewritten the approach around that, and the risk surface we would work across is on slide four.

The second is the fee. It falls from N35,694,000 to N21,060,000, a reduction of forty one per cent. I want to be clear about why, because it is not a discount. Our day rates are unchanged and the term stays at the six months your terms of reference set. What changed is the number of days the work actually needs, once the deep clinical diagnostic, the case level tracing and the patient safety build come out of scope, and once project coordination sits with your own team rather than ours.

The third is the technology. You told us that most of the work is already digitised and that there is room for more, and we proposed an intelligent compliance system built on trained models and agents, doing the checking that nobody has time to do between board meetings. That is on slide thirteen, and we have deliberately kept it outside this fee. The register needs to exist before the system can be shaped around what it actually shows, so we would scope and price that separately once the first phase is through.

If it would help, I would welcome thirty minutes with your Chief Compliance Officer before this goes further, since your terms of reference make them the client for the work.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

const SEND = process.argv.includes("--send");

async function main() {
  const attachments = ATTACH.map(([rel, name]) => {
    if (/PRIVATE|prep|benchmark/i.test(rel)) throw new Error(`REFUSING to attach an internal document: ${rel}`);
    const abs = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(abs)) throw new Error(`Missing ${rel}. Rebuild before sending.`);
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
    console.log("  To send: npx tsx --env-file=.env.local scripts/send-duchess-proposal.ts --send\n");
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
