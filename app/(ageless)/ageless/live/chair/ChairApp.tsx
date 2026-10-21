"use client";

import { useCallback, useEffect, useState } from "react";
import { MEDLYFE_BRAND as MB } from "@/lib/lyfe";

type Q = {
  id: string;
  text: string;
  askerName: string | null;
  forWhom: string | null;
  votes: number;
  answered: boolean;
  hidden: boolean;
};

const PIN_KEY = "ageless-chair-pin";

export default function ChairApp() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const call = useCallback(async (body: object, usePin: string) => {
    try {
      const r = await fetch("/api/lyfe/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, pin: usePin }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? "That did not work.");
        if (r.status === 401) {
          setAuthed(false);
          try {
            sessionStorage.removeItem(PIN_KEY);
          } catch {}
        }
        return;
      }
      setError(null);
      setAuthed(true);
      setQuestions(j.questions);
    } catch {
      setError("No connection. Trying again.");
    }
  }, []);

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(PIN_KEY) ?? "";
    } catch {}
    if (saved) {
      setPin(saved);
      call({ action: "chair" }, saved);
    }
  }, [call]);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => call({ action: "chair" }, pin), 5000);
    return () => clearInterval(t);
  }, [authed, pin, call]);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      sessionStorage.setItem(PIN_KEY, pin);
    } catch {}
    call({ action: "chair" }, pin);
  }

  const mark = (id: string, set: string) => call({ action: "mark", id, set }, pin);

  if (!authed) {
    return (
      <main className="min-h-screen px-4 pt-16" style={{ background: MB.green, color: MB.white }}>
        <form onSubmit={signIn} className="mx-auto max-w-sm space-y-4">
          <h1 className="text-[24px] font-semibold">AGELESS · Chair</h1>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            placeholder="PIN"
            className="w-full rounded-lg px-4 py-3 text-[18px] outline-none"
            style={{ background: MB.greenDeep, color: MB.white, border: `1px solid ${MB.greenSoft}` }}
          />
          <button className="w-full rounded-xl py-4 font-semibold" style={{ background: MB.lime, color: MB.greenDeep }}>
            Open
          </button>
          {error && <p style={{ color: MB.limeSoft }}>{error}</p>}
        </form>
      </main>
    );
  }

  const open = questions.filter((q) => !q.answered && !q.hidden);
  const done = questions.filter((q) => q.answered || q.hidden);

  return (
    <main className="min-h-screen px-4 pb-16 pt-6" style={{ background: MB.green, color: MB.white }}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[22px] font-semibold">Questions, most votes first</h1>
          <span className="text-[13px]" style={{ color: MB.greenSoft }}>
            {open.length} waiting
          </span>
        </div>
        {error && <p className="mt-2 text-[13px]" style={{ color: MB.limeSoft }}>{error}</p>}

        <ul className="mt-4 space-y-3">
          {open.length === 0 && <li style={{ color: MB.greenSoft }}>Nothing waiting.</li>}
          {open.map((q, i) => (
            <li key={q.id} className="rounded-xl p-4" style={{ background: i === 0 ? MB.greenDark : MB.greenDeep }}>
              <div className="flex items-start gap-3">
                <span className="w-10 shrink-0 text-center text-[20px] font-semibold" style={{ color: MB.lime }}>
                  {q.votes}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] leading-snug" style={{ overflowWrap: "anywhere" }}>{q.text}</p>
                  <p className="mt-1 text-[13px]" style={{ color: MB.greenSoft }}>
                    {[q.askerName, q.forWhom ? `for ${q.forWhom}` : null].filter(Boolean).join(" · ") || "Anonymous"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 pl-[52px]">
                <button
                  onClick={() => mark(q.id, "answered")}
                  className="rounded-lg px-4 py-2 text-[14px] font-semibold"
                  style={{ background: MB.lime, color: MB.greenDeep }}
                >
                  Answered
                </button>
                <button
                  onClick={() => mark(q.id, "hidden")}
                  className="rounded-lg px-4 py-2 text-[14px]"
                  style={{ border: `1px solid ${MB.greenSoft}`, color: MB.mist }}
                >
                  Hide
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button onClick={() => setShowDone((s) => !s)} className="mt-8 text-[13px] underline" style={{ color: MB.greenSoft }}>
          {showDone ? "Hide" : "Show"} answered and hidden ({done.length})
        </button>
        {showDone && (
          <ul className="mt-3 space-y-2">
            {done.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 rounded-lg p-3 text-[14px]" style={{ background: MB.greenDeep }}>
                <span className="min-w-0" style={{ overflowWrap: "anywhere", color: q.hidden ? MB.greenSoft : MB.mist }}>
                  {q.hidden ? "Hidden: " : ""}
                  {q.text}
                </span>
                <button
                  onClick={() => mark(q.id, q.hidden ? "shown" : "unanswered")}
                  className="shrink-0 rounded-lg px-3 py-1 text-[13px]"
                  style={{ border: `1px solid ${MB.greenSoft}`, color: MB.mist }}
                >
                  {q.hidden ? "Show" : "Back to queue"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
