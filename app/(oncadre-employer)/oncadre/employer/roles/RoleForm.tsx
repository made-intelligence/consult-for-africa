"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CADRE_OPTIONS, NIGERIAN_STATES, getSubSpecialties } from "@/lib/cadreHealth/cadres";
import { ROLE_TYPE_OPTIONS, URGENCY_OPTIONS } from "@/lib/cadreHealth/roleStatus";

/**
 * One form for writing a role, used to create and to edit.
 *
 * The old version could only create, and the cadre and state lists were typed
 * out inside the page rather than taken from the taxonomy, so the employer form
 * and the rest of the product could drift apart. Sub-specialty is now a list
 * drawn from the chosen cadre rather than free text, which is what made the
 * search filter on it unreliable in the first place.
 */

export interface RoleFormValues {
  title: string;
  description: string;
  cadre: string;
  subSpecialty: string;
  type: string;
  minYearsExperience: string;
  locationState: string;
  locationCity: string;
  salaryRangeMin: string;
  salaryRangeMax: string;
  urgency: string;
  requiredQualifications: string;
  preferredQualifications: string;
  isRemoteOk: boolean;
  isRelocationRequired: boolean;
}

export const BLANK_ROLE: RoleFormValues = {
  title: "",
  description: "",
  cadre: "",
  subSpecialty: "",
  type: "PERMANENT",
  minYearsExperience: "",
  locationState: "",
  locationCity: "",
  salaryRangeMin: "",
  salaryRangeMax: "",
  urgency: "MEDIUM",
  requiredQualifications: "",
  preferredQualifications: "",
  isRemoteOk: false,
  isRelocationRequired: false,
};

