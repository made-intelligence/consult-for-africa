"use client";

import { useState } from "react";
import { ROLE_FIELDS, SHARED_FIELDS, type FitProfile } from "@/lib/cadreHealth/fitProfile";

type Role = { id: string; title: string; applied: number; fit: FitProfile | null };
type RoleAnswers = { mustHave: string; dealBreakers: string; standOut: string; pay: string; questions: string; payShareable: boolean };

const box = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const boxStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };
const card = { border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" };

function Field({ label, hint, rows, value, onChange }: { label: string; hint: string; rows: number; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${box} mt-2`} style={boxStyle} />
    </label>
  );
}

export default function FitForm(props: {
  token: string;
  orgName: string;
  roles: Role[];
  shared: { relocation: string; process: string };
  name: string;
  terms: string[];
}) {
  const [shared, setShared] = useState(props.shared);
  const [roles, setRoles] = useState<Record<string, RoleAnswers>>(() =>
    Object.fromEntries(
      props.roles.map((r) => [
        r.id,
        { mustHave: r.fit?.mustHave ?? "", dealBreakers: r.fit?.dealBreakers ?? "", standOut: r.fit?.standOut ?? "", pay: r.fit?.pay ?? "", questions: r.fit?.questions ?? "", payShareable: r.fit?.payShareable ?? false },
      ]),
    ),
  );
  const [name, setName] = useState(props.name);
  const [accept, setAccept] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const setRole = (id: string, key: keyof RoleAnswers, v: string | boolean) => setRoles((p) => ({ ...p, [id]: { ...p[id], [key]: v } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const res = await fetch(`/api/cadre/fit/${props.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shared, roles, acceptTerms: accept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8" style={card}>
        <p className="text-lg font-semibold text-gray-900">Thank you</p>
        <p className="mt-2 text-sm text-gray-600">
          Your answers are saved and every applicant so far is being scored against them. Shortlisted candidates appear on your dashboard with the reasons, and we will be in touch about the first of them.
        </p>
        <a href="/oncadre/employer/pipeline" className="mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "#0B3C5D" }}>
          Open your dashboard
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <section className="rounded-2xl bg-white p-6 sm:p-8 space-y-5" style={card}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">For all three roles</p>
        {SHARED_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint} rows={f.rows} value={shared[f.key]} onChange={(v) => setShared((p) => ({ ...p, [f.key]: v }))} />
        ))}
      </section>

      {props.roles.map((r) => (
        <section key={r.id} className="rounded-2xl bg-white p-6 sm:p-8 space-y-5" style={card}>
          <div>
            <p className="text-base font-semibold text-gray-900">{r.title}</p>
            <p className="text-xs text-gray-500">{r.applied} {r.applied === 1 ? "applicant" : "applicants"} so far</p>
          </div>
          {ROLE_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint} rows={f.rows} value={roles[r.id][f.key]} onChange={(v) => setRole(r.id, f.key, v)} />
          ))}
          <label className="flex items-start gap-2.5 text-sm text-gray-700">
            <input type="checkbox" checked={roles[r.id].payShareable} onChange={(e) => setRole(r.id, "payShareable", e.target.checked)} className="mt-0.5 accent-[#0B3C5D]" />
            We may tell shortlisted candidates the pay
          </label>
        </section>
      ))}

      <section className="rounded-2xl bg-white p-6 sm:p-8 space-y-5" style={card}>
        <div>
          <p className="text-base font-semibold text-gray-900">Our terms</p>
          <p className="mt-1 text-sm text-gray-600">This search is a paid service. Your roles and candidates appear on your dashboard once these are accepted.</p>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
          {props.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <input required className={box} style={boxStyle} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="flex items-start gap-2.5 text-sm text-gray-700">
          <input type="checkbox" required checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 accent-[#0B3C5D]" />
          I accept these terms on behalf of {props.orgName}.
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={status === "saving"} className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0B3C5D" }}>
          {status === "saving" ? "Saving..." : "Save and accept"}
        </button>
      </section>
    </form>
  );
}
