"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const REASONS: Record<string, string> = {
  missing: "That link was incomplete. Ask for a new one below.",
  expired: "That link has expired or has already been used. Ask for a new one below.",
  inactive: "That account is no longer active. Speak to someone from Consult for Africa.",
};

function LoginForm() {
  const params = useSearchParams();
  const reason = REASONS[params.get("e") ?? ""] ?? null;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/haven-staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // The reply is deliberately the same either way, so there is nothing
      // useful to tell the person here beyond "check your email".
    }
    setSent(true);
    setBusy(false);
  }

  const field: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px",
    fontSize: 16, // 16px or iOS zooms the page on focus
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 26 }}>
      {sent ? (
        <>
          <h2 style={{ color: NAVY, fontSize: 21, margin: 0 }}>Check your email</h2>
          <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.65, margin: "10px 0 0" }}>
            If that address is on the staff list, a link is on its way to it. Tap the link and you are
            in. It lasts thirty minutes.
          </p>
          <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, margin: "14px 0 0" }}>
            Nothing arrived? Check your spam folder, then ask any of us and we will sort it out.
          </p>
          <button
            onClick={() => setSent(false)}
            style={{ background: "transparent", border: "none", color: TEAL, fontWeight: 600, fontSize: 15, padding: "14px 0 0", cursor: "pointer" }}
          >
            Try a different address
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2 style={{ color: NAVY, fontSize: 21, margin: 0 }}>Sign in</h2>
          <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.65, margin: "10px 0 20px" }}>
            Put in your email address and we will send you a link. There is no password to remember.
          </p>
          {reason && (
            <p style={{ background: "#FBEEE9", color: "#7A2F2F", fontSize: 14.5, lineHeight: 1.6, padding: "12px 14px", borderRadius: 10, margin: "0 0 18px" }}>
              {reason}
            </p>
          )}
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={field}
          />
          <button
            type="submit"
            disabled={busy}
            style={{ marginTop: 14, width: "100%", background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "14px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "Sending…" : "Send me a link"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function HavenStaffLogin() {
  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "48px 20px 52px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 18 }} />
          <div style={{ color: "#9FC6D1", fontWeight: 700, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase" }}>
            Haven Paediatric Centre
          </div>
          <h1 style={{ color: "#fff", fontSize: 30, lineHeight: 1.15, margin: "12px 0 0", letterSpacing: "-0.02em" }}>
            The staff page
          </h1>
        </div>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px 72px" }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
