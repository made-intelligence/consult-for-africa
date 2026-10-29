"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const WARN = "#7A2F2F";

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  fontSize: 16, // 16px or iOS zooms on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const primary: React.CSSProperties = {
  width: "100%",
  background: NAVY,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "13px 22px",
  fontSize: 15.5,
  fontWeight: 600,
  cursor: "pointer",
};

const LABELS: Record<string, string> = {
  ANNUAL: "Annual leave",
  SICK: "Sick leave",
  COMPASSIONATE: "Compassionate",
  STUDY: "Study",
  UNPAID: "Unpaid",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  REQUESTED: { bg: "#FEF9E7", fg: "#92400E", label: "Waiting" },
  APPROVED: { bg: "#E8F3EC", fg: "#15803D", label: "Approved" },
  DECLINED: { bg: "#FBEEE9", fg: WARN, label: "Declined" },
  CANCELLED: { bg: "#F1F5F9", fg: MUTED, label: "Cancelled" },
};

export interface LeaveRow {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  decisionNote: string | null;
  staffName?: string;
  reason?: string | null;
}

function fmt(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function Pill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.REQUESTED;
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/** What the person sees about their own leave, and how they ask for more. */
export function MyLeave({ mine, entitlement }: { mine: LeaveRow[]; entitlement: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("ANNUAL");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clash, setClash] = useState<{ headcount: number; alreadyOff: { name: string; from: string; to: string }[] } | null>(null);

  const taken = mine.filter((l) => l.type === "ANNUAL" && l.status === "APPROVED").reduce((s, l) => s + l.days, 0);
  const pending = mine.filter((l) => l.type === "ANNUAL" && l.status === "REQUESTED").reduce((s, l) => s + l.days, 0);
  const left = Math.max(entitlement - taken - pending, 0);

  // As soon as both dates exist, show who else is already off. Finding out
  // afterwards is how a rota breaks in December.
  useEffect(() => {
    if (!start || !end) { setClash(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/haven-staff/leave?from=${start}&to=${end}`);
        if (res.ok && !cancelled) setClash(await res.json());
      } catch { /* the form still works without it */ }
    })();
    return () => { cancelled = true; };
  }, [start, end]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/haven-staff/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate: start, endDate: end, days: Number(days), reason }),
      });
      if (res.ok) {
        setOpen(false); setStart(""); setEnd(""); setDays(""); setReason(""); setClash(null);
        router.refresh();
      } else {
        setError((await res.json().catch(() => null))?.error ?? "That did not send.");
      }
    } catch { setError("That did not send."); }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[["Days left", left], ["Taken", taken], ["Waiting", pending]].map(([k, v]) => (
          <div key={String(k)} style={{ flex: "1 1 90px", background: "#F1F7FA", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{String(k)}</div>
            <div style={{ color: NAVY, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{String(v)}</div>
          </div>
        ))}
      </div>

      {mine.length > 0 && (
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden", marginBottom: 18 }}>
          {mine.map((l, i) => (
            <div key={l.id} style={{ padding: "13px 14px", borderTop: i === 0 ? "none" : `1px solid ${LINE}`, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: NAVY, fontWeight: 650, fontSize: 15 }}>
                    {fmt(l.startDate)} to {fmt(l.endDate)}
                  </div>
                  <div style={{ color: MUTED, fontSize: 13.5, marginTop: 1 }}>
                    {LABELS[l.type] ?? l.type} · {l.days} day{l.days === 1 ? "" : "s"}
                  </div>
                </div>
                <Pill status={l.status} />
              </div>
              {l.decisionNote && (
                <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.55, margin: "8px 0 0" }}>{l.decisionNote}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button onClick={() => setOpen(true)} style={primary}>Ask for leave</button>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 14, border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, background: "#fff" }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>What kind</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={field}>
              {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>From</label>
              <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} style={field} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>To</label>
              <input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={field} />
            </div>
          </div>

          {clash && (
            <div style={{ background: clash.alreadyOff.length ? "#FEF9E7" : "#F1F7FA", border: `1px solid ${LINE}`, borderRadius: 10, padding: "12px 14px" }}>
              {clash.alreadyOff.length === 0 ? (
                <span style={{ color: TEAL, fontSize: 14, fontWeight: 600 }}>Nobody else in your area is off then.</span>
              ) : (
                <>
                  <div style={{ color: "#92400E", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    {clash.alreadyOff.length} of {clash.headcount} in your area already off then
                  </div>
                  {clash.alreadyOff.map((c) => (
                    <div key={c.name + c.from} style={{ color: MUTED, fontSize: 13.5 }}>
                      {c.name}, {fmt(c.from)} to {fmt(c.to)}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>
              How many working days
              <span style={{ display: "block", fontSize: 13, color: MUTED, fontWeight: 400 }}>
                Your own count. A hospital rota is not a Monday to Friday week.
              </span>
            </label>
            <input required type="number" min={1} max={90} value={days} onChange={(e) => setDays(e.target.value)} style={field} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>
              Anything we should know
              <span style={{ display: "block", fontSize: 13, color: MUTED, fontWeight: 400 }}>Optional.</span>
            </label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...field, resize: "vertical" }} />
          </div>

          {error && <p style={{ color: WARN, fontSize: 14, margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Sending…" : "Send request"}
            </button>
            <button type="button" onClick={() => setOpen(false)} style={{ ...primary, background: "transparent", color: MUTED, border: `1px solid ${LINE}`, width: "auto", padding: "13px 18px" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** What a supervisor sees: what is waiting, and who is already off. */
export function LeaveToDecide({ pending }: { pending: LeaveRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, decision: "APPROVED" | "DECLINED") {
    setBusyId(id); setError(null);
    try {
      const res = await fetch("/api/haven-staff/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => null))?.error ?? "That did not go through.");
    } catch { setError("That did not go through."); }
    setBusyId(null);
  }

  if (pending.length === 0) {
    return <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Nothing waiting on you.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {error && <p style={{ color: WARN, fontSize: 14, margin: 0 }}>{error}</p>}
      {pending.map((l) => (
        <div key={l.id} style={{ border: `1px solid ${LINE}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 12, padding: 16, background: "#fff" }}>
          <div style={{ color: NAVY, fontWeight: 700, fontSize: 16 }}>{l.staffName}</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 2 }}>
            {LABELS[l.type] ?? l.type} · {fmt(l.startDate)} to {fmt(l.endDate)} · {l.days} day{l.days === 1 ? "" : "s"}
          </div>
          {l.reason && <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.55, margin: "8px 0 0" }}>{l.reason}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button disabled={busyId === l.id} onClick={() => decide(l.id, "APPROVED")}
              style={{ ...primary, width: "auto", padding: "10px 18px", background: TEAL, opacity: busyId === l.id ? 0.6 : 1 }}>
              Approve
            </button>
            <button disabled={busyId === l.id} onClick={() => decide(l.id, "DECLINED")}
              style={{ ...primary, width: "auto", padding: "10px 18px", background: "transparent", color: WARN, border: `1px solid ${LINE}`, opacity: busyId === l.id ? 0.6 : 1 }}>
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
