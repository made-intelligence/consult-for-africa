import type { Source } from "../types";
import { gdelt } from "./gdelt";
import { nairaland } from "./nairaland";
import { googleReviews, googleTrends } from "./dataforseo";
import { instagramProfiles } from "./instagram";
import { tiktok, instagramComments, facebookPages } from "./apify";
import { x } from "./x";
import { awario } from "./awario";
import { youtube } from "./youtube";
import { website } from "./website";

/**
 * Every source, with how often it is worth asking. Paid sources run as often
 * as the thing changes, not as often as the cron fires: reviews and follower
 * counts move daily, search interest weekly. A source without its key reports
 * why on the watch's page and is skipped.
 */
export const SOURCES: { source: Source; everyHours: number }[] = [
  { source: googleReviews, everyHours: 24 },
  { source: instagramProfiles, everyHours: 24 },
  { source: instagramComments, everyHours: 24 },
  { source: tiktok, everyHours: 24 },
  { source: x, everyHours: 6 },
  { source: awario, everyHours: 6 },
  { source: gdelt, everyHours: 6 },
  { source: nairaland, everyHours: 3 },
  { source: facebookPages, everyHours: 48 },
  { source: youtube, everyHours: 24 },
  { source: website, everyHours: 24 },
  { source: googleTrends, everyHours: 24 * 7 },
];

export function sourceByKey(key: string): Source | undefined {
  return SOURCES.find((s) => s.source.key === key)?.source;
}
