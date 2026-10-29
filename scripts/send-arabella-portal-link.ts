/**
 * Give Dr Chito Nwana a personal link into the Arabella client portal.
 *
 * She was invited 9 Oct and re-sent a temporary password 13 Oct, and has not
 * signed in (26 Oct 2026). Rather than another password to copy out of an
 * email, this mints a set-your-password link on the existing reset route, valid
 * for 14 days, so the same link works from WhatsApp or from the email.
 *
 * Minting a new link replaces any earlier one. Her current password, if she
 * knows it, keeps working until she sets a new one.
 *
 *   npx tsx --env-file=.env.local scripts/send-arabella-portal-link.ts
 *   npx tsx --env-file=.env.local scripts/send-arabella-portal-link.ts --send
 *
 * --password instead sets a short password Debo can read to her over the
 * phone. Used 26 Oct when the link failed on her phone with "invalid or
 * expired" although the token was valid in the database.
 *
 *   npx tsx --env-file=.env.local scripts/send-arabella-portal-link.ts --password
 *
 * --code mints a short one-tap sign-in link (/client/go/<code>), used 27 Oct
 * when the password also would not work from her phone. Single use, 14 days.
 *
 *   npx tsx --env-file=.env.local scripts/send-arabella-portal-link.ts --code
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SITE = "https://www.consultforafrica.com";
const EMAIL = "fumenyi@hotmail.com";
const DAYS = 14;
const SEND = process.argv.includes("--send");
const PASSWORD = process.argv.includes("--password");
const CODE = process.argv.includes("--code");

/** Meets the portal rule (10+, upper, lower, digit, special) and reads aloud cleanly. */
function readablePassword() {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const word = Array.from(crypto.randomBytes(4), (b) => letters[b % letters.length]).join("");
  const digits = String(1000 + (crypto.randomBytes(2).readUInt16BE() % 9000));
  return `Arabella-${word}${digits}`;
}

function body(link: string, expires: string) {
  return `Dear Dr Chito,

Your Arabella client portal is ready. Open the link below, choose a password, and you can then sign in.

${link}

The link is personal to you and works until ${expires}. After that, sign in at ${SITE}/client/login with ${EMAIL}.

In the portal you will find the engagement, the invoice and, shortly, the audit dashboard. You can also invite Tolu or anyone else on your team from the Team tab.

Kind regards,
Debo Odulana
Consult For Africa`;
}

async function main() {
  const contact = await prisma.clientContact.findUnique({
    where: { email: EMAIL },
    select: { id: true, name: true, isPortalEnabled: true, lastLoginAt: true, client: { select: { name: true } } },
  });
  if (!contact) throw new Error(`No client contact with ${EMAIL}`);
  console.log(
    `  ${contact.name} (${contact.client.name}), portal ${contact.isPortalEnabled ? "on" : "OFF"}, last login ${contact.lastLoginAt?.toISOString() ?? "never"}`
  );

  if (CODE) {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const code = Array.from(crypto.randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
    await prisma.clientContact.update({
      where: { id: contact.id },
      data: {
        resetToken: crypto.createHash("sha256").update(code).digest("hex"),
        resetTokenExpiry: new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000),
        isPortalEnabled: true,
      },
    });
    console.log(`\n  Sign-in link: ${SITE}/client/go/${code}\n`);
    return;
  }

  if (PASSWORD) {
    const password = readablePassword();
    await prisma.clientContact.update({
      where: { id: contact.id },
      data: { passwordHash: await bcrypt.hash(password, 12), isPortalEnabled: true },
    });
    console.log(`\n  Sign in: ${SITE}/client/login\n  Email:    ${EMAIL}\n  Password: ${password}\n`);
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiry = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  const expires = expiry.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" });
  const link = `${SITE}/client/reset-password?token=${token}`;

  if (!SEND) {
    console.log(body("<link minted on --send>", expires).split("\n").map((l) => `  | ${l}`).join("\n"));
    console.log("\n  DRY RUN. No link minted, no email sent.\n");
    return;
  }

  await prisma.clientContact.update({
    where: { id: contact.id },
    data: { resetToken: tokenHash, resetTokenExpiry: expiry, isPortalEnabled: true },
  });
  console.log(`\n  LINK (valid until ${expiry.toISOString()}):\n  ${link}\n`);

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const text = body(link, expires);

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: { address: EMAIL, name: contact.name } }],
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: "Your Arabella portal link",
      htmlbody: text.replace(/(https:\/\/\S+)/g, '<a href="$1">$1</a>').replace(/\n/g, "<br>"),
      textbody: text,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
