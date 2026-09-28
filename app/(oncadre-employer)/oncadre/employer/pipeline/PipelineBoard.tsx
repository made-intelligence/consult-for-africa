"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nextStages, stageFor } from "@/lib/cadreHealth/matchStages";

/**
 * Everyone in play, split by how they arrived.
 *
 * Applicants and sourced candidates are never in the same list. An applicant
 * chose this hospital and is owed an answer, which the board says out loud and
 * counts when it goes unanswered. A sourced candidate has not been approached
 * and is owed nothing until someone acts.
 *
 * Stage changes are buttons, not a dropdown of all eight states: the dropdown
 * let a single mis-click move someone from New to Placed, and because the old
 * option list did not contain the status the apply route actually wrote, it
 * silently rewrote the value the moment it was touched.
 */

export interface PipelineEntry {
  id: string;
  status: string;
  source: "APPLIED" | "SOURCED" | "INVITED";
  matchScore: number | null;
  matchExplanation: string | null;
  notes: string | null;
  createdAt: string;
  overdue: boolean;
  mandate: { id: string; title: string; cadreLabel: string };
  professional: {
    id: string;
    name: string;
    cadreLabel: string;
    subSpecialty: string | null;
    specialtyConfirmed: boolean;
    yearsOfExperience: number | null;
    location: string;
    licenceVerified: boolean;
    profileCompleteness: number;
    hasCv: boolean;
  };
}

const TABS = [
  {
    key: "APPLIED" as const,
    label: "Applied",
    blurb: "They came to you. Each one is owed an answer.",
  },
  {
    key: "INVITED" as const,
    label: "Accepted contact",
    blurb: "You approached them and they agreed to talk.",
  },
  {
    key: "SOURCED" as const,
    label: "Sourced",
    blurb: "Surfaced from the register. Not approached yet.",
  },
];

export default function PipelineBoard({
  entries,
  showRole,
  initialTab,
}: {
  entries: PipelineEntry[];
  /** Off on a single role's board, where the role name would repeat on every row. */
  showRole: boolean;
  initialTab?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"APPLIED" | "INVITED" | "SOURCED">(
    initialTab === "SOURCED" || initialTab === "INVITED" ? initialTab : "APPLIED",
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = {
    APPLIED: entries.filter((e) => e.source === "APPLIED").length,
    INVITED: entries.filter((e) => e.source === "INVITED").length,
    SOURCED: entries.filter((e) => e.source === "SOURCED").length,
  };
  const overdue = entries.filter((e) => e.overdue).length;
  const shown = entries.filter((e) => e.source === tab);

  async function move(matchId: string, status: string) {
    setBusy(matchId);
    setError(null);
    try {
      const res = await fetch(`/api/cadre/employer/pipeline/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not move them.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      {overdue > 0 && tab === "APPLIED" && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(212,175,55,0.07)",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "#8A6D1A",
          }}
        >
          <strong>{overdue}</strong> {overdue === 1 ? "person has" : "people have"} been
          waiting more than a week without an answer.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
              style={{
                background: active ? "#0B3C5D" : "#FFF",
                color: active ? "#FFF" : "#6B7280",
                border: active ? "1px solid #0B3C5D" : "1px solid #E8EBF0",
              }}
            >
              {t.label}
              <span className="ml-1.5 opacity-70">{counts[t.key]}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-500">{TABS.find((t) => t.key === tab)?.blurb}</p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {shown.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <p className="text-sm text-gray-500">
            {tab === "APPLIED"
              ? "Nobody has applied yet."
              : tab === "INVITED"
                ? "Nobody has accepted an approach yet."
                : "Nothing sourced for this role yet."}
          </p>
          {tab !== "APPLIED" && (
            <Link
              href="/oncadre/employer/candidates"
              className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#0B3C5D" }}
            >
              Search the register
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              showRole={showRole}
              busy={busy === entry.id}
              onMove={move}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  showRole,
  busy,
  onMove,
}: {
  entry: PipelineEntry;
  showRole: boolean;
  busy: boolean;
  onMove: (matchId: string, status: string) => void;
}) {
  const stage = stageFor(entry.status);
  const moves = nextStages(entry.status);
  const p = entry.professional;

  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{
        border: entry.overdue ? "1px solid rgba(212,175,55,0.35)" : "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{p.name}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: stage.bg, color: stage.color }}
            >
              {stage.label}
            </span>
            {p.licenceVerified && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(16,185,129,0.09)", color: "#059669" }}
              >
                Licence verified
              </span>
            )}
            {entry.overdue && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(212,175,55,0.14)", color: "#B8941E" }}
              >
                Owed a reply
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm text-gray-500">
            {p.cadreLabel}
            {p.subSpecialty && (
              <>
                {" / "}
                <span
                  title={
                    p.specialtyConfirmed
                      ? "Confirmed by the professional"
                      : "From the regulatory register, not yet confirmed by them"
                  }
                  style={{
                    borderBottom: p.specialtyConfirmed ? "none" : "1px dashed #CBD5E1",
                  }}
                >
                  {p.subSpecialty}
                </span>
              </>
            )}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {p.yearsOfExperience != null && (
              <span className="rounded-md px-2 py-0.5" style={{ background: "#F8F9FB" }}>
                {p.yearsOfExperience} yrs
              </span>
            )}
            <span className="rounded-md px-2 py-0.5" style={{ background: "#F8F9FB" }}>
              {p.location}
            </span>
            {p.hasCv && (
              <span
                className="rounded-md px-2 py-0.5"
                style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}
              >
                CV on file
              </span>
            )}
            <span className="rounded-md px-2 py-0.5" style={{ background: "#F8F9FB" }}>
              {entry.source === "APPLIED" ? "Applied" : entry.source === "INVITED" ? "Accepted contact" : "Sourced"}{" "}
              {new Date(entry.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          {showRole && (
            <p className="mt-2 text-xs text-gray-400">
              For{" "}
              <Link
                href={`/oncadre/employer/roles/${entry.mandate.id}`}
                className="font-medium text-[#0B3C5D] underline-offset-2 hover:underline"
              >
                {entry.mandate.title}
              </Link>
            </p>
          )}

          {entry.matchExplanation && entry.source === "SOURCED" && (
            <p className="mt-2 text-xs text-gray-400">Why: {entry.matchExplanation}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 lg:w-56">
          <Link
            href={`/oncadre/employer/candidates/${p.id}`}
            className="rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition hover:bg-[#0B3C5D]/5"
            style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
          >
            View profile
          </Link>
          <div className="flex flex-wrap gap-1.5">
            {moves.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={busy}
                onClick={() => onMove(entry.id, m.value)}
                title={m.meaning}
                className="flex-1 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition hover:opacity-80 disabled:opacity-40"
                style={{ background: m.bg, color: m.color }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
