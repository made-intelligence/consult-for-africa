"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { categoriesFor, CATEGORY_LABELS, SLA } from "@/lib/estate/issues";
import { INK, MOSS, BRASS, SAND, LINE, MUTED, DANGER, card } from "@/lib/estate/theme";

/**
 * Reporting something, from a phone, probably in the dark.
 *
 * The form opens closed. A tenant landing here is usually checking a balance,
 * not filing a complaint, and a permanently expanded eight-field form pushes the
 * balance they came for below the fold.
 *
 * Photographs upload as they are chosen rather than on submit, so a slow
 * connection does not eat the description somebody has just typed out.
 */

type Priority = "EMERGENCY" | "HIGH" | "NORMAL" | "LOW";

const PRIORITIES: Array<{ value: Priority; label: string; hint: string }> = [
  { value: "EMERGENCY", label: "Emergency", hint: "Someone is unsafe, or the building is being damaged now" },
  { value: "HIGH", label: "Urgent", hint: "A service is out" },
  { value: "NORMAL", label: "Normal", hint: "Needs doing, nothing is at risk" },
  { value: "LOW", label: "Whenever", hint: "Cosmetic, or can wait" },
];

interface Photo {
  key: string;
  name: string;
  status: "uploading" | "done" | "failed";
}

export default function TenantActions({
  token,
  issuesOpen,
  hasPool,
}: {
  token: string;
  issuesOpen: number;
  hasPool: boolean;
}) {
  const categories = categoriesFor({ hasPool });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("POWER");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    for (const file of Array.from(files).slice(0, 6 - photos.length)) {
      const placeholder: Photo = { key: "", name: file.name, status: "uploading" };
      setPhotos((p) => [...p, placeholder]);

      try {
        const presign = await fetch("/api/estate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            audience: "tenant",
            scope: "issue",
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        });
        const data = await presign.json();
        if (!presign.ok) throw new Error(data.error ?? "Upload refused");

        const put = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": data.contentType },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");

        setPhotos((p) =>
          p.map((x) => (x === placeholder || (x.name === file.name && x.status === "uploading") ? { key: data.storageKey, name: file.name, status: "done" as const } : x)),
        );
      } catch (e) {
        setPhotos((p) =>
          p.map((x) => (x.name === file.name && x.status === "uploading" ? { ...x, status: "failed" as const } : x)),
        );
        setError(e instanceof Error ? e.message : "That photo would not upload.");
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit() {
    setError(null);
    if (title.trim().length < 3) return setError("Give it a short title.");
    if (description.trim().length < 3) return setError("Say a little about what is happening.");

    setBusy(true);
    try {
      const res = await fetch(`/api/estate/tenant/${token}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          priority,
          title: title.trim(),
          description: description.trim(),
          photoKeys: photos.filter((p) => p.status === "done").map((p) => p.key),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not send.");

      setDone(data.reference);
      setTitle("");
      setDescription("");
      setPhotos([]);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not send.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section style={{ ...card, borderLeft: `3px solid ${MOSS}`, marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: MOSS }}>Sent. Reference {done}.</p>
        <p style={{ margin: "4px 0 12px", fontSize: 13, color: MUTED }}>
          The estate office has it. You will see the status change below as it is picked up.
        </p>
        <button onClick={() => setDone(null)} style={ghostButton}>
          Report something else
        </button>
      </section>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...primaryButton, width: "100%", marginBottom: 12 }}>
        Report a problem
        {issuesOpen > 0 && (
          <span style={{ opacity: 0.7, fontWeight: 500 }}> · {issuesOpen} already sent</span>
        )}
      </button>
    );
  }

  return (
    <section style={{ ...card, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Report a problem</p>
        <button onClick={() => setOpen(false)} style={{ ...ghostButton, padding: "4px 10px" }}>
          Cancel
        </button>
      </div>

      <Label>What is it about?</Label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>

      <Label>How urgent?</Label>
      <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
        {PRIORITIES.map((p) => {
          const active = priority === p.value;
          return (
            <button
              key={p.value}
              onClick={() => setPriority(p.value)}
              style={{
                textAlign: "left",
                padding: "9px 12px",
                borderRadius: 10,
                cursor: "pointer",
                border: `1px solid ${active ? (p.value === "EMERGENCY" ? DANGER : MOSS) : LINE}`,
                background: active ? (p.value === "EMERGENCY" ? "#FFF6F6" : SAND) : "#fff",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: p.value === "EMERGENCY" ? DANGER : INK }}>
                {p.label}
              </span>
              <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1 }}>
                {p.hint}
                {active && ` · we aim to reply within ${SLA[p.value].respondHours}h`}
              </span>
            </button>
          );
        })}
      </div>

      <Label>Title</Label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={140}
        placeholder="No water in the kitchen"
        style={input}
      />

      <Label>What is happening?</Label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={4000}
        rows={4}
        placeholder="Since this morning. The bathroom tap is fine."
        style={{ ...input, resize: "vertical" }}
      />

      <Label>Photos</Label>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={(e) => addPhotos(e.target.files)}
        style={{ ...input, padding: 8 }}
      />
      {photos.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {photos.map((p, i) => (
            <p key={i} style={{ margin: "2px 0", fontSize: 12, color: p.status === "failed" ? DANGER : MUTED }}>
              {p.status === "uploading" ? "Sending" : p.status === "failed" ? "Failed" : "Attached"} · {p.name}
            </p>
          ))}
        </div>
      )}

      {error && <p style={{ margin: "0 0 10px", fontSize: 13, color: DANGER }}>{error}</p>}

      <button
        onClick={submit}
        disabled={busy || photos.some((p) => p.status === "uploading")}
        style={{ ...primaryButton, width: "100%", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "Sending" : "Send to the estate office"}
      </button>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 5px", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontWeight: 700 }}>
      {children}
    </p>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${LINE}`,
  // 16px exactly: iOS Safari zooms the whole page on focus at anything smaller,
  // and a form that jumps when you tap it is a form people abandon.
  fontSize: 16,
  marginBottom: 14,
  background: "#fff",
  color: INK,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const primaryButton: React.CSSProperties = {
  padding: "13px 18px",
  borderRadius: 10,
  border: "none",
  background: INK,
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostButton: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: `1px solid ${LINE}`,
  background: "#fff",
  color: BRASS,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
