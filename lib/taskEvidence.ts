import { prisma } from "@/lib/prisma";

/**
 * What actually changed in the section a task points at, since the task was
 * given out.
 *
 * The reviewer should not have to take "done" on trust. The first inventory
 * count came back submitted, at ten minutes against a three hour estimate, with
 * zero assets and zero stock items in the database. Nothing in the product said
 * so, and the person reviewing it would have had to go and look.
 *
 * This is not a pass or fail, and it is not evidence of absence.
 *
 * An empty section has at least three explanations and this cannot tell them
 * apart: there was nothing to record, it was recorded somewhere else, or it has
 * not been done. The first version of this treated empty as the third, that
 * conclusion reached an onboarding pack with a colleague's name attached to it,
 * and she read it. The count is worth showing. The inference is not ours to
 * draw, and the copy below says so rather than leaving the reviewer to assume.
 */
export interface TaskEvidence {
  /** What we counted, stated as a count and nothing more. */
  summary: string;
  /** The section has no new rows. Says nothing about whether the work happened. */
  empty: boolean;
}

/** Appended wherever the count is zero, so absence never reads as a verdict. */
const CANNOT_TELL =
  " That may be because there was nothing to record, because it was captured somewhere other than the platform, or because it is still to do. Ask before you conclude.";

export async function evidenceFor(task: {
  linkedEntityType: string | null;
  createdAt: Date;
  assigneeId: string;
}): Promise<TaskEvidence | null> {
  const type = task.linkedEntityType?.toUpperCase();
  if (!type) return null;
  const since = task.createdAt;
  const by = task.assigneeId;

  switch (type) {
    case "INVENTORY": {
      const [assets, stock] = await Promise.all([
        prisma.asset.count({ where: { createdAt: { gte: since } } }),
        prisma.stockItem.count({ where: { createdAt: { gte: since } } }),
      ]);
      const total = assets + stock;
      return {
        empty: total === 0,
        summary:
          total === 0
            ? "Nothing has been added to the asset register or the stock list since this task was given out." + CANNOT_TELL
            : `${assets} asset${assets === 1 ? "" : "s"} and ${stock} stock item${stock === 1 ? "" : "s"} added since this task was given out.`,
      };
    }
    case "COMMITMENT": {
      const n = await prisma.commitment.count({ where: { recordedById: by, createdAt: { gte: since } } });
      return {
        empty: n === 0,
        summary: n === 0
          ? "No commitments have been recorded since this task was given out." + CANNOT_TELL + ""
          : `${n} commitment${n === 1 ? "" : "s"} recorded since this task was given out.`,
      };
    }
    case "DECISION": {
      const n = await prisma.decision.count({ where: { raisedById: by, createdAt: { gte: since } } });
      return {
        empty: n === 0,
        summary: n === 0
          ? "No decisions have been raised since this task was given out." + CANNOT_TELL + ""
          : `${n} decision${n === 1 ? "" : "s"} raised since this task was given out.`,
      };
    }
    case "MEETING": {
      // Minutes live in the meeting's description, so a meeting that has been
      // written up is one that has one.
      const [organised, written] = await Promise.all([
        prisma.meeting.count({ where: { organizerId: by, createdAt: { gte: since } } }),
        prisma.meeting.count({
          where: { updatedAt: { gte: since }, description: { not: null }, status: "COMPLETED" },
        }),
      ]);
      return {
        empty: organised + written === 0,
        summary: organised + written === 0
          ? "No meetings have been scheduled or written up since this task was given out." + CANNOT_TELL
          : `${organised} meeting${organised === 1 ? "" : "s"} scheduled and ${written} written up since this task was given out.`,
      };
    }
    case "PIPELINE":
    case "LEAD": {
      const n = await prisma.lead.count({ where: { createdAt: { gte: since } } });
      return {
        empty: n === 0,
        summary: n === 0
          ? "No leads have been added since this task was given out." + CANNOT_TELL + ""
          : `${n} lead${n === 1 ? "" : "s"} added since this task was given out.`,
      };
    }
    case "COMMUNICATION": {
      const n = await prisma.communication.count({ where: { loggedById: by, createdAt: { gte: since } } });
      return {
        empty: n === 0,
        summary: n === 0
          ? "No communications have been logged since this task was given out." + CANNOT_TELL + ""
          : `${n} communication${n === 1 ? "" : "s"} logged since this task was given out.`,
      };
    }
    default:
      return null;
  }
}
