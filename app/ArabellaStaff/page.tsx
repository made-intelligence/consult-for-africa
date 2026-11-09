import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSession, can, greetingName } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { DIRECTORY, staffWhere } from "@/lib/havenAudience";
import { todayDuty } from "@/lib/havenToday";
import { appliesTo } from "@/lib/havenLearn";
import { periodKey, ON_TODAY, type Cadence } from "@/lib/havenTaskPeriod";
import { lateness } from "@/lib/havenSafety";
import { ARABELLA_DAILY, PRINCIPAL, canDecide, seesDailyView } from "@/lib/arabella-daily";
import { addDays, isoDay, ownersFor, practiceDay, sectionStatus, visibleSections } from "@/lib/dailyReturn";
import StaffShell, { card, Section, INK, SECOND, MUTED, ACCENT } from "@/components/staff/StaffShell";
import StaffDirectory, { type DirectoryEntry } from "@/components/haven/StaffDirectory";
import TodayTasks, { type TodayTask } from "@/components/haven/TodayTasks";
import { SafetyRegister, type SafetyRow } from "@/components/haven/SafetyRegister";
import { RaiseDecision } from "@/components/arabella/Decisions";
import ReportIssue from "@/components/arabella/ReportIssue";

export const dynamic = "force-dynamic";

type Waiting = { href: string; title: string; detail?: string; urgent: boolean };

