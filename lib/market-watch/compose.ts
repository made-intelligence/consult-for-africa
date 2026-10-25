import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Block, DashboardData, Kpi, Section, Tone } from "@/lib/client-dashboard/types";
import { aspectLabel } from "./taxonomy";
import { METRIC } from "./types";

/**
 * The week, as the client's leadership reads it. Every figure is computed here
 * from stored mentions and metrics; the model only writes the headline and the
 * three or four things to do about it, from those figures. The result is an
 * ordinary DashboardData, so it lands as a draft on /admin/client-dashboards
 * and a partner publishes it like any other client dashboard.
 *
 * Aggregates only: no author, no handle, no quote that could identify someone.
 */

const DAY = 86_400_000;
const MODEL = process.env.MARKET_WATCH_MODEL ?? "claude-opus-5-5";

const SOURCE_NAME: Record<string, string> = {
  GOOGLE_REVIEW: "Google reviews",
  NEWS: "News",
  X: "X",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  REDDIT: "Reddit",
  NAIRALAND: "Nairaland",
  WEB: "Web, forums and blogs",
  WEBSITE_CHANGE: "Competitor websites",
  SEARCH_INTEREST: "Google search interest",
};

/** (positive - negative) / (positive + negative) x 100, or null with nothing to go on. */
export function netSentiment(rows: { sentiment: string | null }[]): number | null {
  const pos = rows.filter((r) => r.sentiment === "POSITIVE").length;
  const neg = rows.filter((r) => r.sentiment === "NEGATIVE").length;
  return pos + neg === 0 ? null : Math.round(((pos - neg) / (pos + neg)) * 100);
}

