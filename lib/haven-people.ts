/**
 * Haven Paediatric Centre: the people architecture.
 *
 * Workstream 2 is the spine of the engagement, and this is its structure. Eight
 * domains, cut so that every HR element lands in exactly one of them and
 * nothing that matters is left outside. The cut is deliberate: it separates
 * telling someone what good looks like (B) from judging whether they did it
 * (F), because at Haven neither currently exists and conflating them is how
 * appraisal becomes an argument about expectations nobody ever set.
 *
 * Everything here ladders to one outcome. If a proposal does not serve one of
 * its three clauses, it does not go in, however good an idea it is.
 *
 * Haven has nineteen staff and no HR function at all. There is no personnel
 * officer, no HR manager and no one whose job title contains the word people.
 * That is the binding constraint on every design below: anything that needs a
 * dedicated administrator to run it will not survive, so each domain is built
 * to run on a named line manager plus a form.
 */

/** The overarching cultural outcome. Everything below serves one of three clauses. */
export const CULTURAL_OUTCOME = {
  statement:
    "A hospital where everyone knows what we are trying to achieve and what good looks like in their own job, has what they need to deliver it, can see how we are doing against it, and says so when something is wrong.",
  clauses: {
    KNOW: "Knows the goal and their part in it. The hospital's objective, their role, their standard and their measures are written down and the same for everyone doing that job.",
    HAVE: "Has what they need. Enough people, the right skills, a rota that is survivable, the stock on the shelf, and pay that arrives.",
    SEE: "Can see how we are doing. The scoreboard is published where people work, it moves, and each person can find their own numbers on it without asking.",
    SAY: "Says so when something is wrong. Speaking up about a gap, a near miss or a bad decision is normal, safe and visibly acted on.",
  },
  /**
   * Why this and not a values poster. The staff survey already says people care
   * about the work: sixteen of seventeen rated safety very good or excellent.
   * The gap is not belief, it is scaffolding. So the outcome is written as
   * three testable conditions rather than an aspiration.
   */
  howWeKnowItWorked: [
    "A nurse new to the ward can say what good looks like in her role without asking anyone.",
    "Near miss reports go up, not down, and nobody who files one is worse off.",
    "The rota is published four weeks ahead and holds through the November to February season.",
    "Turnover among the nursing and medical staff stays flat through the growth.",
    "The monthly pulse keeps a response rate above seventy per cent once it is routine.",
  ],
} as const;

export type Clause = "KNOW" | "HAVE" | "SEE" | "SAY";

/**
 * The goal, as the staff hear it. Deliberately not in naira.
 *
 * The commercial target is the board's and it is stated in money. Staff cannot
 * move a revenue number and they hear one as a conversation about their own
 * pay, so the same goal is expressed here in the operational terms the team
 * actually controls. Every measure below ladders to the commercial plan without
 * naming it.
 */
export const STAFF_GOAL =
  "A fuller hospital that is still a safe one: the cots in use, nothing running out, nothing missed, and nobody finding out about a problem too late to fix it.";

export interface ScoreboardMeasure {
  measure: string;
  level: "HOSPITAL" | "UNIT" | "INDIVIDUAL";
  /** Why a person on shift can actually move this one. */
  movable: string;
  serves: Clause[];
}

/**
 * Six at hospital level, published where people work and updated weekly. Six is
 * the limit: a scoreboard nobody can hold in their head is a report.
 */
export const SCOREBOARD: ScoreboardMeasure[] = [
  {
    measure: "Beds and cots in use",
    level: "HOSPITAL",
    movable: "Readiness and turnover. A cot clean, equipped and available within the hour is what converts a referral into an admission.",
    serves: ["SEE"],
  },
  {
    measure: "Discharges completed before noon",
    level: "UNIT",
    movable: "Decided at the morning huddle and chased through the day. The single clearest example of a measure the team owns outright.",
    serves: ["SEE", "KNOW"],
  },
  {
    measure: "Stockouts this month",
    level: "HOSPITAL",
    movable: "Reorder discipline and flagging early. The target is zero and one a month is a system working.",
    serves: ["SEE", "HAVE"],
  },
  {
    measure: "Near misses reported, and the share closed out",
    level: "HOSPITAL",
    movable: "Reporting is the behaviour. Reports going up is a good month, which has to be explained to the board before the first report lands.",
    serves: ["SEE", "SAY"],
  },
  {
    measure: "Standards written and in use",
    level: "UNIT",
    movable: "Written with the people who do the work, so the count only rises when a team has signed off its own.",
    serves: ["SEE", "KNOW"],
  },
  {
    measure: "Rota published four weeks ahead",
    level: "HOSPITAL",
    movable: "A streak, not a percentage. It breaks visibly and everyone knows who it hurt.",
    serves: ["SEE", "HAVE"],
  },
];

