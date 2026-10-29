import type { Source, RawMention } from "../types";
import { fetchWithTimeout, htmlToText } from "../http";
import { matchEntity } from "../match";

/**
 * Nairaland's front-page Atom feed. Search and thread pages sit behind a
 * Cloudflare challenge, so this sees only threads that reach the front page,
 * matched to brands locally. Low yield, but it is the threads that reach the
 * front page that do the damage.
 */

export const nairaland: Source = {
  key: "nairaland",
  id: "NAIRALAND",
  label: "Nairaland (front page)",
  unavailable: () => null,
  async fetch({ entities, since }) {
    const res = await fetchWithTimeout("https://www.nairaland.com/feed", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CFAMarketWatch/1.0; +https://www.consultforafrica.com)" },
    });
    if (!res.ok) throw new Error(`nairaland feed ${res.status}`);
    const xml = await res.text();
    const mentions: RawMention[] = [];
    for (const entry of xml.split("<entry>").slice(1)) {
      const title = htmlToText(/<title[^>]*>([\s\S]*?)<\/title>/.exec(entry)?.[1] ?? "");
      const link = /<link[^>]*href="([^"]+)"/.exec(entry)?.[1] ?? "";
      const summary = htmlToText((/<summary[^>]*>([\s\S]*?)<\/summary>/.exec(entry)?.[1] ?? "").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
      const updated = /<(?:updated|published)>([^<]+)</.exec(entry)?.[1];
      const publishedAt = updated ? new Date(updated) : new Date();
      if (!link || publishedAt < since) continue;
      const text = `${title}. ${summary}`;
      const e = matchEntity(text, entities);
      if (!e) continue;
      mentions.push({
        source: "NAIRALAND",
        externalId: /nairaland\.com\/(\d+)/.exec(link)?.[1] ?? link,
        url: link,
        title,
        text: summary || title,
        publishedAt,
        entityId: e.id,
      });
    }
    return { mentions };
  },
};
