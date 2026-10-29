"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { MEDLYFE_BRAND as MB } from "@/lib/lyfe";

type Guest = {
  id: string;
  name: string;
  code: string;
  admits: number;
  guestOf: string | null;
  clinician: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
};
type Stats = { expected: number; arrived: number; passes: number; passesIn: number };
type Result =
  | { kind: "guest"; guest: Guest; justAdmitted?: boolean; already?: boolean }
  | { kind: "missing"; reason: string };

const PIN_KEY = "ageless-door-pin";

async function call<T>(body: object): Promise<T> {
  const res = await fetch("/api/lyfe/door", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || "That did not go through."), { status: res.status });
  return data as T;
}

export default function DoorApp() {
  const [pin, setPin] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Guest[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<{ text: string; at: number } | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PIN_KEY);
      if (saved) setPin(saved);
    } catch {}
  }, []);

  const refresh = useCallback(async (p: string) => {
    const r = await call<{ stats: Stats }>({ action: "stats", pin: p });
    setStats(r.stats);
  }, []);

  useEffect(() => {
    if (!pin) return;
    refresh(pin).catch((e) => {
      if (e.status === 401) {
        setPin(null);
        try { sessionStorage.removeItem(PIN_KEY); } catch {}
      }
    });
    const t = setInterval(() => refresh(pin).catch(() => {}), 20000);
    return () => clearInterval(t);
  }, [pin, refresh]);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    try {
      await call({ action: "stats", pin: pinDraft });
      setPin(pinDraft);
      try { sessionStorage.setItem(PIN_KEY, pinDraft); } catch {}
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "Wrong door PIN.");
    }
  }

  const lookup = useCallback(
    async (raw: string) => {
      if (!pin) return;
      setBusy(true);
      setError(null);
      setHits(null);
      try {
        const r = await call<{ found: boolean; guest?: Guest; reason?: string; stats?: Stats }>({ action: "lookup", pin, code: raw });
        if (r.stats) setStats(r.stats);
        setResult(r.found && r.guest ? { kind: "guest", guest: r.guest } : { kind: "missing", reason: r.reason ?? "Not on the list." });
      } catch (err) {
        setError(err instanceof Error ? err.message : "That did not go through.");
      } finally {
        setBusy(false);
      }
    },
    [pin],
  );

  async function admit(g: Guest) {
    if (!pin) return;
    setBusy(true);
    setError(null);
    try {
      const r = await call<{ guest: Guest; already?: boolean; stats: Stats }>({ action: "admit", pin, id: g.id });
      setStats(r.stats);
      setResult({ kind: "guest", guest: r.guest, justAdmitted: !r.already, already: r.already });
      setHits(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function undo(g: Guest) {
    if (!pin) return;
    setBusy(true);
    try {
      const r = await call<{ guest: Guest; stats: Stats }>({ action: "undo", pin, id: g.id });
      setStats(r.stats);
      setResult({ kind: "guest", guest: r.guest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!pin || q.trim().length < 2) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await call<{ guests: Guest[] }>({ action: "search", pin, q });
      setHits(r.guests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const tick = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !streamRef.current) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      const w = 480;
      const h = Math.round((v.videoHeight / v.videoWidth) * w) || 360;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(v, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const qr = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
        const now = Date.now();
        if (qr?.data && !(lastRef.current && lastRef.current.text === qr.data && now - lastRef.current.at < 4000)) {
          lastRef.current = { text: qr.data, at: now };
          if (navigator.vibrate) navigator.vibrate(80);
          lookup(qr.data);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [lookup]);

  async function startCamera() {
    setCamError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setScanning(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        rafRef.current = requestAnimationFrame(tick);
      });
    } catch {
      setCamError("The camera could not start. Allow camera access, or type the pass code below.");
    }
  }

  useEffect(() => stopCamera, [stopCamera]);

  const panel = { background: MB.greenDark, border: "1px solid rgba(216,227,214,0.18)" };
  const btn = "px-5 py-3 text-[15px] font-semibold disabled:opacity-60";

  if (!pin) {
    return (
      <main style={{ background: MB.greenDeep, minHeight: "100vh" }}>
        <form onSubmit={unlock} className="mx-auto w-full max-w-sm px-4 py-20">
          <p className="text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.2em" }}>AGELESS · Door</p>
          <h1 className="mt-4 text-[28px]" style={{ color: MB.white, fontWeight: 600 }}>Usher check-in</h1>
          <label className="mt-8 block text-[13px]" style={{ color: MB.mist }}>
            Door PIN
            <input
              inputMode="numeric"
              autoComplete="off"
              value={pinDraft}
              onChange={(e) => setPinDraft(e.target.value)}
              className="mt-2 w-full px-4 py-3 text-[20px] tracking-[0.3em] outline-none"
              style={{ background: "transparent", color: MB.white, border: "1px solid rgba(216,227,214,0.35)" }}
            />
          </label>
          <button type="submit" className={`${btn} mt-5 w-full`} style={{ background: MB.lime, color: MB.greenDeep }}>Open the door list</button>
          {pinError && <p className="mt-4 text-[14px]" style={{ color: "#FCA5A5" }}>{pinError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main style={{ background: MB.greenDeep, minHeight: "100vh" }}>
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.2em" }}>AGELESS · Door</p>
          {stats && (
            <p className="text-[14px]" style={{ color: MB.white }}>
              <strong>{stats.arrived}</strong> <span style={{ color: MB.mist }}>of {stats.expected} in</span>
            </p>
          )}
        </div>

        {/* Scanner */}
        <div className="mt-4 overflow-hidden" style={panel}>
          {scanning ? (
            <div className="relative">
              <video ref={videoRef} playsInline muted className="block w-full" />
              <div className="pointer-events-none absolute inset-[18%] border-2" style={{ borderColor: MB.lime }} />
              <button type="button" onClick={stopCamera} className="absolute right-2 top-2 px-3 py-1.5 text-[13px]" style={{ background: "rgba(0,0,0,0.55)", color: MB.white }}>
                Stop camera
              </button>
            </div>
          ) : (
            <button type="button" onClick={startCamera} className={`${btn} w-full py-6 text-[17px]`} style={{ background: MB.lime, color: MB.greenDeep }}>
              Scan a pass
            </button>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        {camError && <p className="mt-2 text-[14px]" style={{ color: "#FCA5A5" }}>{camError}</p>}

        {/* Result */}
        {busy && <p className="mt-4 text-[14px]" style={{ color: MB.mist }}>Checking…</p>}
        {error && <p className="mt-4 text-[14px]" style={{ color: "#FCA5A5" }}>{error}</p>}
        {result?.kind === "missing" && (
          <div className="mt-4 p-5" style={{ background: "#7F1D1D", color: MB.white }}>
            <p className="text-[18px] font-semibold">Not found</p>
            <p className="mt-1 text-[15px]">{result.reason}</p>
            <p className="mt-2 text-[13px]" style={{ color: "#FECACA" }}>Try searching by name below, or send the guest to the host desk.</p>
          </div>
        )}
        {result?.kind === "guest" && (
          <GuestCard
            g={result.guest}
            justAdmitted={result.justAdmitted}
            already={result.already}
            busy={busy}
            onAdmit={() => admit(result.guest)}
            onUndo={() => undo(result.guest)}
          />
        )}

        {/* Typed code */}
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) lookup(code);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Pass code, e.g. AGL-7K3P"
            autoCapitalize="characters"
            autoComplete="off"
            className="min-w-0 flex-1 px-3.5 py-3 text-[16px] outline-none"
            style={{ background: "transparent", color: MB.white, border: "1px solid rgba(216,227,214,0.35)" }}
          />
          <button type="submit" className={btn} style={{ background: MB.white, color: MB.greenDeep }}>Check</button>
        </form>

        {/* Name search */}
        <form className="mt-3 flex gap-2" onSubmit={search}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Or search by name"
            autoComplete="off"
            className="min-w-0 flex-1 px-3.5 py-3 text-[16px] outline-none"
            style={{ background: "transparent", color: MB.white, border: "1px solid rgba(216,227,214,0.35)" }}
          />
          <button type="submit" className={btn} style={{ background: "transparent", color: MB.white, border: "1px solid rgba(216,227,214,0.35)" }}>Search</button>
        </form>
        {hits && (
          <ul className="mt-3 space-y-2">
            {hits.length === 0 && <li className="text-[14px]" style={{ color: MB.mist }}>Nobody on the list by that name.</li>}
            {hits.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => { setResult({ kind: "guest", guest: g }); setHits(null); }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  style={panel}
                >
                  <span style={{ color: MB.white }}>
                    {g.name}
                    <span className="block text-[12px]" style={{ color: MB.mist }}>{g.code} · admits {g.admits}{g.guestOf ? ` · guest of ${g.guestOf}` : ""}</span>
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: g.checkedIn ? "#FCD34D" : MB.lime }}>{g.checkedIn ? "IN" : "Expected"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-[12px]" style={{ color: "#9FB4A6" }}>
          {stats ? `${stats.passesIn} of ${stats.passes} passes scanned. ` : ""}A pass that admits more than one covers guests the host has not named.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => { try { sessionStorage.removeItem(PIN_KEY); } catch {} setPin(null); setPinDraft(""); }}
          >
            Lock
          </button>
        </p>
      </div>
    </main>
  );
}

function GuestCard({
  g, justAdmitted, already, busy, onAdmit, onUndo,
}: {
  g: Guest; justAdmitted?: boolean; already?: boolean; busy: boolean; onAdmit: () => void; onUndo: () => void;
}) {
  const inRoom = g.checkedIn;
  const bg = justAdmitted ? "#14532D" : inRoom ? "#78350F" : MB.greenDark;
  return (
    <div className="mt-4 p-5" style={{ background: bg, color: MB.white, border: "1px solid rgba(216,227,214,0.25)" }}>
      <p className="text-[12px] font-semibold uppercase" style={{ letterSpacing: "0.15em", color: justAdmitted ? "#BBF7D0" : inRoom ? "#FDE68A" : MB.lime }}>
        {justAdmitted ? "Checked in. Welcome" : inRoom ? `Already checked in${g.checkedInAt ? ` at ${g.checkedInAt}` : ""}` : "On the list"}
      </p>
      <p className="mt-2 text-[24px] font-semibold leading-tight">{g.name}</p>
      <p className="mt-1 text-[15px]" style={{ color: MB.mist }}>
        {g.code} · admits <strong style={{ color: MB.white }}>{g.admits}</strong>
        {g.guestOf ? ` · guest of ${g.guestOf}` : ""}
        {g.clinician ? " · clinician" : ""}
      </p>
      {already && <p className="mt-2 text-[14px]" style={{ color: "#FDE68A" }}>This pass has already been used. Check with the host desk before admitting.</p>}
      <div className="mt-4 flex gap-2">
        {!inRoom && (
          <button type="button" disabled={busy} onClick={onAdmit} className="flex-1 px-5 py-3.5 text-[16px] font-semibold disabled:opacity-60" style={{ background: MB.lime, color: MB.greenDeep }}>
            Check in{g.admits > 1 ? ` (${g.admits})` : ""}
          </button>
        )}
        {inRoom && (
          <button type="button" disabled={busy} onClick={onUndo} className="px-4 py-2.5 text-[13px] disabled:opacity-60" style={{ background: "transparent", color: MB.white, border: "1px solid rgba(255,255,255,0.4)" }}>
            Undo check-in
          </button>
        )}
      </div>
    </div>
  );
}
