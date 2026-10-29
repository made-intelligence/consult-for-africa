"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  fontSize: 16, // 16px or iOS zooms on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
  resize: "vertical",
};

export interface NoteRow {
  id: string;
  body: string;
  author: string;
  role: string;
  scope: "DEPARTMENT" | "ALL";
  department: string | null;
  createdAt: string;
  replies: { id: string; body: string; author: string; createdAt: string }[];
}

function when(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} hr ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function StaffNotes({ notes, myDepartment }: { notes: NoteRow[]; myDepartment: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [scope, setScope] = useState<"DEPARTMENT" | "ALL">("DEPARTMENT");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  async function post(payload: Record<string, unknown>, done: () => void) {
    setBusy(true);
    try {
      const res = await fetch("/api/haven-staff/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { done(); router.refresh(); }
    } catch { /* leave what they typed in place so nothing is lost */ }
    setBusy(false);
  }

  const chip = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? TEAL : LINE}`,
    background: active ? "#F1F7FA" : "#fff",
    color: active ? NAVY : MUTED,
    fontWeight: active ? 700 : 400,
    borderRadius: 999,
    padding: "7px 14px",
    fontSize: 14,
    cursor: "pointer",
  });

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (body.trim()) post({ body, scope }, () => setBody("")); }}
        style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, background: "#fff", marginBottom: 22 }}
      >
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell the team something. A handover note, asking for cover, something that needs picking up."
          style={field}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" onClick={() => setScope("DEPARTMENT")} style={chip(scope === "DEPARTMENT")}>
            My area
          </button>
          <button type="button" onClick={() => setScope("ALL")} style={chip(scope === "ALL")}>
            Everyone
          </button>
          <button
            type="submit"
            disabled={busy || !body.trim()}
            style={{ marginLeft: "auto", background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: busy || !body.trim() ? 0.5 : 1 }}
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.55, margin: "12px 0 0" }}>
          Everyone signed in can read this, which is why it works. Please do not put a patient's name
          or details here. Anything clinical belongs in the patient's record.
        </p>
      </form>

      {notes.length === 0 && (
        <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>
          Nothing yet. Be the first to tell the team something.
        </p>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {notes.map((n) => (
          <div key={n.id} style={{ border: `1px solid ${LINE}`, borderLeft: `4px solid ${n.scope === "ALL" ? GOLD : TEAL}`, borderRadius: 12, padding: 16, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: NAVY, fontWeight: 700, fontSize: 15 }}>{n.author}</span>
              <span style={{ color: MUTED, fontSize: 13 }}>{n.role}</span>
              <span style={{ color: MUTED, fontSize: 13, marginLeft: "auto" }}>
                {n.scope === "ALL" ? "Everyone" : n.department ?? myDepartment} · {when(n.createdAt)}
              </span>
            </div>
            <p style={{ color: "#1F2937", fontSize: 15.5, lineHeight: 1.6, margin: "9px 0 0", whiteSpace: "pre-wrap" }}>{n.body}</p>

            {n.replies.length > 0 && (
              <div style={{ marginTop: 14, borderLeft: `2px solid ${LINE}`, paddingLeft: 14, display: "grid", gap: 10 }}>
                {n.replies.map((r) => (
                  <div key={r.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ color: NAVY, fontWeight: 650, fontSize: 14 }}>{r.author}</span>
                      <span style={{ color: MUTED, fontSize: 12.5 }}>{when(r.createdAt)}</span>
                    </div>
                    <p style={{ color: "#374151", fontSize: 14.5, lineHeight: 1.55, margin: "3px 0 0", whiteSpace: "pre-wrap" }}>{r.body}</p>
                  </div>
                ))}
              </div>
            )}

            {replyTo === n.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (replyBody.trim()) post({ body: replyBody, parentId: n.id }, () => { setReplyBody(""); setReplyTo(null); });
                }}
                style={{ marginTop: 12 }}
              >
                <textarea rows={2} autoFocus value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Reply" style={field} />
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="submit" disabled={busy || !replyBody.trim()} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", opacity: busy || !replyBody.trim() ? 0.5 : 1 }}>
                    Reply
                  </button>
                  <button type="button" onClick={() => { setReplyTo(null); setReplyBody(""); }} style={{ background: "none", border: "none", color: MUTED, fontSize: 14.5, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setReplyTo(n.id)} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, fontSize: 14.5, padding: "12px 0 0", cursor: "pointer" }}>
                Reply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
