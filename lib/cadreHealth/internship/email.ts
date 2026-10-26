import { sendTransactionalEmail } from "@/lib/zeptomail";
import { INTAKE_LABEL } from "./programme";
import { PER_SECTION, SECTIONS, TIME_LIMIT_MINUTES } from "./questionBank";

const FROM = process.env.CADRE_SMTP_FROM ?? process.env.SMTP_FROM ?? "CadreHealth <hello@consultforafrica.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://consultforafrica.com";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function internshipUrl(token: string) {
  return `${BASE_URL}/oncadre/internships/${token}`;
}

/** The applicant's one link to sit the assessment and follow their application. */
export async function sendInternshipLink({ to, firstName, token, resent }: { to: string; firstName: string; token: string; resent: boolean }) {
  const url = internshipUrl(token);
  const questions = PER_SECTION * Object.keys(SECTIONS).length;
  const subject = resent ? "Your CadreHealth internship link" : `Your nursing internship application, ${INTAKE_LABEL}`;
  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937;max-width:560px">
  <p>Dear ${esc(firstName)},</p>
  <p>${resent ? "Here is your link again." : "Thank you for applying for an internship place through CadreHealth."} This link is yours alone: it is how you sit the assessment and follow your application.</p>
  <p style="margin:24px 0"><a href="${url}" style="background:#0B3C5D;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Open my application</a></p>
  <p>The assessment is ${questions} questions in ${TIME_LIMIT_MINUTES} minutes, and you sit it once. Start it when you have a quiet place and a steady connection. The clock runs from the moment you press start, even if you close the page.</p>
  <p>When you finish, your score goes to the centres you chose, and they invite the people they want to interview. We will email you when a centre acts on your application.</p>
  <p>CadreHealth does not charge applicants and no centre may ask you for money for a place. If anyone does, tell us at hello@consultforafrica.com.</p>
  <p>With best wishes,<br/>CadreHealth</p>
  <p style="font-size:12px;color:#6b7280">If the button does not work, copy this address into your browser: ${url}</p>
</div>`;
  const text = `Dear ${firstName},

${resent ? "Here is your link again." : "Thank you for applying for an internship place through CadreHealth."} This link is yours alone: it is how you sit the assessment and follow your application.

${url}

The assessment is ${questions} questions in ${TIME_LIMIT_MINUTES} minutes, and you sit it once. Start it when you have a quiet place and a steady connection. The clock runs from the moment you press start, even if you close the page.

When you finish, your score goes to the centres you chose, and they invite the people they want to interview. We will email you when a centre acts on your application.

CadreHealth does not charge applicants and no centre may ask you for money for a place. If anyone does, tell us at hello@consultforafrica.com.

With best wishes,
CadreHealth`;
  await sendTransactionalEmail({ from: FROM, to, subject, html, text });
}

/** Tells the applicant a centre has acted. */
export async function sendCentreDecision({ to, firstName, token, centre, status }: { to: string; firstName: string; token: string; centre: string; status: "INVITED" | "OFFERED" | "DECLINED" }) {
  const url = internshipUrl(token);
  const line = {
    INVITED: `${centre} would like to interview you for an internship place. They will contact you directly with a date; you can also see this on your application page.`,
    OFFERED: `${centre} has offered you an internship place. Please accept or decline it on your application page, so the place can go to someone else if you do not need it.`,
    DECLINED: `${centre} will not be taking your application further this intake. Your other choices are unaffected.`,
  }[status];
  const subject = { INVITED: `Interview invitation from ${centre}`, OFFERED: `Internship offer from ${centre}`, DECLINED: `An update from ${centre}` }[status];
  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937;max-width:560px">
  <p>Dear ${esc(firstName)},</p>
  <p>${esc(line)}</p>
  <p style="margin:24px 0"><a href="${url}" style="background:#0B3C5D;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Open my application</a></p>
  <p>With best wishes,<br/>CadreHealth</p>
</div>`;
  await sendTransactionalEmail({ from: FROM, to, subject, html, text: `Dear ${firstName},\n\n${line}\n\n${url}\n\nWith best wishes,\nCadreHealth` });
}
