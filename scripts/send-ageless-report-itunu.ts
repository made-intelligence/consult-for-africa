/**
 * The AGELESS post-event report to Dr Akinware, as a PDF.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-report-itunu.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-report-itunu.ts --send
 */
import { readFileSync } from "fs";
import { notifyInternal } from "@/lib/email";

const send = process.argv.includes("--send");
const TO = "itunu.akinware@medburyhealthcare.com";
const CC = "dodulana@gmail.com";
const FILE = "docs/ageless/AGELESS - Post-Event Report.pdf";

const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear Dr Akinware,</p>
<p>Thank you for your support for AGELESS and for giving the vote of thanks on Wednesday.</p>
<p>Please find attached the post-event report. In summary:</p>
<ul>
<li>58 confirmed guests, plus 17 guests they brought; 16 of the 58 are clinicians</li>
<li>Early feedback rates the evening 4 to 5 out of 5</li>
<li>All guests received a thank-you email on 22 October with the films, voucher details, The Lyfe Place waiting list and a feedback form</li>
</ul>
<p>The report sets out three decisions for you on page 3: the voucher terms, what can be said about The Lyfe Place opening date, and whether to hold a second edition.</p>
<p>A full feedback summary will follow on 30 October.</p>
<p>Kind regards,<br>Debo</p>
</div>`;

async function main() {
  if (!send) {
    console.log(`DRY RUN. To ${TO}, cc ${CC}, attaching ${FILE}. --send to go.`);
    return;
  }
  const files = {
    attachments: [{ name: "AGELESS - Post-Event Report.pdf", mimeType: "application/pdf", content: readFileSync(FILE).toString("base64") }],
  };
  await notifyInternal(TO, "AGELESS: post-event report", html, files);
  await notifyInternal(CC, "AGELESS: post-event report (copy of email to Dr Akinware)", html, files);
  console.log(`SENT to ${TO}, copy to ${CC}`);
}

main();
