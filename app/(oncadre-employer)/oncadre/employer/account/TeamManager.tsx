"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Inviting a colleague onto the account.
 *
 * A hospital could previously have exactly one login, because the facility link
 * carried a unique constraint on the account row. In practice an HR manager and
 * a medical director both need to see the pipeline, and sharing one password is
 * what happens when a product refuses to allow two.
 */

const ROLES = [
  { value: "RECRUITER", label: "Recruiter", hint: "Post roles, search, move the pipeline" },
  { value: "VIEWER", label: "Viewer", hint: "Can see the pipeline, cannot change it" },
  { value: "OWNER", label: "Owner", hint: "Everything, including inviting colleagues" },
];

export default function TeamManager() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECRUITER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  async function invite() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cadre/employer/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName: name, contactEmail: email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not invite them.");
        return;
      }
      setInvited(data.setupLink ?? null);
      setName("");
      setEmail("");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
        style={{ border: "1px solid #E8EBF0", color: "#0B3C5D", minHeight: "44px" }}
      >
        Invite a colleague
      </button>
    );
  }

  return (
    <div className="mt-5 max-w-md rounded-xl p-4" style={{ background: "#F8F9FB" }}>
      {invited ? (
        <>
          <p className="text-sm font-semibold text-gray-900">Invitation created</p>
          <p className="mt-1 text-xs text-gray-500">
            We have emailed them a link to set a password. If it does not arrive, send
            them this:
          </p>
          <code
            className="mt-2 block break-all rounded-lg p-2 text-[10px]"
            style={{ background: "#FFF", border: "1px solid #E2E8F0", color: "#0F2744" }}
          >
            {invited}
          </code>
          <button
            type="button"
            onClick={() => {
              setInvited(null);
              setOpen(false);
            }}
            className="mt-3 text-sm font-medium text-[#0B3C5D] underline-offset-2 hover:underline"
          >
            Done
          </button>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Their name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
                style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Their work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
                style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                What can they do
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
                style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                {ROLES.find((r) => r.value === role)?.hint}
              </p>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={invite}
              disabled={saving || !name.trim() || !email.trim()}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#0B3C5D", minHeight: "44px" }}
            >
              {saving ? "Inviting..." : "Send invitation"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
