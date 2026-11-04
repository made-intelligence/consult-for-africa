import { prisma } from "@/lib/prisma";
import { can, type StaffSession } from "@/lib/staffAuth";
import { isoWeek } from "@/lib/havenScoreboard";
import { lateness } from "@/lib/havenSafety";
import { dutyBook, dayKey as dutyDay, monthKey, deptLabel, type Duty } from "@/lib/havenDuty";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { ownsTariffFixes } from "@/lib/haven-tariff";
import { WORKSTREAMS } from "@/lib/haven-workstreams";

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
  kind: "FLAG" | "SAFETY" | "TASK" | "PROTOCOL" | "TRAINING" | "LEAVE" | "PULSE" | "NUMBERS" | "ROTA" | "DAY_OFF" | "REVIEW" | "HUDDLE" | "OBJECTIVES" | "TARIFF" | "DECISION";
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

/** Today's duty for one person. Shared by the page, the email and the flags. */
export async function todayDuty(session: StaffSession): Promise<Duty> {
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { id: true, department: true } });
  if (!me) return "UNKNOWN";
  const book = await dutyBook(session.clientId, [me], dutyDay(), dutyDay());
  return book.duty(me.id, dutyDay());
}

export async function whatsWaiting(session: StaffSession): Promise<WaitingItem[]> {
  const me = await prisma.staffMember.findUnique({
    where: { id: session.sub },
    select: { id: true, position: true, department: true, lastLoginAt: true, createdAt: true, kind: true },
  });
  if (!me) return [];

  // Founders get the founders' list: what waits on them, never shift tasks.
  if (me.kind === "FOUNDER") return founderItems(session);

  const duty = await todayDuty(session);
  // On leave is rest. Nothing at all, not even the module.
  if (duty === "LEAVE") return [];

  // Somebody on their first day sees today and nothing before it. Arriving to
  // a fortnight of things you were never told about is how a person decides
  // the thing is not for them, and the people slowest to start are exactly the
  // ones this has to work for.
  const firstDay =
    !me.lastLoginAt || Date.now() - me.lastLoginAt.getTime() < 60 * 60 * 1000;

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
        select: { level: true, forDate: true, task: { select: { title: true, cadence: true } } },
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
  for (const f of firstDay ? [] : openFlags) {
    items.push({
      kind: "FLAG",
      title: f.task.title,
      // Name the period. "Not recorded yet" under a task ticked for this week
      // reads as a tick that did not save, when the flag is about last week.
      detail: `${f.level === "ESCALATE" ? "Escalated" : "Not recorded"} for ${
        f.task.cadence === "WEEKLY" ? "the week of " : ""
      }${f.forDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}. Ticking it now clears this.`,
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
    items.push({ kind: "PROTOCOL", title: p.title, detail: next, urgency: "THIS_WEEK", href: `/HavenStaff/learn/${p.code}` });
  }

  // Spaced re-tests that have come due: two questions from a passed module.
  const due = await prisma.protocolProgress.findFirst({
    where: { staffId: me.id, passed: true, nextReviewAt: { lte: new Date() }, protocol: { isActive: true, NOT: { approvedAt: null } } },
    select: { protocol: { select: { code: true, title: true } } },
    orderBy: { nextReviewAt: "asc" },
  });
  if (due) {
    items.push({ kind: "REVIEW", title: `Two quick questions: ${due.protocol.title}`, detail: "A minute. Answering again later is what makes it stick.", urgency: "THIS_WEEK", href: `/HavenStaff/learn/${due.protocol.code}?review=1` });
  }

  // A day off on the rota. Nothing is owed and nothing is chased. One module is
  // offered, because it is the one piece of work that needs no building, and
  // it counts towards recognition rather than against anybody.
  if (duty === "OFF") {
    const learn = items.find((i) => i.kind === "REVIEW") ?? items.find((i) => i.kind === "PROTOCOL");
    return learn
      ? [{ kind: "DAY_OFF", title: learn.title, detail: "About fifteen minutes, from anywhere. Optional, and it counts.", urgency: "THIS_WEEK", href: learn.href }]
      : [];
  }

  // The huddle, for a team lead on a working day.
  const led = await prisma.staffTeam.findMany({
    where: { clientId: session.clientId, leadId: me.id },
    select: { id: true, name: true, huddles: { where: { date: dutyDay() }, select: { id: true } } },
  });
  for (const t of led) {
    if (t.huddles.length === 0) {
      items.push({ kind: "HUDDLE", title: `Today's huddle: ${t.name}`, detail: "Ten minutes, standing. Safety, focus, one blocker.", urgency: "TODAY", href: "/HavenStaff/teams" });
    }
  }

  // Objectives. Proposals waiting on whoever agrees them; and a weekly
  // check-in for a lead whose agreed results have not been updated.
  const agreeLevels = [
    ...(can(session, "AGREE_BOARD_OBJECTIVES") ? (["BOARD"] as const) : []),
    ...(can(session, "AGREE_TEAM_OBJECTIVES") ? (["TEAM"] as const) : []),
  ];
  if (agreeLevels.length > 0) {
    const waiting = await prisma.objective.count({ where: { clientId: session.clientId, status: "PROPOSED", level: { in: [...agreeLevels] } } });
    if (waiting > 0) {
      items.push({ kind: "OBJECTIVES", title: `${waiting} objective${waiting === 1 ? "" : "s"} waiting for you to agree`, detail: "Agree them, or send back with a note.", urgency: "TODAY", href: "/HavenStaff/objectives" });
    }
  }
  if (led.length > 0) {
    const stale = await prisma.keyResult.count({
      where: {
        objective: { status: "AGREED", teamId: { in: led.map((t) => t.id) } },
        NOT: { checkIns: { some: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } } },
      },
    });
    if (stale > 0) {
      items.push({ kind: "OBJECTIVES", title: "This week's check-in on your team's results", detail: `${stale} not updated this week. Where it is now, and how sure you are.`, urgency: "THIS_WEEK", href: "/HavenStaff/objectives" });
    }
  }

  // Tariff fixes, every working day until they are done, for whoever owns them.
  if (ownsTariffFixes(session.tiers, me.position)) {
    const open = await prisma.tariffFix.count({ where: { clientId: session.clientId, doneAt: null } });
    if (open > 0) {
      items.push({ kind: "TARIFF", title: `${open} tariff fix${open === 1 ? "" : "es"} open`, detail: "Swapped prices, typos and the NICU day rate against Evercare.", urgency: "TODAY", href: "/HavenStaff/tariff" });
    }
  }

  // The rota. Whoever can enter it is told, every day, while it is missing,
  // that their department is being chased on its days off because of it.
  if (can(session, "ENTER_ROTA")) {
    const now = new Date();
    const people = await prisma.staffMember.findMany({
      where: staffWhere(session.clientId, ONBOARDED),
      select: { id: true, department: true },
    });
    const lateMonth = now.getUTCDate() >= 20;
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const book = await dutyBook(session.clientId, people, dutyDay(now), lateMonth ? next : dutyDay(now));
    const leads = session.tiers.includes("LEADERSHIP");
    const scope = (deps: string[]) => (leads ? deps : deps.filter((d) => d === me.department));
    const missingNow = scope(book.missingRota(now));
    const missingNext = lateMonth ? scope(book.missingRota(next)) : [];
    const monthName = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
    if (missingNow.length > 0) {
      items.push({
        kind: "ROTA",
        title: `Put in the ${monthName(now)} rota: ${missingNow.map(deptLabel).join(", ")}`,
        detail: "Until it is in, everyone there is chased on their days off.",
        urgency: "NOW",
        href: `/HavenStaff/rota?month=${monthKey(now)}`,
      });
    } else if (missingNext.length > 0) {
      items.push({
        kind: "ROTA",
        title: `Put in the ${monthName(next)} rota: ${missingNext.map(deptLabel).join(", ")}`,
        detail: "Before the 1st, so nobody is chased on a day off.",
        urgency: "TODAY",
        href: `/HavenStaff/rota?month=${monthKey(next)}`,
      });
    }
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

  // Reports waiting on leadership. A caught overdose sat uninvestigated for
  // twelve days because nothing put it in front of anyone; this does.
  if (can(session, "VIEW_NEAR_MISS_DETAIL")) {
    const open = await prisma.safetyReport.findMany({
      where: { clientId: session.clientId, NOT: { status: "CLOSED" } },
      select: { status: true, reportedAt: true, takenAt: true, actionDueAt: true, severity: true, investigatorId: true },
    });
    // Unclaimed cases are everybody's in leadership; claimed ones are the
    // investigator's alone, so one case does not nag four people.
    const mine = open.filter((r) => r.status === "NEW" || r.investigatorId === me.id);
    if (mine.length > 0) {
      const late = mine.filter((r) => lateness(r)).length;
      const high = mine.some((r) => r.severity === "HIGH");
      items.push({
        kind: "SAFETY",
        title: `${mine.length} report${mine.length === 1 ? "" : "s"} to investigate`,
        detail: late > 0 ? `${late} past the deadline` : "Take each within two days",
        urgency: late > 0 || high ? "NOW" : "TODAY",
        href: "/HavenStaff#safety",
      });
    }
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

/** What waits on a founder: objectives to agree, decisions, and the tariff. */
async function founderItems(session: StaffSession): Promise<WaitingItem[]> {
  const items: WaitingItem[] = [];
  const toAgree = await prisma.objective.count({ where: { clientId: session.clientId, status: "PROPOSED", level: "BOARD" } });
  if (toAgree > 0) {
    items.push({ kind: "OBJECTIVES", title: `${toAgree} board objective${toAgree === 1 ? "" : "s"} waiting for you to agree`, detail: "Agree, or send back with a note.", urgency: "TODAY", href: "/HavenStaff/objectives" });
  }
  const decisions = WORKSTREAMS.flatMap((w) => w.items).filter((i) => i.owner === "Founders" && i.state === "open");
  if (decisions.length > 0) {
    items.push({ kind: "DECISION", title: `${decisions.length} decision${decisions.length === 1 ? "" : "s"} for the founders`, detail: decisions.map((d) => d.title).join("; "), urgency: "THIS_WEEK", href: "/HavenStaff/founders" });
  }
  const fixesOpen = await prisma.tariffFix.count({ where: { clientId: session.clientId, doneAt: null } });
  if (fixesOpen > 0) {
    items.push({ kind: "TARIFF", title: `Tariff: ${fixesOpen} fix${fixesOpen === 1 ? "" : "es"} still open`, detail: "Including the NICU day rate against Evercare.", urgency: "THIS_WEEK", href: "/HavenStaff/tariff" });
  }
  return items;
}
