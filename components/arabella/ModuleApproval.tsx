"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INK = "var(--staff-ink)";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";

/**
 * Approve, or send back with a note. Pinned to the bottom of the screen so the
 * buttons are under the thumb wherever she has scrolled to. After either, it
 * moves straight on to the next module waiting, so a review is read, tap, next.
 */
export default function ModuleApproval({
  protocolId,
  api,
  nextHref,
  listHref,
  sentBack,
}: {
  protocolId: string;
  api: string;
  /** The next module waiting, or null when this is the last. */
  nextHref: string | null;
  listHref: string;
  sentBack: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "note">("idle");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(action: "approve" | "sendBack") {
    setBusy(true);
    setError(null);
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "approve" ? { action, protocolId } : { action, protocolId, note }),
    });
    if (!res.ok) {
      setBusy(false);
      setError(action === "sendBack" ? "Say in a few words what needs to change." : "That did not go through. Try again.");
      return;
    }
    router.push(nextHref ?? `${listHref}?done=1`);
    router.refresh();
  }

  return (
    <div
      style={{
        position: "sticky", bottom: 0, zIndex: 5, background: "#fff", borderTop: `1px solid ${LINE}`,
        boxShadow: "0 -6px 18px rgba(15,23,42,.08)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        margin: "0 -16px", borderRadius: "14px 14px 0 0",
      }}
    >
      {mode === "note" ? (
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ color: INK, fontWeight: 700, fontSize: 14.5 }} htmlFor="sendback-note">What needs to change?</label>
          <textarea
            id="sendback-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            autoFocus
            placeholder="For example: step 4, we do this at the private desk, not reception."
            style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, fontSize: 16, fontFamily: "inherit" }}
          />
          {error && <div style={{ color: RED, fontSize: 13.5 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={busy || note.trim().length < 3}
              onClick={() => send("sendBack")}
              style={{ flex: 1, background: INK, color: "#fff", border: 0, borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 15, opacity: busy || note.trim().length < 3 ? 0.5 : 1 }}
            >
              Send back
            </button>
            <button
              disabled={busy}
              onClick={() => { setMode("idle"); setError(null); }}
              style={{ background: "#fff", color: MUTED, border: `1px solid ${LINE}`, borderRadius: 10, padding: "13px 16px", fontWeight: 600, fontSize: 15 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {error && <div style={{ color: RED, fontSize: 13.5 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={busy}
              onClick={() => send("approve")}
              style={{ flex: 2, background: INK, color: "#fff", border: 0, borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15.5, opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Saving" : "Approve for staff"}
            </button>
            <button
              disabled={busy}
              onClick={() => setMode("note")}
              style={{ flex: 1, background: "#fff", color: INK, border: `1.5px solid ${INK}`, borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15 }}
            >
              Send back
            </button>
          </div>
          <div style={{ color: MUTED, fontSize: 12.5, textAlign: "center" }}>
            {sentBack ? "You sent this back before. Approving it now overrides your note." : nextHref ? "Either takes you to the next module." : "This is the last one waiting."}
          </div>
        </div>
      )}
    </div>
  );
}
