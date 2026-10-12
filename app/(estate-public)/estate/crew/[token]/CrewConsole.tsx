"use client";

import { useCallback, useEffect, useState } from "react";
import { INK, MOSS, BRASS, SAND, LINE, MUTED, DANGER, GOOD, card } from "@/lib/estate/theme";

/**
 * One screen, four jobs: the switch, the dip, the delivery, and the job list.
 *
 * Everything is sized for a thumb on a cheap handset. The generator button is
 * enormous and changes colour, because the single most expensive mistake
 * available here is thinking you stopped a run when you did not — the meter
 * keeps running on twelve people's bills until somebody notices.
 */

interface BuildingState {
  id: string;
  name: string;
  generatorLabel: string | null;
  litresPerHour: number;
  pricePerLitre: number;
  tankCapacityL: number | null;
  running: {
    id: string;
    startedAt: string;
    startedBy: string | null;
    startedByMe: boolean;
  } | null;
  lastDip: { litres: number; readAt: string } | null;
  service: { hoursRemaining: number; status: "OK" | "DUE_SOON" | "DUE" | "OVERDUE" };
}

interface IssueState {
  id: string;
  reference: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  statusLabel: string;
  building: string;
  unit: string | null;
  mine: boolean;
  createdAt: string;
}

interface State {
  locked: boolean;
  name: string;
  role?: string;
  scopeLabel?: string;
  buildings?: BuildingState[];
  recentRuns?: Array<{
    id: string;
    building: string;
    startedAt: string;
    endedAt: string | null;
    runMinutes: number | null;
    litresUsed: number | null;
    startedBy: string | null;
    endedBy: string | null;
  }>;
  issues?: IssueState[];
}

type Panel = "none" | "dip" | "delivery" | "manual" | "import";