export interface PeopleDomain {
  id: string;
  title: string;
  /** The one question this domain answers. Keeps the cut MECE. */
  question: string;
  elements: string[];
  /** What is actually true at Haven today, from the roster and the audit. */
  havenToday: string;
  /** What we put in, built to run without an HR department. */
  build: string[];
  serves: Clause[];
  /** Engagement week it starts. Sequence matters more than speed here. */
  startsWeek: number;
}

export const DOMAINS: PeopleDomain[] = [
  {
    id: "A",
    title: "Workforce",
    question: "How many people do we need, of what kind, and how do they arrive and leave?",
    elements: [
      "Establishment: the posts the hospital needs, as against the headcount it has",
      "Skill mix and cover for specialist roles",
      "Recruitment and selection",
      "Induction into the organisation",
      "Exit, handover and the leaver's record",
    ],
    havenToday:
      "Nineteen staff. Six registered nurses and three medical officers covering five paediatric beds and three NICU cots around the clock. On a forty hour week with a normal leave and sickness uplift, keeping two clinicians on duty at all times takes roughly ten posts in each group. The establishment does not support the beds already open, let alone the growth plan. The pharmacy is covered by a part-time pharmacist over two technicians, which has to be resolved and sits in domain G as well as here.",
    build: [
      "Model the establishment against the beds actually being run, by unit, with the leave and sickness uplift shown",
      "Agree the gap with the board as a number of posts, not as a feeling about being short staffed",
      "A standard induction so a new person enters the standard and not just the rota",
      "Sequence hiring against the November to February season rather than against the budget year",
    ],
    serves: ["HAVE"],
    startsWeek: 1,
  },
  {
    id: "B",
    title: "Role and direction",
    question: "What is each person for, and what does good look like in their job?",
    elements: [
      "Job descriptions",
      "Objectives, set as OKRs at hospital, department and individual level",
      "KPIs: the small number of measures each role is actually held to",
      "Standards of work: what good looks like in the task itself",
    ],
    havenToday:
      "Job descriptions and targets are on the board's list and do not yet exist in usable form. Almost nothing is written down as a standard, so the way care is given depends on who is on shift. One person, the Head of Admin, holds admin, operations and business development, which is three jobs and cannot be described as one.",
    build: [
      "One page per role: purpose, the five things this job is accountable for, who it reports to, and the three measures",
      "Hospital objectives set first, then department, then individual, so an individual objective can always be traced upward",
      "Three to five KPIs per role, never more, and never a measure the postholder cannot influence",
      "Standards of work written with the people who do the work, starting with admission, handover, discharge, drug administration, the crash trolley check and the NICU routines",
      "Split the Head of Admin role explicitly, so operations and business development stop competing for the same person's Tuesday",
    ],
    serves: ["KNOW"],
    startsWeek: 2,
  },
  {
    id: "C",
    title: "Time",
    question: "When does each person work, and what happens when they cannot?",
    elements: [
      "The rota and how far ahead it is published",
      "Annual leave planning and entitlement",
      "Sickness and unplanned absence",
      "Overtime, shift swaps and on-call",
      "Attendance recording",
    ],
    havenToday:
      "No published rota discipline and no leave plan. With six nurses the rota only works in a month where nobody is ill, which is no month, and the high season falls across the period when people most want leave.",
    build: [
      "Publish the rota four weeks ahead and defend that as a rule, because a hospital that tells staff their shifts on Friday for Monday loses good people whatever it pays",
      "A leave plan agreed for November to February before anybody books a flight, with a cap on concurrent leave per unit",
      "Swaps go through one named person and get recorded, never a WhatsApp message",
      "Treat persistent overtime in a unit as a measurement of the establishment being wrong rather than as a cost to be squeezed",
    ],
    serves: ["HAVE"],
    startsWeek: 3,
  },
  {
    id: "D",
    title: "Reward",
    question: "What does a person get for the work, and what does it cost the hospital?",
    elements: [
      "Pay structure and bands",
      "Statutory on-costs: pension, NSITF, ITF, group life",
      "Benefits including the staff health plan",
      "Variable pay and the commission structure",
      "Recognition, which is not pay and is often stronger",
    ],
    havenToday:
      "A commission structure is on the board's list. Payroll is the dominant cost in a hospital this size and is the first thing the board asks about. Nothing about pay has been promised to staff and nothing should be until the structure exists.",
    build: [
      "A simple band structure so two people doing the same job are not on unexplained different money",
      "Load the true cost of a post, not the gross salary, so establishment decisions are made on the real number",
      "Variable pay tied to quality, documentation, reliability and collection, never to admissions, length of stay or tests ordered, because coupling a clinician's income to those is a safety risk before it is a commercial one",
      "A standing recognition routine: name the person who caught the near miss, in front of their colleagues, within the week",
    ],
    serves: ["HAVE", "SAY"],
    startsWeek: 6,
  },
  {
    id: "E",
    title: "Capability",
    question: "How does a person get better at the job, and stay licensed to do it?",
    elements: [
      "Induction into the role, as against the organisation",
      "Training plan and the training record",
      "Supervision and preceptorship, particularly in the NICU",
      "Professional licensure and continuing education",
      "Peer to peer teaching",
    ],
    havenToday:
      "Training is improvised. Licensure is assumed rather than checked, and a lapsed practising licence is the hospital's exposure and not only the individual's. The NICU is the highest acuity area and the one where supervision gaps cost most.",
    build: [
      "A licence register covering every clinician, expiry dated, with a reminder ninety days out",
      "A training plan built from the standards of work, so training exists to close a named gap",
      "Supervised preceptorship for anyone newly working in the NICU, signed off before solo shifts",
      "Colleagues teaching colleagues as the default, because it spreads capability and it is the cheapest thing on this page",
    ],
    serves: ["KNOW", "HAVE"],
    startsWeek: 4,
  },
  {
    id: "F",
    title: "Performance and conduct",
    question: "How is the work judged, and what happens when it is not good enough?",
    elements: [
      "The appraisal cycle",
      "Continuous feedback and one to ones",
      "Managing poor performance",
      "Discipline and grievance",
      "Probation and confirmation",
    ],
    havenToday:
      "No appraisal cycle. Nothing written to appraise against, which is the reason to build domain B before this one. Attempting appraisal first would be judging people against expectations nobody ever set, and would do more damage than doing nothing.",
    build: [
      "A light appraisal twice a year, against the role's own objectives and KPIs, taking under an hour",
      "A monthly one to one per line manager, fifteen minutes, forward looking",
      "A written performance route that starts with a conversation and a date to look again, not with a letter",
      "A grievance route that does not run through the person being complained about",
      "Probation that is actually reviewed, because an unreviewed probation teaches everyone that nothing is checked",
    ],
    serves: ["KNOW", "SAY"],
    startsWeek: 8,
  },
  {
    id: "G",
    title: "Compliance and record",
    question: "What do the law and the personnel file require of us?",
    elements: [
      "Contracts of employment",
      "The personnel file and what must be in it",
      "Professional and facility registration",
      "Data protection under the NDPA",
      "Working time, statutory leave and employment law basics",
    ],
    havenToday:
      "The pharmacy runs on a part-time pharmacist over two technicians, and the cover arrangement has to be resolved and documented rather than left to custom. Eighteen of nineteen staff are on personal gmail or yahoo addresses, which becomes a live problem the moment patient information moves through them. One staff email on the roster is mistyped and would bounce.",
    build: [
      "Resolve and document the pharmacy superintendence: what hours the pharmacist covers, what may and may not happen when they are off site, and who is accountable in the gap",
      "A contract and a complete personnel file for every one of the nineteen",
      "Move anything carrying patient information off personal email",
      "One licence and registration register covering the facility and every individual, with owners and reminders",
    ],
    serves: ["HAVE"],
    startsWeek: 1,
  },
  {
    id: "H",
    title: "Culture and measurement",
    question: "Is any of this working, and how would we know?",
    elements: [
      "The staff pulse",
      "Speak up and near miss reporting",
      "Turnover and retention",
      "Response rate to anything we send",
      "The annual culture and safety survey",
    ],
    havenToday:
      "One anonymous survey has been run and the result was strong: sixteen of seventeen rated the safety of care very good or excellent, from a team of nineteen. That is the asset and the baseline. Nothing currently repeats, so there is no trend.",
    build: [
      "A monthly pulse, one tap to answer, published back to the team with its response rate",
      "A near miss channel that is anonymous by default and visibly acted on within a fortnight",
      "Repeat the full safety culture survey annually against the existing baseline",
      "Track turnover by unit, because the nursing establishment is where the growth will bite first",
    ],
    serves: ["SAY"],
    startsWeek: 1,
  },
];

