"use client";

import { useState } from "react";

export default function CvUploadForm({ action }: { action: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("loading");
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(action, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl px-4 py-3 text-sm text-emerald-800" style={{ background: "rgba(16,185,129,0.08)" }}>
        Thank you. Your CV is with the hiring team.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        required
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0B3C5D]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#0B3C5D]"
      />
      <p className="text-xs text-gray-400">PDF or Word, up to 10MB.</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!file || status === "loading"}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #0B3C5D, #0E4D6E)" }}
      >
        {status === "loading" ? "Uploading..." : "Upload CV"}
      </button>
    </form>
  );
}
