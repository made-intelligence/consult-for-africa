import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { deleteFile, generateDownloadUrl } from "@/lib/r2";
import { canSeeAllTasks, canUseTaskBoard, partyFor } from "@/lib/tasks";

async function loadForViewer(taskId: string, attachmentId: string, userId: string, role: string) {
  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId },
    select: {
      id: true, taskId: true, label: true, fileKey: true, url: true, uploadedById: true,
      task: { select: { id: true, assigneeId: true, assignerId: true, status: true } },
    },
  });
  if (!attachment || attachment.taskId !== taskId) return null;
  const party = partyFor(attachment.task, userId);
  if (party === "NONE" && !canSeeAllTasks(role)) return null;
  return { attachment, party };
}

/**
 * GET /api/tasks/[id]/attachments/[attachmentId]
 *
 * Hands back a short-lived download link rather than the stored key. Every
 * object in the bucket is readable by anyone holding its key, so the key is the
 * only control there is and it does not belong in a page that the whole office
 * can open.
 */
export const GET = handler(async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; attachmentId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseTaskBoard(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, attachmentId } = await ctx.params;
  const found = await loadForViewer(id, attachmentId, session.user.id, session.user.role);
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });

  const { attachment } = found;
  if (attachment.url) return Response.json({ downloadUrl: attachment.url });
  if (!attachment.fileKey) return Response.json({ error: "Nothing to download" }, { status: 400 });

  return Response.json({ downloadUrl: await generateDownloadUrl(attachment.fileKey) });
});

/**
 * DELETE /api/tasks/[id]/attachments/[attachmentId]
 *
 * Only the person who attached it, and only while the task is still live. Once
 * it is signed off the handover is the record of what was signed off, and a
 * reviewer who approved a document should be able to go back and find it.
 */
export const DELETE = handler(async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; attachmentId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseTaskBoard(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, attachmentId } = await ctx.params;
  const found = await loadForViewer(id, attachmentId, session.user.id, session.user.role);
  if (!found) return Response.json({ error: "Not found" }, { status: 404 });

  const { attachment } = found;
  if (attachment.uploadedById !== session.user.id) {
    return Response.json({ error: "Only the person who attached this can take it down." }, { status: 403 });
  }
  if (attachment.task.status === "DONE") {
    return Response.json({ error: "This was signed off. What was handed over stays on the record." }, { status: 400 });
  }

  await prisma.taskAttachment.delete({ where: { id: attachment.id } });
  if (attachment.fileKey) {
    deleteFile(attachment.fileKey).catch((err) => console.error(`[tasks] could not remove ${attachment.fileKey}:`, err));
  }

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "TaskAttachment",
    entityId: attachment.id,
    entityName: attachment.label,
    details: { taskId: id },
  });

  return Response.json({ ok: true });
});
