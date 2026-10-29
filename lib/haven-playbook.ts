/**
 * Haven Paediatric Centre: the operating playbook.
 *
 * What happens every day, what happens every week, what the system watches for,
 * and what it does when something has not happened.
 *
 * THE DISTINCTION THAT GOVERNS ALL OF THIS. A system can know, objectively and
 * without judgement, that a thing was not recorded, or was recorded late. It
 * cannot know that a handover was poor, that a note was thin, or that a drug
 * round was rushed. Those are quality judgements and they need a human with
 * context.
 *
 * So the flags below split in two, and the split is not cosmetic:
 *
 *   COMPLETION flags fire automatically. They are factual, they are never
 *   about quality, and nobody can reasonably dispute them. "The handover for
 *   the night shift has no record against it" is a fact.
 *
 *   QUALITY findings come from sampling, by a person, on a cadence. "That
 *   handover was poor" is a judgement and it is delivered in a conversation,
 *   privately, by somebody who can say why.
 *
 * Building one mechanism that tries to do both produces a system that accuses
 * people of bad work on the evidence of a missing tick, and in a nineteen
 * person hospital that is how you lose the reporting culture in a fortnight.
 */

import type { Clause } from "./haven-people";

export type Role =
  | "NURSE"
  | "SENIOR_NURSE"
  | "MEDICAL_OFFICER"
  | "CMD"
  | "FRONT_DESK"
  | "BILLING"
  | "FINANCE"
  | "PHARMACY"
  | "LAB"
  | "OPS";

export type Cadence = "EVERY_SHIFT" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface PlaybookTask {
  id: string;
  role: Role;
  cadence: Cadence;
  task: string;
  /** What is actually captured, so a completion flag has something to look at. */
  evidence: string;
  why: string;
}

export const TASKS: PlaybookTask[] = [
  // --- the ward, every shift -----------------------------------------------
  {
    id: "n-handover",
    role: "NURSE",
    cadence: "EVERY_SHIFT",
    task: "Complete and record the handover at the end of the shift",
    evidence: "A handover record exists for the shift, with a named author and a time",
    why: "Handover is where most hospital harm is prevented or created. The structure is ours to install even though the content is theirs.",
  },
  {
    id: "n-drugchart",
    role: "NURSE",
    cadence: "EVERY_SHIFT",
    task: "Sign the drug chart at the time of administration, not afterwards",
    evidence: "Administration entries carry a time at or near the dose time",
    why: "The next nurse has to be able to trust the chart. If signing at the bedside is impractical, that is a system defect and it belongs to operations, not to the nurse.",
  },
  {
    id: "n-crashtrolley",
    role: "NURSE",
    cadence: "DAILY",
    task: "Check the crash trolley against the standard and sign it",
    evidence: "A dated, named check for each calendar day",
    why: "The one check where a gap is never acceptable and never a paperwork question.",
  },
  {
    id: "sn-huddle",
    role: "SENIOR_NURSE",
    cadence: "DAILY",
    task: "Run the morning huddle: overnight, the plan per patient, who goes home, what will stop us",
    evidence: "Huddle logged with the discharge list for the day",
    why: "A hospital that decides at nine who is going home has the bed by noon.",
  },
  {
    id: "sn-rota",
    role: "SENIOR_NURSE",
    cadence: "WEEKLY",
    task: "Confirm the rota four weeks out and flag any gap",
    evidence: "Rota published with no unfilled shift inside the four week window",
    why: "People have children and lives, and a gap found four weeks out is a staffing question rather than an emergency.",
  },

  // --- medical -------------------------------------------------------------
  {
    id: "mo-notes",
    role: "MEDICAL_OFFICER",
    cadence: "DAILY",
    task: "Document the ward round the same day",
    evidence: "A note per patient per round day",
    why: "The record is a clinical document, a legal document and the evidence behind every claim submitted.",
  },
  {
    id: "mo-discharge",
    role: "MEDICAL_OFFICER",
    cadence: "DAILY",
    task: "Complete discharge summaries on the day of discharge",
    evidence: "Discharge summary dated the same day as the discharge",
    why: "A summary written three days later is worse for the patient and is the commonest reason a claim is later queried.",
  },

  // --- front desk and money ------------------------------------------------
  {
    id: "fd-registration",
    role: "FRONT_DESK",
    cadence: "EVERY_SHIFT",
    task: "Complete registration including full payer details before the encounter",
    evidence: "No encounter recorded against an incomplete payer record",
    why: "Incomplete payer details at the desk become a refused claim six weeks later, and by then nobody can fix it.",
  },
  {
    id: "fd-waits",
    role: "FRONT_DESK",
    cadence: "EVERY_SHIFT",
    task: "Give waiting families a time and come back at it",
    evidence: "Sampled, not system checked. See QUALITY_SAMPLING.",
    why: "Waiting is tolerable. Waiting without information is not, and the promise to come back is the part that works.",
  },
  {
    id: "bill-capture",
    role: "BILLING",
    cadence: "DAILY",
    task: "Capture and bill the previous day's activity, and clear the unbilled list",
    evidence: "Unbilled items older than one working day",
    why: "Four tariff lines in five currently carry no price. Capture is the other half of fixing that, and it is a daily habit or it is nothing.",
  },
  {
    id: "fin-claims",
    role: "FINANCE",
    cadence: "WEEKLY",
    task: "Submit the week's claims inside the payer window, and age the outstanding",
    evidence: "No claim unsubmitted beyond the payer's deadline",
    why: "A claim rejected on timing has nothing to do with the care and everything to do with us.",
  },

  // --- pharmacy, lab, operations -------------------------------------------
  {
    id: "ph-fastmovers",
    role: "PHARMACY",
    cadence: "WEEKLY",
    task: "Count the fast movers and reorder against the reorder point",
    evidence: "A dated count covering the agreed fast mover list",
    why: "A stockout in a children's hospital is a clinical event before it is a finance one.",
  },
  {
    id: "ph-expiry",
    role: "PHARMACY",
    cadence: "MONTHLY",
    task: "Review near expiry stock early enough to use it",
    evidence: "A dated near expiry review",
    why: "Expiry loss is the category nobody budgets for and everybody discovers too late.",
  },
  {
    id: "lab-turnaround",
    role: "LAB",
    cadence: "WEEKLY",
    task: "Log sample turnaround times",
    evidence: "Turnaround recorded per sample batch",
    why: "The baseline has to exist before any decision about what moves to a reference partner, or the decision is made on anecdote.",
  },
  {
    id: "ops-flags",
    role: "OPS",
    cadence: "DAILY",
    task: "Clear the overnight flag queue: assign each one an owner and a date",
    evidence: "No flag older than one working day without an owner",
    why: "A flag nobody picks up teaches everyone that flags are decoration. This task is what makes the whole system credible.",
  },
  {
    id: "ops-nearmiss",
    role: "OPS",
    cadence: "WEEKLY",
    task: "Review new near misses with the Chief Medical Director and close out actions",
    evidence: "Each report has an action, an owner and a date within a fortnight",
    why: "The first few reports decide whether anyone ever reports again.",
  },
];

