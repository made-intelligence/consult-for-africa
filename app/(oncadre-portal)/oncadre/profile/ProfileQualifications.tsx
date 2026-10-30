"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/shared/FileUpload";

interface Qualification {
  id: string;
  type: string;
  name: string;
  institution: string | null;
  yearObtained: number | null;
  score: string | null;
  expiryDate: string | null;
  documentUrl: string | null;
  verificationStatus: string;
}

const TYPE_LABELS: Record<string, string> = {
  PRIMARY_DEGREE: "Primary Degree",
  POSTGRADUATE: "Postgraduate",
  FELLOWSHIP: "Fellowship",
  CERTIFICATION: "Certification",
  INTERNATIONAL_EXAM: "International Exam",
};

const EMPTY_FORM = {
  type: "PRIMARY_DEGREE",
  name: "",
  institution: "",
  yearObtained: "",
  score: "",
  expiryDate: "",
  documentUrl: "",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    PRIMARY_DEGREE: "bg-blue-50 text-blue-700 border-blue-200",
    POSTGRADUATE: "bg-purple-50 text-purple-700 border-purple-200",
    FELLOWSHIP: "bg-amber-50 text-amber-700 border-amber-200",
    CERTIFICATION: "bg-green-50 text-green-700 border-green-200",
    INTERNATIONAL_EXAM: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[type] || "bg-gray-50 text-gray-700 border-gray-200"}`}
    >
      {TYPE_LABELS[type] || type}
    </span>
  );
}

export default function ProfileQualifications({
  initialQualifications,
}: {
  initialQualifications: Qualification[];
}) {
  const router = useRouter();
  const [qualifications, setQualifications] = useState(initialQualifications);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
    setForm(EMPTY_FORM);
  }

  function startEdit(qual: Qualification) {
    setEditingId(qual.id);
    setForm({
      type: qual.type,
      name: qual.name,
      institution: qual.institution || "",
      yearObtained: qual.yearObtained ? String(qual.yearObtained) : "",
      score: qual.score || "",
      expiryDate: qual.expiryDate ? qual.expiryDate.slice(0, 10) : "",
      documentUrl: qual.documentUrl || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleDelete(qual: Qualification) {
    if (!confirm(`Remove ${qual.name}?`)) return;
    const res = await fetch(`/api/cadre/qualifications?id=${encodeURIComponent(qual.id)}`, { method: "DELETE" });
    if (res.ok) {
      setQualifications((prev) => prev.filter((q) => q.id !== qual.id));
      if (editingId === qual.id) closeForm();
      router.refresh();
    } else {
      setError("Could not remove that qualification. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cadre/qualifications", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Could not save the qualification");
        return;
      }
      const saved: Qualification = await res.json();
      setQualifications((prev) =>
        editingId ? prev.map((q) => (q.id === saved.id ? saved : q)) : [saved, ...prev]
      );
      closeForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="qualifications"
      className="scroll-mt-20 rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-6"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Qualifications
          </h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {qualifications.length}
          </span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {!collapsed && (
        <div className="border-t border-gray-100 px-6 pb-6">
          {qualifications.length === 0 && !showForm && (
            <p className="py-4 text-sm text-gray-400">
              No qualifications added yet. Add your degrees, fellowships, and
              certifications.
            </p>
          )}

          {error && !showForm && (
            <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-2 space-y-3">
            {qualifications.map((qual) => (
              <div
                key={qual.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {qual.name}
                    </span>
                    <TypeBadge type={qual.type} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {[qual.institution, qual.yearObtained]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {qual.score && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      Score: {qual.score}
                    </p>
                  )}
                  {qual.expiryDate && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      Expires:{" "}
                      {new Date(qual.expiryDate).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
                  {qual.documentUrl && (
                    <a
                      href={qual.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B3C5D] hover:underline"
                    >
                      Document
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(qual)}
                    className="text-[#0B3C5D] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(qual)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. MBBS, FWACP, ACLS, PLAB 1, IELTS"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                    placeholder="e.g. University of Lagos"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Year obtained
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={form.yearObtained}
                    onChange={(e) =>
                      setForm({ ...form, yearObtained: e.target.value })
                    }
                    placeholder="2020"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Score (optional)
                  </label>
                  <input
                    type="text"
                    value={form.score}
                    onChange={(e) =>
                      setForm({ ...form, score: e.target.value })
                    }
                    placeholder="e.g. 7.5, Pass"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expiry date (optional)
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Copy of the certificate <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  {form.documentUrl ? (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
                      <span className="text-emerald-700">Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, documentUrl: "" })}
                        className="text-gray-500 hover:text-red-600"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <FileUpload
                      folder="documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSizeMB={10}
                      label="Upload PDF or photo"
                      onUpload={({ url }) => setForm((f) => ({ ...f, documentUrl: url }))}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0B3C5D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A3350] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add qualification"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setShowForm(true);
              }}
              className="mt-4 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-[#0B3C5D] transition hover:border-[#0B3C5D] hover:bg-[#0B3C5D]/5"
            >
              + Add qualification
            </button>
          )}
        </div>
      )}
    </div>
  );
}
