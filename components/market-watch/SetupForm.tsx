"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Opt = { id: string; name: string };
export type EntityRow = {
  id: string;
  name: string;
  role: "OWN" | "COMPETITOR";
  keywords: string[];
  excludes: string[];
  googlePlaceId: string | null;
  googleCid: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  xHandle: string | null;
  facebookPage: string | null;
  website: string | null;
  awarioAlertId: string | null;
  trackedUrls: string[];
  active: boolean;
};
type WatchRow = { id: string; name: string; sector: string; context: string | null; clientId: string | null; engagementId: string | null; alertEmails: string[]; status: "ACTIVE" | "PAUSED" };

const input = "w-full rounded-lg px-3 py-2 text-sm";
const border = { border: "1px solid #e5eaf0" };
const label = "text-xs font-semibold text-gray-600 block";
const split = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

async function send(url: string, method: string, body?: unknown): Promise<string | null> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (res.ok) return null;
  return (await res.json().catch(() => ({}))).error ?? "That did not work";
}

export default function SetupForm({ watch, entities, clients, engagements, sectors }: { watch: WatchRow; entities: EntityRow[]; clients: Opt[]; engagements: (Opt & { clientId: string })[]; sectors: string[] }) {
  const router = useRouter();
  const [w, setW] = useState({ ...watch, emails: watch.alertEmails.join(", ") });
  const [msg, setMsg] = useState<string | null>(null);

  async function saveWatch() {
    const err = await send(`/api/admin/market-watch/${watch.id}`, "PATCH", {
      name: w.name, sector: w.sector, context: w.context, clientId: w.clientId, engagementId: w.engagementId, alertEmails: split(w.emails), status: w.status,
    });
    setMsg(err ?? "Saved");
    router.refresh();
  }

  async function add(role: "OWN" | "COMPETITOR") {
    const name = prompt(role === "OWN" ? "Brand name" : "Competitor name");
    if (!name) return;
    const err = await send(`/api/admin/market-watch/${watch.id}/entities`, "POST", { name, role, keywords: [name] });
    if (err) setMsg(err);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 grid gap-3 sm:grid-cols-3" style={border}>
        <label className={label}>Name<input className={input} style={border} value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} /></label>
        <label className={label}>Sector
          <select className={input} style={border} value={w.sector} onChange={(e) => setW({ ...w, sector: e.target.value })}>
            {sectors.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </label>
        <label className={label}>Status
          <select className={input} style={border} value={w.status} onChange={(e) => setW({ ...w, status: e.target.value as WatchRow["status"] })}>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </label>
        <label className={label}>Client
          <select className={input} style={border} value={w.clientId ?? ""} onChange={(e) => setW({ ...w, clientId: e.target.value || null, engagementId: null })}>
            <option value="">None (our own brand)</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className={label}>Client portal project
          <select className={input} style={border} value={w.engagementId ?? ""} onChange={(e) => setW({ ...w, engagementId: e.target.value || null })} disabled={!w.clientId}>
            <option value="">None</option>
            {engagements.filter((e) => e.clientId === w.clientId).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className={label}>CFA recipients for alerts and the brief
          <input className={input} style={border} value={w.emails} onChange={(e) => setW({ ...w, emails: e.target.value })} placeholder="name@consultforafrica.com, ..." />
        </label>
        <label className={`${label} sm:col-span-3`}>What the business does (helps the reader judge relevance)
          <input className={input} style={border} value={w.context ?? ""} onChange={(e) => setW({ ...w, context: e.target.value })} />
        </label>
        <div className="sm:col-span-3 flex items-center gap-3">
          <button onClick={saveWatch} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#0F2744" }}>Save settings</button>
          {msg && <span className="text-sm text-gray-500">{msg}</span>}
          <span className="ml-auto flex gap-2">
            <button onClick={() => add("OWN")} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ ...border, color: "#0F2744" }}>Add own brand</button>
            <button onClick={() => add("COMPETITOR")} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ ...border, color: "#0F2744" }}>Add competitor</button>
          </span>
        </div>
      </div>

      {entities.length === 0 && <p className="text-sm text-gray-500">No brands yet. Add the client&apos;s own brand first, then three to eight competitors.</p>}
      {entities.map((e) => <EntityCard key={e.id} e={e} />)}
      <p className="text-xs text-gray-500">Search terms match whole words only, so a brand called &quot;Haven&quot; will not pick up &quot;safe haven&quot;. Add a word to &quot;Ignore when it mentions&quot; to drop a namesake.</p>
    </div>
  );
}

