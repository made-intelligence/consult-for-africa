"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const TEAL = "#1F7A8C";
const RED = "#B0392B";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export interface FixRow { id: string; code: string; title: string; detail: string; doneAt: string | null; doneBy: string | null; doneNote: string | null }

export default function TariffFixes({ fixes, canMark }: { fixes: FixRow[]; canMark: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState<Record<string, string>>({});
  async function mark(id: string, done: boolean) {
    await fetch("/api/haven-staff/tariff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fixId: id, done, note: note[id] }) });
    router.refresh();
  }
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {fixes.map((f) => (
        <div key={f.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderLeft: `4px solid ${f.doneAt ? TEAL : RED}`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: NAVY, fontWeight: 650, textDecoration: f.doneAt ? "line-through" : undefined }}>{f.title}</div>
              <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{f.detail}</div>
              {f.doneAt && (
                <div style={{ color: TEAL, fontSize: 12.5, marginTop: 4 }}>
                  Done {new Date(f.doneAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{f.doneBy ? ` by ${f.doneBy}` : ""}{f.doneNote ? `: ${f.doneNote}` : ""}
                </div>
              )}
            </div>
            {canMark && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {!f.doneAt && (
                  <input
                    aria-label={`Note for ${f.title}`}
                    placeholder="What was done (optional)"
                    value={note[f.id] ?? ""}
                    onChange={(e) => setNote({ ...note, [f.id]: e.target.value })}
                    style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: "7px 9px", fontSize: 13, width: 200 }}
                  />
                )}
                <button
                  onClick={() => mark(f.id, !f.doneAt)}
                  style={{ background: f.doneAt ? "#fff" : NAVY, color: f.doneAt ? NAVY : "#fff", border: `1px solid ${NAVY}`, borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13 }}
                >
                  {f.doneAt ? "Reopen" : "Mark done"}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
