/**
 * The opening film brief to Dr Akinware, as an editable Word attachment.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-film-brief.ts            dry
 *   npx tsx --env-file=.env.local scripts/send-ageless-film-brief.ts --send
 */
import { readFileSync } from "fs";
import { sendTransactionalEmail } from "@/lib/zeptomail";

const send = process.argv.includes("--send");
const FILE = "docs/ageless/AGELESS - The Opening Film, for Review.docx";
const TO = "itunu.akinware@medburyhealthcare.com";
const CC = "dodulana@gmail.com";
const FROM = process.env.SMTP_FROM || "hello@consultforafrica.com";

const body = `
<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.65;color:#1F2937;max-width:560px;">
  <p>Dear Itunu,</p>
  <p>The brief for the opening film is attached in Word so you can mark it up and send it back.</p>
  <p>It takes the argument from the Andrew Steele film you sent and the register from the
     UN Decade of Healthy Ageing one. Steele is where the evening's name comes from, so that
     felt right.</p>
  <p>Two things in it need a decision rather than a view, and both are on the clock:</p>
  <ul>
    <li>Kalkulus were briefed for a half day producing ninety seconds. That brief does not
        produce a ten minute film, so this either goes to them as new work or goes elsewhere.</li>
    <li>The task plan has the film due on the 17th. That is six days for a ten minute piece
        with no script yet. Six or seven minutes would be materially easier to make well.</li>
  </ul>
  <p>Everything else in the brief is a view and is yours to change.</p>
  <p style="margin-bottom:4px;">With kind regards,</p>
  <p style="margin-top:0;font-weight:600;">Consult for Africa</p>
</div>`;

async function main() {
  if (!process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  const content = readFileSync(FILE).toString("base64");
  const attachment = {
    name: "AGELESS - The Opening Film, for Review.docx",
    content,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  const kb = Math.round(Buffer.from(content, "base64").length / 1024);
  console.log(`\nattachment: ${attachment.name} (${kb} KB)`);
  console.log(`to:   ${TO}`);
  console.log(`copy: ${CC}`);
  console.log(`from: ${FROM}\n`);

  if (!send) {
    console.log("DRY RUN. --send to go.\n");
    return;
  }
  for (const to of [TO, CC]) {
    const r = await sendTransactionalEmail({
      from: FROM,
      to,
      subject: "AGELESS: the opening film brief, for your edits",
      html: body,
      attachments: [attachment],
    });
    console.log(r.ok ? `  SENT   ${to}` : `  FAILED ${to}: ${r.error}`);
  }
}

main();
