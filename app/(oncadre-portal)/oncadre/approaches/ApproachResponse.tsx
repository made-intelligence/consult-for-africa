"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Yes or no, with the consequence of each spelled out before the click.
 *
 * Declining is offered as plainly as accepting. A consent gate that makes saying
 * no feel like the hidden option is not a consent gate.
 */
export default function ApproachResponse({
  requestId,
  orgName,
}: {
  requestId: string;
  orgName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function answer(accept: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cadre/approaches/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save that.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Could not save that. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || isPending;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => answer(true)}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: "#0B3C5D", minHeight: "44px" }}
        >
          {disabled ? "Saving..." : "Yes, they can contact me"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => answer(false)}
          className="rounded-xl px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-40"
          style={{ border: "1px solid #E8EBF0", color: "#6B7280", minHeight: "44px" }}
        >
          No thank you
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Yes gives {orgName} your email and phone number. No tells them you are not
        interested and stops them asking again. You do not have to give a reason.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
