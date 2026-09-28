"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, ShieldOff } from "lucide-react";

/**
 * Verification releases contact details to a hospital, so both directions are
 * deliberate: granting it takes one press, withdrawing it asks for a reason
 * first. Buttons rather than a status dropdown, so the consequence of the click
 * is readable before it happens.
 */
export function EmployerVerifyButton({
  orgId,
  isVerified,
  orgName,
}: {
  orgId: string;
  isVerified: boolean;
  orgName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(verified: boolean, reason?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cadre-employers/${orgId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified, note: reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save that.");
        return;
      }
      setConfirming(false);
      setNote("");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || isPending;

  if (isVerified) {
    if (confirming) {
      return (
        <div className="max-w-xs space-y-2">
          <p className="text-xs text-gray-600">
            Withdrawing verification stops {orgName} approaching professionals. Why?
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. licence lapsed, could not confirm the facility"
            className="w-full rounded-lg px-2.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            style={{ border: "1px solid #E8EBF0" }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !note.trim()}
              onClick={() => submit(false, note)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#DC2626" }}
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3" />}
              Withdraw
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setNote("");
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
        style={{ borderColor: "#E8EBF0", color: "#6B7280" }}
      >
        <ShieldOff className="h-3 w-3" />
        Withdraw verification
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => submit(true)}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "#059669" }}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <BadgeCheck className="h-3 w-3" />}
        Verify employer
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
