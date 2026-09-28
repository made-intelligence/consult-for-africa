"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Moving a role through its life.
 *
 * Explicit buttons rather than a status dropdown, so the consequence of a click
 * is readable before it happens. Taking a role off the job board and closing it
 * for good are not neighbours in a list; one is reversible and the other asks
 * why first.
 */

interface Action {
  action: string;
  label: string;
  hint: string;
  tone: "primary" | "quiet" | "danger";
  confirm?: boolean;
}

/** What is worth offering from where the role currently is. */
function actionsFor(status: string, isPublished: boolean): Action[] {
  const republish: Action = {
    action: "publish",
    label: "Put on the job board",
    hint: "Candidates can find it and apply",
    tone: "primary",
  };
  const pause: Action = {
    action: "pause",
    label: "Take off the job board",
    hint: "Stops new applications, keeps everyone you have",
    tone: "quiet",
  };
  const filled: Action = {
    action: "filled",
    label: "Mark as filled",
    hint: "Someone accepted",
    tone: "primary",
    confirm: true,
  };
  const close: Action = {
    action: "close",
    label: "Close the role",
    hint: "No longer hiring for this",
    tone: "danger",
    confirm: true,
  };

  switch (status) {
    case "PLACED":
    case "CLOSED":
    case "CANCELLED":
      return [republish];
    case "SOURCING":
      return [republish, close];
    default:
      return [
        ...(isPublished ? [pause] : [republish]),
        { action: "interviewing", label: "Interviewing", hint: "You are meeting people", tone: "quiet" },
        filled,
        close,
      ];
  }
}

export default function RoleLifecycle({
  roleId,
  status,
  isPublished,
}: {
  roleId: string;
  status: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(action: string, withReason?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cadre/employer/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: withReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not do that.");
        return;
      }
      setConfirming(null);
      setReason("");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const actions = actionsFor(status, isPublished);
  const disabled = busy || isPending;

  const toneStyle = (tone: Action["tone"]) => {
    if (tone === "primary") {
      return { background: "#0B3C5D", color: "#FFF", border: "1px solid #0B3C5D" };
    }
    if (tone === "danger") {
      return { background: "#FFF", color: "#DC2626", border: "1px solid rgba(239,68,68,0.3)" };
    }
    return { background: "#FFF", color: "#0B3C5D", border: "1px solid #E8EBF0" };
  };

  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      {confirming ? (
        <div className="max-w-md">
          <p className="text-sm font-semibold text-gray-900">{confirming.label}?</p>
          <p className="mt-1 text-sm text-gray-500">
            {confirming.action === "filled"
              ? "This takes the role off the job board. Anyone still in the pipeline stays where they are, so you can tell them yourself."
              : "This takes the role off the job board and stops new applications."}
          </p>
          {confirming.action !== "filled" && (
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why, for your own records. Optional"
              className="mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
              style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
            />
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => run(confirming.action, reason || undefined)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: confirming.tone === "danger" ? "#DC2626" : "#0B3C5D" }}
            >
              {disabled ? "Working..." : confirming.label}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(null);
                setReason("");
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.action}
              type="button"
              disabled={disabled}
              onClick={() => (a.confirm ? setConfirming(a) : run(a.action))}
              title={a.hint}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ ...toneStyle(a.tone), minHeight: "44px" }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
