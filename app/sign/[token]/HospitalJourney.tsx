"use client";

import { useEffect, useState } from "react";

type Info = {
  facility: string;
  client: string;
  pitch: string | null;
  checklist: string | null;
  hasAgreement: boolean;
  stage: string;
  saidYes: boolean;
  signatoryName: string | null;
  packReady: boolean;
  files: { id: string; kind: string; fileName: string; rejected: boolean; rejectNote: string | null }[];
  contact: string | null;
};

const card: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #E5E0D6", marginTop: 16 };
const button: React.CSSProperties = { display: "inline-block", background: "#0B3C5D", color: "#fff", border: 0, borderRadius: 8, padding: "12px 18px", fontSize: 15, fontWeight: 700, textDecoration: "none", cursor: "pointer" };
const ghost: React.CSSProperties = { ...button, background: "#fff", color: "#0B3C5D", border: "2px solid #0B3C5D" };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 15, marginBottom: 10 };
const h: React.CSSProperties = { margin: "0 0 10px", fontWeight: 700, color: "#0B3C5D", fontSize: 16 };
const muted: React.CSSProperties = { margin: "0 0 10px", color: "#475569", fontSize: 14, lineHeight: 1.6 };

const SIGNED = ["SIGNED", "DOCS", "HANDED_OVER"];

