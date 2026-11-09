import Link from "next/link";
import { released } from "@/lib/staffTaskRelease";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can, type StaffSession } from "@/lib/staffAuth";
import { paletteVars, type StaffSite } from "@/lib/staffSites";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { dutyBook, dayKey, daysBetween, deptLabel, type Duty } from "@/lib/havenDuty";
import { appliesTo } from "@/lib/havenLearn";
import { periodKey } from "@/lib/havenTaskPeriod";

/**
 * Who is doing what, person by person and day by day.
 *
 * Asked for by the founders, through Debo, on 3 November 2026: "show founders
 * visibility into what the staff are doing or not doing, as granular as
 * possible". So every person, every day, every task, on one page.
 *
 * What it deliberately does not show, even here: a test score or a failed
 * attempt (only passed or not yet), anything from the ward's notes, and who
 * filed any report. Those are the things people stop doing once owners read
 * them, and the founders lose more by seeing them than they gain.
 */


const NAVY = "var(--staff-ink, #0B3C5D)";
const DEEP = "var(--staff-deep, #081521)";
const GOLD = "var(--staff-accent, #D4AF37)";
const TEAL = "var(--staff-second, #1F7A8C)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";
const AMBER = "#C98A12";

const DAYS = 14;

type Cell = { duty: Duty; shift: string | null; done: number; owed: number; started: boolean };

function colour(c: Cell) {
  if (!c.started) return { bg: "#F1F5F9", fg: "#94a3b8", text: "·" };
  if (c.duty === "LEAVE") return { bg: "#EDE9FE", fg: "#5B21B6", text: "L" };
  if (c.duty === "OFF") return { bg: "#F1F5F9", fg: "#64748b", text: "Off" };
  if (c.owed === 0) return { bg: "#fff", fg: MUTED, text: "-" };
  const r = c.done / c.owed;
  return { bg: r >= 1 ? "#DCFCE7" : r > 0 ? "#FEF3C7" : "#FEE2E2", fg: r >= 1 ? "#166534" : r > 0 ? "#92400E" : RED, text: `${c.done}/${c.owed}` };
}

