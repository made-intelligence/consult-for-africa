"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLOSED_STAGES, STAGES } from "@/lib/hospital-sales";

async function post(body: unknown) {
  const res = await fetch("/api/hospital-sales/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Failed");
  return data;
}

const btn = "rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50";

export function CampaignControls({ id, status, queued }: { id: string; status: string; queued: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(label: string, body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(label);
    setMsg(null);
    try {
      const r = await post(body);
      if (label === "test") setMsg(`Test sent to ${r.to}`);
      if (label === "queue") setMsg(`${r.queued} queued, ${r.suppressed} suppressed, of ${r.matched} matched`);
      if (label === "send") setMsg(`${r.sent} sent, ${r.failed} failed, ${r.suppressed} suppressed${r.capReached ? ". Daily cap reached." : ""}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button className={`${btn} border border-slate-300 text-slate-700`} disabled={!!busy} onClick={() => run("test", { action: "test", campaignId: id })}>Send me a test</button>
      <button className={`${btn} border border-slate-300 text-slate-700`} disabled={!!busy} onClick={() => run("queue", { action: "queue", campaignId: id })}>Queue every hospital with an email</button>
      {status !== "SENDING" ? (
        <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={!!busy || !queued} onClick={() => run("start", { action: "start", campaignId: id }, `Start sending? ${queued} emails are queued. They go out only when you press Send next batch.`)}>Start</button>
      ) : (
        <>
          <button className={`${btn} bg-[#D4AF37] text-[#0F2744]`} disabled={!!busy || !queued} onClick={() => run("send", { action: "send", campaignId: id, max: 50 }, "Send the next 50 emails now? This cannot be undone.")}>Send next batch (50)</button>
          <button className={`${btn} border border-slate-300 text-slate-700`} disabled={!!busy} onClick={() => run("pause", { action: "pause", campaignId: id })}>Pause</button>
        </>
      )}
      {busy && <span className="text-xs text-slate-400">Working…</span>}
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </div>
  );
}

export function NewCampaign({ defaults, product }: { defaults: { name: string; subject: string; body: string; ctaText: string }; product: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...defaults, dailyCap: 30 });
  const [err, setErr] = useState<string | null>(null);

  if (!open) return <button className={`${btn} border border-dashed border-slate-300 text-slate-600`} onClick={() => setOpen(true)}>New campaign</button>;
  const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">Placeholders: {"{{greeting}}"} becomes &quot;Dear name,&quot; or &quot;Good day,&quot;; {"{{hospital}}"} is the hospital. The tracked link and the opt-out line are added for you.</p>
      <input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Campaign name" />
      <input className={field} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Subject" />
      <textarea className={field} rows={14} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <div className="flex gap-2">
        <input className={field} value={f.ctaText} onChange={(e) => setF({ ...f, ctaText: e.target.value })} placeholder="Link text" />
        <input className={`${field} w-32`} type="number" min={10} max={500} value={f.dailyCap} onChange={(e) => setF({ ...f, dailyCap: Number(e.target.value) })} title="Daily cap" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button
          className={`${btn} bg-[#0B3C5D] text-white`}
          onClick={async () => {
            try {
              await post({ action: "create", product, ...f });
              setOpen(false);
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Save as draft
        </button>
        <button className={`${btn} text-slate-500`} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

export function HospitalActions({ id, product, stage }: { id: string; product: string; stage: string }) {
  const router = useRouter();
  const [log, setLog] = useState<null | "CALL" | "WHATSAPP">(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function setStage(s: string) {
    setBusy(true);
    await post({ action: "stage", hospitalId: id, product, stage: s }).catch(() => null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex max-w-md flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-1">
        {[...STAGES.slice(1), ...CLOSED_STAGES].map((s) => (
          <button key={s.key} disabled={busy || s.key === stage} onClick={() => setStage(s.key)} className={`rounded-full px-2 py-0.5 text-[11px] ${s.key === stage ? "bg-[#0B3C5D] text-white" : "border border-slate-200 text-slate-600 hover:border-slate-400"}`}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <button className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600" onClick={() => setLog("CALL")}>Log call</button>
        <button className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600" onClick={() => setLog("WHATSAPP")}>Log WhatsApp</button>
      </div>
      {log && (
        <div className="flex w-full gap-1">
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Who you spoke to and what was said" className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs" />
          <button
            className="rounded bg-[#0B3C5D] px-2 py-1 text-xs text-white"
            disabled={text.trim().length < 2}
            onClick={async () => {
              await post({ action: "logContact", hospitalId: id, channel: log, summary: text }).catch(() => null);
              if (stage === "TARGET") await post({ action: "stage", hospitalId: id, product, stage: "CONTACTED" }).catch(() => null);
              setLog(null);
              setText("");
              router.refresh();
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
