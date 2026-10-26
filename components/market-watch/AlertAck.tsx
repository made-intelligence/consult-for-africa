"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AlertAck({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/admin/market-watch/alerts/${id}`, { method: "POST" });
        router.refresh();
      }}
      className="px-2.5 py-1 rounded-md text-xs font-semibold"
      style={{ border: "1px solid #e5eaf0", color: "#0F2744", opacity: busy ? 0.6 : 1 }}
    >
      Done
    </button>
  );
}
