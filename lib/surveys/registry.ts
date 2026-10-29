/**
 * The survey registry.
 *
 * One declaration per survey we have ever fielded, in one place. Before this
 * existed a survey was discoverable only by reading the route that accepted it,
 * the lib that described it and the admin page that rendered it, which is why
 * eight of the surveys below had no reader at all and why nobody noticed that
 * the Mezo instrument gained five questions while it was in the field.
 *
 * This file does not replace the per-survey instrument definitions. Those stay
 * where they are (lib/haven-survey.ts, lib/osteon-survey.ts and so on) and are
 * still the source of truth for question wording. What lives here is everything
 * a reader needs that is NOT a question: who the survey belongs to, where its
 * responses are stored, whether it is still open, and what has to happen to it
 * on an erasure request.
 *
 * Adding a survey means adding an entry here. It does not mean forking a page.
 */

/** Which table the responses live in. Each has its own adapter in ./archive. */
export type SurveySource = "audit" | "medipark" | "mezo";

/**
 * Where a respondent's identity is held, which is what an NDPR erasure request
 * has to act on. Kept explicit per survey because the three stores answer it
 * differently and guessing wrong means either a failed erasure or destroyed
 * research.
 */
export type PiiLocation =
  /** Genuinely anonymous. Nothing to erase. */
  | "none"
  /** Own columns beside the payload, so contact details drop without touching the research. */
  | "columns"
  /** Held on the linked CadreProfessional, erased by erasing that record. */
  | "profile"
  /** Inside the payload. Erasure has to redact named keys. The weakest of the three. */
  | "payload";

/**
 * A change to the instrument after responses started arriving. Recorded because
 * a question added mid-field gives later respondents a question earlier ones
 * never saw, and a retired option leaves answers that cannot be placed on the
 * current scale. Both happened to the Mezo survey. Neither was recorded
 * anywhere until now, and the analysis had to rediscover it from the data.
 */
export interface InstrumentChange {
  /** ISO date the change went live. */
  date: string;
  /** What changed, in one line, for whoever reads the results later. */
  note: string;
  /** Question ids added on this date. Responses before it have no answer to them. */
  added?: string[];
  /** Option values retired. Stored answers still carry them and cannot be rescaled. */
  retiredOptions?: string[];
}

export interface SurveyDefinition {
  /** The stored `survey` value. Never changes once responses exist. */
  slug: string;
  title: string;
  /** Who it was fielded to, in their words. */
  audience: string;
  /** Client display name. Free text because not every client has a record yet. */
  client: string;
  /** Real Engagement id where one exists. Null is honest, not a placeholder. */
  engagementId: string | null;
  source: SurveySource;
  /** Public form, relative to the site root. Null for surveys behind a login. */
  formPath: string | null;
  /** An existing bespoke analysis page, where one was built. */
  readerPath: string | null;
  /** False means the respondent is named on purpose, as with board surveys. */
  anonymous: boolean;
  pii: PiiLocation;
  /** Payload keys holding identity, for `pii: "payload"`. Redacted on erasure. */
  piiKeys?: string[];
  /** Ordered oldest first. Empty means the instrument never moved under the data. */
  changes: InstrumentChange[];
}

// ---------------------------------------------------------------------------
// Haven Paediatric Centre. The only engagement whose responses were already
// tied to an engagement id on the row.
// ---------------------------------------------------------------------------
const HAVEN_ENGAGEMENT = "cmqazdnsx0002nzx3kfh8gop0";
const OSTEON_ENGAGEMENT = "cmuedemiu0002fowkes7seohj";

