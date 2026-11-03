"use client";

import { useState } from "react";

/** The note, one tap to copy, one tap to open WhatsApp with it filled in. */
export default function CopyNote({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const btn: React.CSSProperties = { border: 0, borderRadius: 10, padding: "13px 20px", fontWeight: 700, fontSize: 15, textDecoration: "none", textAlign: "center" };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} style={{ ...btn, background: "#1F7A4D", color: "#fff" }}>
          Forward on WhatsApp
        </a>
        <button
          onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); }}
          style={{ ...btn, background: "#0B3C5D", color: "#fff" }}
        >
          {copied ? "Copied" : "Copy the text"}
        </button>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 18, fontSize: 15, lineHeight: 1.6, fontFamily: "inherit", color: "#1F2937", margin: 0 }}>
        {text}
      </pre>
      <p style={{ color: "#64748b", fontSize: 13.5, marginTop: 12 }}>
        Forward on WhatsApp opens WhatsApp with the text filled in. Pick the founders&apos; group and send. You can edit it there first.
      </p>
    </div>
  );
}
