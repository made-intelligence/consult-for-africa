"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "var(--staff-ink, #0B3C5D)";
const TEAL = "var(--staff-second, #1F7A8C)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export interface RotaPerson {
  id: string;
  name: string;
  position: string;
  codes: string[];
}

/**
 * The rota for one department and one month: a person per row, a day per
 * column, the hospital's own shift letters in the cells. Blank is a day off.
 *
 * Paste is the fast path. Every rota we saw in the audit lived in Excel or
 * Word, so copying the rows straight out of the sheet (name, then one cell per
 * day) fills the grid, and the grid is there to check and correct it.
 */
export default function RotaGrid({
  department,
  month,
  days,
  weekdays,
  people,
  alreadyIn,
  endpoint = "/api/haven-staff/rota",
}: {
  department: string;
  month: string;
  days: number;
  weekdays: string[];
  people: RotaPerson[];
  alreadyIn: boolean;
  endpoint?: string;
}) {
  const router = useRouter();
  const [grid, setGrid] = useState<Record<string, string[]>>(
    Object.fromEntries(people.map((p) => [p.id, Array.from({ length: days }, (_, i) => p.codes[i] ?? "")]))
  );
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set(id: string, i: number, v: string) {
    setGrid((g) => ({ ...g, [id]: g[id].map((c, j) => (j === i ? v.toUpperCase().slice(0, 3) : c)) }));
  }

  function applyPaste() {
    const norm = (s: string) => s.toLowerCase().replace(/^(dr|mr|mrs|ms|miss|nurse)\.?\s+/, "").replace(/[^a-z ]/g, "").trim();
    let matched = 0;
    const unmatched: string[] = [];
    const next = { ...grid };
    for (const line of paste.split(/\r?\n/)) {
      const cells = line.split("\t");
      if (cells.length < 2 || !cells[0].trim()) continue;
      const who = norm(cells[0]);
      const p = people.find((x) => {
        const n = norm(x.name);
        return n === who || n.split(" ").every((part) => who.includes(part)) || who.split(" ").every((part) => part && n.includes(part));
      });
      if (!p) { unmatched.push(cells[0].trim()); continue; }
      next[p.id] = Array.from({ length: days }, (_, i) => (cells[i + 1] ?? "").trim().toUpperCase().slice(0, 3));
      matched++;
    }
    setGrid(next);
    setMsg(`${matched} ${matched === 1 ? "row" : "rows"} filled.${unmatched.length ? ` Not matched to anyone here: ${unmatched.join(", ")}.` : ""} Check the grid, then save.`);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department, month, rows: people.map((p) => ({ staffId: p.id, codes: grid[p.id] })) }),
    });
    setSaving(false);
    if (!res.ok) { setMsg("That did not save. Try again, or tell us on the staff page."); return; }
    const d = await res.json();
    setMsg(`Saved: ${d.shifts} shifts for ${d.people} people. Blank days now count as days off, and nobody is chased on them.`);
    router.refresh();
  }

  const cell: React.CSSProperties = { border: `1px solid ${LINE}`, width: 34, minWidth: 34, height: 32, textAlign: "center", fontSize: 13, padding: 0 };

  return (
    <div>
      {!alreadyIn && (
        <p style={{ color: "#B0392B", fontSize: 14.5, margin: "0 0 14px", fontWeight: 600 }}>
          Not in yet. Until it is saved, everyone in this department is chased on their days off.
        </p>
      )}
      <div style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 12, background: "#fff" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "#fff", textAlign: "left", padding: "6px 10px", minWidth: 150, color: NAVY }}>Name</th>
              {Array.from({ length: days }, (_, i) => (
                <th key={i} style={{ padding: "4px 0", color: weekdays[i] === "S" ? TEAL : MUTED, fontWeight: 600, fontSize: 11.5 }}>
                  {i + 1}
                  <div style={{ fontWeight: 400 }}>{weekdays[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td style={{ position: "sticky", left: 0, background: "#fff", padding: "4px 10px", borderTop: `1px solid ${LINE}` }}>
                  <div style={{ color: NAVY, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: MUTED, fontSize: 11.5 }}>{p.position}</div>
                </td>
                {grid[p.id].map((c, i) => (
                  <td key={i} style={{ padding: 0 }}>
                    <input
                      aria-label={`${p.name}, day ${i + 1}`}
                      value={c}
                      onChange={(e) => set(p.id, i, e.target.value)}
                      style={{ ...cell, background: c ? "#EEF6F8" : "#fff", color: NAVY, fontWeight: 600 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: MUTED, fontSize: 13.5, margin: "10px 0 0" }}>
        Type your own shift letters (for example D, N, M, A). Leave a day blank, or type O, for a day off.
      </p>

      <details style={{ marginTop: 18 }}>
        <summary style={{ color: TEAL, fontWeight: 600, cursor: "pointer" }}>Paste from Excel instead</summary>
        <p style={{ color: MUTED, fontSize: 14, margin: "8px 0" }}>
          In your rota sheet, select the rows from the name to the last day, copy, and paste here. One person per row,
          their name first, then one cell per day starting from the 1st.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={6}
          style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, fontSize: 13, fontFamily: "monospace" }}
        />
        <button onClick={applyPaste} style={{ marginTop: 8, background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 10, padding: "9px 16px", fontWeight: 600 }}>
          Fill the grid
        </button>
      </details>

      <button
        onClick={save}
        disabled={saving}
        style={{ marginTop: 20, background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "13px 24px", fontWeight: 700, fontSize: 15, opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "Saving" : alreadyIn ? "Save changes" : "Save the rota"}
      </button>
      {msg && <p style={{ color: NAVY, fontSize: 14.5, marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
