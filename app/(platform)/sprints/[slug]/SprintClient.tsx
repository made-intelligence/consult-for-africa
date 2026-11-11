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
