"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockOpen } from "lucide-react";

/**
 * Closing a survey stamps its response count so a figure quoted in a client
 * report cannot drift underneath it afterwards.
 *
 * Closing does not stop the form accepting responses. A survey that silently
 * turned respondents away after a date would cost us data and tell nobody; one
 * whose numbers move is merely a fact to be recorded, which is what the frozen
 * count is for.
 */

interface Props {
  slug: string;
  liveCount: number;
  closure: { closedAt: string; frozenCount: number; note: string | null } | null;
}

export default function SurveyCloseControl({ slug, liveCount, closure }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function send(action: "close" | "reopen") {
    setError(null);
    start(async () => {
      const res = await fetch(`/api/admin/surveys/${slug}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "That did not save. Try again.");
        return;
      }
      setOpen(false);
      setNote("");
      router.refresh();
    });
  }

  if (closure) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-bold text-[#0F2744]">Closed</h2>
            </div>
            <p className="mt-1.5 text-sm text-gray-600">
              Frozen at <span className="font-semibold tabular-nums">{closure.frozenCount}</span>{" "}
              responses on{" "}
              {new Date(closure.closedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              . That is the number a report of this survey may quote.
            </p>
            {closure.note && <p className="mt-2 text-sm text-gray-700">{closure.note}</p>}
          </div>
          <button
            onClick={() => send("reopen")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <LockOpen className="h-3.5 w-3.5" />
            {pending ? "Reopening" : "Reopen"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#0F2744]">Collecting</h2>
          <p className="mt-1.5 text-sm text-gray-600">
            {liveCount} response{liveCount === 1 ? "" : "s"} so far. Close it when the fieldwork is
            done and the count is stamped, so a figure in a client report cannot move afterwards.
          </p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            disabled={liveCount === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            title={liveCount === 0 ? "Nothing to freeze yet" : undefined}
          >
            <Lock className="h-3.5 w-3.5" />
            Close at {liveCount}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 border-t pt-4">
          <label htmlFor="closure-note" className="text-[12px] font-semibold text-gray-700">
            Anything a later reader needs to know (optional)
          </label>
          <textarea
            id="closure-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="For example: fieldwork ended, results used in the Phase 2 report."
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => send("close")}
              disabled={pending}
              className="rounded-lg bg-[#0F2744] px-3 py-1.5 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Closing" : `Freeze at ${liveCount}`}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setNote("");
              }}
              className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
