import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { canUseOfficeDesk, nextOccurrenceAfter } from "@/lib/office";
import { NEXT_MOVE, OPEN_STATUSES, canAssignToOthers, whoseMove } from "@/lib/tasks";
import { FINANCE_READ_ROLES, PIPELINE_ROLES } from "@/lib/constants";

/**
 * GET /api/desk?forUserId=...
 *
 * One question, asked of everything: whose move is it?
 *
 * At any moment a thing is waiting on you, waiting on somebody else, waiting on
 * a date, or waiting on nobody. That is exhaustive and it does not overlap.
 *
 * The route said so from the start and then broke it in six places. Blocked
 * work sat under "yours" with the action "waiting on an answer". Work you had
 * submitted appeared under nothing at all, because the status list here and the
 * one in lib/tasks disagreed about whether submitted work was still open. A
 * check-in emitted a second row for a task already listed. Commitments you
 * personally owed were filtered out by name. And the fourth bucket, the things
 * nobody holds, was never built, so overdue invoices were filed as yours and
 * duplicated onto every desk that could see finance.
 *
 * Now every row declares whose move it is, one function decides, and the
 * buckets are the partition rather than four lists written by hand.
 */

type Urgency = "OVERDUE" | "TODAY" | "SOON" | "NONE";

/** The four answers. Every row carries exactly one. */
type Move = "YOU" | "SOMEONE" | "A_DATE" | "NOBODY";

interface Row {
  kind: string;
  id: string;
  title: string;
  detail: string;
  href: string;
  date: string | null;
  urgency: Urgency;
  action: string;
  move: Move;
}

function urgencyOf(date: Date | null, now: Date): Urgency {
  if (!date) return "NONE";
  const days = Math.floor((date.getTime() - now.getTime()) / 86400000);
  if (days < 0) return "OVERDUE";
  if (days === 0) return "TODAY";
  if (days <= 3) return "SOON";
  return "NONE";
}

const ORDER: Record<Urgency, number> = { OVERDUE: 0, TODAY: 1, SOON: 2, NONE: 3 };

function sortRows(rows: Row[]): Row[] {
  return rows.sort((a, b) => {
    if (ORDER[a.urgency] !== ORDER[b.urgency]) return ORDER[a.urgency] - ORDER[b.urgency];
    if (a.date && b.date) return a.date.localeCompare(b.date);
    return a.date ? -1 : b.date ? 1 : 0;
  });
}

function daysSince(date: Date | null, now: Date): number {
  if (!date) return 0;
  return Math.floor((now.getTime() - date.getTime()) / 86400000);
}

