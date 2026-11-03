"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "TARGET" | "CONTACTED" | "INTERESTED" | "SLA_SENT" | "SIGNED" | "DOCS_COMPLETE" | "WITH_CLIENT" | "PARKED";

const STAGE_LABELS: Record<Stage, string> = {
  TARGET: "Target",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  SLA_SENT: "SLA sent",
  SIGNED: "SLA signed",
  DOCS_COMPLETE: "Docs complete",
  WITH_CLIENT: "With client",
  PARKED: "Parked",
};
const STAGE_STYLE: Record<Stage, { background: string; color: string }> = {
  TARGET: { background: "#F1F5F9", color: "#475569" },
  CONTACTED: { background: "#EEF2FF", color: "#3730A3" },
  INTERESTED: { background: "#EFF6FF", color: "#1D4ED8" },
  SLA_SENT: { background: "#FFFBEB", color: "#92400E" },
  SIGNED: { background: "#ECFDF5", color: "#065F46" },
  DOCS_COMPLETE: { background: "#ECFDF5", color: "#065F46" },
  WITH_CLIENT: { background: "#D1FAE5", color: "#064E3B" },
  PARKED: { background: "#F8FAFC", color: "#94A3B8" },
};
const SIGNED: Stage[] = ["SIGNED", "DOCS_COMPLETE", "WITH_CLIENT"];
const CLOSED: Stage[] = [...SIGNED, "PARKED"];

export interface DeskRow {
  id: string;
  facility: string;
  groupName: string | null;
  facilityType: string | null;
  lga: string | null;
  area: string | null;
  contactName: string | null;
  contactRole: string | null;
  phone: string | null;
  email: string | null;
  signatoryName: string | null;
  signatoryPhone: string | null;
  signatoryEmail: string | null;
  source: string | null;
  ownerId: string | null;
  ownerName: string | null;
  stage: Stage;
  slaSentLabel: string | null;
  daysOut: number | null;
  signedLabel: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  nextActionLabel: string | null;
  due: boolean;
  overdue: boolean;
  objection: string | null;
  notes: string | null;
  chaseCount: number;
  chasePaused: boolean;
  lastContactLabel: string | null;
  returnLink: string;
  whatsapp: string | null;
  hasSignedFile: boolean;
  documents: number;
  events: { id: string; kind: string; note: string | null; stageLabel: string | null; actor: string | null; at: string }[];
}

export interface CheckIn {
  userId: string;
  name: string;
  contacts: number;
  calls: number;
  emails: number;
  whatsapps: number;
  visits: number;
  slasSent: number;
  signedToday: string[];
  slaOut: number;
  dueTomorrow: number;
  overdue: number;
}

interface Programme {
  id: string;
  name: string;
  engagementName: string;
  baselineSigned: number;
  target: number;
  deadlineLabel: string | null;
  senderName: string;
  chaseEnabled: boolean;
  chaseDays: number[];
  chaseSubject: string;
  chaseBody: string;
  documentsChecklist: string | null;
  slaFileName: string | null;
}

interface Summary {
  signedInProgramme: number;
  total: number;
  slaOut: number;
  dueToday: number;
  overdue: number;
  week: { label: string; target: number; signed: number } | null;
  todayLabel: string;
}

type Tab = "desk" | "checkin" | "email" | "import" | "settings";
type View = "due" | "out" | "open" | "signed" | "parked" | "all";

