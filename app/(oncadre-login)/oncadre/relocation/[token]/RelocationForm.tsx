"use client";

import { useState } from "react";

type Q = { key: string; label: string; hint?: string; unscored: boolean; options: { value: string; label: string }[] };

export default function RelocationForm({ token, questions, noteQuestion }: { token: string; questions: Q[]; noteQuestion: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/cadre/relocation/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-gray-900">Thank you</p>
        <p className="mt-2 text-sm text-gray-600">
          Your answers are with your application. Zuri Health&apos;s medical team will see them alongside it, and we will be in touch about next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {questions.map((q, i) => {
        const unscored = q.unscored;
        return (
          <fieldset key={q.key}>
            <legend className="text-sm font-semibold text-gray-900">
              <span className="mr-1.5 text-gray-400">{i + 1}.</span>
              {q.label}
              {unscored && <span className="ml-2 text-xs font-normal text-gray-400">Does not count toward your result</span>}
            </legend>
            {q.hint && <p className="mt-0.5 text-xs text-gray-500">{q.hint}</p>}
            <div className="mt-2 space-y-1.5">
              {q.options.map((o) => {
                const on = answers[q.key] === o.value;
                return (
                  <label
                    key={o.value}
                    className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer"
                    style={{ border: `1px solid ${on ? "#0B3C5D" : "#E8EBF0"}`, background: on ? "rgba(11,60,93,0.04)" : "#fff" }}
                  >
                    <input
                      type="radio"
                      required
                      name={q.key}
                      value={o.value}
                      checked={on}
                      onChange={() => setAnswers((a) => ({ ...a, [q.key]: o.value }))}
                      className="mt-0.5 accent-[#0B3C5D]"
                    />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <label className="block">
        <span className="text-sm font-semibold text-gray-900">
          <span className="mr-1.5 text-gray-400">{questions.length + 1}.</span>
          {noteQuestion}
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </span>
        <textarea
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
          style={{ border: "1px solid #E8EBF0", background: "#F8F9FB" }}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "#0B3C5D" }}
      >
        {status === "loading" ? "Sending..." : "Send my answers"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Your answers are shared with Zuri Health&apos;s medical team as part of your application, and with nobody else.
      </p>
    </form>
  );
}
