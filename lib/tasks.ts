import type { TaskStatus } from "@prisma/client";
import { ELEVATED_ROLES, TASK_ASSIGNER_ROLES, TASK_ROLES } from "@/lib/constants";

/**
 * The delegation board, in one axis.
 *
 * A task status used to answer three questions at once: how far the work has
 * got, whose desk it is on, and whether something is in the way. Because the
 * three were mixed, every query that meant "still on her desk" had to spell out
 * its own list of statuses, and the lists drifted apart. Two of them disagreed
 * about whether submitted work was open, so a task somebody had handed in
 * appeared on nobody's desk at all.
 *
 * There is now one axis: whose move is it. Every status maps to exactly one
 * answer, every answer has at least one status, and every list below is derived
 * from that map rather than written out again.
 */

export const TASK_STATUSES: TaskStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "BLOCKED",
  "SUBMITTED",
  "CHANGES_REQUESTED",
  "DONE",
  "CANCELLED",
];

/**
 * Whose move it is, which is the only thing a desk needs to know.
 *
 * DOER covers the three states where the work is hers to carry: freshly
 * assigned, under way, and sent back. REVIEWER covers the two where it is his:
 * handed in and waiting to be judged, or stopped and waiting to be unstuck.
 * Blocked is the one people expect to find under DOER, and it is the reason the
 * desk kept telling Abigail to act on work she had already escalated.
 */
export type NextMove = "DOER" | "REVIEWER" | "NOBODY";

export const NEXT_MOVE: Record<TaskStatus, NextMove> = {
  ASSIGNED: "DOER",
  IN_PROGRESS: "DOER",
  CHANGES_REQUESTED: "DOER",
  SUBMITTED: "REVIEWER",
  BLOCKED: "REVIEWER",
  DONE: "NOBODY",
  CANCELLED: "NOBODY",
};

const byMove = (move: NextMove): TaskStatus[] =>
  TASK_STATUSES.filter((s) => NEXT_MOVE[s] === move);

/** The work is hers to carry. */
export const WITH_THE_DOER: TaskStatus[] = byMove("DOER");
/** The work is his to judge or to unstick. */
export const WITH_THE_REVIEWER: TaskStatus[] = byMove("REVIEWER");
/** Nothing further is owed by anybody. */
export const CLOSED_STATUSES: TaskStatus[] = byMove("NOBODY");

/** Still on somebody's desk. Derived, so it can never disagree with the map. */
export const OPEN_STATUSES: TaskStatus[] = [...WITH_THE_DOER, ...WITH_THE_REVIEWER];

export function canUseTaskBoard(role: string | undefined | null): boolean {
  return TASK_ROLES.includes(role as typeof TASK_ROLES[number]);
}

/** May assign work to someone other than themselves. */
export function canAssignToOthers(role: string | undefined | null): boolean {
  return TASK_ASSIGNER_ROLES.includes(role as typeof TASK_ASSIGNER_ROLES[number]);
}

/** May see every desk, not just their own and the ones they assign to. */
export function canSeeAllTasks(role: string | undefined | null): boolean {
  return ELEVATED_ROLES.includes(role as typeof ELEVATED_ROLES[number]);
}

export type TaskParty = "ASSIGNEE" | "ASSIGNER" | "BOTH" | "NONE";

export function partyFor(
  task: { assigneeId: string; assignerId: string },
  userId: string,
): TaskParty {
  const isAssignee = task.assigneeId === userId;
  const isAssigner = task.assignerId === userId;
  if (isAssignee && isAssigner) return "BOTH";
  if (isAssignee) return "ASSIGNEE";
  if (isAssigner) return "ASSIGNER";
  return "NONE";
}

/**
 * Whether this task is waiting on the person looking at it.
 *
 * One function, so the desk, the board and the counts cannot reach three
 * different answers about the same row. A task somebody raised for themselves
 * is theirs at every stage, which is why BOTH resolves to MINE while it is
 * open.
 */
export function whoseMove(
  task: { assigneeId: string; assignerId: string; status: TaskStatus },
  userId: string,
): "MINE" | "THEIRS" | "NOBODY" {
  const move = NEXT_MOVE[task.status];
  if (move === "NOBODY") return "NOBODY";
  const holder = move === "DOER" ? task.assigneeId : task.assignerId;
  if (holder === userId) return "MINE";
  const party = partyFor(task, userId);
  return party === "NONE" ? "NOBODY" : "THEIRS";
}

/**
 * What the assignee may move a task to. Submitting is how work comes back;
 * blocking is how someone stops without having to interrupt anyone.
 */
const ASSIGNEE_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  ASSIGNED: ["IN_PROGRESS", "BLOCKED", "SUBMITTED"],
  IN_PROGRESS: ["BLOCKED", "SUBMITTED"],
  BLOCKED: ["IN_PROGRESS", "SUBMITTED"],
  CHANGES_REQUESTED: ["IN_PROGRESS", "BLOCKED", "SUBMITTED"],
  SUBMITTED: ["IN_PROGRESS"], // pulled back before the reviewer gets to it
  DONE: [],
  CANCELLED: [],
};

