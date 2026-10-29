/**
 * What an employer is allowed to see about a professional, and how honest the
 * product is about the difference between what someone told us and what a
 * register said about them.
 *
 * Two facts shape this module.
 *
 * First, employer search used to open every query with
 * `availability IN (ACTIVELY_LOOKING, OPEN_TO_OFFERS)`, and nothing in the
 * product ever wrote that field. It was set on 30 rows out of 10,229, so a
 * hospital that signed up searched a register of ten thousand doctors and was
 * shown thirty. Availability is now a ranking signal, never a filter: a question
 * nobody was asked should not delete someone from the product.
 *
 * Second, 9,300 of those records were imported from a register and have never
 * been claimed. They did not agree to be approached by hospitals. So search
 * shows that they exist and never releases a way to reach them: contact runs
 * through CadreContactRequest, and the answer is recorded either way so we stop
 * asking someone who has already said no.
 */

import type { CadreProfessional } from "@prisma/client";

/** How much standing the candidate has given us to show them. */
export type VisibilityTier = "OPEN" | "MEMBER" | "REGISTER";

export interface TierDefinition {
  tier: VisibilityTier;
  label: string;
  /** Said plainly, because a hospital acting on a wrong assumption wastes a week. */
  meaning: string;
  bg: string;
  color: string;
  /** Whether the employer can be handed contact details without asking first. */
  contactDirect: boolean;
  /** Ranking weight; higher sorts first. */
  weight: number;
}

export const TIERS: Record<VisibilityTier, TierDefinition> = {
  OPEN: {
    tier: "OPEN",
    label: "Open to approach",
    meaning: "Has told us they want to hear from employers",
    bg: "rgba(16,185,129,0.09)",
    color: "#059669",
    contactDirect: true,
    weight: 3,
  },
  MEMBER: {
    tier: "MEMBER",
    label: "Active member",
    meaning: "Uses CadreHealth, has not said whether they are looking",
    bg: "rgba(59,130,246,0.08)",
    color: "#2563EB",
    contactDirect: false,
    weight: 2,
  },
  REGISTER: {
    tier: "REGISTER",
    label: "On the register",
    meaning: "Listed with their regulatory body, has not claimed a profile",
    bg: "rgba(107,114,128,0.07)",
    color: "#6B7280",
    contactDirect: false,
    weight: 1,
  },
};

type TieringInput = Pick<
  CadreProfessional,
  "availability" | "lastLoginAt" | "passwordHash"
>;

export function tierFor(p: TieringInput): TierDefinition {
  if (p.availability === "ACTIVELY_LOOKING" || p.availability === "OPEN_TO_OFFERS") {
    return TIERS.OPEN;
  }
  // A claimed profile that has completed a login is a real person we can reach,
  // even if they have not answered the availability question.
  if (p.lastLoginAt || p.passwordHash) return TIERS.MEMBER;
  return TIERS.REGISTER;
}

/**
 * Whether a stated availability is old enough that repeating it would be
 * misleading. Someone who said they were looking two years ago has probably
 * settled, and a hospital should not be told otherwise in the present tense.
 */
export const AVAILABILITY_STALE_DAYS = 180;

