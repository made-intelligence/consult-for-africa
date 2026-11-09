"use client";

import { useState } from "react";

const INK = "var(--staff-ink, #4A2C4F)";
const SECOND = "var(--staff-second, #4F7F73)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

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

/**
 * Report a near miss or something broken. Your name is not attached unless you
 * type it. Goes to the leadership register, where every report gets an owner
 * and an end.
 */
export default function ReportIssue({ endpoint }: { endpoint: string }) {
  const [kind, setKind] = useState<"NEAR_MISS" | "BROKEN">("NEAR_MISS");
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [reached, setReached] = useState<"" | "Yes" | "No" | "Not sure">("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, what, why: why || undefined, reachedPatient: reached || undefined, name: name || undefined }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => null))?.error ?? "That did not send. Please try again.");
      } else {
        setDone(true);
        setWhat("");
        setWhy("");
        setReached("");
        setName("");
      }
    } catch {
      setError("No connection. Check your signal and try again.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div>
        <p style={{ color: SECOND, fontWeight: 600, fontSize: 16, margin: 0 }}>Thank you. It has gone to the leadership team.</p>
        <button type="button" onClick={() => setDone(false)} style={{ marginTop: 12, background: "none", border: "none", color: INK, fontWeight: 600, padding: 0, cursor: "pointer", fontSize: 15 }}>
          Report something else
        </button>
      </div>
    );
  }

  const pill = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14.5, fontWeight: 600, cursor: "pointer",
    border: `1px solid ${active ? INK : LINE}`, background: active ? INK : "#fff", color: active ? "#fff" : INK,
  });

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setKind("NEAR_MISS")} style={pill(kind === "NEAR_MISS")}>A near miss or incident</button>
        <button type="button" onClick={() => setKind("BROKEN")} style={pill(kind === "BROKEN")}>Something broken</button>
      </div>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What happened</span>
        <textarea required minLength={5} rows={3} value={what} onChange={(e) => setWhat(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What made it possible</span>
        <span style={{ color: MUTED, fontSize: 13 }}>Optional. The system, not the person.</span>
        <textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </label>
      {kind === "NEAR_MISS" && (
        <div style={{ display: "grid", gap: 6 }}>
          <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>Did it reach a patient?</span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["No", "Yes", "Not sure"] as const).map((o) => (
              <button key={o} type="button" onClick={() => setReached(reached === o ? "" : o)} style={pill(reached === o)}>{o}</button>
            ))}
          </div>
        </div>
      )}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>Your name</span>
        <span style={{ color: MUTED, fontSize: 13 }}>Optional. Leave it blank and nobody will know it was you.</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} style={field} />
      </label>
      {error && <p style={{ color: "#B0392B", fontSize: 14.5, margin: 0 }}>{error}</p>}
      <button type="submit" disabled={busy} style={{ background: INK, color: "#fff", border: "none", borderRadius: 10, padding: "14px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
