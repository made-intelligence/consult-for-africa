import type { Metadata } from "next";
import RotaView from "@/components/staff/RotaView";
import { getStaffSession } from "@/lib/staffAuth";
import { HAVEN } from "@/lib/staffSites";

export const metadata: Metadata = {
  title: "Haven Paediatric Centre: the rota",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RotaPage({ searchParams }: { searchParams: Promise<{ month?: string; dept?: string }> }) {
  return <RotaView site={HAVEN} session={await getStaffSession()} sp={await searchParams} />;
}
