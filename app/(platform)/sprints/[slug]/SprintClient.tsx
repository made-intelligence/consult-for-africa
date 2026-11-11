"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CHANNELS, NEEDS, outcomesFor } from "@/lib/outreach";

async function call(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "That did not save. Try again.");
  return data;
}

const btn = "rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50";
const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0B3C5D] focus:outline-none";

// ---------------------------------------------------------------- copy

export function CopyBox({ text, label = "Copy", extra }: { text: string; label?: string; extra?: string }) {
  const [done, setDone] = useState(false);
  const full = extra ? `${text}\n${extra}` : text;
  return (
    <div className="relative">
      <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 pr-20 font-sans text-sm leading-relaxed text-slate-700">{full}</pre>
      <button
        className="absolute right-2 top-2 rounded-md bg-[#0B3C5D] px-2.5 py-1 text-xs font-medium text-white"
        onClick={async () => {
          await navigator.clipboard.writeText(full);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }}
      >
        {done ? "Copied" : label}
      </button>
    </div>
  );
}

/** The 5pm check-in, with the one line the record cannot know: what is blocking you. */
export function CheckInBox({ text }: { text: string }) {
  const [blocked, setBlocked] = useState("");
  const body = text.replace(/- Blocked: .*$/m, `- Blocked: ${blocked.trim() || "nothing"}`);
  return (
    <div className="space-y-2">
      <input className={input} placeholder="Anything blocking you, and who you need it from" value={blocked} onChange={(e) => setBlocked(e.target.value)} />
      <CopyBox text={body} label="Copy check-in" />
      <p className="text-xs text-slate-500">Paste it as your comment on today&apos;s check-in task. The numbers come from what you logged today.</p>
    </div>
  );
}

// ---------------------------------------------------------------- log a touch

