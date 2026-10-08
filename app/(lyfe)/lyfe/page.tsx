import type { Metadata } from "next";
import Image from "next/image";
import {
  LYFE_EVENT,
  LYFE_EVENT_PROGRAMME,
  LYFE_EVENT_TAKEAWAYS,
  LYFE_PANEL,
  LYFE_PHONE_DISPLAY,
  MEDLYFE_ABOUT,
  MEDLYFE_NAME,
  MEDLYFE_BRAND as MB,
  whatsappLink,
} from "@/lib/lyfe";
import EnquiryForm from "./EnquiryForm";
import LyfeNav from "./LyfeNav";
import AboutGroup from "./AboutGroup";
import StickyRsvp from "./StickyRsvp";

const DESCRIPTION = `Ageless: ${LYFE_EVENT.proposition.toLowerCase()}. An evening hosted by ${LYFE_EVENT.host} on ${LYFE_EVENT.date} at ${LYFE_EVENT.venueName}, on how modern science is changing the way we look, feel, perform and live as we age.`;

// Absolute, so the tab and the link preview say Medlyfe rather than inheriting
// the Lyfe Plastics template from the layout.
export const metadata: Metadata = {
  title: { absolute: `Ageless | ${MEDLYFE_NAME}` },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: MEDLYFE_NAME,
    title: `Ageless: ${LYFE_EVENT.proposition}`,
    description: DESCRIPTION,
  },
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
 * Purely Medlyfe's evening from 8 October 2026, in Medlyfe's livery
 * throughout. Dr Kpaduwa is no longer part of it, so the fireside, the
 * consultation offers and the Lyfe Plastics section have gone, and the face of
 * the page is Medlyfe's own Head of Medicals, who opens the evening.
 *
 * Still no hero video and nothing heavier than it needs to be: 86 per cent of
 * Nigerian traffic is mobile at about 15 Mbps and data costs 575 naira a
 * gigabyte. The images are the speakers' portraits and nothing else.
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
  // One job.
  const go = "EVENT_RSVP" as const;

  return (
    <div style={{ background: MB.green, color: MB.mist, fontFamily: sans }}>
      <LyfeNav on="event" />
      <Hero />
      <Evening />
      <Panel />
      <WhatYouLeaveWith />
      <Rsvp utm={utm} initialIntent={go} />
      <AboutGroup tone="dark" items={MEDLYFE_ABOUT} />
      <Footer />
      <StickyRsvp />
    </div>
  );
}

/* ─── brand furniture ──────────────────────────────────────────────────────── */