export function availabilityIsStale(updatedAt: Date | null | undefined): boolean {
  if (!updatedAt) return false;
  const age = Date.now() - updatedAt.getTime();
  return age > AVAILABILITY_STALE_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * A claim about a candidate, with where it came from attached.
 *
 * `specialtyConfirmedAt` is set on 80 records out of the 10,183 that carry a
 * sub-specialty, so 99% of the specialties on display are what a list said about
 * someone rather than what they say about themselves. A hospital that books a
 * theatre on the strength of that deserves to know which it is reading.
 */
export interface Provenance {
  value: string;
  /** True when the professional themselves put it there. */
  confirmed: boolean;
  /** Shown on hover and under the value; never blank. */
  note: string;
}

export function specialtyProvenance(p: {
  subSpecialty: string | null;
  specialtyConfirmedAt: Date | null;
}): Provenance | null {
  if (!p.subSpecialty) return null;
  return {
    value: p.subSpecialty,
    confirmed: !!p.specialtyConfirmedAt,
    note: p.specialtyConfirmedAt
      ? "Confirmed by the professional"
      : "From the regulatory register, not yet confirmed by them",
  };
}

export function licenceProvenance(p: {
  accountStatus: string;
}): Provenance {
  const verified = p.accountStatus === "VERIFIED";
  return {
    value: verified ? "Licence verified" : "Licence not verified",
    confirmed: verified,
    note: verified
      ? "Checked against the regulatory body"
      : "We have not checked this against the regulatory body",
  };
}

/**
 * The fields employer search is allowed to select. Contact details are absent by
 * construction rather than by remembering to exclude them, so a future field
 * added to the model does not leak by default.
 *
 * Emigration readiness is deliberately not here. The applicant card used to show
 * a candidate's UK, US, Canada and Gulf readiness to a Lagos hospital, and
 * search ranked on readiness, which sorted the people most ready to leave the
 * country to the top of a domestic hiring list.
 */
export const CANDIDATE_CARD_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  cadre: true,
  subSpecialty: true,
  specialtyConfirmedAt: true,
  yearsOfExperience: true,
  currentRole: true,
  state: true,
  city: true,
  country: true,
  isDiaspora: true,
  diasporaCountry: true,
  accountStatus: true,
  availability: true,
  availabilityUpdatedAt: true,
  noticePeriodWeeks: true,
  openTo: true,
  lastLoginAt: true,
  passwordHash: true, // read only to derive the tier; never serialised
  profileCompleteness: true,
  cvFileUrl: true,
} as const;

/** The shape a `CANDIDATE_CARD_SELECT` query comes back as. */
export type CandidateCardRow = Pick<
  CadreProfessional,
  keyof typeof CANDIDATE_CARD_SELECT & keyof CadreProfessional
>;

/** What actually crosses the wire to the employer's browser. */
export interface CandidateCard {
  id: string;
  name: string;
  cadre: string;
  cadreLabel: string;
  specialty: Provenance | null;
  licence: Provenance;
  yearsOfExperience: number | null;
  currentRole: string | null;
  location: string;
  isDiaspora: boolean;
  tier: TierDefinition;
  availabilityLabel: string | null;
  availabilityStale: boolean;
  noticePeriodWeeks: number | null;
  openTo: string[];
  hasCv: boolean;
  profileCompleteness: number;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  ACTIVELY_LOOKING: "Actively looking",
  OPEN_TO_OFFERS: "Open to offers",
  DOING_LOCUM: "Doing locum work",
  NOT_LOOKING: "Not looking",
};

/**
 * Builds the card. Takes the display name from cadreSalutation rather than
 * concatenating the two name columns: the register import put titles in
 * firstName and middle names in lastName, so `${firstName} ${lastName}` renders
 * the wrong name for 28% of the cohort.
 */
export function toCandidateCard(
  row: CandidateCardRow,
  deps: {
    cadreLabel: (value: string) => string;
    displayName: (row: CandidateCardRow) => string;
  },
): CandidateCard {
  const location = row.isDiaspora
    ? row.diasporaCountry ?? row.country
    : [row.city, row.state].filter(Boolean).join(", ") || row.country;

  return {
    id: row.id,
    name: deps.displayName(row),
    cadre: row.cadre,
    cadreLabel: deps.cadreLabel(row.cadre),
    specialty: specialtyProvenance(row),
    licence: licenceProvenance(row),
    yearsOfExperience: row.yearsOfExperience,
    currentRole: row.currentRole,
    location,
    isDiaspora: row.isDiaspora,
    tier: tierFor(row),
    availabilityLabel: row.availability
      ? AVAILABILITY_LABELS[row.availability] ?? null
      : null,
    availabilityStale: availabilityIsStale(row.availabilityUpdatedAt),
    noticePeriodWeeks: row.noticePeriodWeeks,
    openTo: row.openTo ?? [],
    hasCv: !!row.cvFileUrl,
    profileCompleteness: row.profileCompleteness,
  };
}
