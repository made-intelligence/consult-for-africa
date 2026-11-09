/**
 * Invite Dr Chito to the Arabella staff app. She goes first; the team follows
 * once she and Tolu have added their numbers on /ArabellaStaff/people.
 *
 * Default is a TEST to Debo alone. --send goes to her, Debo copied, and refuses
 * unless the live sign-in page answers 200 and her staff record exists.
 *
 *   npx tsx --env-file=.env.local --env-file=.env scripts/send-arabella-staff-invite.ts
 *   npx tsx --env-file=.env.local --env-file=.env scripts/send-arabella-staff-invite.ts --send
 */
import { PrismaClient } from "@prisma/client";
import { ARABELLA } from "../lib/staffSites";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");
const SITE = "https://www.consultforafrica.com";
const LOGIN = `${SITE}${ARABELLA.pathPrefix}/login`;
const DEBO = "dodulana@gmail.com";
const CHITO = "fumenyi@hotmail.com";

const SUBJECT = "Your practice, every day: the Arabella staff app";
const TEXT = `Dear Dr Chito,

The staff app for Arabella is ready for you to see first, before the team.

Sign in: ${LOGIN}
Use this email address or your mobile number. A six-digit code comes to you.

What you will find:
1. Today at the practice: every area, today and yesterday, what is missing, and 7 and 30 day trends.
2. Decisions: everything waiting on you, with how long it has waited.
3. The people: add the team's mobile numbers and set what each person can see. Only leadership sees the money and the daily view.
4. The rota, learning and issue reporting for the whole team.

The plan reaches the team a few tasks a week from Monday 16 November, starting with opening, the huddle, patients and the day's money. Nothing goes to staff until their numbers are in.

When you have had a look, tell us anything you want changed. The daily view is set to your standard, not ours.

Debo
Consult for Africa`;

async function main() {
  const key = (process.env.ZEPTOMAIL_API_KEY ?? "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (!key) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");

  let to = [DEBO];
  let cc: string[] = [];
  let subject = `TEST: ${SUBJECT}`;
  if (SEND) {
    const page = await fetch(LOGIN, { redirect: "manual" });
    if (page.status !== 200) throw new Error(`Refusing: ${LOGIN} answered ${page.status}`);
    const me = await prisma.staffMember.findFirst({
      where: { clientId: ARABELLA.clientId!, isActive: true, email: { equals: CHITO, mode: "insensitive" } },
      select: { id: true },
    });
    if (!me) throw new Error("Refusing: Dr Chito has no active staff record. Run seed-arabella-staff.ts --apply first.");
    to = [CHITO];
    cc = [DEBO];
    subject = SUBJECT;
  }

  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: to.map((address) => ({ email_address: { address } })),
      ...(cc.length ? { cc: cc.map((address) => ({ email_address: { address } })) } : {}),
      subject,
      htmlbody: TEXT.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>"),
      textbody: TEXT,
    }),
  });
  const d: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(d)}`);
  console.log(`SENT to ${to.join(", ")}${cc.length ? ` cc ${cc.join(", ")}` : ""} request=${d?.request_id}`);
}

main()
  .catch((e) => { console.error(String(e)); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
