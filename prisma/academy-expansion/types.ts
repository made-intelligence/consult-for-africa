/**
 * Content format for the Academy expansion (Oct 2026).
 *
 * One file per track in this folder, default-exporting a TrackExpansion.
 * prisma/seed-academy-expansion.ts loads them all without deleting anything:
 * existing tracks keep their enrolments, progress and certificates.
 */

export type Option = { id: "a" | "b" | "c" | "d" | "e"; text: string; isCorrect: boolean };

export type Question = {
  /** MULTIPLE_CHOICE has exactly one correct option; MULTI_SELECT has two or more. */
  type?: "MULTIPLE_CHOICE" | "MULTI_SELECT";
  question: string;
  options: Option[];
  /** Shown after the quiz is submitted. Says why the right answer is right. */
  explanation: string;
  points?: number;
};

export type Section = { title: string; body: string };
export type Exercise = { title: string; instruction: string };

export type ModuleSpec = {
  /** Globally unique across the Academy. */
  slug: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  content: { sections: Section[]; exercises?: Exercise[] };
  resources?: { links?: { title: string; url: string }[]; tools?: string[] };
  questions: Question[];
};

export type NewTrack = {
  name: string;
  description: string;
  level: "FOUNDATION" | "SPECIALIST" | "MASTER";
  category: string;
  iconName: string;
  colorHex: string;
  prerequisites: string[];
  sortOrder: number;
  pricingType: "FREE" | "PAID";
  priceNGN?: number;
  discountPct?: number;
};

export type TrackExpansion = {
  /** Existing track slug to extend, or the slug of the new track. */
  slug: string;
  /** Only for a track that does not exist yet. */
  track?: NewTrack;
  /** Extra questions for modules that already exist, keyed by module slug. */
  topUp?: { moduleSlug: string; questions: Question[] }[];
  /** New modules, appended after the track's existing ones in this order. */
  modules: ModuleSpec[];
};
