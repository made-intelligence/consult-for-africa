"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";
const RAG_C: Record<string, string> = { GREEN: "#166534", AMBER: "#92400E", RED: "#B0392B" };
const RAG_BG: Record<string, string> = { GREEN: "#DCFCE7", AMBER: "#FEF3C7", RED: "#FEE2E2" };
const TAGS = ["H1", "H2", "H3", "H4", "H5"] as const;

const input: React.CSSProperties = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 10px", fontSize: 14, width: "100%" };
const small: React.CSSProperties = { background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };
const primary: React.CSSProperties = { ...small, background: NAVY, color: "#fff" };

async function post(body: unknown) {
  const res = await fetch("/api/haven-staff/performance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.ok ? null : ((await res.json().catch(() => ({}))).error as string) ?? "That did not save.";
}

function useRun() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const run = async (body: unknown) => {
    setErr(null);
    const e = await post(body);
    if (e) setErr(e);
    else router.refresh();
    return !e;
  };
  return { err, run };
}

export interface ObjRow {
  id: string; title: string; target: string; tags: string[]; weight: number; status: "DRAFT" | "PROPOSED" | "AGREED";
  thisMonth: { actual: string; rag: string; note: string | null } | null;
  history: { month: string; rag: string }[];
}

const STATUS_LABEL: Record<ObjRow["status"], string> = { DRAFT: "Draft", PROPOSED: "Proposed, waiting for your manager", AGREED: "Agreed" };

