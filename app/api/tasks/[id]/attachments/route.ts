import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { objectExists } from "@/lib/r2";
import { canUseTaskBoard, partyFor } from "@/lib/tasks";

/**
 * POST /api/tasks/[id]/attachments
 *
 * What is being handed over. Either a file the firm now holds, or a link to
 * where the work actually lives, because a document in a shared folder is a
 * legitimate answer and pretending otherwise just means nothing gets recorded.
 *
 * Both parties may attach. The reviewer marking up a draft and sending it back
 * is the same act as the assignee handing it in, and splitting them would mean
 * the marked-up version lived in an email.
 */
export const POST = handler(async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseTaskBoard(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, assigneeId: true, assignerId: true, status: true },
  });
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  if (partyFor(task, session.user.id) === "NONE") {
    return Response.json({ error: "This task is not on your desk." }, { status: 403 });
  }
  if (task.status === "CANCELLED") {
    return Response.json({ error: "This task was cancelled. Nothing more can be attached to it." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const fileKey: string | null = typeof body.fileKey === "string" ? body.fileKey.trim() || null : null;
  const rawUrl: string | null = typeof body.url === "string" ? body.url.trim() || null : null;
  let label: string = typeof body.label === "string" ? body.label.trim() : "";

  if (!fileKey && !rawUrl) {
    return Response.json({ error: "Attach a file or paste a link." }, { status: 400 });
  }
  if (fileKey && rawUrl) {
    return Response.json({ error: "An attachment is either a file or a link, not both." }, { status: 400 });
  }

  // A file lands here only after the presigned upload, so the key has to be one
  // this platform issued rather than anything the caller fancies pointing at.
  if (fileKey && !fileKey.startsWith("tasks/")) {
    return Response.json({ error: "That file was not uploaded through this platform." }, { status: 400 });
  }

  let url: string | null = null;
  if (rawUrl) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return Response.json({ error: "That does not look like a link. Paste the whole address, starting with https." }, { status: 400 });
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return Response.json({ error: "A link has to be a web address." }, { status: 400 });
    }
    url = parsed.toString();
    if (!label) label = parsed.hostname.replace(/^www\./, "");
  }

  if (!label) return Response.json({ error: "Give it a name so the list reads." }, { status: 400 });

  // The presigned URL is handed out before the upload happens, so a key proves
  // nothing. Recording one whose object never arrived gives the reviewer a row
  // to click and a dead end at the other side of it.
  if (fileKey && !(await objectExists(fileKey))) {
    return Response.json(
      { error: "That file did not finish uploading. Try attaching it again." },
      { status: 400 },
    );
  }

  const attachment = await prisma.taskAttachment.create({
    data: {
      taskId: task.id,
      label: label.slice(0, 200),
      fileKey,
      url,
      contentType: typeof body.contentType === "string" ? body.contentType : null,
      sizeBytes: Number.isFinite(Number(body.sizeBytes)) && Number(body.sizeBytes) > 0 ? Math.round(Number(body.sizeBytes)) : null,
      uploadedById: session.user.id,
    },
    select: {
      id: true, label: true, fileKey: true, url: true, contentType: true, sizeBytes: true, createdAt: true,
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "TaskAttachment",
    entityId: attachment.id,
    entityName: attachment.label,
    details: { taskId: task.id, kind: fileKey ? "file" : "link" },
  });

  return Response.json({ attachment: JSON.parse(JSON.stringify(attachment)) }, { status: 201 });
});
