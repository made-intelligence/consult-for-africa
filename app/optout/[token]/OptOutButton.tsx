"use client";

import { useState } from "react";

export default function OptOutButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function go() {
    setState("busy");
    const res = await fetch("/api/hospital-sales/optout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  if (state === "done") return <p className="mt-6 text-sm font-medium" style={{ color: "#0B3C5D" }}>Done. You will not hear from us by email again.</p>;
  return (
    <>
      <button
        onClick={go}
        disabled={state === "busy"}
        className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: "#0B3C5D" }}
      >
        {state === "busy" ? "One moment" : "Stop the emails"}
      </button>
      {state === "error" && <p className="mt-3 text-sm text-red-600">That link did not work. Reply to the email and we will remove you by hand.</p>}
    </>
  );
}
