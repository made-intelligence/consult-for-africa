/**
 * Open a place for the Chief Compliance Officer at Duchess International
 * Hospital, at Mrs Ladipo's request (26 September 2026: "Please share with the
 * CCO, I want her to have a go at it and it may be what we will adopt for all
 * our clinical staff going forward").
 *
 * She is created HR_ADMIN for the same reason Mrs Ladipo was: she is here to
 * evaluate, not to be assessed, and the role means her own assessment does not
 * consume one of the hospital's five places. Change ROLE below to "USER" if she
 * should be counted as a participant instead.
 *
 * Sends via the ZeptoMail HTTP API, from SMTP_FROM, which is hello@ and is
 * where the record of what was sent lives. Zoho SMTP times out from here.
 *
 *   npx tsx --env-file=.env.local scripts/send-duchess-cco-invite.ts
 *   npx tsx --env-file=.env.local scripts/send-duchess-cco-invite.ts --send
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient, type MaarovaUserRole } from "@prisma/client";

const prisma = new PrismaClient();
const PORTAL = "https://www.consultforafrica.com/maarova/portal/login";
const SEND = process.argv.includes("--send");
const ROLE: MaarovaUserRole = "HR_ADMIN";

const PERSON = {
  name: "Funke Ijimakin",
  // Confirmed by Debo, 28 September 2026.
  firstName: "Dr Ijimakin",
  email: "funke.ijimakin@duchesshospital.com",
  title: "Chief Compliance Officer",
};
const REFERRER = "Mrs Bukola Ladipo";
const CC = ["debo.odulana@consultforafrica.com", "bukola.ladipo@duchesshospital.com"];

function body(password: string) {
  return `Dear ${PERSON.firstName},

${REFERRER} asked me to open a place for you on the Maarova leadership assessment, and I am glad to do it.

Maarova is the assessment platform we built for healthcare leaders in Africa, rather than one adapted from a corporate tool. It covers six dimensions: behavioural style, values, emotional intelligence, the clinical to leadership transition, team dynamics, and culture. It takes about twenty minutes to work through and your report is generated as soon as you finish.

I understand the question in front of you is whether this is the right instrument for the clinical staff more widely. The fourth dimension is the one to watch for that. The move from being excellent at the work to being responsible for people who do the work is where most clinical leaders are left to improvise, and it is the part a general management tool tends to miss entirely.

Two things worth saying plainly before you start. The report is yours. Individual results belong to the person who took the assessment and are never shared with an employer, including in the work we do for hospitals, where only team level themes ever reach anyone else. And your account is set up so that your own assessment does not consume one of the Hospital's places.

To begin, log in and set your own password:

  Portal:     ${PORTAL}
  Email:      ${PERSON.email}
  Temporary:  ${password}

If anything in the report is worth talking through, or if you want to walk through how it would work across a clinical body rather than a handful of people, I am happy to do that, whether or not it goes anywhere commercially.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  const org = await prisma.maarovaOrganisation.findFirst({
    where: { name: { contains: "Duchess", mode: "insensitive" } },
    select: { id: true, name: true, maxAssessments: true, usedAssessments: true },
  });
  if (!org) throw new Error("Duchess organisation not found. Run send-duchess-maarova-invite.ts first.");
  console.log(`  Org: "${org.name}" (${org.id}), ${org.usedAssessments}/${org.maxAssessments} places used`);

  const existing = await prisma.maarovaUser.findUnique({
    where: { email: PERSON.email },
    select: { id: true, name: true },
  });
  if (existing) {
    console.log(`  NOTE: ${PERSON.email} already exists (${existing.id}). Password will be reset rather than duplicated.`);
  }

  const password = `Duchess-${randomBytes(3).toString("hex")}`;

  console.log(`
  To:       ${PERSON.email}
  Cc:       ${CC.join(", ")}
  Subject:  Your place on the Maarova leadership assessment
  Role:     ${ROLE} (own assessment does not consume a place)
  Password: ${password}
`);
  console.log(body(password).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) {
    console.log("\n  DRY RUN. No user created, no email sent.\n");
    return;
  }

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
          role: ROLE,
          isPortalEnabled: true,
          invitedAt: new Date(),
        },
        select: { id: true },
      });

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
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
  // Record the ids: a status flag is not evidence that anything was delivered.
  console.log(
    `  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`
  );
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
