import type { Metadata } from "next";
import TeamView from "@/components/staff/TeamView";
import { getStaffSession } from "@/lib/staffAuth";
import { HAVEN } from "@/lib/staffSites";

export const metadata: Metadata = { title: "Haven Paediatric Centre: the team", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  return <TeamView site={HAVEN} session={await getStaffSession()} />;
}
