"use client";

import { useState } from "react";

const input = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };

export default function ClaimForm({ token, centreName, initial }: { token: string; centreName: string; initial: { name: string; role: string; email: string; phone: string } }) {
  const [f, setF] = useState({ ...initial, password: "", places: "", minScore: "", intakeNote: "" });
  const [authorised, setAuthorised] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/cadre/internships/claim/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name,
        role: f.role,
        email: f.email,
        phone: f.phone,
        password: f.password,
        places: f.places ? Number(f.places) : undefined,
        minScore: f.minScore ? Number(f.minScore) : undefined,
        intakeNote: f.intakeNote || undefined,
        authorised,
        consent,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error || "Something went wrong");
    }
    window.location.href = data.next;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">Who reviews candidates</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required className={input} style={inputStyle} placeholder="Your name" value={f.name} onChange={set("name")} />
          <input required className={input} style={inputStyle} placeholder="Your role, e.g. Head of Nursing" value={f.role} onChange={set("role")} />
          <input required type="email" className={input} style={inputStyle} placeholder="Work email, for your login" value={f.email} onChange={set("email")} />
          <input required type="tel" className={input} style={inputStyle} placeholder="Phone" value={f.phone} onChange={set("phone")} />
        </div>
        <input required type="password" minLength={8} className={input} style={inputStyle} placeholder="Choose a password, at least 8 characters" value={f.password} onChange={set("password")} />
        <p className="text-xs text-gray-500">Already have a CadreHealth employer login? Use the same email and password.</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">Your intake <span className="font-normal text-gray-500">(you can change these later)</span></p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs text-gray-600">Places<input type="number" min={0} className={`${input} mt-1`} style={inputStyle} placeholder="e.g. 6" value={f.places} onChange={set("places")} /></label>
          <label className="block text-xs text-gray-600">Minimum score (%)<input type="number" min={0} max={100} className={`${input} mt-1`} style={inputStyle} placeholder="e.g. 60" value={f.minScore} onChange={set("minScore")} /></label>
          <label className="block text-xs text-gray-600">Intake starts<input className={`${input} mt-1`} style={inputStyle} placeholder="e.g. January" value={f.intakeNote} onChange={set("intakeNote")} /></label>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <label className="flex items-start gap-2.5">
          <input required type="checkbox" checked={authorised} onChange={(e) => setAuthorised(e.target.checked)} className="mt-1 accent-[#0B3C5D]" />
          I am authorised to act for {centreName} on intern recruitment.
        </label>
        <label className="flex items-start gap-2.5">
          <input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#0B3C5D]" />
          {centreName} agrees to be listed on CadreHealth as a centre taking part in the nursing internship placement, so graduates can choose it.
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0B3C5D" }}>
        {busy ? "Claiming..." : `Claim ${centreName}`}
      </button>
    </form>
  );
}
