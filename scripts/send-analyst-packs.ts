/**
 * Email the Analyst Pack to Favour Aina and Ruth Oladejo, and the supervisor's
 * guide (with their pack, so she knows what they were told) to Ezinne. Via
 * ZeptoMail from hello@, Debo cc'd.
 *
 *   npx tsx --env-file=.env.local scripts/send-analyst-packs.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-analyst-packs.ts --apply  # send
 *
 * Neither document carries fees or balances, which is asserted against the
 * markdown source before anything goes out.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const DEBO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const EZINNE = { address: "ogeriorji845@gmail.com", name: "Ezinne Orji" };

const PACK = { stem: "analyst-intern-pack-cfa", name: "CFA - Analyst Pack.pdf" };
const GUIDE = { stem: "ezinne-supervising-analysts-cfa", name: "CFA - Supervising the Analysts.pdf" };

const LOGIN = "https://www.consultforafrica.com/login";

function analystNote(first: string) {
  return `${first},

Welcome to Consult for Africa. Attached is your Analyst Pack. Please read Parts One and Two before Monday.

You report to Ezinne Orji, who is copied here. She will walk you through the platform on Monday 2 November. Your first two tasks are already on your desk at ${LOGIN}, using the temporary password from your welcome email.

The pack names real clients, so none of it leaves the firm.

With best regards,
Consult for Africa`;
}

const EZINNE_NOTE = `Ezinne,

Favour Aina and Ruth Oladejo join the office as analysts and report to you from today. Abigail stays with Debo.

Attached is a short guide to supervising and evaluating them: the weekly routine, how to brief and review, and how to score the monthly evaluation on the 28th. Their own pack is attached too, so you know what they have been told.

Already set up on the platform: both are in the Office cohort with you as supervisor, each is staffed as analyst on three engagements, Favour has the Thursday pipeline sweep and Ruth the Wednesday new-clients check, and their first-week tasks are on their desks with you as assigner. Your own task for Monday is on your desk.

With best regards,
Consult for Africa`;

const SENDS = [
  { to: { address: "soromidayo101@gmail.com", name: "Favour Aina" }, cc: [EZINNE, DEBO], subject: "Your Analyst Pack, and Monday", text: analystNote("Favour"), files: [PACK] },
  { to: { address: "ruthpelumi04@gmail.com", name: "Ruth Oladejo" }, cc: [EZINNE, DEBO], subject: "Your Analyst Pack, and Monday", text: analystNote("Ruth"), files: [PACK] },
  { to: EZINNE, cc: [DEBO], subject: "Favour and Ruth: supervising and evaluating them", text: EZINNE_NOTE, files: [GUIDE, PACK] },
];

const html = (text: string) =>
  text.split("\n\n").map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("\n");

function load(stem: string) {
  const pdf = join(process.cwd(), "docs", "office", `${stem}.pdf`);
  const md = pdf.replace(/\.pdf$/, ".md");
  if (!existsSync(pdf)) throw new Error(`Not found: ${pdf}. Run python3 scripts/build-office-onboarding.py first.`);
  const leaked = readFileSync(md, "utf8").match(/N[0-9][0-9,.]*/g);
  if (leaked) throw new Error(`${stem} carries figures (${leaked.slice(0, 3).join(", ")}). Guard them before sending.`);
  if (statSync(pdf).mtimeMs < statSync(md).mtimeMs) throw new Error(`${stem}.pdf is older than its source. Rebuild first.`);
  return readFileSync(pdf).toString("base64");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (apply && !key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");

  for (const s of SENDS) {
    const attachments = s.files.map((f) => ({ name: f.name, content: load(f.stem), mime_type: "application/pdf" }));
    console.log(`${s.to.name} <${s.to.address}>  cc ${s.cc.map((c) => c.name).join(", ")}  |  ${s.subject}  |  ${s.files.map((f) => f.name).join(", ")}`);
    if (!apply) continue;
    const res = await fetch(ZEPTO_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [{ email_address: s.to }],
        cc: s.cc.map((c) => ({ email_address: c })),
        reply_to: [EZINNE],
        subject: s.subject,
        htmlbody: html(s.text),
        textbody: s.text,
        attachments,
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
