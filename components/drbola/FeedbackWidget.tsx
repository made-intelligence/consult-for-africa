"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Preview only. Dr Bola, or anyone he forwards the link to, leaves a note
 * against the page they are on, and it lands in the CFA queue tagged with that
 * page, so feedback arrives already sorted instead of as a WhatsApp essay.
 */
export default function FeedbackWidget() {
  const page = usePathname();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send() {
    setState("sending");
    setError("");
    const res = await fetch("/api/drbola", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "feedback", page, comment, name: name || null }),
    }).catch(() => null);
    if (res?.ok) {
      setState("sent");
      setComment("");
      return;
    }
    const j = await res?.json().catch(() => null);
    setError(j?.error ?? "That did not send. Please try again.");
    setState("error");
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-(--db-ink)">Feedback on this page</div>
              <div className="mt-0.5 font-mono text-[11px] text-(--db-muted)">{page}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-(--db-muted) hover:text-(--db-ink)" aria-label="Close">
              ✕
            </button>
          </div>
          {state === "sent" ? (
            <div className="mt-4 text-sm text-(--db-body)">
              Thank you. Got it.
              <button onClick={() => setState("idle")} className="ml-2 font-medium text-(--db-ink) underline">
                Add another
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What should change? Wrong facts, wording, photos, anything."
                className="mt-3 w-full rounded-lg border border-(--db-line) p-2.5 text-sm text-(--db-ink) outline-none focus:border-(--db-gold)"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="mt-2 w-full rounded-lg border border-(--db-line) p-2.5 text-sm text-(--db-ink) outline-none focus:border-(--db-gold)"
              />
              {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
              <button
                onClick={send}
                disabled={state === "sending" || comment.trim().length < 2}
                className="mt-3 w-full rounded-full bg-(--db-ink) py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {state === "sending" ? "Sending" : "Send"}
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-amber-950 shadow-lg hover:bg-amber-300"
        >
          Leave feedback
        </button>
      )}
    </div>
  );
}
