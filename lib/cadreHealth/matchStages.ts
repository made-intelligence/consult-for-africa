/**
 * The hiring pipeline, defined once.
 *
 * These values previously lived in three places that drifted apart: the allow
 * list in the employer PATCH route, the dropdown in the employer UI, and the
 * apply routes. The apply route wrote "APPLIED", which appeared in none of the
 * others, so every application made through the portal rendered to the employer
 * as "Matched" and was silently rewritten the moment anyone touched the control.
 *
 * Anything that reads or writes CadreMandateMatch.status imports from here.
 */

export type CadreMatchStage =
  | "NEW"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "OFFERED"
  | "PLACED"
  | "REJECTED"
  | "WITHDRAWN";

export interface StageDefinition {
  value: CadreMatchStage;
  label: string;
  /** What the employer is being told, in one line, on the pipeline board. */
  meaning: string;
  bg: string;
  color: string;
  /** Stages that represent a decision, so the board can stop counting them as live. */
  terminal: boolean;
}

export const MATCH_STAGES: StageDefinition[] = [
  {
    value: "NEW",
    label: "New",
    meaning: "Not yet looked at",
    bg: "rgba(59,130,246,0.08)",
    color: "#2563EB",
    terminal: false,
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
    meaning: "Being read",
    bg: "rgba(107,114,128,0.08)",
    color: "#4B5563",
    terminal: false,
  },
  {
    value: "SHORTLISTED",
    label: "Shortlisted",
    meaning: "Through to the next round",
    bg: "rgba(16,185,129,0.08)",
    color: "#059669",
    terminal: false,
  },
  {
    value: "INTERVIEWING",
    label: "Interviewing",
    meaning: "Meeting arranged or held",
    bg: "rgba(245,158,11,0.10)",
    color: "#D97706",
    terminal: false,
  },
  {
    value: "OFFERED",
    label: "Offered",
    meaning: "Offer with the candidate",
    bg: "rgba(212,175,55,0.14)",
    color: "#B8941E",
    terminal: false,
  },
  {
    value: "PLACED",
    label: "Placed",
    meaning: "Accepted and joining",
    bg: "rgba(99,102,241,0.10)",
    color: "#4F46E5",
    terminal: true,
  },
  {
    value: "REJECTED",
    label: "Not proceeding",
    meaning: "You decided against",
    bg: "rgba(239,68,68,0.07)",
    color: "#DC2626",
    terminal: true,
  },
  {
    value: "WITHDRAWN",
    label: "Withdrawn",
    meaning: "They stepped back",
    bg: "rgba(107,114,128,0.08)",
    color: "#6B7280",
    terminal: true,
  },
];

export const MATCH_STAGE_VALUES: CadreMatchStage[] = MATCH_STAGES.map((s) => s.value);

const BY_VALUE = new Map(MATCH_STAGES.map((s) => [s.value, s]));

export function isMatchStage(value: unknown): value is CadreMatchStage {
  return typeof value === "string" && BY_VALUE.has(value as CadreMatchStage);
}

/**
 * Never throws and never renders a raw enum name at a hospital. A value written
 * before this module existed falls back to New rather than blanking the row.
 */
export function stageFor(value: string | null | undefined): StageDefinition {
  return BY_VALUE.get(value as CadreMatchStage) ?? MATCH_STAGES[0];
}

/**
 * The moves offered from a given stage, so the board shows buttons rather than a
 * dropdown of every state a candidate could theoretically be in. Backwards moves
 * are deliberately allowed: hiring goes backwards, and a locked pipeline just
 * gets worked around in a spreadsheet.
 */
export function nextStages(current: string | null | undefined): StageDefinition[] {
  const stage = stageFor(current).value;
  const forward: Record<CadreMatchStage, CadreMatchStage[]> = {
    NEW: ["REVIEWING", "SHORTLISTED", "REJECTED"],
    REVIEWING: ["SHORTLISTED", "INTERVIEWING", "REJECTED"],
    SHORTLISTED: ["INTERVIEWING", "REJECTED"],
    INTERVIEWING: ["OFFERED", "REJECTED"],
    OFFERED: ["PLACED", "REJECTED", "WITHDRAWN"],
    PLACED: ["WITHDRAWN"],
    REJECTED: ["REVIEWING"],
    WITHDRAWN: ["REVIEWING"],
  };
  return forward[stage].map((v) => BY_VALUE.get(v)!).filter(Boolean);
}

/** How the candidate arrived, and what the employer owes them because of it. */
export const MATCH_SOURCES = {
  APPLIED: {
    label: "Applied",
    /** Applicants are owed an answer; this is what the board counts as overdue. */
    obligation: "Owed a reply",
  },
  SOURCED: {
    label: "Sourced",
    obligation: "Not yet approached",
  },
  INVITED: {
    label: "Accepted contact",
    obligation: "Agreed to be approached",
  },
} as const;

export type CadreMatchSourceValue = keyof typeof MATCH_SOURCES;

/** An applicant waiting longer than this is flagged on the dashboard. */
export const REPLY_OVERDUE_DAYS = 7;

/**
 * The instant before which an unanswered application counts as overdue.
 *
 * A function rather than a value read inline: the dashboard is a server
 * component, and reading the clock in a render body is flagged as impure even
 * where it happens to be safe.
 */
export function replyOverdueCutoff(now: number = Date.now()): Date {
  return new Date(now - REPLY_OVERDUE_DAYS * 24 * 60 * 60 * 1000);
}
