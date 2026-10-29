import { prisma } from "@/lib/prisma";
import type { WatchAlertKind } from "@prisma/client";
import { emailWatchAlerts } from "@/lib/email";

/**
 * What is worth interrupting somebody for, the same day. Everything else waits
 * for the weekly brief. Volumes in Lagos are small, so a spike needs both a
 * statistical jump (two standard deviations over the last four weeks) and a
 * floor of five mentions; otherwise three posts on a Tuesday would page people.
 */

/** Only fresh items alert, so a first run's 30-day backfill does not. */
const FRESH_HOURS = 72;
/** An author or post this big turns a complaint into a problem. */
const BIG_FOLLOWERS = 10_000;
const BIG_VIEWS = 20_000;
const SPIKE_FLOOR = 5;

type NewAlert = { kind: WatchAlertKind; title: string; detail: string; dedupeKey: string; mentionId?: string };

function short(s: string, n = 220): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export async function raiseAlerts(watchId: string): Promise<number> {
  const fresh = new Date(Date.now() - FRESH_HOURS * 3_600_000);
  const mentions = await prisma.watchMention.findMany({
    where: { watchId, relevant: true, publishedAt: { gte: fresh }, classifiedAt: { not: null } },
    include: { entity: { select: { name: true, role: true } } },
  });

  const alerts: NewAlert[] = [];
  for (const m of mentions) {
    const own = m.entity?.role === "OWN";
    const who = m.entity?.name ?? "an unmatched brand";
    const line = m.summary ?? short(m.text);
    if (m.source === "GOOGLE_REVIEW" && own && ((m.rating ?? 5) <= 2 || m.sentiment === "NEGATIVE") && !m.ownerReply) {
      alerts.push({ kind: "NEGATIVE_REVIEW", title: `${m.rating ?? "?"}-star Google review of ${who}`, detail: line, dedupeKey: `review:${m.id}`, mentionId: m.id });
    } else if (m.isRisk) {
      alerts.push({ kind: "RISK", title: `Possible risk: ${who}`, detail: line, dedupeKey: `risk:${m.id}`, mentionId: m.id });
    } else if (own && m.sentiment === "NEGATIVE" && ((m.authorFollowers ?? 0) >= BIG_FOLLOWERS || (m.views ?? 0) >= BIG_VIEWS)) {
      alerts.push({ kind: "NEGATIVE_MENTION", title: `Negative post with reach about ${who}`, detail: line, dedupeKey: `neg:${m.id}`, mentionId: m.id });
    } else if (m.isLead) {
      alerts.push({ kind: "LEAD", title: `Someone is asking for what ${own ? who : "the client"} sells`, detail: line, dedupeKey: `lead:${m.id}`, mentionId: m.id });
    } else if (m.source === "WEBSITE_CHANGE") {
      alerts.push({ kind: "COMPETITOR_MOVE", title: `${who} changed its website`, detail: line, dedupeKey: `web:${m.id}`, mentionId: m.id });
    }
  }
  alerts.push(...(await spikes(watchId)));

  let created = 0;
  for (const a of alerts) {
    const res = await prisma.watchAlert.createMany({ data: [{ watchId, ...a }], skipDuplicates: true });
    created += res.count;
  }
  return created;
}

async function spikes(watchId: string): Promise<NewAlert[]> {
  const own = await prisma.watchEntity.findMany({ where: { watchId, role: "OWN", active: true } });
  const out: NewAlert[] = [];
  const now = Date.now();
  for (const e of own) {
    const since = new Date(now - 29 * 86_400_000);
    const rows = await prisma.watchMention.findMany({
      where: { entityId: e.id, relevant: true, publishedAt: { gte: since } },
      select: { publishedAt: true, sentiment: true },
    });
    const daily = (pred: (r: { sentiment: string | null }) => boolean) => {
      const days = Array.from({ length: 29 }, () => 0);
      for (const r of rows) {
        if (!pred(r)) continue;
        const i = Math.floor((now - r.publishedAt.getTime()) / 86_400_000);
        if (i >= 0 && i < 29) days[i]++;
      }
      const [last24, ...base] = days;
      const mean = base.reduce((s, v) => s + v, 0) / base.length;
      const sd = Math.sqrt(base.reduce((s, v) => s + (v - mean) ** 2, 0) / base.length);
      return { last24, mean, threshold: Math.max(SPIKE_FLOOR, mean + 2 * sd) };
    };
    const day = new Date().toISOString().slice(0, 10);
    const all = daily(() => true);
    if (all.last24 >= all.threshold) {
      out.push({
        kind: "SPIKE",
        title: `${e.name} is being talked about more than usual`,
        detail: `${all.last24} mentions in the last 24 hours against a usual ${all.mean.toFixed(1)} a day.`,
        dedupeKey: `spike:${e.id}:${day}`,
      });
    }
    const neg = daily((r) => r.sentiment === "NEGATIVE");
    if (neg.last24 >= neg.threshold) {
      out.push({
        kind: "SPIKE",
        title: `Negative talk about ${e.name} has jumped`,
        detail: `${neg.last24} negative mentions in the last 24 hours against a usual ${neg.mean.toFixed(1)} a day.`,
        dedupeKey: `negspike:${e.id}:${day}`,
      });
    }
  }
  return out;
}

/** Email every alert not yet sent, in one message per watch. */
export async function sendAlerts(watchId: string): Promise<number> {
  const watch = await prisma.marketWatch.findUniqueOrThrow({ where: { id: watchId }, select: { id: true, name: true, alertEmails: true } });
  const unsent = await prisma.watchAlert.findMany({
    where: { watchId, emailedAt: null },
    orderBy: { createdAt: "asc" },
    include: { mention: { select: { url: true, source: true, replyDraft: true } } },
  });
  if (unsent.length === 0) return 0;
  if (watch.alertEmails.length) {
    for (const to of watch.alertEmails) {
      await emailWatchAlerts({
        to,
        watchId: watch.id,
        watchName: watch.name,
        alerts: unsent.map((a) => ({ kind: a.kind, title: a.title, detail: a.detail, url: a.mention?.url ?? null, replyDraft: a.mention?.replyDraft ?? null })),
      });
    }
  }
  // Marked sent even with nobody to send to, so adding a recipient later does not replay history.
  await prisma.watchAlert.updateMany({ where: { id: { in: unsent.map((a) => a.id) } }, data: { emailedAt: new Date() } });
  return unsent.length;
}