/**
 * What the assigner, who is also the reviewer, may move a task to.
 *
 * Deliberately narrower than it was. Marking somebody else's work as started
 * was a second way to reach a state only the doer can honestly report, and
 * unblocking offered a choice between "assigned" and "in progress" that was two
 * buttons for one intention. A blocked task that is cleared goes back to being
 * under way, because work that got far enough to hit a wall had started.
 */
const ASSIGNER_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  ASSIGNED: ["CANCELLED"],
  IN_PROGRESS: ["CANCELLED"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  SUBMITTED: ["CHANGES_REQUESTED", "DONE", "CANCELLED"],
  CHANGES_REQUESTED: ["DONE", "CANCELLED"],
  DONE: ["CHANGES_REQUESTED"], // reopened if it turns out it was not done
  CANCELLED: ["ASSIGNED"],
};

export function allowedTransitions(from: TaskStatus, party: TaskParty): TaskStatus[] {
  if (party === "NONE") return [];
  const set = new Set<TaskStatus>();
  if (party === "ASSIGNEE" || party === "BOTH") ASSIGNEE_TRANSITIONS[from].forEach((s) => set.add(s));
  if (party === "ASSIGNER" || party === "BOTH") ASSIGNER_TRANSITIONS[from].forEach((s) => set.add(s));
  return [...set];
}

/**
 * Every move carries exactly one note, and this says whether it is owed.
 *
 * REQUIRED where the move is meaningless without it: stopping without saying
 * what stopped you, sending work back without saying what to change, killing a
 * task without saying why. OFFERED where forcing it would only produce "ok":
 * five sign-offs went out in the first week with not one note written, and
 * making the field compulsory would have produced five words rather than five
 * sentences.
 */
export type NoteRule = "REQUIRED" | "OFFERED" | "NONE";

export const NOTE_RULE: Record<TaskStatus, NoteRule> = {
  BLOCKED: "REQUIRED",
  CHANGES_REQUESTED: "REQUIRED",
  CANCELLED: "REQUIRED",
  SUBMITTED: "OFFERED", // the handover carries the weight here, not the note
  DONE: "OFFERED",
  ASSIGNED: "NONE",
  IN_PROGRESS: "NONE",
};

/** The question each note answers, written once so every surface asks it the same way. */
export const NOTE_PROMPT: Record<TaskStatus, string> = {
  BLOCKED: "What is in the way? This goes to your assigner, not to the whole firm.",
  CHANGES_REQUESTED: "What needs to change? Write it so the correction is reusable.",
  CANCELLED: "Why is this being dropped? The person who was carrying it will see this.",
  SUBMITTED: "Anything the reviewer should know before they open it.",
  DONE: "What did they get right, or what would you do differently next time? One line they can carry into the next one.",
  ASSIGNED: "",
  IN_PROGRESS: "",
};

/** What the task is handing over at the moment it is submitted. */
export interface Handover {
  /** Files uploaded or links recorded against the task. */
  attachmentCount: number;
  /** What the assignee wrote about the handover. */
  note?: string | null;
}

/**
 * A transition is only valid if the party may make it, the note it depends on
 * is written, and, where it is a handover, there is something to hand over.
 *
 * Submitting with nothing attached is the gap this closes. The reviewer was
 * being asked to sign off work they had no way of seeing, which turned review
 * into a formality and sign-off into a courtesy.
 */
export function validateTransition({
  from,
  to,
  party,
  blockedReason,
  reviewNote,
  cancelReason,
  handover,
}: {
  from: TaskStatus;
  to: TaskStatus;
  party: TaskParty;
  blockedReason?: string | null;
  reviewNote?: string | null;
  cancelReason?: string | null;
  handover?: Handover;
}): { ok: true } | { ok: false; error: string } {
  if (from === to) return { ok: true };
  if (party === "NONE") return { ok: false, error: "This task is not on your desk." };
  if (!allowedTransitions(from, party).includes(to)) {
    return { ok: false, error: `Cannot move a task from ${from} to ${to}.` };
  }
  if (to === "BLOCKED" && !blockedReason?.trim()) {
    return { ok: false, error: "Say what is in the way so your assigner can unblock it." };
  }
  if (to === "CHANGES_REQUESTED" && !reviewNote?.trim()) {
    return { ok: false, error: "Write what needs to change. A note is what makes the correction reusable." };
  }
  if (to === "CANCELLED" && !cancelReason?.trim()) {
    return { ok: false, error: "Say why this is being dropped. Work that disappears without a reason reads as a judgement on the person carrying it." };
  }
  if (to === "SUBMITTED" && handover && handover.attachmentCount === 0 && !handover.note?.trim()) {
    return {
      ok: false,
      error: "Attach what you did, paste a link to where it lives, or say in a line where to find it. Your reviewer cannot sign off work they cannot see.",
    };
  }
  return { ok: true };
}
