import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import {
  emailTaskApproved,
  emailTaskAssigned,
  emailTaskBlocked,
  emailTaskCancelled,
  emailTaskChangesRequested,
  emailTaskSubmitted,
} from "@/lib/email";
import {
  NEXT_MOVE,
  TASK_STATUSES,
  allowedTransitions,
  canAssignToOthers,
  canSeeAllTasks,
  canUseTaskBoard,
  partyFor,
  validateTransition,
  whoseMove,
} from "@/lib/tasks";
import { evidenceFor } from "@/lib/taskEvidence";
import type { Prisma, TaskStatus } from "@prisma/client";

const PERSON = { select: { id: true, name: true, email: true, role: true } };

const TASK_SELECT = {
  id: true,
  title: true,
  brief: true,
  definitionOfDone: true,
  workedExample: true,
  status: true,
  dueDate: true,
  checkInAt: true,
  estimatedMinutes: true,
  actualMinutes: true,
  blockedReason: true,
  reviewNote: true,
  handoverNote: true,
  linkedEntityType: true,
  linkedEntityId: true,
  parentTaskId: true,
  submittedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignee: PERSON,
  assigner: PERSON,
  parentTask: { select: { id: true, title: true, assignee: PERSON, assigner: PERSON } },
  questions: {
    select: {
      id: true, question: true, answer: true, answeredAt: true, createdAt: true,
      askedBy: PERSON, answeredBy: PERSON,
    },
    orderBy: { createdAt: "asc" },
  },
  subtasks: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      checkInAt: true,
      assignee: PERSON,
      assigner: PERSON,
    },
    orderBy: { createdAt: "asc" },
  },
  attachments: {
    select: {
      id: true, label: true, fileKey: true, url: true, contentType: true,
      sizeBytes: true, createdAt: true, uploadedBy: PERSON,
    },
    orderBy: { createdAt: "asc" },
  },
  events: {
    select: {
      id: true, kind: true, fromStatus: true, toStatus: true, note: true,
      createdAt: true, actor: PERSON,
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.TaskSelect;

type LoadedTask = Prisma.TaskGetPayload<{ select: typeof TASK_SELECT }>;

/**
 * The rollup the original assigner sees on their task: how the breakdown is
 * going, without them being pulled into the detail of work they did not assign.
 */
function rollup(subtasks: LoadedTask["subtasks"]) {
  const byStatus: Record<string, number> = {};
  for (const s of subtasks) byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
  return {
    total: subtasks.length,
    done: byStatus.DONE ?? 0,
    blocked: byStatus.BLOCKED ?? 0,
    byStatus,
  };
}

function shape(task: LoadedTask, userId: string, role: string) {
  const seesEverything = canSeeAllTasks(role);
  // Sub-task detail is for the people party to the sub-task. Everyone else who
  // can see the parent gets the rollup only.
  const visibleSubtasks = task.subtasks.filter(
    (s) => seesEverything || s.assignee.id === userId || s.assigner.id === userId,
  );
  const party = partyFor({ assigneeId: task.assignee.id, assignerId: task.assigner.id }, userId);
  return {
    ...task,
    subtasks: visibleSubtasks,
    subtaskRollup: rollup(task.subtasks),
    // The storage key never leaves the server. Every object in the bucket is
    // readable by anyone holding its key, so the key is the only control there
    // is, and a page the whole office can open is not where it belongs.
    attachments: task.attachments.map(({ fileKey, ...a }) => ({ ...a, isFile: !!fileKey })),
    nextMove: NEXT_MOVE[task.status],
    whoseMove: whoseMove(
      { assigneeId: task.assignee.id, assignerId: task.assigner.id, status: task.status },
      userId,
    ),
    viewer: {
      party,
      canTransitionTo: allowedTransitions(task.status, party),
      canEditFields: party === "ASSIGNER" || party === "BOTH",
      canReassign: (party === "ASSIGNER" || party === "BOTH") && !["DONE", "CANCELLED"].includes(task.status),
      canAttach: party !== "NONE" && task.status !== "CANCELLED",
      canBreakDown: canAssignToOthers(role) && !task.parentTaskId && (party !== "NONE" || seesEverything),
    },
  };
}

async function load(id: string) {
  return prisma.task.findUnique({ where: { id }, select: TASK_SELECT });
}

export const GET = handler(async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseTaskBoard(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const task = await load(id);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  const party = partyFor({ assigneeId: task.assignee.id, assignerId: task.assigner.id }, session.user.id);
  if (party === "NONE" && !canSeeAllTasks(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const shaped = shape(task, session.user.id, session.user.role);
  // Only the reviewer needs it, and only while there is something to judge.
  const isReviewer = shaped.viewer.party === "ASSIGNER" || shaped.viewer.party === "BOTH";
  const evidence =
    isReviewer && ["SUBMITTED", "CHANGES_REQUESTED", "DONE"].includes(task.status)
      ? await evidenceFor({ linkedEntityType: task.linkedEntityType, createdAt: task.createdAt, assigneeId: task.assignee.id })
      : null;

  return Response.json({ task: JSON.parse(JSON.stringify({ ...shaped, evidence })) });
});

/**
 * PATCH /api/tasks/[id]
 *
 * Two things happen here. The assigner edits the terms of the task, and either
 * party moves it through the statuses their side of the desk allows.
 */
export const PATCH = handler(async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseTaskBoard(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await load(id);
  if (!existing) return Response.json({ error: "Task not found" }, { status: 404 });

  const party = partyFor(
    { assigneeId: existing.assignee.id, assignerId: existing.assigner.id },
    session.user.id,
  );
  if (party === "NONE") {
    return Response.json({ error: "This task is not on your desk." }, { status: 403 });
  }

  const body = await req.json();
  const { status, blockedReason, reviewNote, cancelReason, handoverNote, actualMinutes } = body;
  const isAssigner = party === "ASSIGNER" || party === "BOTH";
  const isAssignee = party === "ASSIGNEE" || party === "BOTH";

  const data: Prisma.TaskUpdateInput = {};

  // Changing hands. The one move the board did not have: when somebody goes on
  // leave their work used to die on their desk, because every field of a task
  // was editable except the name against it.
  let handedTo: { id: string; name: string; email: string } | null = null;
  if (typeof body.assigneeId === "string" && body.assigneeId && body.assigneeId !== existing.assignee.id) {
    if (!isAssigner) {
      return Response.json({ error: "Only the person who assigned this can move it to somebody else." }, { status: 403 });
    }
    if (["DONE", "CANCELLED"].includes(existing.status)) {
      return Response.json({ error: "This task is closed. Raise a new one rather than moving this." }, { status: 400 });
    }
    const next = await prisma.user.findUnique({
      where: { id: body.assigneeId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!next) return Response.json({ error: "That person was not found." }, { status: 404 });
    if (!canUseTaskBoard(next.role)) {
      return Response.json({ error: "That person does not have a task board." }, { status: 400 });
    }
    data.assignee = { connect: { id: next.id } };
    handedTo = { id: next.id, name: next.name, email: next.email };
  }

  // The terms of the task belong to the person who set them.
  if (isAssigner) {
    if (typeof body.title === "string") {
      if (!body.title.trim()) return Response.json({ error: "A title is required." }, { status: 400 });
      data.title = body.title.trim();
    }
    if (typeof body.brief === "string") {
      if (!body.brief.trim()) return Response.json({ error: "A brief is required." }, { status: 400 });
      data.brief = body.brief.trim();
    }
    if (typeof body.definitionOfDone === "string") {
      if (!body.definitionOfDone.trim()) {
        return Response.json({ error: "A definition of done is required." }, { status: 400 });
      }
      data.definitionOfDone = body.definitionOfDone.trim();
    }
    if ("workedExample" in body) data.workedExample = body.workedExample?.trim() || null;
    if ("dueDate" in body) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if ("checkInAt" in body) data.checkInAt = body.checkInAt ? new Date(body.checkInAt) : null;
    if ("estimatedMinutes" in body) {
      const m = Number(body.estimatedMinutes);
      data.estimatedMinutes = Number.isFinite(m) && m > 0 ? Math.round(m) : null;
    }
    if ("linkedEntityType" in body) data.linkedEntityType = body.linkedEntityType?.trim() || null;
    if ("linkedEntityId" in body) data.linkedEntityId = body.linkedEntityId?.trim() || null;
  }

  // How long it actually took is the assignee's to record. Held against the
  // assigner's estimate, it is the only way either of them learns anything.
  if (isAssignee && "actualMinutes" in body) {
    const m = Number(actualMinutes);
    data.actualMinutes = Number.isFinite(m) && m > 0 ? Math.round(m) : null;
  }

  let moved: TaskStatus | null = null;

  if (status && status !== existing.status) {
    if (!TASK_STATUSES.includes(status as TaskStatus)) {
      return Response.json({ error: "Unknown status" }, { status: 400 });
    }
    const next = status as TaskStatus;
    const check = validateTransition({
      from: existing.status,
      to: next,
      party,
      // Fall back to what is already on the record so an unblock does not need
      // the reason resent.
      blockedReason: blockedReason ?? existing.blockedReason,
      reviewNote: reviewNote ?? existing.reviewNote,
      cancelReason,
      handover: {
        attachmentCount: existing.attachments.length,
        note: handoverNote ?? existing.handoverNote,
      },
    });
    if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

    data.status = next;
    moved = next;

    if (next === "BLOCKED") data.blockedReason = blockedReason?.trim() ?? existing.blockedReason;
    if (next === "IN_PROGRESS" || next === "ASSIGNED") data.blockedReason = null;
    if (next === "CHANGES_REQUESTED") data.reviewNote = reviewNote?.trim() ?? existing.reviewNote;
    if (next === "SUBMITTED") {
      data.submittedAt = new Date();
      if (typeof handoverNote === "string") data.handoverNote = handoverNote.trim() || null;
    }
    if (next === "DONE") {
      data.completedAt = new Date();
      // The sign-off note goes on the trail, not into reviewNote. That column
      // means one thing now, "what needs to change", and the correction it
      // held has just been satisfied. Carrying it forward meant a reopened
      // task showed last month's praise as this month's correction.
      data.reviewNote = null;
    }
    if (next !== "DONE" && next !== "CHANGES_REQUESTED" && next !== "SUBMITTED") data.completedAt = null;
  } else {
    // Updating the reason or the note without a status change.
    if (isAssignee && typeof blockedReason === "string" && existing.status === "BLOCKED") {
      data.blockedReason = blockedReason.trim() || null;
    }
    if (isAssigner && typeof reviewNote === "string") {
      data.reviewNote = reviewNote.trim() || null;
    }
  }

  if (!Object.keys(data).length) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const task = await prisma.task.update({ where: { id }, data, select: TASK_SELECT });

  // One row per move, carrying the one note that move required. The columns say
  // where the task is; only the trail can say how it got there.
  const moveNote =
    moved === "BLOCKED" ? task.blockedReason
    : moved === "CHANGES_REQUESTED" ? task.reviewNote
    : moved === "CANCELLED" ? (typeof cancelReason === "string" ? cancelReason.trim() : null)
    : moved === "SUBMITTED" ? task.handoverNote
    : moved === "DONE" ? (typeof reviewNote === "string" ? reviewNote.trim() || null : null)
    : null;

  if (moved) {
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        kind: "STATUS",
        fromStatus: existing.status,
        toStatus: moved,
        note: moveNote,
        actorId: session.user.id,
      },
    });
  }
  if (handedTo) {
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        kind: "REASSIGNED",
        note: `From ${existing.assignee.name} to ${handedTo.name}.`,
        actorId: session.user.id,
      },
    });
  }

  await logAudit({
    userId: session.user.id,
    action: moved ? "STATUS_CHANGE" : "UPDATE",
    entityType: "Task",
    entityId: task.id,
    entityName: task.title,
    details: moved ? { from: existing.status, to: moved } : { fields: Object.keys(data) },
  });

  if (handedTo) {
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Task",
      entityId: task.id,
      entityName: task.title,
      details: { reassignedFrom: existing.assignee.id, reassignedTo: handedTo.id },
    });
    emailTaskAssigned({
      assigneeEmail: handedTo.email,
      assigneeName: handedTo.name,
      assignerName: session.user.name ?? "Consult For Africa",
      title: task.title,
      brief: task.brief,
      definitionOfDone: task.definitionOfDone,
      dueDate: task.dueDate,
      checkInAt: task.checkInAt,
      estimatedMinutes: task.estimatedMinutes,
      taskId: task.id,
    }).catch((err) => console.error(`[tasks] handover email failed for ${task.id}:`, err));
  }

  // Notifications follow the chain. A block raises it to whoever assigned the
  // work, which is what keeps the Founding Partner out of the EA's review loop.
  const actorName = session.user.name ?? "Consult For Africa";
  const fail = (err: unknown) => console.error(`[tasks] notification failed for ${task.id}:`, err);
  // A task someone raised for themselves has nobody else to tell.
  const selfRaised = task.assignee.id === task.assigner.id;

  if (selfRaised) {
    // no notification
  } else if (moved === "BLOCKED") {
    emailTaskBlocked({
      assignerEmail: task.assigner.email,
      assignerName: task.assigner.name,
      assigneeName: task.assignee.name,
      title: task.title,
      blockedReason: task.blockedReason ?? "No reason given.",
      taskId: task.id,
    }).catch(fail);
  } else if (moved === "SUBMITTED") {
    emailTaskSubmitted({
      assignerEmail: task.assigner.email,
      assignerName: task.assigner.name,
      assigneeName: task.assignee.name,
      title: task.title,
      handoverNote: task.handoverNote,
      attachments: task.attachments.map((a) => a.label),
      taskId: task.id,
    }).catch(fail);
  } else if (moved === "CHANGES_REQUESTED") {
    emailTaskChangesRequested({
      assigneeEmail: task.assignee.email,
      assigneeName: task.assignee.name,
      assignerName: actorName,
      title: task.title,
      reviewNote: task.reviewNote ?? "",
      taskId: task.id,
    }).catch(fail);
  } else if (moved === "DONE") {
    emailTaskApproved({
      assigneeEmail: task.assignee.email,
      assigneeName: task.assignee.name,
      assignerName: actorName,
      title: task.title,
      reviewNote: moveNote,
      taskId: task.id,
    }).catch(fail);
  } else if (moved === "CANCELLED") {
    // Work that disappears without a word reads as a judgement on the person
    // who was carrying it, which is why the reason is not optional.
    emailTaskCancelled({
      assigneeEmail: task.assignee.email,
      assigneeName: task.assignee.name,
      assignerName: actorName,
      title: task.title,
      reason: moveNote ?? "No reason given.",
      taskId: task.id,
    }).catch(fail);
  }

  return Response.json({ task: JSON.parse(JSON.stringify(shape(task, session.user.id, session.user.role))) });
});
