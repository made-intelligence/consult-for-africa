"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const field: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  fontSize: 16, // 16px or iOS zooms the page on focus
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const primary: React.CSSProperties = {
  marginTop: 14,
  width: "100%",
  background: NAVY,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "14px 22px",
  fontSize: 15.5,
  fontWeight: 600,
  cursor: "pointer",
};

export default function HavenStaffLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function askForCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/haven-staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // The reply is deliberately identical either way, so there is nothing
      // useful to say here beyond "check your email".
    }
    setCode("");
    setStep("code");
    setBusy(false);
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/haven-staff/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        router.push("/HavenStaff");
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "That code is not right, or it has expired.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

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
        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 26 }}>
          {step === "email" ? (
            <form onSubmit={askForCode}>
              <h2 style={{ color: NAVY, fontSize: 21, margin: 0 }}>Sign in</h2>
              <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.65, margin: "10px 0 20px" }}>
                Put in your email address and we will send you a six-digit code. There is no password
                to remember.
              </p>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                style={field}
              />
              <button type="submit" disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Sending…" : "Send me a code"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode}>
              <h2 style={{ color: NAVY, fontSize: 21, margin: 0 }}>Enter your code</h2>
              <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.65, margin: "10px 0 20px" }}>
                If <strong style={{ color: NAVY }}>{email}</strong> is on the staff list, a six-digit
                code is on its way to it. It lasts thirty minutes.
              </p>
              <input
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ ...field, fontSize: 26, letterSpacing: ".4em", textAlign: "center", fontWeight: 700, color: NAVY }}
              />
              {error && (
                <p style={{ background: "#FBEEE9", color: "#7A2F2F", fontSize: 14.5, lineHeight: 1.6, padding: "12px 14px", borderRadius: 10, margin: "14px 0 0" }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy || code.length !== 6} style={{ ...primary, opacity: busy || code.length !== 6 ? 0.5 : 1 }}>
                {busy ? "Checking…" : "Sign in"}
              </button>
              <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
                <button type="button" onClick={() => askForCode()} disabled={busy} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, fontSize: 14.5, padding: 0, cursor: "pointer" }}>
                  Send another code
                </button>
                <button type="button" onClick={() => { setStep("email"); setError(null); }} style={{ background: "none", border: "none", color: MUTED, fontSize: 14.5, padding: 0, cursor: "pointer" }}>
                  Use a different address
                </button>
              </div>
              <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6, margin: "18px 0 0" }}>
                Nothing arrived? Check your spam folder, then ask any of us and we will sort it out.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
