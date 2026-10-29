import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { watchSession } from "@/lib/market-watch/access";
import { SOURCES } from "@/lib/market-watch/sources";
import WatchActions from "@/components/market-watch/WatchActions";
import AlertAck from "@/components/market-watch/AlertAck";
import { Card, Pill, SourceTag, ago, daysAgo } from "@/components/market-watch/ui";

export const dynamic = "force-dynamic";

// One watch: what came in, what needs doing, and whether every source is working.

const COVERS: Record<string, string> = {
  "google-reviews": "Ratings and full review text for you and competitors",
  "instagram-profiles": "Followers, posts, likes and comment counts",
  "instagram-comments": "What people say under each post",
  tiktok: "Videos that mention the brands, and their own",
  x: "Posts naming the brands, last 7 days",
  awario: "Wider web: forums, blogs, Reddit",
  "news-gdelt": "Nigerian and international outlets",
  nairaland: "Threads that reach the front page",
  "facebook-pages": "Public page posts",
  youtube: "Videos and their counts",
  "website-changes": "Competitors' price and service pages",
  "google-trends": "Google searches for each brand in Nigeria",
};

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await watchSession())) redirect("/dashboard");
  const { id } = await params;
  const weekAgo = daysAgo(7);
  const watch = await prisma.marketWatch.findUnique({
    where: { id },
    include: { client: { select: { name: true } }, engagement: { select: { name: true } }, _count: { select: { entities: true } } },
  });
  if (!watch) notFound();

  const [week, unread, leads, corrected, alerts, runs] = await Promise.all([
    prisma.watchMention.count({ where: { watchId: id, publishedAt: { gte: weekAgo } } }),
    prisma.watchMention.count({ where: { watchId: id, classifiedAt: null } }),
    prisma.watchMention.count({ where: { watchId: id, isLead: true, relevant: true, publishedAt: { gte: weekAgo } } }),
    prisma.watchMention.count({ where: { watchId: id, correctedBy: { not: null }, updatedAt: { gte: weekAgo } } }),
    prisma.watchAlert.findMany({ where: { watchId: id, acknowledgedAt: null }, orderBy: { createdAt: "desc" }, take: 20, include: { mention: { select: { url: true } } } }),
    prisma.watchRun.findMany({ where: { watchId: id, pendingRef: null }, orderBy: { startedAt: "desc" }, take: 200 }),
  ]);
  const lastRun = (key: string) => runs.find((r) => r.source === key);

  const tile = (label: string, value: string | number, note: string) => (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold" style={{ color: "#0F2744" }}>{value}</p>
      <p className="text-xs text-gray-500">{note}</p>
    </Card>
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title={watch.name}
        subtitle={`Market Watch · ${watch.sector} · ${watch._count.entities} brands · ${watch.engagement ? `linked to ${watch.engagement.name}` : "not linked to a client portal"}`}
        backHref="/admin/market-watch"
        action={<WatchActions id={watch.id} hasEngagement={!!watch.engagementId} />}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
            {tile("New mentions, 7 days", week, `${unread} not yet read`)}
            {tile("Open alerts", alerts.length, alerts.length ? `${alerts.filter((a) => a.kind === "RISK").length} risk, ${alerts.filter((a) => a.kind === "NEGATIVE_REVIEW").length} negative reviews` : "Nothing waiting")}
            {tile("Leads", leads, "People asking where to go")}
            {tile("Corrected by staff", corrected, "Tags changed this week")}
            {tile("Last run", watch.lastRunAt ? ago(watch.lastRunAt) : "never", watch.status === "PAUSED" ? "Paused" : "Runs every 3 hours")}
          </div>

          <div className="flex gap-3 text-sm">
            <Link href={`/admin/market-watch/${id}/mentions`} className="font-semibold underline" style={{ color: "#0F2744" }}>Open the mentions feed</Link>
            <Link href={`/admin/market-watch/${id}/mentions?flag=complaint&open=1`} className="underline text-gray-600">Complaints not yet handled</Link>
            <Link href={`/admin/market-watch/${id}/mentions?flag=lead`} className="underline text-gray-600">Leads</Link>
          </div>

          {alerts.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-bold mb-3" style={{ color: "#0F2744" }}>Alerts</h2>
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <Pill tone={a.kind === "LEAD" ? "green" : a.kind === "COMPETITOR_MOVE" ? "blue" : a.kind === "SPIKE" ? "amber" : "red"}>{a.kind.replace(/_/g, " ").toLowerCase()}</Pill>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "#0F2744" }}>{a.title}</p>
                      <p className="text-sm text-gray-600">{a.detail}</p>
                      <p className="text-xs text-gray-400">{ago(a.createdAt)}{a.mention?.url && <> · <a href={a.mention.url} target="_blank" rel="noreferrer" className="underline">original</a></>}</p>
                    </div>
                    <AlertAck id={a.id} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-bold" style={{ color: "#0F2744" }}>Sources</h2>
              <p className="text-xs text-gray-500">A source without its key is skipped and says why, so a quiet week is never a silent failure.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3">Source</th><th className="py-2 pr-3">Covers</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Last run</th><th className="py-2">Runs every</th>
                  </tr>
                </thead>
                <tbody>
                  {SOURCES.map(({ source, everyHours }) => {
                    const missing = source.unavailable();
                    const r = lastRun(source.key);
                    return (
                      <tr key={source.key} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td className="py-2.5 pr-3"><span className="flex items-center gap-2"><SourceTag source={source.id} /><strong style={{ color: "#0F2744" }}>{source.label}</strong></span></td>
                        <td className="py-2.5 pr-3 text-gray-600">{COVERS[source.key]}</td>
                        <td className="py-2.5 pr-3">{missing ? <Pill tone="amber">Needs key</Pill> : r?.error ? <Pill tone="red">Failing</Pill> : <Pill tone="green">Connected</Pill>}</td>
                        <td className="py-2.5 pr-3 text-gray-600">
                          {missing ? <span className="text-xs">{missing}</span> : r ? <>{ago(r.startedAt)} · {r.error ? <span className="text-xs" style={{ color: "#B91C1C" }}>{r.error.slice(0, 80)}</span> : `${r.inserted} new`}</> : "not yet"}
                        </td>
                        <td className="py-2.5 text-gray-600">{everyHours >= 168 ? "Weekly" : `${everyHours} hours`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
