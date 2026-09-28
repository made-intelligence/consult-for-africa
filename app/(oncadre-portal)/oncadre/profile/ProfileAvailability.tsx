"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Where a member says whether they want to hear from employers.
 *
 * Nothing in the product wrote these fields before: the column was set on 30
 * records out of 10,229, and employer search filtered on it, so the rest of the
 * register was invisible to every hospital on the platform. Search now ranks on
 * this rather than filtering by it, so answering here moves a member up rather
 * than being the price of existing.
 *
 * The copy is deliberate about what an answer does and does not do. A doctor
 * with a current job is right to worry that telling a platform they are looking
 * could get back to their employer, so the page says plainly that it never does.
 */

const AVAILABILITY = [
  {
    value: "ACTIVELY_LOOKING",
    label: "Actively looking",
    detail: "You want a new role now and would like hospitals to approach you.",
  },
  {
    value: "OPEN_TO_OFFERS",
    label: "Open to offers",
    detail: "You are settled, but would hear about the right thing.",
  },
  {
    value: "DOING_LOCUM",
    label: "Locum and shifts",
    detail: "You want session and locum work rather than a permanent post.",
  },
  {
    value: "NOT_LOOKING",
    label: "Not looking",
    detail: "You do not want to be approached about roles at the moment.",
  },
];

const OPEN_TO = [
  { value: "PERMANENT", label: "Permanent posts" },
  { value: "LOCUM", label: "Locum and sessions" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "REMOTE", label: "Remote work" },
  { value: "SHORT_MISSION", label: "Short missions" },
  { value: "MEDEVAC", label: "Medevac" },
  { value: "INTERNATIONAL", label: "Roles outside Nigeria" },
];

const NOTICE = [
  { value: "", label: "Not sure" },
  { value: "0", label: "Available now" },
  { value: "2", label: "2 weeks" },
  { value: "4", label: "1 month" },
  { value: "8", label: "2 months" },
  { value: "12", label: "3 months" },
  { value: "24", label: "6 months" },
];

export default function ProfileAvailability({
  initial,
}: {
  initial: {
    availability: string | null;
    availabilityUpdatedAt: string | null;
    openTo: string[];
    noticePeriodWeeks: number | null;
  };
}) {
  const router = useRouter();
  const [availability, setAvailability] = useState(initial.availability ?? "");
  const [openTo, setOpenTo] = useState<string[]>(initial.openTo ?? []);
  const [notice, setNotice] = useState(
    initial.noticePeriodWeeks != null ? String(initial.noticePeriodWeeks) : "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = !!initial.availability;

  function toggleOpenTo(value: string) {
    setOpenTo((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/cadre/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: availability || null,
          openTo,
          noticePeriodWeeks: notice === "" ? null : notice,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save that. Try again.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save that. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const notLooking = availability === "NOT_LOOKING";

  return (
    <section
      className="rounded-2xl bg-white p-6"
      style={{
        border: answered ? "1px solid #E8EBF0" : "1px solid rgba(212,175,55,0.35)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Being approached</h2>
          <p className="mt-1 text-sm text-gray-500">
            Hospitals search this network for people like you. This is where you say
            whether you want to hear from them.
          </p>
        </div>
        {!answered && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{ background: "rgba(212,175,55,0.12)", color: "#B8941E" }}
          >
            Not answered
          </span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: "#F8F9FB", color: "#4B5563" }}
      >
        Your current employer is never told what you choose here, and your phone
        number and email are never handed to a hospital without asking you first.
        You can change this whenever you like.
      </div>

      <div className="mt-5 space-y-2">
        {AVAILABILITY.map((option) => {
          const active = availability === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setAvailability(option.value);
                setSaved(false);
              }}
              className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition"
              style={{
                border: active ? "1px solid #0B3C5D" : "1px solid #E8EBF0",
                background: active ? "rgba(11,60,93,0.04)" : "#FFF",
              }}
            >
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: active ? "5px solid #0B3C5D" : "1px solid #CBD5E1",
                  background: "#FFF",
                }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {option.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {!notLooking && (
        <>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700">
              What kind of work?{" "}
              <span className="font-normal text-gray-400">Choose any that fit</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {OPEN_TO.map((option) => {
                const active = openTo.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOpenTo(option.value)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                    style={{
                      border: active ? "1px solid #0B3C5D" : "1px solid #E8EBF0",
                      background: active ? "rgba(11,60,93,0.06)" : "#FFF",
                      color: active ? "#0B3C5D" : "#6B7280",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 max-w-xs">
            <label
              htmlFor="notice-period"
              className="block text-sm font-medium text-gray-700"
            >
              How much notice would you need?
            </label>
            <select
              id="notice-period"
              value={notice}
              onChange={(e) => {
                setNotice(e.target.value);
                setSaved(false);
              }}
              className="mt-1.5 w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
              style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
            >
              {NOTICE.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !availability}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: "#0B3C5D", minHeight: "44px" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
        {!saved && initial.availabilityUpdatedAt && (
          <span className="text-xs text-gray-400">
            Last updated{" "}
            {new Date(initial.availabilityUpdatedAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </section>
  );
}
