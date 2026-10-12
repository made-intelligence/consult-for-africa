"use client";

import { useState } from "react";
import { inputCls } from "./fields";

type Result = {
  reference: string;
  patientRef: string | null;
  status: string;
  receivedAt: string;
  history: { status: string; at: string }[];
  steps: string[];
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function TrackForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function look(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setResult(null);
    const q = new URLSearchParams({ ref: String(f.get("ref") ?? ""), email: String(f.get("email") ?? "") });
    const res = await fetch(`/api/drbola?${q}`).catch(() => null);
    const j = await res?.json().catch(() => null);
    setBusy(false);
    if (res?.ok) setResult(j);
    else setError(j?.error ?? "Something went wrong. Please try again.");
  }

  const reached = result ? result.steps.indexOf(result.status) : -1;

  return (
    <div>
      <form onSubmit={look} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto]">
        <input name="ref" required placeholder="BA-XXXXXX" className={`${inputCls} font-mono uppercase`} />
        <input name="email" required type="email" placeholder="Email you referred with" className={inputCls} />
        <button disabled={busy} className="rounded-full bg-(--db-ink) px-6 py-3 text-[15px] font-medium text-white disabled:opacity-50">
          {busy ? "Checking" : "Track"}
        </button>
      </form>
      {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
      {result && (
        <div className="mt-6 rounded-2xl border border-(--db-line) bg-white p-6">
          <div className="text-sm text-(--db-muted)">
            {result.reference}
            {result.patientRef ? ` · patient ${result.patientRef}` : ""} · received {fmt(result.receivedAt)}
          </div>
          <ol className="mt-5 space-y-3">
            {result.steps.map((s, i) => {
              const done = i <= reached;
              const when = result.history.findLast?.((h) => h.status === s)?.at;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      done ? "bg-(--db-ink) text-white" : "border border-(--db-line) text-(--db-muted)"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={done ? "text-(--db-ink)" : "text-(--db-muted)"}>{s}</span>
                  {done && (when || i === 0) && (
                    <span className="ml-auto text-xs text-(--db-muted)">{fmt(when ?? result.receivedAt)}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
