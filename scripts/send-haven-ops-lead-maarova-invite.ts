/**
 * Open a Maarova place for Dr Omotanwa Gbadebo in the CONSULT FOR AFRICA
 * organisation, with the rest of the firm's consultants.
 *
 * Debo's call, 6 October 2026: she is ours, so she is assessed as one of ours.
 * The earlier version of this script put her in the Haven *client* org
 * alongside the five founders, which would have folded a CFA consultant's
 * result into a client's team-level picture.
 *
 * She is created USER, not HR_ADMIN: she is here to be assessed, not to
 * evaluate the instrument.
 *
 * ZeptoMail HTTP API, from SMTP_FROM. Dry run unless --send.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-ops-lead-maarova-invite.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-ops-lead-maarova-invite.ts --send
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient, type MaarovaUserRole } from "@prisma/client";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");
const PORTAL = "https://www.consultforafrica.com/maarova/portal/login";
const ROLE: MaarovaUserRole = "USER";

const PERSON = {
  name: "Dr Omotanwa Gbadebo",
  email: "adebusayogbadebo@gmail.com",
  greeting: "Dr Omotanwa",
  title: "Consultant, Operations",
};
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Your Maarova leadership assessment";

function body(password: string) {
  return `Dear ${PERSON.greeting},

This is the assessment I mentioned, and every consultant in the firm does it. It is not a hurdle and nobody is marking you on it.

Maarova was built for healthcare leaders in Africa rather than adapted from a corporate tool. It covers six dimensions: behavioural style, values, emotional intelligence, the move from clinical work into leadership, team dynamics, and culture. Set aside about an hour. Your report is generated as soon as you finish.

Your report belongs to you. Individual results are never passed to a client, a board or an employer, and that includes Haven. Only team level themes ever reach anyone else. It holds whether or not the Haven role goes ahead.

  Portal:     ${PORTAL}
  Email:      ${PERSON.email}
  Temporary:  ${password}

The fourth dimension is the one I would watch in your case. Going from being excellent at the work to being accountable for the people who do the work is the part most clinical leaders are left to improvise, and Haven will ask it of you quickly.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  const org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { equals: "Consult For Africa", mode: "insensitive" } },
    select: { id: true, name: true, maxAssessments: true, usedAssessments: true },
  });
  if (!org) throw new Error("Consult For Africa Maarova organisation not found.");
  console.log(`  Org: "${org.name}" (${org.id}), ${org.usedAssessments}/${org.maxAssessments} places used`);

  const existing = await prisma.maarovaUser.findUnique({
    where: { email: PERSON.email },
    select: { id: true, organisationId: true },
  });
  if (existing && existing.organisationId !== org.id) {
    throw new Error(`${PERSON.email} already belongs to another Maarova org (${existing.organisationId}).`);
  }
  if (existing) console.log(`  NOTE: already a MaarovaUser (${existing.id}). Password will be reset rather than duplicated.`);

  const password = `CFA-${randomBytes(3).toString("hex")}`;

  console.log(`
  To:       ${PERSON.email}
  Cc:       ${CC.join(", ")}
  Subject:  ${SUBJECT}
  Role:     ${ROLE}
  Title:    ${PERSON.title}
  Password: ${password}
`);
  console.log(body(password).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) {
    console.log("\n  DRY RUN. No user created, no email sent. Re-run with --send.\n");
    return;
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const passwordHash = await bcrypt.hash(password, 10);
  const user = existing
    ? await prisma.maarovaUser.update({
        where: { email: PERSON.email },
        data: { passwordHash, isPortalEnabled: true, invitedAt: new Date(), title: PERSON.title },
        select: { id: true },
      })
    : await prisma.maarovaUser.create({
        data: {
          organisationId: org.id,
          email: PERSON.email,
          name: PERSON.name,
          title: PERSON.title,
          passwordHash,
          role: ROLE,
          isPortalEnabled: true,
          invitedAt: new Date(),
        },
        select: { id: true },
      });

  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const text = body(password);

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: { address: PERSON.email, name: PERSON.name } }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
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
  console.log(`  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
