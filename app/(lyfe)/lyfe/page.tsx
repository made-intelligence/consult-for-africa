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
  LYFE_PHONE_DISPLAY,
  LYFE_PRICING,
  LYFE_STANDARDS,
  LYFE_SURGEON,
  MEDLYFE_BRAND as MB,
  whatsappLink,
} from "@/lib/lyfe";
import EnquiryForm from "./EnquiryForm";
import StickyRsvp from "./StickyRsvp";

export const metadata: Metadata = {
  title: "Feel Good, Look Good, Live Better",
  description:
    "An evening at Medlyfe Wellness and Longevity Centre with Dr Chinwe Kpaduwa, MD FACS, on Thursday 15 October 2026. One conversation about how you feel and how you look.",
};

/**
 * An event landing page, not a practice page with an event bolted onto it.
 *
 * For the ten days to the fifteenth this page has one job, which is to fill a
 * room. So the evening is the page, the RSVP is the dominant action at every
 * scroll depth, and the practice material that used to sit above it now sits
 * below it. Reducing a page to one real call to action is the best evidenced
 * lift in landing page design, and two competing ones is how you halve both.
 *
 * The page opens in Medlyfe's livery and resolves into Lyfe's, which is
 * literally what "Medlyfe introduces Lyfe Plastics and Dermatology" means.
 * Medlyfe is the licensed, bookable host. Lyfe Plastics is introduced.
 *
 * Still no hero video and nothing heavier than it needs to be: 86 per cent of
 * Nigerian traffic is mobile at about 15 Mbps and data costs 575 naira a
 * gigabyte. The only image on the page is her portrait, at 16KB.
 */

const display = "var(--lyfe-display), Georgia, serif";
const sans = "var(--lyfe-sans), system-ui, sans-serif";

/** Medlyfe's mark tiled on a half drop, inline so it costs bytes not a request. */
const MONOGRAM = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="118" height="118" viewBox="0 0 118 118">` +
    `<g fill="#ffffff" fill-opacity="0.022">` +
    `<g transform="translate(29 22)">` +
    `<rect x="0" y="12" width="15" height="48" rx="7.5"/>` +
    `<circle cx="29.5" cy="10" r="10.5"/>` +
    `<rect x="22" y="27" width="15" height="46" rx="7.5"/>` +
    `<rect x="44" y="12" width="15" height="47" rx="7.5"/>` +
    `</g></g></svg>`,
)}")`;

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
  const go = sp.go === "call" ? "DISCOVERY_CALL" : sp.go === "rsvp" ? "EVENT_RSVP" : null;

  return (
    <div style={{ background: MB.blue, color: C.body, fontFamily: sans }}>
      <Hero />
      <Evening />
      <Surgeon />
      <WhatYouLeaveWith />
      <Rsvp utm={utm} initialIntent={go} />
      <CannotMakeIt />
      <ThePractice />
      <Footer />
      <StickyRsvp />
    </div>
  );
}

/* ─── brand furniture ──────────────────────────────────────────────────────── */

function Section({
  children,
  bg = MB.blue,
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} style={{ background: bg }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-20 md:px-8 md:py-28">{children}</div>
    </section>
  );
}

function Lockup({ size = 1 }: { size?: number }) {
  const m = 44 * size;
  return (
    <div className="flex items-center gap-3.5">
      <svg width={m * 0.78} height={m} viewBox="0 0 59 73" fill={MB.white} aria-hidden>
        <rect x="0" y="12" width="15" height="48" rx="7.5" />
        <circle cx="29.5" cy="10" r="10.5" />
        <rect x="22" y="27" width="15" height="46" rx="7.5" />
        <rect x="44" y="12" width="15" height="47" rx="7.5" />
      </svg>
      <div>
        <div style={{ lineHeight: 1 }}>
          <span style={{ fontFamily: display, fontWeight: 400, fontSize: 25 * size, color: MB.white }}>
            med
          </span>
          <span
            style={{
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 25 * size,
              color: MB.white,
              letterSpacing: "-0.02em",
            }}
          >
            LYFE
          </span>
        </div>
        <div
          className="mt-1.5"
          style={{ color: MB.white, opacity: 0.85, fontSize: 8.5 * size, letterSpacing: "0.17em" }}
        >
          WELLNESS AND LONGEVITY CENTRE
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children, color = MB.lime }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase" style={{ color, letterSpacing: "0.18em" }}>
      {children}
    </p>
  );
}

function Rule({ color = MB.lime, width = 56 }: { color?: string; width?: number }) {
  return <div className="h-px" style={{ width, background: color, opacity: 0.75 }} />;
}

