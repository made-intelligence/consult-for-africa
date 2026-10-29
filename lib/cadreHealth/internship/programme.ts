// ─── CadreHealth: Nurse internship placement, programme settings ───

/** The intake applications are currently taken for. */
export const CURRENT_INTAKE = "2027-H1";
export const INTAKE_LABEL = "2027 intake";

/** How many centres an applicant may rank. */
export const MAX_PREFERENCES = 5;

/**
 * The NMCN internship is for university BNSc graduates only (circular of
 * 9 Jan 2017). HND graduates from colleges of nursing do an industrial
 * attachment instead, with modalities NMCN had not finalised as of April 2026,
 * so they are not taken here yet.
 */
export const QUALIFICATIONS = [{ value: "BNSC", label: "BNSc (university degree in nursing)" }] as const;

export const QUALIFICATION_LABEL: Record<string, string> = Object.fromEntries(QUALIFICATIONS.map((q) => [q.value, q.label]));

export const STAGE_LABEL: Record<string, string> = {
  PROSPECT: "Not yet approached",
  CONTACTED: "Contacted",
  MEETING: "In conversation",
  COMMITTED: "Committed",
  DECLINED: "Declined",
};

export const MATCH_LABEL: Record<string, string> = {
  PENDING: "Awaiting the centre",
  INVITED: "Invited to interview",
  OFFERED: "Offered a place",
  ACCEPTED: "Accepted",
  DECLINED: "Not progressed",
  WITHDRAWN: "Withdrawn",
};

/**
 * The NMCN-approved internship centres in Lagos, as supplied 26 Oct 2026.
 * Seeded by scripts/seed-internship-centres.ts; the database is the authority
 * once seeded, and BD progress lives there.
 */
export const LAGOS_CENTRES: { name: string; area?: string; ownership: string }[] = [
  { name: "Kelina Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "Euracare Multi-Specialist Hospital", area: "Victoria Island", ownership: "PRIVATE" },
  { name: "Vedic Lifecare Hospital", area: "Lekki", ownership: "PRIVATE" },
  { name: "Evercare Hospital Lekki", area: "Lekki", ownership: "PRIVATE" },
  { name: "The Health Arena", area: "Lagos", ownership: "PRIVATE" },
  { name: "Ave Maria Hospital (Headquarters)", area: "Lagos", ownership: "PRIVATE" },
  { name: "Anna Maria Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "Etta Atlantic Memorial Hospital", area: "Lekki", ownership: "PRIVATE" },
  { name: "Coptic Hospital", area: "Lagos", ownership: "MISSION" },
  { name: "Healing Stripes Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "United Heart Hospital and Clinics", area: "Lagos", ownership: "PRIVATE" },
  { name: "General Hospital Odan", area: "Lagos Island", ownership: "STATE" },
  { name: "South Shore Women's and Children's Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "St Nicholas Hospital, Lagos Island", area: "Lagos Island", ownership: "PRIVATE" },
  { name: "Reddington Hospital", area: "Victoria Island", ownership: "PRIVATE" },
  { name: "Lagos Island Maternity Hospital", area: "Lagos Island", ownership: "STATE" },
  { name: "Upsillon Care Hospital, Agungi", area: "Lekki", ownership: "PRIVATE" },
  { name: "Best Care Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "Lagos State Health Service Commission", area: "Lagos (state hospitals)", ownership: "STATE" },
  { name: "Lagos University Teaching Hospital", area: "Idi-Araba", ownership: "FEDERAL" },
  { name: "Faith City Hospital", area: "Lagos", ownership: "PRIVATE" },
  { name: "The Eko Hospital", area: "Ikeja", ownership: "PRIVATE" },
  { name: "Duchess International Hospital", area: "Ikeja GRA", ownership: "PRIVATE" },
  { name: "National Orthopaedic Hospital, Igbobi", area: "Igbobi", ownership: "FEDERAL" },
  { name: "Motayo Hospital", area: "Ikeja", ownership: "PRIVATE" },
  { name: "661 NAF Hospital, Ikeja", area: "Ikeja", ownership: "MILITARY" },
  { name: "Duro Soleye Hospital", area: "Ikeja", ownership: "PRIVATE" },
  { name: "Cerba Lancet Nigeria, Victoria Island", area: "Victoria Island", ownership: "PRIVATE" },
  { name: "Outreach Signature Hospitals", area: "Lagos", ownership: "PRIVATE" },
  { name: "Ebute Metta Health Centre", area: "Ebute Metta", ownership: "STATE" },
  { name: "Police Hospital, Falomo", area: "Ikoyi", ownership: "FEDERAL" },
];

/**
 * Centres Debo approaches himself: Evercare through the chairman, Duchess as a
 * current client. Bulk email never goes to them.
 */
export const PARTNER_LED = new Set(["evercare-hospital-lekki", "duchess-international-hospital"]);

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
