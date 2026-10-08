import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  LYFE_BRAND as C,
  LYFE_CONSULT,
  LYFE_CONSULT_OPTIONS,
  LYFE_CONSULT_FAQ,
  LYFE_CONSULT_PROOF,
  LYFE_CONSULT_SCHEDULE,
  LYFE_NAME,
  LYFE_PHONE_DISPLAY,
  LYFE_SOCIAL,
  LYFE_SURGEON,
  consultSlots,
  whatsappLink,
} from "@/lib/lyfe";
import EnquiryForm from "../EnquiryForm";
import LyfeNav from "../LyfeNav";
import AboutGroup from "../AboutGroup";

const SITE = "https://www.consultforafrica.com";
const URL = `${SITE}/lyfe/consult`;

const TITLE = "Consultations at Medlyfe, Lagos";
const DESCRIPTION =
  "Longevity and preventive health, metabolism and hormones, skin and aesthetic medicine, and plastic surgery with Dr Chinwe Kpaduwa, MD FACS, board certified by the American Board of Plastic Surgery. Lagos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: [
    "plastic surgeon Lagos",
    "board certified plastic surgeon Nigeria",
    "cosmetic surgery Lagos",
    "dermatology consultation Lagos",
    "mummy makeover Lagos",
    "breast surgery Lagos",
    "tummy tuck Lagos",
    "Dr Chinwe Kpaduwa",
  ],
  openGraph: {
    type: "website",
    url: URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: LYFE_NAME,
    locale: "en_NG",
    images: [{ url: `${SITE}${LYFE_SURGEON.portrait}`, width: LYFE_SURGEON.portraitWidth, height: LYFE_SURGEON.portraitHeight, alt: LYFE_SURGEON.name }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

const display = "var(--lyfe-display), Georgia, serif";
const sans = "var(--lyfe-sans), system-ui, sans-serif";

/**
 * The booking page. Bottom of funnel and nothing else.
 *
 * Everybody who lands here is already considering surgery and is choosing
 * between surgeons. So there is no explanation of what a procedure is, no
 * gallery, and exactly one action repeated at every scroll depth. The only
 * numbers on the page are ones the database can stand behind, because faked
 * scarcity in this market is detected and reverses the effect it reaches for.
 *
 * Indexed, unlike the event page, because the commercial queries here are the
 * point. Structured data covers the physician, the offer and the questions,
 * which is what earns the rich result rather than the blue link.
 */
export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; utm_medium?: string; utm_campaign?: string; src?: string }>;
}) {
  const sp = await searchParams;
  const utm = {
    // Any ?src= tag lands in utmSource, so a flyer, a WhatsApp group, a salon
    // and a referring doctor are all separable afterwards. A channel you
    // cannot count is a channel you cannot argue for next time.
    source: sp.utm_source?.slice(0, 100) ?? sp.src?.slice(0, 40) ?? null,
    medium: sp.utm_medium?.slice(0, 100) ?? null,
    campaign: sp.utm_campaign?.slice(0, 100) ?? null,
  };

  const sold = await prisma.lyfeEnquiry
    .findMany({
      where: { paidAt: { not: null }, slotAt: { gte: new Date() } },
      select: { slotAt: true },
    })
    .catch(() => []);
  const slots = consultSlots({ taken: sold.map((r) => r.slotAt!.toISOString()) });
  const open = slots.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Physician",
        "@id": `${URL}#physician`,
        name: LYFE_SURGEON.name,
        medicalSpecialty: "PlasticSurgery",
        url: URL,
        image: `${SITE}${LYFE_SURGEON.portrait}`,
        telephone: LYFE_PHONE_DISPLAY,
        areaServed: { "@type": "City", name: "Lagos", containedInPlace: { "@type": "Country", name: "Nigeria" } },
        availableService: {
          "@type": "MedicalProcedure",
          name: "Plastic and reconstructive surgery consultation",
        },
        ...(LYFE_SOCIAL.length ? { sameAs: LYFE_SOCIAL.map((s) => s.url) } : {}),
      },
      {
        "@type": "Service",
        "@id": `${URL}#service`,
        name: LYFE_CONSULT.label,
        provider: { "@id": `${URL}#physician` },
        areaServed: { "@type": "Country", name: "Nigeria" },
        offers: {
          "@type": "Offer",
          price: String(LYFE_CONSULT.fee),
          priceCurrency: "NGN",
          availability: open > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          url: URL,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${URL}#faq`,
        mainEntity: LYFE_CONSULT_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div style={{ background: C.ground, color: C.body, fontFamily: sans }}>
      <LyfeNav on="consult" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── the offer ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20">
        <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
          <div>
            <p
              className="text-[10.5px] font-semibold uppercase"
              style={{ color: C.bronze, letterSpacing: "0.2em" }}
            >
              {LYFE_NAME}
            </p>

            <h1
              className="mt-6 text-[38px] leading-[1.04] md:text-[56px]"
              style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.025em" }}
            >
              Start with the right appointment.
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: C.body }}>
              Medlyfe covers longevity and preventive health, metabolism, weight
              and hormones, skin and aesthetic medicine, and surgery. Four
              different conversations, and the one you need is often not the one
              you came for. Tell us what you are thinking about and we will say
              which it is.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="#options"
                className="px-8 py-4 text-[15px] font-semibold"
                style={{ background: C.ink, color: C.ground }}
              >
                See the four
              </a>
              <a
                href="#book"
                className="text-[15px] font-semibold underline underline-offset-4"
                style={{ color: C.bronzeDeep }}
              >
                Book Dr Kpaduwa, {LYFE_CONSULT.feeDisplay}
              </a>
            </div>

            <p className="mt-6 text-[14.5px]" style={{ color: C.bronzeDeep }}>
              {open > 0
                ? `${open} appointment${open === 1 ? "" : "s"} open between now and the end of her diary. ${LYFE_CONSULT_SCHEDULE}.`
                : `Her diary is full. Ask to be told when a half hour is released.`}
            </p>
          </div>

          <div>
            <div
              className="overflow-hidden"
              style={{ borderTopLeftRadius: 9999, borderTopRightRadius: 9999, background: C.groundDeep }}
            >
              <Image
                src={LYFE_SURGEON.portrait}
                alt={`${LYFE_SURGEON.name}, board certified plastic surgeon`}
                width={LYFE_SURGEON.portraitWidth}
                height={LYFE_SURGEON.portraitHeight}
                priority
                sizes="(max-width: 768px) 70vw, 340px"
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
            <p className="mt-5 text-[15px] font-semibold" style={{ color: C.ink }}>
              {LYFE_SURGEON.name}
            </p>
            <ul className="mt-2 space-y-1">
              {LYFE_SURGEON.credentials.map((c) => (
                <li key={c} className="text-[13.5px] leading-snug" style={{ color: C.body }}>
                  {c}
                </li>
              ))}
            </ul>
            {LYFE_SOCIAL.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {LYFE_SOCIAL.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    rel="me noopener"
                    target="_blank"
                    className="text-[13px] font-semibold underline underline-offset-4"
                    style={{ color: C.bronzeDeep }}
                  >
                    {s.label} {s.handle}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── what you can actually book ───────────────────────────────── */}
      <section id="options" style={{ background: C.groundWarm }} className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[27px] leading-tight md:text-[34px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink }}
          >
            Four consultations.
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.body }}>
            Most people need the first or the third. Say what you are thinking
            about and we will tell you which, including when the answer is that
            you do not need an appointment at all.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {LYFE_CONSULT_OPTIONS.map((o) => {
              const bookable = o.fee !== null;
              return (
                <div
                  key={o.key}
                  className="flex flex-col p-7"
                  style={{
                    background: C.ground,
                    border: `1px solid ${bookable ? C.bronze : C.line}`,
                  }}
                >
                  <h3 className="text-[19px] leading-snug" style={{ fontFamily: display, fontWeight: 600, color: C.ink }}>
                    {o.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-snug" style={{ color: C.bronzeDeep }}>
                    {o.who}
                  </p>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed" style={{ color: C.body }}>
                    {o.body}
                  </p>
                  <div className="mt-6">
                    {bookable ? (
                      <>
                        <a
                          href="#book"
                          className="inline-block px-6 py-3 text-[14.5px] font-semibold"
                          style={{ background: C.ink, color: C.ground }}
                        >
                          Book for {o.fee}
                        </a>
                        <p className="mt-3 text-[13.5px] leading-snug" style={{ color: C.muted }}>
                          {o.meta}
                        </p>
                      </>
                    ) : (
                      <>
                        <a
                          href="#book"
                          className="inline-block px-6 py-3 text-[14.5px] font-semibold"
                          style={{ background: "transparent", color: C.ink, border: `1px solid ${C.ink}` }}
                        >
                          Ask about this
                        </a>
                        <p className="mt-3 text-[13.5px] leading-snug" style={{ color: C.muted }}>
                          {o.meta}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── the four things a buyer weighs ────────────────────────────── */}
      <section style={{ background: C.ink }} className="px-6 py-12 md:px-10">
        <dl className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {LYFE_CONSULT_PROOF.map((p) => (
            <div key={p.stat}>
              <dt
                className="text-[20px]"
                style={{ fontFamily: display, fontWeight: 600, color: C.ground }}
              >
                {p.stat}
              </dt>
              <dd className="mt-1.5 text-[13.5px] leading-snug" style={{ color: "#A8A69F" }}>
                {p.line}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── what the half hour actually is ───────────────────────────── */}
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            What happens in the thirty minutes.
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "You talk first",
                b: "What you have been thinking about, how long for, and what you would want to be different. You do not need photographs, the right words, or a decision.",
              },
              {
                n: "02",
                t: "She tells you what is actually involved",
                b: "What the procedure is, what recovery really looks like in Lagos, and what she would and would not do in your case. She does not discuss fees on the call; that comes from the team afterwards, in writing.",
              },
              {
                n: "03",
                t: "You leave knowing where you stand",
                b: "Either a plan, or the reason not to. If the honest answer is to leave it alone, that is the answer you get, and the half hour has still bought you it. A written costing follows from the team if you want one.",
              },
            ].map((x) => (
              <div key={x.n}>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: C.bronze, letterSpacing: "0.1em" }}
                >
                  {x.n}
                </p>
                <h3 className="mt-3 text-[17.5px] font-semibold" style={{ color: C.ink }}>
                  {x.t}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.body }}>
                  {x.b}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 border-t pt-10 md:grid-cols-2" style={{ borderColor: C.line }}>
            <div>
              <h3 className="text-[16px] font-semibold" style={{ color: C.ink }}>
                Book this if
              </h3>
              <ul className="mt-3 space-y-2">
                {[
                  "You are seriously considering a procedure and want a straight answer before you commit",
                  "You have been quoted elsewhere and want a second, qualified opinion",
                  "You are weighing travelling abroad against being treated here",
                  "You have had surgery before and are living with the result",
                ].map((i) => (
                  <li key={i} className="text-[14.5px] leading-relaxed" style={{ color: C.body }}>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold" style={{ color: C.ink }}>
                Do not book this if
              </h3>
              <ul className="mt-3 space-y-2">
                {[
                  "You are looking for a price list. Ask us on WhatsApp and we will send what we can",
                  "You want reassurance rather than an assessment. She will give you the second",
                  "You need urgent medical attention. Go to a hospital, not a video call",
                ].map((i) => (
                  <li key={i} className="text-[14.5px] leading-relaxed" style={{ color: C.muted }}>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── the booking ───────────────────────────────────────────────── */}
      <section id="book" className="px-6 py-16 md:px-10 md:py-24" style={{ background: C.groundWarm }}>
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            Choose your half hour.
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.body }}>
            {LYFE_CONSULT.note} The time is held once the fee is paid and not before, because there
            are only {LYFE_CONSULT.perWeek} of these in a week and holding one open costs somebody
            else theirs.
          </p>
          <div className="mt-10">
            <EnquiryForm utm={utm} initialIntent="CONSULTATION" slots={slots} />
          </div>
        </div>
      </section>

      {/* ── the questions that decide it ──────────────────────────────── */}
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            The questions people ask last.
          </h2>
          <div className="mt-10 divide-y" style={{ borderColor: C.line }}>
            {LYFE_CONSULT_FAQ.map((f) => (
              <div key={f.q} className="py-7 first:pt-0">
                <h3 className="text-[17.5px] font-semibold" style={{ color: C.ink }}>
                  {f.q}
                </h3>
                <p className="mt-2.5 text-[15.5px] leading-relaxed" style={{ color: C.body }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#book"
              className="px-8 py-4 text-[15px] font-semibold"
              style={{ background: C.ink, color: C.ground }}
            >
              Book for {LYFE_CONSULT.feeDisplay}
            </a>
            <a
              href={whatsappLink(
                `Hello, I would like to book a consultation with ${LYFE_SURGEON.shortName}.`,
              )}
              className="text-[15px] font-semibold underline underline-offset-4"
              style={{ color: C.bronzeDeep }}
            >
              Or message us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <AboutGroup tone="light" />

      <footer className="px-6 py-10 md:px-10" style={{ background: C.ink }}>
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[13px]" style={{ color: "#8C8A84" }}>
            {LYFE_NAME} &middot; {LYFE_PHONE_DISPLAY}
          </p>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed" style={{ color: "#6F6D68" }}>
            Nothing on this page is clinical advice, a diagnosis, or a promise of a result. No
            procedure is recommended without a consultation, and the clinical decision rests with
            the registered clinician who sees you.
          </p>
        </div>
      </footer>
    </div>
  );
}
