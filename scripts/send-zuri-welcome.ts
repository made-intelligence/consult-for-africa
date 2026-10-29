/**
 * Sets up Zuri Health's employer account for Dr Ikechukwu and sends him the
 * welcome: what has been done on his three roles, the fit request, the fee,
 * and his dashboard.
 *
 * The roles are not attached to his organisation here. That happens when he
 * accepts the introduction terms on the fit form, so he sees no candidate
 * before he has agreed how introductions are charged.
 *
 *   npx tsx --env-file=.env.local scripts/send-zuri-welcome.ts --to=me@x   # test copy, no account change
 *   npx tsx --env-file=.env.local scripts/send-zuri-welcome.ts --send      # create the account and send to Dr Ike
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { fitToken } from "@/lib/cadreHealth/fitProfile";
import { NETWORK_FEE_PERCENT, STANDARD_FEE_PERCENT } from "@/lib/cadreHealth/introductionTerms";

const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const IKE = { email: "ikechukwu@zuri.health", name: "Dr Ikechukwu" };
const CLAIMED_REACHED = 402;
const UNCLAIMED_POOL = "about 3,100";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const parse = (addr: string) => {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
};

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set.");

  const facility = await prisma.cadreFacility.findUnique({ where: { slug: "zuri-health" }, select: { id: true, name: true } });
  if (!facility) throw new Error("No zuri-health facility. Run scripts/seed-zuri-health-jobs.ts first.");

  const org =
    (await prisma.cadreEmployerOrg.findUnique({ where: { facilityId: facility.id } })) ??
    (await prisma.cadreEmployerOrg.create({ data: { name: facility.name, facilityId: facility.id } }));

  const mandates = await prisma.cadreMandate.findMany({
    where: { facilityId: facility.id, status: "OPEN" },
    orderBy: { createdAt: "asc" },
    select: { title: true, slug: true, id: true },
  });
  const applied = await prisma.cadreMandateMatch.count({ where: { mandateId: { in: mandates.map((m) => m.id) }, source: "APPLIED" } });
  const passed = await prisma.cadreMandateMatch.count({ where: { mandateId: { in: mandates.map((m) => m.id) }, source: "APPLIED", NOT: { notes: { contains: "Screened out:" } } } });

  // The set-password link. Only minted for the real send; a test shows the shape.
  let resetUrl = `${SITE}/oncadre/employer/reset-password/(generated-on-send)`;
  if (SEND) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 14 * 24 * 3600 * 1000);
    const existing = await prisma.cadreEmployerAccount.findUnique({ where: { contactEmail: IKE.email } });
    if (existing) {
      await prisma.cadreEmployerAccount.update({ where: { id: existing.id }, data: { passwordResetToken: token, passwordResetExpiry: expiry } });
    } else {
      await prisma.cadreEmployerAccount.create({
        data: {
          orgId: org.id,
          role: "OWNER",
          companyName: org.name,
          contactName: IKE.name,
          contactEmail: IKE.email,
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      });
    }
    resetUrl = `${SITE}/oncadre/employer/reset-password/${token}`;
  }
  const fitUrl = `${SITE}/oncadre/fit/${fitToken(org.id)}`;

  const subject = "Your three Nairobi roles are live on CadreHealth";
  const roleList = mandates.map((m) => `<li style="margin:0 0 4px;"><a href="${SITE}/oncadre/jobs/${m.slug}" style="color:#0B3C5D;">${esc(m.title)}</a></li>`).join("");
  const p = (t: string) => `<p style="margin:0 0 14px;">${t}</p>`;
  const h = (t: string) => `<p style="margin:22px 0 8px;font-weight:700;color:#0B3C5D;">${t}</p>`;
  const button = (href: string, label: string) =>
    `<p style="margin:4px 0 18px;"><a href="${esc(href)}" style="display:inline-block;padding:12px 24px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">${label}</a></p>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;font-size:15px;line-height:1.6;">
${p("Dear Dr Ike,")}
${p("Thank you for trusting us with these three roles. They went live today, and this is where they stand.")}
${h("What we have done")}
<ul style="margin:0 0 14px;padding-left:20px;">
<li style="margin:0 0 8px;">The three roles are on the CadreHealth job board, written from your job descriptions:<ul style="margin:6px 0 0;padding-left:18px;">${roleList}</ul></li>
<li style="margin:0 0 8px;">We sent them today to the ${CLAIMED_REACHED} consultant obstetricians, physicians and paediatricians who hold active CadreHealth accounts. ${applied} ${applied === 1 ? "has" : "have"} applied so far.</li>
<li style="margin:0 0 8px;">Every applicant first answers a short screening: ready to relocate to Nairobi, a specialist qualification, at least three years as a specialist, and willingness to register with the KMPDC. ${passed} ${passed === 1 ? "has" : "have"} passed it.</li>
<li style="margin:0 0 8px;">Each one who passes is then assessed against what you tell us fit looks like, so the only people who reach you are worth an interview.</li>
</ul>
${h("The one thing we need from you")}
${p("Ten minutes on what fit looks like for each role: what someone must have, what rules them out, the questions you would ask every candidate, and what you offer a doctor relocating from Nigeria. Everyone who has applied is re-assessed the moment you save.")}
${button(fitUrl, "Tell us what fit looks like")}
${p(`The same page sets out our terms. This is a paid search, charged once for each person you engage: ${NETWORK_FEE_PERCENT} per cent of their first-year gross, our digital health network rate (our standard is ${STANDARD_FEE_PERCENT} per cent). There is no fee unless you engage someone. Once you have accepted, we send the roles to the wider register, ${UNCLAIMED_POOL} more specialists.`)}
${h("Your dashboard")}
${p("Set your password below. Once the terms are accepted your dashboard shows each role, every shortlisted candidate with the reasons, and lets you move them to interview and offer. When you want to speak to someone, ask through the dashboard and we put you in touch as soon as they agree.")}
${button(resetUrl, "Set your password")}
${p("The password link works for 14 days. Reply to this email with anything you need.")}
<p style="margin:18px 0 4px;">With warm regards,</p>
<p style="margin:0;font-weight:600;">Dr Debo Odulana</p>
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Founding Partner, Consult for Africa</p>
</div></body></html>`;

  const text = `Dear Dr Ike,

Thank you for trusting us with these three roles. They went live today, and this is where they stand.

WHAT WE HAVE DONE
- The three roles are on the CadreHealth job board, written from your job descriptions:
${mandates.map((m) => `  ${m.title}: ${SITE}/oncadre/jobs/${m.slug}`).join("\n")}
- We sent them today to the ${CLAIMED_REACHED} consultant obstetricians, physicians and paediatricians who hold active CadreHealth accounts. ${applied} so far have applied.
- Every applicant first answers a short screening: ready to relocate to Nairobi, a specialist qualification, at least three years as a specialist, and willingness to register with the KMPDC. ${passed} have passed it.
- Each one who passes is then assessed against what you tell us fit looks like, so the only people who reach you are worth an interview.

THE ONE THING WE NEED FROM YOU
Ten minutes on what fit looks like for each role: what someone must have, what rules them out, the questions you would ask every candidate, and what you offer a doctor relocating from Nigeria. Everyone who has applied is re-assessed the moment you save.
${fitUrl}

The same page sets out our terms. This is a paid search, charged once for each person you engage: ${NETWORK_FEE_PERCENT} per cent of their first-year gross, our digital health network rate (our standard is ${STANDARD_FEE_PERCENT} per cent). There is no fee unless you engage someone. Once you have accepted, we send the roles to the wider register, ${UNCLAIMED_POOL} more specialists.

YOUR DASHBOARD
Set your password: ${resetUrl}
Once the terms are accepted your dashboard shows each role, every shortlisted candidate with the reasons, and lets you move them to interview and offer. When you want to speak to someone, ask through the dashboard and we put you in touch as soon as they agree. The password link works for 14 days.

With warm regards,
Dr Debo Odulana
Founding Partner, Consult for Africa`;

  const to = SEND ? IKE.email : TO;
  if (!to) {
    console.log({ org: org.id, applied, passed, fitUrl });
    console.log("DRY RUN. Pass --to=address for a test or --send to send to Dr Ike.");
    return;
  }
  const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: to, name: SEND ? IKE.name : undefined }], replyTo: parse(FROM), subject: SEND ? subject : `[TEST] ${subject}`, htmlbody: html, textbody: text });
  console.log(to, r.ok ? "sent" : r.error, { applied, passed });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