export function LogTouch({ slug, targetId, stage, nextHref }: { slug: string; targetId: string; stage: string; nextHref?: string | null }) {
  const router = useRouter();
  const [channel, setChannel] = useState<string>("CALL");
  const [picked, setPicked] = useState<string | null>(null);
  const [spokeTo, setSpokeTo] = useState("");
  const [said, setSaid] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [nextOn, setNextOn] = useState("");
  const [happenedOn, setHappenedOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const options = outcomesFor(stage);

  if (!options.length) return <p className="text-sm text-slate-500">Nothing left to log here.</p>;

  async function save() {
    if (!picked) return setErr("Pick what happened");
    setBusy(true);
    setErr(null);
    try {
      const r = await call(`/api/sprints/${slug}/touch`, "POST", { targetId, channel, outcome: picked, spokeTo, said, needs, note, ...(nextOn ? { nextOn } : {}), ...(happenedOn ? { happenedOn } : {}) });
      setSaved(r.nextAction ? `Saved. Next: ${r.nextAction}` : "Saved.");
      setPicked(null);
      setSpokeTo("");
      setSaid("");
      setNeeds([]);
      setNote("");
      setNextOn("");
      setHappenedOn("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
    setBusy(false);
  }

  const tone: Record<string, string> = {
    neutral: "border-slate-300 text-slate-700",
    good: "border-emerald-300 text-emerald-800",
    great: "border-emerald-500 text-emerald-900",
    bad: "border-rose-300 text-rose-700",
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">How</p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => (
            <button key={c.key} className={`${btn} border ${channel === c.key ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300 text-slate-700"}`} onClick={() => setChannel(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">What happened</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => setPicked(o.key)}
              className={`rounded-lg border px-3 py-2 text-left ${picked === o.key ? "ring-2 ring-[#D4AF37] " : ""}${tone[o.tone]} bg-white`}
            >
              <span className="block text-sm font-semibold">{o.label}</span>
              <span className="block text-xs text-slate-500">{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {picked && picked !== "NO_ANSWER" && (
        <div className="space-y-3">
          <input className={input} placeholder="Who you spoke to (name and role)" value={spokeTo} onChange={(e) => setSpokeTo(e.target.value)} />
          <div>
            <textarea
              className={`${input} min-h-[84px]`}
              placeholder="What did they say? Their words, not a summary. Anything about their own hospital counts: HMOs owing them, staff, records, patients."
              value={said}
              onChange={(e) => setSaid(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Did they mention</p>
            <div className="flex flex-wrap gap-2">
              {NEEDS.map((n) => {
                const on = needs.includes(n.key);
                return (
                  <button key={n.key} onClick={() => setNeeds(on ? needs.filter((x) => x !== n.key) : [...needs, n.key])} className={`rounded-full border px-3 py-1 text-xs ${on ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#7a5f10]" : "border-slate-300 text-slate-600"}`}>
                    {n.label}
                  </button>
                );
              })}
            </div>
          </div>
          {picked === "CALLBACK" && (
            <label className="block text-sm text-slate-600">
              Call back on
              <input type="date" className={`${input} mt-1`} value={nextOn} onChange={(e) => setNextOn(e.target.value)} />
            </label>
          )}
          {(picked === "SENT" || picked === "SIGNED") && (
            <label className="block text-sm text-slate-600">
              {picked === "SENT" ? "Sent on" : "Signed on"} <span className="text-xs text-slate-400">(leave blank for today)</span>
              <input type="date" className={`${input} mt-1`} value={happenedOn} onChange={(e) => setHappenedOn(e.target.value)} />
            </label>
          )}
          <input className={input} placeholder="Note for yourself (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}

      {err && <p className="text-sm text-rose-700">{err}</p>}
      {saved && (
        <p className="text-sm text-emerald-700">
          {saved}
          {nextHref && (
            <Link href={nextHref} className="ml-3 font-semibold text-[#0B3C5D] underline">
              Next provider
            </Link>
          )}
        </p>
      )}
      <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={busy || !picked} onClick={save}>
        {busy ? "Saving" : "Log it"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- signatory

export function SignatoryForm({ slug, targetId, initial }: { slug: string; targetId: string; initial: { signatoryName: string | null; signatoryRole: string | null; signatoryPhone: string | null; signatoryEmail: string | null } }) {
  const router = useRouter();
  const [f, setF] = useState({ signatoryName: initial.signatoryName ?? "", signatoryRole: initial.signatoryRole ?? "", signatoryPhone: initial.signatoryPhone ?? "", signatoryEmail: initial.signatoryEmail ?? "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={input} placeholder="Name, e.g. Dr Adeyemi" value={f.signatoryName} onChange={set("signatoryName")} />
        <input className={input} placeholder="Role, e.g. MD or owner" value={f.signatoryRole} onChange={set("signatoryRole")} />
        <input className={input} placeholder="Phone or WhatsApp" value={f.signatoryPhone} onChange={set("signatoryPhone")} />
        <input className={input} placeholder="Their own email" value={f.signatoryEmail} onChange={set("signatoryEmail")} />
      </div>
      <div className="flex items-center gap-3">
        <button
          className={`${btn} border border-slate-300 text-slate-700`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await call(`/api/sprints/${slug}/targets/${targetId}`, "PATCH", f);
              setMsg("Saved");
              router.refresh();
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "Failed");
            }
            setBusy(false);
          }}
        >
          Save signatory
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- steering

export function SteerPanel({
  slug,
  targetId,
  ownerId,
  members,
  stage,
  escalated,
}: {
  slug: string;
  targetId: string;
  ownerId: string | null;
  members: { userId: string; name: string }[];
  stage: string;
  escalated: boolean;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(b: object) {
    setBusy(true);
    setMsg(null);
    try {
      await call(`/api/sprints/${slug}/targets/${targetId}`, "PATCH", b);
      setMsg("Done");
      setReason("");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(false);
  }
  const closed = ["PARKED", "DECLINED", "ALREADY_SIGNED"].includes(stage);
  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-600">
        Owner
        <select className={`${input} mt-1`} defaultValue={ownerId ?? ""} disabled={busy} onChange={(e) => e.target.value && run({ ownerId: e.target.value })}>
          <option value="" disabled>
            Nobody
          </option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <textarea className={`${input} min-h-[60px]`} placeholder={escalated ? "What you decided, e.g. Matthew calls the owner on Friday" : "Reason, for parking"} value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {escalated && (
          <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={busy} onClick={() => run({ action: "resolve", reason })}>
            Handled: chase again
          </button>
        )}
        {!closed && (
          <button className={`${btn} border border-slate-300 text-slate-700`} disabled={busy || !reason.trim()} onClick={() => run({ action: "park", reason })}>
            Park it
          </button>
        )}
        {closed && (
          <button className={`${btn} border border-slate-300 text-slate-700`} disabled={busy} onClick={() => run({ action: "reopen" })}>
            Reopen
          </button>
        )}
        <button className={`${btn} border border-slate-300 text-slate-700`} disabled={busy} onClick={() => run({ priority: 50 })}>
          Call this first
        </button>
      </div>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- add a provider

export function AddProvider({ slug, members, steer }: { slug: string; members: { userId: string; name: string }[]; steer: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", lga: "", category: "", phone: "", email: "", source: "", notes: "", ownerId: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  if (!open)
    return (
      <button className={`${btn} border border-slate-300 text-slate-700`} onClick={() => setOpen(true)}>
        Add a provider
      </button>
    );
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={input} placeholder="Provider name" value={f.name} onChange={set("name")} />
        <input className={input} placeholder="LGA, e.g. Ikeja" value={f.lga} onChange={set("lga")} />
        <input className={input} placeholder="Type, e.g. Hospital, Dental" value={f.category} onChange={set("category")} />
        <input className={input} placeholder="Where it came from, e.g. Esther pipeline" value={f.source} onChange={set("source")} />
        <input className={input} placeholder="Phone numbers" value={f.phone} onChange={set("phone")} />
        <input className={input} placeholder="Emails" value={f.email} onChange={set("email")} />
        {steer && (
          <select className={input} value={f.ownerId} onChange={set("ownerId")}>
            <option value="">On my list</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                On {m.name}&apos;s list
              </option>
            ))}
          </select>
        )}
        <input className={input} placeholder="Notes" value={f.notes} onChange={set("notes")} />
      </div>
      <div className="flex items-center gap-3">
        <button
          className={`${btn} bg-[#0B3C5D] text-white`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMsg(null);
            try {
              const r = await call(`/api/sprints/${slug}/targets`, "POST", { ...f, ownerId: f.ownerId || undefined });
              router.push(`/sprints/${slug}/t/${r.targetId}`);
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "Failed");
            }
            setBusy(false);
          }}
        >
          Add
        </button>
        <button className="text-sm text-slate-500" onClick={() => setOpen(false)}>
          Cancel
        </button>
        {msg && <span className="text-sm text-rose-700">{msg}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the hospital's page

const KIND_LABEL = { intro: "Email the introduction", sla: "Email the agreement", chase: "Email a reminder" } as const;

export function HospitalLinkPanel({
  slug,
  targetId,
  link,
  whatsappHref,
  recipient,
  tested,
  hasAgreement,
}: {
  slug: string;
  targetId: string;
  link: string;
  whatsappHref: string | null;
  recipient: string | null;
  tested: { intro: boolean; sla: boolean; chase: boolean };
  hasAgreement: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  async function send(kind: "intro" | "sla" | "chase", test: boolean) {
    setBusy(`${kind}${test}`);
    setMsg(null);
    try {
      const r = await call(`/api/sprints/${slug}/email`, "POST", { kind, targetIds: [targetId], test });
      setMsg(test ? `Test sent to ${r.to}. Read it, then send it for real.` : r.sent ? `Sent to ${recipient}.` : `Not sent: ${r.skipped?.[0]?.why ?? "skipped"}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">The hospital&apos;s own page: it says yes, names who signs, downloads the agreement and sends back the signed copy and documents from a phone.</p>
      <div className="flex flex-wrap gap-2">
        <button
          className={`${btn} border border-slate-300 text-slate-700`}
          onClick={async () => {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy the link"}
        </button>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" className={`${btn} border border-emerald-300 text-emerald-800`}>
            WhatsApp the link
          </a>
        )}
        <a href={link} target="_blank" className={`${btn} border border-slate-300 text-slate-700`}>
          See what they see
        </a>
      </div>
      {recipient ? (
        <div className="space-y-2">
          {(["intro", "sla", "chase"] as const).map((k) => (
            <div key={k} className="flex flex-wrap items-center gap-2">
              <button className={`${btn} ${tested[k] ? "bg-[#0B3C5D] text-white" : "border border-slate-200 text-slate-400"}`} disabled={!!busy || !tested[k] || (k === "sla" && !hasAgreement)} onClick={() => send(k, false)}>
                {KIND_LABEL[k]}
              </button>
              <button className="text-xs text-[#0B3C5D] underline" disabled={!!busy} onClick={() => send(k, true)}>
                {tested[k] ? "test again" : "send me a test first"}
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-500">Goes to {recipient}, from you, and replies come to you. {hasAgreement ? "" : "The agreement email needs the agreement uploaded in Settings."}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-500">No email on file. Save the signatory&apos;s email, or WhatsApp the link.</p>
      )}
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
    </div>
  );
}

export function FileRow({ slug, file, mayReject }: { slug: string; file: { id: string; kind: string; fileName: string; signedBy: string | null; rejectedAt: Date | string | null; rejectNote: string | null; createdAt: Date | string }; mayReject: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-2 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className={file.rejectedAt ? "text-slate-400 line-through" : "text-slate-800"}>
          <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{file.kind === "AGREEMENT" ? "Signed agreement" : "Document"}</span>
          {file.fileName}
          {file.signedBy ? <span className="text-xs text-slate-500"> · signed by {file.signedBy}</span> : null}
        </span>
        <span className="flex gap-2">
          <a href={`/api/sprints/${slug}/files/${file.id}`} target="_blank" className="rounded-md border border-slate-300 px-2 py-1 text-xs">
            View
          </a>
          {mayReject && !file.rejectedAt && (
            <button className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700" onClick={() => setOpen(!open)}>
              Reject
            </button>
          )}
        </span>
      </div>
      {file.rejectedAt && <p className="text-xs text-rose-700">Rejected: {file.rejectNote}</p>}
      {open && (
        <div className="flex gap-2">
          <input className={input} placeholder="What is wrong, in words the hospital will see" value={note} onChange={(e) => setNote(e.target.value)} />
          <button
            className={`${btn} border border-rose-300 text-rose-700`}
            onClick={async () => {
              try {
                await call(`/api/sprints/${slug}/files/${file.id}`, "PATCH", { action: "reject", note });
                setOpen(false);
                router.refresh();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed");
              }
            }}
          >
            Reject
          </button>
        </div>
      )}
      {err && <p className="text-xs text-rose-700">{err}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- bulk introduction

export function BulkIntro({ slug, targetIds, tested }: { slug: string; targetIds: string[]; tested: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!targetIds.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className={`${btn} ${tested ? "bg-[#0B3C5D] text-white" : "border border-slate-200 text-slate-400"}`}
        disabled={busy || !tested}
        onClick={async () => {
          if (!window.confirm(`Email the introduction to ${targetIds.length} providers on this page who have not been contacted? Each goes from you, with its own link.`)) return;
          setBusy(true);
          try {
            const r = await call(`/api/sprints/${slug}/email`, "POST", { kind: "intro", targetIds });
            setMsg(`${r.sent} sent, ${r.skipped.length} skipped${r.skipped.length ? ` (${[...new Set(r.skipped.map((s: { why: string }) => s.why))].join(", ")})` : ""}.`);
            router.refresh();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : "Failed");
          }
          setBusy(false);
        }}
      >
        {busy ? "Sending" : `Email the introduction to ${targetIds.length} not yet contacted`}
      </button>
      {!tested && <span className="text-xs text-slate-500">Send yourself a test from any provider&apos;s page first.</span>}
      {msg && <span className="text-sm text-slate-700">{msg}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- settings

type EmailT = { subject: string; body: string };

export function SprintSettings({
  slug,
  initial,
  testTargetId,
  confirmation,
}: {
  slug: string;
  initial: { pitch: string; checklist: string; emails: { intro: EmailT; sla: EmailT; chase: EmailT }; tested: { intro: boolean; sla: boolean; chase: boolean }; autoChaseOn: boolean; agreementName: string | null };
  testTargetId: string | null;
  confirmation: EmailT;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const changed = (k: "intro" | "sla" | "chase") => f.emails[k].subject !== initial.emails[k].subject || f.emails[k].body !== initial.emails[k].body;

  async function save(extra: object = {}): Promise<boolean> {
    setBusy("save");
    setMsg(null);
    let ok = false;
    try {
      await call(`/api/sprints/${slug}/settings`, "POST", { action: "save", pitch: f.pitch, checklist: f.checklist, emails: f.emails, ...extra });
      setMsg("Saved.");
      ok = true;
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
    return ok;
  }

  async function uploadAgreement(file: File | undefined) {
    if (!file) return;
    setBusy("agreement");
    setMsg(null);
    try {
      const { key, url } = await call(`/api/sprints/${slug}/settings`, "POST", { action: "agreement-url", fileName: file.name, contentType: "application/pdf", size: file.size });
      const put = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: file });
      if (!put.ok) throw new Error("The upload did not go through");
      await call(`/api/sprints/${slug}/settings`, "POST", { action: "agreement-confirm", key, fileName: file.name });
      setMsg(`Agreement uploaded: ${file.name}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
  }

  async function test(kind: "intro" | "sla" | "chase") {
    if (!testTargetId) return setMsg("Add a provider first: the test is rendered for a real one.");
    if (changed(kind)) return setMsg("Save the wording first, then test it.");
    setBusy(`test-${kind}`);
    try {
      const r = await call(`/api/sprints/${slug}/email`, "POST", { kind, targetIds: [testTargetId], test: true });
      setMsg(`Test sent to ${r.to}.`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-[#0B3C5D]">The agreement</h3>
        <p className="text-sm text-slate-600">{f.agreementName ? `On file: ${f.agreementName}.` : "Not uploaded yet. Hospitals cannot download it until it is."} It is stored privately; hospitals get it through their own link.</p>
        <label className={`${btn} inline-block cursor-pointer border border-slate-300 text-slate-700`}>
          {busy === "agreement" ? "Uploading" : f.agreementName ? "Replace the agreement (PDF)" : "Upload the agreement (PDF)"}
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadAgreement(e.target.files?.[0])} />
        </label>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-[#0B3C5D]">What the hospital&apos;s page says</h3>
        <label className="block text-sm text-slate-600">
          Why join, two or three lines the client has confirmed. No numbers they have not confirmed.
          <textarea className={`${input} mt-1 min-h-[90px]`} value={f.pitch} onChange={(e) => setF({ ...f, pitch: e.target.value })} />
        </label>
        <label className="block text-sm text-slate-600">
          Documents checklist, one per line
          <textarea className={`${input} mt-1 min-h-[110px]`} value={f.checklist} onChange={(e) => setF({ ...f, checklist: e.target.value })} />
        </label>
      </section>

      {(["intro", "sla", "chase"] as const).map((k) => (
        <section key={k} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#0B3C5D]">{{ intro: "Introduction email", sla: "Agreement email", chase: "Reminder email" }[k]}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${initial.tested[k] && !changed(k) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{initial.tested[k] && !changed(k) ? "Tested" : "Not tested"}</span>
          </div>
          <input className={input} value={f.emails[k].subject} onChange={(e) => setF({ ...f, emails: { ...f.emails, [k]: { ...f.emails[k], subject: e.target.value } } })} />
          <textarea className={`${input} min-h-[200px] font-mono text-xs`} value={f.emails[k].body} onChange={(e) => setF({ ...f, emails: { ...f.emails, [k]: { ...f.emails[k], body: e.target.value } } })} />
          <div className="flex items-center gap-3">
            <button className={`${btn} border border-slate-300 text-slate-700`} disabled={!!busy} onClick={() => test(k)}>
              Send me a test
            </button>
            <span className="text-xs text-slate-500">
              {"{{contact}} {{facility}} {{client}} {{sender}} {{link}}"} are filled in for each hospital. Any edit needs a new test before it can be sent.
            </span>
          </div>
        </section>
      ))}

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-[#0B3C5D]">Automatic emails to hospitals</h3>
        <p className="text-sm text-slate-600">
          When on: a reminder with the hospital&apos;s link on days 2, 5, 9 and 14 after the agreement went out, weekdays at 9am, from the provider&apos;s owner. And when a pack is handed over, this note:
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs text-slate-600">{`${confirmation.subject}\n\n${confirmation.body}`}</pre>
        <div className="flex items-center gap-3">
          <button className={`${btn} ${f.autoChaseOn ? "border border-rose-300 text-rose-700" : "bg-[#0B3C5D] text-white"}`} disabled={!!busy} onClick={() => save({ autoChaseOn: !f.autoChaseOn }).then((ok) => ok && setF((x) => ({ ...x, autoChaseOn: !x.autoChaseOn })))}>
            {f.autoChaseOn ? "Switch off" : "Switch on"}
          </button>
          <span className="text-sm text-slate-600">{f.autoChaseOn ? "On" : "Off"}</span>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={!!busy} onClick={() => save()}>
          {busy === "save" ? "Saving" : "Save"}
        </button>
        {msg && <span className="text-sm text-slate-700">{msg}</span>}
      </div>
    </div>
  );
}
