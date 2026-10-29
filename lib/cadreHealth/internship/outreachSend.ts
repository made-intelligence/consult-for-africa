import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/zeptomail";
import { CURRENT_INTAKE, INTAKE_LABEL, LAGOS_CENTRES, PARTNER_LED } from "./programme";
import { PROGRAMME_EMAIL, PROGRAMME_LEAD, asksToClaim, greetingFor, renderText, toHtml, type OutreachVars } from "./outreach";
import { claimUrl, ensureClaimToken } from "./listing";

const FROM = process.env.CADRE_SMTP_FROM ?? process.env.SMTP_FROM ?? "CadreHealth <hello@consultforafrica.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://consultforafrica.com";
/** Where a centre's reply goes. Set it to the programme lead's work inbox once she has one. */
export const REPLY_TO = process.env.CADRE_INTERNSHIP_REPLY_TO ?? PROGRAMME_EMAIL;

export const CENTRES_PAGE = `${BASE_URL}/oncadre/internships/centres`;
const GAP_MS = 400;
/** The same preset to the same centre inside this window is a double click, not a decision. */
const REPEAT_WINDOW_MS = 3 * 24 * 3600_000;

export type Sender = { id: string; name: string | null; email: string | null };

/** The figures every email can quote, read once per send. */
export async function programmeFigures() {
  const [applicants, centres, choiceCounts] = await Promise.all([
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } }),
    prisma.cadreInternshipCentre.count({ where: { stage: { not: "DECLINED" } } }),
    prisma.cadreInternshipPreference.groupBy({ by: ["centreId"], where: { application: { intake: CURRENT_INTAKE } }, _count: { _all: true } }),
  ]);
  return { applicants, centres: centres || LAGOS_CENTRES.length, choices: new Map(choiceCounts.map((c) => [c.centreId, c._count._all])) };
}

