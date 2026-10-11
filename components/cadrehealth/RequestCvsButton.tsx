"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * One click to email every applicant who has no CV on file, for one role or for
 * every live role. The count is worked out on the server page.
 */
export function RequestCvsButton({ mandateId, count }: { mandateId?: string; count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    const scope = mandateId ? "this role" : "all live roles";
    if (!confirm(`Email ${count} applicant${count !== 1 ? "s" : ""} on ${scope} asking for their CV?`)) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/cadrehealth/request-cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mandateId ? { mandateId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const skipped = [
        data.skippedRecent ? `${data.skippedRecent} asked this week` : "",
        data.skippedSuppressed ? `${data.skippedSuppressed} suppressed` : "",
        data.failed ? `${data.failed} failed` : "",
      ].filter(Boolean);
      setResult(`Sent ${data.sent}${skipped.length ? `; ${skipped.join(", ")}` : ""}`);
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-gray-500">{result}</span>}
      <button
        onClick={send}
        disabled={loading || count === 0}
        className="rounded-lg border border-[#0B3C5D]/20 px-4 py-2 text-sm font-medium text-[#0B3C5D] hover:bg-[#0B3C5D]/5 disabled:opacity-50"
      >
        {loading ? "Sending..." : count === 0 ? "All applicants have CVs" : `Request CVs (${count})`}
      </button>
    </div>
  );
}
