/**
 * Ask Abigail and Ben Ijehon (Haven, Head of Admin) to confirm the two things
 * blocking staff sign-in: whether Toyin and Eniola are still at Haven, and the
 * address five people actually use. Cc Dr Tanwa and Debo.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-signin-check-2026-10-24.ts --send
 */
const SEND = process.argv.includes("--send");
const TO = [
  { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" },
  { address: "ben@havenpractice.com", name: "Benedict Ijehon" },
];
const CC = ["adebusayogbadebo@gmail.com", "debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven staff page: who is not getting a sign-in code";

const TEXT = `Dear Ben and Abigail,

A few people at Haven are not getting their code for the staff page. We have checked the records and need your help with two things.

1. Toyin Asagidingbi and Eniola Akinnuoye

Both accounts were switched off on 21 October. Are they still working at Haven? If they are, we will switch them back on.

2. The email address each person uses

The page only sends a code to the exact address we hold. These five have never received one, which usually means they are typing a different address. Please could you check with each of them which address they use:

  Dumebi Arinze          arinzedumebi40@gmail.com
  Boluwatife Oyedele     boluwatifeadeola44@gmail.com
  Chioma Agomuo          chiomaagomuo18@gmail.com
  Moshood Saliu          moshoodsaliu0@gmail.com
  Linda Nwabuisi         mlslindahaven@gmail.com

If the address above is right, it may be that they have not tried yet, and a quick reminder is enough. If it is wrong, just reply with the correct one and we will update it the same day.

Anita Musa's address has already been corrected to osedebamhenanita76@gmail.com, so she can try again now.

Thank you both,

Sent on behalf of Dr Debo Odulana
Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553`;

async function main() {
  console.log(`  To: ${TO.map((t) => t.address).join(", ")}\n  Cc: ${CC.join(", ")}\n  Subject: ${SUBJECT}\n`);
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
      to: TO.map((t) => ({ email_address: t })),
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: `<pre style="font-family:Helvetica,Arial,sans-serif;font-size:15px;white-space:pre-wrap">${TEXT}</pre>`,
      textbody: TEXT,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. request=${data?.request_id ?? "?"}`);
}
main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