export default function CrewConsole({ token }: { token: string }) {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<Panel>("none");
  const [panelBuilding, setPanelBuilding] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/estate/crew/${token}/state`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Could not load.");
      setState(data);
      setError(null);
    } catch {
      setError("No connection. Check your data and pull down to retry.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // A running clock, so the elapsed figure on an open run is live rather than
  // frozen at whenever the page happened to load.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  async function unlock() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That PIN is not right.");
      setPin("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That PIN is not right.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleGenerator(b: BuildingState) {
    const action = b.running ? "stop" : "start";
    if (action === "stop" && !confirm(`Stop the ${b.name} generator now?`)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, buildingId: b.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not go through.");
      setFlash(data.message);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !state) return <Shell><Notice tone="bad">{error}</Notice></Shell>;
  if (!state) return <Shell><p style={{ color: MUTED, fontSize: 14 }}>Loading…</p></Shell>;

  if (state.locked) {
    return (
      <Shell>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Hello {state.name.split(" ")[0]}</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 18px" }}>Enter your PIN to start your shift.</p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          type="password"
          placeholder="••••"
          style={{ ...input, fontSize: 28, textAlign: "center", letterSpacing: 8 }}
        />
        {error && <Notice tone="bad">{error}</Notice>}
        <button onClick={unlock} disabled={busy || pin.length < 4} style={{ ...bigButton, background: INK, opacity: pin.length < 4 ? 0.4 : 1 }}>
          {busy ? "Checking" : "Start shift"}
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <header style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: BRASS, margin: 0, fontWeight: 700 }}>
          {state.scopeLabel ?? "Estate team"}
        </p>
        <h1 style={{ fontSize: 24, margin: "4px 0 0" }}>{state.name}</h1>
        {state.role && (
          <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0", textTransform: "capitalize" }}>
            {state.role.toLowerCase()}
          </p>
        )}
      </header>

      {flash && <Notice tone="good" onDismiss={() => setFlash(null)}>{flash}</Notice>}
      {error && <Notice tone="bad" onDismiss={() => setError(null)}>{error}</Notice>}

      {state.buildings?.map((b) => {
        const running = b.running;
        const elapsed = running ? minutesSince(running.startedAt, now) : 0;
        const litres = (elapsed / 60) * b.litresPerHour;
        return (
          <section key={b.id} style={{ ...card, marginBottom: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{b.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>
                {b.generatorLabel ?? "Generator"} · {b.litresPerHour} L/hr
              </p>
            </div>

            <button
              onClick={() => toggleGenerator(b)}
              disabled={busy}
              style={{
                ...bigButton,
                marginTop: 12,
                background: running ? DANGER : MOSS,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {running ? "STOP the generator" : "START the generator"}
            </button>

            {running ? (
              <div style={{ marginTop: 12, background: "#FFF6F6", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DANGER }}>
                  Running for {formatDuration(elapsed)}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7A3A3A" }}>
                  About {litres.toFixed(1)} litres so far · started{" "}
                  {new Date(running.startedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  {running.startedBy && !running.startedByMe ? ` by ${running.startedBy}` : ""}
                </p>
                {running.startedBy && !running.startedByMe && (
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#7A3A3A", fontWeight: 700 }}>
                    Left running from the last shift. Stop it when the set goes off — the bill runs
                    until somebody does.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: MUTED }}>
                {b.lastDip
                  ? `Tank last dipped at ${b.lastDip.litres.toLocaleString()} L on ${new Date(b.lastDip.readAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}.`
                  : "No tank dip recorded yet."}
              </p>
            )}

            {b.service.status !== "OK" && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12,
                  fontWeight: 700,
                  color: b.service.status === "DUE_SOON" ? BRASS : DANGER,
                }}
              >
                {b.service.hoursRemaining > 0
                  ? `Service due in ${b.service.hoursRemaining} running hours.`
                  : `Service overdue by ${Math.abs(b.service.hoursRemaining)} running hours.`}
              </p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => {
                  setPanelBuilding(b.id);
                  setPanel(panel === "dip" && panelBuilding === b.id ? "none" : "dip");
                }}
                style={smallButton}
              >
                Dip the tank
              </button>
              <button
                onClick={() => {
                  setPanelBuilding(b.id);
                  setPanel(panel === "delivery" && panelBuilding === b.id ? "none" : "delivery");
                }}
                style={smallButton}
              >
                Log a delivery
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  setPanelBuilding(b.id);
                  setPanel(panel === "manual" && panelBuilding === b.id ? "none" : "manual");
                }}
                style={smallButton}
              >
                Write up a past run
              </button>
              {state.role === "SUPERVISOR" && (
                <button
                  onClick={() => {
                    setPanelBuilding(b.id);
                    setPanel(panel === "import" && panelBuilding === b.id ? "none" : "import");
                  }}
                  style={smallButton}
                >
                  Upload a log sheet
                </button>
              )}
            </div>

            {panelBuilding === b.id && panel === "dip" && (
              <DipForm
                token={token}
                building={b}
                onDone={(msg) => {
                  setFlash(msg);
                  setPanel("none");
                  load();
                }}
              />
            )}
            {panelBuilding === b.id && panel === "delivery" && (
              <DeliveryForm
                token={token}
                building={b}
                onDone={(msg) => {
                  setFlash(msg);
                  setPanel("none");
                  load();
                }}
              />
            )}
            {panelBuilding === b.id && panel === "manual" && (
              <ManualRunForm
                token={token}
                building={b}
                onDone={(msg) => {
                  setFlash(msg);
                  setPanel("none");
                  load();
                }}
              />
            )}
            {panelBuilding === b.id && panel === "import" && (
              <ImportForm
                token={token}
                building={b}
                onDone={(msg) => {
                  setFlash(msg);
                  setPanel("none");
                  load();
                }}
              />
            )}
          </section>
        );
      })}

      {!!state.issues?.length && (
        <section style={{ marginTop: 22 }}>
          <h2 style={sectionTitle}>Jobs ({state.issues.length})</h2>
          {state.issues.map((i) => (
            <JobRow key={i.id} token={token} issue={i} onDone={(m) => { setFlash(m); load(); }} />
          ))}
        </section>
      )}

      {!!state.recentRuns?.length && (
        <section style={{ marginTop: 22 }}>
          <h2 style={sectionTitle}>Recent runs</h2>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {state.recentRuns.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderTop: idx === 0 ? "none" : `1px solid ${LINE}`,
                  fontSize: 13,
                }}
              >
                <span>
                  {r.building} ·{" "}
                  {new Date(r.startedAt).toLocaleString("en-NG", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span style={{ color: MUTED, whiteSpace: "nowrap", textAlign: "right" }}>
                  {r.runMinutes ? formatDuration(r.runMinutes) : "—"}
                  {r.litresUsed !== null ? ` · ${r.litresUsed.toFixed(1)} L` : ""}
                  {r.startedBy && (
                    <span style={{ display: "block", fontSize: 10, opacity: 0.8 }}>
                      {r.startedBy === r.endedBy || !r.endedBy
                        ? r.startedBy
                        : `${r.startedBy} → ${r.endedBy}`}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}

// ─── Job row ─────────────────────────────────────────────────────────────────

function JobRow({
  token,
  issue,
  onDone,
}: {
  token: string;
  issue: IssueState;
  onDone: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErr(null);
    try {
      for (const file of Array.from(files).slice(0, 4)) {
        const presign = await fetch("/api/estate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            audience: "crew",
            scope: "issue",
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        });
        const data = await presign.json();
        if (!presign.ok) throw new Error(data.error);
        const put = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": data.contentType },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");
        setPhotos((p) => [...p, data.storageKey]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo would not upload.");
    } finally {
      setUploading(false);
    }
  }

  async function send(status: string) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, body: note.trim() || null, photoKeys: photos, claim: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not go through.");
      onDone(`${issue.reference} updated.`);
      setOpen(false);
      setNote("");
      setPhotos([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const urgent = issue.priority === "EMERGENCY" || issue.priority === "HIGH";

  return (
    <div style={{ ...card, marginBottom: 8, padding: 14, borderLeft: urgent ? `3px solid ${DANGER}` : undefined }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{issue.title}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
          {issue.building}
          {issue.unit ? ` ${issue.unit}` : ""} · {issue.reference} · {issue.statusLabel}
          {issue.mine ? " · yours" : ""}
        </p>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What did you find? What did you do?"
            style={{ ...input, resize: "vertical" }}
          />
          <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => upload(e.target.files)} style={{ ...input, padding: 8 }} />
          {photos.length > 0 && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: GOOD }}>
              {photos.length} photo{photos.length === 1 ? "" : "s"} attached
            </p>
          )}
          {uploading && <p style={{ margin: "0 0 10px", fontSize: 12, color: MUTED }}>Sending photo…</p>}
          {err && <p style={{ margin: "0 0 10px", fontSize: 13, color: DANGER }}>{err}</p>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => send("IN_PROGRESS")} disabled={busy} style={smallButton}>
              On it
            </button>
            <button onClick={() => send("AWAITING_PARTS")} disabled={busy} style={smallButton}>
              Waiting on a part
            </button>
            <button
              onClick={() => send("RESOLVED")}
              disabled={busy || uploading}
              style={{ ...smallButton, background: MOSS, color: "#fff", borderColor: MOSS }}
            >
              Fixed
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: MUTED }}>
            Marking a job fixed needs a photo of the finished work and a note. That photo is what the
            tenant sees.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Dip and delivery ────────────────────────────────────────────────────────

function DipForm({
  token,
  building,
  onDone,
}: {
  token: string;
  building: BuildingState;
  onDone: (msg: string) => void;
}) {
  const [litres, setLitres] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/dip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId: building.id, litres: Number(litres) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(`Tank level recorded for ${building.name}.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={panelBox}>
      <p style={panelTitle}>Dip the tank</p>
      <input
        value={litres}
        onChange={(e) => setLitres(e.target.value.replace(/[^\d.]/g, ""))}
        inputMode="decimal"
        placeholder="Litres in the tank"
        style={input}
      />
      {err && <p style={{ margin: "0 0 8px", fontSize: 13, color: DANGER }}>{err}</p>}
      <button onClick={submit} disabled={busy || !litres} style={{ ...bigButton, background: INK, opacity: litres ? 1 : 0.4 }}>
        {busy ? "Saving" : "Save reading"}
      </button>
    </div>
  );
}

