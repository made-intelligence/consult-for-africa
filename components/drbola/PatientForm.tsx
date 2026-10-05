"use client";

import { useState } from "react";
import { BASED, CONCERNS, CONSENT_TEXT, CONTACT_BY, FOR_WHOM, HEARD } from "@/lib/drbola";
import { Done, Field, Select, UploadField, inputCls, type Uploaded } from "./fields";

export default function PatientForm({ kind }: { kind: "consultation" | "secondOpinion" }) {
  const [files, setFiles] = useState<Uploaded[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const second = kind === "secondOpinion";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => (f.get(k) as string | null) || null;
    setState("sending");
    setError("");
    const res = await fetch("/api/drbola", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        fullName: v("fullName"),
        phone: v("phone"),
        email: v("email"),
        forWhom: v("forWhom"),
        based: v("based"),
        concern: v("concern"),
        message: v("message"),
        contactBy: v("contactBy"),
        heard: v("heard"),
        company: v("company"),
        files,
        consent: f.get("consent") === "on",
      }),
    }).catch(() => null);
    const j = await res?.json().catch(() => null);
    if (res?.ok) {
      setReference(j?.reference ?? null);
      setState("done");
      return;
    }
    setError(j?.error ?? "That did not send. Please try again, or message us on WhatsApp.");
    setState("idle");
  }

  if (state === "done")
    return (
      <Done title={second ? "Received. I'll take a look." : "Thank you. We'll be in touch."} reference={reference}>
        {second
          ? "I review every second opinion myself. You will hear back, with what I think and what I would do next."
          : "Someone from my team will contact you by your preferred route to arrange a time."}
      </Done>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input name="fullName" required autoComplete="name" className={inputCls} />
        </Field>
        <Field label="Phone or WhatsApp" hint="With country code if outside Nigeria">
          <input name="phone" required type="tel" autoComplete="tel" className={inputCls} />
        </Field>
        <Field label="Email">
          <input name="email" required type="email" autoComplete="email" className={inputCls} />
        </Field>
        <Field label="Who is this for?">
          <Select name="forWhom" options={FOR_WHOM} required />
        </Field>
        <Field label="Where are you based?">
          <Select name="based" options={BASED} required />
        </Field>
        <Field label="What is it about?">
          <Select name="concern" options={CONCERNS} required initial={second ? "A second opinion" : undefined} />
        </Field>
      </div>
      <Field label={second ? "What have you been told so far?" : "Anything you'd like us to know"}>
        <textarea name="message" rows={4} className={inputCls} />
      </Field>
      <Field label={second ? "X-rays and reports" : "X-rays or reports (optional)"}>
        <UploadField files={files} setFiles={setFiles} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Best way to reach you">
          <Select name="contactBy" options={CONTACT_BY} required />
        </Field>
        <Field label="How did you hear about me?">
          <Select name="heard" options={HEARD} />
        </Field>
      </div>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex gap-3 text-[13px] leading-snug text-(--db-body)">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-(--db-ink)" />
        {CONSENT_TEXT}
      </label>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
      <button
        disabled={state === "sending"}
        className="w-full rounded-full bg-(--db-ink) py-3.5 text-[15px] font-medium text-white hover:bg-(--db-ink-soft) disabled:opacity-50"
      >
        {state === "sending" ? "Sending" : second ? "Send for a free second opinion" : "Request a consultation"}
      </button>
    </form>
  );
}
