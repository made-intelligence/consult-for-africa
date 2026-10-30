"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRegulatoryBody } from "@/lib/cadreHealth/cadres";
import FileUpload from "@/components/shared/FileUpload";

interface Credential {
  id: string;
  type: string;
  regulatoryBody: string;
  licenseNumber: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  verificationStatus: string;
  documentUrl: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  PRACTICING_LICENSE: "Practising licence",
  FULL_REGISTRATION: "Full registration",
  COGS: "Certificate of good standing",
  SPECIALIST_REGISTRATION: "Specialist registration",
  ADDITIONAL_LICENSE: "Additional licence",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const REGULATORY_BODIES = [
  "MDCN",
  "NMCN",
  "PCN",
  "MLSCN",
  "RRBN",
  "MRTB",
  "ODORBN",
  "CHPRBN",
  "EHORECON",
  "ICNDN",
  "COREN",
];

// What each status means to the member, and who acts next. "Pending" on its
// own read as "you still owe us something".
const STATUS: Record<string, { bg: string; text: string; label: string; note: string }> = {
  VERIFIED: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    label: "Verified",
    note: "Checked against the register.",
  },
  PENDING: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    label: "Awaiting our check",
    note: "Nothing more needed from you. We check every number against the register before marking it verified.",
  },
  NOT_SUBMITTED: {
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-500",
    label: "Number missing",
    note: "Add the licence number so we can check it.",
  },
  FAILED: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    label: "Could not confirm",
    note: "We could not match this number on the register. Check it and edit, or write to hello@consultforafrica.com.",
  },
  EXPIRED: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-600",
    label: "Expired",
    note: "Add your renewed licence by editing this entry.",
  },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS[status] || STATUS.NOT_SUBMITTED;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

const EMPTY_FORM = {
  type: "PRACTICING_LICENSE",
  regulatoryBody: "",
  licenseNumber: "",
  issuedDate: "",
  expiryDate: "",
  documentUrl: "",
};

function toDateInput(d: string | null) {
  return d ? d.slice(0, 10) : "";
}

export default function ProfileCredentials({
  initialCredentials,
  cadre,
}: {
  initialCredentials: Credential[];
  cadre: string;
}) {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const defaultBody =
    REGULATORY_BODIES.find(
      (b) => b === getRegulatoryBody(cadre).split(" / ")[0]
    ) || REGULATORY_BODIES[0];

  const blankForm = { ...EMPTY_FORM, regulatoryBody: defaultBody };
  const [form, setForm] = useState(blankForm);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
    setForm(blankForm);
  }

  function startEdit(cred: Credential) {
    setEditingId(cred.id);
    setForm({
      type: cred.type,
      regulatoryBody: cred.regulatoryBody,
      licenseNumber: cred.licenseNumber || "",
      issuedDate: toDateInput(cred.issuedDate),
      expiryDate: toDateInput(cred.expiryDate),
      documentUrl: cred.documentUrl || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleDelete(cred: Credential) {
    if (!confirm(`Remove ${TYPE_LABELS[cred.type] || cred.type}${cred.licenseNumber ? ` (${cred.licenseNumber})` : ""}?`)) return;
    const res = await fetch(`/api/cadre/credentials?id=${encodeURIComponent(cred.id)}`, { method: "DELETE" });
    if (res.ok) {
      setCredentials((prev) => prev.filter((c) => c.id !== cred.id));
      if (editingId === cred.id) closeForm();
      router.refresh();
    } else {
      setError("Could not remove that credential. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cadre/credentials", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Could not save the credential");
        return;
      }
      const saved: Credential = await res.json();
      // The API updates an existing entry rather than adding a duplicate, so
      // replace by id when it is already on screen.
      setCredentials((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...prev]
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
      id="credentials"
      className="scroll-mt-20 rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-6"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {credentials.length}
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
          {credentials.length === 0 && !showForm && (
            <p className="py-4 text-sm text-gray-400">
              No credentials added yet. Add your practising licence first;
              it is the one employers look for.
            </p>
          )}

          {error && !showForm && (
            <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-2 space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {TYPE_LABELS[cred.type] || cred.type}
                    </span>
                    <StatusBadge status={cred.verificationStatus} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {cred.regulatoryBody}
                    {cred.licenseNumber ? ` - ${cred.licenseNumber}` : ""}
                  </p>
                  {cred.expiryDate && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      Expires:{" "}
                      {new Date(cred.expiryDate).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {(STATUS[cred.verificationStatus] || STATUS.NOT_SUBMITTED).note}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
                  {cred.documentUrl && (
                    <a
                      href={cred.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B3C5D] hover:underline"
                    >
                      Document
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(cred)}
                    className="text-[#0B3C5D] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cred)}
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
                    Credential type
                  </label>
                  <select
                    value={form.type}
                    disabled={!!editingId}
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
                    Regulatory body
                  </label>
                  <select
                    value={form.regulatoryBody}
                    disabled={!!editingId}
                    onChange={(e) =>
                      setForm({ ...form, regulatoryBody: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  >
                    {REGULATORY_BODIES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Licence number
                  </label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm({ ...form, licenseNumber: e.target.value })
                    }
                    placeholder="e.g. MDCN/R/12345"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Issue date
                  </label>
                  <input
                    type="date"
                    value={form.issuedDate}
                    onChange={(e) =>
                      setForm({ ...form, issuedDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0B3C5D] focus:outline-none focus:ring-1 focus:ring-[#0B3C5D]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expiry date
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Copy of the certificate <span className="font-normal text-gray-400">(optional, helps us check faster)</span>
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
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add credential"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(blankForm);
                setShowForm(true);
              }}
              className="mt-4 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-[#0B3C5D] transition hover:border-[#0B3C5D] hover:bg-[#0B3C5D]/5"
            >
              + Add credential
            </button>
          )}
        </div>
      )}
    </div>
  );
}
