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

  const now = Object.fromEntries(thisWeek.map((r) => [r.measure, r]));
  const prev = Object.fromEntries(lastWeek.map((r) => [r.measure, r]));

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
      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        Week {period.split("-W")[1]}. A dash means nobody has counted it yet this week.
      </p>
    </div>
  );
}
