"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Put a name on a deliverable.
 *
 * The old control listed the engagement's active assignments, and there was one
 * active assignment across the whole platform, so it was empty nearly
 * everywhere. This lists consultants instead and lets the server deal with the
 * contract: joining an assignment they already hold, or opening one from their
 * own rates for them to accept.
 *
 * Consultants already on the engagement are shown first and marked, because
 * choosing one of them commits nothing new.
 */

interface Candidate {
  id: string;
  name: string | null;
  title: string | null;
  tier: string;
  yearsExperience: number;
  availability: string;
  specialties: string[];
  existingAssignment: { id: string; role: string; status: string } | null;
}

export default function AssignDeliverable({
  deliverableId,
  currentAssigneeName,
}: {
  deliverableId: string;
  currentAssigneeName?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || candidates.length) return;
    setLoading(true);
    fetch(`/api/deliverables/${deliverableId}/assign`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load consultants"))))
      .then((d) => setCandidates(d.consultants ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, deliverableId, candidates.length]);

  async function assign(consultantId: string) {
    setSaving(consultantId);
    setError(null);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not assign that.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(null);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? candidates.filter((c) =>
        [c.name, c.title, ...c.specialties].join(" ").toLowerCase().includes(q),
      )
    : candidates;
  // Already on the engagement first: picking them creates no new terms.
  const ordered = [...filtered].sort(
    (a, b) => Number(!!b.existingAssignment) - Number(!!a.existingAssignment),
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border px-3.5 py-2 text-xs font-semibold transition hover:bg-gray-50"
        style={{ borderColor: "#E8EBF0", color: "#0F2744" }}
      >
        {currentAssigneeName ? "Reassign" : "Assign to someone"}
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "#E8EBF0", background: "#F9FAFB", maxWidth: 520 }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "#0F2744" }}>
          Who is doing this?
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, title or specialty"
        className="mt-3 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2744]/15"
        style={{ borderColor: "#E8EBF0", minHeight: 40 }}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
        {loading && <p className="text-xs text-gray-500">Loading consultants...</p>}
        {!loading && ordered.length === 0 && (
          <p className="text-xs text-gray-500">Nobody matches that.</p>
        )}
        {ordered.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={!!saving}
            onClick={() => assign(c.id)}
            className="flex w-full items-start justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-left transition hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: "#E8EBF0" }}
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium" style={{ color: "#0F2744" }}>
                {c.name ?? "Unnamed"}
                {saving === c.id && (
                  <span className="ml-2 text-xs font-normal text-gray-400">assigning...</span>
                )}
              </span>
              <span className="block truncate text-xs text-gray-500">
                {c.title || "No title"}
                {c.yearsExperience ? ` · ${c.yearsExperience}y` : ""}
                {c.specialties.length ? ` · ${c.specialties.join(", ")}` : ""}
              </span>
            </span>
            {c.existingAssignment ? (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(16,185,129,0.1)", color: "#047857" }}
              >
                On this engagement
              </span>
            ) : (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                Needs accepting
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
        Somebody already on this engagement picks up the deliverable straight away.
        Anyone else is invited on their own published rate and has to accept before
        they start.
      </p>
    </div>
  );
}
