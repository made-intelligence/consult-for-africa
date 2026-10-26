import crypto from "crypto";
import { BANK_VERSION, PER_SECTION, QUESTION_BY_ID, QUESTIONS, SECTIONS, TIME_LIMIT_MINUTES, type SectionKey } from "./questionBank";

/** One drawn question: its id and the order its options were shown in. */
export interface PaperItem {
  id: string;
  /** order[shownIndex] = index in the bank's options array. */
  order: number[];
}

export type Answers = Record<string, number>;

export interface SectionScore {
  correct: number;
  total: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Draw a paper: the same number of questions from every section, so two
 * applicants are tested on the same balance of material even though they see
 * different questions in a different order.
 */
export function drawPaper(): { bankVersion: string; paper: PaperItem[]; deadlineAt: Date } {
  const paper: PaperItem[] = [];
  for (const key of Object.keys(SECTIONS) as SectionKey[]) {
    const pool = shuffle(QUESTIONS.filter((q) => q.section === key)).slice(0, PER_SECTION);
    for (const q of pool) paper.push({ id: q.id, order: shuffle([0, 1, 2, 3]) });
  }
  return {
    bankVersion: BANK_VERSION,
    paper: shuffle(paper),
    deadlineAt: new Date(Date.now() + TIME_LIMIT_MINUTES * 60_000),
  };
}

/** What the applicant's browser receives. Never carries the answer. */
export function paperForClient(paper: PaperItem[]) {
  return paper.map((item) => {
    const q = QUESTION_BY_ID.get(item.id);
    if (!q) throw new Error(`Question ${item.id} is not in the bank`);
    return { id: q.id, section: SECTIONS[q.section], stem: q.stem, options: item.order.map((i) => q.options[i]) };
  });
}

export function scorePaper(paper: PaperItem[], answers: Answers): { score: number; sectionScores: Record<string, SectionScore> } {
  const sectionScores: Record<string, SectionScore> = {};
  let correct = 0;
  for (const item of paper) {
    const q = QUESTION_BY_ID.get(item.id);
    if (!q) continue;
    const s = (sectionScores[q.section] ??= { correct: 0, total: 0 });
    s.total += 1;
    const shown = answers[item.id];
    if (typeof shown === "number" && item.order[shown] === q.answer) {
      s.correct += 1;
      correct += 1;
    }
  }
  return { score: paper.length ? Math.round((correct / paper.length) * 100) : 0, sectionScores };
}

export function readPaper(json: unknown): PaperItem[] {
  return Array.isArray(json) ? (json as PaperItem[]) : [];
}

export function readAnswers(json: unknown): Answers {
  return json && typeof json === "object" && !Array.isArray(json) ? (json as Answers) : {};
}

/** A grace period for the last answer in flight when the clock runs out. */
export const GRACE_MS = 30_000;
