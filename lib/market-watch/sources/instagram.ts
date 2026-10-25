import type { Source, RawMention, RawMetric } from "../types";
import { METRIC } from "../types";
import { fetchJson, num } from "../http";

/**
 * Instagram profiles through Meta's Business Discovery: followers, post count
 * and recent posts with their likes and comment counts, for any public business
 * or creator account. Official and free; it runs off CFA's own professional
 * account (META_IG_USER_ID) and a long-lived user token (META_ACCESS_TOKEN).
 * It never returns other accounts' comment text; that comes from Apify.
 * https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery
 */

const VERSION = "v26.0";

type Media = { id: string; caption?: string; permalink?: string; timestamp: string; like_count?: number; comments_count?: number; view_count?: number; media_type?: string };
type Discovery = { business_discovery?: { username: string; followers_count?: number; media_count?: number; media?: { data: Media[] } } };

export const instagramProfiles: Source = {
  key: "instagram-profiles",
  id: "INSTAGRAM",
  label: "Instagram profiles (Meta)",
  unavailable: () =>
    process.env.META_IG_USER_ID && process.env.META_ACCESS_TOKEN ? null : "META_IG_USER_ID and META_ACCESS_TOKEN are not set",
  async fetch({ entities, since }) {
    const mentions: RawMention[] = [];
    const metrics: RawMetric[] = [];
    const errors: string[] = [];
    for (const e of entities) {
      const handle = e.instagramHandle?.replace(/^@/, "");
      if (!handle) continue;
      const fields =
        `business_discovery.username(${handle}){followers_count,media_count,` +
        `media.limit(25){id,caption,permalink,timestamp,like_count,comments_count,view_count,media_type}}`;
      const url = `https://graph.facebook.com/${VERSION}/${process.env.META_IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${process.env.META_ACCESS_TOKEN}`;
      let d: Discovery;
      try {
        d = await fetchJson<Discovery>(url);
      } catch (err) {
        // A personal or age-gated account fails alone; the rest still count.
        errors.push(`@${handle}: ${(err as Error).message.slice(0, 120)}`);
        continue;
      }
      const bd = d.business_discovery;
      if (!bd) continue;
      if (bd.followers_count != null) metrics.push({ entityId: e.id, metric: METRIC.igFollowers, value: bd.followers_count });
      if (bd.media_count != null) metrics.push({ entityId: e.id, metric: METRIC.igMediaCount, value: bd.media_count });
      const posts = bd.media?.data ?? [];
      if (posts.length && bd.followers_count) {
        const avg = posts.reduce((s, m) => s + (m.like_count ?? 0) + (m.comments_count ?? 0), 0) / posts.length;
        metrics.push({ entityId: e.id, metric: METRIC.igAvgEngagement, value: Math.round((avg / bd.followers_count) * 10_000) / 100 });
      }
      for (const m of posts) {
        const publishedAt = new Date(m.timestamp);
        // Posts are re-read for 30 days so their counts keep up.
        if (publishedAt < new Date(since.getTime() - 30 * 86_400_000)) continue;
        mentions.push({
          source: "INSTAGRAM",
          externalId: m.id,
          url: m.permalink,
          authorName: e.name,
          authorHandle: bd.username,
          authorFollowers: bd.followers_count ?? null,
          text: m.caption ?? "",
          publishedAt,
          likes: num(m.like_count),
          comments: num(m.comments_count),
          views: num(m.view_count),
          entityId: e.id,
          raw: { kind: "own_post", mediaType: m.media_type },
        });
      }
    }
    if (errors.length && mentions.length === 0 && metrics.length === 0) throw new Error(errors.join("; "));
    return { mentions, metrics };
  },
};
