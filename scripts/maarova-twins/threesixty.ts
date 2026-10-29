import type { Twin } from "./types";

/**
 * Non-clinical twins for the 360 Feedback module, and for the two Culture and
 * Team items that describe the respondent's own team rather than the
 * institution.
 *
 * The 360 module is rated by other people about a subject, so its track
 * follows the person being rated and never the rater. A colleague in finance
 * rating a surgeon should be asked about clinical competence; a surgeon rating
 * the finance director should not. The rate route already loads the subject, so
 * the track is available where the decision has to be made.
 *
 * These items are frequency scales and free text, so only the stem changes. A
 * scale does not become clinical or non-clinical.
 *
 * One item is worth pausing on. "Listens actively to concerns from all levels
 * of staff, including nurses, cleaners, and porters" names the least powerful
 * people in a hospital on purpose, and that is the whole point of the item.
 * The twin keeps cleaners and porters, who are not clinical, and replaces only
 * the nurses. Losing the deliberate mention of low-status roles would have
 * gutted what the item measures.
 */
export const THREE_SIXTY_TWINS: Twin[] = [
  {
    module: "THREE_SIXTY",
    of: "Maintains clinical competence and stays current with developments in their specialty.",
    text: "Maintains professional competence and stays current with developments in their field.",
  },
  {
    module: "THREE_SIXTY",
    of: "Invests time in coaching and mentoring junior clinicians and managers.",
    text: "Invests time in coaching and mentoring junior colleagues and managers.",
  },
  {
    module: "THREE_SIXTY",
    of: "What is this leader's greatest strength in how they communicate with staff, patients, and stakeholders?",
    text: "What is this leader's greatest strength in how they communicate with staff, service users, and stakeholders?",
  },
  {
    module: "THREE_SIXTY",
    of: "Draws on clinical experience to make informed leadership decisions that staff trust.",
    text: "Draws on professional experience to make informed leadership decisions that staff trust.",
  },
  {
    module: "THREE_SIXTY",
    of: "Balances clinical evidence with operational realities when making resource allocation decisions.",
    text: "Balances evidence with operational realities when making resource allocation decisions.",
  },
  {
    module: "THREE_SIXTY",
    of: "Listens actively to concerns from all levels of staff, including nurses, cleaners, and porters.",
    text: "Listens actively to concerns from all levels of staff, including junior officers, cleaners, and porters.",
  },
  {
    module: "THREE_SIXTY",
    of: "Recognises and celebrates team achievements, both clinical and operational.",
    text: "Recognises and celebrates team achievements, both professional and operational.",
  },
  {
    module: "THREE_SIXTY",
    of: "Commands respect from clinical colleagues through demonstrated expertise and integrity.",
    text: "Commands respect from professional colleagues through demonstrated expertise and integrity.",
  },
  {
    module: "THREE_SIXTY",
    of: "Provides clear, timely updates during clinical emergencies or institutional crises.",
    text: "Provides clear, timely updates during operational emergencies or institutional crises.",
  },
  {
    module: "THREE_SIXTY",
    of: "Involves relevant stakeholders in decisions that affect their work or patient care.",
    text: "Involves relevant stakeholders in decisions that affect their work or the people they serve.",
  },
  {
    module: "THREE_SIXTY",
    of: "Thinks beyond immediate clinical challenges to consider systemic improvements.",
    text: "Thinks beyond immediate operational challenges to consider systemic improvements.",
  },
  {
    module: "THREE_SIXTY",
    of: "Adapts communication style when addressing different stakeholders such as patients, families, regulators, and board members.",
    text: "Adapts communication style when addressing different stakeholders such as service users, families, regulators, and board members.",
  },
  {
    module: "THREE_SIXTY",
    of: "Bridges the gap between clinical teams and administrative leadership effectively.",
    text: "Bridges the gap between frontline teams and senior leadership effectively.",
  },
  {
    module: "THREE_SIXTY",
    of: "How does this leader's clinical background influence their effectiveness as a leader, positively or negatively?",
    text: "How does this leader's professional background influence their effectiveness as a leader, positively or negatively?",
  },
];

export const CULTURE_TWINS: Twin[] = [
  {
    module: "CULTURE_TEAM",
    of: "Multi-disciplinary teamwork and shared decision-making are genuinely valued here.",
    text: "Cross-functional teamwork and shared decision-making are genuinely valued here.",
  },
  {
    module: "CULTURE_TEAM",
    of: "Our team communicates effectively across professional boundaries, such as between doctors, nurses, and allied health.",
    text: "Our team communicates effectively across professional boundaries, such as between finance, operations, and support functions.",
  },
];
