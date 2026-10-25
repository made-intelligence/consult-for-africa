import { createHash } from "node:crypto";
import type { Source, RawMention } from "../types";
import { fetchWithTimeout, sleep } from "../http";
import { termsFor, orQuery } from "../match";

/**
 * News, from the GDELT DOC 2.0 API. Free and keyless, with good Nigerian
 * coverage, but it returns headlines only (no body, author or engagement) and
 * allows one request every five seconds, so entities are asked in turn. It
 * matches loosely ("Lagoon Hospitals" finds Cuban headlines), so the search is
 * held to Nigerian outlets; the reader still drops what is off-topic.
 * https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
 */

/** GDELT is slow and throttles hard; one patient retry, then move on. */
async function ask(url: string): Promise<Article[] | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await sleep(8_000);
    try {
      const res = await fetchWithTimeout(url, {}, 45_000);
      const body = await res.text();
      if (res.ok && body.trim().startsWith("{")) return (JSON.parse(body) as { articles?: Article[] }).articles ?? [];
    } catch {
      // network reset under throttling; retry
    }
  }
  return null;
}

type Article = { url: string; title: string; seendate: string; domain: string; language: string; sourcecountry: string };

function parseSeen(s: string): Date {
  // "20261024T210000Z"
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : new Date();
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

export const gdelt: Source = {
  key: "news-gdelt",
  id: "NEWS",
  label: "News (GDELT)",
  unavailable: () => null,
  async fetch({ entities, since }) {
    const mentions: RawMention[] = [];
    const failed: string[] = [];
    // GDELT's rolling window is three months.
    const floor = new Date(Date.now() - 89 * 86_400_000);
    const start = since > floor ? since : floor;
    for (const [i, e] of entities.entries()) {
      if (i > 0) await sleep(5_500);
      const terms = termsFor(e).filter((t) => !t.startsWith("@"));
      if (terms.length === 0) continue;
      const q = `${terms.length > 1 ? `(${orQuery(terms)})` : orQuery(terms)} sourcecountry:NI`;
      const url =
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}` +
        `&mode=artlist&format=json&maxrecords=250&sort=datedesc` +
        `&startdatetime=${stamp(start)}&enddatetime=${stamp(new Date())}`;
      const articles = await ask(url);
      if (!articles) {
        failed.push(e.name);
        continue;
      }
      for (const a of articles) {
        mentions.push({
          source: "NEWS",
          externalId: createHash("sha1").update(a.url).digest("hex"),
          url: a.url,
          authorName: a.domain,
          title: a.title,
          text: a.title,
          publishedAt: parseSeen(a.seendate),
          // GDELT matched the body, which we cannot see, so trust the query.
          entityId: e.id,
          raw: { domain: a.domain, language: a.language, country: a.sourcecountry },
        });
      }
    }
    // Every entity failing is a broken source, not a quiet week.
    if (failed.length && failed.length === entities.length) throw new Error(`GDELT did not answer for ${failed.join(", ")}`);
    return { mentions };
  },
};
