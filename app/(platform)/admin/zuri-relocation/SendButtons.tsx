"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendButtons({ waiting }: { waiting: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"test" | "send" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: "test" | "send") {
    if (action === "send" && !confirm(`Send the relocation questions to ${waiting} applicants?`)) return;
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/zuri-relocation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const r = await res.json();
      if (action === "test") setMessage(r.ok ? "Test copy sent to your inbox." : `Test failed: ${r.error}`);
      else setMessage(r.error ? `Failed: ${r.error}` : `Sent to ${r.sent}.${r.failed?.length ? ` ${r.failed.length} failed: ${r.failed.join("; ")}` : ""}`);
      router.refresh();
    } catch {
      setMessage("The request failed. Nothing is sent twice, so it is safe to press again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => run("test")} disabled={busy !== null || waiting === 0} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 disabled:opacity-50">
          {busy === "test" ? "Sending..." : "Send me a test"}
        </button>
        <button onClick={() => run("send")} disabled={busy !== null || waiting === 0} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: "#0B3C5D" }}>
          {busy === "send" ? "Sending..." : `Send to ${waiting} applicants`}
        </button>
      </div>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}
