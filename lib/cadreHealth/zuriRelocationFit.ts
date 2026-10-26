/**
 * Relocation fit for the Zuri Health roles in Nairobi.
 *
 * Zuri's CEO wants people with little standing between them and the move, so
 * everyone who has applied is asked nine questions after the event, through a
 * signed link that needs no login. Seven are scored into a band Dr Ike can rank
 * on. Two are shown to Zuri and never scored: the household, so nobody is
 * ranked down for having a family, and whether a spouse is a clinician, which
 * shows as a plus because it may be a second hire. The score reads what the move depends on,
 * not who is in it.
 *
 * A flag never declines anyone. It travels with the band so Dr Ike sees the
 * reason and decides. For the same reason the block is kept out of what the
 * clinical scorer reads (lib/cadreHealth/fitScreen.ts): clinical fit and
 * relocation fit are two separate answers.
 *
 * The answers live in CadreMandateMatch.notes under a marker line, which a
 * resubmission replaces, so no schema change was needed.
 */
import { createHmac, timingSafeEqual } from "crypto";

type Option = { value: string; label: string; points: number; flag?: string };
type Question = { key: string; label: string; hint?: string; options: Option[] };

export const RELOCATION_QUESTIONS: Question[] = [
  {
    key: "start",
    label: "How soon could you start in Nairobi if offered?",
    options: [
      { value: "4w", label: "Within 4 weeks", points: 0 },
      { value: "1-3m", label: "1 to 3 months", points: 1 },
      { value: "3-6m", label: "3 to 6 months", points: 2 },
      { value: "6m+", label: "More than 6 months", points: 3, flag: "Earliest start is more than six months away" },
    ],
  },
  {
    key: "windDown",
    label: "What would you need to wind down in Nigeria?",
    hint: "Choose the one that takes longest.",
    options: [
      { value: "nothing", label: "Nothing significant", points: 0 },
      { value: "notice", label: "A salaried post with a notice period", points: 1 },
      { value: "practice", label: "A practice or clinic I own or co-own", points: 2 },
      { value: "bond", label: "A residency bond, training programme or fixed contract", points: 3, flag: "Bonded to a training programme or contract" },
    ],
  },
  {
    key: "ahead",
    label: "Would you be willing to take up the role ahead of anyone moving with you, for the first three months?",
    options: [
      { value: "yes", label: "Yes", points: 0 },
      { value: "possibly", label: "Possibly, depending on the package", points: 1 },
      { value: "no", label: "No, we would move together", points: 2 },
    ],
  },
  {
    key: "spouse",
    label: "Does the move depend on a spouse or partner finding work in Kenya?",
    options: [
      { value: "no", label: "No, or not applicable", points: 0 },
      { value: "helps", label: "It would help, but it is not a condition", points: 1 },
      { value: "condition", label: "Yes, it is a condition", points: 3, flag: "Move depends on a spouse's Kenyan work permit" },
    ],
  },
  {
    key: "school",
    label: "Are there school moves to time?",
    options: [
      { value: "none", label: "No school moves", points: 0 },
      { value: "flexible", label: "Yes, and timing is flexible", points: 1 },
      { value: "exam", label: "Yes, and a child sits WAEC, NECO, IGCSE or A levels within 12 months", points: 3, flag: "A child is in an exam year in the next 12 months" },
    ],
  },
  {
    key: "abroad",
    label: "Have you lived and worked outside Nigeria before?",
    options: [
      { value: "worked", label: "Yes, I worked abroad for a year or more", points: 0 },
      { value: "training", label: "A training post, fellowship or study abroad", points: 1 },
      { value: "first", label: "No, this would be my first move", points: 2 },
    ],
  },
  {
    key: "support",
    label: "For the first year, what support would you need from Zuri to make the move?",
    options: [
      { value: "permit", label: "Work permit and KMPDC registration only", points: 0 },
      { value: "housing-help", label: "Those, plus help finding housing", points: 1 },
      { value: "full", label: "Those, plus paid housing, flights and school fees", points: 2 },
    ],
  },
];

type PlainOption = { value: string; label: string; plus?: string };
type PlainQuestion = { key: string; label: string; hint?: string; options: PlainOption[] };

/** Shown to Zuri, never scored. A clinician spouse is a possible second hire, so it shows as a plus. */
export const SPOUSE_CLINICIAN_QUESTION: PlainQuestion = {
  key: "spouseClinician",
  label: "If a spouse or partner would move with you, are they a clinician?",
  hint: "Zuri may be able to offer them work too.",
  options: [
    { value: "na", label: "Not applicable" },
    { value: "doctor", label: "Yes, a doctor", plus: "Spouse is a doctor: a possible second hire" },
    { value: "clinician", label: "Yes, a nurse, midwife, pharmacist or other clinician", plus: "Spouse is a clinician: a possible second hire" },
    { value: "no", label: "No" },
  ],
};

/** Shown to Zuri, never scored. */
export const HOUSEHOLD_QUESTION: PlainQuestion = {
  key: "household",
  label: "Who would move with you in the first year?",
  hint: "Helps Zuri plan permits and housing. It does not count toward your result.",
  options: [
    { value: "alone", label: "Just me" },
    { value: "partner", label: "A spouse or partner" },
    { value: "family", label: "A spouse or partner and children" },
    { value: "dependants", label: "Other dependants as well" },
  ],
};

