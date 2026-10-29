/**
 * Tell Dr Chito and Tolu that /ArabellaProject now carries the additional
 * request of 28 October 2026, after the data review. Send only once the page
 * change is live in production; the script checks for it and refuses otherwise.
 *
 * The email names no amounts: Tolu is on it, and the funding questions point
 * back to the 21 October email, which went to Dr Chito alone.
 *
 *   npx tsx --env-file=.env.local scripts/send-arabella-october-request.ts
 *   npx tsx --env-file=.env.local scripts/send-arabella-october-request.ts --send
 */
const SEND = process.argv.includes("--send");
const PAGE = "https://www.consultforafrica.com/ArabellaProject";
const TO = [
  { address: "fumenyi@hotmail.com", name: "Dr Chito Nwana" },
  { address: "tmc@arabellawomenshealth.com", name: "Tolu Williams" },
];

const text = `Dear Dr Chito and Tolu,

Thank you for your response to the report. The interim report was prepared from the sales record and the expense summaries; the additional information you sent, including the bank statements and the expense line items, was not reviewed in that report. We have now reviewed all of it, and I will take you through the updated picture when we meet.

To settle the questions the files cannot answer on their own, the project page now lists what we need next: 21 items in five groups, with six marked first. Most are exports and documents that already exist, such as the billing export, the Access Bank statement, the full expense ledger, payroll schedules and the antenatal booking register.

${PAGE}

Each item has its own upload option, so please choose the item number when you upload. Where a record does not exist, a one-line note saying so is just as useful. If the six marked first could come in by Wednesday 4 November, we can agree the facts with you before the revised report is written.

I would also welcome an hour with you both next week. Let me know what suits.

Warm regards,
Dr Debo Odulana
Founding Partner, Consult for Africa`;

async function main() {
  const live = await fetch(PAGE).then((r) => r.text());
  if (!live.includes("What we need now")) throw new Error("The October request is not live on /ArabellaProject yet. Merge and deploy first.");

  console.log(`  To: ${TO.map((t) => t.address).join(", ")}\n`);
  console.log(text.split("\n").map((l) => `  | ${l}`).join("\n"));
  if (!SEND) {
    console.log("\n  DRY RUN. Nothing sent.\n");
    return;
  }

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
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: "Arabella audit: what we need next",
      htmlbody: text.replace(/(https:\/\/\S+)/g, '<a href="$1">$1</a>').replace(/\n/g, "<br>"),
      textbody: text,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. request=${data?.request_id ?? "?"}`);
}

main().catch((e) => {
  console.error(String(e));
  process.exitCode = 1;
});
