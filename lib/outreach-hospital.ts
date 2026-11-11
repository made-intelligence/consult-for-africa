/**
 * The hospital's side of a sprint: its private page, what it can return, and
 * the emails that bring it back to the page.
 *
 * Every hospital is engaged through the platform from the first message to
 * the end: an introduction with its own link, the page where it says yes and
 * names who signs, the agreement to download, the signed copy and documents
 * returned from a phone, the review, and the hand-over. Each of those lands on
 * the desk as a touch, so callers only step in where a hospital stalls.
 *
 * Files are private. The bucket has a public domain, so nothing here ever
 * builds a public URL: keys are 256 random bits with no filename in them, and
 * staff read files back through a five-minute signed link behind sign-in.
 */
import { createHash, randomBytes } from "node:crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl, r2Client } from "@/lib/r2";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { addWorkingDays, CHASE, forward, type Stage } from "@/lib/outreach";

export const SITE = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.consultforafrica.com").replace(/\/$/, "");
export const hospitalLink = (token: string) => `${SITE}/sign/${token}`;
export const newToken = () => randomBytes(32).toString("base64url");
export const isToken = (t: string) => /^[A-Za-z0-9_-]{40,50}$/.test(t);

/** A private storage key: no filename, nothing to guess. */
export const privateKey = (sprintId: string) => `sprints/${sprintId}/${randomBytes(32).toString("hex")}`;
export const viewUrl = (key: string) => generateDownloadUrl(key, 300);

export const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"] as const;
export const MAX_FILE = 15 * 1024 * 1024;

/** The hospital's link, made the first time anyone needs it. */
export async function ensureToken(targetId: string): Promise<string> {
  const t = await prisma.sprintTarget.findUniqueOrThrow({ where: { id: targetId }, select: { token: true } });
  if (t.token) return t.token;
  const token = newToken();
  await prisma.sprintTarget.update({ where: { id: targetId }, data: { token } });
  return token;
}

// ---------------------------------------------------------------- emails

export type EmailKind = "intro" | "sla" | "chase";
export const EMAIL_LABELS: Record<EmailKind, string> = {
  intro: "Introduction",
  sla: "The agreement",
  chase: "Reminder",
};

/**
 * Plain text, under 120 words, from a named person, the link doing the work.
 * No promised numbers: the brief forbids quoting anything the client has not
 * confirmed.
 */
export const DEFAULT_EMAILS: Record<EmailKind, { subject: string; body: string }> = {
  intro: {
    subject: "{{facility}}: joining {{client}}'s Lagos provider network",
    body: `Dear {{contact}},

{{client}} is building its Lagos provider network and would like {{facility}} in it. Members and corporate clients of {{client}} near you would be referred to you, on {{client}}'s standard tariff.

Everything is on one page for {{facility}}: the agreement, how to sign, and the documents needed. It works from a phone:
{{link}}

If you would rather talk it through, reply to this email.

Kind regards,
{{sender}}
For {{client}}`,
  },
  sla: {
    subject: "{{client}} provider agreement for {{facility}}",
    body: `Dear {{contact}},

Thank you for your time. As discussed, {{facility}}'s agreement with {{client}} is ready. You can download it, sign it, and send the signed copy and documents back from this page, from a phone or a computer:
{{link}}

If a scanned copy or collection in person is easier, reply and I will arrange it.

Kind regards,
{{sender}}
For {{client}}`,
  },
  chase: {
    subject: "{{facility}}: your {{client}} agreement",
    body: `Dear {{contact}},

A reminder that {{facility}}'s agreement with {{client}} is waiting for a signature. You can return the signed copy and the documents here, in a minute, from a phone:
{{link}}

If anything is holding it up, reply and I will sort it out.

Kind regards,
{{sender}}
For {{client}}`,
  },
};

/** Sent when the pack goes to the client, while automatic emails are on. Shown on the settings page. */
export const CONFIRMATION = {
  subject: "{{facility}} is in {{client}}'s provider network",
  body: `Dear {{contact}},

{{facility}}'s signed agreement and documents are now with {{client}}. Thank you for your time.

{{client}} will be in touch about onboarding.

Kind regards,
{{sender}}
For {{client}}`,
};

export function emailsFor(sprint: { emails: unknown }): Record<EmailKind, { subject: string; body: string }> {
  const saved = (sprint.emails ?? {}) as Partial<Record<EmailKind, { subject: string; body: string }>>;
  return { intro: saved.intro ?? DEFAULT_EMAILS.intro, sla: saved.sla ?? DEFAULT_EMAILS.sla, chase: saved.chase ?? DEFAULT_EMAILS.chase };
}

/** What a test send is matched on: the exact wording, so any edit needs a new test. */
export const wordingHash = (t: { subject: string; body: string }) => createHash("sha256").update(`${t.subject}\n---\n${t.body}`).digest("hex").slice(0, 24);
export const isTested = (sprint: { testedHashes: string[] }, t: { subject: string; body: string }) => sprint.testedHashes.includes(wordingHash(t));

