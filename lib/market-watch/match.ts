import type { WatchEntity } from "@prisma/client";

/**
 * Which brand a mention is about. Brand names here collide with ordinary words
 * ("Mezo", "Ageless", "Haven"), so a term only counts as a whole word, and an
 * exclude anywhere in the text vetoes the entity. When two brands match, the
 * one named first wins, which is how a comparison post usually reads.
 */

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termRegex(term: string): RegExp {
  // \b fails next to @ and #, so treat those as part of the word.
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escape(term)}(?=$|[^\\p{L}\\p{N}])`, "iu");
}

export function termsFor(e: Pick<WatchEntity, "name" | "keywords" | "instagramHandle" | "xHandle" | "tiktokHandle">): string[] {
  const handles = [e.instagramHandle, e.xHandle, e.tiktokHandle].filter(Boolean).map((h) => `@${h!.replace(/^@/, "")}`);
  return [...new Set([e.name, ...e.keywords, ...handles].map((t) => t.trim()).filter((t) => t.length >= 3))];
}

export function matchEntity(text: string, entities: WatchEntity[]): WatchEntity | null {
  let best: { e: WatchEntity; at: number } | null = null;
  for (const e of entities) {
    if (!e.active) continue;
    if (e.excludes.some((x) => x.trim() && termRegex(x.trim()).test(text))) continue;
    for (const t of termsFor(e)) {
      const m = termRegex(t).exec(text);
      if (m && (!best || m.index < best.at)) best = { e, at: m.index };
    }
  }
  return best?.e ?? null;
}

/** A source-neutral search string: each entity's terms, quoted, ORed. */
export function orQuery(terms: string[]): string {
  return terms.map((t) => (/\s/.test(t) ? `"${t}"` : t)).join(" OR ");
}
