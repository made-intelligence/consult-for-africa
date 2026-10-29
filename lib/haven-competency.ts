/**
 * Haven Paediatric Centre: protocol competency.
 *
 * The audit found the thing that makes this necessary. Procedures exist and are
 * accessible, but most clinical staff have never been trained on them,
 * supervision is informal, and nobody checks. A protocol nobody has been tested
 * on is a document, not a standard, and in a hospital it is worse than no
 * protocol at all, because it creates the appearance of a control.
 *
 * So: for every protocol, a test. This is the inventory and the method.
 *
 * THE DISTINCTION THAT GOVERNS IT. Knowing a protocol and being able to do it
 * under pressure are different things, and only one of them can be tested with
 * questions. Where failure harms a child, competence is OBSERVED, not answered.
 * A nurse can score full marks on a neonatal resuscitation quiz and still not
 * be safe with a flat baby at three in the morning. Everything in domain A and
 * most of domain B is observed for that reason, and the cost of observing is
 * the price of the protocol being real.
 *
 * The cut below is by WHAT GOES WRONG, not by department, so that every
 * protocol lands in exactly one domain. A medication error in the NICU is a
 * medication protocol, not a NICU protocol: the failure mode is the same
 * wherever it happens, and so is the training that prevents it.
 */

export type TestMethod =
  | "OBSERVED" // watched doing it, against a checklist, by someone competent
  | "SIMULATION" // a scripted scenario run in the unit, not a classroom
  | "QUESTIONS" // short scenario questions, for knowledge that is genuinely knowledge
  | "RECORD_AUDIT"; // their own completed records sampled against the standard

export type Frequency = "ON_INDUCTION" | "QUARTERLY" | "SIX_MONTHLY" | "ANNUAL";

export interface Protocol {
  id: string;
  protocol: string;
  /** Roles that must be assessed competent. Everyone else needs awareness only. */
  mustBeCompetent: string[];
  method: TestMethod;
  frequency: Frequency;
  /** What a pass actually means. "Did the training" is not a pass. */
  passStandard: string;
}

export interface ProtocolDomain {
  id: string;
  title: string;
  /** The failure this domain exists to prevent. Keeps the cut MECE. */
  failureMode: string;
  protocols: Protocol[];
}

