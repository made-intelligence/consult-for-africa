/**
 * The AGELESS consultancy invoice of 15 October to Dr Akinware, Dr Ajelabi in copy.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-invoice-itunu.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-invoice-itunu.ts --send
 */
import { readFileSync } from "fs";
import { notifyInternal } from "@/lib/email";

const send = process.argv.includes("--send");
const TO = "itunu.akinware@medburyhealthcare.com";
const CC = ["adedotun.ajelabi@medlyfewellness.com", "dodulana@gmail.com"];
const FILE = "docs/ageless/Invoice-CFA-2026-1015-AGL.pdf";
const SUBJECT = "AGELESS: invoice CFA-2026-1015-AGL";

const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear Dr Akinware,</p>
<p>Thank you again for AGELESS.</p>
<p>Please find attached our invoice of 15 October for consultancy and event management, NGN 1,400,000. I have copied Dr Ajelabi.</p>
<p>I leave it with you and the finance team.</p>
<p>Kind regards,<br>Debo</p>
</div>`;

async function main() {
  if (!send) {
    console.log(`DRY RUN. To ${TO}, cc ${CC.join(", ")}, attaching ${FILE}. --send to go.`);
    return;
  }
  const files = {
    attachments: [{ name: "Invoice-CFA-2026-1015-AGL.pdf", mimeType: "application/pdf", content: readFileSync(FILE).toString("base64") }],
  };
  await notifyInternal(TO, SUBJECT, html, files);
  for (const cc of CC) await notifyInternal(cc, `${SUBJECT} (copy)`, html, files);
  console.log(`SENT to ${TO}, copies to ${CC.join(", ")}`);
}

main();