function Section({
  children,
  bg = MB.green,
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

function RsvpButton({ children = "Register your interest" }: { children?: React.ReactNode }) {
  return (
    <a
      href="?go=rsvp#enquire"
      className="inline-block rounded-xl px-9 text-sm font-semibold transition hover:opacity-90"
      style={{ background: MB.lime, color: MB.greenDeep, paddingTop: 17, paddingBottom: 17 }}
    >
      {children}
    </a>
  );
}

/** The opening address. She is Medlyfe's clinical lead, so she fronts the page. */
const HOST = LYFE_PANEL[0];

/**
 * A portrait in an arch, with the foot faded into the ground. A niche reads as
 * a portrait that belongs in the page; a rectangle reads as a photograph
 * dropped on top of one.
 */
function ArchPortrait({ w = 300, priority = false }: { w?: number; priority?: boolean }) {
  if (!HOST.portrait) return null;
  return (
    <div className="relative" style={{ width: w, maxWidth: "100%" }}>
      <div
        className="overflow-hidden"
        style={{
          borderTopLeftRadius: 9999,
          borderTopRightRadius: 9999,
          background: MB.greenDeep,
          WebkitMaskImage: "linear-gradient(to bottom, #000 70%, transparent 99%)",
          maskImage: "linear-gradient(to bottom, #000 70%, transparent 99%)",
          aspectRatio: "0.8",
        }}
      >
        <Image
          src={HOST.portrait}
          alt={HOST.name ?? MEDLYFE_NAME}
          width={HOST.portraitWidth ?? 800}
          height={HOST.portraitHeight ?? 1000}
          priority={priority}
          sizes="(max-width: 768px) 72vw, 340px"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
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
      style={{ background: `linear-gradient(168deg, ${MB.green} 0%, ${MB.greenDeep} 60%, #0E1C15 100%)` }}
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
            <Eyebrow>Hosted by {MEDLYFE_NAME}</Eyebrow>

            <h1
              className="mt-6 text-[68px] leading-[0.95] md:text-[112px]"
              style={{
                fontFamily: display,
                fontWeight: 500,
                color: MB.white,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {LYFE_EVENT.theme}
            </h1>

            <p
              className="mt-6 text-[20px] leading-snug md:text-[27px]"
              style={{ fontFamily: display, fontWeight: 500, color: MB.white }}
            >
              {LYFE_EVENT.proposition}
            </p>

            <p
              className="mt-4 max-w-lg text-[17px] leading-relaxed md:text-[18px]"
              style={{ color: MB.limeSoft, fontFamily: display, fontStyle: "italic" }}
            >
              {LYFE_EVENT.standfirst}
            </p>

            <div className="mt-9">
              <Rule />
            </div>

            <dl className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              <Fact k="Date" v={LYFE_EVENT.date} />
              <Fact k="Arrival" v={LYFE_EVENT.arrival} />
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
              <span className="text-[14px]" style={{ color: MB.greenSoft }}>
                An intimate evening for {LYFE_EVENT.places}. Register your interest by{" "}
                {LYFE_EVENT.rsvpBy} and we will come back to you.
              </span>
            </div>

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
    <Section bg={MB.greenDeep} id="evening">
      <div className="max-w-2xl">
        <Eyebrow>The evening</Eyebrow>
        <h2
          className="mt-5 text-[32px] leading-[1.14] md:text-[44px]"
          style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
        >
          Ageing is not simply about how we look, or how long we live.
        </h2>
        <p className="mt-6 text-[17px] leading-relaxed" style={{ color: MB.mist }}>
          It is about how we feel, how we function, how we perform, and how we go on looking and
          living as we age. Ageless brings health, beauty and longevity into one conversation:
          metabolic health, hormones, weight, energy, performance, skin, regenerative aesthetics
          and aesthetic medicine, with the clinicians who work in all of it.
        </p>
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: MB.mist }}>
          Less a medical conference than an evening salon. Intimate, elegant and conversational,
          for {LYFE_EVENT.places} guests rather than an auditorium.
        </p>
      </div>

      <ol className="mt-14 border-t" style={{ borderColor: `${MB.lime}33` }}>
        {LYFE_EVENT_PROGRAMME.map((item) => (
          <li
            key={item.title}
            className="grid gap-x-8 gap-y-2 border-b py-6 md:grid-cols-[86px_1fr]"
            style={{ borderColor: `${MB.lime}22` }}
          >
            <span
              className="text-[14px] font-semibold tabular-nums"
              style={{ color: MB.lime, letterSpacing: "0.02em" }}
            >
              {item.time}
            </span>
            <div>
              <h3 className="text-[18px] font-semibold" style={{ color: MB.white }}>
                {item.title}
              </h3>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed" style={{ color: "#AFC2B4" }}>
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-wrap items-center gap-6">
        <RsvpButton />
        <span className="text-[14px]" style={{ color: MB.greenSoft }}>
          {LYFE_EVENT.date} &middot; {LYFE_EVENT.venueName}
        </span>
      </div>
    </Section>
  );
}

/* ─── the panel ────────────────────────────────────────────────────────────── */

/**
 * An empty seat, drawn rather than left blank. The arch matches the portraits
 * so the row still reads as a row, and the subject is named so a guest can
 * see the ground is covered before the name is.
 */
function EmptySeat({ w = 190 }: { w?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: w,
        aspectRatio: "0.8",
        maxWidth: "100%",
        borderTopLeftRadius: 9999,
        borderTopRightRadius: 9999,
        background: `linear-gradient(180deg, ${MB.green} 0%, ${MB.greenDeep} 100%)`,
        border: `1px solid ${MB.lime}33`,
        borderBottom: "none",
      }}
    >
      <svg width={w * 0.2} height={w * 0.26} viewBox="0 0 59 73" fill={MB.lime} opacity={0.22} aria-hidden>
        <rect x="0" y="12" width="15" height="48" rx="7.5" />
        <circle cx="29.5" cy="10" r="10.5" />
        <rect x="22" y="27" width="15" height="46" rx="7.5" />
        <rect x="44" y="12" width="15" height="47" rx="7.5" />
      </svg>
    </div>
  );
}

function Panel() {
  return (
    <Section bg={MB.green}>
      <div className="max-w-2xl">
        <Eyebrow>The panel</Eyebrow>
        <h2
          className="mt-5 text-[30px] leading-[1.14] md:text-[42px]"
          style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
        >
          {LYFE_EVENT.panelTitle}
        </h2>
        <p className="mt-5 text-[16px] leading-relaxed" style={{ color: MB.mist }}>
          {LYFE_EVENT.panelStandfirst} The evening opens on the range of what is now possible,
          and the panel takes it from there, with every answer ending in something you can act
          on.
        </p>
      </div>

      <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {LYFE_PANEL.map((seat, i) => (
          <div key={`${seat.seat}-${seat.name ?? i}`}>
            {seat.portrait ? (
              <div style={{ width: 190, maxWidth: "100%" }}>
                <div
                  className="overflow-hidden"
                  style={{
                    borderTopLeftRadius: 9999,
                    borderTopRightRadius: 9999,
                    background: MB.greenDark,
                    aspectRatio: "0.8",
                  }}
                >
                  <Image
                    src={seat.portrait}
                    alt={seat.name ?? seat.seat}
                    width={seat.portraitWidth ?? 800}
                    height={seat.portraitHeight ?? 1000}
                    sizes="190px"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
              </div>
            ) : (
              <EmptySeat />
            )}

            <p
              className="mt-5 text-[10.5px] font-semibold uppercase"
              style={{ color: MB.lime, letterSpacing: "0.15em" }}
            >
              {seat.seat}
            </p>
            <p className="mt-2 text-[17px] font-semibold" style={{ color: MB.white }}>
              {seat.name ?? "To be announced"}
            </p>
            {seat.title && (
              <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: MB.mist }}>
                {seat.title}
              </p>
            )}
            {seat.subject && (
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "#AFC2B4" }}>
                {seat.subject}
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── what you leave with ──────────────────────────────────────────────────── */

function WhatYouLeaveWith() {
  return (
    <Section bg={MB.greenDeep}>
      <Eyebrow>What you leave understanding</Eyebrow>
      <h2
        className="mt-5 max-w-2xl text-[30px] leading-[1.14] md:text-[40px]"
        style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
      >
        The goal is not to become someone else.
      </h2>

      <div className="mt-12 grid gap-x-14 gap-y-9 md:grid-cols-2">
        {LYFE_EVENT_TAKEAWAYS.map((l) => (
          <div key={l.title}>
            <h3 className="text-[17px] font-semibold" style={{ color: MB.white }}>
              {l.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "#AFC2B4" }}>
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
  initialIntent: "EVENT_RSVP" | "CONSULTATION" | null;
}) {
  return (
    <Section bg={MB.green} id="enquire">
      <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <Eyebrow>Register your interest</Eyebrow>
          <h2
            className="mt-5 text-[30px] leading-[1.14] md:text-[42px]"
            style={{ fontFamily: display, fontWeight: 600, color: MB.white, letterSpacing: "-0.02em" }}
          >
            We would be glad to consider you.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: MB.mist }}>
            The room holds {LYFE_EVENT.places}, which is fewer than the number of people who
            would like to be in it. Tell us you are interested and we will come back to you either
            way. An invitation carries a link of your own, and your place is held when you use it.
          </p>

          <div className="mt-9">
            <Rule width={140} />
          </div>

          <dl className="mt-8 grid gap-4">
            <Fact k="Date" v={LYFE_EVENT.date} />
            <Fact
              k="Time"
              v={`Arrival ${LYFE_EVENT.arrival}, programme ${LYFE_EVENT.programme}, close ${LYFE_EVENT.close}`}
            />
            <Fact k="Venue" v={LYFE_EVENT.venueName} />
          </dl>

          <p className="mt-10 text-[14px] leading-relaxed" style={{ color: MB.greenSoft }}>
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
              href={whatsappLink(`Hello, I would like to register my interest in the evening on ${LYFE_EVENT.date}.`)}
              className="font-semibold underline underline-offset-4"
              style={{ color: MB.limeSoft }}
            >
              send a WhatsApp message
            </a>
            .
          </p>
        </div>

        <EnquiryForm utm={utm} initialIntent={initialIntent} slots={[]} lock />
      </div>
    </Section>
  );
}

/* ─── footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ background: MB.greenDeep }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-14 pb-28 md:px-8 md:pb-20">
        <Lockup size={0.9} />
        <div
          className="mt-10 grid gap-8 text-[13px] leading-relaxed md:grid-cols-2"
          style={{ color: MB.greenSoft }}
        >
          <div>
            <p style={{ color: MB.mist }}>
              {LYFE_EVENT.host}. Consultations and treatment are provided at the clinic by
              clinicians registered with the Medical and Dental Council of Nigeria.
            </p>
          </div>
          <div>
            <p>
              Nothing on this page is a diagnosis, a recommendation or a promise of a result. All
              treatment carries risk. Whether any treatment is appropriate for you is a clinical
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