export default function HospitalJourney({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [yes, setYes] = useState({ signatoryName: "", signatoryRole: "", signatoryPhone: "", signatoryEmail: "" });
  const [signedBy, setSignedBy] = useState("");
  const [notNow, setNotNow] = useState<string | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);

  const load = () =>
    fetch(`/api/sign/${token}`)
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

  const post = async (body: unknown) => {
    const r = await fetch(`/api/sign/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "That did not go through. Please try again.");
    return d;
  };

  const act = async (label: string, body: unknown, after?: string) => {
    setBusy(label);
    setError(null);
    try {
      await post(body);
      if (after) setThanks(after);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not go through.");
    }
    setBusy(null);
  };

  const upload = async (kind: "AGREEMENT" | "DOCUMENT", files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      setBusy(file.name);
      try {
        const contentType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        const { key, url } = await post({ action: "UPLOAD_URL", kind, fileName: file.name, contentType, size: file.size });
        const put = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
        if (!put.ok) throw new Error("The upload did not go through. Please try again.");
        await post({ action: "CONFIRM", kind, key, fileName: file.name, contentType, size: file.size, signedBy: kind === "AGREEMENT" ? signedBy.trim() || undefined : undefined });
      } catch (e) {
        setError(e instanceof Error ? e.message : "The upload did not go through.");
        break;
      }
    }
    setBusy(null);
    await load();
  };

  if (error && !info) return <p style={{ color: "#B42318", fontSize: 16 }}>{error}</p>;
  if (!info) return <p style={{ color: "#64748B" }}>Loading</p>;

  const client = info.client;
  const signed = SIGNED.includes(info.stage);
  const done = info.stage === "HANDED_OVER";
  const declined = ["DECLINED", "PARKED", "ALREADY_SIGNED"].includes(info.stage);
  const checklist = info.checklist?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];
  const agreements = info.files.filter((f) => f.kind === "AGREEMENT");
  const docs = info.files.filter((f) => f.kind === "DOCUMENT");
  const rejected = info.files.filter((f) => f.rejected);
  const goodAgreement = agreements.some((f) => !f.rejected);

  const steps = ["Say yes", "Get the agreement", "Return it signed", "Add the documents", `With ${client}`];
  // Which step is current. Steps before it show as done.
  const at = done ? 5 : info.packReady || info.stage === "DOCS" ? 4 : signed && goodAgreement ? 3 : info.stage === "SENT" ? 2 : info.saidYes ? 1 : 0;

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 24, color: "#0B3C5D" }}>{info.facility}</h1>
      <p style={{ color: "#334155", fontSize: 15, lineHeight: 1.6 }}>Joining {client}&apos;s Lagos provider network. Everything is on this page, and it works from a phone.</p>

      <ol style={{ display: "flex", gap: 6, listStyle: "none", padding: 0, margin: "16px 0 0", flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <li key={s} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, background: i < at ? "#D1FAE5" : i === at ? "#0B3C5D" : "#fff", color: i < at ? "#065F46" : i === at ? "#fff" : "#64748B", border: "1px solid #E5E0D6" }}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {done && (
        <div style={{ ...card, borderColor: "#A7F3D0", background: "#ECFDF5" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#065F46" }}>You are in. Your signed agreement and documents are with {client}.</p>
          <p style={{ margin: "6px 0 0", color: "#065F46", fontSize: 14 }}>{client} will be in touch about onboarding. Thank you.</p>
        </div>
      )}

      {declined && !done && (
        <div style={card}>
          <p style={muted}>This agreement is closed for now. If that is a mistake, reply to the email you received{info.contact ? ` or call ${info.contact}` : ""}.</p>
        </div>
      )}

      {!declined && !done && (
        <>
          {info.pitch && !signed && (
            <div style={card}>
              <p style={h}>Why join</p>
              {info.pitch.split("\n").filter(Boolean).map((l) => (
                <p key={l} style={muted}>
                  {l}
                </p>
              ))}
            </div>
          )}

          {!info.saidYes && !signed && (
            <div style={card}>
              <p style={h}>1. Would {info.facility} like to join?</p>
              <p style={muted}>Tell us who signs for the facility, so the agreement goes to the right person.</p>
              <input style={field} placeholder="Name of the person who signs, e.g. Dr Adeyemi" value={yes.signatoryName} onChange={(e) => setYes({ ...yes, signatoryName: e.target.value })} />
              <input style={field} placeholder="Their role, e.g. Medical Director" value={yes.signatoryRole} onChange={(e) => setYes({ ...yes, signatoryRole: e.target.value })} />
              <input style={field} placeholder="Their phone or WhatsApp" value={yes.signatoryPhone} onChange={(e) => setYes({ ...yes, signatoryPhone: e.target.value })} />
              <input style={field} placeholder="Their email" value={yes.signatoryEmail} onChange={(e) => setYes({ ...yes, signatoryEmail: e.target.value })} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={button} disabled={!!busy} onClick={() => act("yes", { action: "YES", ...yes }, "Thank you. The agreement is below.")}>
                  {busy === "yes" ? "Sending" : "Yes, we would like to join"}
                </button>
                <button style={ghost} disabled={!!busy} onClick={() => setNotNow(notNow === null ? "" : null)}>
                  Not now
                </button>
              </div>
              {notNow !== null && (
                <div style={{ marginTop: 12 }}>
                  <textarea style={{ ...field, minHeight: 80 }} placeholder="Anything we should know? (optional)" value={notNow} onChange={(e) => setNotNow(e.target.value)} />
                  <button style={ghost} disabled={!!busy} onClick={() => act("no", { action: "NOT_NOW", reason: notNow }, "Thank you for letting us know. Someone may call to understand what would change your mind.")}>
                    Send
                  </button>
                </div>
              )}
            </div>
          )}

          {(info.saidYes || signed) && info.hasAgreement && (
            <div style={card}>
              <p style={h}>2. Get the agreement</p>
              <p style={muted}>Download it, and have it signed by {info.signatoryName || "the person who signs for the facility"}.</p>
              <a href={`/api/sign/${token}?download=agreement`} style={button}>
                Download the agreement
              </a>
            </div>
          )}

          {(info.saidYes || signed) && (
            <div style={card}>
              <p style={h}>3. Return it signed</p>
              {goodAgreement ? (
                <p style={{ ...muted, color: "#065F46" }}>Received: {agreements.filter((f) => !f.rejected).map((f) => f.fileName).join(", ")}.</p>
              ) : (
                <>
                  <p style={muted}>A PDF, a scan, or clear photos of each signed page.</p>
                  <input style={field} placeholder="Name of the person who signed" value={signedBy} onChange={(e) => setSignedBy(e.target.value)} />
                  <label style={button}>
                    {busy && busy !== "yes" && busy !== "no" ? `Sending ${busy}` : "Choose the signed agreement"}
                    <input type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} disabled={!!busy} onChange={(e) => upload("AGREEMENT", e.target.files)} />
                  </label>
                </>
              )}
            </div>
          )}

          {(info.saidYes || signed) && (
            <div style={card}>
              <p style={h}>4. Add the documents</p>
              {checklist.length > 0 && (
                <ul style={{ margin: "0 0 12px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.7 }}>
                  {checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              <label style={ghost}>
                {busy && busy !== "yes" && busy !== "no" ? "Sending" : "Add documents"}
                <input type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} disabled={!!busy} onChange={(e) => upload("DOCUMENT", e.target.files)} />
              </label>
              {docs.length > 0 && (
                <p style={{ ...muted, marginTop: 10 }}>
                  Received: {docs.filter((d) => !d.rejected).map((d) => d.fileName).join(", ") || "none yet"}
                </p>
              )}
              {goodAgreement && !info.packReady && (
                <div style={{ marginTop: 12 }}>
                  <button style={button} disabled={!!busy} onClick={() => act("ready", { action: "PACK_READY" }, "Thank you. The team will check everything and send it on.")}>
                    That is everything
                  </button>
                </div>
              )}
              {info.packReady && <p style={{ ...muted, marginTop: 10, color: "#065F46" }}>The team is checking your agreement and documents, and will send them to {client}.</p>}
            </div>
          )}

          {rejected.length > 0 && (
            <div style={{ ...card, borderColor: "#FECACA", background: "#FEF2F2" }}>
              <p style={{ ...h, color: "#991B1B" }}>Please send these again</p>
              {rejected.map((f) => (
                <p key={f.id} style={{ ...muted, color: "#991B1B" }}>
                  {f.fileName}
                  {f.rejectNote ? `: ${f.rejectNote}` : ""}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {thanks && <p style={{ marginTop: 16, color: "#065F46", fontSize: 14 }}>{thanks}</p>}
      {error && <p style={{ marginTop: 16, color: "#B42318", fontSize: 14 }}>{error}</p>}
      <p style={{ marginTop: 32, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
        This page is private to {info.facility}. What you upload goes only to the team handling your agreement with {client}, and is used for nothing else.
        {info.contact ? ` Your contact is ${info.contact}.` : ""} Managed by Consult for Africa on behalf of {client}.
      </p>
    </div>
  );
}
