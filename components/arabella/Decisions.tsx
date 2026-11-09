"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRINCIPAL } from "@/lib/arabella-daily";

const INK = "var(--staff-ink, #4A2C4F)";
const ACCENT = "var(--staff-accent, #D9A6A0)";
const SECOND = "var(--staff-second, #4F7F73)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const WARN = "#B0392B";

const ENDPOINT = "/api/arabella-staff/decisions";

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  fontSize: 16,
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#fff",
};

const button = (primary: boolean): React.CSSProperties => ({
  background: primary ? INK : "#fff",
  color: primary ? "#fff" : INK,
  border: `1px solid ${primary ? INK : LINE}`,
  borderRadius: 10,
  padding: "11px 18px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
});

async function call(method: "POST" | "PATCH", body: object): Promise<string | null> {
  try {
    const res = await fetch(ENDPOINT, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return null;
    return (await res.json().catch(() => null))?.error ?? "That did not save.";
  } catch {
    return "No connection. Check your signal and try again.";
  }
}

/** Raise something for the principal to decide. */
export function RaiseDecision() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await call("POST", { title, detail: detail || undefined, neededBy: neededBy || undefined });
    setBusy(false);
    if (err) return setError(err);
    setTitle("");
    setDetail("");
    setNeededBy("");
    setDone(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What needs deciding</span>
        <input required minLength={5} maxLength={200} value={title} onChange={(e) => { setDone(false); setTitle(e.target.value); }} style={field} placeholder="Approve the new lab price list" />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What {PRINCIPAL} needs to know</span>
        <textarea rows={3} maxLength={2000} value={detail} onChange={(e) => setDetail(e.target.value)} style={{ ...field, resize: "vertical" }} placeholder="The options, the cost, and what you suggest" />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>Needed by</span>
        <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} style={field} />
      </label>
      {error && <p style={{ color: WARN, fontSize: 14.5, margin: 0 }}>{error}</p>}
      {done && <p style={{ color: SECOND, fontWeight: 600, fontSize: 15, margin: 0 }}>Sent to {PRINCIPAL}. It stays on her page until she answers.</p>}
      <button type="submit" disabled={busy} style={{ ...button(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Sending…" : `Send to ${PRINCIPAL}`}</button>
    </form>
  );
}

export interface DecisionRow {
  id: string;
  title: string;
  detail: string | null;
  raisedBy: string | null;
  age: string;
  ageDays: number;
  neededBy: string | null;
}

function Decision({ d, canDecide }: { d: DecisionRow; canDecide: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(action: "decide" | "decline") {
    setBusy(true);
    setError(null);
    const err = await call("PATCH", { id: d.id, action, decision: text || undefined });
    setBusy(false);
    if (err) return setError(err);
    router.refresh();
  }

  const late = d.ageDays >= 3;
  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderLeft: `4px solid ${late ? WARN : ACCENT}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div style={{ color: INK, fontWeight: 650, fontSize: 16 }}>{d.title}</div>
        <div style={{ color: late ? WARN : MUTED, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Waiting {d.age}</div>
      </div>
      <div style={{ color: MUTED, fontSize: 13.5, marginTop: 4 }}>
        {d.raisedBy ? `From ${d.raisedBy}` : "From the team"}
        {d.neededBy ? ` · needed by ${d.neededBy}` : ""}
      </div>
      {d.detail && <p style={{ color: "#1F2937", fontSize: 15, lineHeight: 1.6, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{d.detail}</p>}
      {canDecide && (
        open ? (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} style={{ ...field, resize: "vertical" }} placeholder="Your decision, for the person who asked" />
            {error && <p style={{ color: WARN, fontSize: 14, margin: 0 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={() => go("decide")} style={button(true)}>Decided</button>
              <button type="button" disabled={busy} onClick={() => go("decline")} style={button(false)}>Not now</button>
              <button type="button" onClick={() => setOpen(false)} style={{ ...button(false), border: "none", color: MUTED }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setOpen(true)} style={{ ...button(false), marginTop: 12 }}>Answer</button>
        )
      )}
    </div>
  );
}

/** What is waiting on the principal, oldest first, each with its age. */
export function DecisionList({ rows, canDecide }: { rows: DecisionRow[]; canDecide: boolean }) {
  if (rows.length === 0) {
    return <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Nothing is waiting on {PRINCIPAL}.</p>;
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((d) => <Decision key={d.id} d={d} canDecide={canDecide} />)}
    </div>
  );
}