export function varsFor(
  centre: { id: string; name: string; contactName: string | null },
  figures: Awaited<ReturnType<typeof programmeFigures>>,
  sender: Sender,
  claimLink: string,
): OutreachVars {
  return {
    greeting: greetingFor(centre.contactName),
    centreName: centre.name,
    choices: String(figures.choices.get(centre.id) ?? 0),
    applicants: String(figures.applicants),
    centres: String(figures.centres),
    intake: INTAKE_LABEL,
    centresPage: CENTRES_PAGE,
    claimLink,
    senderName: sender.name ?? PROGRAMME_LEAD.name,
    senderRole: PROGRAMME_LEAD.role,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SendResult {
  sent: number;
  failed: { name: string; error: string }[];
  skipped: { name: string; reason: string }[];
}

/**
 * Send one composed email to each chosen centre, personalised, one at a time.
 * Every attempt is logged. A centre we had not approached moves to Contacted
 * and gets a follow-up date, so the list shows what happens next.
 */
export async function sendToCentres(opts: { centreIds: string[]; subject: string; body: string; template: string | null; sender: Sender }): Promise<SendResult> {
  const claiming = asksToClaim(opts.subject, opts.body);
  const [centres, figures] = await Promise.all([
    prisma.cadreInternshipCentre.findMany({
      where: { id: { in: opts.centreIds } },
      select: { id: true, name: true, slug: true, stage: true, listed: true, contactName: true, contactEmail: true, nextAction: true },
    }),
    programmeFigures(),
  ]);
  const emails = centres.map((c) => c.contactEmail?.toLowerCase()).filter((e): e is string => !!e);
  const [suppressed, recent] = await Promise.all([
    prisma.communicationSuppression.findMany({ where: { email: { in: emails }, OR: [{ channel: "EMAIL" }, { channel: null }] }, select: { email: true } }),
    opts.template
      ? prisma.cadreInternshipOutreach.findMany({
          where: { centreId: { in: opts.centreIds }, template: opts.template, status: "SENT", createdAt: { gte: new Date(Date.now() - REPEAT_WINDOW_MS) } },
          select: { centreId: true },
        })
      : Promise.resolve([]),
  ]);
  const blocked = new Set(suppressed.map((s) => s.email!.toLowerCase()));
  const already = new Set(recent.map((r) => r.centreId));

  const result: SendResult = { sent: 0, failed: [], skipped: [] };
  for (const c of centres) {
    const to = c.contactEmail?.toLowerCase();
    if (!to) { result.skipped.push({ name: c.name, reason: "No contact email" }); continue; }
    if (PARTNER_LED.has(c.slug)) { result.skipped.push({ name: c.name, reason: "Goes through Debo first" }); continue; }
    if (c.stage === "DECLINED") { result.skipped.push({ name: c.name, reason: "Declined" }); continue; }
    if (blocked.has(to)) { result.skipped.push({ name: c.name, reason: "Address bounced or opted out" }); continue; }
    if (already.has(c.id)) { result.skipped.push({ name: c.name, reason: "Sent this email in the last 3 days" }); continue; }
    if (claiming && c.listed) { result.skipped.push({ name: c.name, reason: "Already listed, so it needs no claim link" }); continue; }

    const vars = varsFor(c, figures, opts.sender, claiming ? claimUrl(await ensureClaimToken(c.id)) : "");
    const subject = renderText(opts.subject, vars);
    const text = renderText(opts.body, vars);
    let error: string | null = null;
    try {
      const r = await sendTransactionalEmail({ from: FROM, replyTo: REPLY_TO, to, subject, html: toHtml(text), text });
      if (!r.ok) error = r.error ?? "Send failed";
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    await prisma.cadreInternshipOutreach.create({
      data: { centreId: c.id, direction: "OUT", email: to, subject, body: text, template: opts.template, status: error ? "FAILED" : "SENT", error, sentById: opts.sender.id },
    });
    if (error) {
      result.failed.push({ name: c.name, error });
    } else {
      result.sent++;
      const early = c.stage === "PROSPECT" || c.stage === "CONTACTED";
      if (early && (c.stage === "PROSPECT" || !c.nextAction)) {
        await prisma.cadreInternshipCentre.update({
          where: { id: c.id },
          data: {
            ...(c.stage === "PROSPECT" ? { stage: "CONTACTED" } : {}),
            ...(!c.nextAction ? { nextAction: "Follow up the email by phone", nextActionDue: new Date(Date.now() + 7 * 24 * 3600_000) } : {}),
          },
        });
      }
    }
    await sleep(GAP_MS);
  }
  return result;
}

/** A test copy, rendered for one real centre, to the sender's own inbox. */
export async function sendTest(opts: { centreId: string | null; subject: string; body: string; sender: Sender }) {
  if (!opts.sender.email) throw new Error("Your account has no email address.");
  const figures = await programmeFigures();
  const centre = opts.centreId
    ? await prisma.cadreInternshipCentre.findUnique({ where: { id: opts.centreId }, select: { id: true, name: true, contactName: true } })
    : null;
  // A test shows the centre's real link, so the sender can open it and see what the centre will see.
  const link = centre ? claimUrl(await ensureClaimToken(centre.id)) : claimUrl("example");
  const vars = varsFor(centre ?? { id: "", name: "Example Hospital", contactName: null }, figures, opts.sender, link);
  const text = renderText(opts.body, vars);
  return sendTransactionalEmail({ from: FROM, replyTo: REPLY_TO, to: opts.sender.email, subject: `[Test] ${renderText(opts.subject, vars)}`, html: toHtml(text), text });
}

/** Tells the programme inbox, and the centre's owner, that a centre has asked to join. */
export async function notifyEnquiry(opts: { to: string[]; centre: string; lines: string[]; subject?: string }) {
  const text = opts.subject
    ? `${opts.lines.join("\n")}\n\n${BASE_URL}/admin/cadre-internships`
    : `A centre has asked about joining the nurse internship placement.\n\n${opts.lines.join("\n")}\n\nThe centre is now In conversation on ${BASE_URL}/admin/cadre-internships`;
  for (const to of [...new Set(opts.to)]) {
    await sendTransactionalEmail({ from: FROM, to, subject: opts.subject ?? `Internship centre enquiry: ${opts.centre}`, html: toHtml(text), text }).catch(() => null);
  }
}
