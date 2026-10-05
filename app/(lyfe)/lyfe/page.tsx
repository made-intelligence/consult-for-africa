import type { Metadata } from "next";
import Image from "next/image";
import {
  LYFE_AFTERCARE,
  LYFE_BRAND as C,
  LYFE_DOORS,
  LYFE_EVENT,
  LYFE_EVENT_PROGRAMME,
  LYFE_EVENT_TAKEAWAY,
  LYFE_NAME,
  LYFE_OBJECTIONS,
  LYFE_PHONE_DISPLAY,
  LYFE_PRICING,
  LYFE_PROMISE,
  LYFE_STANDARDS,
  LYFE_SURGICAL_FEE_NOTE,
  LYFE_SURGEON,
  LYFE_THEME,
  MEDLYFE_BRAND as MB,
  whatsappLink,
} from "@/lib/lyfe";
import EnquiryForm from "./EnquiryForm";

export const metadata: Metadata = {
  title: "The Art of Looking Like Yourself",
  description:
    "Aesthetic care in Lagos for the woman who wants to look rested, not rearranged. Published prices, registered clinicians, and a consultation that will tell you when the answer is no.",
};

/**
 * There is deliberately no navigation on this page.
 *
 * HubSpot A/B tested its five highest-traffic landing pages with and without
 * top nav, footer nav and social links, and the mid-funnel pages gained 16%
 * and 28% from removing them. A booked-consultation page is mid-funnel. Every
 * link on this page therefore goes to one of three places: the form, WhatsApp,
 * or the telephone.
 *
 * There is also no hero video and no photography heavier than it needs to be.
 * 86% of Nigerian web traffic is mobile, independently measured average mobile
 * download speed was 14.7 Mbps at the end of 2025, and data costs about ₦575 a
 * gigabyte. Google and Deloitte measured a 0.1 second mobile improvement
 * producing an 8.4% lift in conversions across 30 million sessions. Weight is
 * a conversion decision here, not an aesthetic one.
 */

const display = "var(--lyfe-display), Georgia, serif";
const sans = "var(--lyfe-sans), system-ui, sans-serif";

export default async function LyfePage({
  searchParams,
}: {
  searchParams: Promise<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    go?: string;
  }>;
}) {
  const sp = await searchParams;
  const utm = {
    source: sp.utm_source?.slice(0, 100) ?? null,
    medium: sp.utm_medium?.slice(0, 100) ?? null,
    campaign: sp.utm_campaign?.slice(0, 100) ?? null,
  };
  // The hero buttons carry the choice down to the form, so a guest who clicked
  // RSVP does not have to answer the same question twice.
  const go = sp.go === "rsvp" ? "EVENT_RSVP" : sp.go === "call" ? "DISCOVERY_CALL" : null;

  return (
    <div style={{ background: C.ground, color: C.body, fontFamily: sans }}>
      <Hero />
      <Evening />
      <Doors />
      <Standards />
      <Aftercare />
      <Prices />
      <Objections />
      <Enquire utm={utm} initialIntent={go} />
      <Footer />
    </div>
  );
}

/* ─── furniture ────────────────────────────────────────────────────────────── */

function Wordmark({ on = C.ink, sub = C.bronze }: { on?: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontFamily: display, fontSize: 25, fontWeight: 600, color: on, letterSpacing: "-0.02em", lineHeight: 1 }}>
        Lyfe
      </div>
      <div
        className="mt-1.5 text-[9px] font-semibold uppercase"
        style={{ color: sub, letterSpacing: "0.18em" }}
      >
        Plastics and Dermatology
      </div>
    </div>
  );
}

function Eyebrow({ children, color = C.bronze }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase" style={{ color, letterSpacing: "0.15em" }}>
      {children}
    </p>
  );
}

function H({ children, color = C.ink }: { children: React.ReactNode; color?: string }) {
  return (
    <h2
      className="text-[29px] leading-[1.14] md:text-[40px]"
      style={{ fontFamily: display, fontWeight: 600, color, letterSpacing: "-0.018em" }}
    >
      {children}
    </h2>
  );
}

function Section({
  children,
  bg = C.ground,
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} style={{ background: bg }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">{children}</div>
    </section>
  );
}

