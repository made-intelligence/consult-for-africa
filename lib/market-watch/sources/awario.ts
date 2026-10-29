import type { Source, RawMention } from "../types";
import { fetchJson, num } from "../http";

/**
 * Awario as the wide web feed: news, blogs, forums, Reddit, Facebook and
 * Instagram mentions its crawler finds. Each entity points at an Awario alert
 * set up in Awario's own app (WatchEntity.awarioAlertId). Awario gives reach
 * but no engagement counts and no ratings, and stores 3,000 to 50,000 mentions
 * per alert, which is why we keep our own copy.
 * https://awario.com/help/api/
 */

const BASE = "https://api.awario.com/v1.0";

type Mention = {
  id: string | number;
  date: number;
  reach?: number;
  language?: string;
  url?: string;
  title?: string;
  snippet?: string;
  sentiment?: string;
  source?: string;
  location?: string;
  author?: { name?: string; url?: string; audience?: number };
};
type Page = { mentions?: Mention[]; data?: { mentions?: Mention[] }; next?: string };

export const awario: Source = {
  key: "awario",
  id: "WEB",
  label: "Web, forums and blogs (Awario)",
  unavailable: () => (process.env.AWARIO_TOKEN ? null : "AWARIO_TOKEN is not set"),
  async fetch({ entities, since }) {
    const mentions: RawMention[] = [];
    const token = encodeURIComponent(process.env.AWARIO_TOKEN!);
    for (const e of entities) {
      if (!e.awarioAlertId) continue;
      let url: string | null =
        `${BASE}/alerts/${encodeURIComponent(e.awarioAlertId)}/mentions?access_token=${token}` +
        `&date_from=${since.getTime()}&sort_by=date&sort_order=desc&limit=300`;
      for (let pages = 0; url && pages < 10; pages++) {
        const page: Page = await fetchJson<Page>(url);
        for (const m of page.mentions ?? page.data?.mentions ?? []) {
          mentions.push({
            source: "WEB",
            externalId: `aw_${m.id}`,
            url: m.url,
            authorName: m.author?.name,
            authorHandle: m.author?.url ?? null,
            authorFollowers: num(m.author?.audience),
            title: m.title,
            text: m.snippet ?? m.title ?? "",
            publishedAt: new Date(m.date),
            views: num(m.reach),
            entityId: e.id,
            raw: { awarioSource: m.source, awarioSentiment: m.sentiment ?? null, language: m.language, location: m.location },
          });
        }
        url = page.next ? `${BASE}/alerts/${encodeURIComponent(e.awarioAlertId)}/mentions?access_token=${token}&next=${encodeURIComponent(page.next)}` : null;
      }
    }
    return { mentions };
  },
};
