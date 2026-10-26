"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WatchActions({ id, hasEngagement }: { id: string; hasEngagement: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function act(what: "run" | "draft") {
    setBusy(what);
    setNote(what === "run" ? "Asking every source. This can take a few minutes." : null);
    const res = await fetch(`/api/admin/market-watch/${id}/${what}`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setNote(json.error ?? "That did not work");
    if (what === "draft") {
      if (json.dashboardId) router.push(`/admin/client-dashboards/${json.dashboardId}`);
      else setNote(`Composed, but this watch is not linked to a client project, so there is nowhere to save it. Headline: ${json.headline}`);
      return;
    }
    const ran = (json.sources ?? []) as { source: string; status: string; inserted?: number; detail?: string }[];
    const errors = ran.filter((r) => r.status === "error");
    setNote(`${ran.reduce((s, r) => s + (r.inserted ?? 0), 0)} new, ${json.read ?? 0} read, ${json.raised ?? 0} alerts${errors.length ? `. Failed: ${errors.map((e) => e.source).join(", ")}` : ""}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <a href={`/admin/market-watch/${id}/setup`} className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ border: "1px solid #e5eaf0", color: "#0F2744" }}>
          Brands and sources
        </a>
        <button onClick={() => act("draft")} disabled={!!busy} className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ border: "1px solid #e5eaf0", color: "#0F2744", opacity: busy ? 0.6 : 1 }} title={hasEngagement ? "" : "Link a client project on the setup page first"}>
          {busy === "draft" ? "Composing…" : "Draft weekly dashboard"}
        </button>
        <button onClick={() => act("run")} disabled={!!busy} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap" style={{ background: "#0F2744", opacity: busy ? 0.6 : 1 }}>
          {busy === "run" ? "Running…" : "Run now"}
        </button>
      </div>
      {note && <p className="text-xs text-gray-500 max-w-md text-right">{note}</p>}
    </div>
  );
}
