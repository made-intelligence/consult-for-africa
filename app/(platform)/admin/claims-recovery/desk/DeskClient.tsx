"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export async function desk(body: unknown) {
  const res = await fetch("/api/recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Failed");
  return data;
}

export function OpenAccountButton({ hospitalId }: { hospitalId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className="rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        const a = await desk({ action: "openAccount", hospitalId }).catch(() => null);
        if (a?.id) router.push(`/admin/claims-recovery/desk/${a.id}`);
        setBusy(false);
      }}
    >
      Put on the desk
    </button>
  );
}
