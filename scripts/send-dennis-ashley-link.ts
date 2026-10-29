/**
 * Send Dr Oti the private link to the Dennis Ashley diagnostic audit page.
 *
 * Follow-up to MZ-ENG-DAMC-2026-DR of 22 September. Link only, no attachments:
 * the letter already carries the request, what was missing was somewhere to put it.
 *
 * The recipient is not hardcoded, because we do not have it on file. Pass it:
 *   npx tsx --env-file=.env.local scripts/send-dennis-ashley-link.ts --to=<address>
 *   npx tsx --env-file=.env.local scripts/send-dennis-ashley-link.ts --to=<address> --send
 *
 * Dry run by default. Nothing leaves without --send.
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

const toArg = process.argv.find((a) => a.startsWith("--to="))?.slice(5).trim();
const TO = (toArg ?? process.env.DA_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const CC = ["debo.odulana@consultforafrica.com"];

const LINK = "https://www.consultforafrica.com/DennisAshleyProject";

const SUBJECT = "Dennis Ashley: the secure link, ready when you are";

const TEXT = `Dear Dr Oti,

I wrote on 22 September with the information we would review ahead of the diagnostic audit, and said we would send a secure link once you confirmed a week. On reflection that was the wrong way round. You should not have to reply in order to get the link, so here it is.

${LINK}

The page is private to Dennis Ashley and is not listed anywhere. It holds three things.

The first is the nine items that matter most, pulled out of the longer list, so that if the week runs away your Administrator knows exactly what to send first and can let the rest follow.

The second is somewhere to put them. You upload straight from the page, as many times as you like. There is no shared folder to set up and no need to wait until you have everything.

The third is four short surveys: your staff, your patients, the colleagues who refer in, and the board. This is the part I would start with today, because it needs no paperwork at all. The staff and patient surveys are anonymous and the answers come to us rather than to anyone at the clinic. The one for referring colleagues is worth forwarding widely. What your referrers say about the endoscopy list is usually the most useful thing we read all engagement.

Nothing on the page asks for patient-identifiable data. Everything shared through it is confidential to us, used only for the audit, and returned or destroyed if we do not proceed. If you would like the mutual NDA in place before anything is uploaded, say the word and it will be with you the same day. I did not want it to be the reason nothing moves.

The audit remains at our cost and without obligation. What I am asking for today is one thing: a week in October that suits you and the Administrator, so we can put the on-site days around your clinic schedule rather than across it. If an endoscopy list is running that week, tell me which day and we will come for it.

Warm regards,

Dr Debo Odulana
Founding Partner and Managing Director, Mezo, a Consult For Africa vehicle
debo.odulana@consultforafrica.com  ·  +234 913 813 8553  ·  mezohealth.com`;

const SEND = process.argv.includes("--send");

function html(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(new RegExp(LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `<a href="${LINK}">${LINK}</a>`)
    .replace(/\n/g, "<br>");
}

async function main() {
  if (TO.length === 0) {
    throw new Error("No recipient. Pass --to=<address> or set DA_TO. We have no address for Dr Oti on file.");
  }

  // ZeptoMail only. Zoho SMTP throttles and is not a fallback.
  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM;
  if (!fromRaw) throw new Error("SMTP_FROM not set. It is the sender of record, so it is not defaulted here.");
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  console.log(`
  From:    ${from.name ?? ""} <${from.address}>
  To:      ${TO.join(", ")}
  Cc:      ${CC.join(", ")}
  Subject: ${SUBJECT}
  Link:    ${LINK}
  Attach:  none
`);

  if (!SEND) {
    console.log("  DRY RUN. Nothing sent. Composed and validated OK.");
    console.log(`  To send: npx tsx --env-file=.env.local scripts/send-dennis-ashley-link.ts --to=${TO[0]} --send\n`);
    return;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((address) => ({ email_address: { address } })),
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: "debo.odulana@consultforafrica.com", name: "Dr Debo Odulana" }],
      subject: SUBJECT,
      htmlbody: html(TEXT),
      textbody: TEXT,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
