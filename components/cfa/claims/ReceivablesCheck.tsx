"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  ADVANCE_LIVE,
  OLDEST_UNPAID,
  PAYER_COUNTS,
  ROLES,
  SAMPLE_SIZE,
  check,
  naira,
} from "@/lib/claims-recovery";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const LINE = "#e5eaf0";

const input = "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]";

function Slider({ label, value, set, min, max, step, show }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; show: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm text-gray-700">
        {label}
        <span className="font-semibold" style={{ color: NAVY }}>{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-2 w-full accent-[#0B3C5D]" />
    </label>
  );
}

export default function ReceivablesCheck({ refToken }: { refToken: string | null }) {
  const [monthly, setMonthly] = useState(15_000_000);
  const [days, setDays] = useState(120);
  const [queried, setQueried] = useState(20);
  const r = useMemo(() => check({ monthlyBilled: monthly, daysToPay: days, queriedPct: queried }), [monthly, days, queried]);

  const [f, setF] = useState({
    hospital: "", fullName: "", role: "", email: "", phone: "", city: "", payers: "", oldest: "", wantsEarlyPayment: false, message: "", website: "", consent: false,
  });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setState("busy");
    const res = await fetch("/api/claims-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, monthlyBilled: monthly, daysToPay: days, queriedPct: queried, ref: refToken }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (res?.ok) return setState("done");
    setState("idle");
    const first = data?.details ? Object.values(data.details as Record<string, string[]>)[0]?.[0] : null;
    setErr(first ?? data?.error ?? "That did not go through. Please try again, or email hello@consultforafrica.com.");
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 md:p-8" style={{ border: `1px solid ${LINE}` }}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Your numbers</p>
        <div className="mt-6 space-y-7">
          <Slider label="Billed to HMOs and corporates each month" value={monthly} set={setMonthly} min={1_000_000} max={300_000_000} step={1_000_000} show={naira(monthly)} />
          <Slider label="Average days until a claim is paid" value={days} set={setDays} min={15} max={365} step={5} show={`${days} days`} />
          <Slider label="Share of claims queried, cut or rejected" value={queried} set={setQueried} min={0} max={60} step={1} show={`${queried}%`} />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { v: naira(r.outstanding), l: "owed to you at any one time" },
            { v: naira(r.inDispute), l: "of that, held up in queries and disputes" },
            { v: naira(r.per30Days), l: "released for good if you are paid 30 days sooner" },
            ...(ADVANCE_LIVE ? [{ v: naira(r.earlyPayment), l: "available early against vetted claims" }] : []),
          ].map((x) => (
            <div key={x.l} className="rounded-xl p-4" style={{ background: "#F8FAFC" }}>
              <p className="text-xl font-semibold" style={{ color: NAVY }}>{x.v}</p>
              <p className="mt-1 text-xs leading-snug text-gray-500">{x.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-gray-400">This is arithmetic on the figures you enter, not a forecast of what we will recover. The written read is.</p>
      </div>

      <div className="rounded-2xl p-6 md:p-8" style={{ background: "#0F2744" }}>
        {state === "done" ? (
          <div className="flex h-full flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Received</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Thank you. We will be in touch within two working days.</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              We will send a short written read on your numbers and ask for a list of {SAMPLE_SIZE} unpaid claims, with claim references only and no patient names, so we can show you what is recoverable before you commit to anything.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Get the written read</p>
            <p className="pb-2 text-sm text-white/65">Free. We review {SAMPLE_SIZE} of your unpaid claims and tell you what is recoverable, from whom, and how fast.</p>
            <input className={input} style={{ borderColor: LINE }} placeholder="Hospital or clinic" value={f.hospital} onChange={set("hospital")} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={input} style={{ borderColor: LINE }} placeholder="Your name" value={f.fullName} onChange={set("fullName")} required />
              <select className={input} style={{ borderColor: LINE }} value={f.role} onChange={set("role")} required>
                <option value="">Your role</option>
                {ROLES.map((x) => <option key={x}>{x}</option>)}
              </select>
              <input className={input} style={{ borderColor: LINE }} type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
              <input className={input} style={{ borderColor: LINE }} placeholder="Phone (WhatsApp)" value={f.phone} onChange={set("phone")} required />
              <input className={input} style={{ borderColor: LINE }} placeholder="City" value={f.city} onChange={set("city")} />
              <select className={input} style={{ borderColor: LINE }} value={f.payers} onChange={set("payers")}>
                <option value="">How many HMOs pay you?</option>
                {PAYER_COUNTS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <select className={input} style={{ borderColor: LINE }} value={f.oldest} onChange={set("oldest")}>
              <option value="">Oldest unpaid claim</option>
              {OLDEST_UNPAID.map((x) => <option key={x}>{x}</option>)}
            </select>
            <textarea className={input} style={{ borderColor: LINE }} rows={3} placeholder="Anything we should know (optional)" value={f.message} onChange={set("message")} />
            <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" />
            <label className="flex items-start gap-2 text-sm text-white/75">
              <input type="checkbox" checked={f.wantsEarlyPayment} onChange={set("wantsEarlyPayment")} className="mt-1" />
              {ADVANCE_LIVE ? "I would like early payment against vetted claims" : "I am interested in early payment against vetted claims when it opens"}
            </label>
            <label className="flex items-start gap-2 text-xs text-white/55">
              <input type="checkbox" checked={f.consent} onChange={set("consent")} className="mt-0.5" required />
              Consult for Africa may hold these details to reply to me about this service. We never ask for patient names or records at this stage.
            </label>
            {err && <p className="text-sm text-red-300">{err}</p>}
            <button type="submit" disabled={state === "busy"} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold disabled:opacity-60" style={{ background: GOLD, color: "#0F2744" }}>
              {state === "busy" ? "Sending" : "Send me the written read"} <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
