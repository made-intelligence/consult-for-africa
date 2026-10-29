/**
 * Set up Dr Biola (Co-founder and CEO, Mamaville) on Maarova and send her the invite.
 *
 * Uses a "Mezo Health" Maarova org on the DEVELOPMENT stream (created if absent),
 * creates her as USER, and emails the portal link and a temporary password via
 * the ZeptoMail HTTP API. Dry run unless --send.
 *
 *   npx tsx --env-file=.env.local scripts/send-mamaville-ceo-maarova-invite.ts
 *   npx tsx --env-file=.env.local scripts/send-mamaville-ceo-maarova-invite.ts --send
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
  name: "Dr Biola",
  firstName: "Dr Biola",
  email: "dr.beebarry@gmail.com",
  title: "Co-founder and CEO, Mamaville",
};
const CC = ["debo.odulana@consultforafrica.com"];

function body(password: string) {
  return `Dear ${PERSON.firstName},

Your Maarova leadership profile is open.

Every Mezo leader completes it. It maps how you lead, decide and handle pressure, and it shapes the coaching and support we put around you as you build Mamaville. It is built for healthcare leaders in Africa and covers six areas: behavioural style, values and drivers, emotional intelligence, the move from clinician to leader, team dynamics, and culture.

Six short modules, about an hour in total. You can take them one at a time. Your report comes to you first, and we will go through it together in our first strategy session.

To begin, log in and set your own password:

  Portal:     ${PORTAL}
  Email:      ${PERSON.email}
  Temporary:  ${password}

Warm regards,

Dr Debo Odulana
Founder, Mezo Health`;
}

async function main() {
  let org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { contains: "Mezo Health", mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (!org) {
    if (!SEND) {
      console.log('  Would create org "Mezo Health" (DEVELOPMENT stream)');
    } else {
      org = await prisma.maarovaOrganisation.create({
        data: {
          name: "Mezo Health",
          type: "Hospital network",
          country: "Nigeria",
          city: "Lagos",
          stream: "DEVELOPMENT",
          contactName: "Dr Debo Odulana",
          contactEmail: "debo.odulana@consultforafrica.com",
          maxAssessments: 5,
          isActive: true,
          notes: "Mezo and Mamaville leadership team.",
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

  const password = `Mamaville-${randomBytes(3).toString("hex")}`;

  console.log(`
  To:       ${PERSON.email}
  Cc:       ${CC.join(", ")}
  Portal:   ${PORTAL}
  Role:     USER
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
          role: "USER",
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
      subject: "Your Maarova leadership profile",
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
