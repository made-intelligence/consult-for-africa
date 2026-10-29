/**
 * The filter questions for the Kinship nursing roles, defined once for the form
 * at /oncadre/kinship and the route that scores it.
 *
 * Debo, 21 Oct 2026: the recruitment team should sort through fast. So every
 * answer is scored here, without a model call, and the result lands on the
 * mandate as a number the admin page already sorts by. Three gates decide who
 * goes no further (no licence, no smartphone, no consent to checks); everything
 * else adds points out of 100. The three scenarios carry most of the weight,
 * because they are the part of the application nobody can copy from a CV.
 *
 * Nobody is declined on points alone. Under the shortlist bar they are held for
 * a person to read, with the breakdown beside them.
 */

export const KINSHIP_FACILITY_SLUG = "kinship";

/**
 * From Ivie's brief (22 Oct 2026) and Kinship's careers pages: two visiting
 * nurses, earlier in their careers, and one Kinkeeper, a senior nurse with at
 * least three years after registration. Both in Lagos; interviews before the
 * end of October.
 */
export const KINSHIP_ROLES = [
  { value: "kinkeeper", label: "Kinkeeper, Registered Nurse (part time, Lagos)", subSpecialty: "Kinkeeper", minYears: 3 },
  { value: "visiting", label: "Visiting Nurse / Care Worker (full time, Lagos)", subSpecialty: "Visiting Nurse", minYears: 2 },
] as const;

export type KinshipRole = (typeof KINSHIP_ROLES)[number]["value"];

type Option = { value: string; label: string; points?: number; fail?: string; flag?: string };
type Question = { label: string; options: Option[]; scenario?: boolean };

export const SHORTLIST_AT = 70;

export const KINSHIP_QUESTIONS = {
  licence: {
    label: "Your NMCN licence",
    options: [
      { value: "valid", label: "Current and in good standing", points: 0 },
      { value: "renewing", label: "Expired, renewal submitted", points: 0, flag: "licence renewal in progress, cannot start until renewed" },
      { value: "notice", label: "Notification of registration only, licence not yet issued", points: 0, flag: "licence not yet issued" },
      { value: "none", label: "I do not hold an NMCN licence", fail: "no NMCN licence" },
    ],
  },
  years: {
    label: "Post-registration nursing experience",
    options: [
      { value: "lt1", label: "Under 1 year", points: 0 },
      { value: "1-2", label: "1 to 2 years", points: 8 },
      { value: "2-3", label: "2 to 3 years", points: 12 },
      { value: "3-5", label: "3 to 5 years", points: 16 },
      { value: "5+", label: "More than 5 years", points: 20 },
    ],
  },
  elderly: {
    label: "How much of your nursing has been with older patients?",
    options: [
      { value: "most", label: "Most of it, on a geriatric or care-of-the-elderly unit or in home care", points: 15 },
      { value: "regular", label: "Regularly, on a general ward", points: 8 },
      { value: "little", label: "Occasionally", points: 3 },
      { value: "none", label: "Hardly at all", points: 0 },
    ],
  },
  homeVisits: {
    label: "Have you nursed patients in their own homes?",
    options: [
      { value: "1y+", label: "Yes, for a year or more", points: 10 },
      { value: "lt1y", label: "Yes, for under a year", points: 6 },
      { value: "none", label: "No", points: 0 },
    ],
  },
  bls: {
    label: "Basic Life Support",
    options: [
      { value: "current", label: "Certified in the last two years", points: 5 },
      { value: "lapsed", label: "Certified, now lapsed", points: 2 },
      { value: "none", label: "Not certified", points: 0 },
    ],
  },
  confusion: {
    scenario: true,
    label:
      "You visit Mrs A, 82, at home. She is more confused than last week, her lips are dry and she has not passed urine since morning. Her daughter in London asked for updates on Sundays only. What do you do first?",
    options: [
      { value: "a", label: "Note it in her record and include it in Sunday's update", points: 0 },
      { value: "b", label: "Call the daughter now and ask her what she would like you to do", points: 4 },
      { value: "c", label: "Encourage fluids, leave, and check again on the next visit", points: 2 },
      { value: "d", label: "Check her vital signs and blood glucose, escalate to the doctor today, then tell the daughter today", points: 15 },
    ],
  },
  dose: {
    scenario: true,
    label:
      "At 9pm Mr B's son in Houston messages you. His father's blood pressure readings have been high all week and he asks whether to double the amlodipine. What do you do?",
    options: [
      { value: "a", label: "Tell him yes, since the readings are high", points: 0 },
      { value: "b", label: "Share the readings, explain a dose change is the doctor's decision, and arrange a review for the next day", points: 15 },
      { value: "c", label: "Reply in the morning when you are back at work", points: 3 },
      { value: "d", label: "Tell him to contact the doctor himself", points: 2 },
    ],
  },
  meds: {
    scenario: true,
    label:
      "On a first visit you find two packs of the same blood pressure tablet, from two pharmacies under two brand names. Mr C has been taking both every morning. What do you do?",
    options: [
      { value: "a", label: "Remove one pack, tell Mr C to take only the other, and move on", points: 4 },
      { value: "b", label: "Leave it, since both were prescribed", points: 0 },
      { value: "c", label: "Check his blood pressure now, call the prescriber to confirm one supply, and update his medicines list and his family", points: 15 },
      { value: "d", label: "Ask the family to sort it out with the pharmacy", points: 1 },
    ],
  },
  start: {
    label: "How soon could you start?",
    options: [
      { value: "now", label: "Immediately", points: 5 },
      { value: "1m", label: "Within a month", points: 4 },
      { value: "3m", label: "Within three months", points: 2 },
      { value: "later", label: "Later than that", points: 0 },
    ],
  },
  hours: {
    label: "Can you work between 8am and 8pm, Monday to Friday?",
    options: [
      { value: "full", label: "Yes, any of those hours", points: 0 },
      { value: "part", label: "Some of those hours", points: 0, flag: "only part of the 8am to 8pm window" },
      { value: "no", label: "No", fail: "not available in the working window" },
    ],
  },
  lagos: {
    label: "Kinship's members are in Lagos. Where would you work from?",
    options: [
      { value: "island", label: "I live on or near Lagos Island (Ikoyi, VI, Lekki, Ajah)", points: 0 },
      { value: "mainland", label: "I live on the Lagos Mainland", points: 0 },
      { value: "move", label: "I live outside Lagos and would move to Lagos for this role", points: 0, flag: "would relocate to Lagos" },
      { value: "no", label: "I cannot work in Lagos", fail: "cannot work in Lagos" },
    ],
  },
  app: {
    label: "Every visit is reported on Kinship's app, with AI tools that help write the report. How do you feel about that?",
    options: [
      { value: "daily", label: "I already use apps and AI tools for work most days", points: 0 },
      { value: "fine", label: "Comfortable, I would pick it up quickly", points: 0 },
      { value: "unsure", label: "I would need a lot of help", points: 0, flag: "not comfortable with the app" },
    ],
  },
  phone: {
    label: "Do you have a smartphone with reliable mobile data?",
    options: [
      { value: "yes", label: "Yes", points: 0 },
      { value: "no", label: "No", fail: "no smartphone with data" },
    ],
  },
  checks: {
    label: "Will you consent to a licence check, two professional references and a background check before starting?",
    options: [
      { value: "yes", label: "Yes", points: 0 },
      { value: "no", label: "No", fail: "will not consent to pre-start checks" },
    ],
  },
} satisfies Record<string, Question>;

