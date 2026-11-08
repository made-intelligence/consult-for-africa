import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staffAuth";
import { staffWhere } from "@/lib/havenAudience";
import { dutyBook, dayKey, daysBetween } from "@/lib/havenDuty";

/**
 * Who is off, team by team, for the next six weeks: approved leave, requests
 * still waiting, and rota days off. One look before asking, one look before
 * approving. Leave type is shown, never the reason.
 */

export const metadata: Metadata = { title: "Haven Paediatric Centre: who is off", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const DAYS = 42;

export default async function LeaveCalendar() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const from = dayKey();
  const to = new Date(from.getTime() + (DAYS - 1) * 864e5);
  const days = daysBetween(from, to);

  const [people, requests] = await Promise.all([
    prisma.staffMember.findMany({
      where: staffWhere(session.clientId, ["EMPLOYEE"]),
      select: { id: true, name: true, department: true, team: { select: { name: true, sortOrder: true } } },
      orderBy: [{ team: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.staffLeaveRequest.findMany({
      where: { status: { in: ["APPROVED", "REQUESTED"] }, startDate: { lte: to }, endDate: { gte: from }, staff: { clientId: session.clientId } },
      select: { staffId: true, startDate: true, endDate: true, status: true, type: true, cover: { select: { name: true } } },
    }),
  ]);
  const book = await dutyBook(session.clientId, people, from, to);

  const cell = (pid: string, d: Date) => {
    const r = requests.find((q) => q.staffId === pid && dayKey(q.startDate) <= d && dayKey(q.endDate) >= d);
    if (r) {
      const approved = r.status === "APPROVED";
      return { text: r.type[0], bg: approved ? "#EDE9FE" : "#FEF3C7", fg: approved ? "#5B21B6" : "#92400E", title: `${approved ? "On leave" : "Asked for leave"} (${r.type.toLowerCase()})${r.cover ? `, covered by ${r.cover.name}` : ""}` };
    }
    const duty = book.duty(pid, d);
    if (duty === "OFF") return { text: "o", bg: "#F1F5F9", fg: MUTED, title: "Off on the rota" };
    const shift = book.shift(pid, d);
    return { text: shift ?? "", bg: "#fff", fg: NAVY, title: shift ? `Shift ${shift}` : "" };
  };

  const groups = new Map<string, typeof people>();
  for (const p of people) {
    const g = p.team?.name ?? "No team";
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const offToday = people.filter((p) => requests.some((q) => q.status === "APPROVED" && q.staffId === p.id && dayKey(q.startDate) <= from && dayKey(q.endDate) >= from)).length;

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: "#081521", padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: "#D4AF37", marginBottom: 16 }} />
          <Link href="/HavenStaff#leave" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; My leave</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>Who is off</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, margin: "10px 0 0" }}>The next six weeks, team by team. {offToday} on leave today.</p>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 20px 72px" }}>
        <p style={{ color: MUTED, fontSize: 13, margin: "0 0 10px" }}>
          <span style={{ background: "#EDE9FE", color: "#5B21B6", padding: "1px 6px", borderRadius: 4 }}>A</span> on leave (letter is the type){"  "}
          <span style={{ background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 4 }}>A</span> asked, not yet decided{"  "}
          <span style={{ background: "#F1F5F9", color: MUTED, padding: "1px 6px", borderRadius: 4 }}>o</span> off on the rota{"  "}Hover a square for the cover.
        </p>
        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: "#fff", textAlign: "left", padding: "6px 10px", minWidth: 170, color: NAVY }}>Person</th>
                {days.map((d) => (
                  <th key={d.getTime()} style={{ padding: "4px 1px", color: [0, 6].includes(d.getUTCDay()) ? "#1F7A8C" : MUTED, fontWeight: 600, minWidth: 24 }}>
                    {d.getUTCDate()}<div style={{ fontWeight: 400 }}>{"SMTWTFS"[d.getUTCDay()]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...groups.entries()].flatMap(([g, ps]) => [
                <tr key={g}><td colSpan={DAYS + 1} style={{ padding: "8px 10px 3px", color: NAVY, fontWeight: 700, borderTop: `1px solid ${LINE}`, position: "sticky", left: 0, background: "#fff" }}>{g}</td></tr>,
                ...ps.map((p) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td style={{ position: "sticky", left: 0, background: "#fff", padding: "4px 10px", color: NAVY, whiteSpace: "nowrap" }}>{p.name}</td>
                    {days.map((d) => {
                      const c = cell(p.id, d);
                      return <td key={d.getTime()} title={c.title} style={{ textAlign: "center", padding: 1 }}><div style={{ background: c.bg, color: c.fg, borderRadius: 4, padding: "4px 0", fontWeight: 700 }}>{c.text || " "}</div></td>;
                    })}
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