const HAVEN: SurveyDefinition[] = [
  {
    slug: "haven-safety-culture",
    title: "Staff safety and culture",
    audience: "All clinical and non-clinical staff",
    client: "Haven Paediatric Centre",
    engagementId: HAVEN_ENGAGEMENT,
    source: "audit",
    formPath: "/haven-audit.html",
    readerPath: "/admin/haven-survey",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "haven-patient-experience",
    title: "Patient experience",
    audience: "Parents and carers",
    client: "Haven Paediatric Centre",
    engagementId: HAVEN_ENGAGEMENT,
    source: "audit",
    formPath: "/haven-patient-survey.html",
    readerPath: "/admin/haven-survey",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "haven-leadership-instinct",
    title: "Founders' direction",
    audience: "The five founders",
    client: "Haven Paediatric Centre",
    engagementId: HAVEN_ENGAGEMENT,
    source: "audit",
    formPath: "/haven-leadership-survey.html",
    readerPath: "/admin/haven-survey",
    // Named on purpose: the board compares instincts, so anonymity would
    // destroy the point of the instrument.
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// Osteon Clinics. Four instruments, fielded, zero responses so far.
// ---------------------------------------------------------------------------
const OSTEON: SurveyDefinition[] = [
  {
    slug: "osteon-staff-culture",
    title: "Staff and safety culture",
    audience: "All staff",
    client: "Osteon Clinics",
    engagementId: OSTEON_ENGAGEMENT,
    source: "audit",
    formPath: "/osteon-staff-survey.html",
    readerPath: "/admin/osteon-survey",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "osteon-patient-experience",
    title: "Patient experience",
    audience: "Patients",
    client: "Osteon Clinics",
    engagementId: OSTEON_ENGAGEMENT,
    source: "audit",
    formPath: "/osteon-patient-survey.html",
    readerPath: "/admin/osteon-survey",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "osteon-referrer",
    title: "Referring doctors",
    audience: "Doctors who refer in",
    client: "Osteon Clinics",
    engagementId: OSTEON_ENGAGEMENT,
    source: "audit",
    formPath: "/osteon-referrer-survey.html",
    readerPath: "/admin/osteon-survey",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "osteon-leadership-direction",
    title: "Leadership direction",
    audience: "Partners and senior clinicians",
    client: "Osteon Clinics",
    engagementId: OSTEON_ENGAGEMENT,
    source: "audit",
    formPath: "/osteon-leadership-survey.html",
    readerPath: "/admin/osteon-survey",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// Dennis Ashley. The instruments are a fork of Osteon's with the wording
// changed; the machinery is identical. Recorded here so the duplication is at
// least visible while it lasts.
// ---------------------------------------------------------------------------
const DENNIS_ASHLEY: SurveyDefinition[] = [
  {
    slug: "dennis-ashley-staff-culture",
    title: "Staff and safety culture",
    audience: "All staff",
    client: "Dennis Ashley",
    engagementId: null,
    source: "audit",
    formPath: "/dennis-ashley-staff-survey.html",
    readerPath: "/admin/dennis-ashley-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "dennis-ashley-patient-experience",
    title: "Patient experience",
    audience: "Patients",
    client: "Dennis Ashley",
    engagementId: null,
    source: "audit",
    formPath: "/dennis-ashley-patient-survey.html",
    readerPath: "/admin/dennis-ashley-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "dennis-ashley-referrer",
    title: "Referring doctors",
    audience: "Doctors who refer in",
    client: "Dennis Ashley",
    engagementId: null,
    source: "audit",
    formPath: "/dennis-ashley-referrer-survey.html",
    readerPath: "/admin/dennis-ashley-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "dennis-ashley-leadership-direction",
    title: "Leadership direction",
    audience: "Leadership",
    client: "Dennis Ashley",
    engagementId: null,
    source: "audit",
    formPath: "/dennis-ashley-leadership-survey.html",
    readerPath: "/admin/dennis-ashley-audit",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// Medbury aesthetics partnership. One form, three audiences, one route.
// ---------------------------------------------------------------------------
const AESTHETICS: SurveyDefinition[] = [
  {
    slug: "aesthetics-clinical-partner",
    title: "Clinical partner",
    audience: "The clinical partner",
    client: "Medbury Healthcare Group",
    engagementId: null,
    source: "audit",
    formPath: "/aesthetics-partnership-survey.html",
    readerPath: "/admin/aesthetics-survey",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
  {
    slug: "aesthetics-capital-partner",
    title: "Capital partner",
    audience: "The capital partner",
    client: "Medbury Healthcare Group",
    engagementId: null,
    source: "audit",
    formPath: "/aesthetics-partnership-survey.html",
    readerPath: "/admin/aesthetics-survey",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
  {
    slug: "aesthetics-operating-partner",
    title: "Operating partner",
    audience: "The operating partner",
    client: "Medbury Healthcare Group",
    engagementId: null,
    source: "audit",
    formPath: "/aesthetics-partnership-survey.html",
    readerPath: "/admin/aesthetics-survey",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// The two that have their own stores.
// ---------------------------------------------------------------------------
const STANDALONE: SurveyDefinition[] = [
  {
    slug: "premium-medipark",
    title: "Premium medipark consultant demand",
    audience: "Consultants who might take sessional space",
    client: "Medbury Healthcare Group",
    engagementId: "cmsxglwnv0001f2bkxv6523hs", // Lyfe Place Abuja Medical Campus
    source: "medipark",
    formPath: "/premium-medipark-survey.html",
    readerPath: "/founder/survey",
    // The research answers are anonymous; contact details are opt-in and sit in
    // their own columns precisely so they can be erased without losing them.
    anonymous: true,
    pii: "columns",
    changes: [],
  },
  {
    slug: "mezo-private-practice",
    title: "Mezo private practice",
    audience: "CadreHealth doctors and dentists on the MDCN register",
    client: "Consult For Africa",
    engagementId: "cmo5we2u200012u3fm7an8kfx", // CadreHealth Go-to-Market and Growth
    source: "mezo",
    formPath: null, // behind the member login at /oncadre/mezo
    readerPath: "/admin/mezo-survey",
    anonymous: false,
    pii: "profile",
    changes: [
      {
        date: "2026-09-12",
        note:
          "Five questions added and the monthly fee scale rewritten. The six responses " +
          "from 10 and 11 September were never shown the added questions, and three of " +
          "them answered the monthly fee question with a commission option that no longer " +
          "exists, so those answers cannot be placed on the current scale.",
        added: [
          "takeRate",
          "ownFacility",
          "theatreAppetite",
          "facilitiesNeeded",
          "facilityIntoNetwork",
        ],
        retiredOptions: ["commission"],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Belfiore Medical. Four surveys fielded ahead of the client experience
// training. Anonymity is enforced in the route rather than only in the form:
// a respondent name is dropped on the three anonymous ones even if a tampered
// form sends it, so "anonymous" here is a property of the data, not a promise.
// ---------------------------------------------------------------------------
const BELFIORE: SurveyDefinition[] = [
  {
    slug: "belfiore-team",
    title: "The team",
    audience: "Front of house and admin",
    client: "Belfiore Medical",
    engagementId: null,
    source: "audit",
    formPath: "/belfiore-team-survey.html",
    readerPath: null,
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "belfiore-client",
    title: "Clients",
    audience: "Clients who have been treated",
    client: "Belfiore Medical",
    engagementId: null,
    source: "audit",
    formPath: "/belfiore-client-survey.html",
    readerPath: null,
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "belfiore-enquirer",
    title: "Enquirers who did not book",
    audience: "People who got in touch and did not book",
    client: "Belfiore Medical",
    engagementId: null,
    source: "audit",
    formPath: "/belfiore-enquirer-survey.html",
    readerPath: null,
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "belfiore-leadership",
    title: "Leadership view",
    audience: "Dr Rapu and the senior team",
    client: "Belfiore Medical",
    engagementId: null,
    source: "audit",
    formPath: "/belfiore-leadership-survey.html",
    readerPath: null,
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// Clearview Fertility and Hospital. Five surveys across both businesses.
// ---------------------------------------------------------------------------
const CLEARVIEW: SurveyDefinition[] = [
  {
    slug: "clearview-patient",
    title: "Patients",
    audience: "Patients who have had treatment",
    client: "Clearview Fertility",
    engagementId: null,
    source: "audit",
    formPath: "/clearview-patient-survey.html",
    readerPath: "/admin/clearview-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "clearview-enquirer",
    title: "Enquirers who did not proceed",
    audience: "People who got in touch and did not proceed",
    client: "Clearview Fertility",
    engagementId: null,
    source: "audit",
    formPath: "/clearview-enquirer-survey.html",
    readerPath: "/admin/clearview-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "clearview-staff",
    title: "Staff",
    audience: "Everyone who works in either business",
    client: "Clearview Fertility",
    engagementId: null,
    source: "audit",
    formPath: "/clearview-staff-survey.html",
    readerPath: "/admin/clearview-audit",
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "clearview-referrer",
    title: "Referring gynaecologists",
    audience: "Gynaecologists who refer in",
    client: "Clearview Fertility",
    engagementId: null,
    source: "audit",
    formPath: "/clearview-referrer-survey.html",
    readerPath: "/admin/clearview-audit",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
  {
    slug: "clearview-leadership",
    title: "Leadership view",
    audience: "Dr Ajayi and the senior team",
    client: "Clearview Fertility",
    engagementId: null,
    source: "audit",
    formPath: "/clearview-leadership-survey.html",
    readerPath: "/admin/clearview-audit",
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "name"],
    changes: [],
  },
];

// ---------------------------------------------------------------------------
// Arabella Women's Health. Four instruments fielded with the audit that starts
// on site 2 October 2026. The referrer instrument is the strategically
// important one: Arabella has no referrer list, which is itself a finding, so
// the survey is built to BUILD the list rather than to assume one exists.
// ---------------------------------------------------------------------------
const ARABELLA_ENGAGEMENT_ID = "cmumq57x50002spxkklrlzfem";

const ARABELLA: SurveyDefinition[] = [
  {
    slug: "arabella-staff-culture",
    title: "Staff and safety culture",
    audience: "All staff",
    client: "Arabella Women's Health",
    engagementId: ARABELLA_ENGAGEMENT_ID,
    source: "audit",
    formPath: "/arabella-staff-survey.html",
    readerPath: null,
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "arabella-patient-experience",
    title: "Patient experience",
    audience: "Patients seen in the last year",
    client: "Arabella Women's Health",
    engagementId: ARABELLA_ENGAGEMENT_ID,
    source: "audit",
    formPath: "/arabella-patient-survey.html",
    readerPath: null,
    anonymous: true,
    pii: "none",
    changes: [],
  },
  {
    slug: "arabella-referrer",
    title: "Referring colleagues",
    audience: "GPs, physiotherapists and diagnostic centres",
    client: "Arabella Women's Health",
    engagementId: ARABELLA_ENGAGEMENT_ID,
    source: "audit",
    formPath: "/arabella-referrer-survey.html",
    // Attributed by design. A referrer's answer is only actionable if we know
    // which referrer gave it, and the instrument also collects the names of
    // colleagues they nominate, which is how the referrer list gets built.
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "practice", "contact", "nominee1", "nominee2", "nominee3"],
    readerPath: null,
    changes: [],
  },
  {
    slug: "arabella-leadership-direction",
    title: "Leadership direction",
    audience: "Dr Chito Nwana and the senior team",
    client: "Arabella Women's Health",
    engagementId: ARABELLA_ENGAGEMENT_ID,
    source: "audit",
    formPath: "/arabella-leadership-survey.html",
    readerPath: null,
    anonymous: false,
    pii: "payload",
    piiKeys: ["respondent", "role"],
    changes: [],
  },
];

export const SURVEYS: SurveyDefinition[] = [
  ...STANDALONE,
  ...HAVEN,
  ...OSTEON,
  ...DENNIS_ASHLEY,
  ...AESTHETICS,
  ...BELFIORE,
  ...CLEARVIEW,
  ...ARABELLA,
];

export function surveyBySlug(slug: string): SurveyDefinition | undefined {
  return SURVEYS.find((s) => s.slug === slug);
}

/** Every slug stored in a given table, for the adapter that reads it. */
export function slugsForSource(source: SurveySource): string[] {
  return SURVEYS.filter((s) => s.source === source).map((s) => s.slug);
}

/** Client display name to its surveys, in registry order. */
export function surveysByClient(): { client: string; surveys: SurveyDefinition[] }[] {
  const out: { client: string; surveys: SurveyDefinition[] }[] = [];
  for (const s of SURVEYS) {
    const group = out.find((g) => g.client === s.client);
    if (group) group.surveys.push(s);
    else out.push({ client: s.client, surveys: [s] });
  }
  return out;
}

/** Which questions a response predates, given when it was submitted. */
export function questionsNotAskedAt(survey: SurveyDefinition, at: Date): string[] {
  const missing: string[] = [];
  for (const change of survey.changes) {
    if (at < new Date(change.date)) missing.push(...(change.added ?? []));
  }
  return missing;
}

/** Option values that no longer exist on the current instrument. */
export function retiredOptions(survey: SurveyDefinition): string[] {
  return survey.changes.flatMap((c) => c.retiredOptions ?? []);
}
