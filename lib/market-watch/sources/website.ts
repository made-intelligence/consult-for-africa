import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Source, RawMention } from "../types";
import { fetchWithTimeout, htmlToText } from "../http";

/**
 * Competitors' own pages: price lists, services, team, locations. Each run
 * fetches every tracked URL, and when the text has changed it records what was
 * added and removed as a mention, which the reader then describes in a line
 * ("Added a N1.2m liposuction package"). The first fetch only sets a baseline.
 */

const MAX_TEXT = 60_000;

function sentences(t: string): string[] {
  return t.split(/(?<=[.!?])\s+|\s{2,}|\s[|•·]\s/).map((s) => s.trim()).filter((s) => s.length > 3);
}

export function pageDiff(before: string, after: string): { added: string[]; removed: string[] } {
  const a = new Set(sentences(before));
  const b = new Set(sentences(after));
  return { added: [...b].filter((s) => !a.has(s)), removed: [...a].filter((s) => !b.has(s)) };
}

export const website: Source = {
  key: "website-changes",
  id: "WEBSITE_CHANGE",
  label: "Website changes",
  unavailable: () => null,
  async fetch({ entities }) {
    const mentions: RawMention[] = [];
    for (const e of entities) {
      for (const url of e.trackedUrls) {
        let text: string;
        try {
          const res = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; CFAMarketWatch/1.0)" } });
          if (!res.ok) continue;
          text = htmlToText(await res.text()).slice(0, MAX_TEXT);
        } catch {
          continue;
        }
        const hash = createHash("sha256").update(text).digest("hex");
        const last = await prisma.watchPageSnapshot.findFirst({ where: { entityId: e.id, url }, orderBy: { fetchedAt: "desc" } });
        if (last?.hash === hash) continue;
        await prisma.watchPageSnapshot.create({ data: { entityId: e.id, url, hash, text } });
        if (!last) continue;
        const { added, removed } = pageDiff(last.text, text);
        // Rotating banners and dates change the hash without changing anything said.
        if (added.join(" ").length + removed.join(" ").length < 40) continue;
        mentions.push({
          source: "WEBSITE_CHANGE",
          externalId: `${e.id}:${hash.slice(0, 16)}`,
          url,
          authorName: e.name,
          title: `${e.name} changed ${new URL(url).pathname || "/"}`,
          text: [
            added.length ? `Added: ${added.slice(0, 20).join(" | ")}` : "",
            removed.length ? `Removed: ${removed.slice(0, 20).join(" | ")}` : "",
          ].filter(Boolean).join("\n").slice(0, 4000),
          publishedAt: new Date(),
          entityId: e.id,
        });
      }
    }
    return { mentions };
  },
};
