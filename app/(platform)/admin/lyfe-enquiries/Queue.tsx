"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BASED_LABELS,
  CONCERN_LABELS,
  FORMAT_LABELS,
  PATHWAY_LABELS,
  SOURCE_LABELS,
  LYFE_STAGE_LABELS,
  STATUS_LABELS,
  TIMING_LABELS,
  waitingLabel,
} from "@/lib/lyfe";

export interface Row {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  intent: "EVENT_RSVP" | "CONSULTATION" | "DISCOVERY_CALL" | "FACILITY_VISIT";
  /** "Tuesday 13 October, 11:00 WAT", or null for anything that is not a consultation. */
  slotLabel: string | null;
  paid: boolean;
  guestCount: number | null;
  isClinician: boolean | null;
  pathway: keyof typeof PATHWAY_LABELS;
  concerns: (keyof typeof CONCERN_LABELS)[];
  timing: keyof typeof TIMING_LABELS | null;
  based: keyof typeof BASED_LABELS;
  format: keyof typeof FORMAT_LABELS;
  goal: string | null;
  notes: string | null;
  source: keyof typeof SOURCE_LABELS;
  sourceDetail: string | null;
  status: keyof typeof STATUS_LABELS;
  /** Event guests only. Where they stand with the room, not with the call. */
  eventStage: keyof typeof LYFE_STAGE_LABELS | null;
  invitedAtLabel: string | null;
  contactAttempts: number;
  waitingMinutes: number;
  createdAtLabel: string;
  nextAction: string | null;
  nextActionAtLabel: string | null;
  coordinatorNotes: string | null;
  ownerName: string | null;
  screening: { label: string; value: string }[];
}

const STAGE_ORDER = [
  "INTERESTED",
  "INVITED",
  "CONFIRMED",
  "DECLINED",
  "WAITLIST",
  "ATTENDED",
  "NO_SHOW",
] as const;

const STATUS_ORDER: (keyof typeof STATUS_LABELS)[] = [
  "NEW",
  "CONTACTED",
  "BOOKED",
  "ATTENDED",
  "CONVERTED",
  "FOLLOW_UP_LATER",
  "UNREACHABLE",
  "NOT_PROCEEDING",
];

/**
 * The queue. Sorted by how long somebody has been waiting rather than by when
 * they arrived, because the only number that explains the March campaign is
 * the gap between a form being submitted and a human being picking up a phone.
 */
export default function Queue({ rows }: { rows: Row[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {rows.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">
          Nothing in the queue. That is either very good or the form is broken, so check
          the page before celebrating.
        </p>
      )}
      {rows.map((r) => (
        <EnquiryRow
          key={r.id}
          row={r}
          open={openId === r.id}
          onToggle={() => setOpenId(openId === r.id ? null : r.id)}
        />
      ))}
    </div>
  );
}