export default async function TeamView({ site, session }: { site: StaffSite; session: StaffSession | null }) {
  if (!session) redirect(`${site.pathPrefix}/login`);
  if (!can(session, "VIEW_TEAM_NAMED")) redirect(site.pathPrefix);

  const today = dayKey();
  const from = new Date(today.getTime() - (DAYS - 1) * 864e5);
  const days = daysBetween(from, today);

  const people = await prisma.staffMember.findMany({
    where: staffWhere(session.clientId, ONBOARDED),
    select: { id: true, name: true, position: true, department: true, lastLoginAt: true, team: { select: { name: true, sortOrder: true } } },
    orderBy: [{ team: { sortOrder: "asc" } }, { department: "asc" }, { name: "asc" }],
  });
  const ids = people.map((p) => p.id);

  // Training for everyone in two queries, not two per person: a grid of
  // twenty people opening forty connections at once exhausts the pool.
  const [protocols, allProgress] = await Promise.all([
    prisma.protocol.findMany({
      // Only modules that have reached staff: a trickled module before its week
      // is not owed by anybody. Null startsOn (every Haven module) is live now.
      where: { ...released(), clientId: session.clientId, isActive: true, NOT: { approvedAt: null } },
      select: { id: true, title: true, roles: true, departments: true, version: true },
      orderBy: [{ domain: "asc" }, { code: "asc" }],
    }),
    prisma.protocolProgress.findMany({
      where: { staffId: { in: ids } },
      select: { staffId: true, protocolId: true, passed: true, studiedAt: true, againstVersion: true },
    }),
  ]);
  const progressOf = new Map(allProgress.map((p) => [`${p.staffId}|${p.protocolId}`, p]));

  const [tasks, completions, flags, firstUse, book] = await Promise.all([
    prisma.staffTask.findMany({
      where: { ...released(), clientId: session.clientId, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY", "WEEKLY"] } },
      select: { id: true, title: true, roles: true, cadence: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.staffTaskCompletion.findMany({
      where: { staffId: { in: ids }, forDate: { gte: periodKey("WEEKLY", from) } },
      select: { staffId: true, taskId: true, forDate: true },
    }),
    prisma.staffTaskFlag.findMany({ where: { staffId: { in: ids }, resolvedAt: null }, select: { staffId: true } }),
    prisma.staffLoginToken.groupBy({ by: ["staffId"], where: { staffId: { in: ids }, usedAt: { not: null } }, _min: { usedAt: true } }),
    dutyBook(session.clientId, people, from, today),
  ]);

  const started = new Map(firstUse.map((u) => [u.staffId, u._min.usedAt ? dayKey(u._min.usedAt) : null]));
  const doneKey = new Set(completions.map((c) => `${c.staffId}|${c.taskId}|${c.forDate.getTime()}`));
  const openFlags = new Map<string, number>();
  for (const f of flags) openFlags.set(f.staffId, (openFlags.get(f.staffId) ?? 0) + 1);

  const rows = await Promise.all(
    people.map(async (p) => {
      const modules = protocols
        .filter((m) => appliesTo(m.roles, m.departments, p.position, p.department))
        .map((m) => {
          const pr = progressOf.get(`${p.id}|${m.id}`);
          const current = pr && pr.againstVersion === m.version;
          return { id: m.id, title: m.title, status: current && pr?.passed ? "PASSED" : current && pr?.studiedAt ? "READ" : "NEW" };
        });
      const mine = tasks.filter((t) => appliesTo(t.roles, [], p.position, p.department));
      const daily = mine.filter((t) => t.cadence !== "WEEKLY");
      const weekly = mine.filter((t) => t.cadence === "WEEKLY");
      const first = started.get(p.id) ?? null;
      const cells: Cell[] = days.map((d) => {
        const duty = book.duty(p.id, d);
        const isStarted = !!first && first <= d;
        const owed = isStarted && duty !== "OFF" && duty !== "LEAVE" ? daily.length : 0;
        const done = daily.filter((t) => doneKey.has(`${p.id}|${t.id}|${d.getTime()}`)).length;
        return { duty, shift: book.shift(p.id, d), done, owed, started: isStarted };
      });
      const weeks = Array.from(new Set(days.map((d) => periodKey("WEEKLY", d).getTime()))).map((w) => ({
        week: new Date(w),
        done: weekly.filter((t) => doneKey.has(`${p.id}|${t.id}|${w}`)).length,
        owed: weekly.length,
      }));
      const owedAll = cells.reduce((a, c) => a + c.owed, 0);
      const doneAll = cells.reduce((a, c) => a + Math.min(c.done, c.owed), 0);
      return { p, daily, weekly, cells, weeks, modules, first, owedAll, doneAll, flags: openFlags.get(p.id) ?? 0 };
    })
  );

  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const wd = (d: Date) => "SMTWTFS"[d.getUTCDay()];

  return (
    <main style={{ ...paletteVars(site), background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href={site.pathPrefix} style={{ color: "var(--staff-head-label, #9FC6D1)", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>The team, day by day</h1>
          <p style={{ color: "var(--staff-head-body, #B9CBD8)", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 720 }}>
            Everyone on the staff system, the last fourteen days. Each square is the day&apos;s tasks done out of those owed.
            Days off on the rota and approved leave are excused. Tap a name for every task, day by day.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 72px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: MUTED, marginBottom: 14 }}>
          {[["#DCFCE7", "All done"], ["#FEF3C7", "Some done"], ["#FEE2E2", "None done"], ["#F1F5F9", "Off, or not started"], ["#EDE9FE", "On leave"]].map(([bg, t]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: `1px solid ${LINE}` }} />{t}
            </span>
          ))}
        </div>

        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, width: "100%" }}>
            <thead>
              <tr style={{ color: MUTED }}>
                <th style={{ textAlign: "left", padding: "8px 12px", position: "sticky", left: 0, background: "#fff", minWidth: 190, color: NAVY }}>Person</th>
                {days.map((d) => (
                  <th key={d.getTime()} style={{ padding: "6px 2px", fontWeight: 600, minWidth: 40 }}>{d.getUTCDate()}<div style={{ fontWeight: 400 }}>{wd(d)}</div></th>
                ))}
                <th style={{ padding: "6px 8px", minWidth: 64 }}>14 days</th>
                <th style={{ padding: "6px 8px", minWidth: 70 }}>Weekly</th>
                <th style={{ padding: "6px 8px", minWidth: 70 }}>Training</th>
                <th style={{ padding: "6px 8px", minWidth: 60 }}>Flags</th>
                <th style={{ padding: "6px 8px", minWidth: 90 }}>Last in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = r.owedAll ? Math.round((r.doneAll / r.owedAll) * 100) : null;
                const lastWeek = r.weeks[r.weeks.length - 1];
                const passed = r.modules.filter((m) => m.status === "PASSED").length;
                return (
                  <tr key={r.p.id} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td style={{ padding: "7px 12px", position: "sticky", left: 0, background: "#fff" }}>
                      <a href={`#p-${r.p.id}`} style={{ color: NAVY, fontWeight: 650, textDecoration: "none" }}>{r.p.name}</a>
                      <div style={{ color: MUTED, fontSize: 11.5 }}>{r.p.position} · {r.p.team?.name ?? deptLabel(r.p.department)}</div>
                    </td>
                    {r.cells.map((c, i) => {
                      const k = colour(c);
                      return (
                        <td key={i} style={{ padding: 2, textAlign: "center" }}>
                          <div title={c.shift ? `Shift ${c.shift}` : c.duty === "UNKNOWN" ? "No rota for this department" : c.duty} style={{ background: k.bg, color: k.fg, borderRadius: 6, padding: "6px 0", fontWeight: 700, fontSize: 11.5 }}>
                            {k.text}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "center", fontWeight: 700, color: pct === null ? MUTED : pct >= 80 ? "#166534" : pct >= 40 ? AMBER : RED }}>{pct === null ? "-" : `${pct}%`}</td>
                    <td style={{ textAlign: "center", color: NAVY }}>{r.weekly.length ? `${lastWeek.done}/${lastWeek.owed}` : "-"}</td>
                    <td style={{ textAlign: "center", color: NAVY }}>{r.modules.length ? `${passed}/${r.modules.length}` : "-"}</td>
                    <td style={{ textAlign: "center", color: r.flags ? RED : MUTED, fontWeight: r.flags ? 700 : 400 }}>{r.flags || "-"}</td>
                    <td style={{ textAlign: "center", color: MUTED }}>{r.p.lastLoginAt ? fmt(r.p.lastLoginAt) : "Never"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 style={{ color: NAVY, fontSize: 22, margin: "40px 0 6px" }}>Person by person</h2>
        <p style={{ color: MUTED, fontSize: 14.5, margin: "0 0 16px" }}>Every task, every day. A tick is a recorded completion; a cross is a working day with no record.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r) => (
            <details key={r.p.id} id={`p-${r.p.id}`} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px" }}>
              <summary style={{ cursor: "pointer", color: NAVY, fontWeight: 650 }}>
                {r.p.name} <span style={{ color: MUTED, fontWeight: 400 }}>· {r.p.position}</span>
                {!r.first && <span style={{ color: AMBER, fontWeight: 600 }}> · has not signed in yet</span>}
              </summary>
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ color: MUTED }}>
                      <th style={{ textAlign: "left", padding: "4px 8px", minWidth: 220 }}>Task</th>
                      {days.map((d) => <th key={d.getTime()} style={{ padding: "4px 2px", minWidth: 30 }}>{d.getUTCDate()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {r.daily.map((t) => (
                      <tr key={t.id} style={{ borderTop: `1px solid ${LINE}` }}>
                        <td style={{ padding: "5px 8px", color: NAVY }}>{t.title}</td>
                        {days.map((d, i) => {
                          const c = r.cells[i];
                          const done = doneKey.has(`${r.p.id}|${t.id}|${d.getTime()}`);
                          const owed = c.owed > 0;
                          return (
                            <td key={i} style={{ textAlign: "center", fontWeight: 700, color: done ? "#166534" : owed ? RED : "#cbd5e1" }}>
                              {done ? "✓" : owed ? "✗" : c.duty === "LEAVE" ? "L" : c.duty === "OFF" ? "o" : "·"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {r.weekly.map((t) => (
                      <tr key={t.id} style={{ borderTop: `1px solid ${LINE}` }}>
                        <td style={{ padding: "5px 8px", color: NAVY }}>{t.title} <span style={{ color: MUTED }}>(weekly)</span></td>
                        <td colSpan={days.length} style={{ color: MUTED, padding: "5px 8px" }}>
                          {r.weeks.map((w) => `week of ${fmt(w.week)}: ${doneKey.has(`${r.p.id}|${t.id}|${w.week.getTime()}`) ? "done" : "not recorded"}`).join("   ·   ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {r.modules.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Training</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {r.modules.map((m) => (
                      <span key={m.id} style={{ fontSize: 12, padding: "4px 9px", borderRadius: 999, background: m.status === "PASSED" ? "#DCFCE7" : "#F1F5F9", color: m.status === "PASSED" ? "#166534" : MUTED }}>
                        {m.title}: {m.status === "PASSED" ? "passed" : m.status === "NEW" ? "not started" : "in progress"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </details>
          ))}
        </div>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 24, lineHeight: 1.6 }}>
          A record shows a task was done, not how well. Test scores, the ward&apos;s notes and who filed any report are not shown here.
        </p>
        <p style={{ color: TEAL, fontSize: 13 }}>Days with no rota for the department count as working days.</p>
      </div>
    </main>
  );
}
