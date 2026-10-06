import { prisma } from "@/lib/prisma";
import { can, type StaffSession } from "@/lib/staffAuth";
import { isoWeek } from "@/lib/havenScoreboard";

/**
 * What is waiting on one person, right now.
 *
 * Deliberately one function, used by both the page and the email. Two
 * implementations of "what do I owe" drift within a month, and the first time
 * the email says three things and the page shows two, people stop believing
 * either.
 *
 * Ordered by urgency and capped. A list of fourteen outstanding items is not a
 * to-do list, it is a reason to close the tab, and the research on alert
 * fatigue is unambiguous about what happens next.
 */

export type Urgency = "NOW" | "TODAY" | "THIS_WEEK";

export interface WaitingItem {
  kind: "FLAG" | "TASK" | "PROTOCOL" | "TRAINING" | "LEAVE" | "PULSE" | "NUMBERS";
  title: string;
  detail?: string;
  urgency: Urgency;
  /** Deep link, so an email lands on the thing rather than on the front page. */
  href: string;
}

const RANK: Record<Urgency, number> = { NOW: 0, TODAY: 1, THIS_WEEK: 2 };
const MAX_ITEMS = 6;

/** Midnight UTC for a given day, which is how task completions are keyed. */
function dayKey(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function matches(roles: string[], position: string, department: string) {
  if (roles.length === 0) return true;
  const hay = `${position} ${department}`.toLowerCase();
  return roles.some((r) => {
    const needle = r.toLowerCase().replace(/^every /, "").replace(/s$/, "");
    return hay.includes(needle) || needle.includes("everybody") || needle.includes("all ");
  });
}

export async function whatsWaiting(session: StaffSession): Promise<WaitingItem[]> {
  const me = await prisma.staffMember.findUnique({
    where: { id: session.sub },
    select: { id: true, position: true, department: true },
  });
  if (!me) return [];

  const today = dayKey();
  const week = isoWeek();
  const items: WaitingItem[] = [];

  const [tasks, doneToday, openFlags, protocols, progress, presenting, leaveWaiting, pulsed, numbers] =
    await Promise.all([
      prisma.staffTask.findMany({
        where: { clientId: session.clientId, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY"] } },
        select: { id: true, code: true, title: true, roles: true, why: true },
      }),
      prisma.staffTaskCompletion.findMany({
        where: { staffId: me.id, forDate: today },
        select: { taskId: true },
      }),
      prisma.staffTaskFlag.findMany({
        where: { staffId: me.id, resolvedAt: null },
        select: { level: true, task: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.protocol.findMany({
        where: { clientId: session.clientId, isActive: true, NOT: { approvedAt: null } },
        select: { id: true, code: true, title: true, roles: true },
      }),
      prisma.protocolProgress.findMany({
        where: { staffId: me.id },
        select: { protocolId: true, acknowledgedAt: true, studiedAt: true, testedAt: true, passed: true },
      }),
      prisma.trainingSession.findMany({
        where: { presenterId: me.id, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
        select: { id: true, topic: true, scheduledAt: true },
        orderBy: { scheduledAt: "asc" },
        take: 2,
      }),
      can(session, "DECIDE_LEAVE")
        ? prisma.staffLeaveRequest.count({
            where: { status: "REQUESTED", NOT: { staffId: me.id }, staff: { clientId: session.clientId, isActive: true } },
          })
        : Promise.resolve(0),
      prisma.auditSurveyResponse.count({
        where: { survey: "haven-weekly-pulse", createdAt: { gte: new Date(Date.now() - 6 * 864e5) } },
      }),
      can(session, "ENTER_SCOREBOARD")
        ? prisma.scoreboardEntry.count({ where: { clientId: session.clientId, period: week } })
        : Promise.resolve(-1),
    ]);

  // An unresolved flag outranks everything. It is already late by definition.
  for (const f of openFlags) {
    items.push({
      kind: "FLAG",
      title: f.task.title,
      detail: f.level === "ESCALATE" ? "Escalated" : "Not recorded yet",
      urgency: "NOW",
      href: "/HavenStaff#today",
    });
  }

  const doneIds = new Set(doneToday.map((d) => d.taskId));
  for (const t of tasks) {
    if (doneIds.has(t.id)) continue;
    if (!matches(t.roles, me.position, me.department)) continue;
    items.push({ kind: "TASK", title: t.title, detail: t.why, urgency: "TODAY", href: "/HavenStaff#today" });
  }

  const byProtocol = new Map(progress.map((p) => [p.protocolId, p]));
  for (const p of protocols) {
    if (!matches(p.roles, me.position, me.department)) continue;
    const pr = byProtocol.get(p.id);
    if (pr?.passed) continue;
    const next = !pr?.acknowledgedAt ? "Acknowledge it" : !pr?.studiedAt ? "Read it" : "Take the test";
    items.push({ kind: "PROTOCOL", title: p.title, detail: next, urgency: "THIS_WEEK", href: `/HavenStaff/protocols/${p.code}` });
  }

  for (const s of presenting) {
    const days = Math.round((s.scheduledAt.getTime() - Date.now()) / 864e5);
    items.push({
      kind: "TRAINING",
      title: `You are presenting: ${s.topic}`,
      detail: days <= 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`,
      urgency: days <= 1 ? "NOW" : "THIS_WEEK",
      href: "/HavenStaff#training",
    });
  }

  if (leaveWaiting > 0) {
    items.push({
      kind: "LEAVE",
      title: `${leaveWaiting} leave request${leaveWaiting === 1 ? "" : "s"} waiting on you`,
      urgency: "TODAY",
      href: "/HavenStaff#leave",
    });
  }

  // The pulse count is hospital-wide rather than per person, because responses
  // are anonymous and tying one to a name would break the promise on the form.
  // So this is a prompt, not a chase, and it only appears late in the week.
  if (pulsed === 0 && new Date().getUTCDay() >= 4) {
    items.push({ kind: "PULSE", title: "This week's pulse", detail: "One tap", urgency: "THIS_WEEK", href: "/HavenStaff#pulse" });
  }

  if (numbers === 0) {
    items.push({
      kind: "NUMBERS",
      title: "This week's numbers are not in",
      detail: "Nothing has been counted yet this week",
      urgency: "THIS_WEEK",
      href: "/HavenStaff#numbers",
    });
  }

  return items
    .sort((a, b) => RANK[a.urgency] - RANK[b.urgency])
    .slice(0, MAX_ITEMS);
}
