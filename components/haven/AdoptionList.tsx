import { prisma } from "@/lib/prisma";
import { periodKey, type Cadence } from "@/lib/havenTaskPeriod";
import { COUNTED, staffWhere } from "@/lib/havenAudience";

// The chase list. Rendered on the admin page and in Haven's client portal.
//
// Abigail's job is knowing who has not signed in, and until now the only way to
// find out was to ask me. A programme that depends on one person running a
// query is a programme that stops the week that person is busy.
//
// Deliberately not a dashboard of charts. It is a list of names with one
// question against each: has this person started. Everything else on this page
// exists to answer that or to say what to do about it.

export const HAVEN_CLIENT_NAME = "Haven Paediatric Centre";
const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const GOOD = "#15803D";

function when(d: Date | null) {
  if (!d) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 864e5);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default async function AdoptionList({ clientId }: { clientId: string }) {
  const client = { id: clientId };

  const staff = await prisma.staffMember.findMany({
    where: staffWhere(client.id, COUNTED),
    select: { id: true, name: true, position: true, department: true, lastLoginAt: true, email: true },
    orderBy: [{ lastLoginAt: "asc" }, { name: "asc" }],
  });

  const tasks = await prisma.staffTask.findMany({
    where: { clientId: client.id, isActive: true },
    select: { id: true, cadence: true },
  });
  const periods: string[] = Array.from(
    new Set((tasks as { cadence: string }[]).map((t) => periodKey(t.cadence as Cadence).toISOString()))
  );
  const completions = await prisma.staffTaskCompletion.findMany({
    where: { forDate: { in: periods.map((p: string) => new Date(p)) } },
    select: { staffId: true },
  });
  const ticks = new Map<string, number>();
  for (const c of completions as { staffId: string }[]) {
    ticks.set(c.staffId, (ticks.get(c.staffId) ?? 0) + 1);
  }

  type Row = {
    id: string; name: string; position: string; department: string;
    lastLoginAt: Date | null; email: string | null;
  };
  const rows = staff as Row[];
  const signedIn = rows.filter((s) => s.lastLoginAt);
  const never = rows.filter((s) => !s.lastLoginAt);
  const activeWeek = rows.filter(
    (s) => s.lastLoginAt && Date.now() - s.lastLoginAt.getTime() < 7 * 864e5
  );

  const card: React.CSSProperties = {
    background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20,
  };

  return (
    <main style={{ maxWidth: 940, margin: "0 auto", padding: "28px 20px 80px", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Haven Paediatric Centre
        </div>
        <h1 style={{ color: NAVY, fontSize: 28, margin: "8px 0 0", letterSpacing: "-0.02em" }}>Who has started</h1>
        <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 620 }}>
          The one number that matters this fortnight, and the names behind it. Sprint 1 target is 15 of {rows.length}
          {" "}signed in by 24 October.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {[
            ["Signed in at least once", `${signedIn.length} of ${rows.length}`, signedIn.length >= 15 ? GOOD : NAVY],
            ["Used it in the last 7 days", String(activeWeek.length), NAVY],
            ["Never signed in", String(never.length), never.length > 0 ? "#B0392B" : GOOD],
          ].map(([label, value, colour]) => (
            <div key={label} style={{ ...card, flex: "1 1 180px" }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
              <div style={{ color: colour as string, fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>

        {never.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ color: NAVY, fontSize: 20, margin: 0 }}>To chase</h2>
            <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 14px" }}>
              These {never.length} have never signed in. They are not being flagged and they are not behind: nothing
              starts for them until they do. Four minutes on shift, watching them sign in once, is what moves this.
            </p>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
              {never.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: NAVY, fontWeight: 650, fontSize: 15 }}>{s.name}</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>{s.position}</div>
                  </div>
                  <a href={`mailto:${s.email}`} style={{ color: TEAL, fontSize: 13.5, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    {s.email}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: 32 }}>
          <h2 style={{ color: NAVY, fontSize: 20, margin: "0 0 14px" }}>Everyone</h2>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
            {rows.map((s, i) => {
              const n = ticks.get(s.id) ?? 0;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
                  <span aria-hidden style={{
                    width: 9, height: 9, borderRadius: 999, flexShrink: 0,
                    background: s.lastLoginAt ? GOOD : "#CBD5E1",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: NAVY, fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>{s.position} · {s.department}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: s.lastLoginAt ? NAVY : MUTED, fontSize: 13.5, fontWeight: 600 }}>
                      {when(s.lastLoginAt) ?? "never signed in"}
                    </div>
                    <div style={{ color: n > 0 ? TEAL : MUTED, fontSize: 12.5 }}>
                      {n > 0 ? `${n} ticked this period` : "nothing ticked"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginTop: 28, maxWidth: 620 }}>
          Nobody on this page is being judged by it. The point of the list is to tell us who we have not reached yet,
          which is our problem rather than theirs.
        </p>
      </main>
  );
}
