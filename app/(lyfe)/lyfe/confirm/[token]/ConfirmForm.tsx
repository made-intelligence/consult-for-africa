"use client";

import { useState } from "react";
import { LYFE_EVENT, MEDLYFE_BRAND as MB } from "@/lib/lyfe";

type Answer = "CONFIRMED" | "DECLINED";

export default function ConfirmForm({
  token,
  firstName,
  guestCount,
  alreadyAnswered,
  answeredAs,
}: {
  token: string;
  firstName: string;
  guestCount: number;
  alreadyAnswered: boolean;
  answeredAs: Answer | null;
}) {
  const [guests, setGuests] = useState(guestCount);
  const [done, setDone] = useState<Answer | null>(alreadyAnswered ? answeredAs : null);
  const [busy, setBusy] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function answer(reply: Answer) {
    setBusy(reply);
    setError(null);
    try {
      const res = await fetch("/api/lyfe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reply, guestCount: reply === "CONFIRMED" ? guests : 0 }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "That did not go through.");
      setDone(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(null);
    }
  }

  if (done === "CONFIRMED") {
    return (
      <div className="mt-10">
        <p className="text-[19px]" style={{ color: MB.white, fontWeight: 600 }}>
          Your place is held.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: MB.mist }}>
          Thank you, {firstName}. A note with the details is on its way to you. If your plans
          change, reply to it and tell us, because releasing a place lets somebody else have it.
        </p>
      </div>
    );
  }

  if (done === "DECLINED") {
    return (
      <div className="mt-10">
        <p className="text-[19px]" style={{ color: MB.white, fontWeight: 600 }}>
          Noted, with thanks.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: MB.mist }}>
          We are sorry to miss you, {firstName}. The place goes to somebody on the list, and we
          will keep you in mind for the next one.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <p className="text-[17px] leading-relaxed" style={{ color: MB.white }}>
        {firstName}, are you able to join us?
      </p>

      <div className="mt-7">
        <label
          className="text-[10.5px] font-semibold uppercase"
          style={{ color: MB.lime, letterSpacing: "0.15em" }}
        >
          Bringing anybody?
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGuests(n)}
              className="px-5 py-2.5 text-[14px] transition-colors"
              style={{
                background: guests === n ? MB.lime : "transparent",
                color: guests === n ? MB.greenDeep : MB.mist,
                border: `1px solid ${guests === n ? MB.lime : "rgba(216,227,214,0.28)"}`,
                fontWeight: guests === n ? 600 : 400,
              }}
            >
              {n === 0 ? "Just me" : n === 1 ? "One guest" : "Two guests"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-9 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => answer("CONFIRMED")}
          className="px-8 py-3.5 text-[15px] font-semibold disabled:opacity-60"
          style={{ background: MB.lime, color: MB.greenDeep }}
        >
          {busy === "CONFIRMED" ? "One moment" : "Yes, I will be there"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => answer("DECLINED")}
          className="px-8 py-3.5 text-[15px] disabled:opacity-60"
          style={{ background: "transparent", color: MB.mist, border: "1px solid rgba(216,227,214,0.28)" }}
        >
          {busy === "DECLINED" ? "One moment" : "I cannot make it"}
        </button>
      </div>

      {error && (
        <p className="mt-5 text-[14px]" style={{ color: "#FCA5A5" }}>
          {error}
        </p>
      )}

      <p className="mt-8 text-[13px] leading-relaxed" style={{ color: "#9FB4A6" }}>
        The room holds {LYFE_EVENT.places}. Telling us you cannot come is as useful to us as
        telling us you can.
      </p>
    </div>
  );
}
