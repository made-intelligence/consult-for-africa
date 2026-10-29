"use client";

import { useState } from "react";
import { KINSHIP_QUESTIONS, KINSHIP_QUESTION_KEYS, KINSHIP_ROLES, UPDATE_PROMPT } from "@/lib/cadreHealth/kinshipScreen";

const input = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };

type Answers = Record<string, string>;

function Choice({ name, label, options, value, onChange }: { name: string; label: string; options: { value: string; label: string }[]; value?: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900 mb-2">{label}</legend>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label key={o.value} className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer" style={{ border: `1px solid ${value === o.value ? "#0B3C5D" : "#E8EBF0"}`, background: value === o.value ? "rgba(11,60,93,0.04)" : "#fff" }}>
            <input type="radio" required name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="mt-0.5 accent-[#0B3C5D]" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function KinshipScreenForm({ defaultRole, prefill }: { defaultRole?: string; prefill: { name?: string; email?: string; phone?: string } }) {
  const [a, setA] = useState<Answers>({ role: KINSHIP_ROLES.some((r) => r.value === defaultRole) ? defaultRole! : "", ...prefill });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ screenedOut: boolean; isNew: boolean } | null>(null);
  const [error, setError] = useState("");
  const set = (k: string) => (v: string) => setA((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/cadre/kinship-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-gray-900">Thank you</p>
        {result.screenedOut ? (
          <p className="mt-2 text-sm text-gray-600">Your answers fall outside what Kinship need for these roles, so we will not put you forward this time. We have kept your details and will come back to you when a role fits.</p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Your answers are with the recruitment team. Kinship are interviewing before the end of October, so if you are shortlisted we will contact you early next week.</p>
        )}
        {result.isNew && (
          <a href={`/oncadre/activate?email=${encodeURIComponent(a.email ?? "")}`} className="mt-5 inline-block rounded-lg px-4 py-2 text-xs font-semibold text-[#0B3C5D]" style={{ border: "1px solid rgba(11,60,93,0.2)" }}>
            Set a password to track your application
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Choice name="role" label="Which role?" options={KINSHIP_ROLES.map((r) => ({ value: r.value, label: r.label }))} value={a.role} onChange={set("role")} />
      {KINSHIP_QUESTION_KEYS.map((k) => (
        <Choice key={k} name={k} label={KINSHIP_QUESTIONS[k].label} options={KINSHIP_QUESTIONS[k].options} value={a[k]} onChange={set(k)} />
      ))}
      <label className="block">
        <span className="text-sm font-semibold text-gray-900">{UPDATE_PROMPT}</span>
        <textarea required minLength={10} maxLength={1000} rows={4} className={`${input} mt-2`} style={inputStyle} value={a.update ?? ""} onChange={(e) => set("update")(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-gray-900">Your monthly pay expectation for this role, in naira</span>
        <input required className={`${input} mt-2`} style={inputStyle} placeholder="e.g. 280,000" value={a.salary ?? ""} onChange={(e) => set("salary")(e.target.value)} />
      </label>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">Your details</p>
        <input required className={input} style={inputStyle} placeholder="Full name" value={a.name ?? ""} onChange={(e) => set("name")(e.target.value)} />
        <input required type="email" className={input} style={inputStyle} placeholder="Email address" value={a.email ?? ""} onChange={(e) => set("email")(e.target.value)} />
        <input required type="tel" className={input} style={inputStyle} placeholder="Phone or WhatsApp" value={a.phone ?? ""} onChange={(e) => set("phone")(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0B3C5D" }}>
        {status === "loading" ? "Sending..." : "Send my answers"}
      </button>
      <p className="text-xs text-gray-400 text-center">Your answers stay with CadreHealth and Consult For Africa. Nothing goes to Kinship without your agreement.</p>
    </form>
  );
}