function pctChange(now: number, before: number): string {
  if (before === 0) return now === 0 ? "no change" : "new this week";
  const d = Math.round(((now - before) / before) * 100);
  return `${d >= 0 ? "+" : ""}${d}% on the week before`;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

export interface Composed {
  data: DashboardData;
  title: string;
  asOf: Date;
  /** Plain figures, for the brief email. */
  facts: Record<string, unknown>;
}

export async function composeWeek(watchId: string, asOf = new Date()): Promise<Composed> {
  const watch = await prisma.marketWatch.findUniqueOrThrow({
    where: { id: watchId },
    include: { entities: { where: { active: true }, orderBy: { createdAt: "asc" } } },
  });
  const own = watch.entities.filter((e) => e.role === "OWN");
  const ownIds = new Set(own.map((e) => e.id));
  const end = asOf.getTime();
  const weekStart = new Date(end - 7 * DAY);
  const prevStart = new Date(end - 14 * DAY);
  const monthStart = new Date(end - 30 * DAY);
  const seriesStart = new Date(end - 84 * DAY);

  const mentions = await prisma.watchMention.findMany({
    where: { watchId, relevant: true, publishedAt: { gte: seriesStart, lte: asOf } },
    select: {
      id: true, entityId: true, source: true, publishedAt: true, sentiment: true, aspects: true, rating: true,
      isLead: true, isComplaint: true, isRisk: true, summary: true, ownerReply: true, ownerRepliedAt: true,
    },
  });
  // Website changes are moves, not talk; they do not count towards share of voice.
  const talk = mentions.filter((m) => m.source !== "WEBSITE_CHANGE");
  const isOwn = (m: { entityId: string | null }) => !!m.entityId && ownIds.has(m.entityId);
  const inRange = (m: { publishedAt: Date }, from: Date, to = asOf) => m.publishedAt >= from && m.publishedAt <= to;

  const ownWeek = talk.filter((m) => isOwn(m) && inRange(m, weekStart));
  const ownPrev = talk.filter((m) => isOwn(m) && inRange(m, prevStart, weekStart));
  const ownMonth = talk.filter((m) => isOwn(m) && inRange(m, monthStart));
  const monthAll = talk.filter((m) => m.entityId && inRange(m, monthStart));

  const nsWeek = netSentiment(ownWeek);
  const nsPrev = netSentiment(ownPrev);
  const sov = monthAll.length ? Math.round((ownMonth.length / monthAll.length) * 100) : null;

  // Latest value of a metric per entity, and its value about 30 days earlier.
  const metrics = await prisma.watchMetric.findMany({
    where: { watchId, date: { gte: new Date(end - 120 * DAY) } },
    orderBy: { date: "asc" },
  });
  const latest = (entityId: string, metric: string) => [...metrics].reverse().find((m) => m.entityId === entityId && m.metric === metric)?.value ?? null;
  const monthAgo = (entityId: string, metric: string) =>
    [...metrics].reverse().find((m) => m.entityId === entityId && m.metric === metric && m.date.getTime() <= end - 28 * DAY)?.value ?? null;

  const ownReviews90 = await prisma.watchMention.findMany({
    where: { watchId, source: "GOOGLE_REVIEW", entityId: { in: [...ownIds] }, publishedAt: { gte: new Date(end - 90 * DAY) } },
    select: { publishedAt: true, ownerReply: true, ownerRepliedAt: true, rating: true },
  });
  const answered = ownReviews90.filter((r) => r.ownerReply);
  const responseRate = ownReviews90.length ? Math.round((answered.length / ownReviews90.length) * 100) : null;
  const responseHours = median(
    answered.filter((r) => r.ownerRepliedAt).map((r) => (r.ownerRepliedAt!.getTime() - r.publishedAt.getTime()) / 3_600_000),
  );
  const ownRating = own.length ? latest(own[0].id, METRIC.googleRating) : null;

  const kpis: Kpi[] = [
    { label: "Mentions this week", value: ownWeek.length, unit: "count", note: pctChange(ownWeek.length, ownPrev.length), tone: "neutral" },
    {
      label: "Net sentiment",
      value: nsWeek ?? "n/a",
      unit: nsWeek == null ? undefined : "score",
      note: nsPrev == null ? "-100 to +100; positive minus negative" : `${nsPrev} the week before`,
      tone: nsWeek == null ? "neutral" : nsWeek >= 30 ? "good" : nsWeek >= 0 ? "watch" : "concern",
    },
    { label: "Share of voice", value: sov ?? "n/a", unit: sov == null ? undefined : "percent", note: "of talk about you and the competitors we follow, last 30 days", tone: "neutral" },
    {
      label: "Google rating",
      value: ownRating ?? "n/a",
      unit: ownRating == null ? undefined : "score",
      note: own.length && latest(own[0].id, METRIC.googleReviewCount) != null ? `from ${latest(own[0].id, METRIC.googleReviewCount)} reviews` : undefined,
      tone: ownRating == null ? "neutral" : ownRating >= 4.5 ? "good" : ownRating >= 4 ? "watch" : "concern",
    },
    {
      label: "Reviews answered",
      value: responseRate ?? "n/a",
      unit: responseRate == null ? undefined : "percent",
      note: responseHours != null ? `median reply in ${Math.round(responseHours)} hours, last 90 days` : "last 90 days",
      tone: responseRate == null ? "neutral" : responseRate >= 80 ? "good" : responseRate >= 50 ? "watch" : "concern",
    },
  ];

  // Weekly volume for the client's brand over twelve weeks.
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const to = new Date(end - (11 - i) * 7 * DAY);
    const from = new Date(to.getTime() - 7 * DAY);
    return { label: `w/e ${fmtDate(to)}`, value: talk.filter((m) => isOwn(m) && m.publishedAt > from && m.publishedAt <= to).length };
  });

  const sovItems = watch.entities
    .map((e) => ({ label: e.role === "OWN" ? `${e.name} (you)` : e.name, value: monthAll.filter((m) => m.entityId === e.id).length }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);

  const compareRows = watch.entities.map((e) => {
    const m30 = monthAll.filter((m) => m.entityId === e.id);
    const ig = latest(e.id, METRIC.igFollowers);
    const igBefore = monthAgo(e.id, METRIC.igFollowers);
    const tone: Tone | undefined = e.role === "OWN" ? "good" : undefined;
    return {
      label: e.role === "OWN" ? `${e.name} (you)` : e.name,
      values: [
        latest(e.id, METRIC.googleRating),
        latest(e.id, METRIC.googleReviewCount),
        ig,
        ig != null && igBefore != null ? `${ig - igBefore >= 0 ? "+" : ""}${Math.round(ig - igBefore)}` : null,
        m30.length,
        netSentiment(m30),
      ],
      tone,
    };
  });

  const aspectCounts = (rows: typeof talk) => {
    const c = new Map<string, number>();
    for (const r of rows) for (const a of r.aspects) c.set(a, (c.get(a) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ label: aspectLabel(watch.sector, k), value: v }));
  };
  const complaints = aspectCounts(ownMonth.filter((m) => m.sentiment === "NEGATIVE" || m.sentiment === "MIXED"));
  const praise = aspectCounts(ownMonth.filter((m) => m.sentiment === "POSITIVE"));

  const moves = mentions.filter((m) => m.source === "WEBSITE_CHANGE" && inRange(m, monthStart) && m.summary);
  const risks = mentions.filter((m) => m.isRisk && inRange(m, weekStart) && m.summary);
  const leads = mentions.filter((m) => m.isLead && inRange(m, weekStart));
  const nameOf = (id: string | null) => watch.entities.find((e) => e.id === id)?.name ?? "Unmatched";

  const facts = {
    client: watch.name,
    week: `${fmtDate(weekStart)} to ${fmtDate(asOf)}`,
    mentionsThisWeek: ownWeek.length,
    mentionsWeekBefore: ownPrev.length,
    sentimentCountsThisWeek: {
      positive: ownWeek.filter((m) => m.sentiment === "POSITIVE").length,
      negative: ownWeek.filter((m) => m.sentiment === "NEGATIVE").length,
      mixed: ownWeek.filter((m) => m.sentiment === "MIXED").length,
      neutral: ownWeek.filter((m) => m.sentiment === "NEUTRAL" || !m.sentiment).length,
    },
    complaintsThisWeek: ownWeek.filter((m) => m.isComplaint).map((m) => m.summary).filter(Boolean),
    netSentimentThisWeek: nsWeek,
    netSentimentWeekBefore: nsPrev,
    shareOfVoice30d: sov,
    googleRating: ownRating,
    reviewsAnsweredPct90d: responseRate,
    medianReplyHours: responseHours,
    topComplaintThemes30d: complaints.slice(0, 3),
    topPraiseThemes30d: praise.slice(0, 3),
    competitors: compareRows.map((r) => ({ brand: r.label, rating: r.values[0], reviews: r.values[1], igFollowers: r.values[2], igChange30d: r.values[3], mentions30d: r.values[4], netSentiment30d: r.values[5] })),
    competitorMoves: moves.map((m) => `${nameOf(m.entityId)}: ${m.summary}`),
    risksThisWeek: risks.map((m) => `${nameOf(m.entityId)}: ${m.summary}`),
    leadsThisWeek: leads.length,
  };

  const narrative = await writeNarrative(watch.name, facts);

  const sections: Section[] = [
    {
      title: "This week",
      lead: narrative?.oneThing,
      blocks: [
        { kind: "kpis", items: kpis },
        ...(narrative?.actions.length
          ? [{ kind: "findings", title: "What to do", items: narrative.actions.map((a) => ({ headline: a.headline, detail: a.detail, tone: a.tone as Tone })) } satisfies Block]
          : []),
      ],
    },
    {
      title: "How much you are talked about",
      blocks: [
        { kind: "series", title: "Mentions a week", unit: "count", points: weeks },
        { kind: "breakdown", title: "Share of voice, last 30 days", unit: "count", note: "Mentions of each brand across every source we follow", items: sovItems },
      ],
    },
    {
      title: "What people talk about",
      lead: "From reviews, posts and comments about you in the last 30 days.",
      blocks: [
        ...(complaints.length ? [{ kind: "breakdown", title: "Behind the complaints", unit: "count", items: complaints } satisfies Block] : []),
        ...(praise.length ? [{ kind: "breakdown", title: "Behind the praise", unit: "count", items: praise } satisfies Block] : []),
        ...(!complaints.length && !praise.length ? [{ kind: "text", body: "Not enough was said about you this month to pick out themes." } satisfies Block] : []),
      ],
    },
    {
      title: "Against the competition",
      blocks: [
        {
          kind: "compare",
          title: "Where each brand stands",
          note: "Google rating and review count from each brand's Maps listing; Instagram from its public profile; mentions and sentiment over the last 30 days.",
          columns: ["Google rating", "Reviews", "Instagram followers", "Followers, 30 days", "Mentions, 30 days", "Net sentiment"],
          rows: compareRows,
        },
        ...(moves.length
          ? [{ kind: "findings", title: "Competitor moves", items: moves.slice(0, 8).map((m) => ({ headline: nameOf(m.entityId), detail: m.summary!, tone: "watch" as Tone, source: "Competitor website" })) } satisfies Block]
          : []),
      ],
    },
  ];
  if (risks.length) {
    sections.push({
      title: "Risks",
      lead: "Posts and adverts that could become a regulatory or reputational problem, for any brand we follow.",
      blocks: [{ kind: "findings", title: "Flagged this week", items: risks.slice(0, 8).map((m) => ({ headline: nameOf(m.entityId), detail: m.summary!, tone: "concern" as Tone, source: SOURCE_NAME[m.source] })) }],
    });
  }

  const bySource = new Map<string, number>();
  for (const m of mentions.filter((x) => inRange(x, monthStart))) bySource.set(m.source, (bySource.get(m.source) ?? 0) + 1);
  const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ name: SOURCE_NAME[s] ?? s, detail: `${n} items in the last 30 days` }));
  sources.push({ name: "What is not covered", detail: "WhatsApp, private Facebook groups and private accounts cannot be followed." });

  const headline =
    narrative?.headline ??
    `${ownWeek.length} mentions of ${watch.name} this week${nsWeek != null ? `, net sentiment ${nsWeek}` : ""}${sov != null ? `, ${sov}% share of voice` : ""}.`;

  return {
    data: { headline, period: `Week to ${fmtDate(asOf)} ${asOf.getUTCFullYear()}`, sections, sources },
    title: `Market Watch, week to ${fmtDate(asOf)}`,
    asOf,
    facts,
  };
}

