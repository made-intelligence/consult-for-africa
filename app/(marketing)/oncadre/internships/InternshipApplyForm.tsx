"use client";

import { useState } from "react";
import { MAX_PREFERENCES, QUALIFICATIONS } from "@/lib/cadreHealth/internship/programme";

const input = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };

type Centre = { id: string; name: string; area: string | null; participating: boolean };

export default function InternshipApplyForm({ centres }: { centres: Centre[] }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", school: "", graduationYear: String(new Date().getFullYear()), nmcnNumber: "" });
  const [chosen, setChosen] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const toggle = (id: string) =>
    setChosen((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_PREFERENCES ? p : [...p, id]));
  const move = (i: number, d: -1 | 1) =>
    setChosen((p) => {
      const n = [...p];
      const j = i + d;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen.length) return setError("Choose at least one centre.");
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/cadre/internships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          qualification: QUALIFICATIONS[0].value,
          graduationYear: Number(f.graduationYear),
          nmcnNumber: f.nmcnNumber || undefined,
          centreIds: chosen,
          consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResent(Boolean(data.resent));
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-gray-900">Check your email</p>
        <p className="mt-2 text-sm text-gray-600">
          {resent
            ? "You have already applied for this intake, so we have sent your private link again."
            : "We have sent a private link to " + f.email + ". Open it when you are ready to sit the assessment. If it is not in your inbox in a few minutes, check spam or promotions."}
        </p>
      </div>
    );
  }

  const byId = new Map(centres.map((c) => [c.id, c]));

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">Your details</p>
        <input required className={input} style={inputStyle} placeholder="Full name, as on your certificate" value={f.name} onChange={set("name")} />
        <input required type="email" className={input} style={inputStyle} placeholder="Email address" value={f.email} onChange={set("email")} />
        <input required type="tel" className={input} style={inputStyle} placeholder="Phone or WhatsApp (+234...)" value={f.phone} onChange={set("phone")} />
        <label className="block">
          <span className="text-xs font-medium text-gray-600">University where you took your BNSc</span>
          <input required className={`${input} mt-1`} style={inputStyle} placeholder="e.g. University of Lagos" value={f.school} onChange={set("school")} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Year you graduated</span>
            <input required type="number" min={new Date().getFullYear() - 5} max={new Date().getFullYear() + 1} className={`${input} mt-1`} style={inputStyle} value={f.graduationYear} onChange={set("graduationYear")} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Intern licence number, if issued</span>
            <input className={`${input} mt-1`} style={inputStyle} placeholder="From your NMCN induction" value={f.nmcnNumber} onChange={set("nmcnNumber")} />
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">Choose up to {MAX_PREFERENCES} centres, in order of preference</p>
        <p className="mt-0.5 text-xs text-gray-500">Tap a centre to add it. Your first choice is number 1; use the arrows to reorder.</p>
        {chosen.length > 0 && (
          <ol className="mt-3 space-y-1.5">
            {chosen.map((id, i) => (
              <li key={id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid #0B3C5D", background: "rgba(11,60,93,0.04)" }}>
                <span className="w-5 text-xs font-bold text-[#0B3C5D]">{i + 1}</span>
                <span className="flex-1 min-w-0 text-gray-800">{byId.get(id)?.name}</span>
                <button type="button" onClick={() => move(i, -1)} className="px-1.5 text-gray-500 hover:text-gray-900" aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1.5 text-gray-500 hover:text-gray-900" aria-label="Move down">↓</button>
                <button type="button" onClick={() => toggle(id)} className="px-1.5 text-xs text-gray-500 hover:text-red-600">Remove</button>
              </li>
            ))}
          </ol>
        )}
        {chosen.length < MAX_PREFERENCES && (
          <input
            className={`${input} mt-3`}
            style={inputStyle}
            placeholder="Search by name or area, e.g. Lekki"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        <div className="mt-2 max-h-72 overflow-y-auto rounded-lg" style={{ border: "1px solid #E8EBF0" }}>
          {centres
            .filter((c) => !chosen.includes(c.id))
            .filter((c) => !q.trim() || `${c.name} ${c.area ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
            .map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                disabled={chosen.length >= MAX_PREFERENCES}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-40"
                style={{ borderBottom: "1px solid #F1F3F6" }}
              >
                <span className="min-w-0 text-gray-800">
                  {c.name}
                  {c.area && <span className="text-gray-400"> · {c.area}</span>}
                </span>
                {c.participating && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#ecfdf5", color: "#065f46" }}>Participating</span>}
              </button>
            ))}
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-gray-700">
        <input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#0B3C5D]" />
        I agree that the centres I have chosen may see my assessment result and the details above, so they can decide whether to interview me. No other employer sees them.
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0B3C5D" }}>
        {status === "loading" ? "Sending..." : "Apply and email me my link"}
      </button>
    </form>
  );
}
