"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MEASURES, movement } from "@/lib/havenScoreboard";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const GOOD = "#15803D";
const BAD = "#7A2F2F";

export interface ScoreRow {
  measure: string;
  value: string;
  movedBy: string | null;
  agreedBy?: string | null;
  enteredByMe?: boolean;
}

export default function Scoreboard({
  thisWeek,
  lastWeek,
  canEdit,
  period,
}: {
  thisWeek: ScoreRow[];
  lastWeek: ScoreRow[];
  canEdit: boolean;
  period: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [movedBy, setMovedBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const now = Object.fromEntries(thisWeek.map((r) => [r.measure, r]));
  const prev = Object.fromEntries(lastWeek.map((r) => [r.measure, r]));

  async function agree(measure: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/haven-staff/scoreboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measure, period }),
      });
      if (res.ok) router.refresh();
      else setErr((await res.json().catch(() => null))?.error ?? "That did not go through.");
    } catch { setErr("That did not go through."); }
    setBusy(false);
  }

  async function save(measure: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/haven-staff/scoreboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measure, value, movedBy, period }),
      });
      if (res.ok) { setEditing(null); setValue(""); setMovedBy(""); router.refresh(); }
    } catch { /* keep what they typed */ }
    setBusy(false);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {MEASURES.map((m) => {
        const cur = now[m.key];
        const was = prev[m.key];
        const delta = cur ? movement(cur.value, was?.value) : null;
        const good = delta === null || delta === 0 ? null : (m.better === "UP" ? delta > 0 : delta < 0);

        return (
          <div key={m.key} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{m.label}</div>
                {!cur && <div style={{ color: MUTED, fontSize: 13.5, marginTop: 3 }}>{m.howToCount}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: cur ? NAVY : MUTED, fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                  {cur ? `${cur.value}${m.suffix ?? ""}` : "—"}
                </div>
                {delta !== null && delta !== 0 && (
                  <div style={{ color: good ? GOOD : BAD, fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                    {delta > 0 ? "+" : ""}{delta} on last week
                  </div>
                )}
                {delta === 0 && <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>no change</div>}
              </div>
            </div>

            {cur && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {cur.agreedBy ? (
                  <span style={{ color: GOOD, fontSize: 13, fontWeight: 650 }}>
                    Agreed by {cur.agreedBy}
                  </span>
                ) : (
                  <>
                    <span style={{ color: MUTED, fontSize: 13 }}>Not agreed yet</span>
                    {canEdit && !cur.enteredByMe && (
                      <button onClick={() => agree(m.key)} disabled={busy}
                        style={{ background: "none", border: `1px solid ${LINE}`, borderRadius: 999, color: TEAL, fontWeight: 650, fontSize: 13.5, padding: "6px 14px", cursor: "pointer" }}>
                        I agree this
                      </button>
                    )}
                    {canEdit && cur.enteredByMe && (
                      <span style={{ color: MUTED, fontSize: 13 }}>Somebody else has to agree it</span>
                    )}
                  </>
                )}
              </div>
            )}

            {cur?.movedBy && (
              <p style={{ background: "#F1F7FA", borderLeft: `3px solid ${TEAL}`, color: "#1F2937", fontSize: 14.5, lineHeight: 1.55, margin: "12px 0 0", padding: "10px 12px", borderRadius: 8 }}>
                {cur.movedBy}
              </p>
            )}

            {canEdit && (editing === m.key ? (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder={m.howToCount}
                  style={{ width: "100%", padding: "11px 12px", fontSize: 16, border: `1px solid ${LINE}`, borderRadius: 10, boxSizing: "border-box", fontFamily: "inherit" }} />
                <textarea rows={2} value={movedBy} onChange={(e) => setMovedBy(e.target.value)}
                  placeholder="What did we do that moved it? This is published to everyone with the number."
                  style={{ width: "100%", padding: "11px 12px", fontSize: 16, border: `1px solid ${LINE}`, borderRadius: 10, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button disabled={busy || !value.trim()} onClick={() => save(m.key)}
                    style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", opacity: busy || !value.trim() ? 0.5 : 1 }}>
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", color: MUTED, fontSize: 14.5, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEditing(m.key); setValue(cur?.value ?? ""); setMovedBy(cur?.movedBy ?? ""); }}
                style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, fontSize: 14, padding: "12px 0 0", cursor: "pointer" }}>
                {cur ? "Update this week" : "Enter this week"}
              </button>
            ))}
          </div>
        );
      })}
      {err && <p style={{ color: BAD, fontSize: 14, margin: 0 }}>{err}</p>}
      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        Week {period.split("-W")[1]}. A dash means nobody has counted it yet this week. Every figure
        needs a second person to agree it, and it cannot be whoever typed it in.
      </p>
    </div>
  );
}
