import type { Source, RawMention } from "../types";
import { fetchJson, num } from "../http";
import { termsFor, orQuery } from "../match";

/**
 * YouTube videos about each brand, with their counts. search.list has its own
 * quota of 100 calls a day, so one search per entity per run and the cron runs
 * this source once a day at most.
 * https://developers.google.com/youtube/v3/determine_quota_cost
 */

type Search = { items?: { id: { videoId?: string }; snippet: { title: string; description: string; channelTitle: string; publishedAt: string } }[] };
type Videos = { items?: { id: string; statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }[] };

export const youtube: Source = {
  key: "youtube",
  id: "YOUTUBE",
  label: "YouTube",
  unavailable: () => (process.env.YOUTUBE_API_KEY ? null : "YOUTUBE_API_KEY is not set"),
  async fetch({ entities, since }) {
    const key = process.env.YOUTUBE_API_KEY!;
    const mentions: RawMention[] = [];
    for (const e of entities) {
      const terms = termsFor(e).filter((t) => !t.startsWith("@"));
      if (!terms.length) continue;
      const params = new URLSearchParams({
        part: "snippet",
        q: orQuery(terms).replace(/ OR /g, "|"),
        type: "video",
        regionCode: "NG",
        relevanceLanguage: "en",
        publishedAfter: since.toISOString(),
        maxResults: "25",
        key,
      });
      const s = await fetchJson<Search>(`https://www.googleapis.com/youtube/v3/search?${params}`);
      const items = (s.items ?? []).filter((i) => i.id.videoId);
      if (!items.length) continue;
      const v = await fetchJson<Videos>(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${items.map((i) => i.id.videoId).join(",")}&key=${key}`,
      );
      const stats = new Map((v.items ?? []).map((x) => [x.id, x.statistics ?? {}]));
      for (const i of items) {
        const st = stats.get(i.id.videoId!) ?? {};
        mentions.push({
          source: "YOUTUBE",
          externalId: i.id.videoId!,
          url: `https://www.youtube.com/watch?v=${i.id.videoId}`,
          authorName: i.snippet.channelTitle,
          title: i.snippet.title,
          text: `${i.snippet.title}. ${i.snippet.description}`.trim(),
          publishedAt: new Date(i.snippet.publishedAt),
          views: num(st.viewCount),
          likes: num(st.likeCount),
          comments: num(st.commentCount),
        });
      }
    }
    return { mentions };
  },
};
