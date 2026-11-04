"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const TEAL = "#1F7A8C";
const GOLD = "#B8922A";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";

export interface KrRow { id: string; kind: "RESULT" | "GUARD"; title: string; baseline: string | null; target: string | null; current: string | null; confidence: number | null }
export interface ObjectiveRow {
  id: string; level: "BOARD" | "TEAM"; title: string; why: string | null; status: "DRAFT" | "PROPOSED" | "AGREED" | "CLOSED";
  proposalNote: string | null; parentTitle: string | null; agreedBy: string | null; keyResults: KrRow[]; canEdit: boolean; canAgree: boolean;
}

async function post(body: unknown) {
  const res = await fetch("/api/haven-staff/objectives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await res.json().catch(() => ({}));
  return res.ok ? null : (d.error as string) ?? "That did not save.";
}

const STATUS: Record<ObjectiveRow["status"], [string, string]> = {
  DRAFT: ["Draft", MUTED], PROPOSED: ["Proposed, waiting to be agreed", GOLD], AGREED: ["Agreed", TEAL], CLOSED: ["Closed", MUTED],
};

const input: React.CSSProperties = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 10px", fontSize: 14, width: "100%" };
const small: React.CSSProperties = { background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };
const primary: React.CSSProperties = { ...small, background: NAVY, color: "#fff" };

function confColour(c: number | null) {
  if (c === null) return MUTED;
  return c >= 7 ? TEAL : c >= 4 ? GOLD : RED;
}

export function ObjectiveCard({ o }: { o: ObjectiveRow }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState<null | "RESULT" | "GUARD">(null);
  const [kr, setKr] = useState({ title: "", baseline: "", target: "" });
  const [checking, setChecking] = useState<string | null>(null);
  const [ci, setCi] = useState({ value: "", confidence: 7, note: "" });
  const [note, setNote] = useState("");
  const editable = o.canEdit && (o.status === "DRAFT" || o.status === "PROPOSED");

  async function run(body: unknown) {
    setErr(null);
    const e = await post(body);
    if (e) setErr(e);
    else router.refresh();
    return !e;
  }

  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: NAVY, fontWeight: 700, fontSize: 16.5 }}>{o.title}</div>
          {o.parentTitle && <div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>Serves: {o.parentTitle}</div>}
          {o.why && <div style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>{o.why}</div>}
        </div>
        <span style={{ color: STATUS[o.status][1], fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>
          {STATUS[o.status][0]}{o.agreedBy && o.status === "AGREED" ? ` by ${o.agreedBy}` : ""}
        </span>
      </div>
      {o.proposalNote && <p style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 10px", fontSize: 13.5, color: NAVY, margin: "10px 0 0" }}>Note: {o.proposalNote}</p>}

      <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
        {o.keyResults.map((k) => (
          <div key={k.id} style={{ borderLeft: `3px solid ${k.kind === "GUARD" ? GOLD : TEAL}`, paddingLeft: 12 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: k.kind === "GUARD" ? GOLD : TEAL }}>{k.kind === "GUARD" ? "GUARD" : "RESULT"}</span>
                <div style={{ color: "#1F2937", fontSize: 14.5 }}>{k.title}</div>
                <div style={{ color: MUTED, fontSize: 13 }}>
                  {k.baseline ? `From ${k.baseline}` : "Baseline to set"} · {k.target ? `target ${k.target}` : "target to agree"}
                  {k.current ? ` · now ${k.current}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {k.confidence !== null && <span title="Confidence it will be hit, 1 to 10" style={{ color: confColour(k.confidence), fontWeight: 700, fontSize: 13 }}>{k.confidence}/10</span>}
                {o.canEdit && o.status === "AGREED" && <button style={small} onClick={() => setChecking(checking === k.id ? null : k.id)}>Check in</button>}
                {editable && <button style={{ ...small, color: RED, borderColor: LINE }} onClick={() => run({ action: "removeKr", keyResultId: k.id })}>Remove</button>}
              </div>
            </div>
            {checking === k.id && (
              <div style={{ display: "grid", gap: 6, marginTop: 8, gridTemplateColumns: "1fr 110px" }}>
                <input style={input} placeholder="Where it is now" value={ci.value} onChange={(e) => setCi({ ...ci, value: e.target.value })} />
                <select style={input} value={ci.confidence} onChange={(e) => setCi({ ...ci, confidence: Number(e.target.value) })} aria-label="Confidence">
                  {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}/10 sure</option>)}
                </select>
                <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="What moved it, or what is in the way (optional)" value={ci.note} onChange={(e) => setCi({ ...ci, note: e.target.value })} />
                <button style={{ ...primary, gridColumn: "1 / -1", justifySelf: "start" }} onClick={async () => { if (await run({ action: "checkIn", keyResultId: k.id, ...ci })) { setChecking(null); setCi({ value: "", confidence: 7, note: "" }); } }}>Save check-in</button>
              </div>
            )}
          </div>
        ))}
        {o.keyResults.length === 0 && <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>No key results yet.</p>}
      </div>

      {editable && (
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {adding ? (
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 1fr" }}>
              <input style={{ ...input, gridColumn: "1 / -1" }} placeholder={adding === "GUARD" ? "What must not get worse, e.g. safety reports taken within two days" : "What will move, e.g. NICU admissions a month"} value={kr.title} onChange={(e) => setKr({ ...kr, title: e.target.value })} />
              <input style={input} placeholder="Baseline (now)" value={kr.baseline} onChange={(e) => setKr({ ...kr, baseline: e.target.value })} />
              <input style={input} placeholder="Target (end of quarter)" value={kr.target} onChange={(e) => setKr({ ...kr, target: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={primary} onClick={async () => { if (await run({ action: "addKr", objectiveId: o.id, kind: adding, ...kr })) { setAdding(null); setKr({ title: "", baseline: "", target: "" }); } }}>Add</button>
                <button style={small} onClick={() => setAdding(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={small} onClick={() => setAdding("RESULT")}>Add a key result</button>
              <button style={small} onClick={() => setAdding("GUARD")}>Add a guard</button>
            </div>
          )}
          {o.status === "DRAFT" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input style={{ ...input, flex: 1, minWidth: 200 }} placeholder="A note for whoever agrees it (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <button style={primary} onClick={() => run({ action: "propose", objectiveId: o.id, note })}>Send up for agreement</button>
            </div>
          )}
        </div>
      )}

      {o.canAgree && o.status === "PROPOSED" && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={primary} onClick={() => run({ action: "agree", objectiveId: o.id })}>Agree for the quarter</button>
          <input style={{ ...input, flex: 1, minWidth: 200 }} placeholder="Or send back with a note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button style={small} onClick={() => note.trim().length >= 3 ? run({ action: "sendBack", objectiveId: o.id, note }) : setErr("Say what to change before sending it back.")}>Send back</button>
        </div>
      )}
      {err && <p style={{ color: RED, fontSize: 14, margin: "10px 0 0" }}>{err}</p>}
    </div>
  );
}

export function NewObjective({ level, teamId, parents }: { level: "BOARD" | "TEAM"; teamId?: string; parents: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", why: "", parentId: "" });
  const [err, setErr] = useState<string | null>(null);
  if (!open) return <button style={small} onClick={() => setOpen(true)}>{level === "BOARD" ? "Add a board objective" : "Add a team objective"}</button>;
  return (
    <div style={{ background: "#fff", border: `1px dashed ${LINE}`, borderRadius: 14, padding: 16, display: "grid", gap: 8 }}>
      <input style={input} placeholder="The objective, in words people remember" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <input style={input} placeholder="Why it matters this quarter (optional)" value={f.why} onChange={(e) => setF({ ...f, why: e.target.value })} />
      {level === "TEAM" && parents.length > 0 && (
        <select style={input} value={f.parentId} onChange={(e) => setF({ ...f, parentId: e.target.value })} aria-label="Which board objective it serves">
          <option value="">Which board objective does it serve?</option>
          {parents.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={primary} onClick={async () => { const e = await post({ action: "create", level, teamId, ...f }); if (e) setErr(e); else { setOpen(false); router.refresh(); } }}>Create</button>
        <button style={small} onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {err && <p style={{ color: RED, fontSize: 14, margin: 0 }}>{err}</p>}
    </div>
  );
}