function EnquiryRow({
  row,
  open,
  onToggle,
}: {
  row: Row;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<keyof typeof STATUS_LABELS>(row.status);
  const [nextAction, setNextAction] = useState(row.nextAction ?? "");
  const [nextActionAt, setNextActionAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const untouched = row.status === "NEW";
  // An hour is the line. The evidence puts a first call at five minutes worth
  // twenty one times a call at thirty, so anything past sixty minutes is late
  // rather than pending.
  const late = untouched && row.waitingMinutes > 60;

  const [stage, setStage] = useState<string>(row.eventStage ?? "INTERESTED");

  const send = async (
    action: "LOG_CONTACT" | "UPDATE" | "SEND_INVITE" | "SET_STAGE",
  ) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lyfe-enquiries/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          status: action === "UPDATE" ? status : undefined,
          eventStage: action === "SET_STAGE" ? stage : undefined,
          note: note.trim() || null,
          nextAction: nextAction.trim() || null,
          nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
          takeOwnership: action === "LOG_CONTACT",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={late ? "bg-red-50/40" : undefined}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left hover:bg-slate-50"
      >
        <span
          className="w-16 shrink-0 text-xs font-bold tabular-nums"
          style={{ color: late ? "#B42318" : untouched ? "#92400E" : "#64748B" }}
        >
          {untouched ? waitingLabel(row.waitingMinutes) : `${row.contactAttempts}x`}
        </span>
        <span className="min-w-[160px] flex-1 text-sm font-semibold text-slate-900">
          {row.fullName}
        </span>
        <span className="min-w-[180px] flex-1 text-xs text-slate-600">
          {row.intent === "EVENT_RSVP"
            ? `Coming to the evening${row.guestCount ? `, bringing ${row.guestCount}` : ", on their own"}`
            : row.slotLabel
              ? row.slotLabel
              : PATHWAY_LABELS[row.pathway]}
        </span>
        <span className="min-w-[120px] text-xs text-slate-500">
          {row.intent === "EVENT_RSVP"
            ? row.isClinician
              ? "Clinician"
              : "Guest"
            : row.timing
              ? TIMING_LABELS[row.timing]
              : ""}
        </span>
        {row.intent === "CONSULTATION" && (
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={
              row.paid
                ? { background: "#ECFDF5", color: "#065F46" }
                : { background: "#FFFBEB", color: "#92400E" }
            }
          >
            {row.paid ? "Paid" : "Unpaid"}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {STATUS_LABELS[row.status]}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${row.phone}`}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Call {row.phone}
                </a>
                <a
                  href={`https://wa.me/${row.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${row.fullName.split(" ")[0]}, this is the team at Lyfe Plastics and Dermatology. Thank you for your enquiry. Is now a good time for a short call?`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:${row.email}`}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  {row.email}
                </a>
              </div>

              <dl className="mt-5 space-y-1.5 text-xs">
                <Fact k="Arrived" v={row.createdAtLabel} />
                {row.intent === "EVENT_RSVP" ? (
                  <>
                    <Fact k="Guests" v={row.guestCount ? String(row.guestCount) : "None"} />
                    <Fact
                      k="Clinician"
                      v={row.isClinician === null ? "Not said" : row.isClinician ? "Yes, also a referrer" : "No"}
                    />
                  </>
                ) : (
                  <Fact k="Wants" v={row.concerns.map((c) => CONCERN_LABELS[c]).join(", ") || "Not said"} />
                )}
                <Fact k="Based" v={BASED_LABELS[row.based]} />
                {row.intent === "CONSULTATION" && (
                  <>
                    <Fact k="Her diary" v={row.slotLabel ?? "No time held"} />
                    <Fact k="Fee" v={row.paid ? "Paid in full" : "Not paid, so not booked"} />
                  </>
                )}
                {row.intent === "DISCOVERY_CALL" && <Fact k="Consultation" v={FORMAT_LABELS[row.format]} />}
                <Fact
                  k="Found us"
                  v={SOURCE_LABELS[row.source] + (row.sourceDetail ? `, ${row.sourceDetail}` : "")}
                />
                {row.ownerName && <Fact k="Owned by" v={row.ownerName} />}
                {row.nextActionAtLabel && (
                  <Fact k="Next" v={`${row.nextAction ?? "Follow up"}, ${row.nextActionAtLabel}`} />
                )}
              </dl>

              {row.goal && (
                <p className="mt-4 border-l-2 border-amber-400 pl-3 text-xs italic leading-relaxed text-slate-700">
                  {row.goal}
                </p>
              )}
              {row.notes && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{row.notes}</p>
              )}

              {row.screening.length > 0 && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    Patient reported, for the clinical team
                  </p>
                  <dl className="mt-2 space-y-1 text-xs">
                    {row.screening.map((s) => (
                      <Fact key={s.label} k={s.label} v={s.value} />
                    ))}
                  </dl>
                  <p className="mt-2 text-[11px] leading-relaxed text-emerald-900">
                    Do not interpret these and do not offer a date. Route to a clinician.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  What happened
                </span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Rang, no answer. Left a WhatsApp."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                />
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Next action
                  </span>
                  <input
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder="Call again"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    When
                  </span>
                  <input
                    type="datetime-local"
                    value={nextActionAt}
                    onChange={(e) => setNextActionAt(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                  />
                </label>
              </div>

              {row.intent === "EVENT_RSVP" && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    The room
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy || row.eventStage === "CONFIRMED"}
                      onClick={() => send("SEND_INVITE")}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {row.eventStage === "INVITED" ? "Send the invitation again" : "Send the invitation"}
                    </button>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="rounded-lg border border-emerald-300 bg-white p-2 text-xs"
                    >
                      {STAGE_ORDER.map((st) => (
                        <option key={st} value={st}>
                          {LYFE_STAGE_LABELS[st]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => send("SET_STAGE")}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-50"
                    >
                      Set by hand
                    </button>
                    {row.invitedAtLabel && (
                      <span className="text-[11px] text-emerald-800">
                        Invited {row.invitedAtLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-emerald-900/70">
                    The invitation carries a link of their own. A place is filled when they use it,
                    not when it is sent.
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send("LOG_CONTACT")}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Log a contact attempt"}
                </button>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as keyof typeof STATUS_LABELS)}
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send("UPDATE")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>

              {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

              {row.coordinatorNotes && (
                <pre className="mt-4 max-h-44 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 font-sans text-[11px] leading-relaxed text-slate-600">
                  {row.coordinatorNotes}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-slate-400">{k}</dt>
      <dd className="flex-1 text-slate-700">{v}</dd>
    </div>
  );
}
