"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Candidate } from "./CandidateCard";

/**
 * Asking a professional whether they may be contacted.
 *
 * The employer writes the message and the professional reads it before deciding,
 * which is why a bare request is refused by the API. Most of the register was
 * imported from a regulatory list and never agreed to hear from hospitals, so
 * the dialog is explicit that this is a request and not a reveal.
 */
export default function ApproachDialog({
  candidate,
  employerVerified,
  onClose,
}: {
  candidate: Candidate;
  employerVerified: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState<{ id: string; title: string }[]>([]);
  const [mandateId, setMandateId] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employerVerified) return;
    fetch("/api/cadre/employer/roles?status=OPEN")
      .then((r) => (r.ok ? r.json() : { roles: [] }))
      .then((d) => setRoles(d.roles ?? []))
      .catch(() => setRoles([]));
  }, [employerVerified]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/cadre/employer/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: candidate.id,
          mandateId: mandateId || null,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send that.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send that. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(15,39,68,0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Approach ${candidate.name}`}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!employerVerified ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              You need to be verified first
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Searching is open to everyone. Approaching a professional puts your
              organisation&rsquo;s name in front of them, so we verify who you are
              before we do that. It is a short check and we come back to you.
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/oncadre/employer/account"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "#0B3C5D" }}
              >
                Start verification
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        ) : sent ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">We have asked them</h2>
            <p className="mt-2 text-sm text-gray-600">
              {candidate.name} will see your message and decide whether to share
              their contact details. We will tell you either way, and you can see
              what is outstanding under Approaches.
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/oncadre/employer/candidates/approaches"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "#0B3C5D" }}
              >
                See approaches
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Keep searching
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              Ask {candidate.name} if you may make contact
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {candidate.tier.tier === "OPEN"
                ? "They have told us they want to hear from employers. They still choose whether you get their details."
                : "They have not said whether they are looking. We will pass on your message and you will hear either way."}
            </p>

            {roles.length > 0 && (
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Which role? <span className="text-gray-400">Optional</span>
                </label>
                <select
                  value={mandateId}
                  onChange={(e) => setMandateId(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
                  style={{ border: "1px solid #E8EBF0", minHeight: "44px" }}
                >
                  <option value="">Not about a specific role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Naming a real job gets answered far more often than a bare request.
                </p>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Your message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell them who you are, what the role is, and why you thought of them."
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
                style={{ border: "1px solid #E8EBF0" }}
              />
              <p className="mt-1 text-xs text-gray-400">
                {message.trim().length < 20
                  ? `${20 - message.trim().length} more characters needed`
                  : `${message.trim().length} characters`}
              </p>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={send}
                disabled={sending || message.trim().length < 20}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ background: "#0B3C5D", minHeight: "44px" }}
              >
                {sending ? "Sending..." : "Send request"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