const firstName = (n: string) => n.replace(/^(Dr|Mr|Mrs|Ms|Miss)\.?\s+/i, "").split(/\s+/)[0];

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function Desk(props: {
  programme: Programme;
  canLead: boolean;
  me: { id: string; name: string };
  team: { id: string; name: string }[];
  rows: DeskRow[];
  summary: Summary;
  checkIns: CheckIn[];
  initialQuery: string;
}) {
  const { programme, canLead, me, team, rows, summary } = props;
  const [tab, setTab] = useState<Tab>("desk");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pct = programme.target ? Math.min(100, Math.round((summary.total / programme.target) * 100)) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{programme.engagementName}</p>
          <h1 className="text-2xl font-bold text-slate-900">{programme.name}</h1>
          {programme.deadlineLabel && <p className="text-sm text-slate-500">Close-out {programme.deadlineLabel}</p>}
        </div>
        <a href={`/api/signings/${programme.id}/providers`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Signed" value={`${summary.total} of ${programme.target}`} sub={`${Math.max(0, programme.target - summary.total)} to go`} bar={pct} />
        <Stat
          label={summary.week ? `${summary.week.label} signed` : "This week"}
          value={summary.week ? `${summary.week.signed} of ${summary.week.target}` : "–"}
          tone={summary.week && summary.week.signed < summary.week.target ? "amber" : "green"}
        />
        <Stat label="SLAs out, not returned" value={String(summary.slaOut)} sub={programme.chaseEnabled ? "Automatic chase on" : "Automatic chase off"} />
        <Stat label="Follow-ups due today" value={String(summary.dueToday)} sub={summary.overdue ? `${summary.overdue} overdue` : "None overdue"} tone={summary.overdue ? "red" : undefined} />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(
          [
            ["desk", "Desk"],
            ["checkin", "Check-in"],
            ["email", `Bulk email${selected.size ? ` (${selected.size})` : ""}`],
            ["import", "Import"],
            ...(canLead ? [["settings", "Settings"]] : []),
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t ? "border-[#0B3C5D] text-[#0B3C5D]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "desk" && (
        <DeskTable
          rows={rows}
          me={me}
          team={team}
          programme={programme}
          initialQuery={props.initialQuery}
          selected={selected}
          setSelected={setSelected}
          onEmail={() => setTab("email")}
        />
      )}
      {tab === "checkin" && <CheckInPanel checkIns={props.checkIns} me={me} summary={summary} target={programme.target} />}
      {tab === "email" && <BulkEmail programme={programme} rows={rows} me={me} selected={selected} setSelected={setSelected} />}
      {tab === "import" && <ImportPanel programmeId={programme.id} />}
      {tab === "settings" && canLead && <Settings programme={programme} />}
    </div>
  );
}

function Stat({ label, value, sub, bar, tone }: { label: string; value: string; sub?: string; bar?: number; tone?: "red" | "amber" | "green" }) {
  const color = tone === "red" ? "#B42318" : tone === "amber" ? "#92400E" : tone === "green" ? "#065F46" : "#0B3C5D";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
      {bar !== undefined && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full" style={{ width: `${bar}%`, background: "#D4A017" }} />
        </div>
      )}
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── The desk ──────────────────────────────────────────────────────────────