export const GET = handler(async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseOfficeDesk(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const requested = req.nextUrl.searchParams.get("forUserId");
  // Opening somebody else's desk is what the office does for the principal it
  // serves. Everyone else sees their own and only their own.
  if (requested && requested !== session.user.id && !canAssignToOthers(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const subjectId = requested || session.user.id;
  const subject = await prisma.user.findUnique({
    where: { id: subjectId },
    select: { id: true, name: true, role: true },
  });
  if (!subject) return Response.json({ error: "Not found" }, { status: 404 });

  const me = subject.id;
  const viewingSelf = me === session.user.id;
  const now = new Date();
  const weekOut = new Date(now.getTime() + 7 * 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  // Firm-level rows are gated on the VIEWER, not the subject: the office can
  // open the Founding Partner's desk without inheriting his finance sight.
  const seesFinance = FINANCE_READ_ROLES.includes(session.user.role as typeof FINANCE_READ_ROLES[number]);
  const seesPipeline = PIPELINE_ROLES.includes(session.user.role as typeof PIPELINE_ROLES[number]);

  const [
    tasks, questions, myDecisions, raisedDecisions, deferredDecisions, owedByMe, owedToMe,
    meetings, rhythms, nextActions, overdueInvoices, silentProposals, lowStock,
  ] = await Promise.all([
    // One query for every open task I touch, from either side of the desk, so
    // no task can be counted twice and none can fall between two filters.
    prisma.task.findMany({
      where: { status: { in: OPEN_STATUSES }, OR: [{ assigneeId: me }, { assignerId: me }] },
      select: {
        id: true, title: true, status: true, dueDate: true, checkInAt: true,
        submittedAt: true, blockedReason: true,
        assigneeId: true, assignerId: true,
        assignee: { select: { name: true } },
        assigner: { select: { name: true } },
        _count: { select: { attachments: true } },
      },
    }),
    // A question is the quiet half of being stuck. Blocking escalates the same
    // day and an unanswered question escalated nowhere at all, so the two
    // channels for "I need something from you" had completely different odds of
    // being heard.
    prisma.taskQuestion.findMany({
      where: { answeredAt: null, task: { OR: [{ assigneeId: me }, { assignerId: me }] } },
      select: {
        id: true, question: true, createdAt: true, askedById: true,
        askedBy: { select: { name: true } },
        task: { select: { id: true, title: true, assigneeId: true, assignee: { select: { name: true } }, assigner: { select: { name: true } } } },
      },
      take: 25,
    }),
    prisma.decision.findMany({
      where: { forUserId: me, status: "PENDING" },
      select: { id: true, title: true, dueBy: true, raisedBy: { select: { name: true } } },
    }),
    prisma.decision.findMany({
      where: { raisedById: me, status: "PENDING", NOT: { forUserId: me } },
      select: { id: true, title: true, dueBy: true, forUser: { select: { name: true } } },
    }),
    // Deferring without a date is a slower no. These used to drop off every
    // list the moment they were deferred, which is how a decision gets made by
    // running out of time.
    prisma.decision.findMany({
      where: { forUserId: me, status: "DEFERRED" },
      select: { id: true, title: true, dueBy: true, updatedAt: true },
      take: 15,
    }),
    // What I owe. Excluded from this desk by name until now, so the office
    // tracked every promise made to it and none of the ones it made.
    prisma.commitment.findMany({
      where: { status: { in: ["OPEN", "CHASED"] }, owedByUserId: me },
      select: {
        id: true, what: true, dueDate: true, chaseCount: true,
        owedToUser: { select: { name: true } },
      },
    }),
    prisma.commitment.findMany({
      where: {
        status: { in: ["OPEN", "CHASED"] },
        OR: [{ owedToUserId: me }, { recordedById: me }],
        NOT: { owedByUserId: me },
      },
      select: {
        id: true, what: true, dueDate: true, nextChaseAt: true, chaseCount: true,
        owedByName: true, owedByUser: { select: { name: true } },
      },
    }),
    prisma.meeting.findMany({
      where: {
        scheduledAt: { gte: now, lte: weekOut },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        OR: [{ organizerId: me }, { participants: { some: { userId: me } } }],
      },
      select: { id: true, title: true, scheduledAt: true, meetLink: true, _count: { select: { participants: true } } },
    }),
    prisma.recurringTask.findMany({
      where: { active: true, assigneeId: me },
      select: {
        id: true, title: true, cadence: true, dayOfWeek: true, dayOfMonth: true,
        monthOfYear: true, leadTimeDays: true, lastGeneratedFor: true,
      },
    }),
    prisma.communication.findMany({
      where: { nextActionAssignedToId: me, nextActionDate: { lte: weekOut } },
      orderBy: { nextActionDate: "asc" },
      select: { id: true, subject: true, nextAction: true, nextActionDate: true },
      take: 15,
    }),
    seesFinance
      ? prisma.invoice.findMany({
          where: { status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] }, dueDate: { lt: now } },
          orderBy: { dueDate: "asc" },
          select: { id: true, invoiceNumber: true, dueDate: true, balanceDue: true, currency: true, client: { select: { name: true } } },
          take: 15,
        })
      : Promise.resolve([]),
    seesPipeline
      ? prisma.proposal.findMany({
          where: { status: "SENT", sentAt: { lt: weekAgo } },
          orderBy: { sentAt: "asc" },
          select: { id: true, title: true, clientName: true, sentAt: true },
          take: 15,
        })
      : Promise.resolve([]),
    prisma.$queryRaw<Array<{ id: string; name: string; quantityOnHand: number; reorderLevel: number; unit: string }>>`
      SELECT "id", "name", "quantityOnHand", "reorderLevel", "unit"
      FROM "StockItem" WHERE "quantityOnHand" <= "reorderLevel"
      ORDER BY "quantityOnHand" ASC LIMIT 15
    `,
  ]);

  const rows: Row[] = [];

  // ── Tasks ────────────────────────────────────────────────────────────────
  // One row per task. The status decides whose move it is; being the assignee
  // does not. Work you handed in is not yours even though you own it, and work
  // you are blocked on is not yours even though it is on your list.
  for (const t of tasks) {
    const mine = whoseMove(t, me) === "MINE";
    const iAmDoer = t.assigneeId === me;
    const waited = daysSince(t.submittedAt, now);
    // A check-in that has come due belongs on the task's own row. It used to be
    // a second row for the same task sitting directly beneath it.
    const checkInDue = !!t.checkInAt && t.checkInAt <= now && t.status !== "SUBMITTED" && t.status !== "BLOCKED";

    let detail: string;
    let action: string;
    let date: Date | null = t.dueDate;
    let urgency: Urgency;

    if (t.status === "SUBMITTED") {
      date = t.submittedAt;
      if (mine) {
        detail = waited >= 2
          ? `${t.assignee.name} submitted this ${waited} days ago and has heard nothing.`
          : `${t.assignee.name} submitted this${t._count.attachments ? ` with ${t._count.attachments} attached` : ", with nothing attached"}.`;
        action = "Review it";
        urgency = waited >= 2 ? "OVERDUE" : waited >= 1 ? "SOON" : "TODAY";
      } else {
        // No date on this row. The only date it has is the day it was handed
        // in, and showing that in a column headed by how late things are reads
        // as an accusation against the person who finished on time.
        date = null;
        detail = `Handed to ${t.assigner.name}${waited >= 1 ? ` ${waited} day${waited === 1 ? "" : "s"} ago` : ""}. Nothing further is needed from you.`;
        action = "Waiting on review";
        urgency = "NONE";
      }
    } else if (t.status === "BLOCKED") {
      if (mine) {
        detail = `${t.assignee.name} is stuck. ${t.blockedReason ?? "No reason given."}`;
        action = "Unblock them";
        urgency = "TODAY";
      } else {
        detail = `${t.assigner.name} has been told what is in the way.`;
        action = "Waiting on an answer";
        urgency = "NONE";
      }
    } else if (iAmDoer && mine) {
      detail =
        t.status === "CHANGES_REQUESTED" ? `${t.assigner.name} sent this back with a note.`
        : checkInDue ? `The mid-point conversation with ${t.assigner.name} was set for today or earlier.`
        : `From ${t.assigner.name}.`;
      action =
        t.status === "CHANGES_REQUESTED" ? "Pick it back up"
        : checkInDue ? "Check in, then carry on"
        : "Do it";
      urgency = checkInDue && urgencyOf(t.dueDate, now) === "NONE" ? "TODAY" : urgencyOf(t.dueDate, now);
    } else {
      detail = `With ${t.assignee.name}.`;
      action = "Waiting";
      urgency = urgencyOf(t.dueDate, now);
    }

    rows.push({
      kind: !mine ? "TASK_OUT" : NEXT_MOVE[t.status] === "REVIEWER" ? "REVIEW" : "TASK",
      id: t.id, title: t.title, detail, href: `/tasks/${t.id}`,
      date: date?.toISOString() ?? null,
      urgency,
      action,
      move: mine ? "YOU" : "SOMEONE",
    });
  }

  // ── Questions on a task ──────────────────────────────────────────────────
  // Not the task itself, which is somewhere else on this desk and still moving.
  // The question is its own open loop, owed by whichever party did not ask it.
  for (const q of questions) {
    const iAsked = q.askedById === me;
    const answerer = q.task.assigneeId === q.askedById ? q.task.assigner.name : q.task.assignee.name;
    const age = daysSince(q.createdAt, now);
    rows.push({
      kind: iAsked ? "QUESTION_OUT" : "QUESTION",
      id: q.id,
      title: q.question.length > 90 ? `${q.question.slice(0, 90)}...` : q.question,
      detail: iAsked
        ? `You asked ${answerer} on ${q.task.title}. ${age >= 2 ? `${age} days ago.` : ""}`.trim()
        : `${q.askedBy.name} asked this on ${q.task.title}. They are still working while they wait.`,
      href: `/tasks/${q.task.id}`,
      date: q.createdAt.toISOString(),
      urgency: iAsked ? "NONE" : age >= 2 ? "OVERDUE" : age >= 1 ? "SOON" : "TODAY",
      action: iAsked ? "Waiting on an answer" : "Answer it",
      move: iAsked ? "SOMEONE" : "YOU",
    });
  }

  // ── Decisions ────────────────────────────────────────────────────────────
  for (const d of myDecisions) {
    rows.push({
      kind: "DECISION", id: d.id, title: d.title,
      detail: `${d.raisedBy.name} needs a decision.`,
      href: `/decisions#${d.id}`, date: d.dueBy?.toISOString() ?? null,
      urgency: urgencyOf(d.dueBy, now), action: "Decide", move: "YOU",
    });
  }
  for (const d of raisedDecisions) {
    rows.push({
      kind: "DECISION_OUT", id: d.id, title: d.title, detail: `With ${d.forUser.name}.`,
      href: `/decisions#${d.id}`, date: d.dueBy?.toISOString() ?? null,
      urgency: urgencyOf(d.dueBy, now), action: "Waiting", move: "SOMEONE",
    });
  }
  for (const d of deferredDecisions) {
    rows.push({
      kind: "DECISION_DEFERRED", id: d.id, title: d.title,
      detail: `Deferred ${daysSince(d.updatedAt, now)} days ago with no date to come back on.`,
      href: `/decisions#${d.id}`, date: null,
      urgency: "NONE", action: "Give it a date or decide it", move: "NOBODY",
    });
  }

  // ── Commitments ──────────────────────────────────────────────────────────
  for (const c of owedByMe) {
    rows.push({
      kind: "COMMITMENT_MINE", id: c.id, title: c.what,
      detail: c.owedToUser ? `You promised this to ${c.owedToUser.name}.` : "You promised this.",
      href: "/commitments", date: c.dueDate?.toISOString() ?? null,
      urgency: urgencyOf(c.dueDate, now), action: "Honour it", move: "YOU",
    });
  }
  for (const c of owedToMe) {
    const who = c.owedByUser?.name ?? c.owedByName ?? "someone";
    const dueChase = !!c.nextChaseAt && c.nextChaseAt <= now;
    rows.push({
      kind: "COMMITMENT", id: c.id, title: c.what,
      detail: `${who}. ${c.chaseCount ? `Chased ${c.chaseCount} time${c.chaseCount === 1 ? "" : "s"}.` : "Never chased."}`,
      href: "/commitments", date: c.dueDate?.toISOString() ?? null,
      urgency: dueChase ? "TODAY" : urgencyOf(c.dueDate, now),
      action: dueChase ? "Chase it" : "Watching", move: "SOMEONE",
    });
  }

  // ── Follow-ups, meetings, the rhythm ─────────────────────────────────────
  for (const c of nextActions) {
    const due = !!c.nextActionDate && c.nextActionDate <= now;
    rows.push({
      kind: "FOLLOW_UP", id: c.id, title: c.nextAction ?? c.subject ?? "Follow up",
      detail: "A follow-up set on a logged conversation.",
      href: "/communications", date: c.nextActionDate?.toISOString() ?? null,
      urgency: urgencyOf(c.nextActionDate, now), action: due ? "Follow up" : "Coming up",
      move: due ? "YOU" : "A_DATE",
    });
  }
  for (const m of meetings) {
    rows.push({
      kind: "MEETING", id: m.id, title: m.title,
      detail: `${m._count.participants} attending.${m.meetLink ? "" : " No join link, so nobody was invited."}`,
      href: `/meetings/${m.id}`, date: m.scheduledAt.toISOString(),
      urgency: urgencyOf(m.scheduledAt, now), action: m.meetLink ? "Prepare" : "Fix the link",
      move: "A_DATE",
    });
  }
  for (const r of rhythms) {
    const next = nextOccurrenceAfter(r, now);
    if (!next) continue;
    // Once the lead time has passed, this occurrence exists as a real task and
    // is already on this desk. Listing the cadence as well put a board pack
    // under "coming up" on the same screen as the board pack under "yours now".
    if (r.lastGeneratedFor && r.lastGeneratedFor >= next) continue;
    if (new Date(next.getTime() - r.leadTimeDays * 86400000) > weekOut) continue;
    rows.push({
      kind: "RHYTHM", id: r.id, title: r.title,
      detail: "Recurring. It appears on the desk automatically.",
      href: "/rhythm", date: next.toISOString(), urgency: "NONE", action: "Coming up",
      move: "A_DATE",
    });
  }

  // ── The firm's own loose ends ────────────────────────────────────────────
  // Nobody holds these. Filing them as yours put the same overdue invoice on
  // four desks and made it nobody's job on all four.
  for (const i of overdueInvoices) {
    rows.push({
      kind: "INVOICE", id: i.id, title: `${i.invoiceNumber}, ${i.client.name}`,
      detail: `${i.currency} ${Number(i.balanceDue).toLocaleString()} outstanding, past its due date.`,
      href: `/finance/invoices/${i.id}`, date: i.dueDate?.toISOString() ?? null,
      urgency: "OVERDUE", action: "Chase it", move: "NOBODY",
    });
  }
  for (const p of silentProposals) {
    rows.push({
      kind: "PROPOSAL", id: p.id, title: `${p.title}, ${p.clientName}`,
      detail: "Sent over a week ago and nobody has replied.",
      href: "/proposals", date: p.sentAt?.toISOString() ?? null,
      urgency: "SOON", action: "Follow up", move: "NOBODY",
    });
  }
  for (const s of lowStock) {
    rows.push({
      kind: "STOCK", id: s.id, title: s.name,
      detail: `${s.quantityOnHand} ${s.unit}${s.quantityOnHand === 1 ? "" : "s"} left, reorder at ${s.reorderLevel}.`,
      href: "/inventory", date: null, urgency: "SOON", action: "Reorder", move: "NOBODY",
    });
  }

  // The partition. Four buckets, one pass, nothing in two places and nothing
  // left over.
  const by = (move: Move) => sortRows(rows.filter((r) => r.move === move));
  const yoursNow = by("YOU");
  const waitingOnOthers = by("SOMEONE");
  const scheduled = by("A_DATE");
  const nobodyHolds = by("NOBODY");

  return Response.json({
    generatedAt: now.toISOString(),
    subject: { ...subject, viewingSelf },
    canViewOthers: canAssignToOthers(session.user.role),
    yoursNow,
    waitingOnOthers,
    scheduled,
    nobodyHolds,
    headline: {
      yoursNow: yoursNow.length,
      late: yoursNow.filter((r) => r.urgency === "OVERDUE").length,
      waiting: waitingOnOthers.length,
      blocked: yoursNow.filter((r) => r.action === "Unblock them").length,
      toChase: waitingOnOthers.filter((r) => r.action === "Chase it").length,
      scheduled: scheduled.length,
      nobodyHolds: nobodyHolds.length,
    },
  });
});
