"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UpdateSections } from "@/lib/havenFounderUpdate";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const WARN = "#B0392B";

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  fontSize: 15,
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const toLines = (s: string) => s.split("\n").map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);

function Bullets({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  if (items.length === 0 && !empty) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: NAVY, fontWeight: 700, fontSize: 15 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{empty}</div>
      ) : (
        <ul style={{ margin: "6px 0 0", paddingLeft: 20, color: "#1F2937", fontSize: 14.5, lineHeight: 1.6 }}>
          {items.map((i, k) => <li key={k}>{i}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function FounderUpdateForm({
  update, founders, canSend, sentThisWeek, lastSent,
}: {
  update: UpdateSections;
  founders: { name: string; salutation: string }[];
  canSend: boolean;
  sentThisWeek: boolean;
  lastSent: string | null;
}) {
  const router = useRouter();
  const [done, setDone] = useState("");
  const [asks, setAsks] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!confirm(`Send this to all ${founders.length} founders, one email each?`)) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/haven-founders-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: toLines(done), asks: toLines(asks), next: toLines(next) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) setError(body?.error ?? "That did not send.");
      else setResult(body?.failed?.length ? `Sent to ${body.sent.join(", ")}. Failed: ${body.failed.join(", ")}.` : `Sent to ${body.sent.join(", ")}.`);
      router.refresh();
    } catch { setError("That did not send."); }
    setBusy(false);
  }

  const label = (t: string, hint: string) => (
    <label style={{ display: "block", marginTop: 16 }}>
      <span style={{ color: NAVY, fontWeight: 600, fontSize: 14 }}>{t}</span>
      <span style={{ color: MUTED, fontSize: 13, marginLeft: 8 }}>{hint}</span>
    </label>
  );

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 80px", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>Haven Paediatric Centre</div>
      <h1 style={{ color: NAVY, fontSize: 26, margin: "8px 0 0" }}>Founders&apos; weekly update</h1>
      <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "8px 0 0" }}>
        {update.label}. Goes to {founders.map((f) => f.name).join(", ")}, one email each, with a copy to Debo.
        {lastSent && ` Last sent ${new Date(lastSent).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`}
      </p>

      {sentThisWeek && (
        <div style={{ background: "#E8F3EC", color: "#15803D", borderRadius: 10, padding: "12px 14px", marginTop: 16, fontWeight: 600 }}>
          This week&apos;s update has gone.
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginTop: 20 }}>
        <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
          Filled in from the platform
        </div>
        <Bullets title="Where things stand" items={update.auto} />
        <Bullets title="Needs a decision from you" items={update.asks} />
      </div>

      {canSend && !sentThisWeek && (
        <div style={{ marginTop: 8 }}>
          {label("Done this week", "one per line")}
          <textarea rows={4} value={done} onChange={(e) => setDone(e.target.value)} style={field}
            placeholder={"Leadway reconciled to the line; first call made\nVMI supplier shortlisted"} />
          {label("Needs a decision from you", "added above the automatic ones")}
          <textarea rows={3} value={asks} onChange={(e) => setAsks(e.target.value)} style={field} />
          {label("Next week", "one per line")}
          <textarea rows={3} value={next} onChange={(e) => setNext(e.target.value)} style={field} />

          <div style={{ background: "#F8FAFC", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, marginTop: 20 }}>
            <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
              What {founders[0]?.salutation ?? "they"} will read
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 14.5 }}>Dear {founders[0]?.salutation},</p>
            <Bullets title="Where things stand" items={update.auto} />
            <Bullets title="Done this week" items={toLines(done)} />
            <Bullets title="Needs a decision from you" items={[...toLines(asks), ...update.asks]} />
            <Bullets title="Next week" items={toLines(next)} />
          </div>

          <button onClick={send} disabled={busy}
            style={{ marginTop: 20, background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Sending" : `Send to the ${founders.length} founders`}
          </button>
        </div>
      )}
      {!canSend && (
        <p style={{ color: MUTED, fontSize: 14, marginTop: 16 }}>Debo&apos;s office sends this. Send him anything you want added.</p>
      )}
      {result && <p style={{ color: TEAL, fontWeight: 600, marginTop: 14 }}>{result}</p>}
      {error && <p style={{ color: WARN, marginTop: 14 }}>{error}</p>}
    </main>
  );
}
