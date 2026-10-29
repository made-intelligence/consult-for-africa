import type { WatchEntity, WatchSource } from "@prisma/client";

/**
 * One thing somebody said in public, as a source hands it over. Sources only
 * fetch and shape; matching it to a brand, reading it and storing it happen
 * once, in ingest.ts, so every source is treated the same.
 */
export interface RawMention {
  source: WatchSource;
  externalId: string;
  url?: string | null;
  authorName?: string | null;
  authorHandle?: string | null;
  authorFollowers?: number | null;
  title?: string | null;
  text: string;
  publishedAt: Date;
  rating?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  views?: number | null;
  ownerReply?: string | null;
  ownerRepliedAt?: Date | null;
  /**
   * The entity the source was asked about, when the fetch was per entity
   * (a place's reviews, an account's posts). Keyword sources leave it unset
   * and the matcher decides.
   */
  entityId?: string | null;
  raw?: unknown;
}

/** A dated number about an entity, e.g. followers or average rating. */
export interface RawMetric {
  entityId: string;
  metric: string;
  value: number;
  date?: Date;
}

export interface SourceResult {
  mentions: RawMention[];
  metrics?: RawMetric[];
  /** Jobs started on the provider's side, to collect on a later run. */
  pending?: { ref: string; entityId?: string | null }[];
}

export interface SourceContext {
  entities: WatchEntity[];
  /** Fetch only what was published after this. */
  since: Date;
}

export interface Source {
  /** Unique; what WatchRun records. Two sources may store under the same WatchSource. */
  key: string;
  id: WatchSource;
  label: string;
  /** Null when the source can run; otherwise why it cannot, e.g. a missing key. */
  unavailable(): string | null;
  fetch(ctx: SourceContext): Promise<SourceResult>;
  /**
   * For slow sources: collect a job started by fetch. Returns null while the
   * provider is still working, so the job waits for the next run.
   */
  collect?(ref: string, ctx: SourceContext & { entityId: string | null }): Promise<SourceResult | null>;
}

/** Metric names, kept in one place so the composer and the sources agree. */
export const METRIC = {
  googleRating: "google_rating",
  googleReviewCount: "google_review_count",
  igFollowers: "ig_followers",
  igMediaCount: "ig_media_count",
  igAvgEngagement: "ig_avg_engagement",
  tiktokFollowers: "tiktok_followers",
  searchInterest: "search_interest",
} as const;
