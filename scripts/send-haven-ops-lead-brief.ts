/**
 * Bring Dr Omotanwa Gbadebo into the Haven engagement. She is a CFA consultant,
 * Debo's own introduction, going into Haven to run operations and prospective
 * Head of Operations there once the transformation closes.
 *
 * Resets her platform password and sends the brief from Debo with the five
 * documents she needs. The guide is INTERNAL and carries the May 2026 framing
 * rule, which is why the email tells her to read section 2 before she speaks to
 * anybody at the hospital rather than after.
 *
 * Supersedes the first version of this script, which created her as a Haven
 * ClientContact and opened the client portal. Both were wrong: the portal is
 * clientId-scoped and would have shown our own invoices to our own consultant.
 *
 * ZeptoMail HTTP API, from SMTP_FROM, which is hello@ and where the record of
 * what was sent lives. Zoho SMTP throttles and is unreachable from here.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-ops-lead-brief.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-ops-lead-brief.ts --send
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");

const EMAIL = "adebusayogbadebo@gmail.com";
const GREETING = "Dr Omotanwa";
const LOGIN = "https://www.consultforafrica.com/login";
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: your brief, your handbook and your login";

const ATTACHMENTS = [
  { file: "docs/haven-ops-lead-guide-cfa.pdf", name: "Going-into-Haven-Engagement-Guide-INTERNAL.pdf" },
  { file: "docs/haven-operations-handbook-cfa.pdf", name: "Haven-Operations-Handbook.pdf" },
  { file: "docs/haven-ops-working-pack-cfa.pdf", name: "Haven-Operations-Working-Pack.pdf" },
  { file: "docs/haven-growth-strategy-cfa.pdf", name: "Haven-Growth-Strategy.pdf" },
  { file: "docs/haven-organisational-audit-report-cfa.pdf", name: "Haven-Organisational-Audit-Report.pdf" },
];

function body(password: string) {
  return `Dear ${GREETING},

Welcome to the firm. I said I would send you everything at once rather than brief you in pieces, so here it is.

Haven Paediatric Centre is a client of ours: a five-bed paediatric ward and a three-cot NICU in GRA Ikeja, a little over two years old. It is a good young hospital with a real culture and a reputation that travels further than its size would suggest, and it earns between N15 and N20 million a month. The board has asked us to take it to N45 or 50 million a month at an 18 to 20 per cent EBITDA floor, in six months rather than two years. You are going in to run operations there on our mandate, and if this lands the way it should you are the prospective Head of Operations at Haven when it closes. Until then you are ours and you are paid by us.

Start with the engagement guide. It is short and it is internal, so it does not leave the firm and it does not go to the client. Read section 2 before you speak to anybody at Haven, not after. There is one matter at that hospital governed by a standing rule, and the rule exists for legal reasons as well as human ones. If anything in that section is unclear, call me before your first visit rather than afterwards.

Then the handbook, which is the long one. It is the craft of the job rather than the facts of this hospital: the money, the beds, the roster, the stock, the people, the clinical boundary you must not cross, and your first ninety days. It is written to be worked through rather than read, and there are places where I have left you space to write. The working pack is the set of forms the handbook tells you to keep, so print it.

Then the two documents the board has. The growth strategy is the operating plan: ten levers grouped into five jobs, led by the NICU driven into the high season. Four of those ten are substantially yours and the handbook says which. The organisational audit is the harder read, because it is what we found when we went through the hospital in August and the board needed it to be candid. The revenue record was a nursing handover sheet. Around N7 million of cash is locked up. Of a 2,413-line tariff, 80.9 per cent is priced at zero, so care is delivered and never billed. Everything in that report is held to the rule in section 2 of your guide.

Your platform login:

  Portal:     ${LOGIN}
  Email:      ${EMAIL}
  Temporary:  ${password}

Change that password when you first log in, and finish your profile while you are in there. A separate note follows with the leadership assessment our consultants complete.

What I want from you first is your reading of the audit, particularly the parts on how the place actually runs from day to day. The last page of the working pack asks you to write down what you think the plan gets wrong from inside the building. That is the page I most want to read. I would much rather hear where you think we are wrong now than find out in January.

Call me once you have been through it.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error(`No User ${EMAIL}. Run scripts/fix-gbadebo-is-cfa-consultant.ts first.`);
  if (user.role !== "CONSULTANT") console.warn(`! role is ${user.role}, expected CONSULTANT`);

  const files = ATTACHMENTS.map((a) => {
    const p = path.resolve(process.cwd(), a.file);
    if (!fs.existsSync(p)) throw new Error(`Attachment missing: ${a.file}`);
    return { ...a, buf: fs.readFileSync(p) };
  });

  const password = randomBytes(12).toString("base64url") + "!1A";

  console.log(`
  User:     ${user.name} (${user.role})
  To:       ${EMAIL}
  Cc:       ${CC.join(", ")}
  Subject:  ${SUBJECT}
  Password: ${password} (resets hers on send)
  Attached: ${files.map((f) => `${f.name} (${Math.round(f.buf.length / 1024)}kb)`).join(", ")}
`);
  console.log(body(password).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) {
    console.log("\n  DRY RUN. Password not reset, no email sent. Re-run with --send.\n");
    return;
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  // Reset before the send, so the credentials in the email are live on arrival.
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log("  Password reset.");

  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const text = body(password);

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: [{ email_address: { address: EMAIL, name: user.name } }],
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: text.replace(/\n/g, "<br>"),
      textbody: text,
      attachments: files.map((f) => ({
        content: f.buf.toString("base64"),
        mime_type: "application/pdf",
        name: f.name,
      })),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`  SENT. message=${data?.data?.[0]?.message_id ?? "?"} request=${data?.request_id ?? "?"}`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