/* ─── hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section style={{ background: C.ink }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
        <Wordmark on="#FFFFFF" />

        <h1
          className="mt-12 max-w-3xl text-[38px] leading-[1.06] md:mt-16 md:text-[64px]"
          style={{ fontFamily: display, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.025em" }}
        >
          {LYFE_THEME}
        </h1>

        <p className="mt-6 max-w-xl text-[17px] leading-relaxed md:text-[19px]" style={{ color: "#C9C3B9" }}>
          {LYFE_PROMISE} Aesthetic care in Lagos with clinicians who will tell you what will
          work, what will not, and when the honest answer is to do nothing at all.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a
            href="?go=rsvp#enquire"
            className="rounded-xl px-7 py-5 transition hover:opacity-90"
            style={{ background: C.bronze, color: "#FFFFFF" }}
          >
            <span className="block text-sm font-semibold">{LYFE_DOORS.EVENT_RSVP.cta}</span>
            <span className="mt-1 block text-[13px] opacity-85">
              {LYFE_EVENT.date}. Cocktails {LYFE_EVENT.cocktails}.
            </span>
          </a>
          <a
            href="?go=call#enquire"
            className="rounded-xl border px-7 py-5 transition hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#FFFFFF" }}
          >
            <span className="block text-sm font-semibold">{LYFE_DOORS.DISCOVERY_CALL.cta}</span>
            <span className="mt-1 block text-[13px]" style={{ color: "#C9C3B9" }}>
              Fifteen minutes. Free. No obligation.
            </span>
          </a>
        </div>

        <p className="mt-6 text-[13px] leading-relaxed" style={{ color: "#8B8780" }}>
          Or message us on{" "}
          <a
            href={whatsappLink("Hello, I would like to ask about Lyfe Plastics and Dermatology.")}
            className="font-semibold underline underline-offset-4"
            style={{ color: "#C9C3B9" }}
          >
            WhatsApp
          </a>
          . Prices are published further down this page, so you will not have to ask.
        </p>
      </div>
    </section>
  );
}

/* ─── the evening ──────────────────────────────────────────────────────────── */

/**
 * This section wears Medlyfe's colours, not Lyfe's.
 *
 * Medlyfe is the trading, licensed, bookable entity and it is the host.
 * Lyfe Plastics is introduced on the night, which is the billing that keeps
 * the whole thing proper under Part F. Making the section visibly Medlyfe's
 * is not decoration, it is the compliance position rendered in colour.
 */