function DeliveryForm({
  token,
  building,
  onDone,
}: {
  token: string;
  building: BuildingState;
  onDone: (msg: string) => void;
}) {
  const [f, setF] = useState({
    litres: "",
    pricePerLitre: String(building.pricePerLitre),
    supplier: "",
    waybillRef: "",
    tankBeforeL: "",
    tankAfterL: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: building.id,
          litres: Number(f.litres),
          pricePerLitre: Number(f.pricePerLitre),
          supplier: f.supplier || null,
          waybillRef: f.waybillRef || null,
          tankBeforeL: f.tankBeforeL ? Number(f.tankBeforeL) : null,
          tankAfterL: f.tankAfterL ? Number(f.tankAfterL) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const c = data.check;
      const msg =
        c?.verdict === "INVESTIGATE"
          ? `Delivery saved — but the tank only rose ${c.dipRiseLitres} L against ${c.waybillLitres} L on the waybill. Tell the office before the truck leaves.`
          : `Delivery saved for ${building.name}.`;
      onDone(msg);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={panelBox}>
      <p style={panelTitle}>Log a delivery</p>
      <input value={f.tankBeforeL} onChange={set("tankBeforeL")} inputMode="decimal" placeholder="Tank level BEFORE (litres)" style={input} />
      <input value={f.litres} onChange={set("litres")} inputMode="decimal" placeholder="Litres on the waybill" style={input} />
      <input value={f.tankAfterL} onChange={set("tankAfterL")} inputMode="decimal" placeholder="Tank level AFTER (litres)" style={input} />
      <input value={f.pricePerLitre} onChange={set("pricePerLitre")} inputMode="decimal" placeholder="Price per litre" style={input} />
      <input value={f.supplier} onChange={set("supplier")} placeholder="Supplier" style={input} />
      <input value={f.waybillRef} onChange={set("waybillRef")} placeholder="Waybill number" style={input} />
      <p style={{ margin: "0 0 10px", fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
        Dip the tank before and after the truck. It is the only way to prove the litres on the waybill
        actually went in.
      </p>
      {err && <p style={{ margin: "0 0 8px", fontSize: 13, color: DANGER }}>{err}</p>}
      <button
        onClick={submit}
        disabled={busy || !f.litres || !f.pricePerLitre}
        style={{ ...bigButton, background: INK, opacity: f.litres && f.pricePerLitre ? 1 : 0.4 }}
      >
        {busy ? "Saving" : "Save delivery"}
      </button>
    </div>
  );
}

// ─── Chrome ──────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: SAND, minHeight: "100dvh", color: INK }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 72px" }}>{children}</div>
    </main>
  );
}

function Notice({
  tone,
  children,
  onDismiss,
}: {
  tone: "good" | "bad";
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div
      style={{
        background: tone === "good" ? "#F1F7F3" : "#FFF6F6",
        border: `1px solid ${tone === "good" ? "#CFE3D6" : "#F0D5D5"}`,
        color: tone === "good" ? GOOD : DANGER,
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 13,
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <span>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ all: "unset", cursor: "pointer", fontWeight: 700 }}>
          ×
        </button>
      )}
    </div>
  );
}

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: MUTED,
  fontWeight: 700,
  margin: "0 2px 8px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${LINE}`,
  fontSize: 16,
  marginBottom: 10,
  background: "#fff",
  color: INK,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const bigButton: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: 0.3,
  cursor: "pointer",
};

