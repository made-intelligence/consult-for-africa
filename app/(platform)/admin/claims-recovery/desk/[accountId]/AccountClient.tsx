"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { desk } from "../DeskClient";

const btn = "rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50";
const outline = `${btn} border border-slate-300 text-slate-700 hover:border-slate-500`;

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  async function run(label: string, body: object, done?: (r: Record<string, unknown>) => string | void) {
    setBusy(label);
    setMsg(null);
    try {
      const r = await desk(body);
      const m = done?.(r);
      if (m) setMsg(m);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
    setBusy(null);
  }
  return { busy, msg, run };
}

export function AccountBar({ id, status, signed, advanceRate, fundingLive, ackCoverage, ackNeeded, overdue }: { id: string; status: string; signed: string | null; advanceRate: number; fundingLive: boolean; ackCoverage: number; ackNeeded: number; overdue: number }) {
  const { busy, msg, run } = useAction();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <span>Status <strong>{status}</strong></span>
      <span className="text-slate-500">{signed ? `Agreement signed ${signed}` : "No signed agreement"}</span>
      <span className="text-slate-500">Advance rate {Math.round(advanceRate * 100)}%</span>
      <span className={fundingLive ? "text-green-700" : "text-slate-400"}>{fundingLive ? "Funding live" : "Funding not live: decisions will HOLD"}</span>
      <span className={ackCoverage >= ackNeeded ? "text-green-700" : "text-amber-700"}>HMO letters cover {Math.round(ackCoverage * 100)}% of HMO billing (draws open at {Math.round(ackNeeded * 100)}%)</span>
      {overdue > 0 && <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">{overdue} overdue: no new draws</span>}
      {status !== "ACTIVE" && (
        <span className="ml-auto flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-xs" />
          <button className={outline} disabled={!!busy} onClick={() => run("activate", { action: "activate", accountId: id, signedOn: date })}>Agreement signed</button>
        </span>
      )}
      {msg && <span className="text-xs text-red-600">{msg}</span>}
    </div>
  );
}

export function ImportBox({ accountId }: { accountId: string }) {
  const { busy, msg, run } = useAction();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"SAMPLE" | "LIVE">("SAMPLE");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">Receive claims</h3>
      <p className="mt-1 text-xs text-slate-500">
        Paste the hospital&apos;s sheet (copy from Excel or a CSV). Columns found by name: claim ref, HMO/payer, enrollee id, service date, date submitted, service, auth code, documents, amount billed, tariff, payer response. No patient names.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs" placeholder="Claim Ref,HMO,Service Date,Amount Billed,..." />
      <div className="mt-2 flex items-center gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as "SAMPLE" | "LIVE")} className="rounded border border-slate-300 px-2 py-1 text-xs">
          <option value="SAMPLE">Free sample review</option>
          <option value="LIVE">Live batch</option>
        </select>
        <input
          type="file"
          accept=".csv,.tsv,.txt"
          className="text-xs"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setText(await f.text());
          }}
        />
        <button
          className={`${btn} ml-auto bg-[#0B3C5D] text-white`}
          disabled={!!busy || text.trim().length < 10}
          onClick={() =>
            run("import", { action: "import", accountId, kind, text: text.includes("\t") && !text.includes(",") ? text.replace(/\t/g, ",") : text }, (r) => {
              setText("");
              const skipped = (r.skipped as string[]) ?? [];
              return `${r.created} claims received${r.duplicates ? `, ${r.duplicates} already on file` : ""}${skipped.length ? `. Skipped: ${skipped.slice(0, 3).join("; ")}${skipped.length > 3 ? "…" : ""}` : ""}`;
            })
          }
        >
          {busy ? "Reading…" : "Receive"}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

export function VetButton({ batchId }: { batchId: string }) {
  const { busy, msg, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <button className={`${btn} bg-[#D4AF37] text-[#0F2744]`} disabled={!!busy} onClick={() => run("vet", { action: "vet", batchId }, (r) => `${r.vetted} verified${r.unreadable ? `, ${r.unreadable} need a person` : ""}${r.left ? `. ${r.left} still to verify: press again.` : ""}`)}>
        {busy ? "Verifying the next 20, a few minutes…" : "Verify next 20 claims"}
      </button>
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </span>
  );
}

type PayerProps = {
  accountId: string;
  payer: { id: string; name: string; type: string; conflict: boolean; conflictNote: string | null; advanceEligible: boolean; expectedDaysToPay: number; dueDays: number };
  /** Date the acknowledgment letter was signed for this hospital, if it has been. */
  ack: string | null;
  openCount: number;
  openValue: string;
  draft: { letterSubject: string; letterBody: string; callScript: string; escalateTo: string | null; at: string } | null;
};

