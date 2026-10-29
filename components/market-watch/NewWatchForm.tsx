"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Opt = { id: string; name: string };

export default function NewWatchForm({ clients, engagements, sectors }: { clients: Opt[]; engagements: (Opt & { clientId: string })[]; sectors: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("healthcare");
  const [clientId, setClientId] = useState("");
  const [engagementId, setEngagementId] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const input = "w-full rounded-lg px-3 py-2 text-sm";
  const border = { border: "1px solid #e5eaf0" };

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/market-watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sector, clientId: clientId || null, engagementId: engagementId || null, context: context || null }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "That did not work");
    router.push(`/admin/market-watch/${json.id}/setup`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-gray-600">Name
        <input className={input} style={border} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Medlyfe" />
      </label>
      <label className="text-xs font-semibold text-gray-600">Sector
        <select className={input} style={border} value={sector} onChange={(e) => setSector(e.target.value)}>
          {sectors.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-gray-600">Client (optional; leave empty for our own brands)
        <select className={input} style={border} value={clientId} onChange={(e) => { setClientId(e.target.value); setEngagementId(""); }}>
          <option value="">None</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-gray-600">Client portal project (where the weekly dashboard goes)
        <select className={input} style={border} value={engagementId} onChange={(e) => setEngagementId(e.target.value)} disabled={!clientId}>
          <option value="">None</option>
          {engagements.filter((e) => e.clientId === clientId).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">What the business does, in a sentence
        <input className={input} style={border} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Helps the reader tell a mention of this business from a namesake" />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button onClick={create} disabled={busy || name.trim().length < 2} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#0F2744", opacity: busy || name.trim().length < 2 ? 0.6 : 1 }}>
          Start watch
        </button>
        {error && <span className="text-sm" style={{ color: "#b3261e" }}>{error}</span>}
      </div>
    </div>
  );
}
