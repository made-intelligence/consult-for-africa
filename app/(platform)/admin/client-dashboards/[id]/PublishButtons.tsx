"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublishButtons({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "publish" | "unpublish") {
    if (action === "publish" && !confirm("Publish this to the client portal? Every enabled contact on this client will see it.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/client-dashboards/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "That did not work");
    else router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "PUBLISHED" ? (
        <button
          onClick={() => act("publish")}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#0F2744", opacity: busy ? 0.6 : 1 }}
        >
          Publish to client
        </button>
      ) : (
        <button
          onClick={() => act("unpublish")}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ border: "1px solid #b3261e", color: "#b3261e", opacity: busy ? 0.6 : 1 }}
        >
          Withdraw from client
        </button>
      )}
      {error && <span className="text-sm" style={{ color: "#b3261e" }}>{error}</span>}
    </div>
  );
}
