/**
 * Reply to Prof Aliyu Mohammed Kodiya, who wrote in to say CadreHealth had his
 * name wrong and asked us to correct it and resend his claim link.
 *
 * He got the templated outreach mail, which greeted him "Dear Dr Mohammed
 * Kodiya" because the NMA import split his row on the first space and left the
 * middle name sitting in the surname field. He is Prof Kodiya.
 *
 * This is deliberately NOT a re-send of the campaign template:
 *   - he wrote a personal message and deserves a personal answer
 *   - the template hardcodes "Dr", and the register has no title field, so a
 *     re-blast would repeat half the original offence
 *
 * Dry run by default. Pass --send to deliver.
 *   npx tsx --env-file=.env.local scripts/send-kodiya-correction.ts --send
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { surnameFor } from "@/lib/cadreSalutation";

for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const prisma = new PrismaClient();
const EMAIL = "amkodiya@gmail.com";
const CC = ["debo.odulana@consultforafrica.com"];
const SEND = process.argv.includes("--send");

async function main() {
  const p = await prisma.cadreProfessional.findUnique({
    where: { email: EMAIL },
    select: { id: true, firstName: true, lastName: true, cadre: true,
              subSpecialty: true, currentFacility: true, passwordHash: true },
  });
  if (!p) throw new Error(`No record for ${EMAIL}`);
  if (surnameFor(p.lastName) !== "Kodiya") {
    throw new Error(`Refusing to send: surname still reads "${p.lastName}". Fix the record first.`);
  }
  if (p.passwordHash) {
    throw new Error("He has already claimed. Send a sign-in note, not a claim link.");
  }

  const claimUrl = `https://www.consultforafrica.com/oncadre/claim/${p.id}`;
  const subject = "Your CadreHealth record, corrected";

  const TEXT = `Dear Prof Kodiya,

Thank you for writing, and I am sorry. Our register was built from an imported list that split your name in the wrong place, so it held Mohammed as your surname and addressed you as Dr Mohammed Kodiya. That was our error and it should not have reached you.

Your record now reads Aliyu Mohammed Kodiya, with Kodiya as the surname, at ${EMAIL}. I have also fixed the fault that caused it, so colleagues whose names were imported the same way stop receiving the same thing.

Your link to claim the profile:

${claimUrl}

It takes two or three minutes. You set a password, see what we hold on you, and correct anything else that is wrong. We currently have you as ${p.subSpecialty ?? "a specialist"} at ${p.currentFacility ?? "your current hospital"}, which the same page lets you change.

One thing so it does not surprise you: the page will still address you as Dr rather than Prof. The register has no field for a title yet. It is on my list.

Thank you for taking the trouble to tell us rather than simply ignoring it.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;

  console.log(`
  To:      ${EMAIL}
  Cc:      ${CC.join(", ")}
  Subject: ${subject}
  Record:  ${p.firstName} | ${p.lastName}
  Claim:   ${claimUrl}
`);
  console.log(TEXT);

  if (!SEND) { console.log("\n  DRY RUN. Nothing sent.\n"); return; }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "hello@consultforafrica.com";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = { address: (m ? m[2] : fromRaw).trim(), name: "Dr Debo Odulana, Consult for Africa" };

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: { address: EMAIL } }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: "hello@consultforafrica.com" }],
      subject,
      htmlbody: TEXT.replace(/\n/g, "<br>"),
      textbody: TEXT,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
