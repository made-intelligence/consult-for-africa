"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Explicit buttons for the next step only, never a status dropdown.
const NEXT: Record<string, { action: string; label: string; primary?: boolean }[]> = {
  PENDING: [
    { action: "invite", label: "Invite to interview", primary: true },
    { action: "decline", label: "Not progressing" },
  ],
  INVITED: [
    { action: "offer", label: "Offer a place", primary: true },
    { action: "decline", label: "Not progressing" },
  ],
};

export default function InternActions({ preferenceId, status }: { preferenceId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const actions = NEXT[status];
  if (!actions) return null;

  async function act(action: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/cadre/employer/internships/${preferenceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.action}
          onClick={() => act(a.action)}
          disabled={busy}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={a.primary ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#374151" }}
        >
          {a.label}
        </button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