function Evening() {
  return (
    <section id="evening" style={{ background: MB.blue }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <div
          className="rounded-2xl p-6 md:p-10"
          style={{ border: `1px solid ${MB.lime}66` }}
        >
          <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:gap-14">
            <div>
              <MedlyfeLockup />
              <p
                className="mt-7 text-[11px] font-semibold uppercase"
                style={{ color: MB.lime, letterSpacing: "0.16em" }}
              >
                With {LYFE_EVENT.withWhom}
              </p>

              <h2
                className="mt-4 text-[30px] leading-[1.1] md:text-[44px]"
                style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
              >
                {LYFE_EVENT.tagline}
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed" style={{ color: MB.limeSoft }}>
                {LYFE_EVENT.standfirst}
              </p>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed" style={{ color: "#D5E2E6" }}>
                How you feel and how you look are part of the same conversation. Most of us
                have been having it in separate rooms: one for sleep, weight and energy,
                another for skin, appearance and aesthetics. For one evening, Medlyfe brings
                them together.
              </p>

              <dl className="mt-8 space-y-2.5 text-[15px]">
                <EventFact k="Date" v={LYFE_EVENT.date} />
                <EventFact k="Cocktails" v={LYFE_EVENT.cocktails} />
                <EventFact k="Programme" v={LYFE_EVENT.programme} />
                <EventFact k="Close" v={LYFE_EVENT.close} />
                <EventFact
                  k="Venue"
                  v={
                    LYFE_EVENT.venueAddress
                      ? `${LYFE_EVENT.venueName}, ${LYFE_EVENT.venueAddress}`
                      : LYFE_EVENT.venueName
                  }
                />
                <EventFact k="RSVP by" v={LYFE_EVENT.rsvpBy} />
              </dl>

              <a
                href="?go=rsvp#enquire"
                className="mt-9 inline-block rounded-xl px-7 py-4 text-sm font-semibold transition hover:opacity-90"
                style={{ background: MB.lime, color: MB.blueDeep }}
              >
                {LYFE_DOORS.EVENT_RSVP.cta}
              </a>
              <p className="mt-3 text-[13px]" style={{ color: MB.blueSoft }}>
                A member of the team will call to confirm each guest personally.
              </p>
            </div>

            <div>
              <div className="overflow-hidden rounded-2xl" style={{ background: MB.blueDeep }}>
                <Image
                  src={LYFE_SURGEON.portrait}
                  alt={LYFE_SURGEON.name}
                  width={LYFE_SURGEON.portraitWidth}
                  height={LYFE_SURGEON.portraitHeight}
                  className="h-auto w-full"
                  priority={false}
                />
              </div>
              <p className="mt-4 text-[15px] font-semibold" style={{ color: MB.white }}>
                {LYFE_SURGEON.name}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed" style={{ color: MB.blueSoft }}>
                Leading a conversation titled &ldquo;{LYFE_EVENT.sessionTitle}&rdquo;
              </p>

              <ul className="mt-5 space-y-2">
                {LYFE_SURGEON.credentials.map((cr) => (
                  <li key={cr} className="flex gap-3 text-[13.5px] leading-relaxed" style={{ color: "#D5E2E6" }}>
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: MB.lime }} />
                    {cr}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-10" style={{ borderColor: `${MB.lime}44` }}>
            <p
              className="text-[11px] font-semibold uppercase"
              style={{ color: MB.lime, letterSpacing: "0.16em" }}
            >
              The programme
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {LYFE_EVENT_PROGRAMME.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: MB.lime }} />
                  <div>
                    <h3 className="text-[15.5px] font-semibold" style={{ color: MB.white }}>
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "#C6D6DB" }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 text-[12px]" style={{ color: MB.blueSoft }}>
              {LYFE_EVENT.footerLine}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Medlyfe's mark, rebuilt from measured geometry rather than lifted from a
 * flattened poster: three pill bars with a dot over the middle one. The
 * wordmark is set in the nearest available pairing, a light serif against a
 * heavy grotesque. SWAP THIS FOR THE REAL LOGO FILE WHEN IT ARRIVES.
 */
function MedlyfeLockup() {
  return (
    <div className="flex items-center gap-3.5">
      <svg width="34" height="42" viewBox="0 0 59 73" fill={MB.white} aria-hidden>
        <rect x="0" y="12" width="15" height="48" rx="7.5" />
        <circle cx="29.5" cy="10" r="10.5" />
        <rect x="22" y="27" width="15" height="46" rx="7.5" />
        <rect x="44" y="12" width="15" height="47" rx="7.5" />
      </svg>
      <div>
        <div style={{ lineHeight: 1 }}>
          <span style={{ fontFamily: display, fontWeight: 400, fontSize: 27, color: MB.white, letterSpacing: "-0.01em" }}>
            med
          </span>
          <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 27, color: MB.white, letterSpacing: "-0.02em" }}>
            LYFE
          </span>
        </div>
        <div
          className="mt-1 text-[9.5px]"
          style={{ color: MB.white, letterSpacing: "0.04em", opacity: 0.9 }}
        >
          Wellness and Longevity Centre
        </div>
      </div>
    </div>
  );
}

function EventFact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-4">
      <dt
        className="w-24 shrink-0 text-[12px] font-semibold uppercase"
        style={{ color: MB.lime, letterSpacing: "0.1em" }}
      >
        {k}
      </dt>
      <dd style={{ color: MB.white }}>{v}</dd>
    </div>
  );
}

/* ─── the two doors ────────────────────────────────────────────────────────── */

