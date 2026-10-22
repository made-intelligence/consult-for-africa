"use client";

import { useState } from "react";
import {
  AGELESS_CARE_AREAS,
  AGELESS_CONSENT_TEXT,
  AGELESS_CONTACT_PREF,
  AGELESS_MOMENTS,
  AGELESS_NEXT_TOPICS,
  AGELESS_SPEAKERS,
  LYFEPLACE_INTERESTS,
  agelessBookLink,
} from "@/lib/ageless-followup";
import { MEDLYFE_BRAND as MB } from "@/lib/lyfe";

/**
 * Both guest forms after AGELESS: the feedback, and The Lyfe Place waiting
 * list. One component so they share the look, the consent and the way a
 * request to book is asked for.
 *
 * Short on purpose. Every question is optional except the overall rating,
 * because a form a guest abandons halfway tells us nothing, and the one
 * number that matters most is the first thing asked.
 */

type Kind = "ageless-feedback" | "lyfeplace-waitlist";

const display = "var(--lyfe-display), Georgia, serif";

export default function FollowupForm({
  kind,
  token,
  firstName,
}: {
  kind: Kind;
  token: string | null;
  firstName: string | null;
}) {
  const feedback = kind === "ageless-feedback";
  const known = Boolean(token && firstName);

  const [overall, setOverall] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [moments, setMoments] = useState<string[]>([]);
  const [moreFrom, setMoreFrom] = useState<string[]>([]);
  const [organisation, setOrganisation] = useState(0);
  const [length, setLength] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [again, setAgain] = useState("");
  const [change, setChange] = useState("");
  const [quote, setQuote] = useState("");
  const [quoteOk, setQuoteOk] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [when, setWhen] = useState("");
  const [bookAreas, setBookAreas] = useState<string[]>([]);
  const [contactBy, setContactBy] = useState<string>("WhatsApp");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const needsContact = !feedback || bookAreas.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (feedback && !overall) return setError("Please give the evening a rating out of five.");
    if (!feedback && !interests.length) return setError("Please tell us what you would come for.");
    if (needsContact && !known && !fullName.trim()) return setError("Please tell us your name.");
    if (needsContact && !known && !phone.trim() && !email.trim())
      return setError("Please give us a number or an email so we can reach you.");
    if (!consent) return setError("We need your agreement before we can keep this.");

    const answers = feedback
      ? { overall, nps, moments, moreFrom, organisation, length, topics, again, change, quote, quoteOk }
      : { interests, when };
    setBusy(true);
    try {
      const res = await fetch("/api/ageless/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey: kind,
          token,
          fullName: fullName.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          answers,
          bookAreas,
          contactBy: needsContact ? contactBy : null,
          consent: true,
          company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl p-8" style={{ background: "#fff", color: MB.greenDeep }}>
        <h3 className="text-[26px]" style={{ fontFamily: display, fontWeight: 500 }}>
          {feedback ? "Thank you for your feedback." : "You have joined the waiting list."}
        </h3>
        <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: "#3A4A40" }}>
          {bookAreas.length
            ? `Someone from MedLYFE will be in touch by ${contactBy.toLowerCase()} within one working day to arrange your appointment. Have your AGELESS voucher to hand.`
            : feedback
              ? "We will use it to plan the next AGELESS. You can book a consultation and use your voucher at any time."
              : "We will send you updates on membership and the opening date."}
        </p>
        {!bookAreas.length && (
          <a
            href={agelessBookLink()}
            className="mt-6 inline-block rounded-xl px-7 py-3.5 text-sm font-semibold"
            style={{ background: MB.greenDeep, color: "#fff" }}
          >
            Book your consultation
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-6 sm:p-9" style={{ background: "#fff", color: MB.greenDeep }}>
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="ageless-company">Company</label>
        <input id="ageless-company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      {feedback ? (
        <>
          <Q n={1} title="Overall, how was the evening?">
            <Scale value={overall} onChange={setOverall} low="Not for me" high="Excellent" />
          </Q>
          <Q n={2} title="How likely are you to recommend AGELESS to a friend?" hint="0 is not at all, 10 is certainly.">
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 11 }, (_, i) => (
                <Pill key={i} on={nps === i} onClick={() => setNps(i)} small>
                  {i}
                </Pill>
              ))}
            </div>
          </Q>
          <Q n={3} title="Which parts of the evening did you value most?" hint="Choose any.">
            <Pills options={AGELESS_MOMENTS} chosen={moments} onToggle={(v) => toggle(moments, setMoments, v)} />
          </Q>
          <Q n={4} title="Who would you like to hear more from?" hint="Choose any.">
            <Pills options={AGELESS_SPEAKERS} chosen={moreFrom} onToggle={(v) => toggle(moreFrom, setMoreFrom, v)} />
          </Q>
          <Q n={5} title="The venue, timing and organisation">
            <Scale value={organisation} onChange={setOrganisation} low="Poor" high="Excellent" />
          </Q>
          <Q n={6} title="Was the programme the right length?">
            <Pills options={["Too short", "About right", "Too long"]} chosen={length ? [length] : []} onToggle={setLength} />
          </Q>
          <Q n={7} title="What should the next AGELESS cover?" hint="Choose any.">
            <Pills options={AGELESS_NEXT_TOPICS} chosen={topics} onToggle={(v) => toggle(topics, setTopics, v)} />
          </Q>
          <Q n={8} title="Would you come to the next one?">
            <Pills
              options={["Yes, and I would bring someone", "Yes", "Maybe", "Probably not"]}
              chosen={again ? [again] : []}
              onToggle={setAgain}
            />
          </Q>
          <Q n={9} title="One thing we should change">
            <Text value={change} onChange={setChange} />
          </Q>
          <Q n={10} title="Your main takeaway from the evening" hint="We may quote this, with your permission.">
            <Text value={quote} onChange={setQuote} />
            {quote.trim() && (
              <div className="mt-3">
                <Pills
                  options={["Yes, with my first name", "Yes, anonymously", "Please do not share it"]}
                  chosen={quoteOk ? [quoteOk] : []}
                  onToggle={setQuoteOk}
                />
              </div>
            )}
          </Q>
        </>
      ) : (
        <>
          <Q n={1} title="What would bring you to The Lyfe Place?" hint="Choose any.">
            <Pills options={LYFEPLACE_INTERESTS} chosen={interests} onToggle={(v) => toggle(interests, setInterests, v)} />
          </Q>
          <Q n={2} title="How soon would you want to start?">
            <Pills
              options={["As soon as it opens", "In its first six months", "Just keep me informed"]}
              chosen={when ? [when] : []}
              onToggle={setWhen}
            />
          </Q>
        </>
      )}

      {/* The booking prompt. Asked on both forms, never required. */}
      <div className="mt-9 rounded-xl p-5 sm:p-6" style={{ background: MB.limeSoft }}>
        <p className="text-[19px] leading-snug" style={{ fontFamily: display, fontWeight: 500 }}>
          {feedback
            ? "Would you like to book a consultation with MedLYFE?"
            : "Would you also like to book a consultation with MedLYFE now?"}
        </p>
        <p className="mt-1.5 text-[14px]" style={{ color: "#3A4A40" }}>
          Select any that apply and we will contact you to arrange it. Your AGELESS voucher can be used.
        </p>
        <div className="mt-4">
          <Pills
            options={AGELESS_CARE_AREAS.map((a) => a.label)}
            chosen={bookAreas.map((k) => AGELESS_CARE_AREAS.find((a) => a.key === k)!.label)}
            onToggle={(label) => {
              const key = AGELESS_CARE_AREAS.find((a) => a.label === label)!.key;
              toggle(bookAreas, setBookAreas, key);
            }}
          />
        </div>
      </div>

      {needsContact && (
        <div className="mt-7">
          <p className="text-[15px] font-semibold">
            {known ? `How should we reach you, ${firstName}?` : "How do we reach you?"}
          </p>
          {!known && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Input placeholder="Your name" value={fullName} onChange={setFullName} />
              <Input placeholder="Phone or WhatsApp" value={phone} onChange={setPhone} />
              <Input placeholder="Email" value={email} onChange={setEmail} type="email" />
            </div>
          )}
          <div className="mt-3">
            <Pills options={AGELESS_CONTACT_PREF} chosen={[contactBy]} onToggle={setContactBy} />
          </div>
        </div>
      )}

      <label className="mt-8 flex items-start gap-3 text-[13px] leading-relaxed" style={{ color: "#3A4A40" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 flex-none" />
        <span>{AGELESS_CONSENT_TEXT}</span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 w-full rounded-xl py-4 text-[15px] font-semibold transition hover:opacity-90 disabled:opacity-60"
        style={{ background: MB.greenDeep, color: "#fff" }}
      >
        {busy ? "Sending" : feedback ? "Send my feedback" : "Join the waiting list"}
      </button>
      {error && (
        <p className="mt-4 text-[14px]" style={{ color: "#A23B2A" }}>
          {error}
        </p>
      )}
    </form>
  );
}

