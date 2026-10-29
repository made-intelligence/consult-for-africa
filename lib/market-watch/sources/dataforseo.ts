import type { Source, RawMention, RawMetric } from "../types";
import { METRIC } from "../types";
import { fetchJson, num } from "../http";

/**
 * Google reviews and search interest, through DataForSEO. Google's own Places
 * API returns five reviews and forbids storing them; the Business Profile API
 * gives everything but only for a profile the client lets us manage. DataForSEO
 * reads the public Maps listing, so it covers competitors too.
 *
 * Reviews are a task: posted on one run, collected on a later one (the standard
 * queue answers within 45 minutes at $0.00075 per ten reviews).
 * https://docs.dataforseo.com/v3/business_data/google/reviews/task_post/
 */

const BASE = "https://api.dataforseo.com/v3";
/** Central Lagos. Reviews are tied to a place id, so this only steers lookups. */
const LAGOS = "6.4541,3.4347,12z";

function authHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

type Envelope<T> = { status_code: number; status_message: string; tasks?: { id: string; status_code: number; status_message: string; result?: T[] | null }[] };

async function call<T>(path: string, body?: unknown): Promise<Envelope<T>> {
  const res = await fetchJson<Envelope<T>>(`${BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }, 60_000);
  if (res.status_code !== 20000) throw new Error(`DataForSEO ${res.status_code}: ${res.status_message}`);
  return res;
}

const unavailable = () =>
  process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD ? null : "DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are not set";

type ReviewItem = {
  review_id: string;
  review_text: string | null;
  original_review_text?: string | null;
  rating?: { value?: number } | null;
  timestamp: string;
  profile_name?: string | null;
  review_url?: string | null;
  owner_answer?: string | null;
  owner_timestamp?: string | null;
};
type ReviewResult = { cid?: string; place_id?: string; title?: string; rating?: { value?: number; votes_count?: number }; reviews_count?: number; items?: ReviewItem[] | null };

export const googleReviews: Source = {
  key: "google-reviews",
  id: "GOOGLE_REVIEW",
  label: "Google reviews",
  unavailable,
  async fetch({ entities }) {
    const withPlace = entities.filter((e) => e.googleCid || e.googlePlaceId);
    if (withPlace.length === 0) return { mentions: [] };
    const tasks = withPlace.map((e) => ({
      ...(e.googleCid ? { cid: e.googleCid } : { place_id: e.googlePlaceId }),
      location_coordinate: LAGOS,
      language_code: "en",
      // Newest first; 100 covers a week for any clinic in Lagos.
      depth: 100,
      sort_by: "newest",
      tag: e.id,
    }));
    const res = await call<unknown>("/business_data/google/reviews/task_post", tasks);
    const pending = (res.tasks ?? []).map((t, i) => ({ ref: t.id, entityId: withPlace[i].id }));
    return { mentions: [], pending };
  },
  async collect(ref, { entityId }) {
    const res = await call<ReviewResult>(`/business_data/google/reviews/task_get/${ref}`);
    const task = res.tasks?.[0];
    // 40601/40602: task in queue or in progress.
    if (!task || task.status_code === 40601 || task.status_code === 40602) return null;
    if (task.status_code !== 20000) throw new Error(`reviews task ${task.status_code}: ${task.status_message}`);
    const r = task.result?.[0];
    if (!r) return { mentions: [] };
    const mentions: RawMention[] = [];
    for (const it of r.items ?? []) {
      // The whole page every time: a review already stored only has its reply updated.
      const publishedAt = new Date(it.timestamp);
      mentions.push({
        source: "GOOGLE_REVIEW",
        externalId: it.review_id,
        url: it.review_url,
        authorName: it.profile_name,
        text: it.original_review_text || it.review_text || "",
        publishedAt,
        rating: num(it.rating?.value),
        ownerReply: it.owner_answer,
        ownerRepliedAt: it.owner_timestamp ? new Date(it.owner_timestamp) : null,
        entityId,
      });
    }
    const metrics: RawMetric[] = [];
    if (entityId && r.rating?.value != null) metrics.push({ entityId, metric: METRIC.googleRating, value: r.rating.value });
    const count = r.reviews_count ?? r.rating?.votes_count;
    if (entityId && count != null) metrics.push({ entityId, metric: METRIC.googleReviewCount, value: count });
    return { mentions, metrics };
  },
};

type TrendsResult = { items?: { type: string; keywords?: string[]; data?: { date_from: string; values: (number | null)[]; missing_data?: boolean }[] }[] };

/**
 * Relative Google search interest in Nigeria for each brand name, all asked in
 * one task so the numbers share a scale (Trends values are relative, 0 to 100).
 * Weekly is enough; the composer reads the latest point.
 */
export const googleTrends: Source = {
  key: "google-trends",
  id: "SEARCH_INTEREST",
  label: "Google search interest",
  unavailable,
  async fetch({ entities }) {
    const metrics: RawMetric[] = [];
    // Trends takes five keywords per task.
    for (let i = 0; i < entities.length; i += 5) {
      const group = entities.slice(i, i + 5);
      const res = await call<TrendsResult>("/keywords_data/google_trends/explore/live", [{
        keywords: group.map((e) => e.name),
        location_name: "Nigeria",
        time_range: "past_90_days",
        type: "web",
        item_types: ["google_trends_graph"],
      }]);
      const graph = res.tasks?.[0]?.result?.[0]?.items?.find((x) => x.type === "google_trends_graph");
      for (const point of graph?.data ?? []) {
        if (point.missing_data) continue;
        point.values.forEach((v, k) => {
          if (v != null && group[k]) metrics.push({ entityId: group[k].id, metric: METRIC.searchInterest, value: v, date: new Date(point.date_from) });
        });
      }
    }
    return { mentions: [], metrics };
  },
};

type MapsItem = { title: string; cid?: string; place_id?: string; address?: string; rating?: { value?: number; votes_count?: number }; category?: string };

/** Find a business on Google Maps by name, for the admin's "find place" button. */
export async function findPlaces(query: string): Promise<{ title: string; cid: string | null; placeId: string | null; address: string | null; rating: number | null; reviews: number | null; category: string | null }[]> {
  if (unavailable()) throw new Error(unavailable()!);
  const res = await call<{ items?: MapsItem[] | null }>("/serp/google/maps/live/advanced", [{
    keyword: query,
    location_coordinate: LAGOS,
    language_code: "en",
    depth: 10,
  }]);
  return (res.tasks?.[0]?.result?.[0]?.items ?? []).map((it) => ({
    title: it.title,
    cid: it.cid ?? null,
    placeId: it.place_id ?? null,
    address: it.address ?? null,
    rating: it.rating?.value ?? null,
    reviews: it.rating?.votes_count ?? null,
    category: it.category ?? null,
  }));
}
