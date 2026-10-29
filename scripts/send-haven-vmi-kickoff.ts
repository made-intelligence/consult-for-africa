/**
 * Open vendor-managed inventory for Haven with Medbury Pharmaceuticals
 * (Yewande Adekoya, warm CFA relationship). Lever 7 of the Haven growth
 * strategy: consignment stock, Haven pays on dispense, supplier carries expiry.
 *
 * Needs two things before --send works: her address, and Dr Tanwa's formulary.
 * It refuses to send without both, so the supplier never gets a request it
 * cannot price.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-vmi-kickoff.ts --to=<email> --formulary=<path.pdf|.xlsx>
 *   ... --send
 */
import fs from "fs";
import path from "path";

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=");
const SEND = process.argv.includes("--send");
const TO = arg("to");
const FORMULARY = arg("formulary");
const CC = ["adebusayogbadebo@gmail.com", "debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven Paediatric Centre: vendor-managed inventory with Medbury Pharmaceuticals";

const TEXT = `Dear Yewande,

I would like Medbury Pharmaceuticals to supply Haven Paediatric Centre on vendor-managed inventory, and to start in the next two weeks.

Haven is a children's hospital in GRA Ikeja with a paediatric ward, a three-cot neonatal unit, an outpatient clinic and its own pharmacy. Consult for Africa runs operations there, and Dr Omotanwa Gbadebo, copied, leads it on site.

What we propose

- Consignment: Medbury Pharmaceuticals owns the stock on Haven's shelf until it is dispensed.
- Payment on dispense, reconciled monthly against Haven's dispensing record.
- Agreed reorder points per line, replenished by you, with a stated delivery time.
- Near-expiry stock taken back or rotated by you.
- Controlled drugs stay outside the arrangement and remain Haven's own stock.
- Haven keeps control of its formulary and its retail prices.

Haven's formulary is attached. We can also share three months of dispensing volumes so you can set the opening stock and reorder points.

Could we have thirty minutes this week, with Dr Tanwa, to agree the terms and a start date?

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

async function main() {
  if (!TO) throw new Error("--to=<Yewande's email> is required.");
  if (!FORMULARY || !fs.existsSync(FORMULARY)) throw new Error("--formulary=<path> is required and must exist. Get it from Dr Tanwa.");
  const buf = fs.readFileSync(FORMULARY);
  const ext = path.extname(FORMULARY).toLowerCase();
  const mime = ext === ".pdf" ? "application/pdf"
    : ext === ".xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "application/octet-stream";

  console.log(`  To: ${TO}\n  Cc: ${CC.join(", ")}\n  Subject: ${SUBJECT}\n  Attached: Haven-Formulary${ext} (${Math.round(buf.length / 1024)}kb)\n`);
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
      to: [{ email_address: { address: TO, name: "Yewande Adekoya" } }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${TEXT}</div>`,
      textbody: TEXT,
      attachments: [{ content: buf.toString("base64"), mime_type: mime, name: `Haven-Formulary${ext}` }],
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. request=${data?.request_id ?? "?"}`);
}
main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
