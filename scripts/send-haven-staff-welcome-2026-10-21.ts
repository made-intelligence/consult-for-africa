/**
 * Welcome to the four staff added from the 21 Oct sheet (scripts/sync-haven-staff-2026-10-21.ts).
 *
 * Reads the list live from StaffMember (kind EMPLOYEE, active, lastLoginAt
 * null) rather than the roster file, so anybody who signs in between the dry
 * run and the send drops out of it.
 *
 * The wording follows the chase list: nobody who has not signed in is behind,
 * because nothing starts for them until they do. So it offers the link again
 * and a way to tell us it did not work, and does not tell anybody off.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-signin-nudge.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-signin-nudge.ts --send
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");
const STAFF_PAGE = "https://www.consultforafrica.com/HavenStaff";
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Welcome to the Haven staff page";
const ONLY = ["lyndabolus@gmail.com", "arinzedumebi40@gmail.com", "etietopedet26@gmail.com", "boluwatifeadeola44@gmail.com"];

const TITLES = /^(dr|mr|mrs|ms|miss|prof)\.?$/i;

function greeting(name: string, department: string) {
  const parts = name.trim().split(/\s+/);
  if (TITLES.test(parts[0]) && parts[1]) return `${parts[0]} ${parts[1]}`;
  return department === "MEDICAL" ? `Dr ${parts[0]}` : parts[0];
}

function body(name: string, department: string) {
  return `Dear ${greeting(name, department)},

Haven has a staff page, and you now have access to it:

  ${STAFF_PAGE}

Type your email address and a six-digit code comes to you. There is no password. It takes about two minutes.

Inside you will find everyone's name and number in one place, your own short list of tasks that you can tick off, leave you can request from your phone, and the team notes board.

If the code does not arrive, or anything does not work, reply to this email and we will sort it out the same day.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553`;
}

async function main() {
  // Raw rather than prisma.staffMember, so this runs from a checkout whose
  // generated client predates the Haven staff tables.
  const people: { name: string; email: string | null; department: string | null }[] = await prisma.$queryRaw`
    select m.name, m.email, m.department from "StaffMember" m join "Client" c on c.id = m."clientId"
    where c.name = 'Haven Paediatric Centre' and m.kind = 'EMPLOYEE' and m."isActive" and m."lastLoginAt" is null
    order by m.name`;
  const withEmail = people.filter((p) => ONLY.includes((p.email ?? "").toLowerCase())).filter((p): p is { name: string; email: string; department: string | null } => !!p.email);

  const probe = await fetch(STAFF_PAGE).catch(() => null);
  console.log(`  staff page -> ${probe?.status ?? "unreachable"}`);
  console.log(`  Recipients: ${withEmail.length} (of ${people.length} not signed in), cc ${CC.join(", ")}`);
  for (const p of withEmail) console.log(`    ${greeting(p.name, p.department ?? "").padEnd(22)} ${p.email}`);
  console.log(`  Subject:    ${SUBJECT}\n`);
  console.log(body(withEmail[0].name, withEmail[0].department ?? "").split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) { console.log("\n  DRY RUN. Re-run with --send.\n"); return; }
  if (!probe?.ok) throw new Error("Staff page is not live. Refusing to send.");

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set.");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  let sent = 0, failed = 0;
  for (const p of withEmail) {
    const text = body(p.name, p.department ?? "");
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: { address: "hello@consultforafrica.com", name: "Consult for Africa" },
        to: [{ email_address: { address: p.email, name: p.name } }],
        cc: CC.map((address) => ({ email_address: { address } })),
        reply_to: [{ address: "hello@consultforafrica.com" }],
        subject: SUBJECT,
        htmlbody: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">${text
          .replace(STAFF_PAGE, `<a href="${STAFF_PAGE}">${STAFF_PAGE}</a>`)
          .replace(/\n/g, "<br>")}</div>`,
        textbody: text,
      }),
    });
    if (!res.ok) { failed++; console.error(`  FAILED ${p.email}: ${res.status} ${await res.text().catch(() => "")}`); }
    else { sent++; console.log(`  sent ${p.email}`); }
    await new Promise((r) => setTimeout(r, 350));
  }
  console.log(`\n  ${sent} sent, ${failed} failed, of ${withEmail.length}.`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
