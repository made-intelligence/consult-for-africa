import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession, can } from "@/lib/staffAuth";
import { ONBOARDED, staffWhere } from "@/lib/havenAudience";
import { dayKey } from "@/lib/havenDuty";
import { HuddleForm, TeamAssign, SignOff, LeadRotation } from "@/components/haven/TeamTools";
import { NURSING_TEAM_KEY } from "@/lib/havenLeadTerm";

export const metadata: Metadata = { title: "Haven Paediatric Centre: teams", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export default async function TeamsPage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const today = dayKey();
  const since = new Date(today.getTime() - 13 * 864e5);
  const manage = can(session, "MANAGE_TEAMS");
  const signer = can(session, "SIGN_OFF_SKILL");
  const named = can(session, "VIEW_TEAM_NAMED") || session.tiers.includes("SUPERVISOR");

  const [teams, people, skills] = await Promise.all([
    prisma.staffTeam.findMany({
      where: { clientId: session.clientId },
      orderBy: { sortOrder: "asc" },
      include: {
        lead: { select: { id: true, name: true } },
        members: { where: { isActive: true }, select: { id: true, name: true, position: true }, orderBy: { name: "asc" } },
        huddles: { where: { date: { gte: since } }, orderBy: { date: "desc" }, include: { ledBy: { select: { name: true } } } },
        leadTerms: { orderBy: { startsOn: "desc" }, take: 8, include: { staff: { select: { name: true } } } },
      },
    }),
    prisma.staffMember.findMany({
      where: staffWhere(session.clientId, ONBOARDED),
      select: { id: true, name: true, position: true, teamId: true },
      orderBy: { name: "asc" },
    }),
    signer
      ? prisma.protocol.findMany({ where: { clientId: session.clientId, isActive: true, NOT: { approvedAt: null } }, select: { id: true, title: true }, orderBy: { title: "asc" } })
      : Promise.resolve([] as { id: string; title: string }[]),
  ]);
  const leadIds = new Set(teams.map((t) => t.leadId).filter(Boolean) as string[]);
  const canAppoint = session.tiers.includes("BOARD");
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>Teams</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 680 }}>
            Everyone belongs to one team. Each team has a lead, a ten-minute huddle every working day, and its own
            objectives for the quarter.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "8px 20px 72px" }}>
        {teams.map((t) => {
          const isLead = t.leadId === session.sub || (session.tiers.includes("LEADERSHIP") && t.members.some((m) => m.id === session.sub));
          const doneToday = t.huddles.some((h) => h.date.getTime() === today.getTime());
          return (
            <section key={t.id} style={{ marginTop: 34 }}>
              <h2 style={{ color: NAVY, fontSize: 22, margin: 0 }}>{t.name}</h2>
              <p style={{ color: MUTED, fontSize: 14.5, margin: "4px 0 12px" }}>
                {t.lead ? `Led by ${t.lead.name}` : "No lead named yet"} · {t.members.length} {t.members.length === 1 ? "person" : "people"} · {t.huddles.length} huddles in the last fourteen days
              </p>
              {t.purpose && <p style={{ color: "#1F2937", fontSize: 15, margin: "0 0 12px" }}>{t.purpose}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {t.members.map((m) => (
                  <span key={m.id} style={{ fontSize: 13, padding: "4px 10px", borderRadius: 999, background: m.id === t.leadId ? "#EEF6F8" : "#fff", border: `1px solid ${LINE}`, color: NAVY }}>
                    {m.name}{m.id === t.leadId ? " · lead" : ""}
                  </span>
                ))}
              </div>

              {t.key === NURSING_TEAM_KEY && (() => {
                const cur = t.leadTerms.find((x) => !x.endedAt && x.startsOn <= today);
                return (
                  <LeadRotation
                    teamId={t.id}
                    members={t.members.filter((m) => /registered nurse/i.test(m.position)).map((m) => ({ id: m.id, name: m.name }))}
                    current={cur ? { name: cur.staff.name, startsOn: cur.startsOn.toISOString(), endsOn: cur.endsOn.toISOString(), handoverNote: cur.handoverNote } : null}
                    history={t.leadTerms.filter((x) => x !== cur).map((x) => ({ name: x.staff.name, startsOn: x.startsOn.toISOString(), endsOn: x.endsOn.toISOString(), handoverNote: x.handoverNote }))}
                    canAppoint={canAppoint}
                    isLead={cur?.staffId === session.sub}
                  />
                );
              })()}

              {isLead && (
                <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, marginTop: 14 }}>
                  <div style={{ color: NAVY, fontWeight: 700, marginBottom: 10 }}>Today&apos;s huddle</div>
                  <HuddleForm teamId={t.id} members={t.members.map((m) => ({ id: m.id, name: m.name }))} done={doneToday} />
                </div>
              )}

              {(named || t.members.some((m) => m.id === session.sub)) && t.huddles.length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ color: TEAL, fontWeight: 600, cursor: "pointer" }}>The huddle log</summary>
                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {t.huddles.map((h) => (
                      <div key={h.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
                        <div style={{ color: NAVY, fontWeight: 650 }}>{fmt(h.date)} · {h.attendees.length} there{h.ledBy ? ` · led by ${h.ledBy.name}` : ""}</div>
                        {h.safety && <div><b>Safety:</b> {h.safety}</div>}
                        {h.focus && <div><b>Focus:</b> {h.focus}</div>}
                        {h.blocker && <div><b>Blocker:</b> {h.blocker}</div>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </section>
          );
        })}
        {teams.length === 0 && <p style={{ color: MUTED, marginTop: 28 }}>No teams set up yet.</p>}

        {signer && skills.length > 0 && (
          <section id="signoff" style={{ marginTop: 44 }}>
            <h2 style={{ color: NAVY, fontSize: 22, margin: "0 0 4px" }}>Sign off a skill on shift</h2>
            <p style={{ color: MUTED, fontSize: 14.5, margin: "0 0 12px" }}>A quiz shows somebody knows it. Watching them do it shows they can. Only sign what you saw.</p>
            <SignOff people={people.filter((p) => p.id !== session.sub).map((p) => ({ id: p.id, name: p.name }))} skills={skills} />
          </section>
        )}

        {manage && (
          <section style={{ marginTop: 44 }}>
            <h2 style={{ color: NAVY, fontSize: 22, margin: "0 0 4px" }}>Who is in which team</h2>
            <p style={{ color: MUTED, fontSize: 14.5, margin: "0 0 12px" }}>One team each. Making somebody lead also puts them in that team.</p>
            <TeamAssign
              people={people.map((p) => ({ ...p, leads: leadIds.has(p.id) }))}
              teams={teams.map((t) => ({ id: t.id, name: t.name }))}
            />
          </section>
        )}
      </div>
    </main>
  );
}
