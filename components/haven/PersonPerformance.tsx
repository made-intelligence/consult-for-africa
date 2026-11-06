import { prisma } from "@/lib/prisma";
import type { StaffSession } from "@/lib/staffAuth";
import { HAVEN_ROLES, CONDUCT, SCORE_SCALE } from "@/lib/haven-roles";
import { canManage, canSeeScores, isLeadership, monthKey, monthLabel } from "@/lib/havenPerformance";
import { Objectives, OneToOneForm, AppraisalForm, StageAction, type ObjRow } from "@/components/haven/Performance";

const NAVY = "#0B3C5D";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ color: NAVY, fontSize: 20, margin: "26px 0 10px" }}>{children}</h2>;
}

const STAGE: Record<string, string> = {
  SELF: "Self-appraisal", MANAGER: "With the line manager", MODERATION: "Moderation", SIGN_OFF: "Waiting for both signatures", DONE: "Complete",
};

/** Everything about one person's performance, shown to them or to whoever runs it. */
export default async function PersonPerformance({ session, personId }: { session: StaffSession; personId: string }) {
  const person = await prisma.staffMember.findFirst({
    where: { id: personId, clientId: session.clientId },
    select: { id: true, name: true, position: true, roleCode: true, lineManagerId: true, lineManager: { select: { name: true } } },
  });
  if (!person) return <p style={{ color: MUTED }}>Not found.</p>;
  const isSelf = person.id === session.sub;
  const manages = canManage(session, person) && !isSelf;
  const seesScores = canSeeScores(session, person);
  const role = HAVEN_ROLES.find((r) => r.code === person.roleCode);
  const cycle = await prisma.reviewCycle.findFirst({ where: { clientId: session.clientId, closedAt: null, startsOn: { lte: new Date() } }, orderBy: { startsOn: "desc" } });

  const [objectives, talks, appraisal] = await Promise.all([
    cycle
      ? prisma.personalObjective.findMany({ where: { staffId: person.id, cycleId: cycle.id }, include: { updates: { orderBy: { month: "asc" } } }, orderBy: { sortOrder: "asc" } })
      : Promise.resolve([]),
    prisma.oneToOne.findMany({ where: { staffId: person.id }, orderBy: { heldOn: "desc" }, take: 6, include: { manager: { select: { name: true } } } }),
    cycle ? prisma.appraisal.findUnique({ where: { staffId_cycleId: { staffId: person.id, cycleId: cycle.id } } }) : Promise.resolve(null),
  ]);
  const m = monthKey();
  const rows: ObjRow[] = objectives.map((o) => {
    const cur = o.updates.find((u) => u.month === m);
    return {
      id: o.id, title: o.title, target: o.target, tags: o.tags, weight: o.weight, status: o.status,
      thisMonth: cur ? { actual: cur.actual, rag: cur.rag, note: cur.note } : null,
      history: o.updates.map((u) => ({ month: u.month, rag: u.rag })),
    };
  });
  const scale = SCORE_SCALE.map((s) => ({ score: s.score, label: s.label }));
  const conduct = CONDUCT.map((c) => ({ id: c.code, title: c.title }));
  const objItems = objectives.map((o) => ({ id: o.id, title: o.title, target: o.target }));
  const asRec = (j: unknown) => (j && typeof j === "object" ? (j as Record<string, number>) : {});

  return (
    <div>
      <div style={{ color: MUTED, fontSize: 14 }}>
        {role ? role.title : "No role set yet"} · line manager: {person.lineManager?.name ?? "not set"}
        {cycle ? ` · ${cycle.name}` : ""}
      </div>

      {role && (
        <details style={{ marginTop: 12, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 16px" }}>
          <summary style={{ color: NAVY, fontWeight: 650, cursor: "pointer" }}>Job description: {role.title}</summary>
          <p style={{ color: "#1F2937", fontSize: 14.5 }}>{role.purpose}</p>
          <div style={{ color: NAVY, fontWeight: 650, fontSize: 14 }}>Key responsibilities</div>
          <ul style={{ fontSize: 14, color: "#1F2937", paddingLeft: 20 }}>{role.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
          {role.rotatingDuty && (
            <>
              <div style={{ color: NAVY, fontWeight: 650, fontSize: 14 }}>Rotating duty: {role.rotatingDuty.title}</div>
              <ul style={{ fontSize: 14, color: "#1F2937", paddingLeft: 20 }}>{role.rotatingDuty.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            </>
          )}
          <div style={{ color: NAVY, fontWeight: 650, fontSize: 14 }}>Qualifications</div>
          <ul style={{ fontSize: 14, color: "#1F2937", paddingLeft: 20 }}>{role.qualifications.map((r) => <li key={r}>{r}</li>)}</ul>
        </details>
      )}

      <H>Objectives {cycle ? `for ${cycle.name}` : ""}</H>
      {!cycle ? (
        <p style={{ color: MUTED }}>No review cycle is open yet.</p>
      ) : (
        <>
          <p style={{ color: MUTED, fontSize: 13.5, margin: "0 0 10px" }}>
            Five objectives, set with your line manager. Updated each month: on track, at risk or off track. {monthLabel(m)} is this month.
          </p>
          <Objectives staffId={person.id} rows={rows} isSelf={isSelf} canManage={canManage(session, person)} hasRole={!!role} />
        </>
      )}

      <H>Monthly conversations</H>
      {talks.length === 0 && <p style={{ color: MUTED, fontSize: 14 }}>None recorded yet. One a month is the standard.</p>}
      <div style={{ display: "grid", gap: 8 }}>
        {talks.map((t) => (
          <div key={t.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
            <div style={{ color: NAVY, fontWeight: 650 }}>{t.heldOn.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}{t.manager ? ` with ${t.manager.name}` : ""}</div>
            {t.wentWell && <div><b>Went well:</b> {t.wentWell}</div>}
            {t.inTheWay && <div><b>In the way:</b> {t.inTheWay}</div>}
            {t.support && <div><b>Support:</b> {t.support}</div>}
            {t.actions && <div><b>Agreed:</b> {t.actions}</div>}
          </div>
        ))}
      </div>
      {manages && <div style={{ marginTop: 10 }}><OneToOneForm staffId={person.id} /></div>}

      {cycle && seesScores && (
        <>
          <H>Appraisal</H>
          {!cycle.appraisalOpenedAt ? (
            <p style={{ color: MUTED, fontSize: 14 }}>The appraisal opens near the end of the cycle. Until then, objectives and monthly updates are what count.</p>
          ) : (
            <>
              <p style={{ color: TEAL, fontSize: 14, margin: "0 0 10px" }}>
                Stage: {STAGE[appraisal?.stage ?? "SELF"]}{appraisal?.overall != null ? ` · overall ${appraisal.overall} out of 5` : ""}
              </p>
              {isSelf && (!appraisal || appraisal.stage === "SELF") && (
                <AppraisalForm mode="self" staffId={person.id} objectives={objItems} conduct={conduct} scale={scale}
                  initial={asRec(appraisal?.selfScores)} initialConduct={asRec(appraisal?.conductSelf)} initialComment={appraisal?.selfComment ?? ""} />
              )}
              {manages && appraisal?.stage === "MANAGER" && (
                <AppraisalForm mode="manager" staffId={person.id} objectives={objItems} conduct={conduct} scale={scale}
                  initial={asRec(appraisal.managerScores)} initialConduct={asRec(appraisal.conductManager)} initialComment={appraisal.managerComment ?? ""}
                  otherScores={asRec(appraisal.selfScores)} otherConduct={asRec(appraisal.conductSelf)} />
              )}
              {isLeadership(session) && !isSelf && appraisal?.stage === "MODERATION" && (
                <StageAction label="Moderated: send for both signatures" body={{ action: "moderate", staffId: person.id }} />
              )}
              {appraisal?.stage === "SIGN_OFF" && ((isSelf && !appraisal.staffSignedAt) || (appraisal.managerId === session.sub && !appraisal.managerSignedAt)) && (
                <StageAction label="I have read it: sign" body={{ action: "sign", staffId: person.id }} />
              )}
              {appraisal && appraisal.stage !== "SELF" && (appraisal.selfComment || appraisal.managerComment) && (
                <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, marginTop: 10 }}>
                  {appraisal.selfComment && <div><b>Their comment:</b> {appraisal.selfComment}</div>}
                  {appraisal.managerComment && appraisal.stage !== "MANAGER" && <div><b>Manager&apos;s comment:</b> {appraisal.managerComment}</div>}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