function RsvpButton({ children = "Reserve a place" }: { children?: React.ReactNode }) {
  return (
    <a
      href="?go=rsvp#enquire"
      className="inline-block rounded-xl px-9 text-sm font-semibold transition hover:opacity-90"
      style={{ background: MB.lime, color: MB.blueDeep, paddingTop: 17, paddingBottom: 17 }}
    >
      {children}
    </a>
  );
}

/**
 * Her portrait in an arch, with a hairline proud of it and the foot faded
 * into the ground. A niche reads as a portrait that belongs in the page; a
 * rectangle reads as a photograph dropped on top of one.
 */
function ArchPortrait({ w = 300, priority = false }: { w?: number; priority?: boolean }) {
  return (
    <div className="relative" style={{ width: w, maxWidth: "100%" }}>
      <div
        className="overflow-hidden"
        style={{
          borderTopLeftRadius: 9999,
          borderTopRightRadius: 9999,
          background: MB.blueDeep,
          WebkitMaskImage: "linear-gradient(to bottom, #000 70%, transparent 99%)",
          maskImage: "linear-gradient(to bottom, #000 70%, transparent 99%)",
          aspectRatio: "0.8",
        }}
      >
        <Image
          src={LYFE_SURGEON.portrait}
          alt={LYFE_SURGEON.name}
          width={LYFE_SURGEON.portraitWidth}
          height={LYFE_SURGEON.portraitHeight}
          priority={priority}
          sizes="(max-width: 768px) 72vw, 340px"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 16%" }}
        />
      </div>
    </div>
  );
}

/* ─── hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(168deg, ${MB.blue} 0%, ${MB.blueDeep} 60%, #13262F 100%)` }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: MONOGRAM, backgroundSize: "118px 118px" }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <Lockup />

        <div className="mt-14 grid items-center gap-12 md:mt-20 md:grid-cols-[1.18fr_1fr] md:gap-16">
          <div>
            <Eyebrow>With {LYFE_SURGEON.name}</Eyebrow>

            <h1
              className="mt-5 text-[42px] leading-[1.04] md:text-[64px]"
              style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.025em" }}
            >
              {LYFE_EVENT.tagline}
            </h1>

            <p
              className="mt-6 max-w-lg text-[18px] leading-relaxed md:text-[20px]"
              style={{ color: MB.limeSoft, fontFamily: display, fontStyle: "italic" }}
            >
              {LYFE_EVENT.standfirst}
            </p>

            <div className="mt-9">
              <Rule />
            </div>

            <dl className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              <Fact k="Date" v={LYFE_EVENT.date} />
              <Fact k="Cocktails" v={LYFE_EVENT.cocktails} />
              <Fact k="Programme" v={`${LYFE_EVENT.programme}, close ${LYFE_EVENT.close}`} />
              <Fact
                k="Venue"
                v={
                  LYFE_EVENT.venueAddress
                    ? `${LYFE_EVENT.venueName}, ${LYFE_EVENT.venueAddress}`
                    : LYFE_EVENT.venueName
                }
              />
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <RsvpButton />
              <span className="text-[14px]" style={{ color: MB.blueSoft }}>
                Places are limited. Kindly reply by {LYFE_EVENT.rsvpBy}.
              </span>
            </div>

            <p className="mt-6 text-[13.5px] leading-relaxed" style={{ color: MB.blueSoft }}>
              Not able to come?{" "}
              <a
                href="?go=call#enquire"
                className="font-semibold underline underline-offset-4"
                style={{ color: MB.limeSoft }}
              >
                Book a free fifteen minute call
              </a>{" "}
              instead.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <ArchPortrait w={330} priority />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt
        className="text-[10.5px] font-semibold uppercase"
        style={{ color: MB.lime, letterSpacing: "0.15em" }}
      >
        {k}
      </dt>
      <dd className="mt-1 text-[16px]" style={{ color: MB.white }}>
        {v}
      </dd>
    </div>
  );
}

/* ─── the evening ──────────────────────────────────────────────────────────── */