/**
 * Sequence matters more than coverage. Build B before F, A and G before
 * everything, H from day one because it is the feedback loop that tells you
 * whether the rest landed.
 */
export const SEQUENCE_RULE =
  "Establishment and compliance first because they are exposures. Measurement from day one because it is the feedback loop. Role and direction next because nothing can be judged against nothing. Appraisal last, and only once there is something written to appraise against.";

/* ===========================================================================
   THE RELAUNCH, AND THE PEER-TO-PEER ENGINE
   Everything below is domain A (onboarding), E (capability) and H
   (measurement) made operational. Kept here rather than in the domain list
   because it is a sequence of events, not a category of work.
   =========================================================================== */

/**
 * Every one of the nineteen is onboarded again, as though new.
 *
 * This is the single most useful structural idea in the people workstream and
 * the reason is political as much as developmental. A transformation that
 * arrives as a correction makes somebody the problem, and in a hospital of
 * nineteen where everyone knows everyone, that person is identifiable and the
 * damage is permanent. A relaunch that everybody goes through at the same time
 * makes the hospital the subject and nobody the target. It also gives a single
 * clean moment to introduce the job description, the objectives, the standard,
 * the buddy and the assessment, none of which currently exist, without any of
 * them reading as a response to something somebody did.
 */
export const RELAUNCH_STEPS = [
  {
    step: 1,
    title: "The town hall",
    what: "Everyone hears the same thing at the same time: what we are trying to achieve, what changes, and what we will not do.",
    why: "The reset has to be collective and public or it is just a series of private conversations that generate rumour between them.",
  },
  {
    step: 2,
    title: "The assessment",
    what: "Every staff member completes the leadership and behavioural assessment. Their report is theirs.",
    why: "Gives us a real read on each person rather than an impression formed from whoever speaks most in meetings.",
  },
  {
    step: 3,
    title: "The skills map",
    what: "A capability matrix per role: what this job requires, and what this person can currently do, rated with them and not about them.",
    why: "Training without a named gap is a day out. This is what makes the training plan specific.",
  },
  {
    step: 4,
    title: "The re-contract",
    what: "A written job description, three to five measures, and objectives that trace up to the hospital's. Signed.",
    why: "Nobody at Haven currently has this. It is the precondition for appraisal, and appraising against nothing would be worse than not appraising.",
  },
  {
    step: 5,
    title: "The buddy",
    what: "Everyone is paired. Pairings are published.",
    why: "See BUDDY_DESIGN. The pair is the unit that carries the behaviour change, not the individual.",
  },
  {
    step: 6,
    title: "The standard",
    what: "Each team writes the standards for its own area, starting from how they already do it.",
    why: "People defend what they wrote. They comply with what they were handed, until they are busy.",
  },
] as const;

