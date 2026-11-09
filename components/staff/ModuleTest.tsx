"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Each site's colours, from StaffShell's CSS variables. Haven's pages set none,
// so they fall back to Haven's navy and teal exactly as before.
const NAVY = "var(--staff-ink, #0B3C5D)";
const TEAL = "var(--staff-second, #1F7A8C)";

/** Haven's route, the original. Other sites pass their own. */
const HAVEN_API = "/api/haven-staff/learn";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";

export interface TestQuestion {
  question: string;
  options: string[];
}

type Result = { correct: number; right: boolean; because: string | null };

/** Read, then the questions. The teaching is in the "because" after each answer. */
export function MarkRead({ protocolId, done, api = HAVEN_API }: { protocolId: string; done: boolean; api?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (done) return <p style={{ color: TEAL, fontWeight: 600, margin: 0 }}>Read. The questions are below.</p>;
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read", protocolId }) });
        router.refresh();
      }}
      style={{ background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "13px 22px", fontWeight: 700, fontSize: 15 }}
    >
      I have read it
    </button>
  );
}

export function ModuleTest({ protocolId, questions, passedAlready, api = HAVEN_API }: { protocolId: string; questions: TestQuestion[]; passedAlready: boolean; api?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(questions.map(() => -1));
  const [results, setResults] = useState<Result[] | null>(null);
  const [score, setScore] = useState<{ score: number; outOf: number; passed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", protocolId, answers }),
    });
    setBusy(false);
    if (!res.ok) return;
    const d = await res.json();
    setResults(d.results);
    setScore({ score: d.score, outOf: d.outOf, passed: d.passed });
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {questions.map((q, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
          <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{i + 1}. {q.question}</div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {q.options.map((o, j) => {
              const r = results?.[i];
              const picked = answers[i] === j;
              const border = r ? (j === r.correct ? TEAL : picked ? RED : LINE) : picked ? NAVY : LINE;
              return (
                <label key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", border: `1.5px solid ${border}`, borderRadius: 10, padding: "10px 12px", cursor: results ? "default" : "pointer" }}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={picked}
                    disabled={!!results}
                    onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))}
                    style={{ marginTop: 3 }}
                  />
                  <span style={{ fontSize: 14.5, color: "#1F2937" }}>{o}</span>
                </label>
              );
            })}
          </div>
          {results?.[i] && (
            <p style={{ margin: "10px 0 0", fontSize: 14, color: results[i].right ? TEAL : RED }}>
              {results[i].right ? "Right." : "Not quite."} {results[i].because ?? ""}
            </p>
          )}
        </div>
      ))}

      {score ? (
        <div style={{ background: score.passed ? "#EEF6F8" : "#FDF2F0", borderRadius: 14, padding: 18 }}>
          <div style={{ color: NAVY, fontWeight: 700, fontSize: 17 }}>
            {score.passed ? `Passed: ${score.score} of ${score.outOf}` : `${score.score} of ${score.outOf}. Four in five passes.`}
          </div>
          <p style={{ color: MUTED, fontSize: 14.5, margin: "6px 0 0" }}>
            {score.passed
              ? "That counts towards your record and towards recognition."
              : "Read the reasons above, then try again whenever you like. Only your pass is recorded on the team view."}
          </p>
          {!score.passed && (
            <button
              onClick={() => { setResults(null); setScore(null); setAnswers(questions.map(() => -1)); }}
              style={{ marginTop: 12, background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 10, padding: "10px 18px", fontWeight: 600 }}
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={submit}
          disabled={busy || answers.some((a) => a < 0)}
          style={{ background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "13px 22px", fontWeight: 700, fontSize: 15, opacity: answers.some((a) => a < 0) ? 0.5 : 1, justifySelf: "start" }}
        >
          {passedAlready ? "Take it again" : "Submit answers"}
        </button>
      )}
    </div>
  );
}

export function ApproveModule({ protocolId, api = HAVEN_API }: { protocolId: string; api?: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ background: "#FFF8E1", border: `1px solid #F0D98A`, borderRadius: 14, padding: 18 }}>
      <div style={{ color: NAVY, fontWeight: 700 }}>Waiting for your approval</div>
      <p style={{ color: MUTED, fontSize: 14.5, margin: "6px 0 10px" }}>
        Staff cannot see this module until a clinician approves it. Read the text and the questions below. If anything is
        wrong, say what on the staff page rather than approving.
      </p>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note"
        style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, fontSize: 14 }}
      />
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", protocolId, note }) });
          router.refresh();
        }}
        style={{ marginTop: 10, background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "11px 20px", fontWeight: 700 }}
      >
        Approve for staff
      </button>
    </div>
  );
}

/** Two questions from a passed module, days or weeks later. */
export function ReviewTest({ protocolId, questions, api = HAVEN_API }: { protocolId: string; questions: (TestQuestion & { id: string })[]; api?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(questions.map(() => -1));
  const [results, setResults] = useState<Result[] | null>(null);
  const [allRight, setAllRight] = useState<boolean | null>(null);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
          <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{q.question}</div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {q.options.map((o, j) => {
              const r = results?.[i];
              const picked = answers[i] === j;
              const border = r ? (j === r.correct ? TEAL : picked ? RED : LINE) : picked ? NAVY : LINE;
              return (
                <label key={j} style={{ display: "flex", gap: 10, border: `1.5px solid ${border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <input type="radio" name={`r${i}`} checked={picked} disabled={!!results} onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))} />
                  <span style={{ fontSize: 14.5 }}>{o}</span>
                </label>
              );
            })}
          </div>
          {results?.[i] && <p style={{ margin: "10px 0 0", fontSize: 14, color: results[i].right ? TEAL : RED }}>{results[i].right ? "Right." : "Not quite."} {results[i].because ?? ""}</p>}
        </div>
      ))}
      {allRight === null ? (
        <button
          disabled={answers.some((a) => a < 0)}
          onClick={async () => {
            const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "review", protocolId, questionIds: questions.map((q) => q.id), answers }) });
            if (!res.ok) return;
            const d = await res.json();
            setResults(d.results);
            setAllRight(d.allRight);
            router.refresh();
          }}
          style={{ justifySelf: "start", background: NAVY, color: "#fff", border: 0, borderRadius: 10, padding: "13px 22px", fontWeight: 700, opacity: answers.some((a) => a < 0) ? 0.5 : 1 }}
        >
          Check
        </button>
      ) : (
        <p style={{ color: NAVY, fontWeight: 600, margin: 0 }}>
          {allRight ? "Both right. This comes back later, further apart each time." : "Read the reasons above. These two come back in two days."}
        </p>
      )}
    </div>
  );
}