/** The week, fixed, so nobody prepares for a different meeting than the one that happens. */
export const WEEKLY_CADENCE = [
  { when: "Every morning", what: "The huddle. Fifteen minutes, standing, three questions." },
  { when: "Monday", what: "Operating review: occupancy, cash, stock, people, open actions, escalations. One hour, fixed agenda." },
  { when: "Wednesday", what: "Standards session with one team, rotating. They write, we hold the pen steady." },
  { when: "Thursday", what: "Buddy fifteen minutes, on shift." },
  { when: "Friday", what: "The pulse goes out, and last week's response rate is published back to the team." },
  { when: "Month end", what: "The board page, the numbers page, and one to ones." },
] as const;

export type FlagLevel = "NUDGE" | "FLAG" | "ESCALATE";

export interface FlagRule {
  taskId: string;
  /** How long after the deadline before anything fires. */
  graceHours: number;
  level: FlagLevel;
  /** Who sees it. Never the whole team. */
  goesTo: string;
  /** The wording principle, because tone is the whole thing here. */
  tone: string;
}

/**
 * Completion flags only. Every rule here fires on an absent or late record,
 * never on a judgement about how well something was done.
 *
 * Three levels and no more. Alert fatigue is a documented failure mode and a
 * system that cries wolf on everything gets switched off in the mind long
 * before it gets switched off in software.
 */
