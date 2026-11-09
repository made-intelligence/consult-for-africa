import { ARABELLA, type StaffSite } from "@/lib/staffSites";
import { ARABELLA_DAILY, PRINCIPAL } from "@/lib/arabella-daily";
import type { DailyConfig } from "@/lib/dailyReturn";

/** Staff sites that keep a daily return, for the evening chase and the morning summary. */
export interface DailySite {
  site: StaffSite;
  config: DailyConfig;
  /** How the morning email greets the principal, and names her in the chase. */
  principal: string;
}

export const DAILY_SITES: DailySite[] = [{ site: ARABELLA, config: ARABELLA_DAILY, principal: PRINCIPAL }];
