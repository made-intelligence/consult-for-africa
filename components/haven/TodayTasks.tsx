"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_PROMPTS, NOTHING_THIS_WEEK } from "@/lib/havenTaskPrompts";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export interface TodayTask {
  id: string;
  code: string;
  title: string;
  why: string;
  cadence: "EVERY_SHIFT" | "DAILY" | "WEEKLY" | "MONTHLY";
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
// Said on every row because a weekly task ticked on Tuesday is still ticked on
// Friday, and under a heading that only said "Today" that read as a page that
// had not noticed three days had passed.
const WHEN: Record<TodayTask["cadence"], string> = {
  EVERY_SHIFT: "Every shift",
  DAILY: "Today",
  WEEKLY: "This week, resets Monday",
  MONTHLY: "This month",
};

export default function TodayTasks({ tasks }: { tasks: TodayTask[] }) {
  const router = useRouter();
  const [local, setLocal] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, string | false>>({});
  // Which answer box is open, and what is in it. Only tasks in TASK_PROMPTS
  // open one; every other task stays a single tap.
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const isDone = (t: TodayTask) => local[t.id] ?? t.done;
  const doneCount = tasks.filter(isDone).length;

  function tap(t: TodayTask) {
    if (!isDone(t) && TASK_PROMPTS[t.code]) {
      setOpen(open === t.id ? null : t.id);
      return;
    }
    void save(t, !isDone(t));
  }

  async function save(t: TodayTask, next: boolean, note?: string) {
    setLocal((s) => ({ ...s, [t.id]: next }));
    setFailed((s) => ({ ...s, [t.id]: false }));
    try {
      const res = await fetch("/api/haven-staff/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: t.id, done: next, note }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(res.status === 422 ? body?.error : undefined);
      }
      setOpen(null);
      router.refresh();
    } catch (e) {
      // Put it back and say so. Silently reverting is how somebody believes
      // they recorded a crash trolley check that was never recorded.
      setLocal((s) => ({ ...s, [t.id]: !next }));
      setFailed((s) => ({ ...s, [t.id]: (e instanceof Error && e.message) || "That did not save. Check your signal and tap again." }));
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
                onClick={() => tap(t)}
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
                <div style={{ color: done ? MUTED : TEAL, fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>
                  {WHEN[t.cadence]}
                </div>
                {!done && <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5, marginTop: 3 }}>{t.why}</div>}
                {t.flagged && !done && (
                  <div style={{ color: "#B0392B", fontSize: 13, fontWeight: 650, marginTop: 4 }}>
                    Not recorded yet
                  </div>
                )}
                {open === t.id && !done && TASK_PROMPTS[t.code] && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: "block", color: NAVY, fontSize: 13.5, fontWeight: 650, marginBottom: 6 }}>
                      {TASK_PROMPTS[t.code].question}
                    </label>
                    <textarea
                      value={draft[t.id] ?? ""}
                      onChange={(e) => setDraft((s) => ({ ...s, [t.id]: e.target.value }))}
                      placeholder={TASK_PROMPTS[t.code].placeholder}
                      maxLength={500}
                      rows={3}
                      style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${LINE}`, borderRadius: 8, padding: 10, fontSize: 15, fontFamily: "inherit" }}
                    />
                    <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>
                      We share what changed because of it. We never share your name without asking you.
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => save(t, true, draft[t.id])}
                        style={{ background: TEAL, color: "#fff", border: 0, borderRadius: 8, padding: "9px 16px", fontSize: 14, fontWeight: 650, cursor: "pointer" }}
                      >
                        Send and tick
                      </button>
                      {TASK_PROMPTS[t.code].allowNothing && (
                        <button
                          onClick={() => save(t, true, NOTHING_THIS_WEEK)}
                          style={{ background: "#fff", color: NAVY, border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 16px", fontSize: 14, cursor: "pointer" }}
                        >
                          Nothing this week
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {failed[t.id] && (
                  <div style={{ color: "#B0392B", fontSize: 13, marginTop: 4 }}>
                    {failed[t.id]}
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
