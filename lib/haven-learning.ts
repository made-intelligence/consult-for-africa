/**
 * What Haven is meant to teach us.
 *
 * The staff page has two jobs. It gets the Haven transformation delivered, and
 * it earns evidence for the real staff app Matthew is building into the Mezo
 * Suite and HospitlOS. The second job is the one that quietly fails, because
 * nobody notices it failing: three months pass, nineteen people use the thing,
 * and what reaches the product team is a handful of opinions about what felt
 * like it worked.
 *
 * So the questions are written down before the first person signs in, and each
 * one names the thing that has to be captured to answer it. A question we
 * cannot answer from data we are already collecting is a question we will
 * answer with a story.
 *
 * This is deliberately a small list. Instrumenting everything is how you end up
 * reading nothing.
 */

export interface LearningQuestion {
  id: string;
  question: string;
  /** Why HospitlOS cares, as against why we are curious. */
  matters: string;
  /** What has to exist to answer it. */
  capture: string;
  /** Honest status against what the page records today. */
  status: "CAPTURED" | "NEEDS_ONE_FIELD" | "NOT_CAPTURED";
}

export const QUESTIONS: LearningQuestion[] = [
  {
    id: "L1",
    question: "Do they sign in at all, and how many of the nineteen ever do?",
    matters:
      "Every staff app assumes activation and almost none measures it. If a third of a small, engaged, personally-briefed hospital never signs in once, that is the single most important number HospitlOS could have before launch.",
    capture: "StaffMember.lastLoginAt, counted against the roster, weekly.",
    status: "CAPTURED",
  },
  {
    id: "L2",
    question: "Which channel actually delivers the code, email or SMS?",
    matters:
      "Settles a design argument with evidence instead of instinct. Nigeria is an SMS country, but personal Gmail on a phone may be fine. Nobody knows, and both sides are confident.",
    capture:
      "The channel used per issued code. The login route logs it but does not store it, so this needs one column on StaffLoginToken.",
    status: "NEEDS_ONE_FIELD",
  },
  {
    id: "L3",
    question: "Do anonymous reports actually arrive, and at what rate?",
    matters:
      "The whole speak-up design rests on anonymity by default being enough. If reports stay at zero for six weeks the assumption is wrong, and better to learn it here than in a product.",
    capture: "AuditSurveyResponse counts for haven-near-miss and haven-whats-broken, per week.",
    status: "CAPTURED",
  },
  {
    id: "L4",
    question: "How many of those reports carry a name?",
    matters:
      "The proxy for whether people believe the promise. The share who sign their report is a truer psychological safety measure than any survey question about psychological safety.",
    capture: "Whether the optional name field is filled. Already in the stored payload.",
    status: "CAPTURED",
  },
  {
    id: "L5",
    question: "Does the weekly prompt keep getting answered, or does it decay?",
    matters:
      "Decides whether a nudge programme is a feature or a fashion. Audit and feedback research says repeated identical feedback weakens; this tests the shape of the curve on a real team.",
    capture: "Response rate per weekly send, against the roster, held over the eight weeks.",
    status: "NOT_CAPTURED",
  },
  {
    id: "L6",
    question: "What do they actually report as broken?",
    matters:
      "The content, not the count. The first twenty things nineteen hospital staff say waste their time is a feature list somebody would otherwise pay a discovery exercise for.",
    capture: "The free text itself, read and themed monthly rather than left in a table.",
    status: "CAPTURED",
  },
  {
    id: "L7",
    question: "When and on what do they use it?",
    matters:
      "If it is phones at 3am, every design assumption about desktop admin screens is wrong. Cheap to answer and expensive to guess.",
    capture: "Timestamp and user agent. Already stored on survey responses; not stored on sign-in.",
    status: "NEEDS_ONE_FIELD",
  },
  {
    id: "L8",
    question: "Does anything on the page change what people do?",
    matters:
      "The only question that matters commercially, and the hardest. Watch one behaviour end to end rather than claiming the app caused the transformation.",
    capture:
      "Pick a single measure with a baseline, most likely discharges before noon, and track it against when the scoreboard went up.",
    status: "NOT_CAPTURED",
  },
];

/**
 * Three gaps, each one field or one small job. Worth closing before the first
 * sign-in rather than reconstructing afterwards, which cannot be done.
 */
export const GAPS_TO_CLOSE = [
  "StaffLoginToken: store the delivery channel and the user agent, so L2 and L7 are answerable.",
  "A weekly send log, so L5 has a denominator. Without it, response rate is a number with no bottom half.",
  "A baseline for the one behaviour in L8, taken before the scoreboard goes up. After it goes up there is no baseline to take.",
];

/**
 * What goes to Matthew, and in what form. Not a conversation at the end.
 */
export const HANDOVER = {
  cadence: "A short written note monthly, not a readout at the end of the engagement.",
  contains: [
    "The numbers for L1 to L5, as a trend rather than a snapshot.",
    "The verbatim text from L6, themed but not sanitised. The sanitised version is the useless one.",
    "What we got wrong, specifically. A list of what worked is worth far less to a product team than the three things we built that nobody touched.",
  ],
  principle:
    "The deliverable to the product is what failed and why. Anybody can report the parts that worked.",
} as const;

export const LEARNING_RULE =
  "If a question here cannot be answered from data already being collected, it will be answered with a story. Close the gap or drop the question.";
