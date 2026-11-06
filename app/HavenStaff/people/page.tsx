import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession, can } from "@/lib/staffAuth";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { HAVEN_ROLES } from "@/lib/haven-roles";
import { currentCycle, isLeadership, monthKey, RAG_BG, RAG_COLOUR } from "@/lib/havenPerformance";
import { PeopleSetup, StageAction } from "@/components/haven/Performance";

/**
 * Line managers see their direct reports; leadership sees everyone and sets
 * roles and line managers; founders see the shape (objectives agreed, updates
 * in, conversations held, appraisal stage), never anyone's appraisal score.
 */

export const metadata: Metadata = { title: "Haven Paediatric Centre: people", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const TEAL = "#1F7A8C";

export default async function PeoplePage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const leads = isLeadership(session);
  const board = can(session, "VIEW_TEAM_NAMED");
  const cycle = await currentCycle(session.clientId);
  const m = monthKey();

  const people = await prisma.staffMember.findMany({
    where: { ...staffWhere(session.clientId, ONBOARDED), ...(leads || board ? {} : { lineManagerId: session.sub }) },
    select: {
      id: true, name: true, position: true, roleCode: true, lineManagerId: true,
      lineManager: { select: { name: true } },
      personalObjectives: { where: { cycleId: cycle?.id ?? "__none__" }, select: { status: true, updates: { where: { month: m }, select: { rag: true } } } },
      oneToOnes: { orderBy: { heldOn: "desc" }, take: 1, select: { heldOn: true } },
      appraisals: { where: { cycleId: cycle?.id ?? "__none__" }, select: { stage: true } },
    },
    orderBy: { name: "asc" },
  });
  if (!leads && !board && people.length === 0) redirect("/HavenStaff/me");

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const rows = people.map((p) => {
    const objs = p.personalObjectives;
    const rags = objs.flatMap((o) => o.updates.map((u) => u.rag));
    return {
      ...p,
      objState: objs.length === 0 ? "None" : objs.every((o) => o.status === "AGREED") ? "Agreed" : objs.some((o) => o.status === "PROPOSED") ? "Proposed" : "Draft",
      updated: objs.length ? `${rags.length} of ${objs.length}` : "-",
      rags,
      talkedThisMonth: !!p.oneToOnes[0] && p.oneToOnes[0].heldOn >= monthStart,
      lastTalk: p.oneToOnes[0]?.heldOn ?? null,
      stage: p.appraisals[0]?.stage ?? null,
      mine: p.lineManagerId === session.sub,
    };
  });
  const agreed = rows.filter((r) => r.objState === "Agreed").length;
  const talked = rows.filter((r) => r.talkedThisMonth).length;

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: "#081521", padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: "#D4AF37", marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>{leads || board ? "People and performance" : "My people"}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 720 }}>
            {cycle ? `${cycle.name}. ` : "No review cycle open yet. "}Objectives agreed: {agreed} of {rows.length}. Monthly conversations this month: {talked} of {rows.length}.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 72px", display: "grid", gap: 24 }}>
        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>
            <thead>
              <tr style={{ color: MUTED, textAlign: "left" }}>
                {["Person", "Line manager", "Objectives", "This month", "Last conversation", "Appraisal"].map((h) => <th key={h} style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const open = r.mine || leads;
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td style={{ padding: "8px 12px" }}>
                      {open ? <Link href={`/HavenStaff/people/${r.id}`} style={{ color: NAVY, fontWeight: 650, textDecoration: "none" }}>{r.name}</Link> : <span style={{ color: NAVY, fontWeight: 650 }}>{r.name}</span>}
                      <div style={{ color: MUTED, fontSize: 12 }}>{HAVEN_ROLES.find((x) => x.code === r.roleCode)?.title ?? r.position}</div>
                    </td>
                    <td style={{ padding: "8px 12px", color: MUTED }}>{r.lineManager?.name ?? "Not set"}</td>
                    <td style={{ padding: "8px 12px", color: r.objState === "Agreed" ? TEAL : NAVY }}>{r.objState}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ display: "inline-flex", gap: 3, marginRight: 6 }}>
                        {r.rags.map((g, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: RAG_COLOUR[g], display: "inline-block" }} />)}
                      </span>
                      <span style={{ color: MUTED }}>{r.updated}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: r.talkedThisMonth ? TEAL : MUTED }}>{r.lastTalk ? r.lastTalk.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "None"}</td>
                    <td style={{ padding: "8px 12px", color: MUTED }}>{r.stage ? r.stage.replace("_", " ").toLowerCase() : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color: MUTED, fontSize: 12.5, margin: 0 }}>
          <span style={{ background: RAG_BG.GREEN, color: RAG_COLOUR.GREEN, padding: "1px 6px", borderRadius: 4 }}>on track</span>{" "}
          <span style={{ background: RAG_BG.AMBER, color: RAG_COLOUR.AMBER, padding: "1px 6px", borderRadius: 4 }}>at risk</span>{" "}
          <span style={{ background: RAG_BG.RED, color: RAG_COLOUR.RED, padding: "1px 6px", borderRadius: 4 }}>off track</span>
          {"  "}Appraisal scores are seen only by the person, their line manager and leadership.
        </p>

        {leads && cycle && !cycle.appraisalOpenedAt && (
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
            <div style={{ color: NAVY, fontWeight: 650, marginBottom: 6 }}>Open the appraisal for {cycle.name}</div>
            <p style={{ color: MUTED, fontSize: 14, margin: "0 0 10px" }}>Everyone can then score themselves, then their line manager scores, then leadership moderates. Open it near the end of the cycle.</p>
            <StageAction label="Open the appraisal" body={{ action: "openAppraisal" }} />
          </div>
        )}

        {leads && (
          <section>
            <h2 style={{ color: NAVY, fontSize: 20, margin: "0 0 10px" }}>Roles and line managers</h2>
            <PeopleSetup
              people={people.map((p) => ({ id: p.id, name: p.name, position: p.position, roleCode: p.roleCode, lineManagerId: p.lineManagerId }))}
              roles={HAVEN_ROLES.map((r) => ({ code: r.code, title: r.title }))}
            />
          </section>
        )}
      </div>
    </main>
  );
}