const smallButton: React.CSSProperties = {
  flex: 1,
  padding: "11px 12px",
  borderRadius: 10,
  border: `1px solid ${LINE}`,
  background: "#fff",
  color: INK,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const panelBox: React.CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 12,
  background: SAND,
  border: `1px solid ${LINE}`,
};

const panelTitle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: MUTED,
};

// ─── Writing up runs after the fact ──────────────────────────────────────────

/**
 * One run, from the gatehouse book.
 *
 * Date plus two times rather than two full datetimes, because that is the shape
 * of what is written in the book and asking somebody to retype the date twice is
 * how the second one ends up wrong. A finish earlier than the start is read as
 * running through the night, which here is the normal case, not the exception.
 */
function ManualRunForm({
  token,
  building,
  onDone,
}: {
  token: string;
  building: BuildingState;
  onDone: (msg: string) => void;
}) {
  const [f, setF] = useState({ date: todayISO(), on: "", off: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const preview = previewRun(f.date, f.on, f.off, building.litresPerHour, building.pricePerLitre);

  async function submit() {
    if (!preview) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/estate/crew/${token}/runs/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: building.id,
          startedAt: preview.start.toISOString(),
          endedAt: preview.end.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data.message);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={panelBox}>
      <p style={panelTitle}>Write up a past run</p>
      <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} style={input} />
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="time"
          value={f.on}
          onChange={(e) => setF({ ...f, on: e.target.value })}
          style={{ ...input, flex: 1 }}
        />
        <input
          type="time"
          value={f.off}
          onChange={(e) => setF({ ...f, off: e.target.value })}
          style={{ ...input, flex: 1 }}
        />
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 11, color: MUTED }}>
        On, then off. If the set ran through the night, put the time it went off in the morning and
        it will carry to the next day.
      </p>
      {preview && (
        <p style={{ margin: "0 0 10px", fontSize: 12, color: INK, fontWeight: 700 }}>
          {formatDuration(preview.minutes)} · about {preview.litres.toFixed(1)} litres · ₦
          {Math.round(preview.cost).toLocaleString()}
          {preview.overnight ? " · runs past midnight" : ""}
        </p>
      )}
      {err && <p style={{ margin: "0 0 8px", fontSize: 13, color: DANGER }}>{err}</p>}
      <button
        onClick={submit}
        disabled={busy || !preview}
        style={{ ...bigButton, background: INK, opacity: preview ? 1 : 0.4 }}
      >
        {busy ? "Saving" : "Log this run"}
      </button>
    </div>
  );
}