/**
 * How we build a real picture of each person. Three sources, because any one of
 * them alone is a caricature.
 */
export const CAPABILITY_SOURCES = [
  {
    source: "The assessment",
    gives: "Behavioural style, values, emotional intelligence, the clinical to leadership transition, how they work in a team, and how they read the culture.",
    caution:
      "It is a development instrument, not a selection one. The individual report belongs to the individual and goes to nobody else. What reaches us is the team-level pattern, and that distinction has to survive contact with a board that will ask to see individual results.",
  },
  {
    source: "The skills matrix",
    gives: "What each role requires technically, and where each person sits against it today. Rated jointly, with the person, against the role's own standard.",
    caution:
      "Rate against the role, never against each other. In a nursing team of six, a comparative rating is a name.",
  },
  {
    source: "The work itself",
    gives: "What actually happens on shift: who catches things, who is asked for help by others, who the rest of the team routes problems to.",
    caution:
      "The most reliable of the three and the one most often skipped, because it takes being in the building at night rather than reading a form.",
  },
] as const;

/**
 * Buddy pairing. The pair, not the individual, is the unit that carries
 * behaviour change here.
 *
 * Peer mentoring in nursing teams has a consistent evidence base for retention,
 * confidence and competence, with reported turnover roughly halving in some
 * programmes. For Haven the retention argument matters more than the training
 * one: the nursing establishment is already short, and losing one of six nurses
 * in the middle of the season is a bigger event than any training gain.
 */
