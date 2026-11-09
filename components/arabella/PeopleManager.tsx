"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PersonRow {
  id: string;
  name: string;
  position: string;
  department: string;
  phone: string | null;
  email: string | null;
  tier: "ALL_STAFF" | "SUPERVISOR" | "LEADERSHIP";
  isPrincipal: boolean;
  isActive: boolean;
  signedIn: boolean;
  isMe: boolean;
  /** Daily view areas this person fills in, from their job title. */
  owns: string[];
}

const TIER_LABEL: Record<PersonRow["tier"], string> = {
  ALL_STAFF: "Staff",
  SUPERVISOR: "Supervisor",
  LEADERSHIP: "Leadership",
};

const TIER_HELP =
  "Staff see their own tasks, the rota, learning and issue reporting. Supervisors also post the rota and see their area. Leadership also sees the daily view, the money and decisions.";

const LINE = "#E2E8F0";
const MUTED = "#64748b";
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 15, fontFamily: "inherit" };
const btn: React.CSSProperties = { background: "var(--staff-ink)", color: "#fff", border: 0, borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 14.5, cursor: "pointer" };
const ghost: React.CSSProperties = { background: "#fff", color: "var(--staff-ink)", border: `1px solid ${LINE}`, borderRadius: 10, padding: "8px 12px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };

async function send(method: "POST" | "PATCH", body: unknown) {
  const res = await fetch("/api/arabella-staff/people", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error ?? "That did not save. Try again.");
}

function Form({ p, tiers, isPrincipal, busy, run, cancel }: {
p?: PersonRow;
tiers: PersonRow["tier"][];
isPrincipal: boolean;
busy: boolean;
run: (method: "POST" | "PATCH", body: unknown) => void;
cancel: () => void;
}) {
  const [f, setF] = useState({
    name: p?.name ?? "", position: p?.position ?? "", department: p?.department ?? "",
    phone: p?.phone ?? "", email: p?.email ?? "", tier: p?.tier ?? "ALL_STAFF",
  });
  const lockedAccess = !!p && (p.isMe || p.isPrincipal || (p.tier === "LEADERSHIP" && !isPrincipal));
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
      <input style={input} placeholder="Full name" value={f.name} onChange={set("name")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input style={input} placeholder="Job title" value={f.position} onChange={set("position")} />
        <input style={input} placeholder="Area (e.g. Nursing, Front desk)" value={f.department} onChange={set("department")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input style={input} placeholder="Mobile (0803...)" inputMode="tel" value={f.phone} onChange={set("phone")} />
        <input style={input} placeholder="Email (optional)" inputMode="email" value={f.email} onChange={set("email")} />
      </div>
      {!lockedAccess && (
        <label style={{ fontSize: 14, color: MUTED }}>
          Can see
          <select style={{ ...input, marginTop: 6 }} value={f.tier} onChange={set("tier")}>
            {tiers.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
          </select>
        </label>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          style={btn}
          disabled={busy}
          onClick={() => {
            const body = { ...f, ...(lockedAccess ? { tier: undefined } : {}) };
            run(p ? "PATCH" : "POST", p ? { id: p.id, ...body } : body);
          }}
        >
          {busy ? "Saving" : p ? "Save" : "Add to the team"}
        </button>
        <button style={ghost} onClick={cancel}>Cancel</button>
        {p && !lockedAccess && p.isActive && (
          <button style={{ ...ghost, color: "#B0392B" }} disabled={busy} onClick={() => run("PATCH", { id: p.id, active: false })}>
            Take off the list
          </button>
        )}
      </div>
    </div>
  );
}


export default function PeopleManager({ people, isPrincipal }: { people: PersonRow[]; isPrincipal: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tiers: PersonRow["tier"][] = isPrincipal ? ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP"] : ["ALL_STAFF", "SUPERVISOR"];
  const noContact = people.filter((p) => p.isActive && !p.phone && !p.email).length;

  async function run(method: "POST" | "PATCH", body: unknown) {
    setBusy(true);
    setError(null);
    try {
      await send(method, body);
      setEditing(null);
      setAdding(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const formProps = { tiers, isPrincipal, busy, run, cancel: () => { setEditing(null); setAdding(false); setError(null); } };

  return (
    <div>
      <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{TIER_HELP}</p>
      {noContact > 0 && (
        <p style={{ background: "#FFF8E1", borderRadius: 10, padding: "10px 14px", fontSize: 14.5, margin: "14px 0 0" }}>
          {noContact === 1 ? "One person has" : `${noContact} people have`} no phone or email yet, so cannot sign in. Add a mobile number and they can sign in with it.
        </p>
      )}
      {error && <p style={{ color: "#B0392B", fontSize: 14.5, margin: "12px 0 0" }}>{error}</p>}

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {people.map((p) => (
          <div key={p.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px", opacity: p.isActive ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 650, color: "var(--staff-ink)" }}>{p.name}{p.isMe ? " (you)" : ""}</div>
                <div style={{ color: MUTED, fontSize: 13.5 }}>{p.position} · {p.department}</div>
                {p.owns.length > 0 && <div style={{ color: "var(--staff-second)", fontSize: 12.5, marginTop: 2 }}>Fills in: {p.owns.join(", ")}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <span style={{ color: MUTED }}>{p.isPrincipal ? "Principal" : TIER_LABEL[p.tier]}</span>
                <span style={{ color: p.signedIn ? "#166534" : p.phone || p.email ? "#92400E" : "#B0392B" }}>
                  {!p.isActive ? "Off the list" : p.signedIn ? "Signed in" : p.phone || p.email ? "Not signed in yet" : "No contact"}
                </span>
                {editing !== p.id && <button style={ghost} onClick={() => { setEditing(p.id); setAdding(false); }}>Edit</button>}
              </div>
            </div>
            {editing === p.id && <Form p={p} {...formProps} />}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {adding ? (
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontWeight: 650, color: "var(--staff-ink)" }}>Add someone</div>
            <Form {...formProps} />
          </div>
        ) : (
          <button style={btn} onClick={() => { setAdding(true); setEditing(null); }}>Add someone</button>
        )}
      </div>
    </div>
  );
}