export function Objectives({ staffId, rows, isSelf, canManage, hasRole }: { staffId: string; rows: ObjRow[]; isSelf: boolean; canManage: boolean; hasRole: boolean }) {
  const { err, run } = useRun();
  const [edit, setEdit] = useState<string | "new" | null>(null);
  const [f, setF] = useState({ title: "", target: "", tags: [] as string[], weight: 20 });
  const [upd, setUpd] = useState<string | null>(null);
  const [u, setU] = useState({ actual: "", rag: "GREEN", note: "" });
  const total = Math.round(rows.reduce((a, r) => a + r.weight, 0) * 100);
  const allAgreed = rows.length > 0 && rows.every((r) => r.status === "AGREED");
  const canEditRow = (r?: ObjRow) => canManage || (isSelf && (!r || r.status !== "AGREED"));

  const open = (r?: ObjRow) => {
    setEdit(r ? r.id : "new");
    setF(r ? { title: r.title, target: r.target, tags: r.tags, weight: Math.round(r.weight * 100) } : { title: "", target: "", tags: [], weight: 20 });
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.length === 0 && (
        <div style={{ background: "#fff", border: `1px dashed ${LINE}`, borderRadius: 12, padding: 16, color: MUTED, fontSize: 14.5 }}>
          No objectives for this cycle yet.
          {canManage && hasRole && (
            <div style={{ marginTop: 10 }}>
              <button style={primary} onClick={() => run({ action: "seedObjectives", staffId })}>Start from the role&apos;s five KPIs</button>
            </div>
          )}
          {canManage && !hasRole && <div style={{ marginTop: 6 }}>Set this person&apos;s role first, below.</div>}
        </div>
      )}
      {rows.map((r) => (
        <div key={r.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 14 }}>
          {edit === r.id ? null : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: NAVY, fontWeight: 650, fontSize: 15 }}>{r.title}</div>
                  <div style={{ color: MUTED, fontSize: 13 }}>Target: {r.target} · weight {Math.round(r.weight * 100)}% {r.tags.length ? `· ${r.tags.join(", ")}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {r.history.map((h) => (
                    <span key={h.month} title={h.month} style={{ width: 12, height: 12, borderRadius: 3, background: RAG_C[h.rag] }} />
                  ))}
                </div>
              </div>
              {r.thisMonth && (
                <div style={{ marginTop: 8, fontSize: 13.5, background: RAG_BG[r.thisMonth.rag], color: RAG_C[r.thisMonth.rag], borderRadius: 8, padding: "6px 10px" }}>
                  This month: {r.thisMonth.actual}{r.thisMonth.note ? ` · ${r.thisMonth.note}` : ""}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {r.status === "AGREED" && (isSelf || canManage) && <button style={small} onClick={() => { setUpd(upd === r.id ? null : r.id); setU({ actual: r.thisMonth?.actual ?? "", rag: r.thisMonth?.rag ?? "GREEN", note: r.thisMonth?.note ?? "" }); }}>Update this month</button>}
                {canEditRow(r) && <button style={small} onClick={() => open(r)}>Edit</button>}
                {canManage && r.status !== "AGREED" && <button style={{ ...small, color: RED, borderColor: LINE }} onClick={() => run({ action: "deleteObjective", id: r.id })}>Remove</button>}
                {r.status !== "AGREED" && <span style={{ color: MUTED, fontSize: 12.5, alignSelf: "center" }}>{STATUS_LABEL[r.status]}</span>}
              </div>
              {upd === r.id && (
                <div style={{ display: "grid", gap: 6, marginTop: 10, gridTemplateColumns: "1fr 130px" }}>
                  <input style={input} placeholder="Where it stands this month" value={u.actual} onChange={(e) => setU({ ...u, actual: e.target.value })} aria-label="Actual this month" />
                  <select style={input} value={u.rag} onChange={(e) => setU({ ...u, rag: e.target.value })} aria-label="Status">
                    <option value="GREEN">On track</option><option value="AMBER">At risk</option><option value="RED">Off track</option>
                  </select>
                  <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="What moved it, or what is in the way (optional)" value={u.note} onChange={(e) => setU({ ...u, note: e.target.value })} aria-label="Note" />
                  <button style={{ ...primary, justifySelf: "start" }} onClick={async () => { if (await run({ action: "update", objectiveId: r.id, ...u })) setUpd(null); }}>Save</button>
                </div>
              )}
            </>
          )}
          {edit === r.id && <Editor f={f} setF={setF} onSave={async () => { if (await run({ action: "saveObjective", staffId, id: r.id, title: f.title, target: f.target, tags: f.tags, weight: f.weight / 100 })) setEdit(null); }} onCancel={() => setEdit(null)} />}
        </div>
      ))}
      {edit === "new" && (
        <div style={{ background: "#fff", border: `1px dashed ${LINE}`, borderRadius: 12, padding: 14 }}>
          <Editor f={f} setF={setF} onSave={async () => { if (await run({ action: "saveObjective", staffId, title: f.title, target: f.target, tags: f.tags, weight: f.weight / 100 })) setEdit(null); }} onCancel={() => setEdit(null)} />
        </div>
      )}
      {rows.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: total === 100 ? TEAL : RED, fontSize: 13.5, fontWeight: 600 }}>Weights add to {total}%</span>
          {canEditRow() && rows.length < 6 && edit === null && <button style={small} onClick={() => open()}>Add an objective</button>}
          {isSelf && !canManage && rows.some((r) => r.status === "DRAFT") && <button style={primary} onClick={() => run({ action: "propose", staffId })}>Send to my manager to agree</button>}
          {canManage && !isSelf && !allAgreed && <button style={primary} onClick={() => run({ action: "agree", staffId })}>Agree these objectives</button>}
        </div>
      )}
      {err && <p style={{ color: RED, fontSize: 14, margin: 0 }}>{err}</p>}
    </div>
  );
}

function Editor({ f, setF, onSave, onCancel }: { f: { title: string; target: string; tags: string[]; weight: number }; setF: (v: { title: string; target: string; tags: string[]; weight: number }) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input style={input} placeholder="The objective" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} aria-label="Objective" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8 }}>
        <input style={input} placeholder="Target by the end of the cycle" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} aria-label="Target" />
        <input style={input} type="number" min={5} max={60} value={f.weight} onChange={(e) => setF({ ...f, weight: Number(e.target.value) })} aria-label="Weight per cent" />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: MUTED, fontSize: 12.5 }}>Moves:</span>
        {TAGS.map((t) => {
          const on = f.tags.includes(t);
          return (
            <button key={t} type="button" aria-pressed={on} onClick={() => setF({ ...f, tags: on ? f.tags.filter((x) => x !== t) : [...f.tags, t] })}
              style={{ border: `1.5px solid ${on ? TEAL : LINE}`, background: on ? "#EEF6F8" : "#fff", color: NAVY, borderRadius: 999, padding: "4px 10px", fontSize: 12.5, cursor: "pointer" }}>{t}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={primary} onClick={onSave}>Save</button>
        <button style={small} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export function OneToOneForm({ staffId }: { staffId: string }) {
  const { err, run } = useRun();
  const [f, setF] = useState({ wentWell: "", inTheWay: "", support: "", actions: "" });
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: 8, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 14 }}>
      {([["wentWell", "What went well this month"], ["inTheWay", "What got in the way"], ["support", "What support they need"], ["actions", "What you both agreed to do, and by when"]] as const).map(([k, p]) => (
        <textarea key={k} rows={2} style={input} placeholder={p} aria-label={p} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      ))}
      <button style={{ ...primary, justifySelf: "start" }} onClick={async () => { if (await run({ action: "oneToOne", staffId, ...f })) { setDone(true); setF({ wentWell: "", inTheWay: "", support: "", actions: "" }); } }}>Record the conversation</button>
      {done && <p style={{ color: TEAL, fontSize: 14, margin: 0 }}>Recorded. They can read it on their own page.</p>}
      {err && <p style={{ color: RED, fontSize: 14, margin: 0 }}>{err}</p>}
    </div>
  );
}

export interface ScoreItem { id: string; title: string; target?: string }

export function AppraisalForm({ mode, staffId, objectives, conduct, scale, initial, initialConduct, initialComment, otherScores, otherConduct }: {
  mode: "self" | "manager"; staffId: string; objectives: ScoreItem[]; conduct: ScoreItem[]; scale: { score: number; label: string }[];
  initial: Record<string, number>; initialConduct: Record<string, number>; initialComment: string;
  otherScores?: Record<string, number>; otherConduct?: Record<string, number>;
}) {
  const { err, run } = useRun();
  const [scores, setScores] = useState<Record<string, number>>(initial);
  const [cond, setCond] = useState<Record<string, number>>(initialConduct);
  const [comment, setComment] = useState(initialComment);
  const complete = objectives.every((o) => scores[o.id] !== undefined) && conduct.every((c) => cond[c.id] !== undefined);
  const body = (submit: boolean) => mode === "self"
    ? { action: "appraisalSelf", scores, conduct: cond, comment, submit }
    : { action: "appraisalManager", staffId, scores, conduct: cond, comment, submit };
  const row = (item: ScoreItem, val: number | undefined, set: (v: number) => void, other?: number) => (
    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 10, alignItems: "center", borderTop: `1px solid ${LINE}`, padding: "8px 0" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: NAVY, fontSize: 14, fontWeight: 600 }}>{item.title}</div>
        {item.target && <div style={{ color: MUTED, fontSize: 12.5 }}>Target: {item.target}</div>}
        {other !== undefined && <div style={{ color: TEAL, fontSize: 12.5 }}>Their own score: {other}</div>}
      </div>
      <select style={input} value={val ?? ""} onChange={(e) => set(Number(e.target.value))} aria-label={`Score for ${item.title}`}>
        <option value="" disabled>Score 0 to 5</option>
        {scale.map((s) => <option key={s.score} value={s.score}>{s.score}: {s.label}</option>)}
      </select>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
      <div style={{ color: NAVY, fontWeight: 700 }}>Objectives (80%)</div>
      {objectives.map((o) => row(o, scores[o.id], (v) => setScores({ ...scores, [o.id]: v }), otherScores?.[o.id]))}
      <div style={{ color: NAVY, fontWeight: 700, marginTop: 10 }}>Conduct and values (20%)</div>
      {conduct.map((c) => row(c, cond[c.id], (v) => setCond({ ...cond, [c.id]: v }), otherConduct?.[c.id]))}
      <textarea rows={3} style={{ ...input, marginTop: 8 }} placeholder={mode === "self" ? "Your comment: what you are proud of, what got in the way, what you want to develop" : "Your comment: strengths, what to develop, and the support you will give"} value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button style={small} onClick={() => run(body(false))}>Save draft</button>
        <button style={{ ...primary, opacity: complete ? 1 : 0.5 }} disabled={!complete} onClick={() => run(body(true))}>{mode === "self" ? "Submit to my manager" : "Submit for moderation"}</button>
      </div>
      <p style={{ color: MUTED, fontSize: 12.5, margin: "4px 0 0" }}>Appraisal at Haven is for development. It is not tied to pay.</p>
      {err && <p style={{ color: RED, fontSize: 14, margin: 0 }}>{err}</p>}
    </div>
  );
}

export function StageAction({ label, body }: { label: string; body: unknown }) {
  const { err, run } = useRun();
  return (
    <div>
      <button style={primary} onClick={() => run(body)}>{label}</button>
      {err && <p style={{ color: RED, fontSize: 14, margin: "6px 0 0" }}>{err}</p>}
    </div>
  );
}

export function PeopleSetup({ people, roles }: { people: { id: string; name: string; position: string; roleCode: string | null; lineManagerId: string | null }[]; roles: { code: string; title: string }[] }) {
  const { err, run } = useRun();
  return (
    <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>
        <thead><tr style={{ color: MUTED, textAlign: "left" }}><th style={{ padding: "9px 12px" }}>Person</th><th style={{ padding: "9px 12px" }}>Role (job description)</th><th style={{ padding: "9px 12px" }}>Line manager</th></tr></thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} style={{ borderTop: `1px solid ${LINE}` }}>
              <td style={{ padding: "7px 12px" }}><div style={{ color: NAVY, fontWeight: 600 }}>{p.name}</div><div style={{ color: MUTED, fontSize: 12 }}>{p.position}</div></td>
              <td style={{ padding: "7px 12px", minWidth: 220 }}>
                <select style={input} value={p.roleCode ?? ""} aria-label={`Role for ${p.name}`} onChange={(e) => run({ action: "setRole", staffId: p.id, roleCode: e.target.value || null })}>
                  <option value="">No role set</option>
                  {roles.map((r) => <option key={r.code} value={r.code}>{r.title}</option>)}
                </select>
              </td>
              <td style={{ padding: "7px 12px", minWidth: 200 }}>
                <select style={input} value={p.lineManagerId ?? ""} aria-label={`Line manager for ${p.name}`} onChange={(e) => run({ action: "setLineManager", staffId: p.id, managerId: e.target.value || null })}>
                  <option value="">None</option>
                  {people.filter((m) => m.id !== p.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {err && <p style={{ color: RED, padding: "0 12px 12px", margin: 0 }}>{err}</p>}
    </div>
  );
}
