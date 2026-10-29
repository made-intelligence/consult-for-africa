/**
 * The fit request: what a client tells us makes the right person for a role.
 *
 * One form per client, one section per open role, reached by a link that needs
 * no login (the token is derived from the auth secret and the org id, so there
 * is nothing to store). The answers land on CadreMandate.fitProfile and do two
 * jobs: the questions the client wants asked are put to every applicant, and
 * the rest is the rubric the applicant is scored against.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

export function fitToken(orgId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  const sig = createHmac("sha256", secret).update(`fit-v1:${orgId}`).digest("base64url").slice(0, 22);
  return `${orgId}.${sig}`;
}

/** The org id the token names, or null when it does not check out. */
export function orgFromFitToken(token: string): string | null {
  const orgId = token.split(".")[0];
  if (!orgId) return null;
  const expected = Buffer.from(fitToken(orgId));
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected) ? orgId : null;
}

/** Asked once and applied to every role, since it is the same answer for each. */
export const SHARED_FIELDS = [
  { key: "relocation", label: "What do you offer someone moving from Nigeria?", hint: "Work permit sponsorship, flights, housing for the first months, help with schools. Whatever applies.", rows: 3 },
  { key: "process", label: "What happens after we put someone forward?", hint: "For example: a video call with you, then a call with the CEO, then an offer. And how long it usually takes.", rows: 3 },
] as const;

export const ROLE_FIELDS = [
  { key: "mustHave", label: "What must this person have?", hint: "The things you would not compromise on. Clinical skills, experience, the way they work.", rows: 4 },
  { key: "dealBreakers", label: "What would rule someone out?", hint: "Anything that would make you say no, however good the CV.", rows: 3 },
  { key: "standOut", label: "What would make someone stand out?", hint: "What your best hire in this kind of role had that others did not.", rows: 3 },
  { key: "pay", label: "What is the pay?", hint: "The retainer, salary or sessional rate, and the revenue share where there is one. A range is fine. It stays with us unless you say we can share it.", rows: 2 },
  { key: "questions", label: "What would you ask every candidate?", hint: "One per line. We put these to each applicant and score their answers.", rows: 4 },
] as const;

export type SharedKey = (typeof SHARED_FIELDS)[number]["key"];
export type RoleKey = (typeof ROLE_FIELDS)[number]["key"];

export const fitProfileSchema = z.object({
  relocation: z.string().max(2000).default(""),
  process: z.string().max(2000).default(""),
  mustHave: z.string().max(3000).default(""),
  dealBreakers: z.string().max(3000).default(""),
  standOut: z.string().max(3000).default(""),
  pay: z.string().max(1000).default(""),
  questions: z.string().max(2000).default(""),
  payShareable: z.boolean().default(false),
  answeredBy: z.string().max(120).default(""),
  termsAcceptedBy: z.string().max(120).optional(),
  termsAcceptedAt: z.string().optional(),
  termsVersion: z.string().optional(),
  feeOption: z.enum(["fixed", "percent"]).optional(),
});

export type FitProfile = z.infer<typeof fitProfileSchema>;

export function readFitProfile(raw: unknown): FitProfile | null {
  const parsed = fitProfileSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** The client's questions for applicants, one per line, capped so the form stays short. */
export function candidateQuestions(fit: FitProfile | null): string[] {
  if (!fit?.questions) return [];
  return fit.questions
    .split("\n")
    .map((q) => q.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
    .filter((q) => q.length > 3)
    .slice(0, 5);
}
