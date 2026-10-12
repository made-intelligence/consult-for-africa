"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The two numbers that price everything.
 *
 * Both are shown next to what the evidence says they should be: the price
 * against the weighted average of what the fuel actually cost, and the burn rate
 * against what the tank implies. Those two comparisons are the entire reason
 * this screen exists — a rate card with no check beside it can sit wrong for
 * months and the only symptom is a family quietly subsidising its tenants.
 *
 * A change here is forward-looking. Runs carry the rates they were costed at, so
 * nothing typed in this form can reach a charge already made.
 */

interface Building {
  id: string;
  litresPerHour: number;
  dieselPricePerLitre: number;
  dieselPricingMode: string;
  dieselLowBalanceNaira: number;
  dieselLowCoverDays: number;
  allocationNote: string | null;
}

export default function RateCard({
  building,
  weightedAverage,
  impliedLitresPerHour,
}: {
  building: Building;
  weightedAverage: number | null;
  impliedLitresPerHour: number | null;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    dieselPricePerLitre: String(building.dieselPricePerLitre),
    litresPerHour: String(building.litresPerHour),
    dieselPricingMode: building.dieselPricingMode,
    dieselLowBalanceNaira: String(building.dieselLowBalanceNaira),
    dieselLowCoverDays: String(building.dieselLowCoverDays),
    allocationNote: building.allocationNote ?? "",
    reason: "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceChanged = Number(f.dieselPricePerLitre) !== building.dieselPricePerLitre;
  const burnChanged = Number(f.litresPerHour) !== building.litresPerHour;
  const dirty =
    priceChanged ||
    burnChanged ||
    f.dieselPricingMode !== building.dieselPricingMode ||
    Number(f.dieselLowBalanceNaira) !== building.dieselLowBalanceNaira ||
    Number(f.dieselLowCoverDays) !== building.dieselLowCoverDays ||
    f.allocationNote !== (building.allocationNote ?? "");

  const priceGap = weightedAverage === null ? null : weightedAverage - Number(f.dieselPricePerLitre);
  const burnGap =
    impliedLitresPerHour === null ? null : impliedLitresPerHour - Number(f.litresPerHour);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/founder/estate/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: building.id,
          dieselPricePerLitre: Number(f.dieselPricePerLitre),
          litresPerHour: Number(f.litresPerHour),
          dieselPricingMode: f.dieselPricingMode,
          dieselLowBalanceNaira: Number(f.dieselLowBalanceNaira),
          dieselLowCoverDays: Number(f.dieselLowCoverDays),
          allocationNote: f.allocationNote || null,
          reason: f.reason || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not save.");
      setSaved(true);
      setF((p) => ({ ...p, reason: "" }));
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid #E8EBF0" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Naira per litre"
          value={f.dieselPricePerLitre}
          onChange={(v) => setF({ ...f, dieselPricePerLitre: v })}
          hint={
            weightedAverage === null
              ? "No deliveries yet to compare against."
              : `Fuel delivered recently averaged ₦${weightedAverage.toLocaleString()}/L.`
          }
          warning={
            priceGap !== null && priceGap > 10
              ? `You are billing ₦${Math.round(priceGap).toLocaleString()}/L below cost.`
              : priceGap !== null && priceGap < -10
                ? `You are billing ₦${Math.round(-priceGap).toLocaleString()}/L above cost.`
                : null
          }
          action={
            weightedAverage !== null && Math.abs(priceGap ?? 0) > 1
              ? {
                  label: `Use ₦${weightedAverage.toLocaleString()}`,
                  onClick: () => setF({ ...f, dieselPricePerLitre: String(weightedAverage) }),
                }
              : null
          }
        />
        <Field
          label="Litres per hour"
          value={f.litresPerHour}
          onChange={(v) => setF({ ...f, litresPerHour: v })}
          hint={
            impliedLitresPerHour === null
              ? "Dip the tank twice to have this checked against reality."
              : `The tank implies ${impliedLitresPerHour} L/hr.`
          }
          warning={
            burnGap !== null && Math.abs(burnGap) > 1
              ? `The tank and this figure are ${Math.abs(burnGap).toFixed(1)} L/hr apart.`
              : null
          }
          action={
            impliedLitresPerHour !== null && Math.abs(burnGap ?? 0) > 0.5
              ? {
                  label: `Use ${impliedLitresPerHour}`,
                  onClick: () => setF({ ...f, litresPerHour: String(impliedLitresPerHour) }),
                }
              : null
          }
        />
        <Field
          label="Top-up floor (₦)"
          value={f.dieselLowBalanceNaira}
          onChange={(v) => setF({ ...f, dieselLowBalanceNaira: v })}
          hint="Below this balance a tenant is told to top up."
        />
        <Field
          label="Top-up floor (days of cover)"
          value={f.dieselLowCoverDays}
          onChange={(v) => setF({ ...f, dieselLowCoverDays: v })}
          hint="Or fewer than this many days left at their own recent burn."
        />
      </div>

      <div className="mt-4">
        <Label>How the rate is set</Label>
        <div className="flex gap-2">
          {[
            { v: "MANUAL_RATE", l: "The rate I set" },
            { v: "WEIGHTED_AVERAGE", l: "What the fuel cost" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setF({ ...f, dieselPricingMode: o.v })}
              className="flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold"
              style={{
                border: `1px solid ${f.dieselPricingMode === o.v ? "#0F2744" : "#E8EBF0"}`,
                background: f.dieselPricingMode === o.v ? "#0F2744" : "#fff",
                color: f.dieselPricingMode === o.v ? "#fff" : "#4B5563",
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400">
          {f.dieselPricingMode === "MANUAL_RATE"
            ? "Runs are costed at the rate above. What the tenancies are written against."
            : "Runs are costed at the weighted average of recent deliveries, so what you bill sums to what you spent."}
        </p>
      </div>

      <div className="mt-4">
        <Label>How the split is explained to tenants</Label>
        <textarea
          value={f.allocationNote}
          onChange={(e) => setF({ ...f, allocationNote: e.target.value })}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <p className="mt-1 text-[10px] text-gray-400">
          Shown on every tenant&rsquo;s screen. Residents dispute opacity far more than they dispute
          the amount.
        </p>
      </div>

      {(priceChanged || burnChanged) && (
        <div className="mt-4">
          <Label>Why is this changing?</Label>
          <input
            value={f.reason}
            onChange={(e) => setF({ ...f, reason: e.target.value })}
            placeholder="Pump price moved, retuned against the tank…"
            className="w-full rounded-lg border px-3 py-2 text-xs"
            style={{ borderColor: "#E8EBF0" }}
          />
          <p className="mt-1 text-[10px] text-gray-400">
            Kept against the change. It is the first thing a tenant asks when a month costs more than
            the last one. Charges already made are unaffected.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs font-semibold" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy || !dirty}
          className="rounded-xl px-4 py-2.5 text-xs font-semibold text-white"
          style={{ background: "#0F2744", opacity: dirty && !busy ? 1 : 0.4 }}
        >
          {busy ? "Saving" : "Save rate card"}
        </button>
        {saved && (
          <span className="text-xs font-semibold" style={{ color: "#059669" }}>
            Saved. Applies to runs from now on.
          </span>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{children}</p>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  warning,
  action,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  warning?: string | null;
  action?: { label: string; onClick: () => void } | null;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        inputMode="decimal"
        className="w-full rounded-lg border px-3 py-2 text-sm font-semibold"
        style={{ borderColor: "#E8EBF0", color: "#0F2744" }}
      />
      {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
      {warning && (
        <p className="mt-0.5 text-[10px] font-semibold" style={{ color: "#DC2626" }}>
          {warning}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 text-[10px] font-semibold underline"
          style={{ color: "#D4AF37" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
