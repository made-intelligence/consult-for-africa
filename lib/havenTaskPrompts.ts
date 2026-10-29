// The tasks that are an answer rather than an act. A tick on "tell us about a
// near miss" with nothing written is a box ticked about nothing: in the first
// two weeks fourteen of these came in and not one carried a word, so there was
// nothing to act on and nothing to tell the team had changed. These now need a
// sentence before they count.
//
// Keyed by StaffTask.code so the seed and the page cannot drift apart.

export const NOTHING_THIS_WEEK = "Nothing this week";

export interface TaskPrompt {
  question: string;
  placeholder: string;
  /** A real answer for the near miss. Never offered where "nothing" is not true. */
  allowNothing: boolean;
}

export const TASK_PROMPTS: Record<string, TaskPrompt> = {
  "c-nearmiss": {
    question: "What nearly went wrong? One sentence is enough.",
    placeholder: "e.g. Two babies with similar names on the ward, nearly mixed up a feed",
    allowNothing: true,
  },
  "c-timewaster": {
    question: "What wasted your time, and roughly how long?",
    placeholder: "e.g. Walking to the lab twice for one result, about 20 minutes",
    allowNothing: false,
  },
  "c-recognise": {
    question: "Who did something well, and what did they do?",
    placeholder: "e.g. Margaret stayed to settle a frightened mum at handover",
    allowNothing: false,
  },
};

export const MIN_ANSWER = 8;

/** null when acceptable, otherwise the reason to show the person. */
export function checkAnswer(code: string | null | undefined, note: string | undefined): string | null {
  const p = code ? TASK_PROMPTS[code] : undefined;
  if (!p) return null;
  const n = (note ?? "").trim();
  if (p.allowNothing && n === NOTHING_THIS_WEEK) return null;
  if (n.length < MIN_ANSWER) return "Write a sentence first. That is what makes this count.";
  return null;
}
