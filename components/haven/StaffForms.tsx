"use client";

import { useState } from "react";

// The two channels promised to all nineteen in the onboarding pack and said out
// loud at the town hall. Both are anonymous by default: the name field is last,
// optional, and labelled as optional, because a near-miss report that costs the
// reporter anything is a near-miss report you stop receiving.

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const label: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: NAVY,
  marginBottom: 6,
};
const hint: React.CSSProperties = { fontSize: 13, color: MUTED, fontWeight: 400, marginTop: 2 };
const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  fontSize: 16, // 16px or iOS zooms on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  color: "#111827",
  background: "#fff",
  boxSizing: "border-box",
};
const button: React.CSSProperties = {
  background: NAVY,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "13px 22px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
};

type State = "idle" | "sending" | "done" | "error";

function useSubmit(survey: string) {
  const [state, setState] = useState<State>("idle");
  async function send(responses: Record<string, unknown>) {
    setState("sending");
    try {
      const res = await fetch("/api/haven-audit/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ survey, responses, submittedAt: new Date().toISOString() }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  return { state, send, reset: () => setState("idle") };
}

function Thanks({ children, onAgain }: { children: React.ReactNode; onAgain: () => void }) {
  return (
    <div style={{ background: "#F1F7FA", border: `1px solid ${LINE}`, borderLeft: `4px solid ${TEAL}`, borderRadius: 12, padding: 20 }}>
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: NAVY }}>{children}</p>
      <button
        onClick={onAgain}
        style={{ ...button, background: "transparent", color: TEAL, width: "auto", padding: "10px 0", fontWeight: 600 }}
      >
        Send another
      </button>
    </div>
  );
}

export function NearMissForm() {
  const { state, send, reset } = useSubmit("haven-near-miss");
  const [what, setWhat] = useState("");
  const [reachedPatient, setReached] = useState("");
  const [why, setWhy] = useState("");
  const [name, setName] = useState("");

  if (state === "done") {
    return (
      <Thanks
        onAgain={() => {
          setWhat(""); setReached(""); setWhy(""); setName(""); reset();
        }}
      >
        Thank you. That has gone straight through. Somebody will look at it this week, and what we are
        looking for is what made it possible, never who was involved.
      </Thanks>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (what.trim()) send({ what, reachedPatient, why, name });
      }}
      style={{ display: "grid", gap: 18 }}
    >
      <div>
        <label style={label}>
          What happened, or what did you catch?
          <span style={hint}>In your own words. A sentence or two is plenty.</span>
        </label>
        <textarea required rows={4} value={what} onChange={(e) => setWhat(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </div>

      <div>
        <label style={label}>Did it reach a patient?</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["No, it was caught", "Yes", "Not sure"].map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setReached(opt)}
              style={{
                ...field,
                width: "auto",
                cursor: "pointer",
                fontWeight: reachedPatient === opt ? 700 : 400,
                borderColor: reachedPatient === opt ? TEAL : LINE,
                background: reachedPatient === opt ? "#F1F7FA" : "#fff",
                color: reachedPatient === opt ? NAVY : MUTED,
                fontSize: 14.5,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={label}>
          What do you think made it possible?
          <span style={hint}>Optional. This is the part that helps us fix the system.</span>
        </label>
        <textarea rows={3} value={why} onChange={(e) => setWhy(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </div>

      <div>
        <label style={label}>
          Your name
          <span style={hint}>Optional. Leave it blank and this is completely anonymous.</span>
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={field} />
      </div>

      {state === "error" && (
        <p style={{ color: "#B0392B", fontSize: 14, margin: 0 }}>
          That did not send. Please try again, or tell someone from Consult for Africa directly.
        </p>
      )}
      <button type="submit" disabled={state === "sending"} style={{ ...button, opacity: state === "sending" ? 0.6 : 1 }}>
        {state === "sending" ? "Sending…" : "Send this report"}
      </button>
    </form>
  );
}

export function WhatsBrokenForm() {
  const { state, send, reset } = useSubmit("haven-whats-broken");
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [fix, setFix] = useState("");
  const [name, setName] = useState("");

  if (state === "done") {
    return (
      <Thanks
        onAgain={() => {
          setWhat(""); setWhere(""); setFix(""); setName(""); reset();
        }}
      >
        Thank you. These go onto the list we work through, and we will tell everyone what changed
        because people wrote in.
      </Thanks>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (what.trim()) send({ what, where, fix, name });
      }}
      style={{ display: "grid", gap: 18 }}
    >
      <div>
        <label style={label}>
          What is broken, or what wastes your time?
          <span style={hint}>One line is enough.</span>
        </label>
        <textarea required rows={3} value={what} onChange={(e) => setWhat(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </div>

      <div>
        <label style={label}>Where?</label>
        <select value={where} onChange={(e) => setWhere(e.target.value)} style={field}>
          <option value="">Choose one</option>
          {["Ward", "NICU", "Outpatient clinic", "Front desk", "Pharmacy", "Laboratory", "Admin and billing", "Everywhere", "Somewhere else"].map(
            (o) => (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </select>
      </div>

      <div>
        <label style={label}>
          What would you do about it?
          <span style={hint}>Optional, but you probably know better than we do.</span>
        </label>
        <textarea rows={3} value={fix} onChange={(e) => setFix(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </div>

      <div>
        <label style={label}>
          Your name
          <span style={hint}>Optional. Leave it blank and this is completely anonymous.</span>
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={field} />
      </div>

      {state === "error" && (
        <p style={{ color: "#B0392B", fontSize: 14, margin: 0 }}>That did not send. Please try again.</p>
      )}
      <button type="submit" disabled={state === "sending"} style={{ ...button, background: TEAL, opacity: state === "sending" ? 0.6 : 1 }}>
        {state === "sending" ? "Sending…" : "Send this"}
      </button>
    </form>
  );
}

export const FORM_ACCENT = GOLD;

/**
 * The weekly pulse. One tap is a complete answer, and the two optional parts
 * are below the fold of the thumb.
 *
 * Deliberately asks whether they had what they needed rather than whether they
 * are satisfied. Satisfaction is a mood and moves with things nobody here
 * controls; "did you have what you needed" is a question about the hospital and
 * it is actionable on Monday.
 */
export function WeeklyPulse() {
  const { state, send, reset } = useSubmit("haven-weekly-pulse");
  const [week, setWeek] = useState("");
  const [hadWhatINeeded, setHad] = useState("");
  const [say, setSay] = useState("");

  if (state === "done") {
    return (
      <Thanks onAgain={() => { setWeek(""); setHad(""); setSay(""); reset(); }}>
        Thank you. We publish how many people answered each week, and what changed because of it.
      </Thanks>
    );
  }

  const chip = (active: boolean): React.CSSProperties => ({
    ...field,
    width: "auto",
    flex: "1 1 0",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: active ? 700 : 400,
    borderColor: active ? TEAL : LINE,
    background: active ? "#F1F7FA" : "#fff",
    color: active ? NAVY : MUTED,
    fontSize: 14.5,
    padding: "12px 8px",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (week) send({ week, hadWhatINeeded, say });
      }}
      style={{ display: "grid", gap: 18 }}
    >
      <div>
        <label style={label}>How has your week been?</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["Good", "Alright", "Hard", "Very hard"].map((o) => (
            <button type="button" key={o} onClick={() => setWeek(o)} style={chip(week === o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={label}>
          Did you have what you needed to do your job?
          <span style={hint}>Stock, people, equipment, information.</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {["Yes", "Mostly", "No"].map((o) => (
            <button type="button" key={o} onClick={() => setHad(o)} style={chip(hadWhatINeeded === o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={label}>
          Anything you want to say?
          <span style={hint}>Optional. Always anonymous.</span>
        </label>
        <textarea rows={2} value={say} onChange={(e) => setSay(e.target.value)} style={{ ...field, resize: "vertical" }} />
      </div>

      {state === "error" && (
        <p style={{ color: "#B0392B", fontSize: 14, margin: 0 }}>That did not send. Please try again.</p>
      )}
      <button type="submit" disabled={state === "sending" || !week} style={{ ...button, opacity: state === "sending" || !week ? 0.5 : 1 }}>
        {state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
