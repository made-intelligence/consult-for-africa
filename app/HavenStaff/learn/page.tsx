import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staffAuth";
import { myModules, type LearnRow } from "@/lib/havenLearn";

export const metadata: Metadata = { title: "Haven Paediatric Centre: training", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const LABEL: Record<LearnRow["status"], [string, string]> = {
  NEW: ["Not started", MUTED],
  READ: ["Read, test waiting", GOLD],
  RETAKE: ["Try the test again", "#B0392B"],
  PASSED: ["Passed", TEAL],
};

function Group({ title, rows }: { title: string; rows: LearnRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ color: NAVY, fontSize: 20, margin: "0 0 12px" }}>{title}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <Link key={r.id} href={`/HavenStaff/learn/${encodeURIComponent(r.code)}`} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, textDecoration: "none", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{r.title}</div>
              <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{r.summary}</div>
            </div>
            <span style={{ color: r.approved ? LABEL[r.status][1] : GOLD, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
              {r.approved ? LABEL[r.status][0] : "Awaiting approval"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function LearnPage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });

  const mine = (await myModules(session.clientId, session.sub)).filter((r) => r.approved);
  const toApprove = me?.canApproveClinical
    ? await prisma.protocol.findMany({
        where: { clientId: session.clientId, isActive: true, approvedAt: null },
        select: { id: true, code: true, domain: true, title: true, summary: true },
        orderBy: [{ domain: "asc" }, { code: "asc" }],
      })
    : [];

  const passed = mine.filter((r) => r.status === "PASSED").length;
  const core = mine.filter((r) => r.domain === "Core");
  const sop = mine.filter((r) => r.domain !== "Core");

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>Training</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0" }}>
            Haven&apos;s own procedures, one short module at a time, and a core set everyone does. Each takes about fifteen
            minutes and works on a phone, so a day off is a good time for one.
          </p>
          {mine.length > 0 && (
            <p style={{ color: GOLD, fontWeight: 700, margin: "14px 0 0" }}>{passed} of {mine.length} passed</p>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 72px" }}>
        {toApprove.length > 0 && (
          <Group
            title={`Waiting for your approval (${toApprove.length})`}
            rows={toApprove.map((p) => ({ ...p, approved: false, status: "NEW" as const }))}
          />
        )}
        <Group title="Everyone does these" rows={core} />
        <Group title="For your role" rows={sop} />
        {mine.length === 0 && toApprove.length === 0 && (
          <p style={{ color: MUTED, fontSize: 16, marginTop: 28 }}>
            Nothing is open yet. Modules appear here once the Chief Medical Director has approved them.
          </p>
        )}
      </div>
    </main>
  );
}
