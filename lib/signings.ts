/**
 * Provider signings: the rules behind the signing desk.
 *
 * Built for Aman HMO's Lagos sprint (150 SLAs signed, 300 needed, standard
 * tariff, no negotiation), where most of the work is chasing agreements a
 * hospital already holds. In most Lagos private hospitals the MD or owner
 * signs while the agreement sits with an admin officer, so the cadence aims
 * at the signatory and every row carries who that is.
 *
 * Two things move without anybody remembering to move them: the next human
 * step (call, WhatsApp, visit, escalate) after an SLA goes out, and the
 * automatic email reminder with the provider's own return link.
 */
import { createHash, randomBytes } from "node:crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { ProviderSigningStage, SigningProgramme } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { r2Client } from "@/lib/r2";
import { sendViaZeptoMail } from "@/lib/zeptomail";

export const STAGES: ProviderSigningStage[] = [
  "TARGET",
  "CONTACTED",
  "INTERESTED",
  "SLA_SENT",
  "SIGNED",
  "DOCS_COMPLETE",
  "WITH_CLIENT",
  "PARKED",
];

export const STAGE_LABELS: Record<ProviderSigningStage, string> = {
  TARGET: "Target",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  SLA_SENT: "SLA sent",
  SIGNED: "SLA signed",
  DOCS_COMPLETE: "Docs complete",
  WITH_CLIENT: "With client",
  PARKED: "Parked",
};

/** Stages that count as a signature. A verbal yes is not one. */
export const SIGNED_STAGES: ProviderSigningStage[] = ["SIGNED", "DOCS_COMPLETE", "WITH_CLIENT"];
export const isSigned = (s: ProviderSigningStage) => SIGNED_STAGES.includes(s);
export const isClosed = (s: ProviderSigningStage) => isSigned(s) || s === "PARKED";

/** Contact kinds a person logs. AUTO_CHASE, STAGE and UPLOAD are the system's. */
export const CONTACT_KINDS = ["CALL", "EMAIL", "WHATSAPP", "VISIT"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

/**
 * The human chase after an SLA goes out, in days from sending. The automatic
 * email runs alongside it; this is the part only a person can do.
 */
export const CADENCE: { day: number; action: string }[] = [
  { day: 2, action: "Call the admin: has the MD seen it?" },
  { day: 3, action: "WhatsApp the MD: signing options and a fresh copy" },
  { day: 5, action: "Call the MD: what is stopping them? Log it word for word" },
  { day: 6, action: "Visit to collect the signature" },
  { day: 8, action: "Pass to Gidado to escalate or park" },
];

const DAY = 24 * 60 * 60 * 1000;

/** Lagos is UTC+1 all year, so a fixed offset is exact. */
export function lagosDayStart(d: Date = new Date()): Date {
  const shifted = new Date(d.getTime() + 60 * 60 * 1000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - 60 * 60 * 1000);
}

/** A date that lands on a weekend moves to the Monday, at 9am Lagos. */
export function workingDay(d: Date): Date {
  const start = lagosDayStart(d);
  const dow = new Date(start.getTime() + 60 * 60 * 1000).getUTCDay();
  const shift = dow === 6 ? 2 : dow === 0 ? 1 : 0;
  return new Date(start.getTime() + shift * DAY + 9 * 60 * 60 * 1000);
}

export function cadenceAt(slaSentAt: Date, step: number): { nextAction: string; nextActionAt: Date } | null {
  const c = CADENCE[step];
  if (!c) return null;
  return { nextAction: c.action, nextActionAt: workingDay(new Date(slaSentAt.getTime() + c.day * DAY)) };
}

/** What a test send is matched on: the exact wording, so an edit needs a new test. */
export const templateHash = (subject: string, body: string) =>
  createHash("sha256").update(`${subject}\n---\n${body}`).digest("hex").slice(0, 24);

export const newReturnToken = () => randomBytes(18).toString("base64url");

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.consultforafrica.com").replace(/\/$/, "");
}
export const returnLink = (token: string) => `${siteUrl()}/sla/${token}`;

// ─── Access ────────────────────────────────────────────────────────────────

const ALWAYS = ["ADMIN", "PARTNER", "DIRECTOR", "ASSOCIATE_DIRECTOR"];

/**
 * Who may work a programme: the engagement's manager, anyone actively staffed
 * on it, and the firm's senior roles. Leads (manager and senior roles) can
 * change settings and switch the automatic chase on.
 */
export async function programmeAccess(
  programmeId: string,
  user: { id: string; role: string },
): Promise<{ programme: SigningProgramme; canLead: boolean } | null> {
  const programme = await prisma.signingProgramme.findUnique({
    where: { id: programmeId },
    include: {
      engagement: {
        select: {
          engagementManagerId: true,
          assignments: { where: { consultantId: user.id, status: "ACTIVE" }, select: { id: true } },
        },
      },
    },
  });
  if (!programme) return null;
  const isManager = programme.engagement.engagementManagerId === user.id;
  const senior = ALWAYS.includes(user.role);
  if (!isManager && !senior && programme.engagement.assignments.length === 0) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { engagement: _e, ...rest } = programme;
  return { programme: rest, canLead: isManager || senior };
}

