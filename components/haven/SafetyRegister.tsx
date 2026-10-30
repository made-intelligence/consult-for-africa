"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const WARN = "#B0392B";

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  fontSize: 16, // 16px or iOS zooms on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const button: React.CSSProperties = {
  background: NAVY,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 16px",
  fontSize: 14.5,
  fontWeight: 600,
  cursor: "pointer",
};

const label: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 };

export interface SafetyRow {
  id: string;
  kind: "NEAR_MISS" | "BROKEN";
  what: string;
  why: string | null;
  reachedPatient: string | null;
  reportedBy: string | null;
  reportedAt: string;
  status: "NEW" | "INVESTIGATING" | "ACTION_AGREED" | "CLOSED";
  severity: "LOW" | "MEDIUM" | "HIGH" | null;
  investigator: string | null;
  findings: string | null;
  action: string | null;
  actionOwner: string | null;
  actionDueAt: string | null;
  late: string | null;
}

export interface ChangeRow {
  kind: "NEAR_MISS" | "BROKEN";
  teamNote: string;
  closedAt: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

const STATUS: Record<SafetyRow["status"], string> = {
  NEW: "Not yet taken",
  INVESTIGATING: "Being looked into",
  ACTION_AGREED: "Action agreed",
  CLOSED: "Closed",
};

async function send(body: object): Promise<string | null> {
  try {
    const res = await fetch("/api/haven-staff/safety", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return null;
    return (await res.json().catch(() => null))?.error ?? "That did not save.";
  } catch {
    return "That did not save.";
  }
}

function Case({ r }: { r: SafetyRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [findings, setFindings] = useState(r.findings ?? "");
  const [action, setAction] = useState(r.action ?? "");
  const [owner, setOwner] = useState(r.actionOwner ?? "");
  const [due, setDue] = useState(r.actionDueAt?.slice(0, 10) ?? "");
  const [teamNote, setTeamNote] = useState("");

  async function go(body: object) {
    setBusy(true); setError(null);
    const err = await send({ id: r.id, ...body });
    setBusy(false);
    if (err) setError(err);
    else { setOpen(false); router.refresh(); }
  }

  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderLeft: `4px solid ${r.late ? WARN : r.severity === "HIGH" ? GOLD : TEAL}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: 12.5, fontWeight: 700 }}>
        <span style={{ color: TEAL, textTransform: "uppercase", letterSpacing: ".08em" }}>
          {r.kind === "NEAR_MISS" ? "Near miss" : "Broken"}
        </span>
        <span style={{ color: MUTED, fontWeight: 500 }}>{fmt(r.reportedAt)}</span>
        {r.severity && <span style={{ color: r.severity === "HIGH" ? WARN : MUTED }}>{r.severity.toLowerCase()}</span>}
        <span style={{ color: MUTED, fontWeight: 500 }}>· {STATUS[r.status]}{r.investigator ? `, ${r.investigator}` : ""}</span>
        {r.late && <span style={{ background: "#FBEEE9", color: WARN, padding: "3px 9px", borderRadius: 999 }}>{r.late}</span>}
      </div>

      <p style={{ color: NAVY, fontSize: 15.5, lineHeight: 1.55, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{r.what}</p>
      {r.why && <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.55, margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{r.why}</p>}
      <div style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>
        {r.reachedPatient ? `Reached a patient: ${r.reachedPatient}. ` : ""}
        {r.reportedBy ? `Reported by ${r.reportedBy}.` : "Anonymous."}
      </div>

      {r.status === "ACTION_AGREED" && (
        <div style={{ background: "#F1F7FA", borderRadius: 10, padding: "10px 12px", marginTop: 10, fontSize: 14, lineHeight: 1.55, color: NAVY }}>
          <div><b>What made it possible:</b> {r.findings}</div>
          <div style={{ marginTop: 4 }}><b>What changes:</b> {r.action}</div>
          <div style={{ marginTop: 4, color: MUTED }}>{r.actionOwner}, by {r.actionDueAt ? fmt(r.actionDueAt) : "no date"}</div>
        </div>
      )}

      {r.status === "NEW" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: MUTED, fontSize: 13.5, marginBottom: 8 }}>Take it and say how serious it is:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["HIGH", "MEDIUM", "LOW"] as const).map((s) => (
              <button key={s} disabled={busy} onClick={() => go({ step: "take", severity: s })}
                style={{ ...button, background: s === "HIGH" ? WARN : NAVY, opacity: busy ? 0.6 : 1 }}>
                Take it: {s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {r.status === "INVESTIGATING" && !open && (
        <button onClick={() => setOpen(true)} style={{ ...button, marginTop: 12 }}>Record what we found</button>
      )}
      {r.status === "INVESTIGATING" && open && (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>What made it possible</label>
            <textarea rows={3} value={findings} onChange={(e) => setFindings(e.target.value)} style={field}
              placeholder="The system, never the person. e.g. Both strengths stored in the same tray with the same label colour." />
          </div>
          <div>
            <label style={label}>What changes</label>
            <textarea rows={2} value={action} onChange={(e) => setAction(e.target.value)} style={field}
              placeholder="e.g. Separate trays, a red shelf label on the higher strength" />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 180px" }}>
              <label style={label}>Who does it</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} style={field} placeholder="A role or a name" />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={label}>By</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={field} />
            </div>
          </div>
          <button disabled={busy} onClick={() => go({ step: "agree", findings, action, actionOwner: owner, actionDueAt: due })}
            style={{ ...button, opacity: busy ? 0.6 : 1 }}>
            Agree the action
          </button>
        </div>
      )}

      {r.status === "ACTION_AGREED" && !open && (
        <button onClick={() => setOpen(true)} style={{ ...button, marginTop: 12, background: TEAL }}>It is done: close it</button>
      )}
      {r.status === "ACTION_AGREED" && open && (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div>
            <label style={label}>Tell the team what changed</label>
            <textarea rows={3} value={teamNote} onChange={(e) => setTeamNote(e.target.value)} style={field}
              placeholder="Everyone signed in will read this. No names. e.g. Somebody spotted two medicines that look alike. They now sit on separate shelves." />
          </div>
          <button disabled={busy} onClick={() => go({ step: "close", teamNote })} style={{ ...button, background: TEAL, opacity: busy ? 0.6 : 1 }}>
            Close it and tell the team
          </button>
        </div>
      )}

      {error && <p style={{ color: WARN, fontSize: 14, margin: "10px 0 0" }}>{error}</p>}
    </div>
  );
}

/** Leadership's view: every open case, late ones first. */
export function SafetyRegister({ open, closedCount }: { open: SafetyRow[]; closedCount: number }) {
  const late = open.filter((r) => r.late).length;
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[["Open", open.length], ["Late", late], ["Closed", closedCount]].map(([k, v]) => (
          <div key={String(k)} style={{ flex: "1 1 90px", background: "#F1F7FA", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{String(k)}</div>
            <div style={{ color: k === "Late" && late > 0 ? WARN : NAVY, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{String(v)}</div>
          </div>
        ))}
      </div>
      {open.length === 0 ? (
        <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Nothing open. Every report has been closed and the team told.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {open.map((r) => <Case key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

/** Everyone's view: what changed because somebody spoke up. No names, ever. */
export function WhatChanged({ changes }: { changes: ChangeRow[] }) {
  if (changes.length === 0) {
    return (
      <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        Every report is being looked at. When one is closed, what changed will be written here.
      </p>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {changes.map((c, i) => (
        <div key={i} style={{ borderLeft: `3px solid ${TEAL}`, paddingLeft: 14 }}>
          <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
            {c.kind === "NEAR_MISS" ? "A near miss" : "Something broken"} · {fmt(c.closedAt)}
          </div>
          <p style={{ color: NAVY, fontSize: 15, lineHeight: 1.6, margin: "4px 0 0" }}>{c.teamNote}</p>
        </div>
      ))}
    </div>
  );
}
