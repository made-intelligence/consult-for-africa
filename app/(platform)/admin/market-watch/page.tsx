import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { watchSession } from "@/lib/market-watch/access";
import { SECTOR_NAMES } from "@/lib/market-watch/taxonomy";
import NewWatchForm from "@/components/market-watch/NewWatchForm";
import { Card, daysAgo } from "@/components/market-watch/ui";

export const dynamic = "force-dynamic";

// Every brand we listen for, client or our own.

export default async function MarketWatchIndex() {
  if (!(await watchSession())) redirect("/dashboard");
  const weekAgo = daysAgo(7);
  const [watches, clients, engagements] = await Promise.all([
    prisma.marketWatch.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        client: { select: { name: true } },
        _count: { select: { entities: true, alerts: { where: { acknowledgedAt: null } }, mentions: { where: { publishedAt: { gte: weekAgo }, relevant: true } } } },
      },
    }),
    prisma.client.findMany({ where: { status: { not: "BLACKLISTED" } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.engagement.findMany({ where: { status: { not: "CANCELLED" } }, orderBy: { name: "asc" }, select: { id: true, name: true, clientId: true } }),
  ]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Market Watch" subtitle="What the public says about our clients, our brands and their competitors" backHref="/dashboard" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            {watches.length === 0 && <p className="p-6 text-sm text-gray-500">No watches yet. Start one below.</p>}
            <table className="w-full text-sm">
              <tbody>
                {watches.map((w) => (
                  <tr key={w.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/market-watch/${w.id}`} className="font-semibold underline" style={{ color: "#0F2744" }}>{w.name}</Link>
                      <span className="block text-xs text-gray-500">
                        {w.client?.name ?? "Our own brand"} · {w.sector} · {w._count.entities} brands{w.status === "PAUSED" ? " · paused" : ""}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-gray-500 whitespace-nowrap">{w._count.mentions} mentions this week</td>
                    <td className="px-5 py-3 text-right text-xs whitespace-nowrap" style={{ color: w._count.alerts ? "#B91C1C" : "#6B7280" }}>
                      {w._count.alerts} open alert{w._count.alerts === 1 ? "" : "s"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-bold mb-3" style={{ color: "#0F2744" }}>Start a watch</h2>
            <NewWatchForm clients={clients} engagements={engagements} sectors={SECTOR_NAMES} />
          </Card>
        </div>
      </div>
    </div>
  );
}
