import type { Metadata } from "next";
import TeamView from "@/components/staff/TeamView";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";

export const metadata: Metadata = { title: "Arabella Women's Health: the team", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ArabellaTeam() {
  return <TeamView site={ARABELLA} session={await getSiteSession(ARABELLA)} />;
}
