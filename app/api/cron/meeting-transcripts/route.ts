/**
 * Collects the transcript of every finished Daily meeting and has Nuru draft
 * the notes.
 *
 * Daily stores the transcript in the room; nothing tells us it is ready unless
 * a webhook is registered, and the Daily domain is Mezo's, so a C4A webhook
 * would receive every teleconsult event too. Asking Daily room by room every
 * fifteen minutes keeps the two products apart at the cost of a short delay.
 *
 * A meeting is only written up when nobody is left in the room and every
 * transcript is finished. People drop and rejoin, and each rejoin is a new
 * session with its own transcript, so all of them are read in order.
 *
 * The transcript is kept on the meeting record and nowhere else. It is not put
 * in R2, because that bucket is publicly readable and these are client calls.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { downloadTranscript, isDailyConfigured, listTranscripts, roomIsOccupied, vttToText } from "@/lib/daily";
import { draftMeetingNotes } from "@/lib/meetingNotes";

export const maxDuration = 300;

/** Stop looking for a transcript this long after the meeting was due to end. */
const GIVE_UP_AFTER_MS = 2 * 24 * 60 * 60 * 1000;
/** Each meeting is a Claude call; keep one run well inside maxDuration. */
const PER_RUN = 5;

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export const GET = handler(async function GET(req: NextRequest) {
  if (!authorise(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDailyConfigured()) return Response.json({ skipped: "Daily is not configured" });

  const now = new Date();
  const meetings = await prisma.meeting.findMany({
    where: {
      dailyRoomName: { not: null },
      transcript: null,
      status: { in: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"] },
      scheduledAt: { lte: now },
      scheduledEndAt: { gte: new Date(now.getTime() - GIVE_UP_AFTER_MS) },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      engagement: { select: { name: true, serviceType: true } },
      discoveryCall: { select: { organizationName: true, organizationType: true } },
      participants: { select: { name: true, email: true, userId: true, role: true } },
      organizer: { select: { id: true, name: true, email: true } },
    },
  });

  const results: { meetingId: string; outcome: string }[] = [];
  let drafted = 0;

  for (const m of meetings) {
    if (drafted >= PER_RUN) break;
    const room = m.dailyRoomName!;
    try {
      const transcripts = (await listTranscripts(room)).filter((t) => t.status !== "t_deleted");
      if (transcripts.length === 0) {
        results.push({ meetingId: m.id, outcome: "no transcript yet" });
        continue;
      }
      if (transcripts.some((t) => t.status === "t_in_progress") || (await roomIsOccupied(room))) {
        if (m.status === "SCHEDULED") {
          await prisma.meeting.update({ where: { id: m.id }, data: { status: "IN_PROGRESS", nuruJoined: true } });
        }
        results.push({ meetingId: m.id, outcome: "still in progress" });
        continue;
      }

      const ready = transcripts
        .filter((t) => t.status === "t_finished" && t.isVttAvailable)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const parts: string[] = [];
      for (const t of ready) {
        const text = vttToText(await downloadTranscript(t.transcriptId));
        if (text.trim()) parts.push(text);
      }
      const transcript = parts.join("\n\n[The call resumed]\n\n");

      const startedAt = ready[0] ? new Date(ready[0].created_at) : m.scheduledAt;
      const durationMin = Math.round(ready.reduce((s, t) => s + (t.duration ?? 0), 0) / 60);
      const base = {
        status: "COMPLETED" as const,
        nuruJoined: true,
        startedAt: m.startedAt ?? startedAt,
        endedAt: m.endedAt ?? new Date(startedAt.getTime() + durationMin * 60000),
        duration: m.duration ?? durationMin,
      };

      if (!transcript.trim()) {
        // Somebody joined but nothing was said that Daily caught. Record it so
        // the sweep stops asking, and so the page does not promise notes.
        await prisma.meeting.update({ where: { id: m.id }, data: { ...base, transcript: "" } });
        results.push({ meetingId: m.id, outcome: "empty transcript" });
        continue;
      }

      const context: string[] = [];
      if (m.engagement) context.push(`Project: ${m.engagement.name} (${m.engagement.serviceType})`);
      if (m.discoveryCall) context.push(`Discovery call with: ${m.discoveryCall.organizationName} (${m.discoveryCall.organizationType})`);
      if (m.description) context.push(`Agenda: ${m.description}`);

      // The organiser owns things too, and is often not on the participant list.
      const participants = [...m.participants];
      if (m.organizer && !participants.some((p) => p.userId === m.organizer!.id)) {
        participants.unshift({ name: m.organizer.name, email: m.organizer.email, userId: m.organizer.id, role: "Organiser" });
      }

      drafted++;
      const notes = await draftMeetingNotes({
        title: m.title,
        type: m.type,
        meetingDate: startedAt,
        context,
        participants,
        transcript,
      });

      await prisma.meeting.update({
        where: { id: m.id },
        data: {
          ...base,
          transcript,
          aiSummary: notes?.summary ?? "The transcript was collected but Nuru could not write it up. Read the transcript below and record the commitments by hand.",
          aiActionItems: notes?.actionItems ?? [],
          aiKeyDecisions: notes?.keyDecisions ?? [],
          aiCommitments: notes ? JSON.parse(JSON.stringify(notes.commitments)) : [],
        },
      });
      results.push({ meetingId: m.id, outcome: `drafted ${notes?.commitments.length ?? 0} commitments` });
    } catch (err) {
      console.error(`[meeting-transcripts] ${m.id}:`, err);
      results.push({ meetingId: m.id, outcome: `error: ${err instanceof Error ? err.message : String(err)}` });
    }
  }

  return Response.json({ checked: meetings.length, drafted, results });
});
