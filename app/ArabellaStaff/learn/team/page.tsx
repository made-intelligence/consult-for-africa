import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can, getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { appliesTo } from "@/lib/havenLearn";
import { released } from "@/lib/staffTaskRelease";
import StaffShell, { card, INK, LINE, MUTED } from "@/components/staff/StaffShell";

// Who has passed what, for leadership. Passed or not yet, never a score or a
// failed attempt: the same line Haven's team view draws, because people stop
// trying a quiz once they know a low mark is read upstairs.

export const metadata: Metadata = { title: "Arabella Women's Health: training by person", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ArabellaLearnTeam() {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  if (!can(session, "VIEW_TEAM_NAMED")) redirect(`${site.pathPrefix}/learn`);

  const [people, modules] = await Promise.all([
    prisma.staffMember.findMany({
      where: staffWhere(session.clientId, ONBOARDED),
      select: { id: true, name: true, position: true, department: true },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    }),
    prisma.protocol.findMany({
      // Open modules only: approved, and their week has started.
      where: { ...released(), clientId: session.clientId, isActive: true, NOT: { approvedAt: null } },
      select: { id: true, code: true, title: true, roles: true, departments: true, version: true },
      orderBy: [{ startsOn: "asc" }, { code: "asc" }],
    }),
  ]);
  const progress = await prisma.protocolProgress.findMany({
    where: { staffId: { in: people.map((p) => p.id) }, protocolId: { in: modules.map((m) => m.id) } },
    select: { staffId: true, protocolId: true, passed: true, againstVersion: true },
  });
  const version = new Map(modules.map((m) => [m.id, m.version]));
  const passed = new Set(
    progress.filter((p) => p.passed && p.againstVersion === version.get(p.protocolId)).map((p) => `${p.staffId}|${p.protocolId}`),
  );

  const rows = people.map((p) => {
    const cells = modules.map((m) => {
      if (!appliesTo(m.roles, m.departments, p.position, p.department)) return "NA" as const;
      return passed.has(`${p.id}|${m.id}`) ? ("PASSED" as const) : ("NOT_YET" as const);
    });
    const owed = cells.filter((c) => c !== "NA").length;
    const done = cells.filter((c) => c === "PASSED").length;
    return { p, cells, owed, done };
  });

  const short = (code: string) => code.replace(/^AR-/, "");

  return (
    <StaffShell
      site={site}
      title="Who has passed what"
      lead="Every open module, person by person. A tick is a pass. A dot is not yet. Blank means the module is not for that role. Scores are never shown."
      backTo={{ href: `${site.pathPrefix}/learn`, label: "Training" }}
      width={1000}
    >
      {modules.length === 0 ? (
        <div style={card}>
          <div style={{ color: INK, fontWeight: 700 }}>No modules are open yet</div>
          <p style={{ color: MUTED, fontSize: 14.5, margin: "4px 0 0" }}>A module opens on its week&apos;s Monday once Dr Chito has approved it.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
              <thead>
                <tr style={{ color: MUTED }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", position: "sticky", left: 0, background: "#fff", minWidth: 150, color: INK }}>Person</th>
                  <th style={{ padding: "8px 6px", minWidth: 50 }}>Done</th>
                  {modules.map((m) => (
                    <th key={m.id} title={m.title} style={{ padding: "8px 4px", fontWeight: 600, minWidth: 40 }}>{short(m.code)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.p.id} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td style={{ padding: "7px 12px", position: "sticky", left: 0, background: "#fff" }}>
                      <div style={{ color: INK, fontWeight: 650 }}>{r.p.name}</div>
                      <div style={{ color: MUTED, fontSize: 11.5 }}>{r.p.position}</div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: r.owed && r.done === r.owed ? "#166534" : INK }}>{r.owed ? `${r.done}/${r.owed}` : "-"}</td>
                    {r.cells.map((c, i) => (
                      <td key={i} style={{ textAlign: "center", padding: 2 }}>
                        {c === "NA" ? "" : (
                          <span style={{ display: "inline-block", width: 26, height: 26, lineHeight: "26px", borderRadius: 7, fontWeight: 700, background: c === "PASSED" ? "#DCFCE7" : "#F1F5F9", color: c === "PASSED" ? "#166534" : "#94a3b8" }}>
                            {c === "PASSED" ? "✓" : "·"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "grid", gap: 4, marginTop: 16, fontSize: 13, color: MUTED }}>
            {modules.map((m) => <div key={m.id}><strong style={{ color: INK }}>{short(m.code)}</strong> {m.title}</div>)}
          </div>
        </>
      )}
    </StaffShell>
  );
}