export default function RoleForm({
  initial,
  roleId,
  onSaved,
}: {
  initial: RoleFormValues;
  /** Present when editing. Absent means this is a new role. */
  roleId?: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<RoleFormValues>(initial);
  const [saving, setSaving] = useState<"draft" | "publish" | "save" | null>(null);
  const [error, setError] = useState("");

  const update = <K extends keyof RoleFormValues>(field: K, value: RoleFormValues[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const subSpecialties = form.cadre ? getSubSpecialties(form.cadre) : [];

  function payload(publish?: boolean) {
    return {
      ...form,
      minYearsExperience: form.minYearsExperience
        ? parseInt(form.minYearsExperience)
        : null,
      salaryRangeMin: form.salaryRangeMin || null,
      salaryRangeMax: form.salaryRangeMax || null,
      requiredQualifications: form.requiredQualifications
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      preferredQualifications: form.preferredQualifications
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(publish === undefined ? {} : { publish }),
    };
  }

  async function submit(mode: "draft" | "publish" | "save") {
    setSaving(mode);
    setError("");
    try {
      const res = await fetch(
        roleId ? `/api/cadre/employer/roles/${roleId}` : "/api/cadre/employer/roles",
        {
          method: roleId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload(roleId ? undefined : mode === "publish")),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save that.");
      if (onSaved) onSaved();
      router.push(roleId ? `/oncadre/employer/roles/${roleId}` : "/oncadre/employer/roles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(null);
    }
  }

  const inputClass =
    "w-full rounded-xl bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
  const inputStyle = {
    border: "1px solid #E8EBF0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    minHeight: "44px",
  };
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(roleId ? "save" : "publish");
      }}
      className="max-w-2xl space-y-6"
    >
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-red-700"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="title">
          Job title
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Consultant Paediatrician"
          required
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cadre">
            Cadre
          </label>
          <select
            id="cadre"
            value={form.cadre}
            onChange={(e) => {
              update("cadre", e.target.value);
              update("subSpecialty", "");
            }}
            required
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select cadre</option>
            {CADRE_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="type">
            Employment type
          </label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          >
            {ROLE_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="subSpecialty">
          Sub-specialty <span className="text-gray-400">Optional</span>
        </label>
        {subSpecialties.length > 0 ? (
          <select
            id="subSpecialty"
            value={form.subSpecialty}
            onChange={(e) => update("subSpecialty", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Any sub-specialty</option>
            {subSpecialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="subSpecialty"
            type="text"
            value={form.subSpecialty}
            onChange={(e) => update("subSpecialty", e.target.value)}
            placeholder="Choose a cadre first"
            disabled={!form.cadre}
            className={inputClass}
            style={inputStyle}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="state">
            State
          </label>
          <select
            id="state"
            value={form.locationState}
            onChange={(e) => update("locationState", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="city">
            City <span className="text-gray-400">Optional</span>
          </label>
          <input
            id="city"
            type="text"
            value={form.locationCity}
            onChange={(e) => update("locationCity", e.target.value)}
            placeholder="e.g. Ikeja"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="minYears">
            Minimum years of experience <span className="text-gray-400">Optional</span>
          </label>
          <input
            id="minYears"
            type="number"
            min="0"
            value={form.minYearsExperience}
            onChange={(e) => update("minYearsExperience", e.target.value)}
            placeholder="e.g. 5"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="urgency">
            How urgent
          </label>
          <select
            id="urgency"
            value={form.urgency}
            onChange={(e) => update("urgency", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="salaryMin">
              Salary from, NGN per month <span className="text-gray-400">Optional</span>
            </label>
            <input
              id="salaryMin"
              type="number"
              min="0"
              value={form.salaryRangeMin}
              onChange={(e) => update("salaryRangeMin", e.target.value)}
              placeholder="e.g. 1500000"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="salaryMax">
              Salary to, NGN per month <span className="text-gray-400">Optional</span>
            </label>
            <input
              id="salaryMax"
              type="number"
              min="0"
              value={form.salaryRangeMax}
              onChange={(e) => update("salaryRangeMax", e.target.value)}
              placeholder="e.g. 2500000"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          Roles that name a range get materially more applicants than roles that do
          not. It can be wide.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          About the role
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What the job involves, who they would work with, what the unit is like."
          rows={6}
          className={inputClass}
          style={{ ...inputStyle, minHeight: "120px" }}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="required">
          Required <span className="text-gray-400">One per line</span>
        </label>
        <textarea
          id="required"
          value={form.requiredQualifications}
          onChange={(e) => update("requiredQualifications", e.target.value)}
          placeholder={"MBBS or equivalent\nCurrent MDCN practising licence\n5 years post-fellowship"}
          rows={4}
          className={inputClass}
          style={{ ...inputStyle, minHeight: "100px" }}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="preferred">
          Nice to have <span className="text-gray-400">One per line, optional</span>
        </label>
        <textarea
          id="preferred"
          value={form.preferredQualifications}
          onChange={(e) => update("preferredQualifications", e.target.value)}
          placeholder={"Fellowship in the sub-specialty\nPrivate hospital experience"}
          rows={3}
          className={inputClass}
          style={{ ...inputStyle, minHeight: "80px" }}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isRemoteOk}
            onChange={(e) => update("isRemoteOk", e.target.checked)}
            className="rounded border-gray-300 text-[#0B3C5D] focus:ring-[#0B3C5D]"
          />
          Remote is fine
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isRelocationRequired}
            onChange={(e) => update("isRelocationRequired", e.target.checked)}
            className="rounded border-gray-300 text-[#0B3C5D] focus:ring-[#0B3C5D]"
          />
          They would need to relocate
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={!!saving || !form.title || !form.cadre}
          className="rounded-xl px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #0B3C5D, #0E4D6E)",
            boxShadow: "0 2px 8px rgba(11,60,93,0.25)",
            minHeight: "44px",
          }}
        >
          {saving ? "Saving..." : roleId ? "Save changes" : "Publish role"}
        </button>
        {!roleId && (
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={!!saving || !form.title || !form.cadre}
            className="rounded-xl px-6 py-3 text-base font-medium transition hover:bg-gray-50 disabled:opacity-40"
            style={{ border: "1px solid #E8EBF0", color: "#0B3C5D", minHeight: "44px" }}
          >
            Save as draft
          </button>
        )}
      </div>
      {!roleId && (
        <p className="text-xs text-gray-400">
          A draft is not on the job board and nobody can apply to it. You can publish
          it whenever you are ready.
        </p>
      )}
    </form>
  );
}