export default async function ArabellaStaffHome() {
  const site = ARABELLA;
  const session = await getSiteSession(site);

  if (!session) {
    return (
      <StaffShell site={site} title="The staff page">
        <Section
          title="Sign in"
          lead="Your day's list, the rota, everyone's number, and where to report a problem. Signing in takes one code to your phone or email. There is no password."
        >
          <Link href={`${site.pathPrefix}/login`} style={{ ...card, display: "block", textDecoration: "none", borderLeft: `4px solid ${ACCENT}` }}>
            <div style={{ color: INK, fontSize: 17, fontWeight: 700 }}>Sign in</div>
          </Link>
        </Section>
        <p style={{ marginTop: 40, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
          This page is for Arabella staff. Please do not share the link outside the practice.
        </p>
      </StaffShell>
    );
  }

  const config = ARABELLA_DAILY;
  const leadership = seesDailyView(session.tiers);
  const today = practiceDay(config);
  const yesterday = addDays(today, -1);

  const [me, people, returns, allTasks, openDecisions, duty] = await Promise.all([
    prisma.staffMember.findUnique({ where: { id: session.sub }, select: { position: true, department: true } }),
    prisma.staffMember.findMany({
      where: staffWhere(session.clientId, DIRECTORY),
      select: { name: true, position: true, department: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.dailyReturn.findMany({
      where: { clientId: session.clientId, day: { in: [today, yesterday] } },
      select: { day: true, section: true },
    }),
    prisma.staffTask.findMany({
      where: { clientId: session.clientId, isActive: true, cadence: { in: ON_TODAY } },
      select: { id: true, code: true, title: true, why: true, roles: true, cadence: true },
      orderBy: { sortOrder: "asc" },
    }),
    canDecide(session.tiers) ? prisma.decisionRequest.count({ where: { clientId: session.clientId, status: "OPEN" } }) : Promise.resolve(0),
    todayDuty(session),
  ]);

  // The areas this person owns, from their job title, and which are not in.
  const have = new Set(returns.map((r) => `${r.section}|${isoDay(r.day)}`));
  const mine = me ? visibleSections(config, leadership).filter((s) => ownersFor(s, [me]).length > 0) : [];
  const waiting: Waiting[] = [];
  if (openDecisions > 0) {
    waiting.push({
      href: `${site.pathPrefix}/today#decisions`,
      title: openDecisions === 1 ? "One decision waiting on you" : `${openDecisions} decisions waiting on you`,
      urgent: true,
    });
  }
  for (const s of mine) {
    const y = sectionStatus(config, s, yesterday, have.has(`${s.code}|${isoDay(yesterday)}`));
    if (y === "MISSING") {
      waiting.push({ href: `${site.pathPrefix}/daily?section=${s.code}&day=${isoDay(yesterday)}`, title: `${s.title}: yesterday is not in`, urgent: true });
    }
    const t = sectionStatus(config, s, today, have.has(`${s.code}|${isoDay(today)}`));
    if (t === "DUE" || t === "MISSING") {
      waiting.push({ href: `${site.pathPrefix}/daily?section=${s.code}`, title: `${s.title}: today's numbers`, detail: "At the end of the day. About two minutes.", urgent: t === "MISSING" });
    }
  }

  // Today's tickable tasks, matched to the person as Haven's are.
  const periods = Array.from(new Set(allTasks.map((x) => periodKey(x.cadence as Cadence).toISOString())));
  const [done, flags] = await Promise.all([
    prisma.staffTaskCompletion.findMany({
      where: { staffId: session.sub, forDate: { in: periods.map((p) => new Date(p)) } },
      select: { taskId: true, forDate: true },
    }),
    prisma.staffTaskFlag.findMany({ where: { staffId: session.sub, resolvedAt: null }, select: { taskId: true } }),
  ]);
  const doneIds = new Set(
    done
      .filter((d) => {
        const task = allTasks.find((x) => x.id === d.taskId);
        return task && d.forDate.getTime() === periodKey(task.cadence as Cadence).getTime();
      })
      .map((d) => d.taskId)
  );
  const flagged = new Set(flags.map((f) => f.taskId));
  let todayTasks: TodayTask[] = allTasks
    .filter((x) => appliesTo(x.roles, [], me?.position ?? "", me?.department ?? ""))
    .map((x) => ({ id: x.id, code: x.code, title: x.title, why: x.why, cadence: x.cadence as Cadence, done: doneIds.has(x.id), flagged: flagged.has(x.id) }));
  if (duty === "OFF" || duty === "LEAVE") todayTasks = [];

  let openCases: SafetyRow[] = [];
  let closedCount = 0;
  if (can(session, "VIEW_NEAR_MISS_DETAIL")) {
    const [rows, count] = await Promise.all([
      prisma.safetyReport.findMany({
        where: { clientId: session.clientId, NOT: { status: "CLOSED" } },
        include: { investigator: { select: { name: true } } },
        orderBy: { reportedAt: "asc" },
      }),
      prisma.safetyReport.count({ where: { clientId: session.clientId, status: "CLOSED" } }),
    ]);
    closedCount = count;
    openCases = rows.map((r) => ({
      id: r.id, kind: r.kind, what: r.what, why: r.why, reachedPatient: r.reachedPatient,
      reportedBy: r.reportedBy, reportedAt: r.reportedAt.toISOString(), status: r.status,
      severity: r.severity, investigator: r.investigator?.name ?? null, findings: r.findings,
      action: r.action, actionOwner: r.actionOwner, actionDueAt: r.actionDueAt?.toISOString() ?? null,
      late: lateness(r),
    }));
  }

  const directory: DirectoryEntry[] = people;
  const links = [
    ...(leadership ? [{ href: `${site.pathPrefix}/today`, t: "Today at the practice", b: "Every area, today and yesterday, and what is missing" }] : []),
    { href: `${site.pathPrefix}/daily`, t: "Daily numbers", b: "Put in your area's numbers for the day" },
    { href: `${site.pathPrefix}/rota`, t: "The rota", b: can(session, "ENTER_ROTA") ? "Put in or correct your department's month" : "Your shifts and days off" },
    { href: `${site.pathPrefix}/learn`, t: "Training", b: "Arabella's procedures, one short module at a time" },
    ...(can(session, "VIEW_TEAM_NAMED") ? [{ href: `${site.pathPrefix}/team`, t: "The team, day by day", b: "Who has done what, every day" }] : []),
  ];

  return (
    <StaffShell site={site} title="The staff page">
      <section style={{ marginTop: 16 }}>
        <div style={{ color: SECOND, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Hello {greetingName(session.name)}
        </div>
        <h2 style={{ color: INK, fontSize: 24, margin: "6px 0 0" }}>
          {duty === "LEAVE" ? "You are on leave today" : duty === "OFF" ? "You are off today" : waiting.length === 0 && todayTasks.every((x) => x.done) ? "Nothing is waiting on you" : "Today"}
        </h2>
        {waiting.length > 0 && (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {waiting.map((w) => (
              <Link key={w.href} href={w.href} style={{ ...card, padding: 16, textDecoration: "none", display: "block", borderLeft: `4px solid ${w.urgent ? "#B0392B" : ACCENT}` }}>
                <div style={{ color: INK, fontWeight: 650, fontSize: 15.5 }}>{w.title}</div>
                {w.detail && <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{w.detail}</div>}
              </Link>
            ))}
          </div>
        )}
        {todayTasks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <TodayTasks tasks={todayTasks} endpoint={`${site.apiPrefix}/tasks`} />
          </div>
        )}
      </section>

      <nav style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 24 }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{ ...card, padding: 16, textDecoration: "none", borderLeft: `4px solid ${SECOND}` }}>
            <div style={{ color: INK, fontWeight: 700, fontSize: 15.5 }}>{l.t}</div>
            <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{l.b}</div>
          </Link>
        ))}
      </nav>

      <Section
        id="decide"
        eyebrow={`For ${PRINCIPAL}`}
        title={`Something for ${PRINCIPAL} to decide`}
        lead="A decision or an approval you are waiting on. It goes on her page with how long it has been waiting, until she answers."
      >
        <div style={card}><RaiseDecision /></div>
      </Section>

      <Section
        id="report"
        eyebrow="Speaking up"
        title="Report a problem"
        lead="Something that went wrong, nearly went wrong, or does not work. Nobody gets into trouble for reporting. We look for what made it possible, never who was involved."
      >
        <div style={card}><ReportIssue endpoint={`${site.apiPrefix}/safety`} /></div>
      </Section>

      {can(session, "VIEW_NEAR_MISS_DETAIL") && (
        <Section
          id="safety"
          eyebrow="For leadership"
          title="Reports to look into"
          lead="Take each one within two days and close it within fourteen, telling the team what changed."
        >
          <SafetyRegister open={openCases} closedCount={closedCount} endpoint={`${site.apiPrefix}/safety`} />
        </Section>
      )}

      <Section eyebrow="The team" title="Everyone's number" lead="The whole team in your pocket. Tap to call.">
        <StaffDirectory people={directory} />
      </Section>

      <p style={{ marginTop: 40, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
        This page is for Arabella staff. Please do not share the link outside the practice.
      </p>
    </StaffShell>
  );
}
