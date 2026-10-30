"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Per-credential verdict buttons for the admin profile page. */
export function CredentialVerdict({ credentialId, status, hasNumber }: { credentialId: string; status: string; hasNumber: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function set(next: "VERIFIED" | "FAILED" | "PENDING") {
    setLoading(next);
    try {
      const res = await fetch(`/api/admin/cadrehealth/credentials/${credentialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update credential");
    } finally {
      setLoading(null);
    }
  }

  if (status === "VERIFIED" || status === "FAILED") {
    return (
      <button onClick={() => set("PENDING")} disabled={!!loading} className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-50">
        {loading ? "Undoing..." : "Undo"}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => set("VERIFIED")}
        disabled={!!loading || !hasNumber}
        title={hasNumber ? "Checked on the register and it matches" : "No number to check"}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
      >
        {loading === "VERIFIED" ? "Saving..." : "Verified on register"}
      </button>
      <button
        onClick={() => set("FAILED")}
        disabled={!!loading}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
      >
        {loading === "FAILED" ? "Saving..." : "Could not confirm"}
      </button>
    </div>
  );
}
