/**
 * Dennis Ashley: send the draft Memorandum of Understanding to Dr Oti.
 *
 * Same thread and sender as send-dennis-ashley-link.ts: Dr Oti to, the
 * 21 August "Connecting via email" group cc. Override with --to= and --cc=.
 *
 *   npx tsx --env-file=.env.local scripts/send-dennis-ashley-mou.ts           dry run
 *   ... --test    send to Debo only (dodulana@gmail.com), no cc
 *   ... --send    send to Dr Oti and the cc group
 *
 * The PDF is built by Mezo_v2/pitch/build_dennis_ashley_mou.py.
 * Sent via Consult for Africa (ZeptoMail, SMTP_FROM is the sender of record).
 */
import fs from "fs";
import os from "os";
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

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3).trim();
const TEST = process.argv.includes("--test");
const SEND = process.argv.includes("--send");
if (TEST && SEND) throw new Error("Pass --test or --send, not both.");

// From the 21 August 2026 introduction thread, "Connecting via email".
const DEFAULT_TO = ["chima.oti@dennisashley.com"];
const DEFAULT_CC = [
  "mamsallah.omisore@dennisashley.com",
  "oge.ilegbune@dennisashley.com",
  "obi.igbokwe@dennisashley.com",
  "ikunna.onwuanibe@dennisashley.com",
];
const list = (v: string | undefined, fallback: string[]) =>
  v === undefined ? fallback : v.split(",").map((s) => s.trim()).filter(Boolean);
const TO = TEST ? ["dodulana@gmail.com"] : list(arg("to"), DEFAULT_TO);
const CC = TEST ? [] : list(arg("cc"), DEFAULT_CC);

const LINK = "https://www.consultforafrica.com/DennisAshleyProject";
const PDF = path.join(os.homedir(), "Downloads/Mezo_v2/pitch/Mezo_DennisAshley_MOU_Draft.pdf");
const ATTACH_NAME = "Dennis Ashley Wellness Centre - Draft Memorandum of Understanding.pdf";

const SUBJECT = "Dennis Ashley: draft Memorandum of Understanding";

const TEXT = `Dear Dr Oti,

Attached is a draft Memorandum of Understanding setting out how Consult for Africa, through the Mezo Health platform, would manage Dennis Ashley. It is a draft for discussion, and I would rather we shape it together than have it land as a finished document.

The substance sits in three places.

The fee. We are paid 7.5% of collected revenue above the clinic's own average month before we arrive. If revenue does not grow, there is no fee. Your past twelve months set that average, and it is then fixed.

The term. Three years at a minimum, extending to eight. If the core measures are missed, there is a remediation route first and then an exit for you.

Control. Ownership, the brand, the premises and clinical governance stay with your board. We run the clinic day to day, inside a list of decisions that remain the board's alone.

Schedule 2 lists the measures we would report against: revenue and collections, endoscopy and room utilisation, response times, patient experience, endoscopy quality standards and compliance. Five of them carry consequences; the rest are how we would run the place in the open.

Items in square brackets are either yours to fill (the company's registered name, RC number and registered office) or ours to agree together (the baseline and a few spending limits). The baseline is built from twelve months of revenue records, which can go straight into the secure folder here, under the mutual NDA:
${LINK}

Could we find an hour in the next fortnight to walk through it with you and anyone from the board you would like in the room?

With thanks,

Dr Debo Odulana
Founding Partner and Managing Director, Mezo, a Consult For Africa vehicle
debo.odulana@consultforafrica.com  ·  +234 913 813 8553`;

function html(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(new RegExp(LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `<a href="${LINK}">${LINK}</a>`)
    .replace(/\n/g, "<br>");
}

async function main() {
  if (!fs.existsSync(PDF)) throw new Error(`Attachment missing: ${PDF}`);
  const attachments = [{
    name: ATTACH_NAME,
    content: fs.readFileSync(PDF).toString("base64"),
    mime_type: "application/pdf",
  }];

  // ZeptoMail only. Zoho SMTP throttles and is not a fallback.
  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM;
  if (!fromRaw) throw new Error("SMTP_FROM not set. It is the sender of record, so it is not defaulted here.");
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  console.log(`
  Mode:     ${SEND ? "SEND" : TEST ? "TEST (Debo only)" : "dry run"}
  From:     ${from.name ?? ""} <${from.address}>
  To:       ${TO.join(", ")}
  Cc:       ${CC.length ? CC.join(", ") : "(none)"}
  Subject:  ${TEST ? "[TEST] " : ""}${SUBJECT}
  Attach:   ${ATTACH_NAME}  (${(fs.statSync(PDF).size / 1024).toFixed(0)} KB)
`);

  if (!SEND && !TEST) {
    console.log("  DRY RUN. Nothing sent.\n");
    console.log(TEXT.split("\n").map((l) => `  | ${l}`).join("\n"));
    return;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((address) => ({ email_address: { address } })),
      ...(CC.length ? { cc: CC.map((address) => ({ email_address: { address } })) } : {}),
      reply_to: [{ address: "debo.odulana@consultforafrica.com", name: "Dr Debo Odulana" }],
      subject: TEST ? `[TEST] ${SUBJECT}` : SUBJECT,
      htmlbody: html(TEXT),
      textbody: TEXT,
      attachments,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
  const log = path.join(os.homedir(), ".mezo-sends/dennis-ashley-mou.log");
  fs.mkdirSync(path.dirname(log), { recursive: true });
  fs.appendFileSync(log, `${new Date().toISOString()} ${SEND ? "SEND" : "TEST"} to=${TO.join(",")} cc=${CC.join(",")} ${data?.request_id ?? ""}\n`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
