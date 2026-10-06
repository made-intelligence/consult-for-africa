/**
 * Haven's protocol library, cut against JCI hospital standards (8th edition).
 *
 * This supersedes the failure-mode cut in lib/haven-competency.ts as the
 * organising structure. That cut was sound for deciding what to train first and
 * it survives in `trainFirst` below. It was not a recognised framework, and if
 * the ambition is an accredited centre then the library has to be arranged the
 * way an assessor will look at it, or somebody re-sorts 31 protocols by hand
 * in year two.
 *
 * Doing it this way exposes gaps the earlier cut missed entirely, flagged as
 * NEW_FROM_JCI below: patient and family rights, consent beyond procedures,
 * falls, patient education, credentialing and privileging, and information
 * management. None of those were in my seven domains. All of them are chapters.
 *
 * TWO THINGS THIS FILE IS NOT.
 *
 * It is not the protocols. The content is Haven's, written or approved by the
 * Chief Medical Director. We supply the inventory, the structure, the training
 * loop and the chasing. A chapter here with nothing against it is the gap made
 * visible, which is the honest state for most of them today.
 *
 * It is not an accreditation plan. Mapping a library to chapters is the first
 * hour of that work, not the work. A five-bed unit with three cots is a long
 * way from a survey, and saying so is more use than implying otherwise.
 */

export type JciSection =
  | "PATIENT_CENTRED"
  | "ORGANISATION"
  | "NOT_APPLICABLE_YET";

export interface JciChapter {
  code: string;
  title: string;
  section: JciSection;
  /** What it covers, in words a ward sister would use. */
  plain: string;
  /** Protocol codes from lib/haven-competency.ts that land here. */
  existing: string[];
  /** What JCI requires that our own cut did not have at all. */
  newFromJci: string[];
  /** Where Haven stands, from the audit. Honest, not aspirational. */
  havenToday: string;
}

