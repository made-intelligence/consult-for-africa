import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staffAuth";
import { canAgree, canEdit, canSeeBoard, quarterLabel, quarterOf } from "@/lib/havenObjectives";
import { ObjectiveCard, NewObjective, type ObjectiveRow } from "@/components/haven/Objectives";

export const metadata: Metadata = { title: "Haven Paediatric Centre: objectives", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const MUTED = "#64748b";

export default async function ObjectivesPage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const quarter = quarterOf();
  const board = canSeeBoard(session);
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { teamId: true } });
  const seeAllTeams = board || session.tiers.includes("LEADERSHIP");

  const [teams, objectives] = await Promise.all([
    prisma.staffTeam.findMany({
      where: { clientId: session.clientId, ...(seeAllTeams ? {} : { id: me?.teamId ?? "__none__" }) },
      select: { id: true, name: true, purpose: true, leadId: true, lead: { select: { name: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.objective.findMany({
      where: { clientId: session.clientId, quarter, ...(board ? {} : { level: "TEAM" as const }) },
      include: {
        keyResults: { orderBy: { sortOrder: "asc" } },
        parent: { select: { title: true } },
        agreedBy: { select: { name: true } },
        team: { select: { leadId: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const shape = (o: (typeof objectives)[number]): ObjectiveRow => {
    const scope = { level: o.level, teamLeadId: o.team?.leadId ?? null };
    return {
      id: o.id, level: o.level, title: o.title, why: o.why, status: o.status, proposalNote: o.proposalNote,
      // A frontline viewer does not see the board's wording, only that it ladders up.
      parentTitle: o.parent ? (board ? o.parent.title : "a board objective") : null,
      agreedBy: o.agreedBy?.name ?? null,
      keyResults: o.keyResults.map((k) => ({ id: k.id, kind: k.kind, title: k.title, baseline: k.baseline, target: k.target, current: k.current, confidence: k.confidence })),
      canEdit: canEdit(session, scope), canAgree: canAgree(session, scope),
    };
  };
  const boardRows = objectives.filter((o) => o.level === "BOARD").map(shape);
  const parents = boardRows.filter((o) => o.status !== "CLOSED").map((o) => ({ id: o.id, title: o.title }));

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>Objectives: {quarterLabel(quarter)}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 680 }}>
            A few things we are trying to move this quarter, and what must not get worse while we move them. Teams
            propose their own; they are agreed, not handed down. None of it is tied to pay.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 20px 72px" }}>
        {board && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ color: NAVY, fontSize: 22, margin: "0 0 4px" }}>The board&apos;s objectives</h2>
            <p style={{ color: MUTED, fontSize: 14.5, margin: "0 0 14px" }}>Three to five for the hospital. Seen by the founders and leadership only.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {boardRows.map((o) => <ObjectiveCard key={o.id} o={o} />)}
              {canEdit(session, { level: "BOARD", teamLeadId: null }) && boardRows.length < 5 && <NewObjective level="BOARD" parents={[]} />}
            </div>
          </section>
        )}

        {teams.map((t) => {
          const rows = objectives.filter((o) => o.level === "TEAM" && o.teamId === t.id).map(shape);
          const editable = canEdit(session, { level: "TEAM", teamLeadId: t.leadId });
          return (
            <section key={t.id} style={{ marginTop: 36 }}>
              <h2 style={{ color: NAVY, fontSize: 22, margin: "0 0 4px" }}>{t.name}</h2>
              <p style={{ color: MUTED, fontSize: 14.5, margin: "0 0 14px" }}>
                {t.lead ? `Led by ${t.lead.name}.` : "No lead named yet."} {t.purpose ?? ""}
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                {rows.map((o) => <ObjectiveCard key={o.id} o={o} />)}
                {rows.length === 0 && <p style={{ color: MUTED, margin: 0 }}>Nothing proposed for this quarter yet.</p>}
                {editable && rows.length < 3 && <NewObjective level="TEAM" teamId={t.id} parents={parents} />}
              </div>
            </section>
          );
        })}
        {teams.length === 0 && <p style={{ color: MUTED, marginTop: 28 }}>You are not in a team yet. Leadership sets the teams on the teams page.</p>}
        <p style={{ color: MUTED, fontSize: 13, marginTop: 36 }}>Team results are seen by everyone at Haven, so they carry no naira figures.</p>
      </div>
    </main>
  );
}
