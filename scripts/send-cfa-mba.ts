/**
 * Email Term 1 of the CFA MBA to Ezinne Orji and Abigail Oladejo (programme,
 * Safety Card, C1 and C2 workbooks), and the same plus the C1 Marking Key to
 * Dr Okeleye, who reviews and examines both courses. Via ZeptoMail from
 * hello@, Debo cc'd on both addresses. The Marking Key never goes to the
 * trainees.
 *
 *   npx tsx --env-file=.env.local scripts/send-cfa-mba.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-cfa-mba.ts --apply  # send
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const DEBO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const DEBO_COPY = { address: "dodulana@gmail.com", name: "Debo Odulana" };
const OKELEYE = { address: "adediwura.okeleye@consultforafrica.com", name: "Dr Adediwura Okeleye" };
const EZINNE = { address: "ogeriorji845@gmail.com", name: "Ezinne Orji" };
const ABIGAIL = { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" };

const PROGRAMME = { stem: "cfa-mba-programme-cfa", name: "CFA MBA - Programme.pdf" };
const SAFETY = { stem: "mezo-care-coordinator-safety-card-cfa", name: "CFA MBA - Care Coordinator Safety Card.pdf" };
const C1 = { stem: "mba-c1-medicine-and-the-hospital-cfa", name: "CFA MBA - C1 Medicine and the Hospital.pdf" };
const C2 = { stem: "mba-c2-managing-through-others-cfa", name: "CFA MBA - C2 Managing Through Others.pdf" };
const KEY = { stem: "mba-c1-marking-key-cfa", name: "CFA MBA - C1 Marking Key.pdf" };

const TRAINEE_NOTE = `Ezinne, Abigail,

I am putting you both through an MBA built on our own work: twelve courses and a capstone over the next year, about four hours a week. The programme is attached.

Term 1 starts Monday 9 November with two courses: C1 Medicine and the Hospital, and C2 Managing Through Others. Both workbooks are attached.

Before then, read the Care Coordinator Safety Card. It applies on every Mezo request from today.

Your weekly tasks are on your desks. Dr Adediwura Okeleye, copied here, reviews your work and examines you on both courses.

Debo`;

const OKELEYE_NOTE = `Dr Okeleye,

I have started an MBA for Ezinne and Abigail, built on our own work, and I would like you to review the first two courses. Attached: the programme, the Safety Card, both workbooks, and the C1 Marking Key, which is for you only.

What it asks of you:
- C1 Medicine and the Hospital: each Friday from 13 November to 18 December, a 22-question test and a short exercise from each. The key has every answer. About ten minutes per person per week.
- C2 Managing Through Others: each Friday from 13 November to 4 December, the real task briefs they wrote that week, marked against the rubric in the workbook. About ten minutes per person per week.
- Friday 4 December: the C2 practical, 30 minutes each.
- Thursday 7 January: the C1 written paper and a 20-minute oral each.

All of it is on your desk as tasks.

Debo`;

const SENDS = [
  { to: [EZINNE, ABIGAIL], cc: [OKELEYE, DEBO, DEBO_COPY], replyTo: DEBO, subject: "Your CFA MBA, and Term 1", text: TRAINEE_NOTE, files: [PROGRAMME, SAFETY, C1, C2] },
  { to: [OKELEYE], cc: [DEBO, DEBO_COPY], replyTo: DEBO, subject: "The CFA MBA for Ezinne and Abigail: you as reviewer for Term 1", text: OKELEYE_NOTE, files: [PROGRAMME, SAFETY, C1, C2, KEY] },
];

const html = (text: string) =>
  text.split("\n\n").map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("\n");

function load(stem: string) {
  const pdf = join(process.cwd(), "docs", "office", `${stem}.pdf`);
  const md = pdf.replace(/\.pdf$/, ".md");
  if (!existsSync(pdf)) throw new Error(`Not found: ${pdf}. Run python3 scripts/build-office-onboarding.py mba safety c1 c1-key c2 first.`);
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
    if (s.to.some((t) => t !== OKELEYE) && s.files.includes(KEY)) throw new Error("The Marking Key must not go to a trainee.");
    const attachments = s.files.map((f) => ({ name: f.name, content: load(f.stem), mime_type: "application/pdf" }));
    console.log(`${s.to.map((t) => t.name).join(", ")}  cc ${s.cc.map((c) => c.address).join(", ")}  |  ${s.subject}  |  ${s.files.map((f) => f.name).join("; ")}`);
    if (!apply) continue;
    const res = await fetch(ZEPTO_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: s.to.map((t) => ({ email_address: t })),
        cc: s.cc.map((c) => ({ email_address: c })),
        reply_to: [s.replyTo],
        subject: s.subject,
        htmlbody: html(s.text),
        textbody: s.text,
        attachments,
      }),
    });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(`ZeptoMail send failed: ${data?.error?.details?.[0]?.message ?? data?.message ?? `HTTP ${res.status}`}`);
    console.log(`  sent, request_id=${data?.request_id ?? "?"}`);
  }
  if (!apply) console.log("\nDRY RUN. Re-run with --apply to send.");
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
