"use client";

import { useState } from "react";
import { Handshake, Loader2, Trash2 } from "lucide-react";
import { parseApiError } from "@/lib/parse-api-error";

export interface CommitmentDraft {
  what: string;
  owedByUserId: string | null;
  owedByName: string | null;
  owedByEmail: string | null;
  dueDate: string | null;
  heard: string;
}

interface Person {
  name: string;
  email: string;
  userId: string | null;
}

const inputClass = "w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2744]";
const inputStyle = { borderColor: "#e5eaf0" };

/** The person a draft points at, as a key into the participant list. */
function keyFor(d: CommitmentDraft, people: Person[]): string {
  const i = people.findIndex(
    (p) => (d.owedByUserId && p.userId === d.owedByUserId) || (d.owedByEmail && p.email === d.owedByEmail),
  );
  if (i >= 0) return String(i);
  return d.owedByName ? "other" : "";
}

/**
 * What Nuru heard promised, for the office to confirm before any of it is
 * chased. Each line can be corrected, removed, or kept; confirming records the
 * kept ones and sends everybody the notes.
 */
export default function CommitmentReview({
  meetingId,
  drafts,
  people,
  onDone,
}: {
  meetingId: string;
  drafts: CommitmentDraft[];
  people: Person[];
  onDone: () => void;
}) {
  const [rows, setRows] = useState(() =>
    drafts.map((d) => ({ ...d, who: keyFor(d, people), keep: true })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(i: number, patch: Partial<(typeof rows)[number]>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  const kept = rows.filter((r) => r.keep);
  const unowned = kept.filter((r) => !r.who || (r.who === "other" && !r.owedByName?.trim()));

  async function submit(none: boolean) {
    setSaving(true);
    setError("");
    const items = kept.map((r) => {
      const p = r.who && r.who !== "other" ? people[Number(r.who)] : null;
      return {
        what: r.what,
        owedByUserId: p?.userId ?? null,
        owedByName: p ? p.name : r.owedByName,
        owedByEmail: p && !p.userId ? p.email : null,
        dueDate: r.dueDate || null,
      };
    });
    try {
      const res = await fetch("/api/commitments/from-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(none ? { meetingId, none: true } : { meetingId, items }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#D4AF37" }}>
      <div className="flex items-center gap-2 mb-1">
        <Handshake className="w-4 h-4" style={{ color: "#D4AF37" }} />
        <h3 className="text-sm font-semibold" style={{ color: "#0F2744" }}>
          Commitments to confirm
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Nuru drafted these from the transcript. Check each owner and date against what was heard,
        then confirm. Confirmed ones go on the register, and everyone invited gets the notes.
      </p>

      {rows.length === 0 && (
        <p className="text-sm text-gray-600 mb-3">Nuru heard nobody take anything on.</p>
      )}

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className="rounded-lg border p-3 space-y-2"
            style={{ borderColor: "#e5eaf0", opacity: r.keep ? 1 : 0.45 }}
          >
            <div className="flex items-start gap-2">
              <textarea
                value={r.what}
                onChange={(e) => update(i, { what: e.target.value })}
                rows={2}
                className={inputClass}
                style={inputStyle}
                disabled={!r.keep}
              />
              <button
                onClick={() => update(i, { keep: !r.keep })}
                className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100"
                title={r.keep ? "Not a commitment" : "Keep it"}
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={r.who}
                onChange={(e) => update(i, { who: e.target.value })}
                className={inputClass}
                style={inputStyle}
                disabled={!r.keep}
              >
                <option value="">Who owes it?</option>
                {people.map((p, j) => (
                  <option key={j} value={String(j)}>{p.name}</option>
                ))}
                <option value="other">Someone not on the invite</option>
              </select>
              <input
                type="date"
                value={r.dueDate ?? ""}
                onChange={(e) => update(i, { dueDate: e.target.value || null })}
                className={inputClass}
                style={inputStyle}
                disabled={!r.keep}
              />
            </div>
            {r.who === "other" && (
              <input
                value={r.owedByName ?? ""}
                onChange={(e) => update(i, { owedByName: e.target.value })}
                placeholder="Name"
                className={inputClass}
                style={inputStyle}
                disabled={!r.keep}
              />
            )}
            {r.heard && <p className="text-xs italic text-gray-500">Heard: &ldquo;{r.heard}&rdquo;</p>}
          </div>
        ))}
      </div>

      {error && <p className="text-xs mt-3" style={{ color: "#DC2626" }}>{error}</p>}

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {kept.length > 0 ? (
          <button
            onClick={() => submit(false)}
            disabled={saving || unowned.length > 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#0F2744" }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm {kept.length} and send the notes
          </button>
        ) : (
          <button
            onClick={() => submit(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#0F2744" }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Nothing to record, send the notes
          </button>
        )}
        {unowned.length > 0 && (
          <span className="text-xs" style={{ color: "#92400E" }}>
            {unowned.length} still need{unowned.length === 1 ? "s" : ""} an owner.
          </span>
        )}
      </div>
    </div>
  );
}