const Narrative = z.object({
  headline: z.string(),
  oneThing: z.string(),
  actions: z.array(z.object({ headline: z.string(), detail: z.string(), tone: z.enum(["good", "watch", "concern", "neutral"]) })),
});

async function writeNarrative(client: string, facts: Record<string, unknown>): Promise<z.infer<typeof Narrative> | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const res = await new Anthropic().messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: `You write the weekly market brief that Consult for Africa sends to the leadership of ${client}, a healthcare business in Nigeria. You are given the week's figures. Write:
- headline: one sentence, the single most important thing this week, with its number.
- oneThing: two sentences at most on why it matters.
- actions: two to four things the business should do this week, each a short imperative headline and one sentence of detail, with a tone (concern for problems, watch for things to keep an eye on, good for strengths to press).
Use only the figures given. Do not invent numbers, people or events. Count from sentimentCountsThisWeek; net sentiment ignores neutral and mixed mentions, so -100 can mean one negative mention among neutral ones. With fewer than ten mentions, say the numbers are small.
Never assume anyone's gender; say "the poster" or "they". When you advise replying in public, the reply must never confirm or imply the person is a patient or mention any treatment; invite them to make contact privately. When the figures are thin, say so plainly and suggest what would make them useful. British English. Plain words, no lyricism. Never use the em dash character. Never mention artificial intelligence or name any software product.`,
      output_config: { effort: "medium", format: zodOutputFormat(Narrative) },
      messages: [{ role: "user", content: JSON.stringify(facts, null, 1) }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return null;
    return res.parsed_output;
  } catch (err) {
    console.error("[market-watch] narrative failed", err);
    return null;
  }
}

/** Store the week as a draft on the watch's engagement, for a partner to publish. */
export async function saveWeeklyDraft(watchId: string): Promise<{ dashboardId: string | null; composed: Composed }> {
  const watch = await prisma.marketWatch.findUniqueOrThrow({ where: { id: watchId }, select: { engagementId: true } });
  const composed = await composeWeek(watchId);
  if (!watch.engagementId) return { dashboardId: null, composed };
  const row = await prisma.engagementDashboard.create({
    data: {
      engagementId: watch.engagementId,
      title: composed.title,
      asOf: composed.asOf,
      data: composed.data as object,
      source: "Market Watch weekly composer",
    },
    select: { id: true },
  });
  return { dashboardId: row.id, composed };
}