export async function accessibleProgrammes(user: { id: string; role: string }) {
  const senior = ALWAYS.includes(user.role);
  return prisma.signingProgramme.findMany({
    where: senior
      ? {}
      : {
          engagement: {
            OR: [
              { engagementManagerId: user.id },
              { assignments: { some: { consultantId: user.id, status: "ACTIVE" } } },
            ],
          },
        },
    select: { id: true, name: true, target: true, baselineSigned: true, deadline: true },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Email ─────────────────────────────────────────────────────────────────

export interface MergeFields {
  contact: string;
  facility: string;
  sender: string;
  link: string;
}

export function mergeFieldsFor(
  p: { facility: string; contactName: string | null; signatoryName: string | null; returnToken: string },
  senderName: string,
): MergeFields {
  return {
    contact: p.signatoryName || p.contactName || "Sir or Madam",
    facility: p.facility,
    sender: senderName,
    link: returnLink(p.returnToken),
  };
}

export function render(template: string, f: MergeFields): string {
  return template.replace(/\{\{\s*(contact|facility|sender|link)\s*\}\}/g, (_, k: keyof MergeFields) => f[k]);
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function toHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((para) =>
      `<p style="margin:0 0 14px;font:15px/1.55 Arial,sans-serif;color:#1f2937">${escapeHtml(para)
        .replace(/\n/g, "<br>")
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0B3C5D">$1</a>')}</p>`,
    )
    .join("");
}

/** The agreement as an attachment, read once per send batch. */
export async function loadSlaAttachment(programme: Pick<SigningProgramme, "slaFileKey" | "slaFileName">) {
  if (!programme.slaFileKey) return null;
  const obj = await r2Client.send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME || "cfa-uploads", Key: programme.slaFileKey }),
  );
  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes || bytes.length > 8 * 1024 * 1024) return null;
  return {
    name: programme.slaFileName || "Service Level Agreement.pdf",
    mimeType: obj.ContentType || "application/pdf",
    content: Buffer.from(bytes).toString("base64"),
  };
}

export async function sendProviderEmail(input: {
  to: string;
  toName?: string | null;
  subject: string;
  text: string;
  senderName: string;
  replyTo?: { email: string; name?: string | null } | null;
  attachment?: { name: string; mimeType: string; content: string } | null;
  tag: string;
}) {
  return sendViaZeptoMail({
    from: { email: "hello@consultforafrica.com", name: input.senderName },
    to: [{ email: input.to, name: input.toName ?? undefined }],
    replyTo: input.replyTo ? { email: input.replyTo.email, name: input.replyTo.name ?? undefined } : undefined,
    subject: input.subject,
    textbody: input.text,
    htmlbody: toHtml(input.text),
    attachments: input.attachment ? [input.attachment] : undefined,
    trackingTag: input.tag,
  });
}

export async function suppressedEmails(emails: string[]): Promise<Set<string>> {
  if (!emails.length) return new Set();
  const rows = await prisma.communicationSuppression.findMany({
    where: { email: { in: emails.map((e) => e.toLowerCase()) } },
    select: { email: true },
  });
  return new Set(rows.map((r) => (r.email ?? "").toLowerCase()));
}

export const providerEmail = (p: { signatoryEmail: string | null; email: string | null }) =>
  (p.signatoryEmail || p.email || "").trim() || null;

/** WhatsApp wants an international number with no plus. Nigerian 0803... becomes 234803... */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let d = phone.replace(/[^0-9+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("0")) d = `234${d.slice(1)}`;
  return d.length >= 10 ? d : null;
}

// ─── Targets and the daily numbers ─────────────────────────────────────────

export interface WeekTarget {
  start: string;
  target: number;
}

export function weekTargets(p: Pick<SigningProgramme, "weeklyTargets">): WeekTarget[] {
  return Array.isArray(p.weeklyTargets) ? (p.weeklyTargets as unknown as WeekTarget[]) : [];
}

/** The week that contains `now`, from the programme's own Mondays. */
export function currentWeek(p: Pick<SigningProgramme, "weeklyTargets">, now = new Date()) {
  const weeks = weekTargets(p);
  for (let i = weeks.length - 1; i >= 0; i--) {
    const start = new Date(`${weeks[i].start}T00:00:00+01:00`);
    if (now >= start) {
      const end = i + 1 < weeks.length ? new Date(`${weeks[i + 1].start}T00:00:00+01:00`) : new Date(start.getTime() + 7 * DAY);
      return { ...weeks[i], startAt: start, endAt: end, index: i + 1 };
    }
  }
  return null;
}

export const dayLabel = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
