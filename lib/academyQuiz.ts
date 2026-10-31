import type { TrainingQuestion } from "@prisma/client";

type Option = { id: string; text: string; isCorrect?: boolean };

export function parseOptions(raw: unknown): Option[] | null {
  if (raw == null) return null;
  if (typeof raw === "string") return JSON.parse(raw);
  return Array.isArray(raw) ? (raw as Option[]) : null;
}

/**
 * A question as the learner's browser may see it before submitting: the
 * options without which one is correct, and no explanation. The answers come
 * back from grading, in POST /api/training/progress.
 */
export function publicQuestion(q: TrainingQuestion) {
  const options = parseOptions(q.options);
  return {
    ...q,
    options: options?.map(({ id, text }) => ({ id, text })) ?? null,
    correctAnswer: null,
    explanation: null,
  };
}