export const CHAPTERS: JciChapter[] = [
  {
    code: "IPSG",
    title: "International Patient Safety Goals",
    section: "PATIENT_CENTRED",
    plain: "The six things that must never go wrong: right patient, communication that holds, high-alert medicines, safe surgery, infection, falls.",
    existing: ["E2", "E1", "B1", "B2", "C1", "C2"],
    newFromJci: [
      "Falls risk assessment and prevention, which a paediatric unit still needs and we had nothing on",
      "High-alert and look-alike sound-alike medicine list, named and segregated",
      "Read-back of verbal and telephone orders, which is where communication actually fails at night",
    ],
    havenToday:
      "Hand hygiene and identification are in the competency set. There is no falls protocol, no high-alert list, and no read-back rule.",
  },
  {
    code: "ACC",
    title: "Access to Care and Continuity of Care",
    section: "PATIENT_CENTRED",
    plain: "Getting in, moving through, being referred on, and going home.",
    existing: ["D1", "D5", "G1", "G3"],
    newFromJci: [
      "Transfer out, including who accepts the patient and what travels with them",
      "A documented criteria-based admission and discharge standard for the NICU specifically",
    ],
    havenToday:
      "Admission, discharge and registration exist in the set. Transfer out is undocumented, which matters in a hospital that does not deliver babies and refers both ways.",
  },
  {
    code: "PCC",
    title: "Patient Centred Care",
    section: "PATIENT_CENTRED",
    plain: "Rights, consent, complaints, and telling families what is happening.",
    existing: ["E4", "G5"],
    newFromJci: [
      "A patient and family rights statement, displayed and explained",
      "Complaints handling, with a route that does not run through the person complained about",
      "Patient and family education, recorded: what the parent was taught and whether they understood it",
    ],
    havenToday:
      "Consent is in the set. Rights, complaints and family education are absent entirely, and this is the chapter we were furthest from without noticing.",
  },
  {
    code: "AOP",
    title: "Assessment of Patients",
    section: "PATIENT_CENTRED",
    plain: "Assessing a child properly, reassessing them, and the laboratory behind it.",
    existing: ["D1", "D3", "F3"],
    newFromJci: [
      "Defined reassessment intervals by acuity, not by habit",
      "Laboratory critical result definition and the time limit for reporting one",
    ],
    havenToday:
      "Observations and jaundice are covered. Critical results have no defined escalation time, which is a common first finding in a survey.",
  },
  {
    code: "COP",
    title: "Care of Patients",
    section: "PATIENT_CENTRED",
    plain: "Resuscitation, high-risk care, the NICU, food and pain.",
    existing: ["A1", "A2", "A3", "A4", "A5", "D2", "D4"],
    newFromJci: [
      "Pain assessment and management in children, including those who cannot report it",
      "Nutrition and feeding, which for a NICU is clinical rather than catering",
      "End of life care",
    ],
    havenToday:
      "The strongest chapter in our set, because resuscitation and NICU routines were where we started. Pain and nutrition are missing.",
  },
  {
    code: "MMU",
    title: "Medication Management and Use",
    section: "PATIENT_CENTRED",
    plain: "Every step a medicine takes, from ordering to the child.",
    existing: ["B1", "B2", "B3", "B4", "B5"],
    newFromJci: [
      "Formulary, and who may add to it",
      "Medication reconciliation on admission and discharge",
      "Reporting and learning from medication errors, non-punitively",
    ],
    havenToday:
      "Well covered operationally. The part-time pharmacist arrangement is the live exposure and this chapter is where an assessor would open it.",
  },
  {
    code: "PCI",
    title: "Prevention and Control of Infections",
    section: "ORGANISATION",
    plain: "Stopping infection moving between people.",
    existing: ["C1", "C2", "C3", "C4"],
    newFromJci: [
      "A named infection control lead and a written programme, which a hospital this size usually gives to a senior nurse as part of the role",
      "Surveillance: which infections are counted, and the number reported somewhere",
    ],
    havenToday:
      "The practices are in the set. There is no programme, no named lead and no surveillance, so nothing is counted.",
  },
  {
    code: "QPS",
    title: "Quality and Patient Safety",
    section: "ORGANISATION",
    plain: "Measuring, reporting incidents, and acting on what comes back.",
    existing: ["E5", "E3"],
    newFromJci: [
      "A sentinel event definition and a non-punitive reporting policy in writing",
      "A chosen set of quality indicators, measured and reviewed, which is what the weekly scoreboard already is",
      "Root cause analysis for serious events",
    ],
    havenToday:
      "The near miss channel and the weekly scoreboard are the beginning of this chapter and were built before anybody mentioned JCI. The policy behind them does not exist.",
  },
  {
    code: "GLD",
    title: "Governance, Leadership and Direction",
    section: "ORGANISATION",
    plain: "Who is accountable for what, and the contracts underneath it.",
    existing: ["G2", "G3"],
    newFromJci: [
      "Documented leadership structure and accountability, which is live given the board is not formally constituted",
      "Oversight of contracted services, which would cover an outsourced laboratory and consignment pharmacy",
      "A code of conduct and an ethical framework",
    ],
    havenToday:
      "Both of the big structural decisions in the strategy, outsourcing the lab and consignment stock, land in this chapter and neither has a governance wrapper yet.",
  },
  {
    code: "FMS",
    title: "Facility Management and Safety",
    section: "ORGANISATION",
    plain: "The building, the power, the gases, the waste, the equipment.",
    existing: ["F1", "F2", "F4", "C3"],
    newFromJci: [
      "Fire safety plan and drill",
      "Medical gas and oxygen supply management as a written system",
      "Hazardous materials inventory",
      "Planned preventive maintenance on medical equipment, with a schedule",
    ],
    havenToday:
      "The power and oxygen drill is in the set. Fire, gases and planned maintenance are not, and the audit could not confirm an oxygen concentrator record.",
  },
  {
    code: "SQE",
    title: "Staff Qualifications and Education",
    section: "ORGANISATION",
    plain: "Who is allowed to do what, and proving they can.",
    existing: ["A1", "A2", "A3", "B1", "D2"],
    newFromJci: [
      "Credentialing and privileging: a written record of what each clinician is permitted to do here",
      "Primary source verification of licences, meaning checked with the council rather than a photocopy",
      "A job description for every single post, which is already in the people workstream",
      "An annual performance evaluation per clinician",
    ],
    havenToday:
      "This chapter is the staff app's acknowledge, study and test loop, which is why that loop is worth building properly. Credentialing and primary source verification do not exist.",
  },
  {
    code: "MOI",
    title: "Management of Information",
    section: "ORGANISATION",
    plain: "The record: who writes it, who reads it, how long it is kept, how it is protected.",
    existing: ["E3", "E1", "G1"],
    newFromJci: [
      "Retention schedule for clinical records",
      "Who may make an entry, and an approved abbreviations list",
      "Data protection, which under the NDPA is sharper given eighteen of nineteen staff are on personal email",
    ],
    havenToday:
      "Documentation is in the set. Retention, entry rights and the personal email exposure are all open.",
  },
  {
    code: "HCT",
    title: "Health Care Technology",
    section: "ORGANISATION",
    plain: "The clinical system, telehealth and cybersecurity. New in the 8th edition.",
    existing: [],
    newFromJci: [
      "Governance of the clinical record system, including downtime procedure",
      "Cybersecurity and access control",
    ],
    havenToday:
      "Nothing. The audit notes the clinical system generates bills automatically, so there is a system to govern and no governance of it.",
  },
  {
    code: "ASC",
    title: "Anaesthesia and Surgical Care",
    section: "NOT_APPLICABLE_YET",
    plain: "Sedation and surgery.",
    existing: [],
    newFromJci: [
      "The whole chapter, from pre-anaesthesia assessment to the surgical safety checklist",
    ],
    havenToday:
      "Not yet applicable. It becomes applicable the day lever 3 opens day-case surgery, and that chapter has to exist before the first list, not after it.",
  },
];

/**
 * What changes, practically.
 *
 * Nothing about the first weeks. Resuscitation, medication and handover are
 * still what gets trained first, because that is where failure harms a child
 * and an accreditation chapter does not change that.
 */
export const TRAIN_FIRST = ["COP", "MMU", "IPSG"] as const;

export const JCI_NOTE =
  "Arranging the library by chapter costs an afternoon now and saves re-sorting it by hand in year two. It does not make Haven accreditable, and the gap between a mapped library and a survey-ready five-bed unit is years of operating evidence, not documents.";
