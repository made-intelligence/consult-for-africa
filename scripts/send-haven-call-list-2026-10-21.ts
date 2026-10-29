/**
 * The call list for the Haven staff who have never signed in, to Abigail and
 * Dr Gbadebo. Two emails have not reached them; a phone call is the next step.
 * Dr Shakirah is left off: Debo speaks to her himself.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-call-list-2026-10-21.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-call-list-2026-10-21.ts --send
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");
const TO = [
  { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" },
  { address: "adebusayogbadebo@gmail.com", name: "Dr Omotanwa Gbadebo" },
];
const CC = "debo.odulana@consultforafrica.com";
const WELCOMED_TODAY = ["lyndabolus@gmail.com", "arinzedumebi40@gmail.com", "etietopedet26@gmail.com", "boluwatifeadeola44@gmail.com"];

async function main() {
  const rows: { name: string; email: string; phone: string | null; position: string }[] = await prisma.$queryRaw`
    select m.name, m.email, m.phone, m.position from "StaffMember" m join "Client" c on c.id = m."clientId"
    where c.name = 'Haven Paediatric Centre' and m.kind = 'EMPLOYEE' and m."isActive" and m."lastLoginAt" is null
    order by m.name`;
  const list = rows.filter((r) => !WELCOMED_TODAY.includes(r.email.toLowerCase()) && !/shakirah/i.test(r.name));

  const lines = list.map((r) => `  ${r.name}, ${r.position}: ${r.phone ?? "no number"}`).join("\n");
  const rowsHtml = list.map((r) => `<tr><td style="padding:6px 14px 6px 0">${r.name}</td><td style="padding:6px 14px 6px 0;color:#64748b">${r.position}</td><td style="padding:6px 0"><a href="tel:${r.phone}">${r.phone ?? "no number"}</a></td></tr>`).join("");

  const intro = `Dear Abigail and Dr Omotanwa,

Twelve of the hospital's twenty-five staff have now signed in to the staff page. The ${list.length} below have had two emails and have not, so the next step is a short phone call from one of you this week.`;
  const ask = `On the call: check they received the email, then stay on the line while they open https://www.consultforafrica.com/HavenStaff, type their email and enter the six-digit code. Two minutes. If the code does not arrive, note it and tell me; that is our problem to fix, not theirs.

Please split the list between you. The chase list (Haven adoption in the platform menu) shows each person as they sign in; send me the names of anyone you could not reach.

Four new staff were added from Haven's updated sheet today and welcomed by email, so they are not on this list yet.

Thank you both.

Debo`;
  const text = `${intro}\n\n${lines}\n\n${ask}`;
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">${intro.replace(/\n/g, "<br>")}<table style="margin:14px 0;border-collapse:collapse;font-size:14.5px">${rowsHtml}</table>${ask
    .replace("https://www.consultforafrica.com/HavenStaff", '<a href="https://www.consultforafrica.com/HavenStaff">consultforafrica.com/HavenStaff</a>')
    .replace(/\n/g, "<br>")}</div>`;

  console.log(text);
  if (!SEND) { console.log("\nDRY RUN. Re-run with --send."); return; }
  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: { address: "hello@consultforafrica.com", name: "Consult for Africa" },
      to: TO.map((t) => ({ email_address: t })),
      cc: [{ email_address: { address: CC, name: "Debo Odulana" } }],
      reply_to: [{ address: CC, name: "Debo Odulana" }],
      subject: `Haven: ${list.length} staff to call this week`,
      htmlbody: html,
      textbody: text,
    }),
  });
  console.log(res.ok ? "\nSent." : `\nFAILED ${res.status} ${await res.text()}`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
