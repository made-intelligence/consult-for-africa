/**
 * The MC pack to Olive Emodi, the AGELESS Master of Ceremonies, as a PDF.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-mc-pack.ts            # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-mc-pack.ts --send
 */
import { readFileSync } from "fs";

const send = process.argv.includes("--send");
const TO = "olive.emodi1@gmail.com";
const CC = "dodulana@gmail.com";
const FILE = "docs/ageless/AGELESS - MC Pack, Olive Emodi.pdf";

const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear Olive,</p>
<p>Here is the updated MC pack for tonight. One change: Dr Itunu Akinware, Group Chief Executive of Medbury Healthcare Group, will give the vote of thanks at 8:15pm, not an opening speech. Please introduce her after thanking the speakers, then close the programme and announce After Hours at 8:20pm. The words for both are in the pack.</p>
<p>Everything else is as before: Capital Club, 6 Elsie Femi Pearse Street, Victoria Island. Please arrive by 5:30pm for a sound check; the programme starts at 6:30pm.</p>
<p>Any questions, just reply here.</p>
<p>Warm regards,<br>Debo</p>
</div>`;
const text = `Dear Olive,

Here is the updated MC pack for tonight. One change: Dr Itunu Akinware, Group Chief Executive of Medbury Healthcare Group, will give the vote of thanks at 8:15pm, not an opening speech. Please introduce her after thanking the speakers, then close the programme and announce After Hours at 8:20pm. The words for both are in the pack.

Everything else is as before: Capital Club, 6 Elsie Femi Pearse Street, Victoria Island. Please arrive by 5:30pm for a sound check; the programme starts at 6:30pm.

Any questions, just reply here.

Warm regards,
Debo`;

function parseFrom(raw: string) {
  const m = raw.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), address: m[2].trim() } : { name: "Consult for Africa", address: raw.trim() };
}

async function main() {
  const pdf = readFileSync(FILE).toString("base64");
  if (!send) {
    console.log(`DRY RUN. To ${TO}, cc ${CC}, attaching ${FILE}. --send to go.`);
    return;
  }
  const key = process.env.ZEPTOMAIL_API_KEY?.replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (!key) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: parseFrom(process.env.SMTP_FROM || "hello@consultforafrica.com"),
      to: [{ email_address: { address: TO, name: "Olive Emodi" } }],
      cc: [{ email_address: { address: CC, name: "Debo Odulana" } }],
      reply_to: [{ address: CC, name: "Debo Odulana" }],
      subject: "AGELESS tonight: updated MC pack",
      htmlbody: html,
      textbody: text,
      attachments: [{ content: pdf, mime_type: "application/pdf", name: "AGELESS - MC Pack, Olive Emodi.pdf" }],
    }),
  });
  const data = (await res.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
  console.log(res.ok ? `SENT to ${TO}, cc ${CC}` : `FAILED ${res.status} ${data?.error?.message ?? data?.message ?? ""}`);
}

main();
