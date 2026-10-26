import { prisma } from "@/lib/prisma";
import type { Prisma, WatchEntity } from "@prisma/client";
import { SOURCES, sourceByKey } from "./sources";
import type { RawMention, RawMetric, SourceResult } from "./types";
import { matchEntity } from "./match";

/**
 * One pass over a watch: ask every source that is due, collect slow jobs that
 * have finished, and store what came back. Each source fails alone and leaves
 * a WatchRun saying why, so a broken key shows as a broken source rather than
 * as a quiet week.
 */

/** How far back the first run of a source reaches. */
const FIRST_RUN_DAYS = 30;
/** A slow job not finished in this long is abandoned. */
const PENDING_TTL_HOURS = 48;

function today(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayOf(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function storeMentions(watchId: string, entities: WatchEntity[], mentions: RawMention[]): Promise<number> {
  if (mentions.length === 0) return 0;
  // One source can return the same item twice (two search terms); keep the last.
  const byKey = new Map(mentions.map((m) => [`${m.source}:${m.externalId}`, m]));
  const unique = [...byKey.values()];
  const existing = await prisma.watchMention.findMany({
    where: { watchId, OR: unique.map((m) => ({ source: m.source, externalId: m.externalId })) },
    select: { id: true, source: true, externalId: true },
  });
  const known = new Map(existing.map((e) => [`${e.source}:${e.externalId}`, e.id]));

  const fresh: Prisma.WatchMentionCreateManyInput[] = [];
  for (const m of unique) {
    const id = known.get(`${m.source}:${m.externalId}`);
    if (id) {
      // Counts and owner replies move; the text and the reading do not.
      await prisma.watchMention.update({
        where: { id },
        data: {
          likes: m.likes ?? undefined,
          comments: m.comments ?? undefined,
          shares: m.shares ?? undefined,
          views: m.views ?? undefined,
          rating: m.rating ?? undefined,
          ownerReply: m.ownerReply ?? undefined,
          ownerRepliedAt: m.ownerRepliedAt ?? undefined,
        },
      });
      continue;
    }
    const entityId = m.entityId ?? matchEntity(`${m.title ?? ""} ${m.text}`, entities)?.id ?? null;
    fresh.push({
      watchId,
      entityId,
      source: m.source,
      externalId: m.externalId.slice(0, 255),
      url: m.url ?? null,
      authorName: m.authorName ?? null,
      authorHandle: m.authorHandle ?? null,
      authorFollowers: m.authorFollowers ?? null,
      title: m.title ?? null,
      text: m.text.slice(0, 10_000),
      publishedAt: Number.isNaN(m.publishedAt.getTime()) ? new Date() : m.publishedAt,
      rating: m.rating ?? null,
      likes: m.likes ?? null,
      comments: m.comments ?? null,
      shares: m.shares ?? null,
      views: m.views ?? null,
      ownerReply: m.ownerReply ?? null,
      ownerRepliedAt: m.ownerRepliedAt ?? null,
      raw: (m.raw ?? undefined) as Prisma.InputJsonValue | undefined,
    });
  }
  if (fresh.length) await prisma.watchMention.createMany({ data: fresh, skipDuplicates: true });
  return fresh.length;
}

async function storeMetrics(watchId: string, metrics: RawMetric[] | undefined, source: RawMention["source"]): Promise<void> {
  for (const m of metrics ?? []) {
    const date = m.date ? dayOf(m.date) : today();
    await prisma.watchMetric.upsert({
      where: { entityId_metric_date: { entityId: m.entityId, metric: m.metric, date } },
      create: { watchId, entityId: m.entityId, metric: m.metric, date, value: m.value, source },
      update: { value: m.value },
    });
  }
}

async function store(watchId: string, entities: WatchEntity[], result: SourceResult, source: RawMention["source"]): Promise<number> {
  const inserted = await storeMentions(watchId, entities, result.mentions);
  await storeMetrics(watchId, result.metrics, source);
  return inserted;
}

export interface RunReport {
  source: string;
  status: "ran" | "skipped" | "error" | "collected" | "waiting";
  detail?: string;
  inserted?: number;
}

export async function runWatch(watchId: string, opts: { force?: boolean; only?: string[] } = {}): Promise<RunReport[]> {
  const watch = await prisma.marketWatch.findUniqueOrThrow({
    where: { id: watchId },
    include: { entities: { where: { active: true }, orderBy: { createdAt: "asc" } } },
  });
  const entities = watch.entities;
  const report: RunReport[] = [];
  if (entities.length === 0) return [{ source: "all", status: "skipped", detail: "no brands set up" }];

  for (const { source, everyHours } of SOURCES) {
    if (opts.only && !opts.only.includes(source.key)) continue;
    const reason = source.unavailable();
    if (reason) {
      report.push({ source: source.key, status: "skipped", detail: reason });
      continue;
    }
    const last = await prisma.watchRun.findFirst({
      where: { watchId, source: source.key, pendingRef: null, error: null, finishedAt: { not: null } },
      orderBy: { startedAt: "desc" },
    });
    if (!opts.force && last && Date.now() - last.startedAt.getTime() < everyHours * 3_600_000) continue;
    const since = last?.startedAt ?? new Date(Date.now() - FIRST_RUN_DAYS * 86_400_000);

    const run = await prisma.watchRun.create({ data: { watchId, source: source.key } });
    try {
      const result = await source.fetch({ entities, since });
      const inserted = await store(watchId, entities, result, source.id);
      for (const p of result.pending ?? []) {
        await prisma.watchRun.create({
          data: { watchId, source: source.key, pendingRef: p.ref, pendingEntityId: p.entityId ?? null, finishedAt: new Date() },
        });
      }
      await prisma.watchRun.update({
        where: { id: run.id },
        data: { finishedAt: new Date(), fetched: result.mentions.length, inserted },
      });
      report.push({ source: source.key, status: "ran", inserted, detail: result.pending?.length ? `${result.pending.length} job(s) started` : undefined });
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      await prisma.watchRun.update({ where: { id: run.id }, data: { finishedAt: new Date(), error: message.slice(0, 2000) } });
      report.push({ source: source.key, status: "error", detail: message.slice(0, 200) });
    }
  }

  report.push(...(await collectPending(watchId, entities)));
  await prisma.marketWatch.update({ where: { id: watchId }, data: { lastRunAt: new Date() } });
  return report;
}

async function collectPending(watchId: string, entities: WatchEntity[]): Promise<RunReport[]> {
  const report: RunReport[] = [];
  const jobs = await prisma.watchRun.findMany({ where: { watchId, pendingRef: { not: null }, collectedAt: null }, orderBy: { startedAt: "asc" } });
  for (const job of jobs) {
    const source = sourceByKey(job.source);
    if (!source?.collect || source.unavailable()) continue;
    if (Date.now() - job.startedAt.getTime() > PENDING_TTL_HOURS * 3_600_000) {
      await prisma.watchRun.update({ where: { id: job.id }, data: { collectedAt: new Date(), error: "abandoned: not finished in 48 hours" } });
      continue;
    }
    try {
      const result = await source.collect(job.pendingRef!, { entities, since: job.startedAt, entityId: job.pendingEntityId });
      if (!result) {
        report.push({ source: source.key, status: "waiting" });
        continue;
      }
      const inserted = await store(watchId, entities, result, source.id);
      await prisma.watchRun.update({ where: { id: job.id }, data: { collectedAt: new Date(), fetched: result.mentions.length, inserted } });
      report.push({ source: source.key, status: "collected", inserted });
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      await prisma.watchRun.update({ where: { id: job.id }, data: { collectedAt: new Date(), error: message.slice(0, 2000) } });
      report.push({ source: source.key, status: "error", detail: message.slice(0, 200) });
    }
  }
  return report;
}

/** NDPA: keep public posts no longer than we need them. Aggregates live on in WatchMetric. */
export const RETENTION_MONTHS = 13;

export async function pruneOld(): Promise<number> {
  const cutoff = new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - RETENTION_MONTHS);
  const { count } = await prisma.watchMention.deleteMany({ where: { publishedAt: { lt: cutoff }, starred: false } });
  await prisma.watchRun.deleteMany({ where: { startedAt: { lt: cutoff } } });
  await prisma.watchPageSnapshot.deleteMany({ where: { fetchedAt: { lt: cutoff } } });
  return count;
}
