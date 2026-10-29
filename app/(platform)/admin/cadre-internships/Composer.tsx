"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { INTAKE_LABEL, STAGE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { MERGE_FIELDS, PRESETS, PROGRAMME_LEAD, asksToClaim, greetingFor, renderText, unknownFields, type OutreachVars } from "@/lib/cadreHealth/internship/outreach";

type Centre = {
  id: string;
  name: string;
  partnerLed: boolean;
  listed: boolean;
  area: string | null;
  stage: string;
  ownerUserId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  choices: number;
  emailedCount: number;
  lastEmailed: string | null;
};

type Result = { sent: number; failed: { name: string; error: string }[]; skipped: { name: string; reason: string }[] };

const input = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
const inputStyle = { border: "1px solid #E8EBF0", background: "#F8F9FB" };
const MAX = 60;

/**
 * Bulk email to centres. Pick a preset, edit it, choose who gets it, read the
 * copy as one centre will see it, send yourself a test, then send. Each centre
 * gets its own copy with its own name and its own demand figure.
 */
export default function Composer({
  me,
  weekAgo,
  senderName,
  replyTo,
  centresPage,
  figures,
  staff,
  centres,
}: {
  me: string;
  /** YYYY-MM-DD, from the server so the render is pure. */
  weekAgo: string;
  senderName: string;
  replyTo: string;
  centresPage: string;
  figures: { applicants: number; centres: number };
  staff: { id: string; name: string | null }[];
  centres: Centre[];
}) {
  const router = useRouter();
  const [preset, setPreset] = useState(PRESETS[0].key);
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [body, setBody] = useState(PRESETS[0].body);
  const [stages, setStages] = useState<string[]>(["PROSPECT"]);
  const [owner, setOwner] = useState<string>("");
  const [notRecent, setNotRecent] = useState(true);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string>("");
  const [busy, setBusy] = useState<"" | "test" | "send">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const p = PRESETS.find((x) => x.key === preset);

  const audience = useMemo(
    () =>
      centres.filter(
        (c) =>
          c.stage !== "DECLINED" &&
          (!stages.length || stages.includes(c.stage)) &&
          (!owner || (owner === "none" ? !c.ownerUserId : c.ownerUserId === owner)) &&
          (!notRecent || !c.lastEmailed || c.lastEmailed < weekAgo),
      ),
    [centres, stages, owner, notRecent, weekAgo],
  );
  const claiming = asksToClaim(subject, body);
  const sendable = (c: Centre) => !c.partnerLed && !!c.contactEmail && !(claiming && c.listed);
  const selected = audience.filter((c) => chosen.has(c.id) && sendable(c));
  const previewCentre = centres.find((c) => c.id === previewId) ?? selected[0] ?? audience.find(sendable) ?? null;
  const bad = unknownFields(subject + body);

  const vars = (c: Centre | null): OutreachVars => ({
    greeting: greetingFor(c?.contactName),
    centreName: c?.name ?? "Example Hospital",
    choices: String(c?.choices ?? 0),
    applicants: String(figures.applicants),
    centres: String(figures.centres),
    intake: INTAKE_LABEL,
    centresPage,
    claimLink: centresPage.replace(/centres$/, "claim/") + "(this centre's private link)",
    senderName: senderName || PROGRAMME_LEAD.name,
    senderRole: PROGRAMME_LEAD.role,
  });

  function pick(key: string) {
    const x = PRESETS.find((q) => q.key === key)!;
    setPreset(key);
    setSubject(x.subject);
    setBody(x.body);
    setResult(null);
    // A follow-up goes to people we have written to; a first approach to people we have not.
    if (key === "intro") setStages(["PROSPECT"]);
    if (key === "followup") setStages(["CONTACTED"]);
    if (key === "demand") setStages(["PROSPECT", "CONTACTED", "MEETING"]);
    if (key === "commit") setStages(["MEETING"]);
  }

  function insert(field: string) {
    const el = bodyRef.current;
    const tag = `{{${field}}}`;
    if (!el) return setBody((b) => b + tag);
    const { selectionStart: a, selectionEnd: b } = el;
    setBody(body.slice(0, a) + tag + body.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = a + tag.length;
    });
  }

  const toggle = (id: string) => setChosen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selectAll = () => setChosen(new Set(audience.filter(sendable).slice(0, MAX).map((c) => c.id)));

  async function post(test: boolean) {
    setBusy(test ? "test" : "send");
    setError("");
    setNote("");
    const res = await fetch("/api/cadre/admin/internships/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ centreIds: test ? (previewCentre ? [previewCentre.id] : []) : selected.map((c) => c.id), subject, body, template: preset, test }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) return setError(data.error || "Something went wrong");
    if (test) return setNote(`Test sent to ${data.to}. Check it on your phone before you send.`);
    setResult(data);
    setChosen(new Set());
    router.refresh();
  }

  function send() {
    if (!selected.length) return setError("Choose at least one centre.");
    if (!confirm(`Send "${renderText(subject, vars(selected[0]))}" to ${selected.length} centre${selected.length === 1 ? "" : "s"}? Each gets its own copy.`)) return;
    post(false);
  }

  const chip = (on: boolean) => (on ? { background: "#0B3C5D", color: "#fff", border: "1px solid #0B3C5D" } : { border: "1px solid #E8EBF0", color: "#4B5563", background: "#fff" });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
          <p className="text-sm font-semibold text-gray-900">1. The email</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((x) => (
              <button key={x.key} type="button" onClick={() => pick(x.key)} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={chip(preset === x.key)}>
                {x.label}
              </button>
            ))}
          </div>
          {p && <p className="mt-2 text-xs text-gray-500">{p.when}</p>}
          <label className="mt-4 block text-xs text-gray-600">
            Subject
            <input className={`${input} mt-1`} style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="mt-3 block text-xs text-gray-600">
            Message
            <textarea ref={bodyRef} rows={18} className={`${input} mt-1 font-mono text-[13px] leading-relaxed`} style={inputStyle} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MERGE_FIELDS.map((f) => (
              <button key={f.key} type="button" title={f.meaning} onClick={() => insert(f.key)} className="rounded px-2 py-0.5 text-[11px] font-mono text-[#0B3C5D]" style={{ background: "rgba(11,60,93,0.06)" }}>
                {`{{${f.key}}}`}
              </button>
            ))}
          </div>
          {bad.length > 0 && <p className="mt-2 text-xs text-red-600">Not a merge field: {bad.map((b) => `{{${b}}}`).join(", ")}</p>}
          <p className="mt-3 text-[11px] text-gray-400">Sent from CadreHealth. Replies go to {replyTo}.</p>
        </div>

        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
          <p className="text-sm font-semibold text-gray-900">2. Who gets it</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(STAGE_LABEL).filter((s) => s !== "DECLINED").map((s) => (
              <button key={s} type="button" onClick={() => setStages((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))} className="rounded-full px-3 py-1 text-xs font-medium" style={chip(stages.includes(s))}>
                {STAGE_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <select className="rounded-lg px-2 py-1.5 text-xs" style={inputStyle} value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">Any owner</option>
              <option value={me}>Mine</option>
              <option value="none">No owner</option>
              {staff.filter((u) => u.id !== me).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={notRecent} onChange={(e) => setNotRecent(e.target.checked)} className="accent-[#0B3C5D]" />
              Leave out centres emailed in the last 7 days
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">{selected.length} chosen of {audience.filter(sendable).length} that can be emailed</span>
            <span className="space-x-3">
              <button type="button" onClick={selectAll} className="font-medium text-[#0B3C5D] hover:underline">Choose all</button>
              <button type="button" onClick={() => setChosen(new Set())} className="text-gray-500 hover:underline">Clear</button>
            </span>
          </div>
          <div className="mt-2 max-h-80 overflow-y-auto rounded-lg" style={{ border: "1px solid #E8EBF0" }}>
            {audience.length === 0 && <p className="p-4 text-center text-sm text-gray-400">No centres match.</p>}
            {audience.map((c) => {
              const ok = sendable(c);
              const why = c.partnerLed ? "Goes through Debo first" : !c.contactEmail ? "No email yet: add one on the Contacts tab" : !ok ? "Already listed, so it needs no claim link" : null;
              return (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50" style={{ borderBottom: "1px solid #F1F3F6", opacity: ok ? 1 : 0.5 }}>
                  <input type="checkbox" disabled={!ok} checked={chosen.has(c.id) && ok} onChange={() => toggle(c.id)} className="accent-[#0B3C5D]" />
                  <span className="min-w-0 flex-1">
                    <span className="text-gray-900">{c.name}</span>
                    <span className="block truncate text-[11px] text-gray-500">
                      {why ?? `${c.contactName ?? "Head of Nursing"} · ${c.contactEmail}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] text-gray-500">
                    {c.choices} chose it
                    <span className="block">{c.lastEmailed ? `last ${c.lastEmailed}` : "never emailed"}</span>
                  </span>
                  {ok && (
                    <button type="button" onClick={(e) => { e.preventDefault(); setPreviewId(c.id); }} className="shrink-0 text-[11px] text-[#0B3C5D] hover:underline">
                      Preview
                    </button>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
          <p className="text-sm font-semibold text-gray-900">3. As {previewCentre?.name ?? "a centre"} will see it</p>
          <div className="mt-3 rounded-lg p-4" style={{ background: "#F8F9FB", border: "1px solid #E8EBF0" }}>
            <p className="text-xs text-gray-500">To: {previewCentre?.contactEmail ?? "no address"}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{renderText(subject, vars(previewCentre))}</p>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{renderText(body, vars(previewCentre))}</div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {note && <p className="mt-3 text-sm text-emerald-700">{note}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => post(true)} disabled={!!busy || bad.length > 0} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#0B3C5D] disabled:opacity-50" style={{ border: "1px solid #0B3C5D" }}>
              {busy === "test" ? "Sending..." : "Send me a test"}
            </button>
            <button type="button" onClick={send} disabled={!!busy || bad.length > 0 || !selected.length} className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
              {busy === "send" ? `Sending to ${selected.length}... keep this tab open` : `Send to ${selected.length} centre${selected.length === 1 ? "" : "s"}`}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            A centre we had not approached moves to Contacted, with a phone follow-up due in a week. Bounced and opted-out addresses are skipped. At most {MAX} per send.
          </p>
        </div>

        {result && (
          <div className="rounded-xl bg-white p-5 text-sm" style={{ border: "1px solid #E8EBF0" }}>
            <p className="font-semibold text-gray-900">Sent {result.sent}</p>
            {result.failed.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-red-700">
                {result.failed.map((f) => <li key={f.name}>{f.name}: {f.error}</li>)}
              </ul>
            )}
            {result.skipped.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-gray-500">
                {result.skipped.map((s) => <li key={s.name}>Skipped {s.name}: {s.reason}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
