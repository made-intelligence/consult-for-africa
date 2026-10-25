import type { WatchEntity } from "@prisma/client";
import type { Source, RawMention, SourceContext, SourceResult } from "../types";
import { fetchJson, num } from "../http";
import { termsFor } from "../match";

/**
 * TikTok, Instagram comments and hashtags, and Facebook pages, through Apify
 * actors. Each run takes minutes, longer than a Vercel function, so fetch starts
 * the run and collect reads its dataset on a later cron.
 *
 * These scrape public pages, which the platforms' terms do not allow. We keep
 * public content only, store the minimum, and honour deletion requests.
 * https://docs.apify.com/api/v2
 */

const BASE = "https://api.apify.com/v2";
/** Hard ceiling per run, so a runaway actor cannot run up the bill. */
const MAX_USD_PER_RUN = Number(process.env.APIFY_MAX_USD_PER_RUN ?? "0.5");

const unavailable = () => (process.env.APIFY_TOKEN ? null : "APIFY_TOKEN is not set");
const headers = () => ({ Authorization: `Bearer ${process.env.APIFY_TOKEN}`, "Content-Type": "application/json" });

async function startRun(actor: string, input: unknown, maxItems: number): Promise<string> {
  const res = await fetchJson<{ data: { id: string } }>(
    `${BASE}/acts/${actor}/runs?maxItems=${maxItems}&maxTotalChargeUsd=${MAX_USD_PER_RUN}`,
    { method: "POST", headers: headers(), body: JSON.stringify(input) },
  );
  return res.data.id;
}

/** The run's items once it has finished, null while it is still going. */
async function runItems<T>(runId: string): Promise<T[] | null> {
  const run = await fetchJson<{ data: { status: string; defaultDatasetId: string } }>(`${BASE}/actor-runs/${runId}`, { headers: headers() });
  const { status, defaultDatasetId } = run.data;
  if (status === "READY" || status === "RUNNING") return null;
  // A run stopped by its charge cap still has useful items; read them.
  if (status !== "SUCCEEDED" && status !== "TIMED-OUT" && status !== "ABORTED") throw new Error(`apify run ${status}`);
  return fetchJson<T[]>(`${BASE}/datasets/${defaultDatasetId}/items?clean=true&format=json`, { headers: headers() }, 60_000);
}

function daysSince(since: Date): number {
  return Math.max(1, Math.ceil((Date.now() - since.getTime()) / 86_400_000));
}

function slowSource(opts: {
  key: string;
  id: Source["id"];
  label: string;
  actor: string;
  maxItems: number;
  input(e: WatchEntity, since: Date): unknown | null;
  shape(item: Record<string, unknown>, e: WatchEntity | null): RawMention | null;
}): Source {
  return {
    key: opts.key,
    id: opts.id,
    label: opts.label,
    unavailable,
    async fetch({ entities, since }) {
      const pending: SourceResult["pending"] = [];
      for (const e of entities) {
        const input = opts.input(e, since);
        if (input) pending.push({ ref: await startRun(opts.actor, input, opts.maxItems), entityId: e.id });
      }
      return { mentions: [], pending };
    },
    async collect(ref: string, ctx: SourceContext & { entityId: string | null }) {
      const items = await runItems<Record<string, unknown>>(ref);
      if (!items) return null;
      const e = ctx.entities.find((x) => x.id === ctx.entityId) ?? null;
      const mentions = items.map((it) => opts.shape(it, e)).filter((m): m is RawMention => !!m && !!m.text);
      return { mentions };
    },
  };
}

const str = (v: unknown) => (typeof v === "string" && v ? v : null);

/** Videos that mention the brand, and the brand's own videos. */
export const tiktok = slowSource({
  key: "tiktok",
  id: "TIKTOK",
  label: "TikTok (Apify)",
  actor: "clockworks~tiktok-scraper",
  maxItems: 100,
  input(e, since) {
    const searchQueries = termsFor(e).filter((t) => !t.startsWith("@")).slice(0, 3);
    const profiles = e.tiktokHandle ? [e.tiktokHandle.replace(/^@/, "")] : [];
    if (!searchQueries.length && !profiles.length) return null;
    return {
      searchQueries,
      profiles,
      resultsPerPage: 30,
      searchSection: "/video",
      oldestPostDateUnified: since.toISOString().slice(0, 10),
      proxyCountryCode: "NG",
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
    };
  },
  shape(it, e) {
    const author = (it.authorMeta ?? {}) as Record<string, unknown>;
    const id = str(it.id);
    if (!id) return null;
    return {
      source: "TIKTOK",
      externalId: id,
      url: str(it.webVideoUrl),
      authorName: str(author.nickName) ?? str(author.name),
      authorHandle: str(author.name),
      authorFollowers: num(author.fans),
      text: str(it.text) ?? "",
      publishedAt: new Date(str(it.createTimeISO) ?? Date.now()),
      likes: num(it.diggCount),
      comments: num(it.commentCount),
      shares: num(it.shareCount),
      views: num(it.playCount),
      // Search results may be about another brand; let the matcher decide.
      entityId: e && str(author.name)?.toLowerCase() === e.tiktokHandle?.replace(/^@/, "").toLowerCase() ? e.id : null,
      raw: { country: it.locationCreated ?? null, language: it.textLanguage ?? null },
    };
  },
});

/** Comments on the brand's last few Instagram posts: where patients actually talk. */
export const instagramComments = slowSource({
  key: "instagram-comments",
  id: "INSTAGRAM",
  label: "Instagram comments (Apify)",
  actor: "apify~instagram-scraper",
  maxItems: 300,
  input(e, since) {
    const handle = e.instagramHandle?.replace(/^@/, "");
    if (!handle) return null;
    return {
      directUrls: [`https://www.instagram.com/${handle}/`],
      resultsType: "comments",
      resultsLimit: 300,
      onlyPostsNewerThan: `${Math.min(daysSince(since) + 14, 60)} days`,
      addParentData: true,
    };
  },
  shape(it, e) {
    const id = str(it.id);
    if (!id) return null;
    return {
      source: "INSTAGRAM",
      externalId: `c_${id}`,
      url: str(it.commentUrl) ?? str(it.postUrl),
      authorHandle: str(it.ownerUsername),
      text: str(it.text) ?? "",
      publishedAt: new Date(str(it.timestamp) ?? Date.now()),
      likes: num(it.likesCount),
      comments: num(it.repliesCount),
      entityId: e?.id ?? null,
      raw: { kind: "comment", postUrl: it.postUrl ?? null },
    };
  },
});

/** Public Facebook page posts, for brands that still live there. */
export const facebookPages = slowSource({
  key: "facebook-pages",
  id: "FACEBOOK",
  label: "Facebook pages (Apify)",
  actor: "apify~facebook-posts-scraper",
  maxItems: 50,
  input(e, since) {
    if (!e.facebookPage) return null;
    const url = e.facebookPage.startsWith("http") ? e.facebookPage : `https://www.facebook.com/${e.facebookPage}`;
    return { startUrls: [{ url }], resultsLimit: 50, onlyPostsNewerThan: `${daysSince(since) + 7} days` };
  },
  shape(it, e) {
    const id = str(it.postId);
    if (!id) return null;
    return {
      source: "FACEBOOK",
      externalId: id,
      url: str(it.url),
      authorName: str(it.pageName),
      text: str(it.text) ?? "",
      publishedAt: new Date(str(it.time) ?? str(it.timestamp) ?? Date.now()),
      likes: num(it.likes),
      comments: num(it.comments),
      shares: num(it.shares),
      entityId: e?.id ?? null,
    };
  },
});
