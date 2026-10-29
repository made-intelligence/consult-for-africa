/**
 * Set up Mrs Bukola Ladipo on Maarova and send her the invite.
 *
 * Creates a "Duchess International Hospital" Maarova org on the DEVELOPMENT
 * stream if it is absent, creates her as HR_ADMIN so her own assessment does
 * not consume a staff place and she can see completion without ever seeing an
 * individual result, then emails the portal link and a temporary password.
 *
 * Sends via the ZeptoMail HTTP API. Zoho SMTP times out from here, so the older
 * nodemailer invite scripts will not work.
 *
 *   npx tsx --env-file=.env.local scripts/send-duchess-maarova-invite.ts
 *   npx tsx --env-file=.env.local scripts/send-duchess-maarova-invite.ts --send
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const prisma = new PrismaClient();
const PORTAL = "https://www.consultforafrica.com/maarova/portal/login";
const SEND = process.argv.includes("--send");

const PERSON = {
  name: "Bukola Ladipo",
  firstName: "Mrs Ladipo",
  email: "bukola.ladipo@duchesshospital.com",
  title: "Human Resources Manager",
};
const CC = ["debo.odulana@consultforafrica.com"];

function body(password: string) {
  return `Dear ${PERSON.firstName},

As promised, your place on the Maarova leadership assessment is open.

Maarova is the assessment platform we built for healthcare leaders in Africa, rather than one adapted from a corporate tool. It covers six dimensions: behavioural style, values, emotional intelligence, the clinical to leadership transition, team dynamics, and culture. It takes about twenty minutes to work through and your report is generated as soon as you finish.

Two things worth saying plainly before you start. The report is yours. Individual results belong to the person who took the assessment and are never shared with an employer, including in the work we do for hospitals, where only team level themes ever reach anyone else. And the account is set up so that your own assessment does not consume one of the places, which means you can put colleagues through it later without having used one up on yourself.

To begin, log in and set your own password:

  Portal:     ${PORTAL}
  Email:      ${PERSON.email}
  Temporary:  ${password}

If you would like anyone else at the Hospital included, reply with their names and I will open their places. And if the report raises anything you would like to talk through, I am happy to do that, whether or not it goes anywhere commercially.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  let org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { contains: "Duchess", mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (!org) {
    if (!SEND) {
      console.log('  Would create org "Duchess International Hospital" (DEVELOPMENT stream)');
    } else {
      org = await prisma.maarovaOrganisation.create({
        data: {
          name: "Duchess International Hospital",
          type: "Hospital",
          country: "Nigeria",
          city: "Lagos",
          stream: "DEVELOPMENT",
          contactName: PERSON.name,
          contactEmail: PERSON.email,
          maxAssessments: 5,
          isActive: true,
          notes: "Trial access for the HR Manager following the 23 September 2026 meeting. Opened alongside the HR and workforce prospectus.",
        },
        select: { id: true, name: true },
      });
      console.log(`  Created org "${org.name}" (${org.id})`);
    }
  } else {
    console.log(`  Using existing org "${org.name}" (${org.id})`);
  }

  const existing = await prisma.maarovaUser.findUnique({
    where: { email: PERSON.email },
    select: { id: true, name: true, organisationId: true },
  });
  if (existing) {
    console.log(`  NOTE: ${PERSON.email} already exists as a Maarova user (${existing.id}). Will reset the password rather than duplicate.`);
  }

  const password = `Duchess-${randomBytes(3).toString("hex")}`;

  console.log(`
  To:       ${PERSON.email}
  Cc:       ${CC.join(", ")}
  Portal:   ${PORTAL}
  Role:     HR_ADMIN (own assessment does not consume a place)
  Password: ${password}
`);

  if (!SEND) {
    console.log("  DRY RUN. No user created, no email sent.\n");
    return;
  }
  if (!org) throw new Error("Organisation missing");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = existing
    ? await prisma.maarovaUser.update({
        where: { email: PERSON.email },
        data: { passwordHash, isPortalEnabled: true, invitedAt: new Date() },
        select: { id: true },
      })
    : await prisma.maarovaUser.create({
        data: {
          organisationId: org.id,
          email: PERSON.email,
          name: PERSON.name,
          title: PERSON.title,
          passwordHash,
          role: "HR_ADMIN",
          isPortalEnabled: true,
          invitedAt: new Date(),
        },
        select: { id: true },
      });

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const text = body(password);

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: { address: PERSON.email } }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: "Your place on the Maarova leadership assessment",
      htmlbody: text.replace(/\n/g, "<br>"),
      textbody: text,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) {
    await prisma.maarovaUser.update({
      where: { id: user.id },
      data: { inviteEmailStatus: "FAILED", inviteEmailError: JSON.stringify(data).slice(0, 500) },
    });
    throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  }
  await prisma.maarovaUser.update({
    where: { id: user.id },
    data: { inviteEmailStatus: "SENT", inviteEmailSentAt: new Date() },
  });
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
