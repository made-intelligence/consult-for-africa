"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Metric } from "@/lib/dailyReturn";
import { PRINCIPAL } from "@/lib/arabella-daily";

const INK = "var(--staff-ink, #4A2C4F)";
const SECOND = "var(--staff-second, #4F7F73)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  fontSize: 16, // 16px or iOS zooms on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#fff",
};

type Raw = Record<string, string>;

function initial(metrics: Metric[], values: Record<string, unknown>): Raw {
  const out: Raw = {};
  for (const m of metrics) {
    const v = values[m.code];
    out[m.code] = v === true ? "yes" : v === false ? "no" : v === undefined || v === null ? "" : String(v);
  }
  return out;
}

/**
 * One area's numbers for one day. Built for a phone at the end of a shift:
 * a box per number, numeric keypad where it is a number, yes or no as two
 * buttons, and one save. Blank means nobody counted, which is different from
 * zero, so nothing is filled in for them.
 */
export default function DailyReturnForm({
  endpoint,
  section,
  day,
  metrics,
  values,
  note,
}: {
  endpoint: string;
  section: string;
  day: string;
  metrics: Metric[];
  values: Record<string, unknown>;
  note: string | null;
}) {
  const router = useRouter();
  const [raw, setRaw] = useState<Raw>(() => initial(metrics, values));
  const [text, setText] = useState(note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (code: string, v: string) => {
    setSaved(false);
    setRaw((r) => ({ ...r, [code]: v }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, day, values: raw, note: text }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "That did not save. Please try again.");
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("No connection. Check your signal and try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      {metrics.map((m) => (
        <label key={m.code} style={{ display: "grid", gap: 6 }}>
          <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>{m.label}</span>
          {m.hint && <span style={{ color: MUTED, fontSize: 13 }}>{m.hint}</span>}
          {m.type === "yesno" ? (
            <span style={{ display: "flex", gap: 8 }}>
              {["yes", "no"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set(m.code, raw[m.code] === opt ? "" : opt)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${raw[m.code] === opt ? INK : LINE}`,
                    background: raw[m.code] === opt ? INK : "#fff",
                    color: raw[m.code] === opt ? "#fff" : INK,
                  }}
                >
                  {opt === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </span>
          ) : m.type === "text" ? (
            <input type="text" value={raw[m.code]} onChange={(e) => set(m.code, e.target.value)} style={field} maxLength={400} />
          ) : m.type === "clock" ? (
            <input type="time" value={raw[m.code]} onChange={(e) => set(m.code, e.target.value)} style={field} />
          ) : (
            <input
              type="text"
              inputMode={m.type === "naira" ? "decimal" : "numeric"}
              placeholder={m.type === "naira" ? "₦" : m.type === "minutes" ? "minutes" : ""}
              value={raw[m.code]}
              onChange={(e) => set(m.code, e.target.value)}
              style={field}
            />
          )}
        </label>
      ))}

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>Anything {PRINCIPAL} should know</span>
        <span style={{ color: MUTED, fontSize: 13 }}>Optional. One line is enough.</span>
        <textarea value={text} onChange={(e) => { setSaved(false); setText(e.target.value); }} rows={3} maxLength={1000} style={{ ...field, resize: "vertical" }} />
      </label>

      {error && (
        <p style={{ background: "#FBEEE9", color: "#7A2F2F", fontSize: 14.5, lineHeight: 1.6, padding: "12px 14px", borderRadius: 10, margin: 0 }}>{error}</p>
      )}
      {saved && <p style={{ color: SECOND, fontWeight: 600, fontSize: 15, margin: 0 }}>Saved. Thank you.</p>}

      <button
        type="submit"
        disabled={busy}
        style={{ background: INK, color: "#fff", border: "none", borderRadius: 10, padding: "14px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
