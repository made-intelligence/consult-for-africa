"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";

const input: React.CSSProperties = { border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 10px", fontSize: 14, width: "100%" };
const primary: React.CSSProperties = { background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 14.5, cursor: "pointer" };

async function post(body: unknown) {
  const res = await fetch("/api/haven-staff/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.ok ? null : ((await res.json().catch(() => ({}))).error as string) ?? "That did not save.";
}

/** Ten minutes, standing: who was there, one safety concern, today's focus, one blocker. */
export function HuddleForm({ teamId, members, done }: { teamId: string; members: { id: string; name: string }[]; done: boolean }) {
  const router = useRouter();
  const [here, setHere] = useState<Set<string>>(new Set(members.map((m) => m.id)));
  const [f, setF] = useState({ safety: "", focus: "", blocker: "" });
  const [msg, setMsg] = useState<string | null>(done ? "Today's huddle is recorded. Saving again replaces it." : null);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {members.map((m) => {
          const on = here.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setHere((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })}
              style={{ border: `1.5px solid ${on ? TEAL : LINE}`, background: on ? "#EEF6F8" : "#fff", color: NAVY, borderRadius: 999, padding: "6px 12px", fontSize: 13.5, cursor: "pointer" }}
              aria-pressed={on}
            >
              {on ? "✓ " : ""}{m.name}
            </button>
          );
        })}
      </div>
      <input style={input} placeholder="1. Safety: one thing anyone is worried about today" value={f.safety} onChange={(e) => setF({ ...f, safety: e.target.value })} />
      <input style={input} placeholder="2. Focus: the one thing that matters most today" value={f.focus} onChange={(e) => setF({ ...f, focus: e.target.value })} />
      <input style={input} placeholder="3. Blocker: what is in the way, and who will clear it" value={f.blocker} onChange={(e) => setF({ ...f, blocker: e.target.value })} />
      <button
        style={{ ...primary, justifySelf: "start" }}
        onClick={async () => {
          const e = await post({ action: "huddle", teamId, attendees: [...here], ...f });
          setMsg(e ?? "Recorded. If a safety concern needs investigating, report it as a near miss too.");
          if (!e) router.refresh();
        }}
      >
        Record today&apos;s huddle
      </button>
      {msg && <p style={{ color: msg.startsWith("Recorded") || msg.startsWith("Today") ? TEAL : RED, fontSize: 14, margin: 0 }}>{msg}</p>}
    </div>
  );
}

/** Leadership only: who is in which team, and who leads it. One team each. */
export function TeamAssign({ people, teams }: { people: { id: string; name: string; position: string; teamId: string | null; leads: boolean }[]; teams: { id: string; name: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
        <thead>
          <tr style={{ color: MUTED, textAlign: "left" }}>
            <th style={{ padding: "10px 12px" }}>Person</th><th style={{ padding: "10px 12px" }}>Team</th><th style={{ padding: "10px 12px" }}>Lead</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} style={{ borderTop: `1px solid ${LINE}` }}>
              <td style={{ padding: "8px 12px" }}><div style={{ color: NAVY, fontWeight: 600 }}>{p.name}</div><div style={{ color: MUTED, fontSize: 12.5 }}>{p.position}</div></td>
              <td style={{ padding: "8px 12px", minWidth: 200 }}>
                <select
                  style={input}
                  value={p.teamId ?? ""}
                  aria-label={`Team for ${p.name}`}
                  onChange={async (e) => { const r = await post({ action: "assign", staffId: p.id, teamId: e.target.value || null }); setErr(r); if (!r) router.refresh(); }}
                >
                  <option value="">No team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                {p.leads ? (
                  <span style={{ color: TEAL, fontWeight: 700 }}>Leads</span>
                ) : p.teamId ? (
                  <button
                    style={{ background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer" }}
                    onClick={async () => { const r = await post({ action: "lead", teamId: p.teamId, staffId: p.id }); setErr(r); if (!r) router.refresh(); }}
                  >
                    Make lead
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {err && <p style={{ color: RED, padding: "0 12px 12px", margin: 0 }}>{err}</p>}
    </div>
  );
}

/** A supervisor signs that they watched somebody do it, on shift. */
export function SignOff({ people, skills }: { people: { id: string; name: string }[]; skills: { id: string; title: string }[] }) {
  const router = useRouter();
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 10, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
      <select style={input} value={who} onChange={(e) => setWho(e.target.value)} aria-label="Who">
        <option value="">Who did you watch?</option>
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select style={input} value={what} onChange={(e) => setWhat(e.target.value)} aria-label="Which skill">
        <option value="">Doing what?</option>
        {skills.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
      <button
        disabled={!who || !what}
        style={{ ...primary, justifySelf: "start", opacity: !who || !what ? 0.5 : 1 }}
        onClick={async () => {
          const res = await fetch("/api/haven-staff/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "observe", protocolId: what, staffId: who }) });
          const d = await res.json().catch(() => ({}));
          setMsg(res.ok ? "Signed off. It shows on their record as watched on shift." : d.error ?? "That did not save.");
          if (res.ok) { setWhat(""); router.refresh(); }
        }}
      >
        I watched them do it correctly
      </button>
      {msg && <p style={{ color: msg.startsWith("Signed") ? TEAL : RED, fontSize: 14, margin: 0 }}>{msg}</p>}
    </div>
  );
}
