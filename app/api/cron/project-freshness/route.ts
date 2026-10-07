/**
 * Keeps the project record honest.
 *
 * The dashboard was never wrong. It faithfully reported that three in-house
 * projects had run a quarter past their end date with every milestone overdue,
 * and five live client engagements had no milestones, no deliverables, no end
 * date and no engagement manager. Nobody had typed into those records since
 * July. The reporting layer was fine; the discipline underneath it did not
 * exist.
 *
 * So this is the discipline. Daily, it finds every active engagement whose
 * record has fallen behind the work and chases the person who owns it. After
 * three weeks of being chased without a change, it goes to the partner, which
 * is the only sanction a platform actually has.
 *
 * It also catches the structural gaps, because a project with no milestones
 * cannot be late and so never appears in any of the overdue counts. Silence of
 * that kind is worse than a red flag, and it is what hid Lyfe Place and
 * Arabella for months.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { emailProjectUpdateDue, emailPortfolioStale } from "@/lib/email";

export const maxDuration = 120;

/** Days without an engagement update before the manager hears about it. */
const NUDGE_AFTER_DAYS = 14;
/** Days without one before the partner does. */
const ESCALATE_AFTER_DAYS = 21;
/** Chase at most weekly, so a slow week does not become five identical emails. */
const RECHASE_AFTER_DAYS = 7;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export const POST = handler(async function POST(req: NextRequest) { return run(req); });
export const GET = handler(async function GET(req: NextRequest) { return run(req); });

/** What a complete engagement record looks like. Anything missing is named. */
function structuralGaps(e: {
  engagementManagerId: string | null;
  endDate: Date | null;
  milestones: unknown[];
  deliverables: unknown[];
}): string[] {
  const gaps: string[] = [];
  if (!e.engagementManagerId) gaps.push("no engagement manager");
  if (!e.endDate) gaps.push("no end date");
  if (e.milestones.length === 0) gaps.push("no milestones");
  if (e.deliverables.length === 0) gaps.push("no deliverables");
  return gaps;
}

async function run(req: NextRequest): Promise<Response> {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const engagements = await prisma.engagement.findMany({
    where: { status: { in: ["ACTIVE", "AT_RISK"] } },
    select: {
      id: true,
      name: true,
      endDate: true,
      engagementManagerId: true,
      engagementManager: { select: { id: true, name: true, email: true } },
      milestones: { select: { id: true, dueDate: true, status: true } },
      deliverables: { select: { id: true } },
      updates: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  type Item = { id: string; name: string; daysSinceUpdate: number | null; overdueMilestones: number; gaps: string[] };
  const byManager = new Map<string, { name: string; email: string; items: Item[] }>();
  const unowned: Item[] = [];
  const escalations: { id: string; name: string; emName: string; daysSinceUpdate: number | null }[] = [];

  for (const e of engagements) {
    const last = e.updates[0]?.createdAt ?? null;
    const daysSinceUpdate = last ? Math.floor((now.getTime() - last.getTime()) / day) : null;
    const gaps = structuralGaps(e);
    const overdueMilestones = e.milestones.filter(
      (m) => m.dueDate < now && m.status !== "COMPLETED" && m.status !== "SKIPPED",
    ).length;

    const stale = daysSinceUpdate === null || daysSinceUpdate >= NUDGE_AFTER_DAYS;
    if (!stale && gaps.length === 0 && overdueMilestones === 0) continue;

    const item: Item = { id: e.id, name: e.name, daysSinceUpdate, overdueMilestones, gaps };

    // A project with nobody on it cannot be chased, so it goes straight up.
    if (!e.engagementManager) {
      unowned.push(item);
      continue;
    }

    const key = e.engagementManager.id;
    const bucket = byManager.get(key) ?? { name: e.engagementManager.name, email: e.engagementManager.email, items: [] };
    bucket.items.push(item);
    byManager.set(key, bucket);

    if (daysSinceUpdate === null || daysSinceUpdate >= ESCALATE_AFTER_DAYS) {
      escalations.push({ id: e.id, name: e.name, emName: e.engagementManager.name, daysSinceUpdate });
    }
  }

  // Only chase someone who has not been chased this week.
  const chaseCutoff = new Date(now.getTime() - RECHASE_AFTER_DAYS * day);
  const chased: string[] = [];
  for (const [managerId, bucket] of byManager) {
    const recent = await prisma.auditLog.findFirst({
      where: { action: "FRESHNESS_NUDGE", entityId: managerId, createdAt: { gte: chaseCutoff } },
      select: { id: true },
    });
    if (recent) continue;

    try {
      await emailProjectUpdateDue({ emEmail: bucket.email, emName: bucket.name, items: bucket.items });
      await prisma.auditLog.create({
        data: {
          action: "FRESHNESS_NUDGE",
          entityType: "ProjectFreshness",
          entityId: managerId,
          entityName: bucket.name,
          userId: managerId,
          details: { projects: bucket.items.map((i) => i.name) },
        },
      });
      chased.push(`${bucket.name} (${bucket.items.length})`);
    } catch (err) {
      console.error(`[project-freshness] nudge failed for ${bucket.email}:`, err);
    }
  }

  // The partner hears about the three-week cases and about anything unowned,
  // in one email a week rather than a drip.
  const partner = await prisma.user.findFirst({
    where: { role: "PARTNER" },
    select: { id: true, name: true, email: true },
  });
  let escalated = 0;
  const forPartner = [
    ...escalations,
    ...unowned.map((u) => ({ id: u.id, name: u.name, emName: "no engagement manager", daysSinceUpdate: u.daysSinceUpdate })),
  ];
  if (partner && forPartner.length) {
    const recent = await prisma.auditLog.findFirst({
      where: { action: "FRESHNESS_ESCALATION", entityId: partner.id, createdAt: { gte: chaseCutoff } },
      select: { id: true },
    });
    if (!recent) {
      try {
        await emailPortfolioStale({ partnerEmail: partner.email, partnerName: partner.name, items: forPartner });
        await prisma.auditLog.create({
          data: {
            action: "FRESHNESS_ESCALATION",
            entityType: "ProjectFreshness",
            entityId: partner.id,
            entityName: partner.name,
            userId: partner.id,
            details: { projects: forPartner.map((i) => i.name) },
          },
        });
        escalated = forPartner.length;
      } catch (err) {
        console.error("[project-freshness] escalation failed:", err);
      }
    }
  }

  return Response.json({
    ok: true,
    ranAt: now.toISOString(),
    engagementsChecked: engagements.length,
    managersChased: chased,
    unownedProjects: unowned.length,
    escalated,
  });
}
