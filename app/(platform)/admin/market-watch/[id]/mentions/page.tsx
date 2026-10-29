import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { watchSession } from "@/lib/market-watch/access";
import { aspectLabel, aspectsFor } from "@/lib/market-watch/taxonomy";
import MentionActions from "@/components/market-watch/MentionActions";
import { Card, Pill, SourceTag, SOURCE_META, SENTIMENT_TONE, ago, compact } from "@/components/market-watch/ui";

export const dynamic = "force-dynamic";

// The raw feed, for CFA staff only. Filters live in the URL so a filtered view can be shared.

const PAGE = 50;
type Search = { brand?: string; source?: string; feel?: string; aspect?: string; flag?: string; open?: string; q?: string; page?: string; all?: string };

export default async function MentionsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  if (!(await watchSession())) redirect("/dashboard");
  const { id } = await params;
  const s = await searchParams;
  const watch = await prisma.marketWatch.findUnique({ where: { id }, include: { entities: { orderBy: [{ role: "asc" }, { createdAt: "asc" }] } } });
  if (!watch) notFound();

  const where: Prisma.WatchMentionWhereInput = { watchId: id };
  if (!s.all) where.relevant = { not: false };
  if (s.brand) where.entityId = s.brand;
  if (s.source) where.source = s.source as Prisma.WatchMentionWhereInput["source"];
  if (s.feel) where.sentiment = s.feel as Prisma.WatchMentionWhereInput["sentiment"];
  if (s.aspect) where.aspects = { has: s.aspect };
  if (s.flag === "lead") where.isLead = true;
  if (s.flag === "complaint") where.isComplaint = true;
  if (s.flag === "risk") where.isRisk = true;
  if (s.flag === "reply") where.replyDraft = { not: null };
  if (s.open) where.handledAt = null;
  if (s.q) where.OR = [{ text: { contains: s.q, mode: "insensitive" } }, { summary: { contains: s.q, mode: "insensitive" } }];
  const page = Math.max(0, Number(s.page ?? 0) || 0);

  const [total, rows] = await Promise.all([
    prisma.watchMention.count({ where }),
    prisma.watchMention.findMany({ where, orderBy: { publishedAt: "desc" }, skip: page * PAGE, take: PAGE, include: { entity: { select: { name: true } } } }),
  ]);

  const href = (patch: Partial<Search>) => {
    const next = { ...s, ...patch, page: undefined } as Record<string, string | undefined>;
    if ("page" in patch) next.page = patch.page;
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/admin/market-watch/${id}/mentions${qs ? `?${qs}` : ""}`;
  };
  const chip = (label: string, active: boolean, to: string) => (
    <Link key={label} href={to} className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold mr-1 mb-1" style={{ background: active ? "#0F2744" : "#F1F5F9", color: active ? "white" : "#475569" }}>{label}</Link>
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Mentions" subtitle={`${watch.name} · ${total} matching`} backHref={`/admin/market-watch/${id}`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid gap-5 lg:grid-cols-[230px_1fr]">
          <Card className="p-4 space-y-4 h-fit text-sm">
            <form action={`/admin/market-watch/${id}/mentions`}>
              {Object.entries(s).filter(([k, v]) => v && k !== "q" && k !== "page").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
              <input name="q" defaultValue={s.q} placeholder="Search mentions" className="w-full rounded-lg px-3 py-1.5 text-sm" style={{ border: "1px solid #e5eaf0" }} />
            </form>
            <div><p className="font-semibold mb-1" style={{ color: "#0F2744" }}>Brand</p>
              {chip("All", !s.brand, href({ brand: undefined }))}
              {watch.entities.map((e) => chip(e.name, s.brand === e.id, href({ brand: e.id })))}
            </div>
            <div><p className="font-semibold mb-1" style={{ color: "#0F2744" }}>Source</p>
              {chip("All", !s.source, href({ source: undefined }))}
              {Object.entries(SOURCE_META).filter(([k]) => k !== "SEARCH_INTEREST" && k !== "REDDIT").map(([k, m]) => chip(m.label, s.source === k, href({ source: k })))}
            </div>
            <div><p className="font-semibold mb-1" style={{ color: "#0F2744" }}>Feeling</p>
              {chip("All", !s.feel, href({ feel: undefined }))}
              {["NEGATIVE", "MIXED", "POSITIVE", "NEUTRAL"].map((f) => chip(f.charAt(0) + f.slice(1).toLowerCase(), s.feel === f, href({ feel: f })))}
            </div>
            <div><p className="font-semibold mb-1" style={{ color: "#0F2744" }}>Topic</p>
              {chip("All", !s.aspect, href({ aspect: undefined }))}
              {Object.entries(aspectsFor(watch.sector)).map(([k, l]) => chip(l, s.aspect === k, href({ aspect: k })))}
            </div>
            <div><p className="font-semibold mb-1" style={{ color: "#0F2744" }}>Flags</p>
              {chip("Any", !s.flag, href({ flag: undefined }))}
              {[["lead", "Leads"], ["complaint", "Complaints"], ["risk", "Risks"], ["reply", "Reply drafted"]].map(([k, l]) => chip(l, s.flag === k, href({ flag: k })))}
              <div className="mt-2 space-y-1">
                {chip(s.open ? "Not yet handled ✓" : "Not yet handled", !!s.open, href({ open: s.open ? undefined : "1" }))}
                {chip(s.all ? "Including off-topic ✓" : "Including off-topic", !!s.all, href({ all: s.all ? undefined : "1" }))}
              </div>
            </div>
          </Card>

          <Card>
            {rows.length === 0 && <p className="p-6 text-sm text-gray-500">Nothing matches. Widen the filters, or run the watch.</p>}
            <ul>
              {rows.map((m) => {
                const reach = m.views ? `${compact(m.views)} views` : m.authorFollowers ? `${compact(m.authorFollowers)} followers` : null;
                return (
                  <li key={m.id} className="flex gap-3 p-4" style={{ borderTop: "1px solid #f1f5f9", opacity: m.handledAt ? 0.6 : 1 }}>
                    <SourceTag source={m.source} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">
                        <strong style={{ color: "#0F2744" }}>{m.authorHandle ? `@${m.authorHandle}` : m.authorName ?? "Anonymous"}</strong>
                        {" · "}{SOURCE_META[m.source]?.label}
                        {m.rating != null && ` · ${"★".repeat(m.rating)}${"☆".repeat(5 - m.rating)}`}
                        {reach && ` · ${reach}`}
                        {" · "}{ago(m.publishedAt)}
                        {m.entity && ` · about ${m.entity.name}`}
                        {m.url && <> · <a href={m.url} target="_blank" rel="noreferrer" className="underline">open</a></>}
                      </p>
                      {m.title && m.title !== m.text && <p className="text-sm font-semibold mt-1" style={{ color: "#1F2937" }}>{m.title}</p>}
                      <p className="text-sm mt-1 whitespace-pre-line break-words" style={{ color: "#1F2937" }}>{m.text.slice(0, 600)}{m.text.length > 600 ? "…" : ""}</p>
                      {m.summary && <p className="text-xs mt-2 rounded-md px-2 py-1 inline-block" style={{ background: "#F8FAFB", color: "#374151" }}>{m.summary}</p>}
                      {m.ownerReply && <p className="text-xs mt-1 text-gray-500">Owner replied: {m.ownerReply.slice(0, 200)}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.relevant === false && <Pill>Off-topic</Pill>}
                        {m.sentiment && <Pill tone={SENTIMENT_TONE[m.sentiment]}>{m.sentiment.charAt(0) + m.sentiment.slice(1).toLowerCase()}</Pill>}
                        {m.isRisk && <Pill tone="red">Risk</Pill>}
                        {m.isComplaint && <Pill tone="amber">Complaint</Pill>}
                        {m.isLead && <Pill tone="green">Lead</Pill>}
                        {m.source === "WEBSITE_CHANGE" && <Pill tone="blue">Competitor move</Pill>}
                        {m.aspects.map((a) => <Pill key={a}>{aspectLabel(watch.sector, a)}</Pill>)}
                        {m.language === "pcm" && <Pill>Pidgin</Pill>}
                        {m.correctedBy && <Pill tone="blue">Corrected by {m.correctedBy}</Pill>}
                        {!m.classifiedAt && <Pill>Not yet read</Pill>}
                        {m.handledAt && <Pill>Handled by {m.handledBy}</Pill>}
                      </div>
                    </div>
                    <MentionActions
                      id={m.id}
                      handled={!!m.handledAt}
                      replyDraft={m.replyDraft}
                      reading={{ relevant: m.relevant, sentiment: m.sentiment, isLead: m.isLead, isComplaint: m.isComplaint, isRisk: m.isRisk }}
                    />
                  </li>
                );
              })}
            </ul>
            {total > PAGE && (
              <div className="flex justify-between p-4 text-sm" style={{ borderTop: "1px solid #f1f5f9" }}>
                {page > 0 ? <Link href={href({ page: String(page - 1) })} className="underline">Newer</Link> : <span />}
                <span className="text-gray-500">{page * PAGE + 1} to {Math.min(total, (page + 1) * PAGE)} of {total}</span>
                {(page + 1) * PAGE < total ? <Link href={href({ page: String(page + 1) })} className="underline">Older</Link> : <span />}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
