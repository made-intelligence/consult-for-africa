"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  HelpCircle,
  Link2,
  Loader2,
  OctagonX,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Trash2,
  Undo2,
  UserCog,
} from "lucide-react";
import { parseApiError } from "@/lib/parse-api-error";
import { NOTE_PROMPT } from "@/lib/tasks";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  isSettled,
  linkedSection,
  formatDate,
  formatMinutes,
  isOverdue,
  type TaskPerson,
  type TaskRow,
} from "../taskUi";

interface Subtask {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  checkInAt: string | null;
  assignee: TaskPerson;
  assigner: TaskPerson;
}

interface Question {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  askedBy: TaskPerson;
  answeredBy: TaskPerson | null;
}

/** A file the firm holds, or a link to where the work actually lives. */
interface Attachment {
  id: string;
  label: string;
  url: string | null;
  isFile: boolean;
  contentType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  uploadedBy: TaskPerson;
}

/** One move, with the one note it carried. */
interface TaskEvent {
  id: string;
  kind: "RAISED" | "STATUS" | "REASSIGNED";
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  createdAt: string;
  actor: TaskPerson;
}

interface TaskDetail extends TaskRow {
  workedExample: string | null;
  handoverNote: string | null;
  questions: Question[];
  attachments: Attachment[];
  events: TaskEvent[];
  evidence: { summary: string; empty: boolean } | null;
  parentTask: { id: string; title: string; assignee: TaskPerson; assigner: TaskPerson } | null;
  subtasks: Subtask[];
  subtaskRollup: { total: number; done: number; blocked: number; byStatus: Record<string, number> };
  nextMove: "DOER" | "REVIEWER" | "NOBODY";
  whoseMove: "MINE" | "THEIRS" | "NOBODY";
  viewer: {
    party: "ASSIGNEE" | "ASSIGNER" | "BOTH" | "NONE";
    canTransitionTo: string[];
    canEditFields: boolean;
    canReassign: boolean;
    canAttach: boolean;
    canBreakDown: boolean;
  };
}

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2744]";
const inputStyle = { borderColor: "#e5eaf0" };

/**
 * The moves that ask for something before they land. Five of the seven, because
 * only starting work and picking it back up need nothing said about them.
 */
const GATED_MOVES = ["BLOCKED", "CHANGES_REQUESTED", "DONE", "CANCELLED", "SUBMITTED"];

/** What each move is called from the desk it is made on. */
const ACTION_LABELS: Record<string, string> = {
  IN_PROGRESS: "Start it",
  BLOCKED: "I am stuck",
  SUBMITTED: "Submit for review",
  CHANGES_REQUESTED: "Send it back",
  DONE: "Sign it off",
  CANCELLED: "Cancel it",
  ASSIGNED: "Put it back on the desk",
};

