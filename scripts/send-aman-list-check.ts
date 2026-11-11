/**
 * Ask Favour to confirm the 400-provider list from the Aman work is unconverted
 * leads (not among the 150 already signed) before it goes into the signing tracker.
 * Attaches the list. Via ZeptoMail from hello@, replies to Debo, Debo copied.
 *
 *   npx tsx --env-file=.env.local scripts/send-aman-list-check.ts           # dry run
 *   npx tsx --env-file=.env.local scripts/send-aman-list-check.ts --test    # to Debo only, TEST: subject
 *   npx tsx --env-file=.env.local scripts/send-aman-list-check.ts --apply   # send, after Debo approves the test
 */

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const FAVOUR = { address: "soromidayo101@gmail.com", name: "Favour Aina" };
const DEBO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const DEBO_PERSONAL = { address: "dodulana@gmail.com", name: "Debo Odulana" };

const LIST = join(homedir(), "Downloads", "400_providers_with_contact_and_email.xlsx");

const NOTE = `Favour,

The attached list of 366 Lagos providers came out of the Aman work. Before it goes into the signing tracker, please confirm three things by reply:

1. Are these providers still to sign Aman's SLA, or are some of them among the 150 already signed?
2. If some have signed, add a column "Signed" (Yes or No) and send the file back.
3. Which of them have you, Ruth or Gidado already contacted in this sprint?

A reply by tomorrow morning is enough.

Thank you,
Debo`;

const SEND = {
  to: [FAVOUR],
  cc: [DEBO, DEBO_PERSONAL],
  replyTo: DEBO,
  subject: "Aman provider list: are these still to sign?",
  text: NOTE,
};

const html = (text: string) =>
  text.split("\n\n").map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("\n");

async function main() {
  const apply = process.argv.includes("--apply");
  const test = process.argv.includes("--test");
  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if ((apply || test) && !key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");
  if (!existsSync(LIST)) throw new Error(`Not found: ${LIST}`);

  // A test goes to Debo alone, identical apart from the subject, before Favour sees it.
  const send = test ? { ...SEND, to: [DEBO], cc: [DEBO_PERSONAL], subject: `TEST: ${SEND.subject}` } : SEND;
  console.log(`to ${send.to.map((t) => t.name).join(", ")}\ncc ${send.cc.map((c) => c.address).join(", ")}\n${send.subject}`);
  if (!apply && !test) return console.log("\nDRY RUN. --test sends to Debo only; --apply sends to Favour.");

  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: send.to.map((t) => ({ email_address: t })),
      cc: send.cc.map((c) => ({ email_address: c })),
      reply_to: [send.replyTo],
      subject: send.subject,
      htmlbody: html(send.text),
      textbody: send.text,
      attachments: [
        {
          name: "Aman provider list (366).xlsx",
          content: readFileSync(LIST).toString("base64"),
          mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    }),
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok) throw new Error(`ZeptoMail send failed: ${data?.error?.details?.[0]?.message ?? data?.message ?? `HTTP ${res.status}`}`);
  console.log(`sent, request_id=${data?.request_id ?? "?"}`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
