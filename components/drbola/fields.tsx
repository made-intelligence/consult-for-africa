"use client";

import { useState } from "react";

export const inputCls =
  "w-full rounded-xl border border-(--db-line) bg-white px-3.5 py-3 text-[15px] text-(--db-ink) outline-none transition focus:border-(--db-gold) focus:ring-2 focus:ring-(--db-gold)/15";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13.5px] font-medium text-(--db-ink)">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-(--db-muted)">{hint}</span>}
    </label>
  );
}

export function Select({
  name,
  options,
  required,
  placeholder = "Choose",
  initial,
}: {
  name: string;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  initial?: string;
}) {
  return (
    <select name={name} required={required} defaultValue={initial ?? ""} className={inputCls}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export type Uploaded = { storageKey: string; filename: string; contentType: string; fileSize: number };

/**
 * Direct-to-storage upload, one file at a time so a slow connection shows
 * progress per file and one failure does not lose the rest.
 */
export function UploadField({ files, setFiles }: { files: Uploaded[]; setFiles: (f: Uploaded[]) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function add(list: FileList | null) {
    if (!list) return;
    setError("");
    let next = [...files];
    for (const f of Array.from(list).slice(0, 10 - files.length)) {
      setBusy(f.name);
      try {
        const res = await fetch("/api/drbola/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: f.name, contentType: f.type, fileSize: f.size }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Upload failed");
        const put = await fetch(j.uploadUrl, { method: "PUT", headers: { "Content-Type": j.contentType }, body: f });
        if (!put.ok) throw new Error("Upload failed. Please try again.");
        next = [...next, { storageKey: j.storageKey, filename: f.name, contentType: j.contentType, fileSize: f.size }];
        setFiles(next);
      } catch (e) {
        setError(`${f.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }
    setBusy(null);
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-(--db-gold)/50 bg-(--db-gold-tint)/40 px-4 py-6 text-center transition hover:bg-(--db-gold-tint)">
        <span className="text-[15px] font-medium text-(--db-ink)">
          {busy ? `Uploading ${busy}` : "Add X-rays, scans or reports"}
        </span>
        <span className="mt-1 text-xs text-(--db-muted)">
          Photos of films are fine. Images, PDF, DICOM or zip, up to 25MB each, 10 files.
        </span>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.dcm,.zip"
          className="sr-only"
          disabled={!!busy || files.length >= 10}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.storageKey} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
              <span className="truncate text-(--db-ink)">{f.filename}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((x) => x.storageKey !== f.storageKey))}
                className="ml-3 text-xs text-(--db-muted) hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
    </div>
  );
}

export function Done({ title, reference, children }: { title: string; reference: string | null; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-(--db-line) bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--db-gold-tint) text-(--db-gold-deep)">
        ✓
      </div>
      <div className="mt-4 text-2xl font-medium text-(--db-ink)" style={{ fontFamily: "var(--db-display), Georgia, serif" }}>
        {title}
      </div>
      {reference && (
        <div className="mt-3 text-sm text-(--db-muted)">
          Your reference <span className="ml-1 rounded-md bg-(--db-bone) px-2 py-1 font-mono text-(--db-ink)">{reference}</span>
        </div>
      )}
      <div className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-(--db-body)">{children}</div>
    </div>
  );
}
