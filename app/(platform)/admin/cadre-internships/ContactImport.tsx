"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isEmail, matchCentre, parseContacts } from "@/lib/cadreHealth/internship/outreach";

type Centre = { id: string; name: string; contactName: string | null; contactRole: string | null; contactEmail: string | null; contactPhone: string | null };

const SAMPLE = "Centre\tName\tRole\tEmail\tPhone\nThe Eko Hospital\tMrs A. Bello\tChief Nursing Officer\tnursing@ekohospital.com\t0803 000 0000";

/**
 * Contacts in bulk: paste rows from a spreadsheet, see which centre each one
 * matched, fix the ones it could not, then save. Details already on a centre
 * are kept unless "replace" is ticked.
 */
export default function ContactImport({ centres }: { centres: Centre[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [overwrite, setOverwrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const rows = useMemo(() => parseContacts(text).map((r) => ({ ...r, match: matchCentre(r.centre, centres) })), [text, centres]);
  const resolved = rows.map((r, i) => {
    const id = overrides[i] ?? r.match?.id ?? "";
    return { ...r, centreId: id, centreRec: centres.find((c) => c.id === id) ?? null, emailOk: !r.contactEmail || isEmail(r.contactEmail) };
  });
  const ready = resolved.filter((r) => r.centreId && r.emailOk);
  const missing = centres.filter((c) => !c.contactEmail);

  async function save() {
    setBusy(true);
    setError("");
    setMsg("");
    const res = await fetch("/api/cadre/admin/internships/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overwrite,
        rows: ready.map((r) => ({
          centreId: r.centreId,
          contactName: r.contactName || undefined,
          contactRole: r.contactRole || undefined,
          contactEmail: r.contactEmail || undefined,
          contactPhone: r.contactPhone || undefined,
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save");
    setMsg(`Saved ${data.updated} centre${data.updated === 1 ? "" : "s"}${data.unchanged ? `, ${data.unchanged} already had these details` : ""}.`);
    setText("");
    setOverrides({});
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
          <p className="text-sm font-semibold text-gray-900">Paste contacts</p>
          <p className="mt-1 text-xs text-gray-500">
            Copy the rows from Google Sheets or Excel and paste them here. Columns: centre, contact name, role, email, phone. A header row is fine, in any order.
          </p>
          <textarea rows={8} className="mt-3 w-full rounded-lg px-3 py-2 font-mono text-[12px] focus:outline-none" style={{ border: "1px solid #E8EBF0", background: "#F8F9FB" }} placeholder={SAMPLE} value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        {resolved.length > 0 && (
          <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-sm font-semibold text-gray-900">{ready.length} of {resolved.length} rows ready</p>
            <div className="mt-3 space-y-2">
              {resolved.map((r, i) => (
                <div key={i} className="grid gap-2 rounded-lg p-3 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ border: `1px solid ${r.centreId && r.emailOk ? "#E8EBF0" : "#FCA5A5"}` }}>
                  <div>
                    <p className="text-gray-500">You typed: <span className="text-gray-900">{r.centre}</span></p>
                    <p className="mt-0.5 text-gray-700">{[r.contactName, r.contactRole, r.contactEmail, r.contactPhone].filter(Boolean).join(" · ")}</p>
                    {!r.emailOk && <p className="mt-0.5 text-red-600">That email address does not look right.</p>}
                  </div>
                  <div>
                    <select className="w-full rounded-lg px-2 py-1.5 text-xs" style={{ border: "1px solid #E8EBF0", background: "#F8F9FB" }} value={r.centreId} onChange={(e) => setOverrides((o) => ({ ...o, [i]: e.target.value }))}>
                      <option value="">Not matched: choose the centre</option>
                      {centres.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {r.centreRec?.contactEmail && r.contactEmail && r.centreRec.contactEmail !== r.contactEmail && (
                      <p className="mt-1 text-amber-700">Already has {r.centreRec.contactEmail}{overwrite ? ", will be replaced" : ", kept unless you tick replace"}.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="accent-[#0B3C5D]" />
              Replace details a centre already has
            </label>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button type="button" onClick={save} disabled={busy || !ready.length} className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
              {busy ? "Saving..." : `Save ${ready.length} contact${ready.length === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </div>

      <div className="rounded-xl bg-white p-5 lg:self-start" style={{ border: "1px solid #E8EBF0" }}>
        <p className="text-sm font-semibold text-gray-900">Still without an email: {missing.length}</p>
        <p className="mt-1 text-xs text-gray-500">The person to find is whoever runs intern recruitment, usually the Head of Nursing or the Director of Nursing Services. A general info@ inbox is a start, not the goal.</p>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {missing.map((c) => <li key={c.id}>{c.name}</li>)}
        </ul>
      </div>
    </div>
  );
}
