import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendCadreEmail } from "@/lib/cadreEmail";
import { logAudit } from "@/lib/audit";
import { greetingFor } from "@/lib/cadreSalutation";
import { buildKey, generateUploadUrl, getPublicUrl } from "@/lib/r2";

/**
 * Asking an applicant for a CV, and taking it without a login.
 *
 * Most applicants came in through express apply, which creates a record with no
 * password. Sending them to the portal's CV upload meant sending them to a login
 * they do not have. The link here carries a signed token instead, which is good
 * for one thing only: putting a CV on that one record.
 *
 * The key is derived from CADRE_PORTAL_SECRET with a purpose suffix, so this
 * token can never pass as a session cookie, and a session cookie can never pass
 * as this.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://consultforafrica.com";
const TOKEN_DAYS = 30;
/** Someone asked inside this window is not asked again by a repeat click. */
const RESEND_AFTER_DAYS = 7;
const SEND_DELAY_MS = 250;

/** Roles still being filled. A CV is no use to a role that has closed. */
export const LIVE_MANDATE_STATUSES = [
  "OPEN",
  "SOURCING",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFER_EXTENDED",
] as const;

export const CV_REQUEST_ENTITY = "CadreCvRequest";

function key(): string {
  const s = process.env.CADRE_PORTAL_SECRET;
  if (!s) throw new Error("CADRE_PORTAL_SECRET environment variable is required");
  return `${s}:cv-upload`;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", key()).update(payload).digest("base64url");
}

export function signCvToken(professionalId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_DAYS * 24 * 60 * 60;
  const payload = `${professionalId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** The professional id the token was issued for, or null. */
export function verifyCvToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const expected = sign(`${id}.${exp}`);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
  return id;
}

export function cvUploadUrl(professionalId: string): string {
  return `${BASE_URL}/oncadre/cv/${signCvToken(professionalId)}`;
}

export const CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
export const CV_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Store the file and point the record at it. Returns an error message for the
 * person, or null on success.
 */
export async function storeCv(professionalId: string, file: File): Promise<string | null> {
  if (!CV_TYPES.includes(file.type)) return "Please upload a PDF or Word document.";
  if (file.size > CV_MAX_BYTES) return "The file must be under 10MB.";
  if (file.size === 0) return "That file is empty.";

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectKey = buildKey("cvs", file.name || "cv.pdf");
  const uploadUrl = await generateUploadUrl(objectKey, file.type, 600, buffer.length);
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: buffer,
  });
  if (!put.ok) {
    console.error(`[cv-request] R2 PUT failed for ${professionalId}: ${put.status}`);
    return "We could not save the file. Please try again.";
  }

  await prisma.cadreProfessional.update({
    where: { id: professionalId },
    data: { cvFileUrl: await getPublicUrl(objectKey) },
  });
  return null;
}

/**
 * Applicants without a CV on file, across live roles or on one role, each with
 * the roles they applied for. Only people who applied: someone the matcher
 * surfaced has not asked us for anything, and a CV request would be the first
 * they hear of the role.
 */
export async function applicantsWithoutCv(mandateId?: string) {
  const matches = await prisma.cadreMandateMatch.findMany({
    where: {
      source: "APPLIED",
      professional: { cvFileUrl: null },
      mandate: mandateId
        ? { id: mandateId }
        : { status: { in: [...LIVE_MANDATE_STATUSES] } },
    },
    select: {
      mandate: { select: { title: true } },
      professional: {
        select: { id: true, email: true, firstName: true, lastName: true, cadre: true },
      },
    },
  });

  const byPerson = new Map<
    string,
    { professional: (typeof matches)[number]["professional"]; roles: string[] }
  >();
  for (const m of matches) {
    const entry = byPerson.get(m.professional.id) ?? { professional: m.professional, roles: [] };
    entry.roles.push(m.mandate.title);
    byPerson.set(m.professional.id, entry);
  }
  return [...byPerson.values()];
}

export interface CvRequestResult {
  eligible: number;
  sent: number;
  failed: number;
  skippedSuppressed: number;
  skippedRecent: number;
}

export async function sendCvRequests({
  mandateId,
  userId,
}: {
  mandateId?: string;
  userId: string;
}): Promise<CvRequestResult> {
  const people = await applicantsWithoutCv(mandateId);
  const result: CvRequestResult = {
    eligible: people.length,
    sent: 0,
    failed: 0,
    skippedSuppressed: 0,
    skippedRecent: 0,
  };
  if (people.length === 0) return result;

  const emails = people.map((p) => p.professional.email.toLowerCase());
  const suppressed = new Set(
    (
      await prisma.communicationSuppression.findMany({
        where: {
          email: { in: emails, mode: "insensitive" },
          OR: [{ channel: "EMAIL" }, { channel: null }],
        },
        select: { email: true },
      })
    )
      .map((s) => s.email?.toLowerCase())
      .filter((e): e is string => !!e),
  );

  const since = new Date(Date.now() - RESEND_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const recent = new Set(
    (
      await prisma.auditLog.findMany({
        where: {
          entityType: CV_REQUEST_ENTITY,
          entityId: { in: people.map((p) => p.professional.id) },
          createdAt: { gte: since },
        },
        select: { entityId: true },
      })
    ).map((a) => a.entityId),
  );

  for (const { professional: pro, roles } of people) {
    if (suppressed.has(pro.email.toLowerCase())) {
      result.skippedSuppressed++;
      continue;
    }
    if (recent.has(pro.id)) {
      result.skippedRecent++;
      continue;
    }

    const roleText =
      roles.length === 1
        ? `the ${roles[0]} role`
        : `${roles.length} roles (${roles.join("; ")})`;

    try {
      await sendCadreEmail({
        to: pro.email,
        subject: "Your CadreHealth application: please send your CV",
        heading: `Dear ${greetingFor(pro)}`,
        body: `Thank you for applying for ${roleText}. The hiring team reviews every application with a CV, and we do not yet have yours. Please upload it using the button below. It takes a minute and you do not need to sign in.`,
        ctaText: "Upload your CV",
        ctaHref: cvUploadUrl(pro.id),
        footer: `PDF or Word, up to 10MB. The link works for ${TOKEN_DAYS} days.`,
      });
      result.sent++;
      await logAudit({
        userId,
        action: "CREATE",
        entityType: CV_REQUEST_ENTITY,
        entityId: pro.id,
        entityName: `CV requested from ${pro.email}`,
        details: { roles, mandateId: mandateId ?? null },
      });
    } catch (err) {
      result.failed++;
      console.error(`[cv-request] failed for ${pro.email}:`, err);
    }

    await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
  }

  return result;
}
