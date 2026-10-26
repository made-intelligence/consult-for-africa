import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { watchSession } from "@/lib/market-watch/access";
import { SECTOR_NAMES } from "@/lib/market-watch/taxonomy";
import SetupForm from "@/components/market-watch/SetupForm";

export const dynamic = "force-dynamic";

// Who we follow and where: the client's own brand first, then its competitors.

export default async function WatchSetupPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) redirect("/dashboard");
  const { id } = await params;
  const [watch, clients, engagements] = await Promise.all([
    prisma.marketWatch.findUnique({ where: { id }, include: { entities: { orderBy: [{ role: "asc" }, { createdAt: "asc" }] } } }),
    prisma.client.findMany({ where: { status: { not: "BLACKLISTED" } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.engagement.findMany({ where: { status: { not: "CANCELLED" } }, orderBy: { name: "asc" }, select: { id: true, name: true, clientId: true } }),
  ]);
  if (!watch) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Brands and sources" subtitle={`${watch.name} · who we follow and where`} backHref={`/admin/market-watch/${id}`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <SetupForm
            watch={{ id: watch.id, name: watch.name, sector: watch.sector, context: watch.context, clientId: watch.clientId, engagementId: watch.engagementId, alertEmails: watch.alertEmails, status: watch.status }}
            entities={watch.entities}
            clients={clients}
            engagements={engagements}
            sectors={SECTOR_NAMES}
          />
        </div>
      </div>
    </div>
  );
}