export type Merge = { contact: string; facility: string; client: string; sender: string; link: string };
export const render = (s: string, m: Merge) => s.replace(/\{\{\s*(contact|facility|client|sender|link)\s*\}\}/g, (_, k: keyof Merge) => m[k]);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const toHtml = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font:15px/1.55 Arial,sans-serif;color:#1f2937">${esc(p).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0B3C5D">$1</a>')}</p>`)
    .join("");

/** The agreement as an attachment, when it is small enough to send. */
export async function agreementAttachment(sprint: { agreementKey: string | null; agreementName: string | null }) {
  if (!sprint.agreementKey) return null;
  const obj = await r2Client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME || "cfa-uploads", Key: sprint.agreementKey }));
  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes || bytes.length > 8 * 1024 * 1024) return null;
  return { name: sprint.agreementName || "Provider agreement.pdf", mimeType: obj.ContentType || "application/pdf", content: Buffer.from(bytes).toString("base64") };
}

export async function isSuppressed(email: string): Promise<boolean> {
  return !!(await prisma.communicationSuppression.findFirst({ where: { email: email.toLowerCase() }, select: { id: true } }));
}

export const firstName = (n: string | null | undefined) => (n ?? "").replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").trim();

/** Who a hospital email goes to: the signatory if we know them, else the facility's own address. */
export function recipientFor(t: { signatoryEmail: string | null; signatoryName: string | null; hospital: { contacts: { email: string | null; name: string | null }[] } }) {
  if (t.signatoryEmail) return { email: t.signatoryEmail, name: t.signatoryName };
  const c = t.hospital.contacts.find((x) => x.email);
  return c?.email ? { email: c.email, name: c.name } : null;
}

export async function sendHospitalEmail(o: {
  to: { email: string; name?: string | null };
  subject: string;
  text: string;
  senderName: string;
  replyTo?: { email: string; name?: string | null } | null;
  attachment?: { name: string; mimeType: string; content: string } | null;
  tag: string;
}) {
  return sendViaZeptoMail({
    from: { email: "hello@consultforafrica.com", name: o.senderName },
    to: [{ email: o.to.email, name: o.to.name ?? undefined }],
    replyTo: o.replyTo ? { email: o.replyTo.email, name: o.replyTo.name ?? undefined } : undefined,
    subject: o.subject,
    textbody: o.text,
    htmlbody: toHtml(o.text),
    attachments: o.attachment ? [o.attachment] : undefined,
    trackingTag: o.tag,
  });
}

// ---------------------------------------------------------------- what a hospital's move does

/** Labels for the touches the hospital and the system make, for the history. */
export const HOSPITAL_OUTCOMES: Record<string, string> = {
  LINK_SENT: "Sent the hospital its link",
  OPENED: "Hospital opened its page",
  HOSPITAL_YES: "Hospital said yes on its page",
  HOSPITAL_NOT_NOW: "Hospital said not now on its page",
  DOWNLOADED: "Hospital downloaded the agreement",
  RETURNED_AGREEMENT: "Hospital returned the signed agreement",
  RETURNED_DOCUMENT: "Hospital returned a document",
  PACK_READY: "Hospital says the pack is complete",
  AUTO_CHASE: "Reminder email sent",
  FILE_REJECTED: "File rejected",
  CONFIRMED: "Hospital told it is in the network",
};

type T = { id: string; stage: string; sentAt: Date | null; ownerId: string | null };

/** Move a target for something the hospital did, and leave the owner a next step for today when it needs a person. */
export async function hospitalMove(t: T, outcome: keyof typeof HOSPITAL_OUTCOMES, o: { said?: string | null; note?: string | null; stage?: Stage; nextAction?: string | null; extra?: Record<string, unknown> } = {}) {
  const now = new Date();
  const stage = o.stage ? forward(t.stage, o.stage) : (t.stage as Stage);
  await prisma.$transaction([
    prisma.sprintTouch.create({ data: { targetId: t.id, userId: null, actor: "HOSPITAL", channel: "LINK", outcome, said: o.said ?? null, note: o.note ?? null, stageFrom: t.stage, stageTo: stage } }),
    prisma.sprintTarget.update({
      where: { id: t.id },
      data: {
        stage,
        lastTouchAt: now,
        touchCount: { increment: 1 },
        ...(o.nextAction ? { nextAction: o.nextAction, nextActionAt: addWorkingDays(now, 0) } : {}),
        ...(o.extra ?? {}),
      },
    }),
  ]);
  return stage;
}

/** A hospital that downloads the agreement has it: that starts the chase, as if the SLA had been sent. */
export function chaseStartFields(now = new Date()) {
  return { sentAt: now, chaseStep: 0, nextAction: CHASE[0].action, nextActionAt: addWorkingDays(now, CHASE[0].day), escalatedAt: null };
}
