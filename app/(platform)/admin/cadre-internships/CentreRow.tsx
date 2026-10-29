"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAGE_LABEL } from "@/lib/cadreHealth/internship/programme";

type Centre = {
  id: string;
  name: string;
  area: string | null;
  ownership: string | null;
  stage: string;
  ownerUserId: string | null;
  contactName: string | null;
  contactRole: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  nextAction: string | null;
  nextActionDue: string | null;
  notes: string | null;
  slotsOffered: number | null;
  minScore: number | null;
  intakeNote: string | null;
  employerOrgId: string | null;
  listed: boolean;
  consentAt: string | null;
  consentName: string | null;
  consentRole: string | null;
  consentSource: string | null;
  consentNote: string | null;
};

const STAGE_STYLE: Record<string, { bg: string; fg: string }> = {
  PROSPECT: { bg: "#F3F4F6", fg: "#4B5563" },
  CONTACTED: { bg: "#EFF6FF", fg: "#1D4ED8" },
  MEETING: { bg: "#FEF3C7", fg: "#92400E" },
  COMMITTED: { bg: "#ECFDF5", fg: "#065F46" },
  DECLINED: { bg: "#FEE2E2", fg: "#991B1B" },
};

type Outreach = { id: string; direction: string; subject: string; status: string; error: string | null; date: string; by: string | null };

const input = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };

