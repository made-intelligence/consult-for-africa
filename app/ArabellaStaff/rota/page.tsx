import type { Metadata } from "next";
import RotaView from "@/components/staff/RotaView";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";

export const metadata: Metadata = { title: "Arabella Women's Health: the rota", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ArabellaRota({ searchParams }: { searchParams: Promise<{ month?: string; dept?: string }> }) {
  return <RotaView site={ARABELLA} session={await getSiteSession(ARABELLA)} sp={await searchParams} />;
}
