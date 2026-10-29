"use client";

import { useCallback, useEffect, useState } from "react";
import type { publicView } from "@/lib/cadreHealth/internship/state";
import { MATCH_LABEL } from "@/lib/cadreHealth/internship/programme";

type View = ReturnType<typeof publicView>;

const card = { border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" };

export default function InternshipApplication({ token, initial, questionCount, minutes }: { token: string; initial: View; questionCount: number; minutes: number }) {
  const [view, setView] = useState<View>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`/api/cadre/internships/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        if (data.status) setView(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [token],
  );

  const a = view.attempt;

  if (a && !a.submitted) return <Paper token={token} view={view} onDone={setView} />;

  return (
    <div className="mt-2 space-y-6">
      <h1 className="font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.4rem, 3.2vw, 1.9rem)" }}>
        {view.firstName}, {a ? "your result and your centres" : "your assessment is ready when you are"}
      </h1>

      {!a && (
        <div className="rounded-2xl bg-white p-6 sm:p-8" style={card}>
          <p className="text-sm text-gray-700 leading-relaxed">
            {questionCount} multiple-choice questions in {minutes} minutes. You sit it once. The clock starts when you press the button and keeps running if you close the page, so start when you have a quiet place and a steady connection. Your answers save as you go.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-gray-600 list-disc pl-5">
            <li>Have a calculator ready for the drug calculations.</li>
            <li>Choose the single best answer. There is no penalty for a wrong answer.</li>
            <li>Your result goes only to the centres you chose.</li>
          </ul>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button onClick={() => post({ action: "start" })} disabled={busy} className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
            {busy ? "Starting..." : "Start the assessment"}
          </button>
        </div>
      )}

      {a?.submitted && (
        <div className="rounded-2xl bg-white p-6 sm:p-8" style={card}>
          <p className="text-sm text-gray-500">Your score</p>
          <p className="text-4xl font-bold text-[#0B3C5D]">{a.score}%</p>
          <div className="mt-5 space-y-2">
            {a.sections.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{s.label}</span>
                  <span className="tabular-nums">{s.correct} of {s.total}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full" style={{ width: `${(s.correct / Math.max(1, s.total)) * 100}%`, background: "#0B3C5D" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 sm:p-8" style={card}>
        <p className="text-base font-semibold text-gray-900">Your centres</p>
        <ul className="mt-4 space-y-2">
          {view.preferences.map((p) => (
            <li key={p.id} className="rounded-lg px-3 py-3" style={{ border: "1px solid #E8EBF0" }}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-800">
                  <span className="mr-2 text-xs font-bold text-[#0B3C5D]">{p.rank}</span>
                  {p.centre}
                </span>
                <span className="shrink-0 text-xs text-gray-500">{p.participating ? MATCH_LABEL[p.status] : "Not yet participating"}</span>
              </div>
              {p.status === "OFFERED" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => post({ action: "accept", preferenceId: p.id })} disabled={busy} className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
                    Accept this place
                  </button>
                  <button onClick={() => post({ action: "decline", preferenceId: p.id })} disabled={busy} className="flex-1 rounded-lg py-2 text-sm font-semibold text-gray-700 disabled:opacity-50" style={{ border: "1px solid #E8EBF0" }}>
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400">Accepting one place withdraws you from your other choices, so those centres can offer the place to someone else.</p>
        {error && a && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function Paper({ token, view, onDone }: { token: string; view: View; onDone: (v: View) => void }) {
  const a = view.attempt!;
  const [answers, setAnswers] = useState<Record<string, number>>(a.answers);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(() => Math.max(0, new Date(a.deadlineAt).getTime() - Date.now()));
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const submit = useCallback(async () => {
    setSubmitting(true);
    const res = await fetch(`/api/cadre/internships/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit" }) });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.status) onDone(data);
    else {
      // The server closes an expired paper itself; reloading shows the result.
      const fresh = await fetch(`/api/cadre/internships/${token}`).then((r) => r.json()).catch(() => null);
      if (fresh?.status) onDone(fresh);
      setSubmitting(false);
    }
  }, [token, onDone]);

  useEffect(() => {
    const t = setInterval(() => {
      const ms = Math.max(0, new Date(a.deadlineAt).getTime() - Date.now());
      setLeft(ms);
      if (ms === 0) {
        clearInterval(t);
        submit();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [a.deadlineAt, submit]);

  async function choose(qid: string, choice: number) {
    setAnswers((p) => ({ ...p, [qid]: choice }));
    setSaveError("");
    const res = await fetch(`/api/cadre/internships/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "answer", questionId: qid, choice }) }).catch(() => null);
    if (!res || !res.ok) setSaveError("That answer did not save. Check your connection and choose it again.");
  }

  const q = a.questions[index];
  const answered = Object.keys(answers).length;
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="mt-2">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-[#F8F9FB] px-4 py-3 sm:-mx-6 sm:px-6" style={{ borderBottom: "1px solid #E8EBF0" }}>
        <span className="text-sm text-gray-600 tabular-nums">Question {index + 1} of {a.questions.length} · {answered} answered</span>
        <span className="rounded-lg px-3 py-1 text-sm font-bold tabular-nums" style={{ background: left < 5 * 60000 ? "#FEE2E2" : "rgba(11,60,93,0.06)", color: left < 5 * 60000 ? "#B91C1C" : "#0B3C5D" }}>
          {mm}:{ss}
        </span>
      </div>

      <div className="rounded-2xl bg-white p-6 sm:p-8" style={card}>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{q.section}</p>
        <p className="mt-2 text-base font-medium text-gray-900 leading-relaxed">{q.stem}</p>
        <div className="mt-5 space-y-2">
          {q.options.map((o, i) => {
            const on = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => choose(q.id, i)}
                className="flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left text-sm text-gray-800"
                style={{ border: `1px solid ${on ? "#0B3C5D" : "#E8EBF0"}`, background: on ? "rgba(11,60,93,0.05)" : "#fff" }}
              >
                <span className="font-semibold text-gray-400">{"ABCD"[i]}</span>
                {o}
              </button>
            );
          })}
        </div>
        {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
        <div className="mt-6 flex gap-2">
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-30" style={{ border: "1px solid #E8EBF0" }}>
            Back
          </button>
          {index < a.questions.length - 1 ? (
            <button onClick={() => setIndex((i) => i + 1)} className="flex-1 rounded-lg py-2 text-sm font-semibold text-white" style={{ background: "#0B3C5D" }}>
              Next
            </button>
          ) : (
            <button onClick={() => setConfirming(true)} className="flex-1 rounded-lg py-2 text-sm font-semibold text-white" style={{ background: "#0B3C5D" }}>
              Finish
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {a.questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIndex(i)}
            className="h-8 w-8 rounded text-xs font-semibold tabular-nums"
            style={{ background: i === index ? "#0B3C5D" : answers[x.id] !== undefined ? "rgba(11,60,93,0.12)" : "#fff", color: i === index ? "#fff" : "#374151", border: "1px solid #E8EBF0" }}
            aria-label={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {confirming && (
        <div className="mt-4 rounded-2xl bg-white p-5" style={card}>
          <p className="text-sm text-gray-800">
            You have answered {answered} of {a.questions.length}. Once you submit you cannot change an answer.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setConfirming(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700" style={{ border: "1px solid #E8EBF0" }}>
              Keep working
            </button>
            <button onClick={submit} disabled={submitting} className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
              {submitting ? "Submitting..." : "Submit my answers"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