export default function CentreRow({
  centre,
  ownerName,
  choices,
  staff,
  orgs,
  history,
}: {
  centre: Centre;
  ownerName: string | null;
  choices: number;
  staff: { id: string; name: string | null }[];
  orgs: { id: string; name: string }[];
  history: Outreach[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(centre);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [recording, setRecording] = useState(false);
  const [consent, setConsent] = useState({ consentName: "", consentRole: "", note: "" });
  const set = (k: keyof Centre) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value === "" ? null : e.target.value }));

  async function save(patch: Partial<Centre>) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/cadre/admin/internships/centres/${centre.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save");
    router.refresh();
  }

  async function listing(body: Record<string, string>) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/cadre/admin/internships/centres/${centre.id}/listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save");
    if (data.url) {
      setLink(data.url);
      navigator.clipboard?.writeText(data.url).catch(() => {});
      return;
    }
    setRecording(false);
    router.refresh();
  }

  const st = STAGE_STYLE[centre.stage] ?? STAGE_STYLE.PROSPECT;
  const overdue = centre.nextActionDue && centre.nextActionDue < new Date().toISOString().slice(0, 10);
  const sent = history.filter((o) => o.direction === "OUT" && o.status === "SENT");

  return (
    <div className="rounded-xl bg-white" style={{ border: "1px solid #E8EBF0" }}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left">
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: st.bg, color: st.fg }}>{STAGE_LABEL[centre.stage]}</span>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={centre.listed ? { background: "#ECFDF5", color: "#065F46" } : { background: "#F3F4F6", color: "#6B7280" }}>
          {centre.listed ? "Listed" : "Not listed"}
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">
          {centre.name}
          <span className="font-normal text-gray-400"> · {[centre.area, centre.ownership?.toLowerCase()].filter(Boolean).join(", ")}</span>
        </span>
        <span className="text-xs text-gray-500">{ownerName ?? "No owner"}</span>
        <span className="text-xs tabular-nums text-gray-500">{choices} chose it</span>
        <span className="text-xs text-gray-500">
          {!centre.contactEmail ? <span style={{ color: "#B45309" }}>No email</span> : sent.length ? `Emailed ${sent.length}x, last ${sent[0].date}` : "Not emailed"}
        </span>
        {centre.nextAction && (
          <span className="w-full text-xs sm:w-auto" style={{ color: overdue ? "#B91C1C" : "#6B7280" }}>
            Next: {centre.nextAction}
            {centre.nextActionDue ? ` by ${centre.nextActionDue}` : ""}
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4" style={{ borderTop: "1px solid #F1F3F6" }}>
          <div className="flex flex-wrap gap-2 pt-4">
            {Object.keys(STAGE_LABEL).map((s) => (
              <button
                key={s}
                onClick={() => save({ stage: s })}
                disabled={busy || s === centre.stage}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                style={{ border: "1px solid #E8EBF0", background: s === centre.stage ? STAGE_STYLE[s].bg : "#fff", color: STAGE_STYLE[s].fg }}
              >
                {STAGE_LABEL[s]}
              </button>
            ))}
          </div>

          <div className="rounded-lg p-3" style={{ background: centre.listed ? "#F0FDF4" : "#F8F9FB", border: "1px solid #E8EBF0" }}>
            <p className="text-xs font-semibold text-gray-900">Public listing</p>
            {centre.listed ? (
              <p className="mt-1 text-xs text-gray-700">
                Listed for graduates. {centre.consentSource === "CLAIMED" ? "Claimed online" : "Consent recorded"} by {centre.consentName}, {centre.consentRole}
                {centre.consentAt ? ` on ${centre.consentAt}` : ""}. {centre.consentNote}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-600">
                Graduates cannot see or choose this centre until it agrees. Send the claim link: the centre claims its account, sets places and minimum score, and that is its consent.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {!centre.listed && (
                <>
                  <button onClick={() => listing({ action: "link" })} disabled={busy} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
                    Copy claim link
                  </button>
                  <button onClick={() => setRecording((r) => !r)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700" style={{ border: "1px solid #E8EBF0", background: "#fff" }}>
                    They agreed by phone or letter
                  </button>
                </>
              )}
              {centre.listed && (
                <button
                  onClick={() => {
                    const note = prompt(`Why is ${centre.name} coming off the public list?`);
                    if (note) listing({ action: "unlist", note });
                  }}
                  disabled={busy}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700"
                  style={{ border: "1px solid #FCA5A5", background: "#fff" }}
                >
                  Take off the public list
                </button>
              )}
            </div>
            {link && <p className="mt-2 break-all text-xs text-emerald-700">Copied: {link}</p>}
            {recording && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input className={input} style={inputStyle} placeholder="Who agreed" value={consent.consentName} onChange={(e) => setConsent((c) => ({ ...c, consentName: e.target.value }))} />
                <input className={input} style={inputStyle} placeholder="Their role" value={consent.consentRole} onChange={(e) => setConsent((c) => ({ ...c, consentRole: e.target.value }))} />
                <input className={`${input} sm:col-span-2`} style={inputStyle} placeholder="How and when, e.g. letter dated 3 Nov, filed in Drive" value={consent.note} onChange={(e) => setConsent((c) => ({ ...c, note: e.target.value }))} />
                <button onClick={() => listing({ action: "record", ...consent })} disabled={busy} className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2" style={{ background: "#0B3C5D" }}>
                  Record consent and list the centre
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-xs text-gray-600">
              Owner
              <select className={`${input} mt-1`} style={inputStyle} value={f.ownerUserId ?? ""} onChange={set("ownerUserId")}>
                <option value="">No owner</option>
                {staff.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-gray-600">Contact name<input className={`${input} mt-1`} style={inputStyle} value={f.contactName ?? ""} onChange={set("contactName")} /></label>
            <label className="block text-xs text-gray-600">Their role<input className={`${input} mt-1`} style={inputStyle} placeholder="e.g. Head of Nursing" value={f.contactRole ?? ""} onChange={set("contactRole")} /></label>
            <label className="block text-xs text-gray-600">Contact email<input className={`${input} mt-1`} style={inputStyle} value={f.contactEmail ?? ""} onChange={set("contactEmail")} /></label>
            <label className="block text-xs text-gray-600">Contact phone<input className={`${input} mt-1`} style={inputStyle} value={f.contactPhone ?? ""} onChange={set("contactPhone")} /></label>
            <label className="block text-xs text-gray-600">Next action due<input type="date" className={`${input} mt-1`} style={inputStyle} value={f.nextActionDue ?? ""} onChange={set("nextActionDue")} /></label>
            <label className="block text-xs text-gray-600 sm:col-span-2 lg:col-span-3">Next action<input className={`${input} mt-1`} style={inputStyle} placeholder="e.g. Meet the Head of Nursing with the one-pager" value={f.nextAction ?? ""} onChange={set("nextAction")} /></label>
            <label className="block text-xs text-gray-600">Places for this intake<input type="number" min={0} className={`${input} mt-1`} style={inputStyle} value={f.slotsOffered ?? ""} onChange={set("slotsOffered")} /></label>
            <label className="block text-xs text-gray-600">Minimum score (%)<input type="number" min={0} max={100} className={`${input} mt-1`} style={inputStyle} value={f.minScore ?? ""} onChange={set("minScore")} /></label>
            <label className="block text-xs text-gray-600">Intake timing<input className={`${input} mt-1`} style={inputStyle} placeholder="e.g. January and July" value={f.intakeNote ?? ""} onChange={set("intakeNote")} /></label>
            <label className="block text-xs text-gray-600 sm:col-span-2 lg:col-span-3">
              Employer login that sees this centre&apos;s list
              <select className={`${input} mt-1`} style={inputStyle} value={f.employerOrgId ?? ""} onChange={set("employerOrgId")}>
                <option value="">Not linked</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-gray-600 sm:col-span-2 lg:col-span-3">Notes<textarea rows={3} className={`${input} mt-1`} style={inputStyle} value={f.notes ?? ""} onChange={set("notes")} /></label>
          </div>
          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700">History</p>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                {history.map((o) => (
                  <li key={o.id}>
                    <span className="tabular-nums text-gray-400">{o.date}</span> {o.direction === "IN" ? "They enquired" : `Emailed${o.by ? ` by ${o.by}` : ""}`}: {o.subject}
                    {o.status === "FAILED" && <span className="text-red-600"> (failed: {o.error})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={() =>
              save({
                ownerUserId: f.ownerUserId,
                contactName: f.contactName,
                contactRole: f.contactRole,
                contactEmail: f.contactEmail,
                contactPhone: f.contactPhone,
                nextAction: f.nextAction,
                nextActionDue: f.nextActionDue,
                slotsOffered: f.slotsOffered,
                minScore: f.minScore,
                intakeNote: f.intakeNote,
                employerOrgId: f.employerOrgId,
                notes: f.notes,
              })
            }
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#0B3C5D" }}
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
