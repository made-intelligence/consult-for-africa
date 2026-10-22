import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { canUseOfficeDesk, nextChaseDate } from "@/lib/office";
import { COMMITMENT_SELECT } from "../route";
import { sendMeetingSummary } from "@/lib/email";

/**
 * POST /api/commitments/from-meeting
 *
 * Lifts a meeting's action items into tracked promises.
 *
 * Every meeting with the bot on it already produces aiActionItems, and until
 * now nothing has ever read them. They are lines of text with no owner and no
 * date, which is why they evaporate. This is the step that gives each one a
 * person and a deadline, and it is deliberately explicit rather than automatic:
 * somebody has to say who owes what, and that somebody is the office.
 *
 * On a Daily meeting Nuru has already drafted the items from the transcript, so
 * this is the office confirming them rather than typing them. Confirming also
 * closes the review and sends the notes to everyone who was invited, with the
 * confirmed commitments as the action list: nobody outside the firm sees a
 * draft. `{ meetingId, none: true }` closes a review that found nothing.
 *
 * Body: { meetingId, items: [{ what, owedByUserId?, owedByName?, owedByEmail?, dueDate? }], none? }
 */
export const POST = handler(async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseOfficeDesk(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { meetingId, items, none } = await req.json();
  if (!meetingId?.trim()) return Response.json({ error: "meetingId is required" }, { status: 400 });
  if (!none && (!Array.isArray(items) || items.length === 0)) {
    return Response.json({ error: "Nothing to record." }, { status: 400 });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: {
      id: true, title: true, organizerId: true, aiSummary: true, startedAt: true, scheduledAt: true,
      dailyRoomName: true, commitmentsReviewedAt: true,
      participants: { select: { name: true, email: true } },
    },
  });
  if (!meeting) return Response.json({ error: "Meeting not found" }, { status: 404 });
  if (meeting.commitmentsReviewedAt && meeting.dailyRoomName) {
    return Response.json({ error: "This meeting's commitments have already been confirmed." }, { status: 409 });
  }

  if (none) {
    await closeReview(meeting, session.user.id, []);
    return Response.json({ commitments: [] }, { status: 200 });
  }

  const created = [];
  for (const item of items) {
    const what = String(item?.what ?? "").trim();
    if (!what) continue;
    if (!item.owedByUserId && !String(item?.owedByName ?? "").trim()) continue;

    const due = item.dueDate ? new Date(item.dueDate) : null;
    const commitment = await prisma.commitment.create({
      data: {
        what,
        owedByUserId: item.owedByUserId || null,
        owedByName: String(item?.owedByName ?? "").trim() || null,
        owedByEmail: String(item?.owedByEmail ?? "").trim().toLowerCase() || null,
        owedToUserId: meeting.organizerId,
        dueDate: due,
        sourceType: "MEETING",
        sourceId: meeting.id,
        meetingId: meeting.id,
        nextChaseAt: nextChaseDate(due),
        recordedById: session.user.id,
      },
      select: COMMITMENT_SELECT,
    });
    created.push(commitment);
  }

  if (created.length === 0) {
    return Response.json({ error: "Each item needs what was promised and who owes it." }, { status: 400 });
  }

  if (meeting.dailyRoomName) {
    await closeReview(
      meeting,
      session.user.id,
      created.map((c) => {
        const who = c.owedByUser?.name ?? c.owedByName;
        const due = c.dueDate ? ` by ${new Date(c.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" })}` : "";
        return `${c.what}${who ? ` - ${who}` : ""}${due}`;
      }),
    );
  }

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Commitment",
    entityId: meeting.id,
    entityName: `${created.length} from ${meeting.title}`,
    details: { meetingId: meeting.id, count: created.length },
  });

  return Response.json({ commitments: JSON.parse(JSON.stringify(created)) }, { status: 201 });
});

/** Mark the review done and send the notes round. Only Daily meetings have one. */
async function closeReview(
  meeting: {
    id: string; title: string; aiSummary: string | null; startedAt: Date | null; scheduledAt: Date;
    dailyRoomName: string | null; participants: { name: string; email: string }[];
  },
  reviewerId: string,
  actionItems: string[],
) {
  await prisma.meeting.update({
    where: { id: meeting.id },
    data: { commitmentsReviewedAt: new Date(), commitmentsReviewedById: reviewerId, aiActionItems: actionItems },
  });
  if (!meeting.dailyRoomName || !meeting.aiSummary) return;
  for (const p of meeting.participants) {
    sendMeetingSummary({
      to: p.email,
      participantName: p.name,
      meetingTitle: meeting.title,
      summary: meeting.aiSummary,
      actionItems,
      meetingDate: meeting.startedAt ?? meeting.scheduledAt,
    }).catch((err) => console.error(`[from-meeting] summary to ${p.email} failed:`, err));
  }
}