export const BUDDY_DESIGN = {
  rules: [
    "Pair across shifts rather than within them, so the pair is a line of communication the rota does not already provide.",
    "Pair across functions where it is sensible. A nurse and a front desk colleague understanding each other's constraints fixes more handover friction than either one being trained again.",
    "Never pair a person with the colleague who writes their appraisal. The moment the buddy is also the assessor, the honesty goes.",
    "Pairings are published. A private pairing is a rumour about favouritism waiting to happen in a team this size.",
    "Rotate every quarter, so the network ends up dense rather than becoming six fixed friendships.",
    "Give the pair one job at a time, tied to the current standard being written, so it has a reason to meet.",
  ],
  cadence:
    "Fifteen minutes a week, on shift, not after it. A buddy system that asks people to stay late is a buddy system that quietly ends in month two.",
  whatTheyDo: [
    "Walk each other through one thing from the current standard",
    "Each names one near miss or one thing that wasted time this week",
    "One of them writes it into the register. Alternate who writes.",
  ],
} as const;

/**
 * The peer-to-peer nudge engine, and the one place the published evidence has
 * to be adapted rather than copied.
 *
 * What the evidence supports: audit and feedback produces small but real
 * improvement, larger where baseline compliance is low, which is Haven's
 * position on almost every measure. Social norms and peer comparison feedback
 * changes clinician behaviour, in one well-known primary care trial cutting
 * inappropriate antibiotic prescribing from twenty per cent to four, and a
 * secondary analysis of a national trial found it did not measurably harm job
 * satisfaction. Positive deviance works because the solution already exists
 * inside the organisation and arrives from a peer who shares the constraints.
 * Psychological safety is the precondition: Edmondson's original hospital work
 * found the best teams reported more errors, not fewer.
 *
 * Where it must be adapted: every one of those peer comparison trials ran
 * across hundreds or thousands of clinicians, where "you are in the bottom
 * quartile" is genuinely anonymous. Haven has six nurses and three medical
 * officers. At that size a ranked comparison is not a norm, it is a name, and
 * publishing one would cost more in trust than the behaviour is worth. So the
 * rule below is strict and it is the most important line on this page.
 */
export const NUDGE_RULES = {
  neverDoThis: [
    "No individual league tables, rankings or quartiles. In a team of six that is naming a person in public.",
    "No identical message repeated. Repeated delivery of the same feedback is associated with smaller effects, not larger, and it trains people to ignore us.",
    "No feedback without an action attached. Feedback that tells somebody they are behind and not what to do next is just criticism with a chart.",
    "Never route a nudge about a clinical decision through anyone other than the Medical Director.",
  ],
  doThis: [
    "Compare units and the hospital over time, never named individuals against each other. The ward against last month is a fair fight; a nurse against her five colleagues is not.",
    "Give individual feedback privately and against the person's own standard and objectives, not against their colleagues.",
    "Use positive deviance as the engine: find who already does it well, which the skills map and the night walks will tell you, and have them teach it. A practice that arrives from a colleague under the same constraints is credible in a way that a practice from a consultant is not.",
    "Make the asker credible and specific. Combining a credible source with social comparison is where the measurable effect sits.",
    "Celebrate reporting going up. The month near misses rise is a good month, and the board has to be told that before the first report lands or they will read the chart backwards.",
    "Close the loop visibly. Show what changed because somebody answered, even when little did, and say so honestly when little did.",
  ],
  /** What CFA actually does, as opposed to what the hospital does. */
  ourRole: [
    "We send the weekly prompt, because the credibility of an outside asker is part of why it gets answered early on.",
    "We publish the response rate back to the team every week.",
    "We hand the sending over to the hospital once answering is habitual, because a nudge programme that only works while the consultants are in the building has not changed anything.",
  ],
} as const;
