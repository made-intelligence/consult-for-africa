"use client";

import { useCallback, useEffect, useState } from "react";
import { MEDLYFE_BRAND as MB } from "@/lib/lyfe";

type Q = { id: string; text: string; askerName: string | null; forWhom: string | null; votes: number; answered: boolean };

const VOTED_KEY = "ageless-live-voted";

function readVoted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** The guest's phone: ask a question, vote for the ones you want answered. */
export default function LiveApp({ speakers }: { speakers: string[] }) {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [voted, setVoted] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [forWhom, setForWhom] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/lyfe/live", { cache: "no-store" });
      const j = await r.json();
      if (j.ok) setQuestions(j.questions);
    } catch {
      // The next poll will try again.
    }
  }, []);

  useEffect(() => {
    setVoted(readVoted());
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);

  async function post(body: object) {
    const r = await fetch("/api/lyfe/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (j.questions) setQuestions(j.questions);
    return { ok: r.ok, error: j.error as string | undefined };
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (busy || text.trim().length < 5) return;
    setBusy(true);
    setNote(null);
    const res = await post({ action: "ask", text, name: name || undefined, forWhom: forWhom || undefined });
    setBusy(false);
    if (res.ok) {
      setText("");
      setNote("Thank you. Your question is in.");
    } else setNote(res.error ?? "That did not go through. Please try again.");
  }

  async function vote(id: string) {
    if (voted.includes(id)) return;
    const next = [...voted, id];
    setVoted(next);
    try {
      localStorage.setItem(VOTED_KEY, JSON.stringify(next));
    } catch {
      // Private browsing: the vote still counts, it just is not remembered.
    }
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q)));
    await post({ action: "vote", id });
  }

  const open = questions.filter((q) => !q.answered);
  const answered = questions.filter((q) => q.answered);
  const field = "w-full rounded-lg px-4 py-3 text-[15px] outline-none";
  const fieldStyle = { background: MB.greenDeep, color: MB.white, border: `1px solid ${MB.greenSoft}` };

  return (
    <main className="min-h-screen px-4 pb-16 pt-8" style={{ background: MB.green, color: MB.white }}>
      <div className="mx-auto max-w-xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: MB.lime }}>
          AGELESS · Live questions
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight">Ask the speakers</h1>
        <p className="mt-2 text-[15px]" style={{ color: MB.mist }}>
          Post a question and vote for the ones you want answered. The chair takes the most popular first.
        </p>

        <form onSubmit={ask} className="mt-6 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Your question"
            className={field}
            style={fieldStyle}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={forWhom} onChange={(e) => setForWhom(e.target.value)} className={field} style={fieldStyle}>
              <option value="">For anyone on the panel</option>
              {speakers.map((s) => (
                <option key={s} value={s}>
                  For {s}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Your name (optional)"
              className={field}
              style={fieldStyle}
            />
          </div>
          <button
            type="submit"
            disabled={busy || text.trim().length < 5}
            className="w-full rounded-xl py-4 text-[15px] font-semibold disabled:opacity-50"
            style={{ background: MB.lime, color: MB.greenDeep }}
          >
            {busy ? "Sending" : "Ask"}
          </button>
          {note && (
            <p className="text-[14px]" style={{ color: MB.limeSoft }}>
              {note}
            </p>
          )}
        </form>

        <h2 className="mt-10 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: MB.lime }}>
          Questions ({open.length})
        </h2>
        <ul className="mt-3 space-y-3">
          {open.length === 0 && (
            <li className="text-[14px]" style={{ color: MB.greenSoft }}>
              No questions yet. Be the first.
            </li>
          )}
          {open.map((q) => (
            <QuestionCard key={q.id} q={q} voted={voted.includes(q.id)} onVote={() => vote(q.id)} />
          ))}
        </ul>

        {answered.length > 0 && (
          <>
            <h2 className="mt-10 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: MB.greenSoft }}>
              Answered ({answered.length})
            </h2>
            <ul className="mt-3 space-y-3 opacity-60">
              {answered.map((q) => (
                <QuestionCard key={q.id} q={q} voted={true} onVote={() => {}} />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

function QuestionCard({ q, voted, onVote }: { q: Q; voted: boolean; onVote: () => void }) {
  return (
    <li className="flex gap-3 rounded-xl p-4" style={{ background: MB.greenDeep }}>
      <button
        onClick={onVote}
        disabled={voted}
        aria-label={voted ? "You voted for this" : "Vote for this question"}
        className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg py-2 text-[13px] font-semibold"
        style={{
          background: voted ? MB.lime : "transparent",
          color: voted ? MB.greenDeep : MB.lime,
          border: `1px solid ${MB.lime}`,
        }}
      >
        <span aria-hidden>▲</span>
        <span>{q.votes}</span>
      </button>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug" style={{ overflowWrap: "anywhere" }}>
          {q.text}
        </p>
        <p className="mt-1 text-[12px]" style={{ color: MB.greenSoft }}>
          {[q.askerName, q.forWhom ? `for ${q.forWhom}` : null].filter(Boolean).join(" · ") || "Anonymous"}
        </p>
      </div>
    </li>
  );
}