interface Preview {
  columns: { date: string | null; on: string | null; off: string | null; building: string | null };
  building: string;
  readable: number;
  errors: Array<{ row: number; reason: string }>;
  clashes: Array<{ row: number; reason: string }>;
  totalHours: number;
  estimatedLitres: number;
  estimatedCost: number;
}

/**
 * A whole sheet at once, for supervisors.
 *
 * Two steps always. The upload reads the file and says what it found; nothing is
 * written until the same file is sent again with confirm. That is not politeness
 * — this is the one action on the estate that can raise dozens of charges across
 * twelve accounts in a single tap, and the preview is what stands between a
 * mislabelled column and a month of wrong bills.
 */
function ImportForm({
  token,
  building,
  onDone,
}: {
  token: string;
  building: BuildingState;
  onDone: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(confirm: boolean) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("buildingId", building.id);
      body.set("confirm", String(confirm));

      const res = await fetch(`/api/estate/crew/${token}/runs/import`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? data.errors?.[0]?.reason ?? "That file could not be read.");
      }
      if (confirm) {
        onDone(
          `${data.wrote} run${data.wrote === 1 ? "" : "s"} logged from the sheet and charged to the flats.`,
        );
      } else {
        setPreview(data.preview);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={panelBox}>
      <p style={panelTitle}>Upload a log sheet</p>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setPreview(null);
        }}
        style={{ ...input, padding: 8 }}
      />
      <p style={{ margin: "0 0 10px", fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
        A column for the date, one for on and one for off. Whatever they are called, it will find
        them. Nothing is saved until you have seen what it read.
      </p>

      {preview && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${LINE}`,
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
            {preview.readable} run{preview.readable === 1 ? "" : "s"} · {preview.totalHours} hours
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
            About {preview.estimatedLitres} litres, ₦{Math.round(preview.estimatedCost).toLocaleString()}{" "}
            across the flats at {preview.building}.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>
            Read {preview.columns.date ?? "no date column"} / {preview.columns.on} /{" "}
            {preview.columns.off}.
          </p>

          {preview.clashes.length > 0 && (
            <p style={{ margin: "8px 0 0", fontSize: 11, color: BRASS }}>
              {preview.clashes.length} row{preview.clashes.length === 1 ? "" : "s"} already logged and
              will be skipped, so nothing is billed twice.
            </p>
          )}
          {preview.errors.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {preview.errors.slice(0, 6).map((e, i) => (
                <p key={i} style={{ margin: "2px 0", fontSize: 11, color: DANGER }}>
                  Row {e.row}: {e.reason}
                </p>
              ))}
              {preview.errors.length > 6 && (
                <p style={{ margin: "2px 0", fontSize: 11, color: DANGER }}>
                  and {preview.errors.length - 6} more.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {err && <p style={{ margin: "0 0 8px", fontSize: 13, color: DANGER }}>{err}</p>}

      <button
        onClick={() => send(!!preview)}
        disabled={busy || !file || (!!preview && preview.readable === 0)}
        style={{
          ...bigButton,
          background: preview ? MOSS : INK,
          opacity: file && !(preview && preview.readable === 0) ? 1 : 0.4,
        }}
      >
        {busy
          ? "Working"
          : preview
            ? `Log these ${preview.readable} runs`
            : "Read the sheet"}
      </button>
    </div>
  );
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** What the office will charge, shown before anybody commits to it. */
function previewRun(
  date: string,
  on: string,
  off: string,
  litresPerHour: number,
  pricePerLitre: number,
): { start: Date; end: Date; minutes: number; litres: number; cost: number; overnight: boolean } | null {
  if (!date || !on || !off) return null;
  const start = new Date(`${date}T${on}`);
  let end = new Date(`${date}T${off}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  let overnight = false;
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    overnight = true;
  }
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutes <= 0 || minutes > 24 * 60) return null;

  const litres = (minutes / 60) * litresPerHour;
  return { start, end, minutes, litres, cost: litres * pricePerLitre, overnight };
}