function DeskTable(props: {
  rows: DeskRow[];
  me: { id: string; name: string };
  team: { id: string; name: string }[];
  programme: Programme;
  initialQuery: string;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  onEmail: () => void;
}) {
  const { rows, me, team, programme, selected, setSelected } = props;
  const [view, setView] = useState<View>(props.initialQuery ? "all" : "due");
  const [owner, setOwner] = useState<string>(team.some((t) => t.id === me.id) ? me.id : "all");
  const [q, setQ] = useState(props.initialQuery);
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (owner === "none" ? r.ownerId : owner !== "all" && r.ownerId !== owner) return false;
      if (needle && ![r.facility, r.groupName, r.area, r.lga, r.contactName, r.signatoryName].some((v) => v?.toLowerCase().includes(needle))) return false;
      if (view === "due") return r.due;
      if (view === "out") return r.stage === "SLA_SENT";
      if (view === "open") return !CLOSED.includes(r.stage);
      if (view === "signed") return SIGNED.includes(r.stage);
      if (view === "parked") return r.stage === "PARKED";
      return true;
    });
  }, [rows, view, owner, q]);

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    shown.forEach((r) => (allShownSelected ? next.delete(r.id) : next.add(r.id)));
    setSelected(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["due", "Due today"],
            ["out", "SLAs out"],
            ["open", "All open"],
            ["signed", "Signed"],
            ["parked", "Parked"],
            ["all", "Everything"],
          ] as [View, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === v ? "bg-[#0B3C5D] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
          >
            {label}
          </button>
        ))}
        <select value={owner} onChange={(e) => setOwner(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
          <option value="all">Everyone</option>
          {team.map((t) => (
            <option key={t.id} value={t.id}>{t.id === me.id ? `Mine (${firstName(t.name)})` : t.name}</option>
          ))}
          <option value="none">Nobody yet</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search facility, area, contact" className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        {selected.size > 0 && (
          <button onClick={props.onEmail} className="rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-xs font-semibold text-white">
            Email {selected.size} selected
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
          <input type="checkbox" checked={allShownSelected} onChange={toggleAll} aria-label="Select all shown" />
          <span className="flex-1">{shown.length} shown</span>
          <span className="hidden w-28 sm:block">Stage</span>
          <span className="hidden w-64 md:block">Next</span>
        </div>
        {shown.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            {view === "due" ? "Nothing due today for this filter. Check SLAs out, or import the list." : "Nothing here for this filter."}
          </p>
        )}
        <div className="divide-y divide-slate-100">
          {shown.map((r) => (
            <ProviderRow
              key={r.id}
              row={r}
              me={me}
              team={team}
              programme={programme}
              open={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
              checked={selected.has(r.id)}
              onCheck={() => {
                const next = new Set(selected);
                if (next.has(r.id)) next.delete(r.id);
                else next.add(r.id);
                setSelected(next);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProviderRow(props: {
  row: DeskRow;
  me: { id: string; name: string };
  team: { id: string; name: string }[];
  programme: Programme;
  open: boolean;
  onToggle: () => void;
  checked: boolean;
  onCheck: () => void;
}) {
  const { row: r, me, team, programme } = props;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [objection, setObjection] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const act = async (body: unknown) => {
    setBusy(true);
    setError(null);
    try {
      await call(`/api/signings/providers/${r.id}`, "PATCH", body);
      setNote("");
      setObjection("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const contact = r.signatoryName || r.contactName;
  const waText = encodeURIComponent(
    `Good day${contact ? ` ${contact}` : ""}, this is ${firstName(me.name)} with ${programme.senderName}. ` +
      `You can download the provider agreement for ${r.facility} and return the signed copy here, from your phone: ${r.returnLink} . Thank you.`,
  );

  return (
    <div className={r.overdue ? "bg-red-50/40" : r.due ? "bg-amber-50/40" : undefined}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input type="checkbox" checked={props.checked} onChange={props.onCheck} aria-label={`Select ${r.facility}`} />
        <button type="button" onClick={props.onToggle} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-left">
          <span className="min-w-[180px] flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">{r.facility}</span>
            <span className="block truncate text-xs text-slate-500">
              {[r.groupName, r.area || r.lga, contact && `${contact}${r.signatoryName ? " (signs)" : ""}`, r.ownerName && `owner ${firstName(r.ownerName)}`].filter(Boolean).join(" · ")}
            </span>
          </span>
          <span className="w-28">
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={STAGE_STYLE[r.stage]}>
              {STAGE_LABELS[r.stage]}
              {r.daysOut !== null ? `, ${r.daysOut}d` : ""}
            </span>
          </span>
          <span className="w-full text-xs md:w-64" style={{ color: r.overdue ? "#B42318" : r.due ? "#92400E" : "#64748B" }}>
            {r.nextAction ? `${r.nextActionLabel ?? ""}: ${r.nextAction}` : CLOSED.includes(r.stage) ? (r.signedLabel ? `Signed ${r.signedLabel}` : "") : "No next step set"}
          </span>
        </button>
      </div>

      {props.open && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-10">
          <div className="flex flex-wrap gap-2 text-xs">
            {r.phone && <a className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200" href={`tel:${r.phone}`}>Call {r.contactName ? firstName(r.contactName) : "facility"}: {r.phone}</a>}
            {r.signatoryPhone && <a className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200" href={`tel:${r.signatoryPhone}`}>Call signatory: {r.signatoryPhone}</a>}
            {r.whatsapp && (
              <a className="rounded-lg bg-[#25D366] px-3 py-1.5 font-semibold text-white" target="_blank" rel="noreferrer" href={`https://wa.me/${r.whatsapp}?text=${waText}`}>
                WhatsApp with return link
              </a>
            )}
            <button
              className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200"
              onClick={async () => {
                await navigator.clipboard.writeText(r.returnLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy return link"}
            </button>
            {r.hasSignedFile && <a className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white" href={`/api/signings/providers/${r.id}?file=sla`} target="_blank" rel="noreferrer">Open signed SLA</a>}
            {Array.from({ length: r.documents }, (_, i) => (
              <a key={i} className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200" href={`/api/signings/providers/${r.id}?file=doc&i=${i}`} target="_blank" rel="noreferrer">Document {i + 1}</a>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Log what you just did</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What happened, in a line" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={objection} onChange={(e) => setObjection(e.target.value)} placeholder="Objection or ask, word for word (optional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="flex flex-wrap gap-2">
                {(["CALL", "WHATSAPP", "EMAIL", "VISIT"] as const).map((k) => (
                  <button key={k} disabled={busy} onClick={() => act({ action: "LOG", kind: k, note: note || null, objection: objection || null })} className="rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                    {{ CALL: "Called", WHATSAPP: "WhatsApped", EMAIL: "Emailed", VISIT: "Visited" }[k]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Move it on</p>
              <div className="flex flex-wrap gap-2">
                {(["INTERESTED", "SLA_SENT", "SIGNED", "DOCS_COMPLETE", "WITH_CLIENT", "PARKED"] as Stage[])
                  .filter((s) => s !== r.stage)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={busy}
                      onClick={() => {
                        if (s === "PARKED" && !note.trim()) return setError("Say why in the note before parking it.");
                        act({ action: "STAGE", stage: s, note: note || null });
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-slate-200 disabled:opacity-50"
                      style={STAGE_STYLE[s]}
                    >
                      {s === "WITH_CLIENT" ? "Sent to client" : STAGE_LABELS[s]}
                    </button>
                  ))}
              </div>
              {r.stage === "SLA_SENT" && (
                <p className="text-xs text-slate-500">
                  Automatic reminders sent: {r.chaseCount} of {programme.chaseDays.length}
                  {r.chasePaused ? " (paused)" : ""}.{" "}
                  <button className="font-semibold text-[#0B3C5D] underline" disabled={busy} onClick={() => act({ action: "PAUSE", paused: !r.chasePaused })}>
                    {r.chasePaused ? "Resume" : "Pause for this provider"}
                  </button>
                </p>
              )}
              {r.objection && <p className="whitespace-pre-line rounded-lg bg-white p-2 text-xs text-slate-700 ring-1 ring-slate-200"><b>Objections:</b> {r.objection}</p>}
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

          <div>
            <button className="text-xs font-semibold text-[#0B3C5D] underline" onClick={() => setEditing(!editing)}>
              {editing ? "Close details" : "Edit details, owner and next step"}
            </button>
            {editing && <EditForm row={r} team={team} busy={busy} onSave={(fields) => act({ action: "UPDATE", fields }).then(() => setEditing(false))} />}
          </div>

          {r.events.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-600">
              {r.events.map((e) => (
                <li key={e.id}>
                  <span className="text-slate-400">{e.at}</span> · {e.actor ? `${firstName(e.actor)} ` : ""}
                  {e.kind === "STAGE" ? `moved it to ${e.stageLabel}` : e.kind === "AUTO_CHASE" ? "sent the automatic reminder" : e.kind === "BULK_EMAIL" ? "emailed" : e.kind === "UPLOAD" ? "received a return" : e.kind.toLowerCase().replace("whatsapp", "WhatsApped").replace("call", "called").replace("visit", "visited").replace(/^email$/, "emailed").replace("note", "noted")}
                  {e.note ? `: ${e.note}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const FIELDS: [keyof DeskRow, string][] = [
  ["facility", "Facility"],
  ["groupName", "Group"],
  ["facilityType", "Type"],
  ["area", "Area"],
  ["lga", "LGA"],
  ["contactName", "Contact name"],
  ["contactRole", "Contact role"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["signatoryName", "Who signs"],
  ["signatoryPhone", "Signatory phone"],
  ["signatoryEmail", "Signatory email"],
  ["source", "Source"],
];

function EditForm({ row, team, busy, onSave }: { row: DeskRow; team: { id: string; name: string }[]; busy: boolean; onSave: (f: Record<string, string | null>) => void }) {
  const [f, setF] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(FIELDS.map(([k]) => [k, (row[k] as string | null) ?? ""])),
    ownerId: row.ownerId ?? "",
    nextAction: row.nextAction ?? "",
    nextActionAt: row.nextActionAt ? row.nextActionAt.slice(0, 10) : "",
    objection: row.objection ?? "",
    notes: row.notes ?? "",
  }));
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {FIELDS.map(([k, label]) => (
        <label key={k} className="text-xs text-slate-500">
          {label}
          <input value={f[k]} onChange={set(k)} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900" />
        </label>
      ))}
      <label className="text-xs text-slate-500">
        Owner
        <select value={f.ownerId} onChange={set("ownerId")} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900">
          <option value="">Nobody</option>
          {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label className="text-xs text-slate-500">
        Next step
        <input value={f.nextAction} onChange={set("nextAction")} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900" />
      </label>
      <label className="text-xs text-slate-500">
        Next step date
        <input type="date" value={f.nextActionAt} onChange={set("nextActionAt")} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900" />
      </label>
      <label className="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
        Objections and asks
        <textarea value={f.objection} onChange={set("objection")} rows={2} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900" />
      </label>
      <label className="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
        Notes
        <textarea value={f.notes} onChange={set("notes")} rows={2} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900" />
      </label>
      <div>
        <button
          disabled={busy}
          onClick={() =>
            onSave(
              Object.fromEntries(
                Object.entries(f).map(([k, v]) => [k, k === "nextActionAt" ? (v ? new Date(`${v}T09:00:00+01:00`).toISOString() : null) : v.trim() || null]),
              ) as Record<string, string | null>,
            )
          }
          className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Check-in ──────────────────────────────────────────────────────────────

function CheckInPanel({ checkIns, me, summary, target }: { checkIns: CheckIn[]; me: { id: string; name: string }; summary: Summary; target: number }) {
  const mine = checkIns.find((c) => c.userId === me.id);
  const [blocked, setBlocked] = useState("");
  const [teamBlocked, setTeamBlocked] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const myText = mine
    ? [
        `Contacts today: ${mine.contacts} (calls ${mine.calls}, emails ${mine.emails}${mine.whatsapps ? `, WhatsApp ${mine.whatsapps}` : ""}${mine.visits ? `, visits ${mine.visits}` : ""})`,
        `SLAs sent today: ${mine.slasSent}`,
        `Signed today: ${mine.signedToday.length}${mine.signedToday.length ? ` (${mine.signedToday.join(", ")})` : ""}`,
        `SLAs out, awaiting signature: ${mine.slaOut}`,
        `Follow-ups due tomorrow: ${mine.dueTomorrow}${mine.overdue ? ` (and ${mine.overdue} overdue)` : ""}`,
        `Blocked: ${blocked.trim() || "nothing"}`,
      ].join("\n")
    : "";
  const signedToday = checkIns.filter((c) => c.signedToday.length);
  const teamText = [
    `${summary.todayLabel}`,
    `Signed today: ${checkIns.reduce((n, c) => n + c.signedToday.length, 0)}${signedToday.length ? ` (${signedToday.map((c) => `${firstName(c.name)} ${c.signedToday.length}`).join(", ")})` : ""}`,
    `Total: ${summary.total} of ${target}.${summary.week ? ` This week: ${summary.week.signed} of ${summary.week.target}.` : ""}`,
    `SLAs out: ${summary.slaOut}. Follow-ups overdue: ${summary.overdue}.`,
    `For Matthew: ${teamBlocked.trim() || "nothing"}`,
  ].join("\n");

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Your 5pm check-in</h2>
        <p className="text-sm text-slate-500">Counted from what you logged on the desk today. Add your blocker, copy it, and paste it into today&apos;s check-in task.</p>
        {mine ? (
          <>
            <input value={blocked} onChange={(e) => setBlocked(e.target.value)} placeholder="Blocked: what, and who you need it from" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{myText}</pre>
            <button onClick={() => copy("me", myText)} className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white">{copied === "me" ? "Copied" : "Copy check-in"}</button>
          </>
        ) : (
          <p className="text-sm text-slate-500">You are not on this engagement&apos;s team, so there is nothing to count.</p>
        )}
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Team roll-up for WhatsApp</h2>
        <input value={teamBlocked} onChange={(e) => setTeamBlocked(e.target.value)} placeholder="For Matthew: blockers from today's check-ins" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{teamText}</pre>
        <button onClick={() => copy("team", teamText)} className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white">{copied === "team" ? "Copied" : "Copy roll-up"}</button>
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr><th className="py-1">Today</th><th>Contacts</th><th>SLAs sent</th><th>Signed</th><th>Out</th><th>Overdue</th></tr>
          </thead>
          <tbody>
            {checkIns.map((c) => (
              <tr key={c.userId} className="border-t border-slate-100">
                <td className="py-1.5 font-medium text-slate-800">{c.name}</td>
                <td>{c.contacts}</td><td>{c.slasSent}</td><td>{c.signedToday.length}</td><td>{c.slaOut}</td>
                <td style={{ color: c.overdue ? "#B42318" : undefined }}>{c.overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bulk email ────────────────────────────────────────────────────────────

const DEFAULT_SUBJECT = "{{facility}}: your Aman HMO provider agreement";
const DEFAULT_BODY = `Dear {{contact}},

Following up on the Aman HMO provider agreement for {{facility}}. A copy is attached.

Signing takes a few minutes. You can return the signed agreement, and the documents on the checklist, from a phone or a computer here:
{{link}}

If anything is holding it up, reply to this email and I will sort it out.

Kind regards,
{{sender}}`;

function BulkEmail({ programme, rows, me, selected, setSelected }: { programme: Programme; rows: DeskRow[]; me: { id: string; name: string }; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [attachSla, setAttachSla] = useState(!!programme.slaFileName);
  const [testedFor, setTestedFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; skipped: { facility: string; reason: string }[] } | null>(null);

  const chosen = rows.filter((r) => selected.has(r.id));
  const withEmail = chosen.filter((r) => (r.signatoryEmail || r.email) && !CLOSED.includes(r.stage));
  const key = `${subject}\n---\n${body}\n${attachSla}`;
  const tested = testedFor === key;

  useEffect(() => setResult(null), [key]);

  const pick = (filter: (r: DeskRow) => boolean) => setSelected(new Set(rows.filter(filter).map((r) => r.id)));
  const send = async (mode: "TEST" | "SEND") => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const data = await call(`/api/signings/${programme.id}/email`, "POST", { mode, ids: chosen.map((r) => r.id), subject, body, attachSla });
      if (mode === "TEST") {
        setTestedFor(key);
        setMsg(`Test sent to ${data.sentTo}, using ${data.sample}. Read it in your inbox, then send.`);
      } else {
        setResult(data);
        setSelected(new Set());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <h2 className="font-semibold text-slate-900">Follow-up email</h2>
        <p className="text-sm text-slate-500">
          One email to each provider, from &ldquo;{programme.senderName}&rdquo;, with replies coming to you. <code>{"{{contact}}"}</code>, <code>{"{{facility}}"}</code>, <code>{"{{link}}"}</code> (their own return link) and <code>{"{{sender}}"}</code> fill in for each provider.
        </p>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={13} className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={attachSla} onChange={(e) => setAttachSla(e.target.checked)} disabled={!programme.slaFileName} />
          Attach the SLA {programme.slaFileName ? `(${programme.slaFileName})` : "(none uploaded yet: the lead adds it under Settings)"}
        </label>
        <p className="text-xs text-slate-500">Under 120 words works best. Never promise a payment time or tariff Aman has not confirmed.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button disabled={busy || !chosen.length} onClick={() => send("TEST")} className="rounded-lg border border-[#0B3C5D] px-4 py-2 text-sm font-semibold text-[#0B3C5D] disabled:opacity-40">
            1. Send a test to me
          </button>
          <button disabled={busy || !tested || !withEmail.length} onClick={() => send("SEND")} className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
            2. Send to {withEmail.length} provider{withEmail.length === 1 ? "" : "s"}
          </button>
          {!tested && chosen.length > 0 && <span className="text-xs text-slate-500">Test this exact wording first.</span>}
        </div>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
        {result && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-900">Sent {result.sent}.{result.skipped.length ? ` Skipped ${result.skipped.length}:` : ""}</p>
            <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
              {result.skipped.map((s, i) => <li key={i}>{s.facility}: {s.reason}</li>)}
            </ul>
          </div>
        )}
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Who gets it</h2>
        <p className="text-sm text-slate-700">{chosen.length} selected, {withEmail.length} with an email and still open.</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => pick((r) => r.stage === "SLA_SENT" && r.ownerId === me.id)} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700">My SLAs out</button>
          <button onClick={() => pick((r) => r.stage === "SLA_SENT")} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700">Every SLA out</button>
          <button onClick={() => pick((r) => r.stage === "SLA_SENT" && (r.daysOut ?? 0) >= 7)} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700">SLAs out a week or more</button>
          <button onClick={() => pick((r) => r.stage === "INTERESTED")} className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700">Interested, SLA not yet sent</button>
          <button onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-2 text-left text-xs text-slate-500 underline">Clear</button>
        </div>
        <p className="text-xs text-slate-500">Or tick rows on the Desk. Signed and parked providers, suppressed addresses and duplicates are skipped automatically. Sending the SLA to someone who did not have it moves them to SLA sent and starts the chase.</p>
        <ul className="max-h-64 overflow-auto text-xs text-slate-600">
          {chosen.slice(0, 200).map((r) => <li key={r.id}>{r.facility}{!(r.signatoryEmail || r.email) ? " (no email)" : ""}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ─── Import ────────────────────────────────────────────────────────────────

const HEADER_MAP: Record<string, string> = {
  facility: "facility", "facility name": "facility", hospital: "facility", provider: "facility", name: "facility",
  "group (if any)": "groupName", group: "groupName",
  type: "facilityType", "facility type": "facilityType",
  lga: "lga", "area or cluster": "area", area: "area", cluster: "area", address: "area",
  "contact name": "contactName", contact: "contactName", "contact person": "contactName",
  "contact role": "contactRole", role: "contactRole",
  "phone / whatsapp": "phone", phone: "phone", "phone number": "phone", whatsapp: "phone", mobile: "phone",
  email: "email", "email address": "email",
  signatory: "signatoryName", "who signs": "signatoryName", "signatory name": "signatoryName", md: "signatoryName",
  "signatory phone": "signatoryPhone", "signatory email": "signatoryEmail",
  source: "source", owner: "owner", stage: "stage", status: "stage",
  "sla sent": "slaSentAt", "date sent": "slaSentAt", "sla signed": "signedAt",
  "next action": "nextAction", "next action date": "nextActionAt",
  "objection or ask (verbatim)": "objection", objection: "objection", notes: "notes", comment: "notes", comments: "notes",
};

function parseTable(text: string): string[][] {
  const tab = text.split("\n")[0]?.includes("\t");
  if (tab) return text.split(/\r?\n/).filter((l) => l.trim()).map((l) => l.split("\t"));
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim())) out.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) out.push(row);
  return out;
}

function ImportPanel({ programmeId }: { programmeId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const table = parseTable(text.trim());
    if (table.length < 2) return { rows: [], mapped: [] as string[], unmapped: [] as string[] };
    const headers = table[0].map((h) => h.trim().toLowerCase());
    const fields = headers.map((h) => HEADER_MAP[h] ?? null);
    const rows = table.slice(1).map((cells) => Object.fromEntries(fields.flatMap((f, i) => (f && cells[i]?.trim() ? [[f, cells[i].trim()]] : [])))).filter((r) => r.facility);
    return { rows, mapped: headers.filter((_, i) => fields[i]), unmapped: headers.filter((h, i) => h && !fields[i]) };
  }, [text]);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await call(`/api/signings/${programmeId}/providers`, "POST", { rows: parsed.rows });
      setMsg(`Added ${data.created}, updated ${data.updated}.${data.unknownOwners.length ? ` Owners not recognised (left unassigned): ${data.unknownOwners.join(", ")}.` : ""}`);
      setText("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">Import providers</h2>
      <p className="text-sm text-slate-500">
        Copy the rows from the tracker sheet (or Aman&apos;s list, or Esther&apos;s), header row included, and paste them here. Columns are matched by name: Facility, Contact name, Phone, Email, Who signs, Owner (a first name is enough), Stage, SLA sent, and the rest of the tracker&apos;s columns. A facility already here with the same email is updated, not duplicated.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Paste from Google Sheets or Excel" className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
      {text.trim() && (
        <p className="text-sm text-slate-700">
          {parsed.rows.length} providers found. Using: {parsed.mapped.join(", ") || "no recognised columns"}.
          {parsed.unmapped.length > 0 && <span className="text-slate-500"> Ignoring: {parsed.unmapped.join(", ")}.</span>}
        </p>
      )}
      <button disabled={busy || !parsed.rows.length} onClick={run} className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
        Import {parsed.rows.length || ""}
      </button>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}

// ─── Settings ──────────────────────────────────────────────────────────────

function Settings({ programme }: { programme: Programme }) {
  const router = useRouter();
  const [senderName, setSenderName] = useState(programme.senderName);
  const [subject, setSubject] = useState(programme.chaseSubject);
  const [body, setBody] = useState(programme.chaseBody);
  const [days, setDays] = useState(programme.chaseDays.join(", "));
  const [checklist, setChecklist] = useState(programme.documentsChecklist ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dirty = senderName !== programme.senderName || subject !== programme.chaseSubject || body !== programme.chaseBody || days !== programme.chaseDays.join(", ") || checklist !== (programme.documentsChecklist ?? "");

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      setMsg(await fn());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };
  const patch = (b: unknown) => call(`/api/signings/${programme.id}`, "PATCH", b);

  const uploadSla = (file: File) =>
    run(async () => {
      const contentType = file.type || "application/pdf";
      const { key, url } = await patch({ action: "SLA_UPLOAD_URL", fileName: file.name, contentType, size: file.size });
      const put = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
      if (!put.ok) throw new Error("Upload failed");
      await patch({ action: "SLA_SET", key, fileName: file.name });
      return `${file.name} is now the agreement attached to emails and offered on every return link.`;
    });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <h2 className="font-semibold text-slate-900">Automatic reminder</h2>
        <p className="text-sm text-slate-500">
          Every working morning at 9am, each provider holding an SLA gets this email on the days set below, counted from the day it was sent, with a fresh copy and their own return link. It stops the moment they return it, or if someone pauses that provider. A provider somebody contacted that day is skipped until the next day.
        </p>
        <label className="block text-xs text-slate-500">Sender name the provider sees
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
        </label>
        <label className="block text-xs text-slate-500">Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
        </label>
        <label className="block text-xs text-slate-500">Body
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900" />
        </label>
        <label className="block text-xs text-slate-500">Days after sending
          <input value={days} onChange={(e) => setDays(e.target.value)} className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
        </label>
        <label className="block text-xs text-slate-500">Documents checklist shown on the return page, one per line
          <textarea value={checklist} onChange={(e) => setChecklist(e.target.value)} rows={5} className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy || !dirty}
            onClick={() =>
              run(async () => {
                const r = await patch({
                  action: "SETTINGS",
                  senderName,
                  chaseSubject: subject,
                  chaseBody: body,
                  chaseDays: days.split(/[^0-9]+/).filter(Boolean).map(Number),
                  documentsChecklist: checklist || null,
                });
                return r.chaseSwitchedOff ? "Saved. The wording changed, so the automatic reminder is off until you test and switch it on again." : "Saved.";
              })
            }
            className="rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
          <button disabled={busy || dirty} onClick={() => run(async () => `Test sent to ${(await patch({ action: "TEST_CHASE" })).sentTo}. Read it before switching on.`)} className="rounded-lg border border-[#0B3C5D] px-4 py-2 text-sm font-semibold text-[#0B3C5D] disabled:opacity-40">
            Send the reminder to me
          </button>
          {programme.chaseEnabled ? (
            <button disabled={busy} onClick={() => run(async () => (await patch({ action: "CHASE_OFF" }), "Automatic reminder switched off."))} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">
              Switch automatic reminder off
            </button>
          ) : (
            <button disabled={busy || dirty} onClick={() => run(async () => (await patch({ action: "CHASE_ON" }), "Automatic reminder is on. It runs at 9am on working days."))} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              Switch automatic reminder on
            </button>
          )}
        </div>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">The agreement</h2>
        <p className="text-sm text-slate-700">{programme.slaFileName ?? "No SLA uploaded yet."}</p>
        <p className="text-xs text-slate-500">Attached to reminders and bulk emails, and downloadable from every provider&apos;s return link. PDF or Word, up to 8MB.</p>
        <input type="file" accept=".pdf,.docx" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadSla(e.target.files[0])} className="text-sm" />
      </div>
    </div>
  );
}
