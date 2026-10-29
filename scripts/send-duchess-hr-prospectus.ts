/**
 * Send the HR and workforce prospectus to Duchess.
 *
 *   To:  Mrs Bukola Ladipo
 *   Cc:  Debo
 *   Att: the HR prospectus. NOTHING ELSE.
 *
 * Dry run by default. Pass --send to deliver.
 *   npx tsx --env-file=.env.local scripts/send-duchess-hr-prospectus.ts --send
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

/** Explicit allowlist. Internal documents cannot be attached. */
const ATTACH = [
  ["docs/duchess/cfa-hr-services-duchess.pdf", "Consult-for-Africa-HR-and-Workforce-Prospectus.pdf"],
] as const;

const SUBJECT = "The HR and workforce prospectus, and a place on the assessment";

const TEXT = `Dear Mrs Ladipo,

Following on from this morning, here is the prospectus I promised on the HR side.

It sets out the six things we do on people and workforce, what each one is, how it runs and what it costs, so that you can see the whole practice rather than only the part that happens to be relevant today. Our view of why hiring in this market is hard sits near the front, and our thesis on culture sits after it, because that thesis is the reason the six services are the ones we offer rather than a longer list.

Three things in it are worth your attention in particular.

The first is salary benchmarking, which we spoke about. We build the bands from three sources rather than one: what professionals report on our own workforce platform, the public sector scales that anchor the floor for much of the clinical workforce, and what roles have actually closed at on our own searches, which is usually some distance from what they were advertised at. The bands are loaded with employer on costs, because a post that looks affordable on gross rarely is.

The second is the staff app on slide twelve. Payslips, recognition against your own stated values, a weekly anonymous pulse and a structured induction, in one thing your people carry. The pulse deliberately holds no staff identifier at all, because that is the only condition under which anyone answers it honestly.

The third is the assessment. I would like you to take it yourself, at no charge. It runs to about twenty minutes, the report is yours to keep, and it is the quickest way for you to judge whether it is something you would put in front of your consultants and unit managers. Reply to this and I will set up your place, along with anyone else on your team you would like included.

The practice is led by Oludayo Olugbamigbe, whose profile is on slide thirteen, and I hold partner oversight.

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
    console.log("  DRY RUN. Nothing sent. Encoded and validated OK.\n");
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
