"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export interface TodayTask {
  id: string;
  title: string;
  why: string;
  done: boolean;
  flagged: boolean;
}

/**
 * The tick. Until this existed the whole task layer was a list of things nobody
 * could finish, which is worse than no list: it teaches people the system does
 * not work and that lesson does not wear off.
 *
 * Optimistic, because this is opened on a phone on hospital wifi. A tick that
 * waits on the network looks broken, and the second time it looks broken the
 * person stops ticking.
 */
export default function TodayTasks({ tasks }: { tasks: TodayTask[] }) {
  const router = useRouter();
  const [local, setLocal] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const isDone = (t: TodayTask) => local[t.id] ?? t.done;
  const doneCount = tasks.filter(isDone).length;

  async function toggle(t: TodayTask) {
    const next = !isDone(t);
    setLocal((s) => ({ ...s, [t.id]: next }));
    setFailed((s) => ({ ...s, [t.id]: false }));
    try {
      const res = await fetch("/api/haven-staff/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: t.id, done: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // Put it back and say so. Silently reverting is how somebody believes
      // they recorded a crash trolley check that was never recorded.
      setLocal((s) => ({ ...s, [t.id]: !next }));
      setFailed((s) => ({ ...s, [t.id]: true }));
    }
  }

  if (tasks.length === 0) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 6, background: LINE, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${(doneCount / tasks.length) * 100}%`, height: "100%", background: TEAL, transition: "width .2s" }} />
        </div>
        <span style={{ color: doneCount === tasks.length ? TEAL : MUTED, fontSize: 13.5, fontWeight: 650, whiteSpace: "nowrap" }}>
          {doneCount} of {tasks.length}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {tasks.map((t) => {
          const done = isDone(t);
          return (
            <div key={t.id} style={{
              display: "flex", gap: 13, alignItems: "flex-start",
              background: "#fff", border: `1px solid ${LINE}`,
              borderLeft: `4px solid ${done ? TEAL : t.flagged ? "#B0392B" : GOLD}`,
              borderRadius: 12, padding: 14,
            }}>
              <button
                onClick={() => toggle(t)}
                aria-label={done ? `Mark ${t.title} not done` : `Mark ${t.title} done`}
                style={{
                  flexShrink: 0, width: 26, height: 26, borderRadius: 7, cursor: "pointer",
                  border: `2px solid ${done ? TEAL : "#CBD5E1"}`,
                  background: done ? TEAL : "#fff", color: "#fff",
                  fontSize: 15, lineHeight: 1, padding: 0, marginTop: 1,
                }}
              >
                {done ? "✓" : ""}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: done ? MUTED : NAVY, fontWeight: 650, fontSize: 15.5,
                  textDecoration: done ? "line-through" : "none",
                }}>
                  {t.title}
                </div>
                {!done && <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5, marginTop: 3 }}>{t.why}</div>}
                {t.flagged && !done && (
                  <div style={{ color: "#B0392B", fontSize: 13, fontWeight: 650, marginTop: 4 }}>
                    Not recorded yet
                  </div>
                )}
                {failed[t.id] && (
                  <div style={{ color: "#B0392B", fontSize: 13, marginTop: 4 }}>
                    That did not save. Check your signal and tap again.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