export default function TaskDetailClient({
  taskId,
  currentUserId,
  canAssign,
}: {
  taskId: string;
  currentUserId: string;
  canAssign: boolean;
}) {
  const router = useRouter();
  const [task, setTask] = useState<TaskDetail | null>(null);
  // What just happened, so the page confirms the move instead of only
  // offering the next one.
  const [justMoved, setJustMoved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);
  const [asking, setAsking] = useState(false);
  const [questionText, setQuestionText] = useState("");

  const load = useCallback(() => {
    fetch(`/api/tasks/${taskId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await parseApiError(r, "Could not load the task."));
        return r.json();
      })
      .then((d) => setTask(d.task))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => { load(); }, [load]);

  async function move(to: string) {
    if (!task) return;
    // Every move that changes who holds the task asks for the one thing that
    // move depends on, before it lands rather than after. Blocking needs to say
    // what is in the way, sending back needs to say what to change, cancelling
    // needs to say why, and submitting needs something to actually hand over.
    //
    // Signing off asks too, though it does not insist. Five tasks were signed
    // off in the first week with not one note written, which is the loop
    // running hollow: the assignee learns that the work was acceptable and
    // nothing about why. Forcing a note would only produce "ok", so the field
    // is offered, pre-focused, and skippable.
    if (GATED_MOVES.includes(to) && pending !== to) {
      setPending(to);
      setNote(
        to === "BLOCKED" ? task.blockedReason ?? ""
        : to === "CHANGES_REQUESTED" ? task.reviewNote ?? ""
        : to === "SUBMITTED" ? task.handoverNote ?? ""
        : "",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = { status: to };
      if (to === "BLOCKED") body.blockedReason = note;
      if (to === "CHANGES_REQUESTED") body.reviewNote = note;
      if (to === "CANCELLED") body.cancelReason = note;
      if (to === "SUBMITTED") body.handoverNote = note;
      if (to === "DONE" && note.trim()) body.reviewNote = note;
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(await parseApiError(res, "Could not update the task."));
        return;
      }
      const d = await res.json();
      setTask(d.task);
      setPending(null);
      setNote("");
      setJustMoved(to);
      // "Every task that has a section on the platform should lead me directly
      // to it after clicking the start it button." Starting work should put
      // her in the place the work happens.
      if (to === "IN_PROGRESS") {
        const section = linkedSection(d.task.linkedEntityType, d.task.linkedEntityId);
        if (section) router.push(section.href);
      }
    } finally {
      setSaving(false);
    }
  }

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(await parseApiError(res, "Could not update the task."));
        return false;
      }
      const d = await res.json();
      setTask(d.task);
      return true;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500 px-6 text-center">
        {error || "Task not found."}
      </div>
    );
  }

  const s = STATUS_STYLES[task.status];
  const settled = isSettled(task.status);
  const settledTone =
    task.status === "DONE" ? { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" }
    : task.status === "BLOCKED" ? { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" }
    : task.status === "CANCELLED" ? { bg: "#F8FAFC", border: "#E2E8F0", text: "#475569" }
    : { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF" };
  const section = linkedSection(task.linkedEntityType, task.linkedEntityId);
  const primary = primaryFor(task.status, task.viewer.party, task.viewer.canTransitionTo);
  const secondary = task.viewer.canTransitionTo.filter((t) => t !== primary);
  const settledMessage = settledCopy(task, justMoved);
  const overdue = isOverdue(task.dueDate, task.status);
  const isAssignee = task.assignee.id === currentUserId;
  const overrun =
    task.estimatedMinutes && task.actualMinutes
      ? task.actualMinutes / task.estimatedMinutes
      : null;
  // Whether the gated move in front of us has what it needs. Submitting wants
  // something handed over, which a line of text counts as; the rest want the
  // note that gives the move its meaning.
  // The sign-off note lives on the trail, so that reopening a task cannot turn
  // last month's praise into this month's correction.
  const signOffNote = [...task.events].reverse().find((e) => e.toStatus === "DONE" && e.note)?.note ?? null;
  const canCommit =
    !pending ? true
    : pending === "DONE" ? true
    : pending === "SUBMITTED" ? task.attachments.length > 0 || !!note.trim()
    : !!note.trim();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        {task.parentTask && (
          <Link
            href={`/tasks/${task.parentTask.id}`}
            className="inline-flex items-center gap-1.5 text-xs hover:underline"
            style={{ color: "#64748B" }}
          >
            <Undo2 size={12} /> Part of {task.parentTask.title}
          </Link>
        )}

        {/* Header */}
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0" }}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
            <span
              className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: s.bg, color: s.text }}
            >
              {STATUS_LABELS[task.status]}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs" style={{ color: "#64748B" }}>
            <Fact label="Assigned to" value={task.assignee.name} />
            <Fact label="Reviewed by" value={task.assigner.name} />
            {task.dueDate && (
              <Fact label="Due" value={formatDate(task.dueDate)} alert={overdue} />
            )}
            {task.checkInAt && <Fact label="Check in" value={formatDate(task.checkInAt)} />}
            {task.estimatedMinutes ? (
              <Fact label="Estimate" value={formatMinutes(task.estimatedMinutes)} />
            ) : null}
            {task.actualMinutes ? (
              <Fact
                label="Actual"
                value={formatMinutes(task.actualMinutes)}
                alert={!!overrun && overrun >= 3}
              />
            ) : null}
          </div>

          {overrun && overrun >= 3 && (
            <p className="mt-3 text-xs" style={{ color: "#B45309" }}>
              This took over three times the estimate. The estimate was wrong, which is worth a conversation on both sides.
            </p>
          )}
        </div>

        {/* Where the work happens. Present on the task itself, not only after
            clicking start, so it is reachable whenever she comes back to it. */}
        {section && task.status !== "DONE" && task.status !== "CANCELLED" && (
          <Link
            href={section.href}
            className="flex items-center justify-between gap-3 rounded-xl border bg-white px-5 py-4 hover:shadow-sm transition-shadow"
            style={{ borderColor: "#e5eaf0" }}
          >
            <span>
              <span className="text-sm font-semibold text-gray-900">Open {section.label}</span>
              <span className="block text-xs mt-0.5" style={{ color: "#94A3B8" }}>This is where this task gets done.</span>
            </span>
            <ChevronRight size={16} style={{ color: "#0F2744" }} />
          </Link>
        )}

        {/* Brief and definition of done */}
        <Panel title="Why this matters" body={task.brief} />
        <Panel title="Done looks like" body={task.definitionOfDone} accent="#10B981" />
        {task.workedExample && (
          <Panel title="One that is already right" body={task.workedExample} accent="#6366F1" />
        )}

        {task.status === "BLOCKED" && task.blockedReason && (
          <Panel title="What is in the way" body={task.blockedReason} accent="#EF4444" />
        )}
        {task.reviewNote && (
          <Panel
            title={task.status === "DONE" ? "Sign-off note" : "What needs to change"}
            body={task.reviewNote}
            accent={task.status === "DONE" ? "#10B981" : "#F97316"}
          />
        )}
        {task.status === "DONE" && signOffNote && (
          <Panel title="Sign-off note" body={signOffNote} accent="#10B981" />
        )}

        {/* What is being handed over. The reviewer's two moves, sign it off or
            send it back, both need something to judge, and for most of this
            office's work that something is a document rather than a row in a
            section of the platform. */}
        {task.viewer.party !== "NONE" && (
          <Handover
            taskId={taskId}
            attachments={task.attachments}
            handoverNote={task.handoverNote}
            canAttach={task.viewer.canAttach}
            currentUserId={currentUserId}
            status={task.status}
            assigneeName={task.assignee.name}
            onChange={load}
          />
        )}

        {task.evidence && (
          <div
            className="rounded-xl p-4"
            style={{
              background: task.evidence.empty ? "#FFFBEB" : "#F8FAFC",
              border: `1px solid ${task.evidence.empty ? "#FDE68A" : "#e5eaf0"}`,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: task.evidence.empty ? "#92400E" : "#94A3B8" }}>
              Before you sign this off
            </p>
            <p className="text-sm" style={{ color: task.evidence.empty ? "#78350F" : "#475569" }}>
              {task.evidence.summary}
            </p>
            {task.evidence.empty && (
              <p className="text-xs mt-2" style={{ color: "#92400E" }}>
                That may be fine. It may also mean the work went somewhere other than the platform, or that the brief was not clear about where it should land. Worth asking before it becomes the habit.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#991B1B", background: "#FEF2F2" }}>
            {error}
          </p>
        )}

        {/* What the move depends on, then the move */}
        {pending && (
          <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: "#e5eaf0" }}>
            <label className="block text-xs font-semibold text-gray-600">
              {NOTE_PROMPT[pending as keyof typeof NOTE_PROMPT]}
            </label>
            <textarea
              className={inputClass}
              style={inputStyle}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            {pending === "SUBMITTED" && (
              <p className="text-xs" style={{ color: task.attachments.length ? "#64748B" : "#B45309" }}>
                {task.attachments.length
                  ? `${task.attachments.length} ${task.attachments.length === 1 ? "thing" : "things"} attached above. ${task.assigner.name} will see ${task.attachments.length === 1 ? "it" : "them"}.`
                  : "Nothing is attached. Attach the work above, or say in the line here where it lives, so your reviewer is not signing off something they cannot open."}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => move(pending)}
                disabled={saving || !canCommit}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{
                  background:
                    pending === "BLOCKED" ? "#EF4444"
                    : pending === "DONE" ? "#10B981"
                    : pending === "CANCELLED" ? "#64748B"
                    : pending === "SUBMITTED" ? "#0F2744"
                    : "#F97316",
                }}
              >
                {saving ? "Saving" : pending === "DONE" && !note.trim() ? "Sign it off without a note" : ACTION_LABELS[pending]}
              </button>
              <button
                onClick={() => { setPending(null); setNote(""); }}
                className="px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: "#e5eaf0", color: "#64748B" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* What just happened. A settled task says so rather than offering the
            next button as though the move never landed. */}
        {!pending && settled && (
          <div className="rounded-xl p-4" style={{ background: settledTone.bg, border: `1px solid ${settledTone.border}` }}>
            <div className="flex items-start gap-2">
              {task.status === "DONE" ? <CheckCircle2 size={16} style={{ color: settledTone.text, marginTop: 1 }} />
                : task.status === "BLOCKED" ? <OctagonX size={16} style={{ color: settledTone.text, marginTop: 1 }} />
                : <Send size={16} style={{ color: settledTone.text, marginTop: 1 }} />}
              <div>
                <p className="text-sm font-semibold" style={{ color: settledTone.text }}>{settledMessage.title}</p>
                <p className="text-sm mt-0.5" style={{ color: settledTone.text, opacity: 0.85 }}>{settledMessage.detail}</p>
              </div>
            </div>
          </div>
        )}

        {/* One obvious next move, with the rest demoted to quiet links so they
            never read as "that did not work, try again". */}
        {!pending && (primary || secondary.length > 0) && (
          <div className="flex flex-wrap items-center gap-3">
            {primary && (
              <button
                onClick={() => move(primary)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={actionStyle(primary)}
              >
                {primary === "SUBMITTED" ? <Send size={14} /> : primary === "DONE" ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                {ACTION_LABELS[primary] ?? STATUS_LABELS[primary]}
              </button>
            )}
            {secondary.map((to) => (
              <button
                key={to}
                onClick={() => move(to)}
                disabled={saving}
                className="text-sm font-medium underline underline-offset-2 disabled:opacity-50"
                style={{ color: to === "BLOCKED" ? "#B91C1C" : to === "CANCELLED" ? "#94A3B8" : "#64748B" }}
              >
                {ACTION_LABELS[to] ?? STATUS_LABELS[to]}
              </button>
            ))}
          </div>
        )}

        {/* Time actually taken. Once recorded it is a fact in the header, so the
            box comes down rather than sitting there inviting a second answer. */}
        {isAssignee && !task.actualMinutes && ["SUBMITTED", "DONE", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(task.status) && (
          <ActualMinutes current={task.actualMinutes} saving={saving} onSave={(m) => patch({ actualMinutes: m })} />
        )}

        {/* Questions. Not blocking: the work carries on while the answer comes. */}
        {task.viewer.party !== "NONE" && !["DONE", "CANCELLED"].includes(task.status) && (
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">Questions</p>
              {task.questions.length > 0 && (
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {task.questions.filter((q) => !q.answeredAt).length} unanswered
                </p>
              )}
            </div>
            <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
              For when you are still going but unsure what was meant. This is not the same as being stuck, and it does not stop the clock.
            </p>

            {task.questions.length > 0 && (
              <div className="space-y-3 mb-4">
                {task.questions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    q={q}
                    taskId={taskId}
                    currentUserId={currentUserId}
                    onAnswered={load}
                  />
                ))}
              </div>
            )}

            {asking ? (
              <div className="space-y-2">
                <textarea
                  className={inputClass}
                  style={inputStyle}
                  rows={3}
                  autoFocus
                  placeholder="What is not clear?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    disabled={saving || !questionText.trim()}
                    onClick={async () => {
                      setSaving(true);
                      setError("");
                      try {
                        const res = await fetch(`/api/tasks/${taskId}/questions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ question: questionText }),
                        });
                        if (!res.ok) { setError(await parseApiError(res, "Could not send that.")); return; }
                        setQuestionText("");
                        setAsking(false);
                        load();
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: "#0F2744" }}
                  >
                    {saving ? "Sending" : "Ask it"}
                  </button>
                  <button
                    onClick={() => { setAsking(false); setQuestionText(""); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{ borderColor: "#e5eaf0", color: "#64748B" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAsking(true)}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "#0F2744" }}
              >
                <HelpCircle size={14} /> Ask a question
              </button>
            )}
          </div>
        )}

        {/* Sub-tasks */}
        {(task.subtaskRollup.total > 0 || (task.viewer.canBreakDown && canAssign)) && (
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Broken down</p>
              {task.subtaskRollup.total > 0 && (
                <p className="text-xs" style={{ color: "#64748B" }}>
                  {task.subtaskRollup.done} of {task.subtaskRollup.total} done
                  {task.subtaskRollup.blocked > 0 && (
                    <span style={{ color: "#DC2626" }}> · {task.subtaskRollup.blocked} blocked</span>
                  )}
                </p>
              )}
            </div>

            {task.subtaskRollup.total > 0 && (
              <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "#F1F5F9" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(task.subtaskRollup.done / task.subtaskRollup.total) * 100}%`,
                    background: "#10B981",
                  }}
                />
              </div>
            )}

            {task.subtasks.length > 0 ? (
              <div className="space-y-1.5">
                {task.subtasks.map((st) => (
                  <Link
                    key={st.id}
                    href={`/tasks/${st.id}`}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-800 truncate">{st.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px]" style={{ color: "#94A3B8" }}>{st.assignee.name}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: STATUS_STYLES[st.status].bg, color: STATUS_STYLES[st.status].text }}
                      >
                        {STATUS_LABELS[st.status]}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : task.subtaskRollup.total > 0 ? (
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                The detail sits with the people doing it. You see the rollup.
              </p>
            ) : null}

            {task.viewer.canBreakDown && canAssign && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                {breakingDown ? (
                  <SubtaskForm
                    parentTaskId={task.id}
                    currentUserId={currentUserId}
                    onDone={() => { setBreakingDown(false); load(); }}
                    onCancel={() => setBreakingDown(false)}
                  />
                ) : (
                  <button
                    onClick={() => setBreakingDown(true)}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: "#0F2744" }}
                  >
                    <Plus size={14} /> Break off a sub-task
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* How it got here */}
        {task.events.length > 0 && <Trail events={task.events} />}

        {/* Changing hands. Not a status, which is why it never existed: every
            field of a task was editable except the name against it, so work
            died on the desk of whoever went on leave. */}
        {task.viewer.canReassign && (
          <Reassign
            currentAssignee={task.assignee}
            saving={saving}
            onReassign={(assigneeId) => patch({ assigneeId })}
          />
        )}

        {/* Edit the terms */}
        {task.viewer.canEditFields && (
          <div>
            {editing ? (
              <EditForm
                task={task}
                saving={saving}
                onSave={async (body) => { if (await patch(body)) setEditing(false); }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "#64748B" }}
              >
                <Pencil size={13} /> Edit the terms of this task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One obvious next move per state. Everything else is still available, just not
 * competing with it. Abigail's report was that after submitting she saw "Start
 * it" again and read it as the submit having failed.
 */
function primaryFor(status: string, party: string, available: string[]): string | null {
  const isAssignee = party === "ASSIGNEE" || party === "BOTH";
  const isAssigner = party === "ASSIGNER" || party === "BOTH";
  const pick = (t: string) => (available.includes(t) ? t : null);
  if (isAssignee) {
    if (status === "ASSIGNED") return pick("IN_PROGRESS");
    if (status === "IN_PROGRESS") return pick("SUBMITTED");
    if (status === "CHANGES_REQUESTED") return pick("IN_PROGRESS");
  }
  if (isAssigner) {
    if (status === "SUBMITTED") return pick("DONE");
    if (status === "BLOCKED") return pick("IN_PROGRESS");
  }
  return null;
}

/** Says what happened and who holds it now, from the reader's side of the desk. */
function settledCopy(
  task: TaskDetail,
  justMoved: string | null,
): { title: string; detail: string } {
  const mine = task.viewer.party === "ASSIGNEE" || task.viewer.party === "BOTH";
  const fresh = justMoved === task.status;
  switch (task.status) {
    case "SUBMITTED":
      return mine
        ? {
            title: fresh ? "Submitted." : "Submitted and waiting.",
            detail: `${task.assigner.name} has it now and will either sign it off or send it back with a note. Nothing further is needed from you.`,
          }
        : {
            title: `${task.assignee.name} submitted this.`,
            detail: "It is waiting on your review.",
          };
    case "BLOCKED":
      return mine
        ? {
            title: fresh ? "Marked blocked." : "Blocked.",
            detail: `${task.assigner.name} has been told what is in the way and will come back to you. You do not need to chase it, and this does not count against you.`,
          }
        : {
            title: `${task.assignee.name} is stuck.`,
            detail: "They are waiting on you to clear what is in the way.",
          };
    case "DONE":
      return {
        title: "Signed off.",
        detail: `${task.assigner.name} accepted this as done.`,
      };
    default:
      return { title: "Cancelled.", detail: "No further work is needed on this." };
  }
}

function QuestionRow({
  q,
  taskId,
  currentUserId,
  onAnswered,
}: {
  q: Question;
  taskId: string;
  currentUserId: string;
  onAnswered: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  // You cannot answer your own question, which would record nothing anybody needed.
  const canAnswer = !q.answeredAt && q.askedBy.id !== currentUserId;

  return (
    <div className="rounded-lg p-3" style={{ background: "#F8FAFC", border: "1px solid #f1f5f9" }}>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.question}</p>
      <p className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>
        {q.askedBy.name} · {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </p>

      {q.answeredAt && q.answer && (
        <div className="mt-2 pl-3" style={{ borderLeft: "2px solid #10B981" }}>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.answer}</p>
          <p className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>{q.answeredBy?.name ?? "Answered"}</p>
        </div>
      )}

      {canAnswer && (
        <div className="mt-2 space-y-2">
          <textarea
            className={inputClass}
            style={inputStyle}
            rows={2}
            placeholder="Answer it"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          {err && <p className="text-xs" style={{ color: "#DC2626" }}>{err}</p>}
          <button
            disabled={saving || !answer.trim()}
            onClick={async () => {
              setSaving(true);
              setErr("");
              try {
                const res = await fetch(`/api/tasks/${taskId}/questions/${q.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ answer }),
                });
                if (!res.ok) { setErr(await parseApiError(res, "Could not save that.")); return; }
                setAnswer("");
                onAnswered();
              } finally {
                setSaving(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
            style={{ background: "#0F2744" }}
          >
            {saving ? "Sending" : "Send the answer"}
          </button>
        </div>
      )}

      {!q.answeredAt && !canAnswer && (
        <p className="text-[11px] mt-2" style={{ color: "#94A3B8" }}>Waiting for an answer.</p>
      )}
    </div>
  );
}

