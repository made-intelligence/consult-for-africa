"use client";

import { useState } from "react";

const input = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };

export default function CentreJoinForm() {
  const [f, setF] = useState({ centre: "", name: "", role: "", email: "", phone: "", places: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/cadre/internships/centre-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        centre: f.centre,
        name: f.name,
        role: f.role,
        email: f.email,
        phone: f.phone,
        places: f.places ? Number(f.places) : undefined,
        message: f.message || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return setStatus("idle");
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="py-6 text-center">
        <p className="text-lg font-semibold text-gray-900">Thank you</p>
        <p className="mt-2 text-sm text-gray-600">We will contact you within one working day to arrange a short meeting.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input required className={input} style={inputStyle} placeholder="Name of your centre" value={f.centre} onChange={set("centre")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required className={input} style={inputStyle} placeholder="Your name" value={f.name} onChange={set("name")} />
        <input required className={input} style={inputStyle} placeholder="Your role, e.g. Head of Nursing" value={f.role} onChange={set("role")} />
        <input required type="email" className={input} style={inputStyle} placeholder="Work email" value={f.email} onChange={set("email")} />
        <input required type="tel" className={input} style={inputStyle} placeholder="Phone" value={f.phone} onChange={set("phone")} />
      </div>
      <input type="number" min={0} className={input} style={inputStyle} placeholder="Internship places this intake, if known" value={f.places} onChange={set("places")} />
      <textarea rows={3} className={input} style={inputStyle} placeholder="Anything we should know (optional)" value={f.message} onChange={set("message")} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0B3C5D" }}>
        {status === "loading" ? "Sending..." : "Ask to join"}
      </button>
    </form>
  );
}
