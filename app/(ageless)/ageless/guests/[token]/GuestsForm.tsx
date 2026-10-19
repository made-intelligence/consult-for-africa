"use client";

import { useState } from "react";
import { MEDLYFE_BRAND as MB } from "@/lib/lyfe";

type Row = { fullName: string; email: string; phone: string };
const blank = (): Row => ({ fullName: "", email: "", phone: "" });

const label = "text-[10.5px] font-semibold uppercase";
const input = "mt-1.5 w-full px-3.5 py-2.5 text-[15px] outline-none";
const inputStyle = { background: "transparent", color: MB.white, border: "1px solid rgba(216,227,214,0.28)" };

export default function GuestsForm({
  token,
  firstName,
  open,
  named,
}: {
  token: string;
  firstName: string;
  open: number;
  named: string[];
}) {
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: open }, blank));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string[] | null>(null);

  const set = (i: number, k: keyof Row, v: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const guests = rows.filter((r) => r.fullName.trim() || r.email.trim());
    if (guests.length === 0) {
      setError("Please name at least one guest.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lyfe/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guests }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "That did not go through.");
      setDone(guests.map((g) => g.fullName.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const all = [...named, ...(done ?? [])];

  if (done || open === 0) {
    return (
      <div className="mt-10">
        <p className="text-[19px]" style={{ color: MB.white, fontWeight: 600 }}>
          {all.length ? "Thank you. Your guests are on the list." : "You have no guest places on your invitation."}
        </p>
        {all.length > 0 && (
          <ul className="mt-4 space-y-1 text-[15px]" style={{ color: MB.mist }}>
            {all.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: MB.mist }}>
          {all.length
            ? "Each of them will receive their own access pass by email before the evening. If anything changes, reply to your invitation email and tell us."
            : "If you would like to bring somebody, reply to your invitation email and we will see what the room allows."}
        </p>
      </div>
    );
  }

  return (
    <form className="mt-10" onSubmit={submit}>
      <p className="text-[17px] leading-relaxed" style={{ color: MB.white }}>
        {firstName}, who are you bringing?
      </p>
      <p className="mt-2 text-[15px] leading-relaxed" style={{ color: MB.mist }}>
        Each guest gets their own access pass for the door, so we need a name and an email address for each.
      </p>
      {named.length > 0 && (
        <p className="mt-2 text-[14px]" style={{ color: MB.mist }}>
          Already on the list: {named.join(", ")}.
        </p>
      )}

      {rows.map((r, i) => (
        <fieldset key={i} className="mt-8">
          <legend className={label} style={{ color: MB.lime, letterSpacing: "0.15em" }}>
            Guest {named.length + i + 1}
          </legend>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className="text-[13px]" style={{ color: MB.mist }}>Full name</span>
              <input className={input} style={inputStyle} value={r.fullName} onChange={(e) => set(i, "fullName", e.target.value)} autoComplete="off" />
            </label>
            <label className="block">
              <span className="text-[13px]" style={{ color: MB.mist }}>Email</span>
              <input type="email" className={input} style={inputStyle} value={r.email} onChange={(e) => set(i, "email", e.target.value)} autoComplete="off" />
            </label>
            <label className="block">
              <span className="text-[13px]" style={{ color: MB.mist }}>Phone (optional)</span>
              <input type="tel" className={input} style={inputStyle} value={r.phone} onChange={(e) => set(i, "phone", e.target.value)} autoComplete="off" />
            </label>
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={busy}
        className="mt-9 px-8 py-3.5 text-[15px] font-semibold disabled:opacity-60"
        style={{ background: MB.lime, color: MB.greenDeep }}
      >
        {busy ? "One moment" : "Add my guests"}
      </button>

      {error && (
        <p className="mt-5 text-[14px]" style={{ color: "#FCA5A5" }}>
          {error}
        </p>
      )}

      <p className="mt-8 text-[13px] leading-relaxed" style={{ color: "#9FB4A6" }}>
        We use these details only to send your guests their pass and the evening&rsquo;s details.
      </p>
    </form>
  );
}
