import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession, can } from "@/lib/staffAuth";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { deptLabel, monthKey } from "@/lib/havenDuty";
import RotaGrid from "@/components/haven/RotaGrid";

export const metadata: Metadata = {
  title: "Haven Paediatric Centre: the rota",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

function parseMonth(m: string | undefined) {
  const now = new Date();
  if (m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m)) return m;
  return monthKey(now);
}

export default async function RotaPage({ searchParams }: { searchParams: Promise<{ month?: string; dept?: string }> }) {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const sp = await searchParams;
  const month = parseMonth(sp.month);
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const next = new Date(Date.UTC(y, m, 1));
  const days = Math.round((next.getTime() - first.getTime()) / 864e5);
  const weekdays = Array.from({ length: days }, (_, i) =>
    "SMTWTFS"[new Date(Date.UTC(y, m - 1, i + 1)).getUTCDay()]
  );
  const prevMonth = monthKey(new Date(Date.UTC(y, m - 2, 1)));
  const nextMonth = monthKey(next);
  const monthName = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { department: true } });
  const everyone = await prisma.staffMember.findMany({
    where: staffWhere(session.clientId, ONBOARDED),
    select: { id: true, name: true, position: true, department: true },
    orderBy: { name: "asc" },
  });
  const departments = Array.from(new Set(everyone.map((p) => p.department))).sort();
  const editor = can(session, "ENTER_ROTA");
  const dept = editor && sp.dept && departments.includes(sp.dept) ? sp.dept : me?.department ?? departments[0];

  const inDept = everyone.filter((p) => p.department === dept);
  const [shifts, rotas] = await Promise.all([
    prisma.staffShift.findMany({
      where: { staffId: { in: inDept.map((p) => p.id) }, date: { gte: first, lt: next } },
      select: { staffId: true, date: true, code: true },
    }),
    prisma.staffRota.findMany({
      where: { clientId: session.clientId, month },
      select: { department: true, updatedAt: true, enteredBy: { select: { name: true } } },
    }),
  ]);
  const inMonth = new Map(rotas.map((r) => [r.department, r]));
  const people = inDept.map((p) => {
    const codes = Array.from({ length: days }, () => "");
    for (const s of shifts) if (s.staffId === p.id) codes[s.date.getUTCDate() - 1] = s.code;
    return { id: p.id, name: p.name, position: p.position, codes };
  });
  const thisRota = inMonth.get(dept);

  const pill = (active: boolean): React.CSSProperties => ({
    display: "inline-block", padding: "7px 13px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, textDecoration: "none",
    border: `1px solid ${active ? NAVY : LINE}`, background: active ? NAVY : "#fff", color: active ? "#fff" : NAVY,
  });

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>The rota: {monthName}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 640 }}>
            Once a department&apos;s rota is in, nobody there is sent tasks or chased on a day off. On a day off they are
            offered one short module instead, and only if they want it.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 72px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link href={`/HavenStaff/rota?month=${prevMonth}&dept=${encodeURIComponent(dept)}`} style={pill(false)}>&lsaquo; Previous</Link>
          <Link href={`/HavenStaff/rota?month=${nextMonth}&dept=${encodeURIComponent(dept)}`} style={pill(false)}>Next &rsaquo;</Link>
        </div>

        {editor && (
          <div style={{ marginTop: 20 }}>
            <div style={{ color: MUTED, fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Departments</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {departments.map((d) => (
                <Link key={d} href={`/HavenStaff/rota?month=${month}&dept=${encodeURIComponent(d)}`} style={pill(d === dept)}>
                  {deptLabel(d)} {inMonth.has(d) ? "✓" : "· not in"}
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 style={{ color: NAVY, fontSize: 22, margin: "28px 0 6px" }}>{deptLabel(dept)}</h2>
        {thisRota && (
          <p style={{ color: TEAL, fontSize: 14, margin: "0 0 14px" }}>
            In, last saved {thisRota.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" })}
            {thisRota.enteredBy ? ` by ${thisRota.enteredBy.name}` : ""}.
          </p>
        )}

        {editor ? (
          <RotaGrid department={dept} month={month} days={days} weekdays={weekdays} people={people} alreadyIn={!!thisRota} />
        ) : thisRota ? (
          <div style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 12, background: "#fff" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 10px", minWidth: 150, color: NAVY }}>Name</th>
                  {weekdays.map((w, i) => (
                    <th key={i} style={{ padding: "4px 6px", color: MUTED, fontSize: 11.5 }}>{i + 1}<div style={{ fontWeight: 400 }}>{w}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} style={{ background: p.id === session.sub ? "#FFF8E1" : undefined }}>
                    <td style={{ padding: "6px 10px", borderTop: `1px solid ${LINE}`, color: NAVY, fontWeight: 600 }}>{p.name}</td>
                    {p.codes.map((c, i) => (
                      <td key={i} style={{ textAlign: "center", borderTop: `1px solid ${LINE}`, color: c ? NAVY : "#cbd5e1", fontWeight: 600 }}>{c || "·"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.6 }}>
            Your department&apos;s rota for {monthName} is not in the system yet, so it cannot tell your days off from your
            shifts and you may be sent tasks on a day off. Ask your supervisor to put it in here.
          </p>
        )}
      </div>
    </main>
  );
}
