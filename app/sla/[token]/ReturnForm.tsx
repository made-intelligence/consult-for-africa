"use client";

import { useEffect, useState } from "react";

interface Info {
  facility: string;
  senderName: string;
  checklist: string | null;
  hasTemplate: boolean;
  signed: boolean;
  documents: number;
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #E5E0D6", marginTop: 16 };
const button: React.CSSProperties = { display: "inline-block", background: "#0B3C5D", color: "#fff", border: 0, borderRadius: 8, padding: "12px 18px", fontSize: 15, fontWeight: 700, textDecoration: "none", cursor: "pointer" };

export default function ReturnForm({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatory, setSignatory] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const load = () =>
    fetch(`/api/sla/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "This link is not valid.");
        setInfo(d);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const upload = async (kind: "SLA" | "DOC", files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      setBusy(file.name);
      try {
        const contentType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        const post = (body: unknown) =>
          fetch(`/api/sla/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Upload failed. Please try again.");
            return d;
          });
        const { key, url } = await post({ action: "UPLOAD_URL", kind, fileName: file.name, contentType, size: file.size });
        const put = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
        if (!put.ok) throw new Error("Upload failed. Please try again.");
        await post({ action: "CONFIRM", kind, key, fileName: file.name, signatoryName: kind === "SLA" ? signatory.trim() || undefined : undefined });
        setDone((d) => [...d, file.name]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      } finally {
        setBusy(null);
      }
    }
    load();
  };

  if (error && !info) return <p style={{ color: "#B42318", fontSize: 16 }}>{error}</p>;
  if (!info) return <p style={{ color: "#64748B" }}>Loading…</p>;

  const checklist = info.checklist?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 24, color: "#0B3C5D" }}>{info.facility}</h1>
      <p style={{ color: "#334155", fontSize: 15, lineHeight: 1.6 }}>
        Your provider agreement with {info.senderName.replace(/ Provider Network$/i, "")}. Return the signed copy here, from a phone or a computer. It takes a minute.
      </p>

      {info.signed ? (
        <div style={{ ...card, borderColor: "#A7F3D0", background: "#ECFDF5" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#065F46" }}>Thank you. We have your signed agreement.</p>
          <p style={{ margin: "6px 0 0", color: "#065F46", fontSize: 14 }}>If any documents are still outstanding, you can add them below.</p>
        </div>
      ) : (
        <>
          {info.hasTemplate && (
            <div style={card}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#0B3C5D" }}>1. Download the agreement</p>
              <a href={`/api/sla/${token}?download=sla`} style={button}>Download the agreement</a>
            </div>
          )}
          <div style={card}>
            <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#0B3C5D" }}>{info.hasTemplate ? "2. " : ""}Send the signed copy</p>
            <p style={{ margin: "0 0 10px", color: "#475569", fontSize: 14 }}>A PDF, a scan, or clear photos of each signed page.</p>
            <input value={signatory} onChange={(e) => setSignatory(e.target.value)} placeholder="Name of the person who signed (optional)" style={{ width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 15, marginBottom: 10 }} />
            <label style={button}>
              {busy ? `Sending ${busy}…` : "Choose the signed agreement"}
              <input type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} disabled={!!busy} onChange={(e) => upload("SLA", e.target.files)} />
            </label>
          </div>
        </>
      )}

      <div style={card}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#0B3C5D" }}>Supporting documents</p>
        {checklist.length > 0 && (
          <ul style={{ margin: "0 0 12px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.7 }}>
            {checklist.map((c) => <li key={c}>{c}</li>)}
          </ul>
        )}
        <label style={{ ...button, background: "#fff", color: "#0B3C5D", border: "2px solid #0B3C5D" }}>
          {busy ? "Sending…" : "Add documents"}
          <input type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} disabled={!!busy} onChange={(e) => upload("DOC", e.target.files)} />
        </label>
        {info.documents > 0 && <p style={{ margin: "10px 0 0", color: "#475569", fontSize: 13 }}>{info.documents} document{info.documents === 1 ? "" : "s"} received so far.</p>}
      </div>

      {done.length > 0 && <p style={{ marginTop: 16, color: "#065F46", fontSize: 14 }}>Received: {done.join(", ")}</p>}
      {error && <p style={{ marginTop: 16, color: "#B42318", fontSize: 14 }}>{error}</p>}
    </div>
  );
}
