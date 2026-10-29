/**
 * Auto Follow-up Nudge
 *
 * Runs daily. For every outbound EMAIL or WHATSAPP that:
 *   - Was sent 7+ days ago
 *   - Status is still SENT (no reply received)
 *   - Has no nextActionDate already set
 *   - Doesn't have a sibling follow-up nudge already created
 *
 * Creates an internal NOTE communication on the same contact reminding
 * the EM that the contact didn't reply. This becomes a follow-up the
 * EM can see in the "Follow-ups" tab of the global inbox.
 *
 * The nudge is attributed to the original sender (loggedById carries
 * over) so they see it in their "Mine" tab.
 *
 * A marketing send is not a message awaiting a reply. The first version of
 * this job did not know the difference and turned one CadreHealth weekly
 * digest into 1,624 personal follow-ups on the founding partner's desk, which
 * is 1,624 reasons to stop reading the list. Three guards now stand between a
 * send and a nudge:
 *
 *   1. Campaign tags never nudge. A digest is broadcast, not correspondence.
 *   2. A subject sent to BULK_SUBJECT_THRESHOLD or more recipients is a
 *      campaign whatever it was tagged, so new campaigns are caught without
 *      anyone remembering to add a tag here.
 *   3. No one person is handed more than MAX_NUDGES_PER_ASSIGNEE in a run.
 *      A follow-up list nobody can finish is the same as no list at all.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { computeRetentionExpiry, defaultLawfulBasis } from "@/lib/communications-retention";

const STALE_DAYS = 7;
const NUDGE_TAG = "auto-follow-up";

/** Tags that mark a send as broadcast. Nothing tagged with these is chased. */
const BULK_TAGS = ["weekly-digest", "specialty-correction", "campaign", "outreach", "bulk", "newsletter", "digest"];

/**
 * Recipients of an identical subject line above which the send is treated as a
 * campaign regardless of tags. Deliberately low: a genuine one-to-one subject
 * reaching five separate people is already a mail-merge.
 */
const BULK_SUBJECT_THRESHOLD = 5;

/** Ceiling per person per run, so a bad send can never bury a desk again. */
const MAX_NUDGES_PER_ASSIGNEE = 20;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${expected}`;
}

export const POST = handler(async function POST(req: NextRequest) {
  return runNudges(req);
});

export const GET = handler(async function GET(req: NextRequest) {
  return runNudges(req);
});

async function runNudges(req: NextRequest): Promise<Response> {
  if (!authorise(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);
  const now = new Date();

  // Find outbound comms that have been waiting for a reply
  const stale = await prisma.communication.findMany({
    where: {
      direction: "OUTBOUND",
      type: { in: ["EMAIL", "WHATSAPP"] },
      status: "SENT",
      sentAt: { lt: cutoff },
      isArchived: false,
      nextActionDate: null,
      // Guard 1: a tagged campaign is broadcast, not correspondence.
      NOT: [
        { tags: { hasSome: BULK_TAGS } },
        // Avoid creating duplicate nudges
        { replies: { some: { tags: { has: NUDGE_TAG } } } },
      ],
    },
    select: {
      id: true,
      subjectType: true,
      consultantId: true,
      clientId: true,
      clientContactId: true,
      applicationId: true,
      cadreProfessionalId: true,
      partnerFirmId: true,
      salesAgentId: true,
      discoveryCallId: true,
      maarovaUserId: true,
      subject: true,
      sentAt: true,
      threadId: true,
      loggedById: true,
    },
    take: 500,
  });

  // Guard 2: an untagged campaign still looks like one. Count how many people
  // each candidate subject reached across the whole outbound record, not just
  // within this batch, so a campaign split over several runs is still caught.
  const subjects = [...new Set(stale.map((c) => c.subject).filter((s): s is string => !!s))];
  const bulkSubjects = new Set<string>();
  if (subjects.length) {
    const counts = await prisma.communication.groupBy({
      by: ["subject"],
      where: { direction: "OUTBOUND", subject: { in: subjects } },
      _count: { subject: true },
    });
    for (const row of counts) {
      if (row.subject && row._count.subject >= BULK_SUBJECT_THRESHOLD) bulkSubjects.add(row.subject);
    }
  }

  let created = 0;
  let skippedBulk = 0;
  let skippedCapped = 0;
  const perAssignee = new Map<string, number>();
  const errors: string[] = [];

  for (const c of stale) {
    try {
      if (c.subject && bulkSubjects.has(c.subject)) {
        skippedBulk++;
        continue;
      }

      // Guard 3: a desk only holds so much. Anything over the ceiling waits
      // for the next run rather than arriving as noise.
      const assigneeKey = c.loggedById ?? "unassigned";
      const alreadyForAssignee = perAssignee.get(assigneeKey) ?? 0;
      if (alreadyForAssignee >= MAX_NUDGES_PER_ASSIGNEE) {
        skippedCapped++;
        continue;
      }

      // Double-check no nudge sibling exists (race-safe)
      const existing = await prisma.communication.findFirst({
        where: {
          replyToId: c.id,
          tags: { has: NUDGE_TAG },
        },
        select: { id: true },
      });
      if (existing) continue;

      const daysAgo = Math.round((now.getTime() - (c.sentAt?.getTime() ?? now.getTime())) / (24 * 60 * 60 * 1000));

      await prisma.communication.create({
        data: {
          subjectType: c.subjectType,
          consultantId: c.consultantId,
          clientId: c.clientId,
          clientContactId: c.clientContactId,
          applicationId: c.applicationId,
          cadreProfessionalId: c.cadreProfessionalId,
          partnerFirmId: c.partnerFirmId,
          salesAgentId: c.salesAgentId,
          discoveryCallId: c.discoveryCallId,
          maarovaUserId: c.maarovaUserId,
          type: "NOTE",
          direction: "INTERNAL",
          status: "LOGGED",
          subject: `No reply after ${daysAgo} days`,
          body: `${c.subject ? `"${c.subject}"` : "Outbound message"} sent ${daysAgo} days ago has not received a reply. Consider following up.`,
          occurredAt: now,
          nextAction: "Follow up",
          nextActionDate: now,
          nextActionAssignedToId: c.loggedById,
          tags: [NUDGE_TAG],
          replyToId: c.id,
          threadId: c.threadId ?? c.id,
          loggedById: c.loggedById,
          visibility: "TEAM",
          lawfulBasis: defaultLawfulBasis(c.subjectType),
          retentionExpiresAt: computeRetentionExpiry(c.subjectType, now),
          events: {
            create: {
              type: "CREATED",
              provider: "MANUAL",
              notes: "Auto-generated follow-up nudge",
            },
          },
        },
      });
      created++;
      perAssignee.set(assigneeKey, alreadyForAssignee + 1);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${c.id}: ${errMsg}`);
    }
  }

  return Response.json({
    ok: true,
    candidatesFound: stale.length,
    nudgesCreated: created,
    skippedAsBulk: skippedBulk,
    skippedOverCap: skippedCapped,
    bulkSubjectsDetected: bulkSubjects.size,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
    runAt: now.toISOString(),
  });
}