/* ─── pieces ─────────────────────────────────────────────────────────────── */

function Q({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="text-[16.5px] font-semibold leading-snug">
        <span style={{ color: MB.greenSoft, marginRight: 10 }}>{String(n).padStart(2, "0")}</span>
        {title}
      </legend>
      {hint && (
        <p className="mt-1 text-[13px]" style={{ color: "#5B6B60" }}>
          {hint}
        </p>
      )}
      <div className="mt-3.5">{children}</div>
    </fieldset>
  );
}

function Pill({
  on,
  onClick,
  children,
  small = false,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border text-[14px] transition ${small ? "h-10 w-10" : "px-4 py-2.5 text-left"}`}
      style={{
        background: on ? MB.greenDeep : "#fff",
        color: on ? "#fff" : MB.greenDeep,
        borderColor: on ? MB.greenDeep : "#CBD5C8",
      }}
    >
      {children}
    </button>
  );
}

function Pills({
  options,
  chosen,
  onToggle,
}: {
  options: readonly string[];
  chosen: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Pill key={o} on={chosen.includes(o)} onClick={() => onToggle(o)}>
          {o}
        </Pill>
      ))}
    </div>
  );
}

function Scale({
  value,
  onChange,
  low,
  high,
}: {
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-label={`${v} out of 5`}
            aria-pressed={value === v}
            className="h-12 flex-1 rounded-xl border text-[16px] font-semibold transition"
            style={{
              background: value >= v ? MB.greenDeep : "#fff",
              color: value >= v ? "#fff" : MB.greenDeep,
              borderColor: value >= v ? MB.greenDeep : "#CBD5C8",
            }}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[12px]" style={{ color: "#5B6B60" }}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Text({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 1200))}
      rows={3}
      className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
      style={{ borderColor: "#CBD5C8", color: MB.greenDeep }}
    />
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
      style={{ borderColor: "#CBD5C8", color: MB.greenDeep }}
    />
  );
}
