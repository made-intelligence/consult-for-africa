"use client";

import { useEffect, useState } from "react";
import type { Candidate } from "./CandidateCard";

/**
 * Putting a candidate on a list.
 *
 * The verb the old product was missing. Search results vanished on reload and
 * the only way to keep hold of someone was to have them apply to you, so a
 * hospital building a list of ten consultant paediatricians had nowhere to build
 * it except a spreadsheet.
 */
interface Shortlist {
  id: string;
  name: string;
  count: number;
}

export default function ShortlistDialog({
  candidate,
  onClose,
  onAdded,
}: {
  candidate: Candidate;
  onClose: () => void;
  onAdded: (candidateId: string) => void;
}) {
  const [lists, setLists] = useState<Shortlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cadre/employer/shortlists")
      .then((r) => (r.ok ? r.json() : { shortlists: [] }))
      .then((d) => {
        setLists(d.shortlists ?? []);
        // A first-time employer should land straight in the create form rather
        // than staring at an empty list with no obvious next move.
        if (!d.shortlists?.length) setCreating(true);
      })
      .catch(() => setCreating(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function addTo(shortlistId: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cadre/employer/shortlists/${shortlistId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: candidate.id, note: note || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add them.");
        return;
      }
      onAdded(candidate.id);
      onClose();
    } catch {
      setError("Could not add them. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  async function createAndAdd() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cadre/employer/shortlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create that list.");
        return;
      }
      await addTo(data.id);
    } catch {
      setError("Could not create that list.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(15,39,68,0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Add ${candidate.name} to a shortlist`}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">Add {candidate.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {candidate.cadreLabel}
          {candidate.specialty ? ` / ${candidate.specialty.value}` : ""}
        </p>

        {loading ? (
          <div className="mt-5 space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : creating ? (
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Name this list
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Consultant paediatricians, Lagos"
              className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
              style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
            />
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {lists.map((l) => (
              <button
                key={l.id}
                type="button"
                disabled={saving}
                onClick={() => addTo(l.id)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-gray-50 disabled:opacity-50"
                style={{ border: "1px solid #E8EBF0" }}
              >
                <span className="text-sm font-medium text-gray-900">{l.name}</span>
                <span className="text-xs text-gray-400">
                  {l.count} {l.count === 1 ? "person" : "people"}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
              style={{ border: "1px dashed #CBD5E1", color: "#0B3C5D" }}
            >
              New list
            </button>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Note <span className="text-gray-400">Optional</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. strong NICU background"
            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
            style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          {creating && (
            <button
              type="button"
              onClick={createAndAdd}
              disabled={saving || !newName.trim()}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#0B3C5D", minHeight: "44px" }}
            >
              {saving ? "Saving..." : "Create and add"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