export function PayerPanel({ accountId, payer, ack, openCount, openValue, draft }: PayerProps) {
  const { busy, msg, run } = useAction();
  const [mode, setMode] = useState<null | "call" | "draft">(null);
  const [notes, setNotes] = useState("");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-[#0B3C5D]">
          {payer.name} <span className="text-xs font-normal text-slate-500">{payer.type}</span>
          {payer.conflict && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">CFA conflict</span>}
        </p>
        <p className="text-xs text-slate-500">{openCount} open · {openValue}</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Pays in {payer.expectedDaysToPay} days (the minimum period) · due at {payer.dueDays} days ·{" "}
        {ack ? <span className="text-green-700">letter signed {ack}</span> : <span className="text-amber-700">no acknowledgment letter</span>}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={!!busy || !openCount} onClick={() => run("plan", { action: "plan", accountId, payerId: payer.id }, () => "Plan ready: queue ranked, letter and call script drafted")}>
          {busy === "plan" ? "Planning…" : "Plan recovery"}
        </button>
        <button className={outline} onClick={() => setMode(mode === "call" ? null : "call")}>Log a call</button>
        {draft && <button className={outline} onClick={() => setMode(mode === "draft" ? null : "draft")}>Letter and script ({draft.at})</button>}
        <button
          className={outline}
          disabled={!!busy}
          onClick={() => {
            const conflict = !payer.conflict;
            const note = conflict ? window.prompt("Why is this a conflict? (e.g. CFA advises this HMO)") : null;
            if (conflict && !note) return;
            run("flags", { action: "payerFlags", payerId: payer.id, conflict, conflictNote: note, advanceEligible: payer.advanceEligible });
          }}
        >
          {payer.conflict ? "Clear conflict" : "Mark conflict"}
        </button>
        <button
          className={outline}
          disabled={!!busy}
          onClick={() => {
            const type = window.prompt("Payor type: HMO, CORPORATE, NHIA, STATE_SCHEME, MILITARY or OTHER. Only HMO is funded.", payer.type)?.trim().toUpperCase();
            if (!type) return;
            const exp = Number(window.prompt("Usual days from acceptance to payment (the minimum interest period)", String(payer.expectedDaysToPay)));
            const due = Number(window.prompt("Days until the hospital owes the advance back (120 at most)", String(payer.dueDays)));
            if (!exp || !due) return;
            run("terms", { action: "payerTerms", payerId: payer.id, type, expectedDaysToPay: exp, dueDays: due });
          }}
        >
          Terms
        </button>
        {payer.type === "HMO" && (
          <button
            className={outline}
            disabled={!!busy}
            onClick={() => {
              const signedOn = window.prompt("Date the HMO signed the acknowledgment letter (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
              if (!signedOn) return;
              const url = window.prompt("Link to the signed letter (optional)") || null;
              run("ack", { action: "acknowledge", accountId, payerId: payer.id, signedOn, documentUrl: url, notes: null });
            }}
          >
            {ack ? "Update letter" : "Letter signed"}
          </button>
        )}
      </div>
      {payer.conflict && payer.conflictNote && <p className="mt-2 text-xs text-red-700">{payer.conflictNote}. Never advanced; recover only with the hospital told in writing.</p>}
      {mode === "call" && (
        <div className="mt-3">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className="w-full rounded-lg border border-slate-300 p-2 text-xs" placeholder="Paste the call notes or transcript: who you spoke to, what they agreed, which claims, what dates." />
          <button
            className={`${btn} mt-2 bg-[#0B3C5D] text-white`}
            disabled={!!busy || notes.trim().length < 10}
            onClick={() =>
              run("call", { action: "call", accountId, payerId: payer.id, notes }, (r) => {
                setNotes("");
                setMode(null);
                const p = (r?.promises as unknown[] | undefined)?.length ?? 0;
                return `Call logged${p ? `, ${p} promise${p > 1 ? "s" : ""} recorded` : ""}`;
              })
            }
          >
            {busy === "call" ? "Reading the call…" : "Save call"}
          </button>
        </div>
      )}
      {mode === "draft" && draft && (
        <div className="mt-3 space-y-3 text-xs">
          <div>
            <p className="font-semibold text-slate-700">Letter: {draft.letterSubject}</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans leading-relaxed text-slate-700">{draft.letterBody}</pre>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Call script</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans leading-relaxed text-slate-700">{draft.callScript}</pre>
          </div>
          {draft.escalateTo && <p className="text-amber-800">Escalate to: {draft.escalateTo}</p>}
          <p className="text-slate-400">A draft. Read it, correct it, and send it yourself.</p>
        </div>
      )}
      {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

type ClaimProps = { claim: { id: string; accountId: string; status: string; verdict: string | null; confirmed: boolean; decision: string | null; approved: boolean; accepted: boolean; advanced: boolean; advanceOpen: boolean } };

export function ClaimActions({ claim: c }: ClaimProps) {
  const { busy, msg, run } = useAction();
  const open = !["PAID", "WRITTEN_OFF"].includes(c.status);
  return (
    <div className="flex max-w-xs flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1">
        {open && !c.advanced && (
          <button
            className={outline}
            disabled={!!busy}
            onClick={() => {
              const amount = window.prompt("Amount the payor accepted (naira)");
              if (!amount) return;
              const ref = window.prompt("Payor's acceptance reference (optional)") || null;
              run("accept", { action: "accept", claimId: c.id, amount: amount.replace(/[,₦\s]/g, ""), acceptedOn: new Date().toISOString(), ref });
            }}
          >
            {c.accepted ? "Change accepted amount" : "Payor accepted"}
          </button>
        )}
        {c.verdict && !c.confirmed && <button className={outline} disabled={!!busy} onClick={() => run("confirm", { action: "confirmVet", claimId: c.id })}>Confirm verification</button>}
        {c.status === "VETTED" && c.confirmed && <button className={outline} disabled={!!busy} onClick={() => run("decide", { action: "decide", claimId: c.id }, (r) => `${r.decision}`)}>Decide advance</button>}
        {c.decision === "ADVANCE" && !c.approved && <button className={`${btn} bg-[#0B3C5D] text-white`} disabled={!!busy} onClick={() => window.confirm("Approve this advance for the funder?") && run("approve", { action: "approve", claimId: c.id })}>Approve advance</button>}
        {c.decision === "ADVANCE" && c.approved && c.status === "VETTED" && <button className={outline} disabled={!!busy} onClick={() => window.confirm("Has Carbon paid this advance, less the discount and our fee, to the hospital?") && run("adv", { action: "markAdvanced", claimId: c.id }, (r) => `₦${r.net} to the hospital, due ${r.due}`)}>Carbon paid</button>}
        {open && (
          <button
            className={outline}
            disabled={!!busy}
            onClick={() => {
              const amount = window.prompt("Amount received (naira, e.g. 125000.00)");
              if (!amount) return;
              const ref = window.prompt("Payment reference (optional)") || null;
              run("pay", { action: "payment", claimId: c.id, amount: amount.replace(/[,₦\s]/g, ""), receivedAt: new Date().toISOString(), reference: ref }, (r) => `Now ${r.status}`);
            }}
          >
            Payment received
          </button>
        )}
        {open && !c.advanceOpen && (
          <button
            className={`${btn} text-slate-400 hover:text-red-600`}
            disabled={!!busy}
            onClick={() => {
              const reason = window.prompt("Why is this claim being written off?");
              if (reason) run("wo", { action: "writeOff", claimId: c.id, reason });
            }}
          >
            Write off
          </button>
        )}
      </div>
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </div>
  );
}

type PayerOption = { id: string; name: string };

/** Money into the hospital's collection account at Carbon, split as it is recorded. */
export function ReceiptBox({ accountId, payers }: { accountId: string; payers: PayerOption[] }) {
  const { busy, msg, run } = useAction();
  const [f, setF] = useState({ source: "HMO", payerId: payers[0]?.id ?? "", amount: "", receivedAt: new Date().toISOString().slice(0, 10), reference: "", lines: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const field = "rounded border border-slate-300 px-2 py-1 text-xs";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">Money into the collection account</h3>
      <p className="mt-1 text-xs text-slate-500">
        An HMO remittance, or a hospital repaying an advance. List the claims it covers from the remittance advice, one per line: claim ref, amount. Carbon is paid first on any advanced claim, then any overdue advance, then the hospital within 48 hours. Anything not matched to a claim goes to the hospital.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={f.source} onChange={set("source")} className={field}>
          <option value="HMO">From an HMO</option>
          <option value="HOSPITAL">From the hospital (recourse)</option>
        </select>
        <select value={f.payerId} onChange={set("payerId")} className={field}>
          {f.source === "HOSPITAL" && <option value="">Any payor</option>}
          {payers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input value={f.amount} onChange={set("amount")} placeholder="Amount" className={`${field} w-28`} />
        <input type="date" value={f.receivedAt} onChange={set("receivedAt")} className={field} />
        <input value={f.reference} onChange={set("reference")} placeholder="Bank reference" className={`${field} w-36`} />
      </div>
      <textarea value={f.lines} onChange={set("lines")} rows={4} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs" placeholder={"CLM-0012, 450000\nCLM-0019, 120000"} />
      <div className="mt-2 flex items-center gap-2">
        <button
          className={`${btn} ml-auto bg-[#0B3C5D] text-white`}
          disabled={!!busy || !f.amount}
          onClick={() =>
            run(
              "receipt",
              { action: "receipt", accountId, payerId: f.payerId || null, source: f.source, amount: f.amount.replace(/[,₦\s]/g, ""), receivedAt: new Date(f.receivedAt).toISOString(), reference: f.reference || null, lines: f.lines },
              (r) => {
                setF((p) => ({ ...p, amount: "", reference: "", lines: "" }));
                return `₦${r.toFunder} to Carbon, ₦${r.toHospital} to the hospital${Number(r.feesReleased) > 0 ? `, ₦${r.feesReleased} of our fees released` : ""}`;
              },
            )
          }
        >
          {busy ? "Splitting…" : "Record and split"}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

export function PayoutButton({ receiptId }: { receiptId: string }) {
  const { busy, msg, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <button className={outline} disabled={!!busy} onClick={() => window.confirm("Has the hospital's share left the collection account?") && run("paid", { action: "hospitalPaid", receiptId })}>
        Paid to hospital
      </button>
      {msg && <span className="text-xs text-red-600">{msg}</span>}
    </span>
  );
}
