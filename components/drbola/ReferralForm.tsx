"use client";

import Link from "next/link";
import { useState } from "react";
import { REFERRAL_CONSENT_TEXT, URGENCY, href } from "@/lib/drbola";
import { Done, Field, Select, UploadField, inputCls, type Uploaded } from "./fields";

export default function ReferralForm() {
  const [files, setFiles] = useState<Uploaded[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

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
        kind: "referral",
        fullName: v("fullName"),
        specialty: v("specialty"),
        hospital: v("hospital"),
        mdcn: v("mdcn"),
        phone: v("phone"),
        email: v("email"),
        patientRef: v("patientRef"),
        patientAge: v("patientAge"),
        patientSex: v("patientSex"),
        urgency: v("urgency"),
        diagnosis: v("diagnosis"),
        summary: v("summary"),
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
    setError(j?.error ?? "That did not send. Please try again, or WhatsApp the case.");
    setState("idle");
  }

  if (state === "done")
    return (
      <Done title="Referral received." reference={reference}>
        I review every referral personally and respond within two working days. Keep the reference to{" "}
        <Link href={href("/refer/track")} className="font-medium text-(--db-ink) underline">
          track it
        </Link>{" "}
        with your email.
      </Done>
    );

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">You</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name">
            <input name="fullName" required className={inputCls} />
          </Field>
          <Field label="Specialty">
            <input name="specialty" required className={inputCls} />
          </Field>
          <Field label="Hospital or clinic">
            <input name="hospital" required className={inputCls} />
          </Field>
          <Field label="MDCN number" hint="Optional">
            <input name="mdcn" className={inputCls} />
          </Field>
          <Field label="Phone or WhatsApp">
            <input name="phone" required type="tel" className={inputCls} />
          </Field>
          <Field label="Email" hint="Used to track the referral">
            <input name="email" required type="email" className={inputCls} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">The patient</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Initials or hospital number" hint="Not the full name">
            <input name="patientRef" required className={inputCls} />
          </Field>
          <Field label="Age">
            <input name="patientAge" inputMode="numeric" className={inputCls} />
          </Field>
          <Field label="Sex">
            <Select name="patientSex" options={["Female", "Male", "Prefer not to say"]} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <Field label="Working diagnosis">
            <input name="diagnosis" required className={inputCls} />
          </Field>
          <Field label="Urgency">
            <Select name="urgency" options={URGENCY} required initial="Routine" />
          </Field>
        </div>
        <Field label="Clinical summary">
          <textarea name="summary" rows={5} className={inputCls} />
        </Field>
        <Field label="Imaging">
          <UploadField files={files} setFiles={setFiles} />
        </Field>
      </fieldset>

      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex gap-3 text-[13px] leading-snug text-(--db-body)">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-(--db-ink)" />
        {REFERRAL_CONSENT_TEXT}
      </label>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
      <button
        disabled={state === "sending"}
        className="w-full rounded-full bg-(--db-ink) py-3.5 text-[15px] font-medium text-white hover:bg-(--db-ink-soft) disabled:opacity-50"
      >
        {state === "sending" ? "Sending" : "Send referral"}
      </button>
    </form>
  );
}