function Evening() {
  return (
    <Section bg={MB.blueDeep} id="evening">
      <div className="max-w-2xl">
        <Eyebrow>The evening</Eyebrow>
        <h2
          className="mt-5 text-[32px] leading-[1.14] md:text-[44px]"
          style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
        >
          Most of us have been having this conversation in two separate rooms.
        </h2>
        <p className="mt-6 text-[17px] leading-relaxed" style={{ color: "#C6D6DB" }}>
          One room for sleep, weight and energy. Another for skin, appearance and aesthetics. They
          are the same story: how you feel within and how you show up outwardly. For one evening,
          Medlyfe brings them together.
        </p>
      </div>

      <ol className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2">
        {LYFE_EVENT_PROGRAMME.map((item) => (
          <li key={item.title}>
            <h3 className="text-[18px] font-semibold" style={{ color: MB.white }}>
              {item.title}
            </h3>
            <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: "#B8CBD2" }}>
              {item.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex flex-wrap items-center gap-6">
        <RsvpButton />
        <span className="text-[14px]" style={{ color: MB.blueSoft }}>
          {LYFE_EVENT.date} &middot; {LYFE_EVENT.venueName}
        </span>
      </div>
    </Section>
  );
}

/* ─── her ──────────────────────────────────────────────────────────────────── */

function Surgeon() {
  return (
    <Section bg={MB.blueDeep}>
      <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-16">
        <div className="flex justify-center md:justify-start">
          <ArchPortrait w={300} />
        </div>
        <div>
          <Eyebrow>In conversation</Eyebrow>
          <h2
            className="mt-5 text-[30px] leading-[1.14] md:text-[40px]"
            style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
          >
            &ldquo;{LYFE_EVENT.sessionTitle}&rdquo;
          </h2>
          <p className="mt-4 text-[16px] font-semibold" style={{ color: MB.limeSoft }}>
            {LYFE_SURGEON.name}
          </p>

          <p className="mt-6 text-[16px] leading-relaxed" style={{ color: "#C6D6DB" }}>
            Thoughtful aesthetic care, natural looking results, and the importance of knowing not
            only what can be done but what should be done. {LYFE_SURGEON.position}
          </p>

          <ul className="mt-8 grid gap-2.5">
            {LYFE_SURGEON.credentials.map((cr) => (
              <li
                key={cr}
                className="flex gap-3 text-[14.5px] leading-relaxed"
                style={{ color: "#C6D6DB" }}
              >
                <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full" style={{ background: MB.lime }} />
                {cr}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ─── what you leave with ──────────────────────────────────────────────────── */

const LEAVE_WITH = [
  {
    title: "A straight answer, not a pitch",
    body: "The clinical team is in the room all evening. Ask anybody anything, including whether you should do nothing at all.",
  },
  {
    title: "The prices, said out loud",
    body: "What each service is for, who it suits, and what it costs. A room that has to ask assumes the worst, so nobody will have to ask.",
  },
  {
    title: "Something worth keeping",
    body: `A short printed piece, “${LYFE_EVENT_TAKEAWAY}”. Useful whether or not you ever become a patient.`,
  },
  {
    title: "No obligation whatsoever",
    body: "You can book a consultation on the night if you want one. Nobody will mind in the least if you do not.",
  },
];

function WhatYouLeaveWith() {
  return (
    <Section bg={MB.blueDeep}>
      <Eyebrow>What you leave with</Eyebrow>
      <h2
        className="mt-5 max-w-2xl text-[30px] leading-[1.14] md:text-[40px]"
        style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
      >
        An evening of conversation, not a sales floor.
      </h2>

      <div className="mt-12 grid gap-x-14 gap-y-9 md:grid-cols-2">
        {LEAVE_WITH.map((l) => (
          <div key={l.title}>
            <h3 className="text-[17px] font-semibold" style={{ color: MB.white }}>
              {l.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "#B8CBD2" }}>
              {l.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── the RSVP ─────────────────────────────────────────────────────────────── */

function Rsvp({
  utm,
  initialIntent,
}: {
  utm: { source: string | null; medium: string | null; campaign: string | null };
  initialIntent: "EVENT_RSVP" | "DISCOVERY_CALL" | null;
}) {
  return (
    <Section bg={MB.blue} id="enquire">
      <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <Eyebrow>Reserve a place</Eyebrow>
          <h2
            className="mt-5 text-[30px] leading-[1.14] md:text-[42px]"
            style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
          >
            We would be glad to have you.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: "#C6D6DB" }}>
            A member of the team will call to confirm you personally, and the address follows your
            reply. Kindly let us know by {LYFE_EVENT.rsvpBy}.
          </p>

          <div className="mt-9">
            <Rule width={140} />
          </div>

          <dl className="mt-8 grid gap-4">
            <Fact k="Date" v={LYFE_EVENT.date} />
            <Fact
              k="Time"
              v={`Cocktails ${LYFE_EVENT.cocktails}, programme ${LYFE_EVENT.programme}, close ${LYFE_EVENT.close}`}
            />
            <Fact k="Venue" v={LYFE_EVENT.venueName} />
          </dl>

          <p className="mt-10 text-[14px] leading-relaxed" style={{ color: MB.blueSoft }}>
            Would you rather speak to somebody? Call{" "}
            <a
              href={`tel:${LYFE_PHONE_DISPLAY.replace(/\s/g, "")}`}
              className="font-semibold underline underline-offset-4"
              style={{ color: MB.limeSoft }}
            >
              {LYFE_PHONE_DISPLAY}
            </a>{" "}
            or{" "}
            <a
              href={whatsappLink(`Hello, I would like to RSVP to the evening on ${LYFE_EVENT.date}.`)}
              className="font-semibold underline underline-offset-4"
              style={{ color: MB.limeSoft }}
            >
              send a WhatsApp message
            </a>
            .
          </p>
        </div>

        <EnquiryForm utm={utm} initialIntent={initialIntent} />
      </div>
    </Section>
  );
}

/* ─── the secondary path ───────────────────────────────────────────────────── */

function CannotMakeIt() {
  const d = LYFE_DOORS.DISCOVERY_CALL;
  return (
    <section style={{ background: MB.blueDeep }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-14 md:px-8">
        <div className="rounded-2xl p-7 md:p-10" style={{ border: `1px solid ${MB.lime}44` }}>
          <div className="flex flex-wrap items-center justify-between gap-7">
            <div className="max-w-xl">
              <Eyebrow>If the fifteenth does not suit</Eyebrow>
              <h2
                className="mt-4 text-[24px] leading-tight md:text-[30px]"
                style={{ fontFamily: display, fontWeight: 600, color: MB.white }}
              >
                {d.label}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#B8CBD2" }}>
                {d.blurb}
              </p>
            </div>
            <a
              href="?go=call#enquire"
              className="rounded-xl border px-7 py-4 text-sm font-semibold transition hover:bg-white/5"
              style={{ borderColor: `${MB.lime}88`, color: MB.white }}
            >
              {d.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── the practice being introduced ────────────────────────────────────────── */

function ThePractice() {
  return (
    <section style={{ background: C.ground }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-20 md:px-8 md:py-28">
        <p
          className="text-[11px] font-semibold uppercase"
          style={{ color: C.bronze, letterSpacing: "0.18em" }}
        >
          {LYFE_EVENT.footerLine}
        </p>
        <h2
          className="mt-5 max-w-2xl text-[30px] leading-[1.14] md:text-[42px]"
          style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
        >
          Aesthetic care for the woman who wants to look rested, not rearranged.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.body }}>
          This is the practice being introduced on the night. Treatment is delivered at the clinic
          by registered clinicians, to protocols {LYFE_SURGEON.shortName} wrote and against a
          standard she signs off.
        </p>

        <div className="mt-14 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {LYFE_STANDARDS.slice(0, 4).map((s) => (
            <div key={s.title}>
              <h3 className="text-[16.5px] font-semibold" style={{ color: C.ink }}>
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.body }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Prices, because the one Lagos practice that publishes is winning
            that comparison by default. */}
        <div className="mt-16">
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: C.bronze, letterSpacing: "0.16em" }}
          >
            What it costs
          </p>
          <div
            className="mt-5 overflow-hidden rounded-2xl"
            style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}
          >
            {LYFE_PRICING.map((p, i) => (
              <div
                key={p.service}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-6 py-3.5"
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
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>
            Indicative, confirmed in writing after your consultation, and not changed afterwards
            without your written agreement. Surgery is quoted individually after an examination,
            because a price given before anybody has looked at you is a guess.
          </p>
        </div>

        {/* Aftercare, the one piece of open ground nobody in Lagos prices. */}
        <div className="mt-16">
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: C.bronze, letterSpacing: "0.16em" }}
          >
            The part nobody quotes for
          </p>
          <h3
            className="mt-4 max-w-2xl text-[24px] leading-tight md:text-[30px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink }}
          >
            The surgery is not the expensive bit. Getting better is.
          </h3>
          <div className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
            {LYFE_AFTERCARE.map((a) => (
              <div key={a.title}>
                <h4 className="text-[16px] font-semibold" style={{ color: C.ink }}>
                  {a.title}
                </h4>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: C.body }}>
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ background: MB.blueDeep }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-14 pb-28 md:px-8 md:pb-20">
        <Lockup size={0.9} />
        <div
          className="mt-10 grid gap-8 text-[13px] leading-relaxed md:grid-cols-2"
          style={{ color: MB.blueSoft }}
        >
          <div>
            <p style={{ color: "#C6D6DB" }}>
              {LYFE_EVENT.host}. Consultations and treatment are provided at the clinic by
              clinicians registered with the Medical and Dental Council of Nigeria.
            </p>
            <p className="mt-4">
              {LYFE_SURGEON.name} is a promoter of {LYFE_NAME} and the surgeon who sets its clinical
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
            <p className="mt-4">{LYFE_PHONE_DISPLAY} &middot; Lagos, Nigeria</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
