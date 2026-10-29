import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { joinLinkFor } from "@/lib/daily";
import { MEETING_VIEW_ALL_ROLES } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/meetings/:id/join
 *
 * Sends a signed-in C4A person into the meeting's Daily room as an owner. The
 * room is private, so the bare room URL on the meeting page would leave them
 * knocking; this mints their own link on the way in. Joining as an owner is
 * also what starts the transcription.
 */
export const GET = handler(async function GET(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session) return Response.redirect(new URL("/login", req.url), 307);

  const { id } = await ctx.params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    select: { dailyRoomName: true, organizerId: true, status: true, participants: { select: { userId: true } } },
  });
  if (!meeting?.dailyRoomName) return Response.json({ error: "This meeting has no Daily room" }, { status: 404 });
  if (meeting.status === "CANCELLED") return Response.json({ error: "This meeting was cancelled" }, { status: 410 });

  const isIn =
    meeting.organizerId === session.user.id ||
    meeting.participants.some((p) => p.userId === session.user.id) ||
    (MEETING_VIEW_ALL_ROLES as readonly string[]).includes(session.user.role);
  if (!isIn) return Response.json({ error: "Forbidden" }, { status: 403 });

  const link = await joinLinkFor({
    roomName: meeting.dailyRoomName,
    userName: session.user.name ?? "C4A",
    isOwner: true,
  });
  return Response.redirect(link, 307);
});
