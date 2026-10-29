// ─── CadreHealth: Nurse internship assessment, the shape of the paper ───
//
// Safe to import anywhere, including client components: no questions, no answers.

/** Questions drawn per section, and the time allowed for the whole paper. */
export const PER_SECTION = 6;
export const TIME_LIMIT_MINUTES = 50;

export const SECTIONS = {
  FUND: "Fundamentals and the nursing process",
  MEDSURG: "Medical and surgical nursing",
  PHARM: "Pharmacology and drug calculations",
  MCH: "Maternal, newborn and child health",
  IPC: "Infection prevention and patient safety",
  PROF: "Professional practice and ethics",
  EMERG: "Emergency care",
} as const;

export type SectionKey = keyof typeof SECTIONS;

/** Questions on one paper. */
export const QUESTION_COUNT = PER_SECTION * Object.keys(SECTIONS).length;