function actionStyle(to: string): React.CSSProperties {
  if (to === "BLOCKED") return { background: "#fff", color: "#991B1B", border: "1px solid #FCA5A5" };
  if (to === "CHANGES_REQUESTED") return { background: "#fff", color: "#9A3412", border: "1px solid #FDBA74" };
  if (to === "DONE") return { background: "#10B981", color: "#fff", border: "1px solid #10B981" };
  if (to === "CANCELLED") return { background: "#fff", color: "#6B7280", border: "1px solid #e5eaf0" };
  return { background: "#0F2744", color: "#fff", border: "1px solid #0F2744" };
}

function Fact({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <span>
      <span style={{ color: "#94A3B8" }}>{label} </span>
      <span className="font-medium" style={{ color: alert ? "#DC2626" : "#334155" }}>{value}</span>
    </span>
  );
}

function Panel({ title, body, accent = "#0F2744" }: { title: string; body: string; accent?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0", borderLeft: `3px solid ${accent}` }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>
        {title}
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{body}</p>
    </div>
  );
}

function ActualMinutes({
  current,
  saving,
  onSave,
}: {
  current: number | null;
  saving: boolean;
  onSave: (minutes: number) => void;
}) {
  const [value, setValue] = useState(current ? String(current) : "");
  return (
    <div className="rounded-xl border bg-white p-4 flex flex-wrap items-end gap-3" style={{ borderColor: "#e5eaf0" }}>
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          How long it actually took (minutes)
        </label>
        <input
          type="number"
          min={1}
          className={inputClass}
          style={inputStyle}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <button
        onClick={() => onSave(Number(value))}
        disabled={saving || !value}
        className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
        style={{ borderColor: "#e5eaf0", color: "#0F2744" }}
      >
        Record
      </button>
    </div>
  );
}