function EntityCard({ e }: { e: EntityRow }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: e.name,
    keywords: e.keywords.join(", "),
    excludes: e.excludes.join(", "),
    instagramHandle: e.instagramHandle ?? "",
    tiktokHandle: e.tiktokHandle ?? "",
    xHandle: e.xHandle ?? "",
    facebookPage: e.facebookPage ?? "",
    website: e.website ?? "",
    awarioAlertId: e.awarioAlertId ?? "",
    trackedUrls: e.trackedUrls.join("\n"),
    googleCid: e.googleCid ?? "",
    googlePlaceId: e.googlePlaceId ?? "",
    placeLabel: e.googleCid || e.googlePlaceId ? "Linked" : "",
    active: e.active,
  });
  const [q, setQ] = useState(e.name);
  const [places, setPlaces] = useState<{ title: string; cid: string | null; placeId: string | null; address: string | null; rating: number | null; reviews: number | null }[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function find() {
    setMsg("Searching Google Maps…");
    const res = await fetch(`/api/admin/market-watch/find-place?q=${encodeURIComponent(q)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(json.error ?? "Search failed");
    setMsg(null);
    setPlaces(json.places ?? []);
  }

  async function save() {
    const err = await send(`/api/admin/market-watch/entities/${e.id}`, "PATCH", {
      name: f.name,
      keywords: split(f.keywords),
      excludes: split(f.excludes),
      instagramHandle: f.instagramHandle,
      tiktokHandle: f.tiktokHandle,
      xHandle: f.xHandle,
      facebookPage: f.facebookPage,
      website: f.website,
      awarioAlertId: f.awarioAlertId,
      trackedUrls: split(f.trackedUrls),
      googleCid: f.googleCid,
      googlePlaceId: f.googlePlaceId,
      active: f.active,
    });
    setMsg(err ?? "Saved");
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Stop following ${e.name}? Its mentions stay, unfiled.`)) return;
    await send(`/api/admin/market-watch/entities/${e.id}`, "DELETE");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl p-5 space-y-3" style={border}>
      <div className="flex items-center justify-between gap-3">
        <input className="text-base font-bold rounded-md px-2 py-1 -ml-2" style={{ color: "#0F2744" }} value={f.name} onChange={(x) => setF({ ...f, name: x.target.value })} />
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: e.role === "OWN" ? "#E0F2FE" : "#F1F5F9", color: e.role === "OWN" ? "#075985" : "#475569" }}>
          {e.role === "OWN" ? "Client brand" : "Competitor"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Search terms (comma separated)<input className={input} style={border} value={f.keywords} onChange={(x) => setF({ ...f, keywords: x.target.value })} /></label>
        <label className={label}>Ignore when it mentions<input className={input} style={border} value={f.excludes} onChange={(x) => setF({ ...f, excludes: x.target.value })} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className={label}>Instagram<input className={input} style={border} value={f.instagramHandle} onChange={(x) => setF({ ...f, instagramHandle: x.target.value })} placeholder="@handle" /></label>
        <label className={label}>TikTok<input className={input} style={border} value={f.tiktokHandle} onChange={(x) => setF({ ...f, tiktokHandle: x.target.value })} placeholder="@handle" /></label>
        <label className={label}>X<input className={input} style={border} value={f.xHandle} onChange={(x) => setF({ ...f, xHandle: x.target.value })} placeholder="@handle" /></label>
        <label className={label}>Facebook page<input className={input} style={border} value={f.facebookPage} onChange={(x) => setF({ ...f, facebookPage: x.target.value })} placeholder="facebook.com/..." /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className={label}>Google place {f.placeLabel && <span className="text-green-700">· {f.placeLabel}</span>}</span>
          <div className="flex gap-2">
            <input className={input} style={border} value={q} onChange={(x) => setQ(x.target.value)} placeholder="Find on Google Maps" />
            <button onClick={find} className="px-3 rounded-lg text-sm font-semibold" style={{ ...border, color: "#0F2744" }}>Find</button>
          </div>
          {places && (
            <ul className="mt-2 space-y-1">
              {places.length === 0 && <li className="text-xs text-gray-500">Nothing found. Try the name as it appears on Maps.</li>}
              {places.map((p) => (
                <li key={(p.cid ?? p.placeId) + p.title}>
                  <button
                    onClick={() => { setF({ ...f, googleCid: p.cid ?? "", googlePlaceId: p.placeId ?? "", placeLabel: p.title }); setPlaces(null); }}
                    className="text-left text-xs w-full rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <strong>{p.title}</strong> {p.address && <span className="text-gray-500">· {p.address}</span>} {p.rating != null && <span className="text-gray-500">· {p.rating} from {p.reviews ?? "?"}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className={label}>Pages to watch for changes (one URL a line)
          <textarea className={input} style={border} rows={3} value={f.trackedUrls} onChange={(x) => setF({ ...f, trackedUrls: x.target.value })} placeholder="https://competitor.ng/prices" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Website<input className={input} style={border} value={f.website} onChange={(x) => setF({ ...f, website: x.target.value })} /></label>
        <label className={label}>Awario alert id (optional)<input className={input} style={border} value={f.awarioAlertId} onChange={(x) => setF({ ...f, awarioAlertId: x.target.value })} /></label>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#0F2744" }}>Save {e.role === "OWN" ? "brand" : "competitor"}</button>
        <label className="text-sm flex items-center gap-2 text-gray-600"><input type="checkbox" checked={f.active} onChange={(x) => setF({ ...f, active: x.target.checked })} /> Following</label>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
        <button onClick={remove} className="ml-auto text-sm" style={{ color: "#b3261e" }}>Remove</button>
      </div>
    </div>
  );
}
