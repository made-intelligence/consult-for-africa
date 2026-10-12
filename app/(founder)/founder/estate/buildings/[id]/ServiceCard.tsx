"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The 200-hour clock, and the form that resets it.
 *
 * The form is one tap away rather than on another page, because the moment
 * somebody is looking at "37 hours over" is the moment they either log the
 * service that already happened or book the one that has not. Making them
 * navigate is how a banner becomes wallpaper.
 */

interface State {
  intervalHours: number;
  hoursSinceService: number;
  hoursRemaining: number;
  status: "OK" | "DUE_SOON" | "DUE" | "OVERDUE";
  lastServicedAt: string | null;
  lastServicedBy: string | null;
  everServiced: boolean;
  reading: string;
}

const TONE: Record<State["status"], { bg: string; fg: string; bar: string }> = {
  OK: { bg: "#F0FDF4", fg: "#065F46", bar: "#059669" },
  DUE_SOON: { bg: "#FEFCE8", fg: "#92400E", bar: "#D4AF37" },
  DUE: { bg: "#FEF2F2", fg: "#991B1B", bar: "#DC2626" },
  OVERDUE: { bg: "#FEF2F2", fg: "#991B1B", bar: "#DC2626" },
};

export default function ServiceCard({
  buildingId,
  state,
  engineers,
  history,
}: {
  buildingId: string;
  state: State;
  engineers: Array<{ id: string; name: string; hasEmail: boolean }>;
  history: Array<{
    id: string;
    servicedAt: string;
    hoursAtService: number;
    performedBy: string;
    costNaira: number | null;
    workDone: string | null;
  }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    performedBy: engineers[0]?.name ?? "",
    performedById: engineers[0]?.id ?? "",
    servicedAt: new Date().toISOString().slice(0, 10),
    meterHours: "",
    cost: "",
    workDone: "",
  });

  const tone = TONE[state.status];
  const pct = Math.min(100, Math.round((state.hoursSinceService / state.intervalHours) * 100));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/founder/estate/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId,
          servicedAt: f.servicedAt,
          performedBy: f.performedBy,
          performedById: f.performedById || null,
          meterHoursAtService: f.meterHours ? Number(f.meterHours) : null,
          costNaira: f.cost ? Number(f.cost) : null,
          workDone: f.workDone || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not save.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  const noEmail = engineers.length > 0 && engineers.every((e) => !e.hasEmail);

  return (
    <div
      className="rounded-2xl bg-white p-5 shadow-sm"
      style={{ border: "1px solid #E8EBF0", borderLeft: `3px solid ${tone.bar}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight" style={{ color: tone.bar }}>
            {state.hoursSinceService}
            <span className="text-sm font-semibold text-gray-400"> / {state.intervalHours} hours</span>
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{state.reading}</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white"
          style={{ background: "#0F2744" }}
        >
          Log a service
        </button>
      </div>

      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: tone.bar }} />
      </div>

      {state.lastServicedAt ? (
        <p className="mt-2 text-[10px] text-gray-400">
          Last serviced {new Date(state.lastServicedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} by{" "}
          {state.lastServicedBy}.
        </p>
      ) : (
        <p className="mt-2 text-[10px] text-gray-400">
          No service recorded yet, so this counts every hour logged so far.
        </p>
      )}

      {engineers.length === 0 && (
        <p className="mt-2 text-[10px] font-semibold" style={{ color: "#DC2626" }}>
          Nobody holds the service engineer role, so no reminder will be sent. Add one on the tenants
          and team page.
        </p>
      )}
      {noEmail && (
        <p className="mt-2 text-[10px] font-semibold" style={{ color: "#DC2626" }}>
          {engineers.map((e) => e.name).join(", ")} has no email address, so the reminder can only
          appear on this screen.
        </p>
      )}

      {open && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <select
              value={f.performedById}
              onChange={(e) => {
                const eng = engineers.find((x) => x.id === e.target.value);
                setF({ ...f, performedById: e.target.value, performedBy: eng?.name ?? f.performedBy });
              }}
              className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
              style={{ borderColor: "#E8EBF0", minWidth: 140 }}
            >
              <option value="">Someone else</option>
              {engineers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={f.servicedAt}
              onChange={(e) => setF({ ...f, servicedAt: e.target.value })}
              className="rounded-lg border px-2.5 py-2 text-xs"
              style={{ borderColor: "#E8EBF0" }}
            />
          </div>
          {!f.performedById && (
            <input
              value={f.performedBy}
              onChange={(e) => setF({ ...f, performedBy: e.target.value })}
              placeholder="Who did it"
              className="w-full rounded-lg border px-2.5 py-2 text-xs"
              style={{ borderColor: "#E8EBF0" }}
            />
          )}
          <div className="flex gap-2">
            <input
              value={f.meterHours}
              onChange={(e) => setF({ ...f, meterHours: e.target.value.replace(/[^\d.]/g, "") })}
              placeholder="Hour meter reading"
              inputMode="decimal"
              className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
              style={{ borderColor: "#E8EBF0" }}
            />
            <input
              value={f.cost}
              onChange={(e) => setF({ ...f, cost: e.target.value.replace(/[^\d.]/g, "") })}
              placeholder="Cost ₦"
              inputMode="decimal"
              className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
              style={{ borderColor: "#E8EBF0" }}
            />
          </div>
          <input
            value={f.workDone}
            onChange={(e) => setF({ ...f, workDone: e.target.value })}
            placeholder="Oil, filters, belts — what was changed"
            className="w-full rounded-lg border px-2.5 py-2 text-xs"
            style={{ borderColor: "#E8EBF0" }}
          />
          <p className="text-[10px] text-gray-400">
            The cost posts to the service charge as a maintenance expense. The clock restarts from
            this date.
          </p>
          {error && (
            <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}
          <button
            onClick={save}
            disabled={busy || f.performedBy.trim().length < 2}
            className="rounded-lg px-3 py-2 text-[11px] font-semibold text-white"
            style={{ background: "#0F2744", opacity: f.performedBy.trim().length < 2 ? 0.4 : 1 }}
          >
            {busy ? "Saving" : "Save and reset the clock"}
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Service history</p>
          {history.map((h) => (
            <div key={h.id} className="flex items-start justify-between gap-3 py-1.5 text-[11px]">
              <div className="min-w-0">
                <span className="text-gray-700">
                  {new Date(h.servicedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                  {h.performedBy}
                </span>
                {h.workDone && <span className="block text-gray-400">{h.workDone}</span>}
              </div>
              <span className="text-gray-400 shrink-0">
                at {h.hoursAtService}h
                {h.costNaira ? ` · ₦${h.costNaira.toLocaleString()}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
