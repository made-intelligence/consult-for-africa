/**
 * Email the office development plan to Favour Aina and Ruth Oladejo (Ezinne
 * cc'd, as their supervisor) and to Abigail Oladejo (Debo cc'd, as hers).
 *
 *   npx tsx --env-file=.env.local scripts/send-development-plan.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-development-plan.ts --apply  # send
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const DEBO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const EZINNE = { address: "ogeriorji845@gmail.com", name: "Ezinne Orji" };

const STEM = "office-development-plan-cfa";
const NAME = "CFA - Development Plan.pdf";

const note = (first: string, supervisor: string) => `${first},

Attached is your development plan for the next six months. It covers the work, the Academy courses you are now enrolled in, and how your progress is measured.

You have a two-hour Learning hour on your desk every Friday from tomorrow. Start with CFA Platform and Engagement under Academy on the platform.

${supervisor} will go through it with you at your next check-in.

With best regards,
Consult for Africa`;

const SENDS = [
  { to: { address: "soromidayo101@gmail.com", name: "Favour Aina" }, cc: [EZINNE, DEBO], replyTo: EZINNE, text: note("Favour", "Ezinne") },
  { to: { address: "ruthpelumi04@gmail.com", name: "Ruth Oladejo" }, cc: [EZINNE, DEBO], replyTo: EZINNE, text: note("Ruth", "Ezinne") },
  { to: { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" }, cc: [DEBO], replyTo: DEBO, text: note("Abigail", "Debo") },
];

const html = (text: string) =>
  text.split("\n\n").map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("\n");

async function main() {
  const apply = process.argv.includes("--apply");
  const pdf = join(process.cwd(), "docs", "office", `${STEM}.pdf`);
  const md = pdf.replace(/\.pdf$/, ".md");
  if (!existsSync(pdf)) throw new Error(`Not found: ${pdf}. Run python3 scripts/build-office-onboarding.py development first.`);
  const leaked = readFileSync(md, "utf8").match(/N[0-9][0-9,.]*/g);
  if (leaked) throw new Error(`The plan carries figures (${leaked.slice(0, 3).join(", ")}). Guard them before sending.`);
  if (statSync(pdf).mtimeMs < statSync(md).mtimeMs) throw new Error("The PDF is older than its source. Rebuild first.");
  const content = readFileSync(pdf).toString("base64");

  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (apply && !key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");

  for (const s of SENDS) {
    console.log(`${s.to.name} <${s.to.address}>  cc ${s.cc.map((c) => c.name).join(", ")}`);
    if (!apply) continue;
    const res = await fetch(ZEPTO_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [{ email_address: s.to }],
        cc: s.cc.map((c) => ({ email_address: c })),
        reply_to: [s.replyTo],
        subject: "Your development plan, and Friday learning hour",
        htmlbody: html(s.text),
        textbody: s.text,
        attachments: [{ name: NAME, content, mime_type: "application/pdf" }],
      }),
    });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(`ZeptoMail send to ${s.to.address} failed: ${data?.error?.details?.[0]?.message ?? data?.message ?? `HTTP ${res.status}`}`);
    console.log(`  sent, request_id=${data?.request_id ?? "?"}`);
  }
  if (!apply) console.log("\nDRY RUN. Re-run with --apply to send.");
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