export const FLAG_RULES: FlagRule[] = [
  {
    taskId: "n-handover",
    graceHours: 2,
    level: "NUDGE",
    goesTo: "The nurse who held the shift",
    tone: "Asking, not accusing. The handover for last night has no record against it yet, can you add it or tell us what got in the way.",
  },
  {
    taskId: "n-handover",
    graceHours: 24,
    level: "FLAG",
    goesTo: "Senior Registered Nurse",
    tone: "Still factual. A second missed record in a week is a pattern worth a conversation, not a sanction.",
  },
  {
    taskId: "n-crashtrolley",
    graceHours: 12,
    level: "FLAG",
    goesTo: "Senior Registered Nurse, and the Chief Medical Director if two days run",
    tone: "The one flag that escalates fast, because an unchecked trolley is not an administrative gap.",
  },
  {
    taskId: "sn-huddle",
    graceHours: 3,
    level: "NUDGE",
    goesTo: "Senior Registered Nurse",
    tone: "A reminder, not a mark. The huddle is a new habit and new habits need the prompt for about six weeks.",
  },
  {
    taskId: "mo-discharge",
    graceHours: 24,
    level: "NUDGE",
    goesTo: "The medical officer who discharged",
    tone: "Routed to the clinician directly and never through operations. A clinical record prompt from a non-clinician reads as supervision.",
  },
  {
    taskId: "bill-capture",
    graceHours: 24,
    level: "FLAG",
    goesTo: "Admin and Billing Officer, copied to Head of Finance after three days",
    tone: "Framed as the unbilled list, not as the person. The list is the subject.",
  },
  {
    taskId: "fin-claims",
    graceHours: 48,
    level: "ESCALATE",
    goesTo: "Head of Finance and the operations lead",
    tone: "A claim about to age out of its window is money leaving the building, and it gets the loudest level we have.",
  },
  {
    taskId: "ph-fastmovers",
    graceHours: 48,
    level: "FLAG",
    goesTo: "Pharmacy, copied to operations",
    tone: "Paired with the stockout count, so the flag and its consequence are seen together.",
  },
  {
    taskId: "ops-flags",
    graceHours: 24,
    level: "ESCALATE",
    goesTo: "The operations lead, then the Chief Medical Director",
    tone: "The flag about unattended flags. If this one fires regularly the system is not being run and nothing else on this page is working.",
  },
];

/**
 * Quality is sampled by a person, on a cadence, and fed back privately. This is
 * where "poor handover" belongs. It never arrives as an automatic flag.
 */
export const QUALITY_SAMPLING = [
  {
    what: "Handover quality",
    how: "The Senior Registered Nurse sits in on two handovers a week, unannounced, against the written standard.",
    feedback: "Privately, to the individual, within the day. Patterns go to the standards session, with no names.",
  },
  {
    what: "Record quality",
    how: "A small sample of records audited monthly with the clinical team, as a learning exercise rather than an inspection.",
    feedback: "You will find the same three defects repeatedly. Fixing those three is worth more than a perfect policy nobody reads.",
  },
  {
    what: "The patient journey",
    how: "Walked end to end with a stopwatch, unannounced, on a busy afternoon, monthly.",
    feedback: "To the team as a map of where families have to ask what is happening. Each one of those is a defect and none of them is a person.",
  },
] as const;

export interface Risk {
  risk: string;
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  mitigation: string;
  owner: string;
}

/** Reviewed at the Monday operating review. A register nobody reads is theatre. */
export const RISK_REGISTER: Risk[] = [
  {
    risk: "The nursing establishment cannot staff the beds the growth plan assumes, and the season arrives first",
    likelihood: "HIGH",
    impact: "HIGH",
    mitigation: "Model the establishment in week one and put the gap to the board as a number of posts. Sequence hiring against November, not against the budget year.",
    owner: "Consult for Africa with the Chief Medical Director",
  },
  {
    risk: "Losing one of six nurses mid season",
    likelihood: "MEDIUM",
    impact: "HIGH",
    mitigation: "Rota published four weeks ahead, leave agreed before anyone books, buddy pairing for support, recognition routine running from week one.",
    owner: "Senior Registered Nurse",
  },
  {
    risk: "Pharmacy superintendence rests on a part time pharmacist with no documented cover arrangement",
    likelihood: "HIGH",
    impact: "HIGH",
    mitigation: "Resolve and document what the pharmacist covers, what may not happen off site, and who is accountable in the gap. Week one.",
    owner: "Head of Admin and Operations",
  },
  {
    risk: "The reporting culture is damaged by the first near miss being handled badly",
    likelihood: "MEDIUM",
    impact: "HIGH",
    mitigation: "The first three are handled visibly, without blame, by the Chief Medical Director. Brief the board in advance that reports rising is a good sign.",
    owner: "Chief Medical Director",
  },
  {
    risk: "Flag fatigue: too many prompts and the system is ignored",
    likelihood: "MEDIUM",
    impact: "MEDIUM",
    mitigation: "Three levels only, completion facts only, every flag carries an action, and the unattended flag queue is itself escalated.",
    owner: "Operations lead",
  },
  {
    risk: "Patient information moving through eighteen personal email accounts",
    likelihood: "HIGH",
    impact: "MEDIUM",
    mitigation: "Move anything carrying patient data off personal email. One company domain already exists.",
    owner: "Head of Admin and Operations",
  },
  {
    risk: "A system change introduced during the season is blamed for everything that goes wrong in it",
    likelihood: "MEDIUM",
    impact: "MEDIUM",
    mitigation: "Freeze new process changes from the start of November. Run what was built, keep a list for next year.",
    owner: "Operations lead",
  },
];