export const UNSCORED_QUESTIONS = [SPOUSE_CLINICIAN_QUESTION, HOUSEHOLD_QUESTION];

/** The order the applicant sees them in: the spouse's work, then whether they are a clinician, and household last. */
export const FORM_QUESTIONS: (Question | PlainQuestion)[] = [
  ...RELOCATION_QUESTIONS.slice(0, 4),
  SPOUSE_CLINICIAN_QUESTION,
  ...RELOCATION_QUESTIONS.slice(4),
  HOUSEHOLD_QUESTION,
];

export const NOTE_QUESTION = "Anything else that would make the move easier or harder?";

export const RELOCATION_MAX = RELOCATION_QUESTIONS.reduce((n, q) => n + Math.max(...q.options.map((o) => o.points)), 0);

export type Band = "low" | "medium" | "high";
export const BAND_LABEL: Record<Band, string> = { low: "Low baggage", medium: "Medium baggage", high: "High baggage" };

export function bandFor(score: number): Band {
  return score <= 5 ? "low" : score <= 10 ? "medium" : "high";
}

export type RelocationAnswers = Record<string, string> & { note?: string };

export interface RelocationResult {
  score: number;
  band: Band;
  flags: string[];
  plus: string[];
}

/** Null when an answer is missing or not one of the options. */
export function scoreRelocation(a: Record<string, string | undefined>): RelocationResult | null {
  let score = 0;
  const flags: string[] = [];
  for (const q of RELOCATION_QUESTIONS) {
    const opt = q.options.find((o) => o.value === a[q.key]);
    if (!opt) return null;
    score += opt.points;
    if (opt.flag) flags.push(opt.flag);
  }
  const plus: string[] = [];
  for (const q of UNSCORED_QUESTIONS) {
    const opt = q.options.find((o) => o.value === a[q.key]);
    if (!opt) return null;
    if (opt.plus) plus.push(opt.plus);
  }
  return { score, band: bandFor(score), flags, plus };
}

// ─── Storage in the match notes ───

const MARKER = "--- Relocation fit";

/** The block as it is written into the notes. Its first line is what readRelocationFit parses. */
export function relocationBlock(a: RelocationAnswers, r: RelocationResult, at = new Date()): string {
  const label = (q: { key: string; options: { value: string; label: string }[] }) => q.options.find((o) => o.value === a[q.key])?.label ?? a[q.key];
  return [
    `${MARKER} ${at.toISOString().slice(0, 10)}: ${r.score}/${RELOCATION_MAX} ${r.band} ---`,
    r.flags.length ? `Flags: ${r.flags.join("; ")}` : "Flags: none",
    r.plus.length ? `Plus: ${r.plus.join("; ")}` : "Plus: none",
    ...FORM_QUESTIONS.map((q) => `${q.label} ${label(q)}${UNSCORED_QUESTIONS.includes(q as PlainQuestion) ? " (not scored)" : ""}`),
    ...(a.note ? [`${NOTE_QUESTION} ${a.note}`] : []),
  ].join("\n");
}

/** Replaces any earlier block, so a second submission is a correction, not a duplicate. */
export function withRelocationBlock(notes: string | null, block: string): string {
  return `${withoutRelocationBlock(notes)}\n\n${block}`.trim();
}

/** The notes without the relocation block: what the clinical scorer reads. */
export function withoutRelocationBlock(notes: string | null): string {
  if (!notes) return "";
  const i = notes.indexOf(MARKER);
  return (i === -1 ? notes : notes.slice(0, i)).trimEnd();
}

export interface RelocationSummary extends RelocationResult {
  max: number;
  household: string | null;
  answeredAt: string;
}

const HEAD = /--- Relocation fit (\d{4}-\d{2}-\d{2}): (\d+)\/(\d+) (low|medium|high) ---/;

export function readRelocationFit(notes: string | null): RelocationSummary | null {
  if (!notes) return null;
  const m = notes.match(HEAD);
  if (!m) return null;
  const block = notes.slice(notes.indexOf(MARKER));
  const list = (name: string) => {
    const line = block.match(new RegExp(`^${name}: (.*)$`, "m"))?.[1] ?? "none";
    return line === "none" ? [] : line.split("; ");
  };
  const household = block.match(new RegExp(`^${HOUSEHOLD_QUESTION.label.replace(/[?]/g, "\\?")} (.*) \\(not scored\\)$`, "m"))?.[1] ?? null;
  return {
    answeredAt: m[1],
    score: Number(m[2]),
    max: Number(m[3]),
    band: m[4] as Band,
    flags: list("Flags"),
    plus: list("Plus"),
    household,
  };
}

// ─── The link ───

export function relocationToken(matchId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  const sig = createHmac("sha256", secret).update(`zuri-relocation-v1:${matchId}`).digest("base64url").slice(0, 22);
  return `${matchId}.${sig}`;
}

export function matchFromRelocationToken(token: string): string | null {
  const matchId = token.split(".")[0];
  if (!matchId) return null;
  const expected = Buffer.from(relocationToken(matchId));
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected) ? matchId : null;
}
