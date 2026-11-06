import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession, can, greetingName } from "@/lib/staffAuth";
import { COUNTED, staffWhere } from "@/lib/havenAudience";
import { HAVEN_START } from "@/lib/haven-delivery";
import { WORKSTREAMS } from "@/lib/haven-workstreams";
import { NICU_DAY } from "@/lib/haven-tariff";
import { quarterOf } from "@/lib/havenObjectives";

/**
 * The founders' home: the two workstreams they follow, and the handful of live
 * numbers that say whether the hospital is moving. Everything links through to
 * the detail. Founders and leadership only.
 */

export const metadata: Metadata = { title: "Haven Paediatric Centre: founders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";
const AMBER = "#B7791F";

const STATE: Record<string, [string, string]> = { done: ["Done", TEAL], review: ["In review", AMBER], open: ["Open", RED] };

export default async function FoundersPage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  if (!can(session, "VIEW_FINANCIALS")) redirect("/HavenStaff");

  const now = new Date();
  const day = Math.max(1, Math.floor((now.getTime() - new Date(`${HAVEN_START}T00:00:00Z`).getTime()) / 864e5) + 1);
  const weekAgo = new Date(now.getTime() - 7 * 864e5);

  const cycle = await prisma.reviewCycle.findFirst({ where: { clientId: session.clientId, closedAt: null, startsOn: { lte: now } }, orderBy: { startsOn: "desc" } });
  const perf = cycle
    ? await prisma.staffMember.findMany({
        where: staffWhere(session.clientId, COUNTED),
        select: { personalObjectives: { where: { cycleId: cycle.id }, select: { status: true } }, oneToOnes: { where: { heldOn: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)) } }, select: { id: true } } },
      })
    : [];
  const objAgreed = perf.filter((p) => p.personalObjectives.length > 0 && p.personalObjectives.every((o) => o.status === "AGREED")).length;
  const talkedMonth = perf.filter((p) => p.oneToOnes.length > 0).length;

  const [staff, doneWeek, approved, totalModules, passes, fixes, objectives, huddles, teams] = await Promise.all([
    prisma.staffMember.findMany({ where: staffWhere(session.clientId, COUNTED), select: { id: true, lastLoginAt: true } }),
    prisma.staffTaskCompletion.count({ where: { completedAt: { gte: weekAgo }, staff: { clientId: session.clientId } } }),
    prisma.protocol.count({ where: { clientId: session.clientId, isActive: true, NOT: { approvedAt: null } } }),
    prisma.protocol.count({ where: { clientId: session.clientId, isActive: true } }),
    prisma.protocolProgress.count({ where: { passed: true, protocol: { clientId: session.clientId } } }),
    prisma.tariffFix.findMany({ where: { clientId: session.clientId }, select: { doneAt: true } }),
    prisma.objective.findMany({ where: { clientId: session.clientId, quarter: quarterOf() }, select: { level: true, status: true } }),
    prisma.teamHuddle.count({ where: { date: { gte: weekAgo }, team: { clientId: session.clientId } } }),
    prisma.staffTeam.count({ where: { clientId: session.clientId } }),
  ]);
  const active = staff.filter((s) => s.lastLoginAt && s.lastLoginAt >= weekAgo).length;
  const fixesOpen = fixes.filter((f) => !f.doneAt).length;
  const agreed = objectives.filter((o) => o.status === "AGREED").length;
  const waiting = objectives.filter((o) => o.status === "PROPOSED").length;

  const tiles: [string, string, string, string?][] = [
    [`Day ${day}`, "of the 180-day plan", NAVY],
    [`${active} of ${staff.length}`, "staff using the staff page this week", NAVY, "/HavenStaff/team"],
    [`${doneWeek}`, "tasks recorded this week", NAVY, "/HavenStaff/team"],
    [`${huddles}`, `team huddles this week, across ${teams} teams`, TEAL, "/HavenStaff/teams"],
    [`${approved} of ${totalModules}`, `training modules approved; ${passes} passes so far`, approved === 0 ? RED : TEAL, "/HavenStaff/learn"],
    [`${agreed} agreed`, `objectives this quarter${waiting ? `, ${waiting} waiting for you` : ""}`, waiting ? AMBER : NAVY, "/HavenStaff/objectives"],
    [`${objAgreed} of ${perf.length || staff.length}`, "staff with agreed personal objectives", objAgreed ? TEAL : AMBER, "/HavenStaff/people"],
    [`${talkedMonth} of ${perf.length || staff.length}`, "monthly conversations held this month", talkedMonth ? TEAL : AMBER, "/HavenStaff/people"],
    [`${fixesOpen} of ${fixes.length}`, "tariff fixes still open", fixesOpen ? RED : TEAL, "/HavenStaff/tariff"],
    [`N${Math.round(NICU_DAY.haven / 1000)}k`, `NICU day on CPAP, against N${Math.round(NICU_DAY.evercare / 1000)}k at Evercare`, RED, "/HavenStaff/tariff"],
  ];

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>Good morning, {greetingName(session.name)}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 700 }}>
            The two workstreams, and the numbers that say whether Haven is moving. Tap anything for the detail.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 72px", display: "grid", gap: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {tiles.map(([big, small, c, href]) => {
            const inner = (
              <>
                <div style={{ color: c, fontSize: 24, fontWeight: 700 }}>{big}</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{small}</div>
              </>
            );
            const box: React.CSSProperties = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", textDecoration: "none", display: "block" };
            return href ? <Link key={small} href={href} style={box}>{inner}</Link> : <div key={small} style={box}>{inner}</div>;
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
          {WORKSTREAMS.map((w) => (
            <section key={w.key} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 20, minWidth: 0 }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>Workstream</div>
              <h2 style={{ color: NAVY, fontSize: 21, margin: "4px 0 2px" }}>{w.title}</h2>
              <p style={{ color: MUTED, fontSize: 14, margin: "0 0 14px" }}>{w.summary}</p>
              <div style={{ display: "grid", gap: 10 }}>
                {w.items.map((it) => {
                  const [label, col] = STATE[it.state];
                  const body = (
                    <div style={{ borderLeft: `3px solid ${col}`, paddingLeft: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ color: NAVY, fontWeight: 650, fontSize: 14.5 }}>{it.title}</span>
                        <span style={{ color: col, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                      <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{it.status}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{it.owner}</div>
                    </div>
                  );
                  return it.href ? <Link key={it.title} href={it.href} style={{ textDecoration: "none" }}>{body}</Link> : <div key={it.title}>{body}</div>;
                })}
              </div>
            </section>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["/HavenStaff/team", "The team, day by day"], ["/HavenStaff/people", "People and performance"], ["/HavenStaff/objectives", "Objectives"], ["/HavenStaff/tariff", "Tariff"], ["/HavenStaff/teams", "Teams and huddles"]].map(([h, t]) => (
            <Link key={h} href={h} style={{ background: NAVY, color: "#fff", borderRadius: 10, padding: "11px 18px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>{t}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
