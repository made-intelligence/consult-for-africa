"use client";

import { useEffect, useState } from "react";
import {
  BASED_LABELS,
  CONCERN_LABELS,
  FORMAT_LABELS,
  LYFE_BRAND as C,
  LYFE_CONSENT_TEXT,
  LYFE_CONSULT,
  LYFE_CONSULT_SCHEDULE,
  LYFE_DOORS,
  LYFE_EVENT,
  type ConsultSlot,
  NICOTINE_LABELS,
  PATHWAY_LABELS,
  SOURCE_LABELS,
  TIMING_LABELS,
  WEIGHT_TREND_LABELS,
  MEDLYFE_BRAND as MB,
  whatsappLink,
} from "@/lib/lyfe";

/**
 * Two doors, and the shorter one is on the left.
 *
 * Registering interest is three fields and a plus one, because saying yes to an evening
 * should cost nothing. The discovery call is stepped: HubSpot's analysis across
 * 40,000+ customers puts peak conversion at three form fields with the sharpest
 * drop at the fourth, and the documented answer for anything longer is a
 * multi-step form, which Instapage measured at +18% over 25,500 visits per
 * variation.
 *
 * The surgical screening block only ever appears when somebody has said they
 * are thinking about surgery, because asking a woman who wants a facial about
 * her weight would be both rude and pointless.
 */

type Intent = "EVENT_RSVP" | "CONSULTATION";
type Pathway = "AESTHETIC" | "SURGICAL" | "UNSURE";
type Concern = keyof typeof CONCERN_LABELS;
type Timing = keyof typeof TIMING_LABELS;
type Based = keyof typeof BASED_LABELS;
type Format = keyof typeof FORMAT_LABELS;
type Nicotine = keyof typeof NICOTINE_LABELS;
type WeightTrend = keyof typeof WEIGHT_TREND_LABELS;
type Source = keyof typeof SOURCE_LABELS;

const SOURCE_OPTIONS: Source[] = [
  "INSTAGRAM",
  "FRIEND_OR_FAMILY",
  "A_DOCTOR",
  "GOOGLE",
  "WHATSAPP_FORWARD",
  "AN_EVENT",
  "PRESS_OR_PODCAST",
  "FLYER_OR_QR",
  "TIKTOK",
  "OTHER",
];