export type KinshipQuestionKey = keyof typeof KINSHIP_QUESTIONS;
export const KINSHIP_QUESTION_KEYS = Object.keys(KINSHIP_QUESTIONS) as KinshipQuestionKey[];

export const UPDATE_PROMPT =
  "Write the two or three line WhatsApp message you would send Mrs A's daughter in London after that visit.";

export interface KinshipAnswers extends Record<KinshipQuestionKey, string> {
  role: KinshipRole;
  salary: string;
  update: string;
}

const pick = (key: KinshipQuestionKey, value: string) => (KINSHIP_QUESTIONS[key].options as Option[]).find((o) => o.value === value);

export interface KinshipScore {
  score: number;
  fails: string[];
  flags: string[];
  scenarioPoints: number;
  status: "SHORTLISTED" | "REVIEWING" | "REJECTED";
}

export function scoreKinship(a: KinshipAnswers): KinshipScore {
  let score = 0;
  let scenarioPoints = 0;
  const fails: string[] = [];
  const flags: string[] = [];
  for (const key of KINSHIP_QUESTION_KEYS) {
    const opt = pick(key, a[key]);
    if (!opt) continue;
    if (opt.fail) fails.push(opt.fail);
    if (opt.flag) flags.push(opt.flag);
    score += opt.points ?? 0;
    if ((KINSHIP_QUESTIONS[key] as Question).scenario) scenarioPoints += opt.points ?? 0;
  }
  // Under the role's experience bar, or without a current licence, a person reads
  // the application first: Kinship may still want a strong nurse a year short.
  const role = KINSHIP_ROLES.find((r) => r.value === a.role);
  const years = { lt1: 0, "1-2": 1, "2-3": 2, "3-5": 3, "5+": 5 }[a.years] ?? 0;
  const experienced = !role || years >= role.minYears;
  if (!experienced) flags.push(`under ${role!.minYears} years post-registration, which the ${role!.subSpecialty} role asks for`);
  const licenceHeld = a.licence === "valid";
  const status = fails.length ? "REJECTED" : score >= SHORTLIST_AT && licenceHeld && experienced ? "SHORTLISTED" : "REVIEWING";
  return { score, fails, flags, scenarioPoints, status };
}

/** What the admin page shows beside the score: the verdict first, then what it rests on. */
export function explanation(a: KinshipAnswers, s: KinshipScore): string {
  const label = (key: KinshipQuestionKey) => pick(key, a[key])?.label ?? a[key];
  const verdict =
    s.status === "REJECTED"
      ? `Screened out: ${s.fails.join("; ")}.`
      : s.status === "SHORTLISTED"
        ? `Shortlist. ${s.score}/100, scenarios ${s.scenarioPoints}/45.`
        : `Read before deciding. ${s.score}/100, scenarios ${s.scenarioPoints}/45.`;
  return [
    verdict,
    s.flags.length ? `Flags: ${s.flags.join("; ")}.` : "",
    `Experience ${label("years")}. Older patients: ${label("elderly")}. Home nursing: ${label("homeVisits")}. BLS: ${label("bls")}.`,
    `Lagos: ${label("lagos")}. App: ${label("app")}. Start: ${label("start")}. Pay asked: ${a.salary}.`,
    `Message to the daughter: "${a.update}"`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function answerLines(a: KinshipAnswers): string[] {
  return KINSHIP_QUESTION_KEYS.map((k) => `${KINSHIP_QUESTIONS[k].label}\n  ${pick(k, a[k])?.label ?? a[k]}`);
}
