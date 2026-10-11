"use client";

import { useState } from "react";
import { LYFE_BRAND as C, LYFE_VISIT, whatsappLink } from "@/lib/lyfe";

export default function VisitForm() {
  const [fullName, setFullName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [clinicianRole, setClinicianRole] = useState("");
  const [facilityArea, setFacilityArea] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  // Only windows still ahead of us, so the link keeps working all week.
  const [open] = useState(() => LYFE_VISIT.windows.filter((w) => new Date(w.ends).getTime() > Date.now()));
  const toggle = (label: string) =>
    setTimes((t) => (t.includes(label) ? t.filter((x) => x !== label) : [...t, label]));
  const [company, setCompany] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (times.length === 0) {
      setError("Pick at least one time that suits you.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lyfe/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, facilityName, clinicianRole, facilityArea, email, phone, notes, times, company,
        }),
      });
      const b = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(b?.error || "That did not go through.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const first = fullName.trim().split(/\s+/)[0] || "there";
    return (
      <div className="p-7" style={{ background: C.groundWarm, borderLeft: `3px solid ${C.bronze}` }}>
        <p className="text-[19px] font-semibold" style={{ color: C.ink }}>
          Thank you, {first}.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.body }}>
          We will call to confirm the time. The visits are being planned area by area, so we
          may suggest a slot close to the one you chose.
        </p>
      </div>
    );
  }

  const field = "mt-1.5 w-full border p-3 text-[15px]";
  const style = { borderColor: C.line, background: "#fff", color: C.ink };

  return (
    <form onSubmit={submit} className="space-y-5">
      <input
        type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={company} onChange={(e) => setCompany(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <label className="block">
        <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Your name</span>
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} style={style} />
      </label>

      <label className="block">
        <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Your facility</span>
        <input required value={facilityName} onChange={(e) => setFacilityName(e.target.value)} className={field} style={style} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Your role</span>
          <select required value={clinicianRole} onChange={(e) => setClinicianRole(e.target.value)} className={field} style={style}>
            <option value="">Choose</option>
            {LYFE_VISIT.roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Where you are</span>
          <select required value={facilityArea} onChange={(e) => setFacilityArea(e.target.value)} className={field} style={style}>
            <option value="">Choose</option>
            {LYFE_VISIT.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} style={style} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold" style={{ color: C.ink }}>Phone</span>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} style={style} />
        </label>
      </div>

      <fieldset>
        <legend className="text-[13px] font-semibold" style={{ color: C.ink }}>
          When suits you <span style={{ color: C.muted, fontWeight: 400 }}>tick every time that works</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[...open.map((w) => w.label), LYFE_VISIT.laterLabel].map((label) => {
            const on = times.includes(label);
            return (
              <label key={label} className="flex cursor-pointer items-center gap-3 border p-3 text-[14.5px]"
                style={{ borderColor: on ? C.ink : C.line, background: on ? C.groundWarm : "#fff", color: C.ink }}>
                <input type="checkbox" checked={on} onChange={() => toggle(label)} />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-[13px] font-semibold" style={{ color: C.ink }}>
          Anything useful <span style={{ color: C.muted, fontWeight: 400 }}>optional</span>
        </span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} style={style}
          placeholder="The kind of cases you see, the address, anyone else who should be there" />
      </label>

      <button type="submit" disabled={busy}
        className="w-full px-8 py-4 text-[15px] font-semibold disabled:opacity-60"
        style={{ background: C.ink, color: C.ground }}>
        {busy ? "One moment" : "Ask her to visit"}
      </button>

      {error && <p className="text-[14px]" style={{ color: "#B42318" }}>{error}</p>}

      <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
        Or message us directly on{" "}
        <a href={whatsappLink("Hello, I am a clinician in Lagos and would like Dr Kpaduwa to visit my facility.")}
          className="font-semibold underline underline-offset-4" style={{ color: C.bronzeDeep }}>WhatsApp</a>.
      </p>
    </form>
  );
}