export default function EnquiryForm({
  utm,
  initialIntent,
  slots,
}: {
  utm: { source: string | null; medium: string | null; campaign: string | null };
  initialIntent: Intent | null;
  slots: ConsultSlot[];
}) {
  const [intent, setIntent] = useState<Intent>(initialIntent ?? "EVENT_RSVP");
  const [step, setStep] = useState(initialIntent === "CONSULTATION" ? 1 : 2);
  const [slotAt, setSlotAt] = useState<string>("");
  const [pathway, setPathway] = useState<Pathway | "">("");
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [timing, setTiming] = useState<Timing | "">("");
  const [guestCount, setGuestCount] = useState(0);
  const [isClinician, setIsClinician] = useState<boolean | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [based, setBased] = useState<Based>("LAGOS");
  const [travelFrom, setTravelFrom] = useState("");
  const [format, setFormat] = useState<Format>("IN_PERSON");
  const [heightReported, setHeightReported] = useState("");
  const [weightReported, setWeightReported] = useState("");
  const [nicotine, setNicotine] = useState<Nicotine | "">("");
  const [weightTrend, setWeightTrend] = useState<WeightTrend | "">("");
  const [priorSurgery, setPriorSurgery] = useState<boolean | null>(null);
  const [goal, setGoal] = useState("");
  const [source, setSource] = useState<Source | "">("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Intent | null>(null);

  const surgical = pathway === "SURGICAL";
  const rsvp = intent === "EVENT_RSVP";

  // The hero buttons set ?go=rsvp or ?go=call and scroll here, so the form has
  // to pick the door up from the URL after mount as well as on first render.
  useEffect(() => {
    if (!initialIntent) return;
    setIntent(initialIntent);
    setStep(initialIntent === "CONSULTATION" ? 1 : 2);
  }, [initialIntent]);

  const toggleConcern = (c: Concern) =>
    setConcerns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Please tell us your name.");
    if (!phone.trim()) return setError("We need a number we can call or message.");
    if (!email.trim()) return setError("Please give us an email as well.");
    if (!rsvp && !timing) return setError("Please tell us roughly when you are thinking about this.");
    if (!rsvp && !slotAt) return setError("Please choose a time in Dr Kpaduwa's diary.");
    if (!source) return setError("Please tell us how you found us. It genuinely helps.");
    if (!consent) return setError("We need your agreement before we can hold your details.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/lyfe/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          intent,
          slotAt: rsvp ? null : slotAt,
          guestCount: rsvp ? guestCount : null,
          isClinician: rsvp ? isClinician : null,
          pathway: rsvp ? "UNSURE" : pathway || "UNSURE",
          concerns: rsvp ? [] : concerns,
          timing: rsvp ? null : timing,
          based,
          travelFrom: based === "LAGOS" ? null : travelFrom.trim() || null,
          format,
          heightReported: surgical ? heightReported.trim() || null : null,
          weightReported: surgical ? weightReported.trim() || null : null,
          nicotine: surgical ? nicotine || null : null,
          weightTrend: surgical ? weightTrend || null : null,
          priorSurgery: surgical ? priorSurgery : null,
          goal: goal.trim() || null,
          source,
          sourceDetail: sourceDetail.trim() || null,
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          consent: true,
          company,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      // A consultation is not booked until it is paid for, so the browser goes
      // straight to Paystack rather than showing a success card for something
      // that has not happened. Staying on this page to say "well done" and then
      // asking for money is how a checkout loses people.
      if (data.payUrl) {
        window.location.href = data.payUrl;
        return;
      }
      setDone(intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ─── Done ──────────────────────────────────────────────────────────────────
  if (done) {
    const firstName = fullName.trim().split(/\s+/)[0] || "there";
    return (
      <Card>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: C.greenTint }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={C.green} strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-semibold" style={{ color: C.ink }}>
          {done === "EVENT_RSVP" ? `Thank you, ${firstName}` : `Thank you, ${firstName}`}
        </h3>
        <p className="mt-3 leading-relaxed" style={{ color: C.body }}>
          {done === "EVENT_RSVP"
            ? `Your interest is registered. The room holds ${LYFE_EVENT.places} and invitations go out from this list, so you will hear from us either way before ${LYFE_EVENT.date}. Keep an eye on your email, including the junk folder.`
            : "A coordinator will call you shortly. If you would rather not wait for the phone to ring, message us and we will pick it up straight away."}
        </p>
        <a
          href={whatsappLink(
            `Hello, I am ${fullName.trim()}. I have just ${done === "EVENT_RSVP" ? "registered my interest in the evening" : "booked a consultation"} through your website.`,
          )}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          style={{ background: MB.greenDeep, color: "#FFFFFF" }}
        >
          Message us on WhatsApp
        </a>
      </Card>
    );
  }

  // ─── The form ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={submit} className="rounded-2xl p-7 sm:p-9" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="lyfe-company">Company</label>
        <input
          id="lyfe-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Kicker>{rsvp ? LYFE_DOORS.EVENT_RSVP.label : `Step ${step} of two`}</Kicker>
        {!rsvp && step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs font-semibold underline"
            style={{ color: C.muted }}
          >
            Back
          </button>
        ) : null}
      </div>

      {/* Consultation, step one: the time, then what it is about */}
      {!rsvp && step === 1 && (
        <>
          <Head>Choose your half hour</Head>
          <p className="mt-2.5 text-sm leading-relaxed" style={{ color: C.body }}>
            {LYFE_CONSULT_SCHEDULE}. These are the times still open.
          </p>

          {slots.length === 0 ? (
            <p
              className="mt-5 rounded-xl px-4 py-4 text-sm leading-relaxed"
              style={{ background: C.greenTint, color: C.ink }}
            >
              Her diary is full for the next three weeks. Message us on WhatsApp and we will
              tell you the moment the next one opens.
            </p>
          ) : (
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {slots.slice(0, 8).map((slot) => (
                <Choice
                  key={slot.iso}
                  checked={slotAt === slot.iso}
                  onSelect={() => setSlotAt(slot.iso)}
                  label={`${slot.day}, ${slot.time}`}
                />
              ))}
            </div>
          )}

          <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            {LYFE_CONSULT.feeDisplay} for {LYFE_CONSULT.minutes} minutes. {LYFE_CONSULT.redeemable}
          </p>

          <Legend className="mt-7">What are you thinking about?</Legend>
          <div className="grid gap-2.5">
            {(["AESTHETIC", "SURGICAL", "UNSURE"] as Pathway[]).map((pv) => (
              <Choice key={pv} checked={pathway === pv} onSelect={() => setPathway(pv)} label={PATHWAY_LABELS[pv]} />
            ))}
          </div>

          <Legend className="mt-7">What would you like to change?</Legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(CONCERN_LABELS) as Concern[]).map((c) => (
              <Choice key={c} multi checked={concerns.includes(c)} onSelect={() => toggleConcern(c)} label={CONCERN_LABELS[c]} />
            ))}
          </div>

          <Legend className="mt-7">When are you thinking about this?</Legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(TIMING_LABELS) as Timing[]).map((t) => (
              <Choice key={t} checked={timing === t} onSelect={() => setTiming(t)} label={TIMING_LABELS[t]} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!slotAt) return setError("Please choose a time in her diary.");
              if (!pathway) return setError("Please choose one, even roughly.");
              if (!timing) return setError("Please tell us roughly when you are thinking about this.");
              setError(null);
              setStep(2);
            }}
            className="mt-7 w-full rounded-xl py-4 text-sm font-semibold transition hover:opacity-90"
            style={{ background: C.ink, color: "#FFFFFF" }}
          >
            Continue
          </button>
          {error && <Err>{error}</Err>}
        </>
      )}

      {/* Both doors, final step: who you are */}
      {step === 2 && (
        <>
          <Head>{rsvp ? "Tell us who is coming" : "How do we reach you?"}</Head>
          <p className="mt-2.5 text-sm leading-relaxed" style={{ color: C.body }}>
            {rsvp
              ? `${LYFE_EVENT.date}. Arrival ${LYFE_EVENT.arrival}, programme ${LYFE_EVENT.programme}. Please reply by ${LYFE_EVENT.rsvpBy}.`
              : "A coordinator calls you, usually the same day. Give us the number you actually answer."}
          </p>

          <div className="mt-5 grid gap-4">
            <Field label="Your name" required>
              <Input value={fullName} onChange={setFullName} autoComplete="name" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone or WhatsApp" required>
                <Input value={phone} onChange={setPhone} type="tel" autoComplete="tel" placeholder="0803 000 0000" />
              </Field>
              <Field label="Email" required>
                <Input value={email} onChange={setEmail} type="email" autoComplete="email" />
              </Field>
            </div>
          </div>

          {rsvp && (
            <>
              <Legend className="mt-7">Are you bringing anybody?</Legend>
              <div className="grid gap-2.5 sm:grid-cols-4">
                {[0, 1, 2, 3].map((n) => (
                  <Choice
                    key={n}
                    checked={guestCount === n}
                    onSelect={() => setGuestCount(n)}
                    label={n === 0 ? "Just me" : n === 1 ? "One guest" : `${n} guests`}
                  />
                ))}
              </div>

              <Legend className="mt-7">Are you a doctor or another clinician?</Legend>
              <p className="mb-3 text-xs leading-relaxed" style={{ color: C.muted }}>
                Only so we seat you with the right people. There is a short session for clinicians.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Choice checked={isClinician === true} onSelect={() => setIsClinician(true)} label="Yes" />
                <Choice checked={isClinician === false} onSelect={() => setIsClinician(false)} label="No" />
              </div>
            </>
          )}

          {!rsvp && (
            <>
              <Legend className="mt-6">Where are you?</Legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {(Object.keys(BASED_LABELS) as Based[]).map((b) => (
                  <Choice key={b} checked={based === b} onSelect={() => setBased(b)} label={BASED_LABELS[b]} />
                ))}
              </div>
              {based !== "LAGOS" && (
                <div className="mt-4">
                  <Field label="Where would you be travelling from?">
                    <Input value={travelFrom} onChange={setTravelFrom} placeholder="Abuja, London, Houston" />
                  </Field>
                </div>
              )}

              <Legend className="mt-6">If it goes further, in person or virtual?</Legend>
              <p className="mb-3 text-xs leading-relaxed" style={{ color: C.muted }}>
                A virtual consultation is a real consultation. The published research finds no
                difference in outcome, and it is often the faster way to be seen.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
                  <Choice key={f} checked={format === f} onSelect={() => setFormat(f)} label={FORMAT_LABELS[f]} />
                ))}
              </div>
            </>
          )}

          {surgical && (
            <div className="mt-7 rounded-xl p-5" style={{ background: C.greenTint, border: `1px solid ${C.line}` }}>
              <p className="text-[11px] font-semibold uppercase" style={{ color: C.green, letterSpacing: "0.12em" }}>
                For the clinical team
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.body }}>
                Optional, and useful. Nicotine and a weight that is still moving both change the
                safety and the timing of surgery. We write down exactly what you tell us and a
                clinician reads it. Nothing here rules you out on its own.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Your height">
                  <Input value={heightReported} onChange={setHeightReported} placeholder="5 ft 6 in, or 168 cm" />
                </Field>
                <Field label="Your current weight">
                  <Input value={weightReported} onChange={setWeightReported} placeholder="75 kg, or 165 lb" />
                </Field>
              </div>

              <Legend className="mt-5">Do you smoke, vape or use nicotine?</Legend>
              <div className="grid gap-2.5">
                {(Object.keys(NICOTINE_LABELS) as Nicotine[]).map((n) => (
                  <Choice key={n} checked={nicotine === n} onSelect={() => setNicotine(n)} label={NICOTINE_LABELS[n]} />
                ))}
              </div>

              <Legend className="mt-5">Is your weight changing?</Legend>
              <div className="grid gap-2.5">
                {(Object.keys(WEIGHT_TREND_LABELS) as WeightTrend[]).map((w) => (
                  <Choice key={w} checked={weightTrend === w} onSelect={() => setWeightTrend(w)} label={WEIGHT_TREND_LABELS[w]} />
                ))}
              </div>

              <Legend className="mt-5">Have you had surgery in this area before?</Legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Choice checked={priorSurgery === true} onSelect={() => setPriorSurgery(true)} label="Yes" />
                <Choice checked={priorSurgery === false} onSelect={() => setPriorSurgery(false)} label="No" />
              </div>
            </div>
          )}

          <div className="mt-6">
            <Field
              label={rsvp ? "Anything we should know" : "In your own words, what are you hoping for?"}
              hint={rsvp ? "Access needs, dietary requirements, anything at all" : "Optional, and the most useful box on this form"}
            >
              <textarea
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                style={{ borderColor: C.line, color: C.ink }}
              />
            </Field>
          </div>

          <Legend className="mt-6">How did you find us?</Legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {SOURCE_OPTIONS.map((sv) => (
              <Choice key={sv} checked={source === sv} onSelect={() => setSource(sv)} label={SOURCE_LABELS[sv]} />
            ))}
          </div>
          {source && (
            <div className="mt-4">
              <Field label="Can you be more specific?" hint="A name, a post, a search, an event. It tells us where to be next time">
                <Input value={sourceDetail} onChange={setSourceDetail} />
              </Field>
            </div>
          )}

          <label className="mt-7 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded"
              style={{ accentColor: MB.greenDeep }}
            />
            <span className="text-sm leading-relaxed" style={{ color: C.body }}>
              {LYFE_CONSENT_TEXT}
            </span>
          </label>

          {error && <Err>{error}</Err>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl py-4 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: MB.greenDeep, color: "#FFFFFF" }}
          >
            {submitting
              ? "Sending..."
              : rsvp
                ? "Confirm my place"
                : `Pay ${LYFE_CONSULT.feeDisplay} and book it`}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: C.muted }}>
            We will never sell or share your details, and you can ask us to delete them at any time.
          </p>

          <div className="mt-6 border-t pt-5 text-center" style={{ borderColor: C.line }}>
            <button
              type="button"
              onClick={() => {
                setError(null);
                if (rsvp) {
                  setIntent("CONSULTATION");
                  setStep(1);
                } else {
                  setIntent("EVENT_RSVP");
                  setStep(2);
                }
              }}
              className="text-[13px] font-semibold underline underline-offset-4"
              style={{ color: MB.greenDeep }}
            >
              {rsvp
                ? `I would rather consult Dr Kpaduwa directly, ${LYFE_CONSULT.feeDisplay}`
                : "Actually, I would like to come to the evening"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

/* ─── small pieces ─────────────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-7 sm:p-9" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      {children}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase" style={{ color: MB.greenDeep, letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-3 text-2xl leading-tight"
      style={{ color: C.ink, fontFamily: "var(--lyfe-display), Georgia, serif" }}
    >
      {children}
    </h3>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border p-3 text-sm"
      style={{ borderColor: C.line, color: C.ink }}
    />
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase" style={{ color: C.inkSoft, letterSpacing: "0.1em" }}>
        {label} {required && <span style={{ color: MB.greenDeep }}>*</span>}
      </span>
      {hint && (
        <span className="mb-2 block text-xs" style={{ color: C.muted }}>
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

function Legend({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mb-3 block text-xs font-semibold uppercase ${className}`}
      style={{ color: C.inkSoft, letterSpacing: "0.1em" }}
    >
      {children}
    </p>
  );
}

function Choice({
  checked,
  onSelect,
  label,
  multi,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={checked}
      className="flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition"
      style={{
        borderColor: checked ? MB.green : C.line,
        background: checked ? "#EEF4F6" : "#FFFFFF",
      }}
    >
      <span
        className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center border"
        style={{
          borderRadius: multi ? 4 : 999,
          borderColor: checked ? MB.green : "#CBD5E1",
          background: checked ? MB.green : "#FFFFFF",
        }}
      >
        {checked && (
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span style={{ color: checked ? C.ink : C.body }}>{label}</span>
    </button>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-5 rounded-xl p-3.5 text-sm"
      style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" }}
    >
      {children}
    </div>
  );
}
