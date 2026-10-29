/**
 * Get the Haven town hall deck to Abigail, now. Debo asked for it inside five
 * minutes while he is on his way in.
 *
 * Internal send, to the Administrative Assistant in the Office of the Founding
 * Partner, cc Ezinne as her line manager. The deck is the staff-facing version
 * and is safe to hand around internally; Debo's own speaking notes are NOT
 * attached, because those carry the sensitivities briefing.
 *
 *   npx tsx --env-file=.env.local scripts/send-abigail-haven-townhall.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const TO = { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" };
const CC = ["ogeriorji845@gmail.com", "debo.odulana@consultforafrica.com"];
const PDF = path.resolve(process.cwd(), "docs/haven-town-hall-deck-cfa.pdf");
const SUBJECT = "REPLACES EARLIER: Haven town hall deck, updated version";

const TEXT = `Abigail,

Please use this version and delete the one I sent you earlier. The cover has been changed and the earlier file is now out of date.

Everything else is the same: ten slides, landscape, print and projector ready. Dr Debo is presenting it at the Haven staff town hall.

If you have already loaded the earlier file onto a screen or sent it on to anyone, please swap it for this one.

Same as before: this is the version for the whole hospital staff, so it can be shown to anybody in the room, but please do not circulate it beyond Haven and Consult for Africa until Dr Debo says so.

Thank you,

Sent on behalf of Dr Debo Odulana
Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553`;

async function main() {
  if (!fs.existsSync(PDF)) throw new Error(`Deck not found at ${PDF}. Run scripts/build-haven-town-hall-deck.py first.`);
  const buf = fs.readFileSync(PDF);

  console.log(`  To:       ${TO.address}\n  Cc:       ${CC.join(", ")}\n  Subject:  ${SUBJECT}\n  Attached: Haven-Town-Hall.pdf (${Math.round(buf.length / 1024)}kb)\n`);
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
      attachments: [{ content: buf.toString("base64"), mime_type: "application/pdf", name: "Haven-Town-Hall.pdf" }],
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