export const PLAYBOOK_PRINCIPLE: Record<string, Clause> = {
  "Tasks are written down so nobody has to remember them": "KNOW",
  "Flags are facts about records, never judgements about people": "SAY",
  "Every flag carries an owner and a next action": "SEE",
  "Quality is sampled by a human and fed back privately": "SAY",
  "The rota, the stock and the establishment are operations problems, not personal failings": "HAVE",
};

/* ===========================================================================
   ACCESS TIERS
   The staff page cannot show everything to everyone. Haven is nineteen people
   who all know each other, so the cost of putting the wrong thing on an open
   page is not abstract.
   =========================================================================== */

export type Tier = "ALL_STAFF" | "SUPERVISOR" | "LEADERSHIP" | "BOARD_AND_CFA" | "OWNER_ONLY";

export const TIERS: Record<Tier, { who: string; principle: string }> = {
  ALL_STAFF: {
    who: "All nineteen",
    principle: "Anything we would say out loud in the town hall. If it could not be said in that room it does not belong here.",
  },
  SUPERVISOR: {
    who: "Senior Registered Nurse, Head of Admin and Operations, Head of Finance, Head of Customer Service",
    principle: "What you need to run your own area, including your unit's numbers and your own team's flags. Not other units' people.",
  },
  LEADERSHIP: {
    who: "Chief Medical Director and the heads, plus CFA",
    principle: "Aggregated quality findings, the near miss register in full, performance matters. Named, because acting on them requires names.",
  },
  BOARD_AND_CFA: {
    who: "The five founders and Consult for Africa",
    principle: "The audit report in full, the commercials, the establishment gap costed, anything legally sensitive.",
  },
  OWNER_ONLY: {
    who: "The individual, and nobody else at all",
    principle: "Their own assessment report. Not the board, not their manager, not CFA. This is the one tier with no override and it is a promise already made in writing to all nineteen.",
  },
};

export const TIERED_CONTENT: { item: string; tier: Tier; note?: string }[] = [
  { item: "Onboarding and reorientation pack", tier: "ALL_STAFF" },
  { item: "Town hall deck", tier: "ALL_STAFF" },
  { item: "The six-measure scoreboard, hospital level", tier: "ALL_STAFF" },
  { item: "Standards of work, published as each team signs its own off", tier: "ALL_STAFF" },
  { item: "Near miss and what-is-broken forms", tier: "ALL_STAFF", note: "Submitting is open to all. Reading what others submitted is not." },
  { item: "The rota", tier: "ALL_STAFF", note: "Everyone sees the rota. Only supervisors edit it." },
  { item: "Buddy pairings", tier: "ALL_STAFF", note: "Published deliberately. A private pairing reads as favouritism in a team this size." },

  { item: "Unit-level scoreboard and trends", tier: "SUPERVISOR" },
  { item: "Completion flags for your own area", tier: "SUPERVISOR", note: "Your team's, never another unit's." },
  { item: "Establishment and vacancy position for your area", tier: "SUPERVISOR" },

  { item: "The near miss register in full, with names where given", tier: "LEADERSHIP" },
  { item: "Quality sampling findings", tier: "LEADERSHIP", note: "Patterns go back to the standards session with no names; the detail stops here." },
  { item: "Appraisal records and performance conversations", tier: "LEADERSHIP" },
  { item: "Licence and registration register", tier: "LEADERSHIP" },

  { item: "The organisational audit report", tier: "BOARD_AND_CFA", note: "Staff hear the findings as the three system issues in the town hall deck, not the document." },
  { item: "Anything with money in it: tariff, receivables, revenue, fees", tier: "BOARD_AND_CFA", note: "Staff hear money as a conversation about their pay. Keep it off every staff surface." },
  { item: "The costed establishment gap", tier: "BOARD_AND_CFA", note: "It is a conversation about posts and budget before it is anything else." },
  { item: "The engagement's sensitivities briefing", tier: "BOARD_AND_CFA", note: "CFA only in practice." },

  { item: "An individual's assessment report", tier: "OWNER_ONLY", note: "Team-level patterns with no names are the most anyone else ever sees. Written into the pack and the invite; breaking it would cost the reporting culture too." },
];

/**
 * Build rule for the staff page. Default deny. A page that renders everything
 * and hides some of it client side has already sent it to the browser, and in a
 * hospital of nineteen somebody will look.
 */
export const TIER_RULE =
  "Gate on the server, not in the component. Default to ALL_STAFF and promote deliberately. Nothing reaches a surface a tier below the one it is labelled for, and OWNER_ONLY never reaches any shared surface at all.";