function Doors() {
  return (
    <Section>
      <Eyebrow>Two ways in</Eyebrow>
      <H>Come and listen, or talk to somebody first. Both are free and neither commits you.</H>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed">
        Most people do one and then the other. Nobody will push you from one to the next.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {(["EVENT_RSVP", "DISCOVERY_CALL"] as const).map((key) => {
          const d = LYFE_DOORS[key];
          return (
            <div
              key={key}
              className="flex flex-col rounded-2xl p-7"
              style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}
            >
              <p className="text-[11px] font-semibold uppercase" style={{ color: C.bronze, letterSpacing: "0.14em" }}>
                {d.note}
              </p>
              <h3 className="mt-3 text-[22px] leading-tight" style={{ fontFamily: display, fontWeight: 600, color: C.ink }}>
                {d.label}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed">{d.blurb}</p>
              <a
                href={`?go=${key === "EVENT_RSVP" ? "rsvp" : "call"}#enquire`}
                className="mt-6 inline-block self-start rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                style={
                  key === "EVENT_RSVP"
                    ? { background: C.bronze, color: "#FFFFFF" }
                    : { border: `1px solid ${C.line}`, color: C.ink }
                }
              >
                {d.cta}
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-7 rounded-2xl p-6" style={{ background: C.greenTint, borderLeft: `3px solid ${C.green}` }}>
        <p className="text-[15px] leading-relaxed" style={{ color: C.ink }}>
          <strong>A virtual consultation is a real consultation.</strong> A study of 1,889 new
          plastic surgery patients found no measurable difference in whether patients went on to
          have a procedure, whether they were seen in the room or on a screen. If you are in
          Abuja, in Port Harcourt or abroad, say so on the call. It is usually the faster way to
          be seen.
        </p>
      </div>
    </Section>
  );
}

/* ─── the standard ─────────────────────────────────────────────────────────── */

function Standards() {
  return (
    <Section bg={C.groundWarm}>
      <Eyebrow>What we commit to</Eyebrow>
      <H>The six things a good practice does, written down so you can hold us to them.</H>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed">
        Most of what goes wrong in this field goes wrong before anybody picks up a needle. It goes
        wrong because nobody asked the right questions, nobody wrote the answers down, and nobody
        was there afterwards. These are our rules, and our coordinators are trained against them.
      </p>

      <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {LYFE_STANDARDS.map((s, i) => (
          <div key={s.title}>
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.bronze }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[17px] font-semibold" style={{ color: C.ink }}>
                {s.title}
              </h3>
            </div>
            <p className="mt-2.5 pl-8 text-[15px] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── aftercare ────────────────────────────────────────────────────────────── */

function Aftercare() {
  return (
    <Section>
      <Eyebrow>The part nobody quotes for</Eyebrow>
      <H>The surgery is not the expensive bit. Getting better is.</H>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed">
        The one Lagos patient who published every line of what she spent found that her recovery
        cost more than her operation. Garments, medication, massage, somewhere to stay, somebody to
        help. None of it was in the quote, and all of it arrived afterwards.
      </p>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed">
        That is the real reason people fly abroad. Not the price, which is usually higher, but the
        single number that includes everything and the sense that somebody has thought it through.
        So we have.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {LYFE_AFTERCARE.map((a) => (
          <div
            key={a.title}
            className="rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}
          >
            <h3 className="text-[17px] font-semibold" style={{ color: C.ink }}>
              {a.title}
            </h3>
            <p className="mt-2.5 text-[15px] leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── prices ───────────────────────────────────────────────────────────────── */

function Prices() {
  return (
    <Section id="prices" bg={C.groundWarm}>
      <Eyebrow>What it costs</Eyebrow>
      <H>Published, because a practice that makes you ask is telling you something.</H>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed">
        These are the current prices for treatment delivered at the clinic. They are indicative,
        they are confirmed in writing after your consultation, and they do not change afterwards
        without your written agreement.
      </p>

      <div
        className="mt-9 overflow-hidden rounded-2xl"
        style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}
      >
        {LYFE_PRICING.map((p, i) => (
          <div
            key={p.service}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-6 py-4"
            style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}
          >
            <div>
              <span className="text-[15px] font-medium" style={{ color: C.ink }}>
                {p.service}
              </span>
              {p.note && (
                <span className="ml-2 text-[13px]" style={{ color: C.muted }}>
                  {p.note}
                </span>
              )}
            </div>
            <span className="text-[15px] font-semibold tabular-nums" style={{ color: C.ink }}>
              {p.price}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[14px] leading-relaxed" style={{ color: C.muted }}>
        {LYFE_SURGICAL_FEE_NOTE} Surgery is quoted individually after assessment, because an
        operation priced before anyone has examined you is not a quote, it is a guess.
      </p>
    </Section>
  );
}

/* ─── objections ───────────────────────────────────────────────────────────── */

function Objections() {
  return (
    <Section>
      <Eyebrow>The things people actually worry about</Eyebrow>
      <H>Said out loud, since you were going to think them anyway.</H>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {LYFE_OBJECTIONS.map((o) => (
          <div key={o.worry}>
            <h3 className="text-[17px] leading-snug" style={{ fontFamily: display, fontWeight: 600, color: C.ink }}>
              &ldquo;{o.worry}&rdquo;
            </h3>
            <p className="mt-2.5 text-[15px] leading-relaxed">{o.answer}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── the form ─────────────────────────────────────────────────────────────── */

function Enquire({
  utm,
  initialIntent,
}: {
  utm: { source: string | null; medium: string | null; campaign: string | null };
  initialIntent: "EVENT_RSVP" | "DISCOVERY_CALL" | null;
}) {
  return (
    <Section id="enquire" bg={C.groundWarm}>
      <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:gap-14">
        <div>
          <Eyebrow>Start here</Eyebrow>
          <H>A few questions, and somebody gets back to you.</H>
          <p className="mt-5 text-[16px] leading-relaxed">
            Not a form that disappears into an inbox. A coordinator works this queue and the clock
            on your enquiry starts the moment you send it.
          </p>

          <div className="mt-8 space-y-5">
            {[
              ["First", "A coordinator calls, listens, and tells you honestly whether we are the right place for what you want."],
              ["Then, if you want one", "A consultation. A clinician examines, explains the options and the risks, and says what is realistic."],
              ["Afterwards", "A written plan and a written price. Nothing is booked until you have both."],
            ].map(([when, what]) => (
              <div key={when} className="flex gap-4">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: C.bronze }}
                />
                <p className="text-[15px] leading-relaxed">
                  <strong style={{ color: C.ink }}>{when}.</strong> {what}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-9 rounded-xl p-5" style={{ background: C.greenTint }}>
            <p className="text-[14px] leading-relaxed" style={{ color: C.ink }}>
              Prefer to talk first? Call{" "}
              <a href={`tel:${LYFE_PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-2">
                {LYFE_PHONE_DISPLAY}
              </a>{" "}
              or{" "}
              <a
                href={whatsappLink("Hello, I have a question about a consultation.")}
                className="font-semibold underline underline-offset-2"
              >
                send a WhatsApp message
              </a>
              . Either reaches a person, not a menu.
            </p>
          </div>
        </div>

        <EnquiryForm utm={utm} initialIntent={initialIntent} />
      </div>
    </Section>
  );
}

/* ─── footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ background: C.ink }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-14 md:px-8">
        <Wordmark on="#FFFFFF" />

        <div className="mt-10 grid gap-8 text-[13px] leading-relaxed md:grid-cols-2" style={{ color: "#8B8780" }}>
          <div>
            <p style={{ color: "#C9C3B9" }}>
              {LYFE_NAME} is a clinical venture in Lagos. Consultations and treatment are provided
              at the clinic by clinicians registered with the Medical and Dental Council of Nigeria.
            </p>
            <p className="mt-4">
              Dr Chinwe Kpaduwa is a promoter of this venture and the surgeon who sets its clinical
              standard. She designs the protocols and trains and signs off the clinicians who
              deliver treatment.
            </p>
          </div>
          <div>
            <p>
              Nothing on this page is a diagnosis, a recommendation or a promise of a result. All
              procedures carry risk. Whether any treatment is appropriate for you is a clinical
              decision taken at a consultation, after an examination, and it is sometimes no.
            </p>
            <p className="mt-4">
              Your details are held under the Nigeria Data Protection Act 2023 and used only to
              answer your enquiry. Ask us at any time and we will delete them.
            </p>
            <p className="mt-4">
              {LYFE_PHONE_DISPLAY} &middot; Lagos, Nigeria
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
