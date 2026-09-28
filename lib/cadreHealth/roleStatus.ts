/**
 * The life of a role, defined once.
 *
 * The employer list carried its own map of four statuses, two of which (PAUSED,
 * FILLED) are not in CadreMandateStatus at all, so the six real states it did
 * not cover fell through to the green "open" style and printed the raw enum name
 * at a hospital.
 */

export interface RoleStatusDefinition {
  label: string;
  bg: string;
  color: string;
  /** Whether the role still needs attention, which is what splits the list. */
  live: boolean;
}

export const ROLE_STATUS: Record<string, RoleStatusDefinition> = {
  OPEN: { label: "Open", bg: "rgba(16,185,129,0.08)", color: "#059669", live: true },
  SOURCING: { label: "Paused", bg: "rgba(245,158,11,0.10)", color: "#D97706", live: false },
  SHORTLISTED: { label: "Shortlisting", bg: "rgba(59,130,246,0.08)", color: "#2563EB", live: true },
  INTERVIEWING: { label: "Interviewing", bg: "rgba(245,158,11,0.10)", color: "#D97706", live: true },
  OFFER_EXTENDED: { label: "Offer out", bg: "rgba(212,175,55,0.14)", color: "#B8941E", live: true },
  PLACED: { label: "Filled", bg: "rgba(99,102,241,0.10)", color: "#4F46E5", live: false },
  CLOSED: { label: "Closed", bg: "rgba(107,114,128,0.08)", color: "#6B7280", live: false },
  CANCELLED: { label: "Cancelled", bg: "rgba(107,114,128,0.08)", color: "#6B7280", live: false },
};

export const ROLE_TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Permanent",
  LOCUM: "Locum",
  CONTRACT: "Contract",
  CONSULTING: "Consulting",
  INTERNATIONAL: "International",
};

export const ROLE_TYPE_OPTIONS = Object.entries(ROLE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const URGENCY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];
