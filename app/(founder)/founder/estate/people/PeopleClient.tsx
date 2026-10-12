"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RotateCw, UserPlus, Check, Link2 } from "lucide-react";
import { naira } from "@/lib/estate/ledger";

/**
 * Issuing, copying and rotating links.
 *
 * The full link is never printed on the page. It is put on the clipboard on
 * demand and a fingerprint is shown instead, because this screen gets left open
 * on a laptop in a meeting and a token in plain sight is a token in somebody's
 * phone camera.
 */

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  accessToken: string;
  lastSeenAt: string | null;
}

interface Unit {
  id: string;
  label: string;
  status: string;
  bedrooms: number | null;
  dieselShare: number;
  dieselBalance: number;
  serviceBalance: number;
  tenants: Tenant[];
}

interface Building {
  id: string;
  name: string;
  area: string;
  units: Unit[];
}

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  active: boolean;
  accessToken: string;
  hasPin: boolean;
  scope: string;
  lastSeenAt: string | null;
}

export default function PeopleClient({ buildings, staff }: { buildings: Building[]; staff: Staff[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addingStaff, setAddingStaff] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [newPin, setNewPin] = useState<{ name: string; pin: string } | null>(null);

  async function copyLink(kind: "home" | "crew", token: string, id: string) {
    const url = `${window.location.origin}/estate/${kind}/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard is blocked outside a secure context and on some browsers.
      // Falling back to a prompt is ugly but it still gets the link copied,
      // which is the entire point of the button.
      window.prompt("Copy this link", url);
    }
  }

  async function act(url: string, body: unknown, onDone?: (data: Record<string, unknown>) => void) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: body && "action" in (body as object) ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not work.");
      onDone?.(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl p-3 text-xs font-semibold" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}
      {newPin && (
        <div
          className="rounded-xl p-4"
          style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
        >
          <p className="text-xs font-bold" style={{ color: "#92400E" }}>
            {newPin.name}&rsquo;s PIN is {newPin.pin}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#92400E" }}>
            Write it down now. It is stored hashed and cannot be shown again — you would have to set a
            new one.
          </p>
          <button
            onClick={() => setNewPin(null)}
            className="mt-2 text-[11px] font-semibold underline"
            style={{ color: "#92400E" }}
          >
            Got it
          </button>
        </div>
      )}

      {buildings.map((b) => (
        <section key={b.id}>
          <h2 className="text-sm font-bold tracking-tight mb-3" style={{ color: "#0F2744" }}>
            {b.name}
          </h2>
          <div className="space-y-2">
            {b.units.map((u) => {
              const live = u.tenants.filter((t) => t.active);
              return (
                <div
                  key={u.id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                  style={{ border: "1px solid #E8EBF0" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold" style={{ color: "#0F2744" }}>
                        {u.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {u.status.replace(/_/g, " ").toLowerCase()} · share {u.dieselShare}
                        {u.bedrooms ? ` · ${u.bedrooms} bed` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-xs font-bold"
                        style={{ color: u.dieselBalance <= 0 ? "#DC2626" : "#0F2744" }}
                      >
                        {naira(u.dieselBalance)}
                      </p>
                      <p className="text-[9px] text-gray-400">diesel deposit</p>
                      {u.serviceBalance !== 0 && (
                        <p
                          className="text-[9px] font-semibold mt-1"
                          style={{ color: u.serviceBalance < 0 ? "#DC2626" : "#059669" }}
                        >
                          {naira(u.serviceBalance)} service charge
                        </p>
                      )}
                      <button
                        onClick={() => setPaying(paying === u.id ? null : u.id)}
                        className="mt-1 text-[10px] font-semibold underline"
                        style={{ color: "#D4AF37" }}
                      >
                        Record a payment
                      </button>
                    </div>
                  </div>

                  {paying === u.id && (
                    <RecordPayment
                      unitId={u.id}
                      busy={busy}
                      onCancel={() => setPaying(null)}
                      onSubmit={(body) =>
                        act("/api/founder/estate/payments", body, () => setPaying(null))
                      }
                    />
                  )}

                  {live.map((t) => (
                    <div
                      key={t.id}
                      className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {t.email ?? t.phone ?? "No contact"} ·{" "}
                          {t.lastSeenAt
                            ? `last opened ${new Date(t.lastSeenAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                            : "never opened"}{" "}
                          · …{t.accessToken.slice(-6)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          label="Copy link"
                          onClick={() => copyLink("home", t.accessToken, t.id)}
                          active={copied === t.id}
                        >
                          {copied === t.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </IconButton>
                        <IconButton
                          label="New link"
                          onClick={() => {
                            if (confirm(`Issue ${t.name} a new link? The old one stops working immediately.`))
                              act(`/api/founder/estate/tenants/${t.id}`, { action: "rotate" });
                          }}
                          disabled={busy}
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  ))}

                  {adding === u.id ? (
                    <AddTenant
                      unitId={u.id}
                      busy={busy}
                      onCancel={() => setAdding(null)}
                      onSubmit={(body) =>
                        act("/api/founder/estate/tenants", body, () => setAdding(null))
                      }
                    />
                  ) : (
                    live.length === 0 && (
                      <button
                        onClick={() => setAdding(u.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold"
                        style={{ color: "#D4AF37" }}
                      >
                        <UserPlus className="h-3 w-3" /> Add a tenant
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* ── Ground team ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight" style={{ color: "#0F2744" }}>
            Ground team
          </h2>
          <button
            onClick={() => setAddingStaff((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: "#D4AF37" }}
          >
            <UserPlus className="h-3 w-3" /> Add someone
          </button>
        </div>

        {addingStaff && (
          <AddStaff
            buildings={buildings}
            busy={busy}
            onCancel={() => setAddingStaff(false)}
            onSubmit={(body) =>
              act("/api/founder/estate/staff", body, (data) => {
                setAddingStaff(false);
                if (data.pin) setNewPin({ name: String(data.name), pin: String(data.pin) });
              })
            }
          />
        )}

        <div className="space-y-2">
          {staff.length === 0 && !addingStaff && (
            <div
              className="rounded-2xl bg-white p-10 text-center shadow-sm"
              style={{ border: "1px solid #E8EBF0" }}
            >
              <p className="text-sm text-gray-400">
                Nobody on the ground team yet. Without one, nobody can log a generator run.
              </p>
            </div>
          )}
          {staff.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-4 shadow-sm flex items-center justify-between gap-3"
              style={{ border: "1px solid #E8EBF0", opacity: s.active ? 1 : 0.5 }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: "#0F2744" }}>
                  {s.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {s.role.toLowerCase()} · {s.scope} ·{" "}
                  {s.hasPin ? "PIN set" : "no PIN"} ·{" "}
                  {s.lastSeenAt
                    ? `last on ${new Date(s.lastSeenAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                    : "never opened"}{" "}
                  · …{s.accessToken.slice(-6)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconButton
                  label="Copy link"
                  onClick={() => copyLink("crew", s.accessToken, s.id)}
                  active={copied === s.id}
                >
                  {copied === s.id ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                </IconButton>
                <IconButton
                  label="New link"
                  onClick={() => {
                    if (confirm(`Issue ${s.name} a new link? The old one stops working immediately.`))
                      act(`/api/founder/estate/staff/${s.id}`, { action: "rotate" });
                  }}
                  disabled={busy}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="rounded-lg p-2 transition-colors"
      style={{
        background: active ? "#D1FAE5" : "#F3F4F6",
        color: active ? "#065F46" : "#4B5563",
      }}
    >
      {children}
    </button>
  );
}

function AddTenant({
  unitId,
  busy,
  onCancel,
  onSubmit,
}: {
  unitId: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-3 space-y-2">
      <input
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
        placeholder="Full name"
        className="w-full rounded-lg border px-3 py-2 text-xs"
        style={{ borderColor: "#E8EBF0" }}
      />
      <div className="flex gap-2">
        <input
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          placeholder="Email (optional)"
          className="flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <input
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
          placeholder="Phone (optional)"
          className="flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSubmit({ unitId, name: f.name, email: f.email || null, phone: f.phone || null })
          }
          disabled={busy || f.name.trim().length < 2}
          className="rounded-lg px-3 py-2 text-[11px] font-semibold text-white"
          style={{ background: "#0F2744", opacity: f.name.trim().length < 2 ? 0.4 : 1 }}
        >
          Add and issue a link
        </button>
        <button onClick={onCancel} className="rounded-lg px-3 py-2 text-[11px] font-semibold text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddStaff({
  buildings,
  busy,
  onCancel,
  onSubmit,
}: {
  buildings: Building[];
  busy: boolean;
  onCancel: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({ name: "", role: "SECURITY", phone: "", scope: "", pin: "" });

  const areas = Array.from(new Set(buildings.map((b) => b.area)));
  return (
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm space-y-2" style={{ border: "1px solid #E8EBF0" }}>
      <input
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
        placeholder="Full name"
        className="w-full rounded-lg border px-3 py-2 text-xs"
        style={{ borderColor: "#E8EBF0" }}
      />
      <div className="flex gap-2 flex-wrap">
        <select
          value={f.role}
          onChange={(e) => setF({ ...f, role: e.target.value })}
          className="flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0", minWidth: 120 }}
        >
          {["SECURITY", "SUPERVISOR", "CLEANER", "GARDENER", "POOL", "TECHNICIAN"].map((r) => (
            <option key={r} value={r}>
              {r === "POOL" ? "pool service" : r.toLowerCase()}
            </option>
          ))}
        </select>
        <select
          value={f.scope}
          onChange={(e) => setF({ ...f, scope: e.target.value })}
          className="flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0", minWidth: 160 }}
        >
          <option value="">All buildings</option>
          {areas.map((a) => (
            <option key={a} value={`a:${a}`}>
              {a === "BANANA_ISLAND" ? "Banana Island" : "Osborne Foreshore"} (all)
            </option>
          ))}
          {buildings.map((b) => (
            <option key={b.id} value={`b:${b.id}`}>
              {b.name} only
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
          placeholder="Phone"
          className="flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <input
          value={f.pin}
          onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          placeholder="PIN (4 digits)"
          inputMode="numeric"
          className="w-32 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
      </div>
      <p className="text-[10px] text-gray-400">
        A supervisor covering both Banana Island houses gets the area, not a building. The PIN sits
        in front of the generator log on a shared handset — leave it blank and the link alone gets
        them in.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSubmit({
              name: f.name,
              role: f.role,
              phone: f.phone || null,
              buildingId: f.scope.startsWith("b:") ? f.scope.slice(2) : null,
              area: f.scope.startsWith("a:") ? f.scope.slice(2) : null,
              pin: f.pin || null,
            })
          }
          disabled={busy || f.name.trim().length < 2}
          className="rounded-lg px-3 py-2 text-[11px] font-semibold text-white"
          style={{ background: "#0F2744", opacity: f.name.trim().length < 2 ? 0.4 : 1 }}
        >
          Add and issue a link
        </button>
        <button onClick={onCancel} className="rounded-lg px-3 py-2 text-[11px] font-semibold text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Money in, and the occasional correction.
 *
 * The sign is decided by the kind, not typed: a levy is a charge and a payment
 * is a credit whatever gets entered in the box, so a stray minus cannot invert
 * somebody's balance. An adjustment is the one place a negative is honoured,
 * and it is the only way to undo anything here — nothing is ever edited away.
 */
function RecordPayment({
  unitId,
  busy,
  onCancel,
  onSubmit,
}: {
  unitId: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({
    account: "DIESEL",
    kind: "DIESEL_TOPUP",
    amount: "",
    description: "",
    paymentMethod: "Transfer",
    paymentReference: "",
  });

  const KINDS: Record<string, Array<{ v: string; l: string }>> = {
    DIESEL: [
      { v: "DIESEL_TOPUP", l: "Deposit top-up" },
      { v: "REFUND", l: "Refund out" },
      { v: "ADJUSTMENT", l: "Correction" },
    ],
    SERVICE_CHARGE: [
      { v: "SERVICE_CHARGE_PAYMENT", l: "Payment received" },
      { v: "SERVICE_CHARGE_LEVY", l: "Charge raised" },
      { v: "ADJUSTMENT", l: "Correction" },
    ],
  };

  const amount = Number(f.amount);
  const ready = amount !== 0 && f.description.trim().length >= 3;

  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-3 space-y-2">
      <div className="flex gap-2">
        <select
          value={f.account}
          onChange={(e) =>
            setF({
              ...f,
              account: e.target.value,
              kind: KINDS[e.target.value][0].v,
            })
          }
          className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        >
          <option value="DIESEL">Diesel deposit</option>
          <option value="SERVICE_CHARGE">Service charge</option>
        </select>
        <select
          value={f.kind}
          onChange={(e) => setF({ ...f, kind: e.target.value })}
          className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        >
          {KINDS[f.account].map((k) => (
            <option key={k.v} value={k.v}>
              {k.l}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          value={f.amount}
          onChange={(e) =>
            setF({
              ...f,
              amount: e.target.value.replace(f.kind === "ADJUSTMENT" ? /[^\d.-]/g : /[^\d.]/g, ""),
            })
          }
          inputMode="decimal"
          placeholder="Amount ₦"
          className="flex-1 rounded-lg border px-2.5 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <input
          value={f.paymentMethod}
          onChange={(e) => setF({ ...f, paymentMethod: e.target.value })}
          placeholder="Method"
          className="w-28 rounded-lg border px-2.5 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <input
          value={f.paymentReference}
          onChange={(e) => setF({ ...f, paymentReference: e.target.value })}
          placeholder="Reference"
          className="w-32 rounded-lg border px-2.5 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
      </div>
      <input
        value={f.description}
        onChange={(e) => setF({ ...f, description: e.target.value })}
        placeholder={
          f.kind === "ADJUSTMENT"
            ? "What is this correcting, and why?"
            : "What is this for? Shown on the tenant's statement."
        }
        className="w-full rounded-lg border px-2.5 py-2 text-xs"
        style={{ borderColor: "#E8EBF0" }}
      />
      {f.kind === "ADJUSTMENT" && (
        <p className="text-[10px] text-gray-400">
          A correction is the only entry that may be negative, and it is the only way to undo
          anything. Nothing here is ever edited or deleted.
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSubmit({
              unitId,
              account: f.account,
              kind: f.kind,
              amount,
              description: f.description,
              paymentMethod: f.paymentMethod || null,
              paymentReference: f.paymentReference || null,
            })
          }
          disabled={busy || !ready}
          className="rounded-lg px-3 py-2 text-[11px] font-semibold text-white"
          style={{ background: "#0F2744", opacity: ready ? 1 : 0.4 }}
        >
          Post to the ledger
        </button>
        <button onClick={onCancel} className="rounded-lg px-3 py-2 text-[11px] font-semibold text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
