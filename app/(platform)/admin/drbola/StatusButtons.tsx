"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusButtons({ id, current, options }: { id: string; current: string; options: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function set(status: string) {
    setBusy(status);
    await fetch("/api/drbola", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => set(o)}
          disabled={!!busy || o === current}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            o === current ? "bg-[#0B3C5D] text-white" : "border border-slate-200 text-slate-600 hover:border-slate-400"
          } disabled:cursor-default`}
        >
          {busy === o ? "…" : o}
        </button>
      ))}
    </div>
  );
}
