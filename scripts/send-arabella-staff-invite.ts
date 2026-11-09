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

const SUBJECT = "Arabella Women's Health: your staff app is ready";
const TEXT = `Dear Dr Chito,

Further to the operating plan, the Arabella staff app is ready for you. You are the first to have access; the team follows once you are content with it.

Sign in: ${LOGIN}
Method: enter this email address or your mobile number. A six-digit code will be sent to you. There is no password.

What you will see first: a short setup list of six steps. Each step marks itself complete once it is done, and the list disappears when all six are finished.
1. Bring Tolu in, so the setup is shared.
2. Add the team's mobile numbers. No one is contacted until their number is entered.
3. Confirm who completes each area of the daily view.
4. Enter the rota for the first week.
5. Raise a test decision, to see how items waiting on you are shown.
6. Approve the first training modules. No clinical content reaches staff without your approval.

Timing: the team's first tasks begin on Monday 16 November, a few at a time. The page "The plan, week by week" shows what reaches each person and when.

Next step: I would be glad to take you through it on a short call. Please let me know a convenient time.

Kind regards,

Dr Debo Odulana
Founding Partner, Consult for Africa`;

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
