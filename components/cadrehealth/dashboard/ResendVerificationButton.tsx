"use client";

import { useState } from "react";

/** The "Verify your email" next step: actually resends the link. */
export default function ResendVerificationButton({ accent }: { accent: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/cadre/resend-verification", { method: "POST" });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return <p className="mt-4 text-sm font-semibold" style={{ color: accent }}>Sent. Check your inbox and spam folder.</p>;
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending"}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: accent }}
      >
        {state === "sending" ? "Sending..." : "Resend verification email"}
      </button>
      {state === "failed" && (
        <p className="mt-2 text-sm" style={{ color: accent }}>
          Could not send just now. Try again, or write to hello@consultforafrica.com.
        </p>
      )}
    </div>
  );
}
