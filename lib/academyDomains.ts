/**
 * The Academy curriculum, by domain.
 *
 * Seven domains, mutually exclusive and together the whole of what a C4A
 * consultant needs. Every track belongs to exactly one domain. Each domain
 * opens with a free foundation track carrying a taster module for every paid
 * track in that domain, so basic knowledge leads to the paid depth. The firm
 * domain is free throughout.
 *
 * TrainingTrack.category holds the domain key. Paid tracks require their
 * domain's foundation track.
 */

export type AcademyDomain = {
  key: string;
  label: string;
  /** What the domain covers, in one line, so the boundaries stay visible. */
  scope: string;
  foundation: string[];
  paid: { slug: string; level: "SPECIALIST" | "MASTER" }[];
};

export const ACADEMY_DOMAINS: AcademyDomain[] = [
  {
    key: "firm",
    label: "How C4A works",
    scope: "The firm's platform, engagement lifecycle, standards and the analyst's craft",
    foundation: ["cfa-platform-engagement", "professional-standards", "cfa-analyst"],
    paid: [],
  },
  {
    key: "method",
    label: "Consulting craft",
    scope: "Structuring problems, analysis, communication and leading engagements",
    foundation: ["core-consulting-skills"],
    paid: [{ slug: "cfa-master-consultant", level: "MASTER" }],
  },
  {
    key: "clinical",
    label: "Clinical quality and health systems",
    scope: "Clinical governance, health economics and evidence, public health systems",
    foundation: ["healthcare-fundamentals"],
    paid: [
      { slug: "clinical-governance-accreditation", level: "SPECIALIST" },
      { slug: "health-economics-mne", level: "SPECIALIST" },
      { slug: "public-sector-health-systems", level: "MASTER" },
    ],
  },
  {
    key: "finance",
    label: "Finance and payment",
    scope: "The hospital's money: its own billing, its payors, and its capital",
    foundation: ["financial-literacy-healthcare"],
    paid: [
      { slug: "revenue-cycle-excellence", level: "SPECIALIST" },
      { slug: "payor-claims-management", level: "SPECIALIST" },
      { slug: "health-deals-fundraising", level: "SPECIALIST" },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    scope: "How the hospital runs day to day: flow, systems and recovery when it fails",
    foundation: ["hospital-operations-foundations"],
    paid: [
      { slug: "lean-quality-improvement", level: "SPECIALIST" },
      { slug: "digital-health-technology", level: "SPECIALIST" },
      { slug: "hospital-turnaround-recovery", level: "SPECIALIST" },
    ],
  },
  {
    key: "people",
    label: "People and leadership",
    scope: "Workforce, recruitment, performance and leading clinical teams",
    foundation: ["people-leadership-foundations"],
    paid: [{ slug: "healthcare-hr-leadership", level: "SPECIALIST" }],
  },
  {
    key: "growth",
    label: "Growth and strategy",
    scope: "Markets, patient acquisition, new service lines and strategy",
    foundation: ["growth-foundations"],
    paid: [
      { slug: "healthcare-marketing-patients", level: "SPECIALIST" },
      { slug: "elective-service-lines", level: "SPECIALIST" },
      { slug: "strategic-advisory-growth", level: "MASTER" },
    ],
  },
];

/** Prices in naira. Reduced Oct 2026 from 35,000 and 85,000. */
export const ACADEMY_PRICES_NGN = { SPECIALIST: 15000, MASTER: 35000 } as const;

export function domainOf(trackSlug: string): AcademyDomain | undefined {
  return ACADEMY_DOMAINS.find(
    (d) => d.foundation.includes(trackSlug) || d.paid.some((p) => p.slug === trackSlug),
  );
}
