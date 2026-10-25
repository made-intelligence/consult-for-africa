import type { Source, RawMention } from "../types";
import { fetchJson, num } from "../http";
import { termsFor, orQuery } from "../match";

/**
 * X recent search. Pay per use since February 2026: about $0.005 a post and
 * $0.01 a user returned, so each watch reads at most X_MAX_POSTS_PER_RUN posts
 * a run and the console's spend cap is the backstop. Seven days of history.
 * https://docs.x.com/x-api/posts/search-recent-posts
 */

const MAX_POSTS = Number(process.env.X_MAX_POSTS_PER_RUN ?? "100");

type Tweet = { id: string; text: string; created_at: string; author_id: string; lang?: string; public_metrics?: { like_count: number; retweet_count: number; reply_count: number; quote_count: number; impression_count?: number } };
type User = { id: string; name: string; username: string; public_metrics?: { followers_count: number } };
type Page = { data?: Tweet[]; includes?: { users?: User[] }; meta?: { next_token?: string; result_count: number } };

export const x: Source = {
  key: "x",
  id: "X",
  label: "X (Twitter)",
  unavailable: () => (process.env.X_BEARER_TOKEN ? null : "X_BEARER_TOKEN is not set"),
  async fetch({ entities, since }) {
    const terms = [...new Set(entities.flatMap((e) => termsFor(e)))];
    if (terms.length === 0) return { mentions: [] };
    // 512 characters per query on self-serve; split the terms across queries.
    const queries: string[] = [];
    let cur: string[] = [];
    for (const t of terms) {
      const next = [...cur, t];
      if (cur.length && `(${orQuery(next)}) -is:retweet`.length > 500) {
        queries.push(`(${orQuery(cur)}) -is:retweet`);
        cur = [t];
      } else cur = next;
    }
    if (cur.length) queries.push(`(${orQuery(cur)}) -is:retweet`);

    const weekAgo = new Date(Date.now() - 6.9 * 86_400_000);
    const start = since > weekAgo ? since : weekAgo;
    const mentions: RawMention[] = [];
    let budget = MAX_POSTS;
    for (const q of queries) {
      let next: string | undefined;
      do {
        const params = new URLSearchParams({
          query: q,
          max_results: String(Math.max(10, Math.min(100, budget))),
          start_time: start.toISOString(),
          "tweet.fields": "created_at,public_metrics,lang,author_id",
          expansions: "author_id",
          "user.fields": "username,name,public_metrics",
        });
        if (next) params.set("next_token", next);
        const page = await fetchJson<Page>(`https://api.x.com/2/tweets/search/recent?${params}`, {
          headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
        });
        const users = new Map((page.includes?.users ?? []).map((u) => [u.id, u]));
        for (const t of page.data ?? []) {
          const u = users.get(t.author_id);
          const pm = t.public_metrics;
          mentions.push({
            source: "X",
            externalId: t.id,
            url: `https://x.com/${u?.username ?? "i"}/status/${t.id}`,
            authorName: u?.name,
            authorHandle: u?.username,
            authorFollowers: num(u?.public_metrics?.followers_count),
            text: t.text,
            publishedAt: new Date(t.created_at),
            likes: num(pm?.like_count),
            comments: num(pm?.reply_count),
            shares: pm ? pm.retweet_count + pm.quote_count : null,
            views: num(pm?.impression_count),
            raw: { lang: t.lang },
          });
        }
        budget -= page.data?.length ?? 0;
        next = page.meta?.next_token;
      } while (next && budget > 0);
      if (budget <= 0) break;
    }
    return { mentions };
  },
};
