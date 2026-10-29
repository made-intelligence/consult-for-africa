"use client";

import { useMemo, useState } from "react";

/**
 * The invitation list, person by person, with the registrations above it.
 * Shared by the admin page and the host's token link; the token page masks
 * emails on the server before anything reaches this component.
 */

type Status = "registered" | "bounced" | "optedout" | "sent" | "queued";

export interface BoardRow {
  name: string;
  email: string;
  onBehalfOf: string | null;
  source: string;
  sentAt: string | null;
  status: Status;
}

export interface BoardRegistrant {
  name: string;
  stage: string;
  guests: number;
  clinician: boolean;
  via: string | null;
  at: string;
}

export interface BoardSummary {
  onList: number;
  emailed: number;
  delivered: number;
  bounced: number;
  optedOut: number;
  queued: number;
  registered: number;
  confirmed: number;
  heads: number;
}

const STATUS_LABEL: Record<Status, string> = {
  registered: "Registered",
  sent: "Emailed",
  bounced: "Bounced",
  optedout: "Opted out",
  queued: "Not yet sent",
};

const STATUS_STYLE: Record<Status, string> = {
  registered: "bg-emerald-50 text-emerald-700",
  sent: "bg-slate-100 text-slate-700",
  bounced: "bg-red-50 text-red-700",
  optedout: "bg-red-50 text-red-700",
  queued: "bg-amber-50 text-amber-800",
};

const SOURCE_LABEL: Record<string, string> = {
  main: "Main list",
  office: "Company office",
  sally: "Sally's list",
};

const lagos = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function InvitationsBoard({
  summary,
  rows,
  registrants,
  inviterNames,
}: {
  summary: BoardSummary;
  rows: BoardRow[];
  registrants: BoardRegistrant[];
  inviterNames: Record<string, string>;
}) {
  const [status, setStatus] = useState<Status | "all">("all");
  const [source, setSource] = useState<string>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (source === "all" || r.source === source) &&
        (!t || `${r.name} ${r.email} ${r.onBehalfOf ?? ""}`.toLowerCase().includes(t)),
    );
  }, [rows, status, source, q]);

  const statuses = (Object.keys(STATUS_LABEL) as Status[]).filter((s) =>
    rows.some((r) => r.status === s),
  );
  const sources = Array.from(new Set(rows.map((r) => r.source)));

  const steps: [number, string, boolean?][] = [
    [summary.onList, "on the invitation list"],
    [summary.emailed, "emailed"],
    [summary.delivered, "delivered"],
    [summary.registered, "registered interest", true],
    [summary.confirmed, "confirmed of 70"],
  ];

  return (
    <div className="grid gap-10">
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white sm:grid-cols-5">
        {steps.map(([v, label, hi]) => (
          <div
            key={label}
            className={`border-slate-200 p-4 sm:border-l sm:first:border-l-0 ${hi ? "bg-amber-50" : ""}`}
          >
            <p className={`text-2xl font-semibold tabular-nums ${hi ? "text-amber-800" : "text-slate-900"}`}>
              {v}
            </p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
        {summary.registered} registered, {summary.heads} heads with their guests.{" "}
        {summary.bounced} of {summary.emailed} emails bounced
        {summary.emailed ? ` (${Math.round((summary.bounced / summary.emailed) * 100)}%)` : ""}; those
        people need WhatsApp or a call. {summary.queued} not yet emailed.
      </p>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Who has registered</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Registered</th>
                <th className="px-4 py-2.5 font-medium">Guests</th>
                <th className="px-4 py-2.5 font-medium">Clinician</th>
                <th className="px-4 py-2.5 font-medium">Came through</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {registrants.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{r.name}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{lagos(r.at)}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{r.guests || "–"}</td>
                  <td className="px-4 py-2 text-slate-600">{r.clinician ? "Yes" : "–"}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {r.via ? (inviterNames[r.via] ?? r.via) : "Not recorded"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {sentence(r.stage)}
                    </span>
                  </td>
                </tr>
              ))}
              {!registrants.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Nobody has registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-slate-900">The invitation list</h2>
        <div className="flex flex-wrap gap-2">
          <Chip on={status === "all"} onClick={() => setStatus("all")} label="All" n={rows.length} />
          {statuses.map((s) => (
            <Chip
              key={s}
              on={status === s}
              onClick={() => setStatus(s)}
              label={STATUS_LABEL[s]}
              n={rows.filter((r) => r.status === s).length}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip on={source === "all"} onClick={() => setSource("all")} label="Every list" n={rows.length} />
          {sources.map((s) => (
            <Chip
              key={s}
              on={source === s}
              onClick={() => setSource(s)}
              label={SOURCE_LABEL[s] ?? s}
              n={rows.filter((r) => r.source === s).length}
            />
          ))}
          <input
            id="invitation-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm sm:max-w-xs"
          />
          <span className="text-xs text-slate-500">{shown.length} shown</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Emailed</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.email} className="border-b border-slate-100 align-top last:border-0">
                  <td className="px-4 py-2 text-slate-900">
                    {r.name}
                    {r.onBehalfOf && r.onBehalfOf !== r.name ? (
                      <div className="text-xs text-slate-500">for {r.onBehalfOf}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{r.email}</td>
                  <td className="px-4 py-2 text-slate-600">{SOURCE_LABEL[r.source] ?? r.source}</td>
                  <td className="px-4 py-2">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 tabular-nums text-slate-500">{r.sentAt ? lagos(r.sentAt) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Chip({ on, onClick, label, n }: { on: boolean; onClick: () => void; label: string; n: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1 text-xs ${
        on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {label} <span className="tabular-nums opacity-70">{n}</span>
    </button>
  );
}
