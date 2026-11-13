/**
 * A nurse or midwife who signed up on Mezo's /for-nurses form, opened on
 * CadreHealth too.
 *
 * One form, two accounts: Mezo opens the nurse's working profile (home care,
 * locums, surgical firms) and asks us, over the same signed partner link the
 * facility hand-off uses, to open the CadreHealth career profile (jobs,
 * salary map, CPD). We hand back a set-password link and Mezo puts it in the
 * one welcome email the nurse receives. Nobody is verified by this call: the
 * NMCN check stays where it always is.
 *
 * The link is for that email only. Anyone can type someone else's email into
 * a public form, so the link never goes anywhere but the address it was made
 * for, and an account that already has a password is never touched.
 */
import crypto from "crypto";
import { z } from "zod";
import { getSubSpecialties } from "@/lib/cadreHealth/cadres";

/** How long the set-password link works. Matches Mezo's claim link, which travels in the same email. */
export const SET_PASSWORD_TTL_DAYS = 30;

const text = (max: number) => z.string().trim().max(max);

export const NurseRegistrationSchema = z.object({
  /** Mezo's Doctor id, for tracing one person across both systems. */
  mezoRef: text(64).min(1),
  email: z.string().trim().toLowerCase().email().max(200),
  firstName: text(80).min(1),
  lastName: text(80).min(1),
  phone: text(30).optional(),
  cadre: z.enum(["NURSING", "MIDWIFERY"]),
  subSpecialty: text(100).optional(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  state: text(60).optional(),
  city: text(100).optional(),
  openTo: z.array(z.enum(["PERMANENT", "LOCUM", "INTERNATIONAL"])).max(3).default([]),
  /** Campaign tag from the link the nurse came in on (utm_source), for the recruitment report. */
  source: text(100).optional(),
});
export type NurseRegistration = z.infer<typeof NurseRegistrationSchema>;

export type ExistingProfessional = {
  id: string;
  passwordHash: string | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  phone: string | null;
  state: string | null;
  city: string | null;
  subSpecialty: string | null;
  openTo: string[];
};

/**
 * What to do for one registration. Three cases, one per state of the email:
 * - no profile: CREATE one, with a set-password link;
 * - a profile nobody has set a password on (an import or express lead): INVITE,
 *   filling only blanks and keeping any unexpired link so an earlier email still works;
 * - a profile with a password: EXISTING, left exactly as it is.
 */
export type NursePlan =
  | { kind: "CREATE"; token: string }
  | { kind: "INVITE"; token: string; fill: Partial<Pick<ExistingProfessional, "phone" | "state" | "city" | "subSpecialty">> & { openTo?: NurseRegistration["openTo"] } }
  | { kind: "EXISTING" };

export function planNurseRegistration(
  existing: ExistingProfessional | null,
  input: NurseRegistration,
  now: Date = new Date(),
  newToken: () => string = randomToken,
): NursePlan {
  if (!existing) return { kind: "CREATE", token: newToken() };
  if (existing.passwordHash) return { kind: "EXISTING" };

  const live =
    existing.passwordResetToken && existing.passwordResetExpiry && existing.passwordResetExpiry > now
      ? existing.passwordResetToken
      : null;
  const subSpecialty = allowedSubSpecialty(input.cadre, input.subSpecialty);
  const fill: Extract<NursePlan, { kind: "INVITE" }>["fill"] = {};
  if (!existing.phone && input.phone) fill.phone = input.phone;
  if (!existing.state && input.state) fill.state = input.state;
  if (!existing.city && input.city) fill.city = input.city;
  if (!existing.subSpecialty && subSpecialty) fill.subSpecialty = subSpecialty;
  if (existing.openTo.length === 0 && input.openTo.length > 0) fill.openTo = input.openTo;
  return { kind: "INVITE", token: live ?? newToken(), fill };
}

/**
 * Only a value from the cadre's own catalogue, so the form cannot add a new
 * spelling of a specialty to a field the whole platform reads.
 */
export function allowedSubSpecialty(cadre: string, value: string | undefined): string | null {
  if (!value) return null;
  return getSubSpecialties(cadre).includes(value) ? value : null;
}

export function setPasswordExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SET_PASSWORD_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function cadreBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://consultforafrica.com").replace(/\/$/, "");
}

export function setPasswordUrl(token: string): string {
  return `${cadreBaseUrl()}/oncadre/reset-password/${token}`;
}

export function loginUrl(): string {
  return `${cadreBaseUrl()}/oncadre/login`;
}

export function referralCode(): string {
  return "CH" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
