"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Reading = { relevant: boolean | null; sentiment: string | null; isLead: boolean; isComplaint: boolean; isRisk: boolean };

export default function MentionActions({ id, handled, reading, replyDraft }: { id: string; handled: boolean; reading: Reading; replyDraft: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState<"tags" | "reply" | null>(null);
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState(reading);
  const [copied, setCopied] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/market-watch/mentions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    setOpen(null);
    router.refresh();
  }

  const btn = "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap";
  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      {replyDraft && (
        <button onClick={() => setOpen(open === "reply" ? null : "reply")} className={`${btn} text-white`} style={{ background: "#0F2744" }}>
          Open reply
        </button>
      )}
      <button onClick={() => patch({ handled: !handled })} disabled={busy} className={btn} style={{ border: "1px solid #e5eaf0", color: "#0F2744" }}>
        {handled ? "Reopen" : "Mark handled"}
      </button>
      <button onClick={() => setOpen(open === "tags" ? null : "tags")} className={btn} style={{ border: "1px solid #e5eaf0", color: "#0F2744" }}>
        Correct tags
      </button>

      {open === "reply" && replyDraft && (
        <div className="mt-1 w-80 rounded-lg p-3 text-left" style={{ background: "#F8FAFB", border: "1px solid #e5eaf0" }}>
          <p className="text-xs text-gray-500 mb-1">Suggested public reply. It does not confirm the reviewer was a patient; keep it that way.</p>
          <p className="text-sm" style={{ color: "#1F2937" }}>{replyDraft}</p>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(replyDraft);
              setCopied(true);
            }}
            className={`${btn} mt-2`}
            style={{ border: "1px solid #e5eaf0", color: "#0F2744" }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {open === "tags" && (
        <div className="mt-1 w-72 rounded-lg p-3 text-left space-y-2 text-sm" style={{ background: "#F8FAFB", border: "1px solid #e5eaf0" }}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={r.relevant !== false} onChange={(e) => setR({ ...r, relevant: e.target.checked })} /> About one of our brands
          </label>
          <select value={r.sentiment ?? "NEUTRAL"} onChange={(e) => setR({ ...r, sentiment: e.target.value })} className="w-full rounded-md px-2 py-1" style={{ border: "1px solid #e5eaf0" }}>
            {["POSITIVE", "NEUTRAL", "MIXED", "NEGATIVE"].map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {(["isLead", "isComplaint", "isRisk"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={r[k]} onChange={(e) => setR({ ...r, [k]: e.target.checked })} /> {k === "isLead" ? "Lead" : k === "isComplaint" ? "Complaint" : "Risk"}
            </label>
          ))}
          <button
            disabled={busy}
            onClick={() => patch({ relevant: r.relevant !== false, sentiment: r.sentiment ?? "NEUTRAL", isLead: r.isLead, isComplaint: r.isComplaint, isRisk: r.isRisk })}
            className={`${btn} text-white`}
            style={{ background: "#0F2744" }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