export const DOMAINS: ProtocolDomain[] = [
  {
    id: "A",
    title: "Emergency and resuscitation",
    failureMode: "A child deteriorates and the response is slow, wrong or unequipped.",
    protocols: [
      {
        id: "A1",
        protocol: "Crash trolley: contents, seal, and the daily check",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Finds every item without hesitation, states what is missing, signs the check correctly. Hesitation is a fail: in an arrest there is no time to look.",
      },
      {
        id: "A2",
        protocol: "Paediatric resuscitation and escalation",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "SIMULATION",
        frequency: "SIX_MONTHLY",
        passStandard: "Runs the sequence in the actual unit with the actual equipment. Calls for help at the right moment, which is the step most often missed.",
      },
      {
        id: "A3",
        protocol: "Neonatal resuscitation",
        mustBeCompetent: ["NICU nurses", "Medical officers covering the unit", "Chief Medical Director"],
        method: "SIMULATION",
        frequency: "SIX_MONTHLY",
        passStandard: "Separate from A2 and not interchangeable with it. A flat newborn is a different sequence and a different piece of equipment.",
      },
      {
        id: "A4",
        protocol: "Anaphylaxis and severe allergic reaction",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "SIMULATION",
        frequency: "ANNUAL",
        passStandard: "Adrenaline drawn at the correct paediatric dose for a stated weight, inside the time the protocol allows.",
      },
      {
        id: "A5",
        protocol: "Who to call, and when: the escalation ladder",
        mustBeCompetent: ["All clinical staff", "Front desk"],
        method: "QUESTIONS",
        frequency: "ON_INDUCTION",
        passStandard: "Names the person and the number without looking it up. Front desk included, because they are often the first to see a parent carrying a sick child in.",
      },
    ],
  },
  {
    id: "B",
    title: "Medication",
    failureMode: "The wrong drug, dose, route, patient or time, or the right one unavailable.",
    protocols: [
      {
        id: "B1",
        protocol: "Paediatric dose calculation by weight",
        mustBeCompetent: ["Every registered nurse", "Every medical officer", "Pharmacy"],
        method: "QUESTIONS",
        frequency: "SIX_MONTHLY",
        passStandard: "100 per cent. This is the one test with no partial credit, because a decimal place in paediatrics is a tenfold error.",
      },
      {
        id: "B2",
        protocol: "Administration and signing the chart at the bedside",
        mustBeCompetent: ["Every registered nurse"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Checks performed and the chart signed at the time of the dose. If signing at the bedside is impractical, that is an operations defect to fix, not a nurse to fail.",
      },
      {
        id: "B3",
        protocol: "Controlled drugs: register, custody and count",
        mustBeCompetent: ["Pharmacy", "Senior Registered Nurse", "Chief Medical Director"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Register reconciles to physical stock exactly. This one is never sampled, it is counted in full.",
      },
      {
        id: "B4",
        protocol: "Dispensing when the pharmacist is off site",
        mustBeCompetent: ["Pharmacy technicians", "Head of Admin and Operations"],
        method: "QUESTIONS",
        frequency: "QUARTERLY",
        passStandard: "States exactly what may and may not happen without the pharmacist. The audit found no rostered pharmacist on dispensing days, so until that is resolved this is the live exposure.",
      },
      {
        id: "B5",
        protocol: "Cold chain: fridge temperature log and what to do on a breach",
        mustBeCompetent: ["Pharmacy", "Every registered nurse"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "A complete log with no gaps, and a stated action for an out-of-range reading. The audit found no cold chain record at all.",
      },
    ],
  },
  {
    id: "C",
    title: "Infection prevention",
    failureMode: "Infection moves between patients, or between a patient and staff.",
    protocols: [
      {
        id: "C1",
        protocol: "Hand hygiene, at the right moments",
        mustBeCompetent: ["Everyone who touches a patient or their surroundings"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Observed unannounced during real work. Announced observation measures compliance with being watched.",
      },
      {
        id: "C2",
        protocol: "Isolation and cohorting a suspected infectious child",
        mustBeCompetent: ["Every registered nurse", "Every medical officer", "Front desk", "Attendants"],
        method: "QUESTIONS",
        frequency: "ANNUAL",
        passStandard: "Front desk included deliberately: the decision that matters most is made at the door, before anybody clinical has seen the child.",
      },
      {
        id: "C3",
        protocol: "Sharps, spillage and biohazard waste",
        mustBeCompetent: ["All clinical staff", "Attendants"],
        method: "OBSERVED",
        frequency: "ANNUAL",
        passStandard: "Disposal correct at the point of use. The audit found the waste and spillage procedures referenced but never supplied.",
      },
      {
        id: "C4",
        protocol: "Cleaning and decontamination between patients",
        mustBeCompetent: ["Attendants", "Every registered nurse"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Correct product, correct contact time. Contact time is the step almost always shortened when the unit is busy.",
      },
    ],
  },
  {
    id: "D",
    title: "Clinical care pathways",
    failureMode: "Care is given differently depending on who is on shift.",
    protocols: [
      {
        id: "D1",
        protocol: "Admission, assessment and the observation schedule",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Observations present at the stated frequency, and a documented response where they are abnormal. The second half is the one that fails.",
      },
      {
        id: "D2",
        protocol: "NICU routines: thermoregulation, feeding and monitoring",
        mustBeCompetent: ["NICU nurses", "Medical officers covering the unit"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Assessed in the unit on a real cot. Nobody works a NICU shift unsupervised before passing this.",
      },
      {
        id: "D3",
        protocol: "Jaundice assessment and phototherapy",
        mustBeCompetent: ["NICU nurses", "Every medical officer"],
        method: "QUESTIONS",
        frequency: "SIX_MONTHLY",
        passStandard: "Reads the threshold correctly against age in hours, and states when to escalate.",
      },
      {
        id: "D4",
        protocol: "Oxygen: prescribing, delivery and weaning",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "OBSERVED",
        frequency: "SIX_MONTHLY",
        passStandard: "Correct device and flow for a stated case, target saturation known. The audit could not confirm an oxygen concentrator record, so equipment availability is part of this check.",
      },
      {
        id: "D5",
        protocol: "Discharge: criteria, summary, medicines and follow up",
        mustBeCompetent: ["Every medical officer", "Senior Registered Nurse"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Summary completed on the day of discharge. Also the operational measure in the scoreboard, so this one is checked twice for two different reasons.",
      },
    ],
  },
  {
    id: "E",
    title: "Safety, record and speaking up",
    failureMode: "Something is known by one person and not by the next, or not written down at all.",
    protocols: [
      {
        id: "E1",
        protocol: "Handover, in the agreed structure",
        mustBeCompetent: ["Every registered nurse", "Every medical officer"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Observed unannounced, twice a week by the Senior Registered Nurse. This is where most harm is prevented or created.",
      },
      {
        id: "E2",
        protocol: "Patient identification before any intervention",
        mustBeCompetent: ["All clinical staff"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "Two identifiers, every time, including when the unit is busy and especially when the parent is known to the nurse.",
      },
      {
        id: "E3",
        protocol: "Documentation: written at the time, complete, attributable",
        mustBeCompetent: ["All clinical staff"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Sampled monthly with the clinical team as a learning exercise. The same three defects will recur; fixing those three beats a perfect policy.",
      },
      {
        id: "E4",
        protocol: "Consent for procedures",
        mustBeCompetent: ["Every medical officer"],
        method: "RECORD_AUDIT",
        frequency: "SIX_MONTHLY",
        passStandard: "Recorded, with who consented and their relationship to the child.",
      },
      {
        id: "E5",
        protocol: "Reporting an incident or a near miss",
        mustBeCompetent: ["Everybody, without exception"],
        method: "QUESTIONS",
        frequency: "ON_INDUCTION",
        passStandard: "Knows how to report, knows it can be anonymous, and knows nothing happens to them for it. If anyone answers otherwise, that is a finding about us, not about them.",
      },
    ],
  },
  {
    id: "F",
    title: "Equipment",
    failureMode: "A device is missing, broken, uncalibrated, or nobody present can work it.",
    protocols: [
      {
        id: "F1",
        protocol: "NICU equipment: incubator, warmer, phototherapy, monitors",
        mustBeCompetent: ["NICU nurses", "Medical officers covering the unit"],
        method: "OBSERVED",
        frequency: "SIX_MONTHLY",
        passStandard: "Sets up, alarms, and troubleshoots each device unaided.",
      },
      {
        id: "F2",
        protocol: "Daily equipment and environment check",
        mustBeCompetent: ["Every registered nurse"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "A dated, named check for every calendar day. Gaps are the finding.",
      },
      {
        id: "F3",
        protocol: "Laboratory analyser calibration and quality control",
        mustBeCompetent: ["Medical Lab Scientist"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Calibration and external quality assessment records current. The audit found these outstanding.",
      },
      {
        id: "F4",
        protocol: "Power failure and oxygen supply failure",
        mustBeCompetent: ["All clinical staff", "Attendants"],
        method: "SIMULATION",
        frequency: "ANNUAL",
        passStandard: "Run as a drill. Everyone knows their own action, including who moves which baby first.",
      },
    ],
  },
  {
    id: "G",
    title: "Operational and front of house",
    failureMode: "The hospital does the work and does not capture it, or the family experience fails.",
    protocols: [
      {
        id: "G1",
        protocol: "Registration and payer details, complete before the encounter",
        mustBeCompetent: ["Front desk", "Admin and Billing Officer"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "No encounter recorded against an incomplete payer record. Incomplete details at the desk become a refused claim six weeks later.",
      },
      {
        id: "G2",
        protocol: "Capture and billing of everything delivered",
        mustBeCompetent: ["Admin and Billing Officer", "Every registered nurse"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Nurses are on this list on purpose. Most revenue leakage is an item used at the bedside and never recorded.",
      },
      {
        id: "G3",
        protocol: "Deposits, refunds and the authorisation to admit below the floor",
        mustBeCompetent: ["Front desk", "Head of Finance"],
        method: "RECORD_AUDIT",
        frequency: "SIX_MONTHLY",
        passStandard: "Every admission below the deposit floor carries a named authorisation. The audit could not obtain this ledger.",
      },
      {
        id: "G4",
        protocol: "Stock: reorder points, counting and near expiry",
        mustBeCompetent: ["Pharmacy", "Head of Admin and Operations"],
        method: "RECORD_AUDIT",
        frequency: "QUARTERLY",
        passStandard: "Fast movers counted weekly against the reorder point, near expiry reviewed monthly.",
      },
      {
        id: "G5",
        protocol: "Telling a waiting family what is happening",
        mustBeCompetent: ["Front desk", "All clinical staff"],
        method: "OBSERVED",
        frequency: "QUARTERLY",
        passStandard: "A time given and then honoured. The promise to come back is the part that works, and only if it happens.",
      },
    ],
  },
];

/**
 * What happens when somebody does not pass. Written down in advance, because
 * the first failure is where a competency scheme either becomes a development
 * tool or becomes a disciplinary one, and it cannot be both.
 */
export const REMEDIATION = {
  principle:
    "A fail is a training need until proven otherwise. The only question asked first is whether this person was ever taught, and at Haven the honest answer today is usually no.",
  steps: [
    "Say so privately, the same day, against the written standard and never in front of a parent or a colleague.",
    "Teach it, ideally by pairing them with someone who already does it well rather than by sending them on a course.",
    "Reassess within two weeks. A gap left open past that stops being a training need.",
    "Where the protocol is one that harms a child if done wrong, the person does not work unsupervised in that area until they pass. That is not a sanction and it is explained as such.",
    "Three fails on the same protocol after real teaching is a capability conversation, and it goes through the performance route, not through this one.",
  ],
  neverDoThis: [
    "Never publish individual results. Nineteen people, six nurses: a list is a name.",
    "Never let a fail reach pay or a bonus. Couple competency to money and people stop reporting what they cannot do.",
    "Never test somebody on a protocol nobody has trained them on and record it as a fail. That is measuring our own omission and billing them for it.",
  ],
} as const;

/** The order to build it in. Everything cannot start at once with nineteen people. */
export const ROLLOUT = [
  { phase: 1, what: "Domain A in full, plus B1 and B2", why: "Where failure kills a child. Nothing else competes." },
  { phase: 2, what: "Domain E, plus B3 to B5", why: "Handover, records and the medicine exposures the audit named." },
  { phase: 3, what: "Domains C and D", why: "Infection and the care pathways, once the standards for them are written." },
  { phase: 4, what: "Domains F and G", why: "Equipment and the operational capture, which is also the revenue work." },
] as const;

export const COMPETENCY_RULE =
  "A protocol with no competency test attached does not count as a control, and should not be described as one to a regulator, an insurer or the board.";