function SubtaskForm({
  parentTaskId,
  currentUserId,
  onDone,
  onCancel,
}: {
  parentTaskId: string;
  currentUserId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [people, setPeople] = useState<TaskPerson[]>([]);
  const [form, setForm] = useState({
    title: "",
    assigneeId: "",
    brief: "",
    definitionOfDone: "",
    workedExample: "",
    dueDate: "",
    checkInAt: "",
    estimatedMinutes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tasks/people")
      .then((r) => r.json())
      .then((d) => setPeople(d.people ?? []))
      .catch(() => setPeople([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parentTaskId,
          assigneeId: form.assigneeId || currentUserId,
          estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
          dueDate: form.dueDate || null,
          checkInAt: form.checkInAt || null,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res, "Could not create the sub-task."));
        return;
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className={inputClass}
        style={inputStyle}
        placeholder="What the sub-task is"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        required
      />
      <select className={inputClass} style={inputStyle} value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}>
        <option value="">Myself</option>
        {people.filter((p) => p.id !== currentUserId).map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <textarea
        className={inputClass}
        style={inputStyle}
        rows={2}
        placeholder="Why this matters and what it feeds into"
        value={form.brief}
        onChange={(e) => set("brief", e.target.value)}
        required
      />
      <textarea
        className={inputClass}
        style={inputStyle}
        rows={2}
        placeholder="Done looks like"
        value={form.definitionOfDone}
        onChange={(e) => set("definitionOfDone", e.target.value)}
        required
      />
      <textarea
        className={inputClass}
        style={inputStyle}
        rows={2}
        placeholder="One that is already right (a link, or what a finished one contains)"
        value={form.workedExample}
        onChange={(e) => set("workedExample", e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input type="date" className={inputClass} style={inputStyle} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        <input type="date" className={inputClass} style={inputStyle} value={form.checkInAt} onChange={(e) => set("checkInAt", e.target.value)} />
        <input type="number" min={1} placeholder="Estimate (min)" className={inputClass} style={inputStyle} value={form.estimatedMinutes} onChange={(e) => set("estimatedMinutes", e.target.value)} />
      </div>
      {error && <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: "#0F2744" }}>
          {saving ? "Saving" : "Send it"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "#e5eaf0", color: "#64748B" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditForm({
  task,
  saving,
  onSave,
  onCancel,
}: {
  task: TaskDetail;
  saving: boolean;
  onSave: (body: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: task.title,
    brief: task.brief,
    definitionOfDone: task.definitionOfDone,
    workedExample: task.workedExample ?? "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    checkInAt: task.checkInAt ? task.checkInAt.slice(0, 10) : "",
    estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="rounded-xl border bg-white p-5 space-y-3" style={{ borderColor: "#e5eaf0" }}>
      <input className={inputClass} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} />
      <textarea className={inputClass} style={inputStyle} rows={3} value={form.brief} onChange={(e) => set("brief", e.target.value)} />
      <textarea className={inputClass} style={inputStyle} rows={3} value={form.definitionOfDone} onChange={(e) => set("definitionOfDone", e.target.value)} />
      <textarea className={inputClass} style={inputStyle} rows={2} placeholder="One that is already right" value={form.workedExample} onChange={(e) => set("workedExample", e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Due</label>
          <input type="date" className={inputClass} style={inputStyle} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <CalendarClock size={11} /> Check in
          </label>
          <input type="date" className={inputClass} style={inputStyle} value={form.checkInAt} onChange={(e) => set("checkInAt", e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Estimate (min)</label>
          <input type="number" min={1} className={inputClass} style={inputStyle} value={form.estimatedMinutes} onChange={(e) => set("estimatedMinutes", e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave({
              ...form,
              dueDate: form.dueDate || null,
              checkInAt: form.checkInAt || null,
              estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
            })
          }
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#0F2744" }}
        >
          {saving ? "Saving" : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "#e5eaf0", color: "#64748B" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function fileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * What is actually being handed over.
 *
 * Submitting used to record a timestamp. The reviewer opened the task, saw
 * "Abigail Oladejo submitted this", and had nowhere to go: the work was in a
 * shared folder, or an email, or nowhere. Sign-off became a courtesy extended
 * to someone whose work nobody had seen.
 *
 * A link counts. Most of this office's output lands in a shared drive and
 * insisting on an upload would only mean nothing gets recorded at all.
 */
function Handover({
  taskId,
  attachments,
  handoverNote,
  canAttach,
  currentUserId,
  status,
  assigneeName,
  onChange,
}: {
  taskId: string;
  attachments: Attachment[];
  handoverNote: string | null;
  canAttach: boolean;
  currentUserId: string;
  status: string;
  assigneeName: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [linking, setLinking] = useState(false);
  const [link, setLink] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  async function record(body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setErr(await parseApiError(res, "Could not attach that.")); return false; }
      onChange();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file: File) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          folder: "tasks",
          fileSize: file.size,
        }),
      });
      if (!res.ok) { setErr(await parseApiError(res, "Could not start the upload.")); return; }
      const { uploadUrl, key } = await res.json();

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) { setErr("The file did not reach storage. Try it again."); return; }

      await record({ fileKey: key, label: file.name, contentType: file.type, sizeBytes: file.size });
    } catch {
      setErr("The upload did not finish. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function openAttachment(a: Attachment) {
    if (a.url) { window.open(a.url, "_blank", "noopener"); return; }
    const res = await fetch(`/api/tasks/${taskId}/attachments/${a.id}`);
    if (!res.ok) { setErr(await parseApiError(res, "Could not open that.")); return; }
    const { downloadUrl } = await res.json();
    window.open(downloadUrl, "_blank", "noopener");
  }

  async function remove(a: Attachment) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments/${a.id}`, { method: "DELETE" });
      if (!res.ok) { setErr(await parseApiError(res, "Could not take that down.")); return; }
      onChange();
    } finally {
      setBusy(false);
    }
  }

  const handedIn = ["SUBMITTED", "CHANGES_REQUESTED", "DONE"].includes(status);
  if (!canAttach && attachments.length === 0 && !handoverNote) return null;

  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip size={14} style={{ color: "#64748B" }} /> What is being handed over
        </p>
        {attachments.length > 0 && (
          <span className="text-xs" style={{ color: "#94A3B8" }}>{attachments.length}</span>
        )}
      </div>
      <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
        The file itself, or a link to where it lives. A shared folder is a fine answer; nothing at all is not.
      </p>

      {handoverNote && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg px-3 py-2 mb-3" style={{ background: "#F8FAFC" }}>
          {handoverNote}
        </p>
      )}

      {attachments.length === 0 ? (
        <p
          className="text-sm rounded-lg px-3 py-3"
          style={handedIn
            ? { background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }
            : { background: "#F8FAFC", color: "#94A3B8" }}
        >
          {handedIn
            ? `Nothing was attached. Whatever ${assigneeName} did is somewhere other than here, so there is no record of what was signed off.`
            : "Nothing attached yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: "#e5eaf0" }}
            >
              {a.isFile
                ? <Paperclip size={14} className="shrink-0" style={{ color: "#64748B" }} />
                : <Link2 size={14} className="shrink-0" style={{ color: "#64748B" }} />}
              <button
                onClick={() => openAttachment(a)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-sm font-medium text-gray-900 truncate hover:underline">{a.label}</span>
                <span className="block text-[11px]" style={{ color: "#94A3B8" }}>
                  {a.uploadedBy.name}
                  {a.sizeBytes ? ` · ${fileSize(a.sizeBytes)}` : ""}
                  {` · ${formatDate(a.createdAt)}`}
                </span>
              </button>
              <button onClick={() => openAttachment(a)} className="shrink-0 p-1" title="Open it">
                <Download size={14} style={{ color: "#64748B" }} />
              </button>
              {canAttach && a.uploadedBy.id === currentUserId && status !== "DONE" && (
                <button onClick={() => remove(a)} disabled={busy} className="shrink-0 p-1" title="Take it down">
                  <Trash2 size={14} style={{ color: "#CBD5E1" }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {err && <p className="text-xs mt-3" style={{ color: "#DC2626" }}>{err}</p>}

      {canAttach && (
        <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid #f1f5f9" }}>
          {linking ? (
            <div className="space-y-2">
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                autoFocus
              />
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="What it is, in a few words"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  disabled={busy || !link.trim()}
                  onClick={async () => {
                    if (await record({ url: link, label: linkLabel })) {
                      setLink(""); setLinkLabel(""); setLinking(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                  style={{ background: "#0F2744" }}
                >
                  {busy ? "Saving" : "Add the link"}
                </button>
                <button
                  onClick={() => { setLinking(false); setLink(""); setLinkLabel(""); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ borderColor: "#e5eaf0", color: "#64748B" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <label
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                style={{ color: busy ? "#94A3B8" : "#0F2744" }}
              >
                <Paperclip size={14} />
                {busy ? "Uploading" : "Attach a file"}
                <input
                  type="file"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void uploadFile(f);
                  }}
                />
              </label>
              <button
                onClick={() => setLinking(true)}
                disabled={busy}
                className="flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                style={{ color: "#0F2744" }}
              >
                <Link2 size={14} /> Paste a link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * How it got here.
 *
 * A task that bounced three times and one that landed first time read
 * identically on the board. The status says where the work is; only this can
 * say what happened to it, which is the part worth knowing about how a working
 * relationship is actually going.
 */
function Trail({ events }: { events: TaskEvent[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? events : events.slice(-3);

  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5eaf0" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">How it got here</p>
        {events.length > 3 && (
          <button onClick={() => setOpen(!open)} className="text-xs font-medium" style={{ color: "#64748B" }}>
            {open ? "Show less" : `All ${events.length}`}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {shown.map((e) => (
          <div key={e.id} className="flex gap-3">
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
              style={{ background: STATUS_STYLES[e.toStatus ?? "ASSIGNED"]?.dot ?? "#CBD5E1" }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{e.actor.name}</span>{" "}
                {e.kind === "RAISED" ? "raised it"
                  : e.kind === "REASSIGNED" ? "moved it to someone else"
                  : `moved it to ${(STATUS_LABELS[e.toStatus ?? ""] ?? "").toLowerCase()}`}
              </p>
              {e.note && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-0.5">{e.note}</p>
              )}
              <p className="text-[11px] mt-0.5" style={{ color: "#94A3B8" }}>
                {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Moving the work to somebody else. The one move the board never had: when
 * Abigail is away, her tasks used to sit on her desk until she came back.
 */
function Reassign({
  currentAssignee,
  saving,
  onReassign,
}: {
  currentAssignee: TaskPerson;
  saving: boolean;
  onReassign: (assigneeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<TaskPerson[]>([]);
  const [picked, setPicked] = useState("");

  useEffect(() => {
    if (!open || people.length) return;
    fetch("/api/tasks/people")
      .then((r) => r.json())
      .then((d) => setPeople(d.people ?? []))
      .catch(() => setPeople([]));
  }, [open, people.length]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: "#64748B" }}
      >
        <UserCog size={13} /> Move this to somebody else
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: "#e5eaf0" }}>
      <p className="text-xs font-semibold text-gray-600">
        {currentAssignee.name} is carrying this. Who takes it on?
      </p>
      <select
        className={inputClass}
        style={inputStyle}
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
      >
        <option value="">Choose somebody</option>
        {people.filter((p) => p.id !== currentAssignee.id).map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <p className="text-xs" style={{ color: "#94A3B8" }}>
        They get the brief, the definition of done and anything already attached. The trail keeps both names.
      </p>
      <div className="flex gap-2">
        <button
          disabled={saving || !picked}
          onClick={() => { onReassign(picked); setOpen(false); setPicked(""); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#0F2744" }}
        >
          {saving ? "Saving" : "Hand it over"}
        </button>
        <button
          onClick={() => { setOpen(false); setPicked(""); }}
          className="px-4 py-2 rounded-lg text-sm font-medium border"
          style={{ borderColor: "#e5eaf0", color: "#64748B" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
