/**
 * The screening questions for the Zuri Health roles in Nairobi, defined once
 * for the form at /oncadre/kenya and the route that scores it.
 *
 * Zuri want people ready to relocate, so the first question is the filter and
 * the rest separate a candidate we can put forward from one we cannot yet: a
 * specialist qualification, three years as a specialist, and willingness to
 * register with the KMPDC. Anyone who misses a gate is still recorded, as
 * REJECTED with the reason in the notes, so a judgement call can be reversed.
 */

export const KENYA_FACILITY_SLUG = "zuri-health";

export const KENYA_ROLES = [
  { value: "obgyn", label: "Consultant Obstetrician and Gynaecologist", subSpecialty: "Obstetrics & Gynaecology" },
  { value: "physician", label: "Consultant Physician (Internal Medicine)", subSpecialty: "Internal Medicine" },
  { value: "paediatrician", label: "Consultant Paediatrician", subSpecialty: "Paediatrics" },
] as const;

type Option = { value: string; label: string; pass: boolean; reason?: string };

export const KENYA_QUESTIONS = {
  relocate: {
    label: "Are you ready to relocate to Nairobi for this role?",
    options: [
      { value: "3m", label: "Yes, within three months", pass: true },
      { value: "6m", label: "Yes, within six months", pass: true },
      { value: "offer", label: "Possibly, depending on the offer", pass: true },
      { value: "no", label: "No, I cannot relocate", pass: false, reason: "cannot relocate" },
    ],
  },
  qualification: {
    label: "Your specialist qualification",
    options: [
      { value: "fellowship", label: "Fellowship of the West African or National Postgraduate College", pass: true },
      { value: "uk", label: "UK membership or CCT (MRCOG, MRCP, MRCPCH)", pass: true },
      { value: "other", label: "Another specialist qualification", pass: true },
      { value: "training", label: "Still in residency training", pass: false, reason: "not yet a specialist" },
    ],
  },
  years: {
    label: "Years practising since you qualified as a specialist",
    options: [
      { value: "lt3", label: "Under 3 years", pass: false, reason: "under 3 years as a specialist" },
      { value: "3-5", label: "3 to 5 years", pass: true },
      { value: "5-10", label: "5 to 10 years", pass: true },
      { value: "10+", label: "More than 10 years", pass: true },
    ],
  },
  kmpdc: {
    label: "Registration with the Kenya Medical Practitioners and Dentists Council",
    options: [
      { value: "registered", label: "I am already registered", pass: true },
      { value: "willing", label: "Not yet, and I am willing to apply", pass: true },
      { value: "no", label: "I would rather not go through it", pass: false, reason: "will not register with KMPDC" },
    ],
  },
  notice: {
    label: "How soon could you start?",
    options: [
      { value: "now", label: "Immediately", pass: true },
      { value: "1m", label: "Within a month", pass: true },
      { value: "3m", label: "Within three months", pass: true },
      { value: "later", label: "Later than three months", pass: true },
    ],
  },
} satisfies Record<string, { label: string; options: Option[] }>;

export type KenyaQuestionKey = keyof typeof KENYA_QUESTIONS;
export const KENYA_QUESTION_KEYS = Object.keys(KENYA_QUESTIONS) as KenyaQuestionKey[];

/** Asked of the obstetric applicant only: the JD makes it a requirement. */
export const CAESAREAN_QUESTION = "Do you manage deliveries and perform caesarean sections independently?";

export interface KenyaAnswers {
  role: string;
  relocate: string;
  qualification: string;
  years: string;
  kmpdc: string;
  notice: string;
  caesarean?: boolean;
  currentPost: string;
}

/** The reasons someone misses the bar; empty means they go forward. */
export function screenReasons(a: KenyaAnswers): string[] {
  const reasons: string[] = [];
  for (const key of KENYA_QUESTION_KEYS) {
    const opt = (KENYA_QUESTIONS[key].options as Option[]).find((o) => o.value === a[key]);
    if (opt && !opt.pass && opt.reason) reasons.push(opt.reason);
  }
  if (a.role === "obgyn" && a.caesarean === false) reasons.push("does not perform caesarean sections independently");
  return reasons;
}

/** The answers as readable lines, for the match notes and the internal alert. */
export function answerLines(a: KenyaAnswers): string[] {
  const label = (key: KenyaQuestionKey) => (KENYA_QUESTIONS[key].options as Option[]).find((o) => o.value === a[key])?.label ?? a[key];
  return [
    `Relocate to Nairobi: ${label("relocate")}`,
    `Qualification: ${label("qualification")}`,
    `Years as a specialist: ${label("years")}`,
    `KMPDC: ${label("kmpdc")}`,
    `Start: ${label("notice")}`,
    ...(a.role === "obgyn" ? [`Independent caesarean sections: ${a.caesarean ? "Yes" : "No"}`] : []),
    `Current post: ${a.currentPost}`,
  ];
}
