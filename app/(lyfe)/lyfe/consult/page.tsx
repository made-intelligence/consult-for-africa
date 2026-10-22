import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  LYFE_BRAND as C,
  LYFE_BOOKING_DISPLAY,
  LYFE_BOOKING_WHATSAPP,
  LYFE_CONSULT,
  LYFE_CONSULT_OPTIONS,
  LYFE_PROCEDURES,
  LYFE_CONSULT_FAQ,
  LYFE_CONSULT_SCHEDULE,
  LYFE_NAME,
  LYFE_PHONE_DISPLAY,
  LYFE_SOCIAL,
  MEDLYFE_BRAND as MB,
  MEDLYFE_NAME,
  LYFE_SURGEON,
  consultSlots,
  whatsappLink,
} from "@/lib/lyfe";
import EnquiryForm from "../EnquiryForm";
import LyfeNav from "../LyfeNav";
import AboutGroup from "../AboutGroup";
import { AGELESS_FILMS } from "@/lib/ageless-followup";

/** What anybody weighs before booking a clinic they have not used. */
const PROOF = [
  { stat: "Licensed centre", line: "MedLYFE Wellness and Longevity Centre, 25 Admiralty Way, Lekki Phase 1" },
  { stat: "Physician led", line: "Clinical work led by Dr Adedotun Ajelabi, Consultant Family Physician, FWACP" },
  { stat: "ABPS, FACS", line: "Plastic surgery with Dr Chinwe Kpaduwa, board certified in the United States" },
  { stat: "Medbury Healthcare Group", line: "Part of a Lagos healthcare group, not a standalone clinic" },
];

const SITE = "https://www.consultforafrica.com";
const URL = `${SITE}/lyfe/consult`;

const TITLE = "Consultations at MedLYFE, Lekki, Lagos";
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

  const fromAgeless = utm.source === "ageless";

  return (
    <div style={{ background: C.ground, color: C.body, fontFamily: sans }}>
      <LyfeNav on="consult" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {fromAgeless && (
        <div style={{ background: MB.lime }}>
          <p className="mx-auto w-full max-w-5xl px-6 py-3 text-[14px] md:px-10" style={{ color: MB.greenDeep }}>
            <strong>AGELESS guests:</strong> enter your voucher details when you book.
          </p>
        </div>
      )}

      {/* ── MedLYFE first ─────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20" style={{ background: MB.green }}>
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div>
            <p className="text-[10.5px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.2em" }}>
              {MEDLYFE_NAME}
            </p>
            <h1
              className="mt-6 text-[40px] leading-[1.04] md:text-[58px]"
              style={{ fontFamily: display, fontWeight: 500, color: MB.white, letterSpacing: "-0.02em" }}
            >
              Book a consultation at MedLYFE.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: MB.mist }}>
              Longevity and preventive health, metabolism and hormones, skin and aesthetics, and
              plastic surgery with Dr Chinwe Kpaduwa, at our licensed centre in Lekki. Tell us what
              you need and a coordinator will arrange the right appointment.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="#book" className="rounded-xl px-8 py-4 text-[15px] font-semibold" style={{ background: MB.lime, color: MB.greenDeep }}>
                Request a consultation
              </a>
              <a href="#options" className="text-[15px] font-semibold underline underline-offset-4" style={{ color: MB.lime }}>
                See our consultations
              </a>
            </div>
            <p className="mt-6 text-[14.5px] leading-snug" style={{ color: MB.greenSoft }}>
              Or call or WhatsApp{" "}
              <a href={`https://wa.me/${LYFE_BOOKING_WHATSAPP}`} className="font-semibold underline underline-offset-4" style={{ color: MB.white }}>
                {LYFE_BOOKING_DISPLAY}
              </a>
              . Nothing is taken on this page.
            </p>
          </div>
          <figure className="m-0">
            <video
              controls
              playsInline
              preload="none"
              poster={AGELESS_FILMS.medlyfe.poster}
              className="w-full rounded-2xl"
              style={{ aspectRatio: "16 / 9", background: "#000" }}
            >
              <source src={AGELESS_FILMS.medlyfe.src} type="video/mp4" />
            </video>
            <figcaption className="mt-3 text-[13.5px]" style={{ color: MB.greenSoft }}>
              {AGELESS_FILMS.medlyfe.line}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── what anybody weighs ───────────────────────────────────────── */}
      <section style={{ background: MB.greenDeep }} className="px-6 py-12 md:px-10">
        <dl className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF.map((p) => (
            <div key={p.stat}>
              <dt className="text-[19px]" style={{ fontFamily: display, fontWeight: 600, color: MB.white }}>
                {p.stat}
              </dt>
              <dd className="mt-1.5 text-[13.5px] leading-snug" style={{ color: MB.greenSoft }}>
                {p.line}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── what you can actually book ───────────────────────────────── */}
      <section id="options" style={{ background: C.groundWarm }} className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[27px] leading-tight md:text-[34px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink }}
          >
            Our consultations.
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.body }}>
            Most people start with a longevity and preventive health
            consultation. If you are unsure which to choose, tell us what you
            need and we will advise.
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
                    <a
                      href="#book"
                      className="inline-block px-6 py-3 text-[14.5px] font-semibold"
                      style={
                        bookable
                          ? { background: C.ink, color: C.ground }
                          : { background: "transparent", color: C.ink, border: `1px solid ${C.ink}` }
                      }
                    >
                      Request a consultation
                    </a>
                    <p className="mt-3 text-[13.5px] leading-snug" style={{ color: C.muted }}>
                      {o.fee ? `${o.fee}. ${o.meta}` : o.meta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── what a first appointment is ──────────────────────────────── */}
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            Your first appointment.
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Your history",
                b: "The clinician discusses your health, your concerns and your goals. Bring any recent test results if you have them.",
              },
              {
                n: "02",
                t: "Assessment",
                b: "Where needed, we carry out tests such as blood work, body composition, blood pressure or a skin assessment. Nothing is done without your agreement.",
              },
              {
                n: "03",
                t: "Your plan",
                b: "You receive a written plan with recommended treatment, timing and costs. If no treatment is needed, we will tell you.",
              },
            ].map((x) => (
              <div key={x.n}>
                <p className="text-[13px] font-semibold" style={{ color: MB.greenSoft, letterSpacing: "0.1em" }}>
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
        </div>
      </section>

      {/* ── the booking ───────────────────────────────────────────────── */}
      <section id="book" className="px-6 py-16 md:px-10 md:py-24" style={{ background: C.groundWarm }}>
        <div className="mx-auto w-full max-w-5xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            Request a consultation.
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.body }}>
            Tell us which of the four and what you are thinking about. A
            coordinator calls you, arranges the time and tells you what it
            costs before anything is booked. Nothing is taken here.
            {fromAgeless ? " If you were at AGELESS, add your voucher below." : ""}
          </p>
          <div className="mt-10">
            <EnquiryForm utm={utm} initialIntent="CONSULTATION" slots={slots} voucher={fromAgeless} />
          </div>
        </div>
      </section>

      {/* ── plastic surgery, one route among four ─────────────────────── */}
      <section id="surgery" className="px-6 py-16 md:px-10 md:py-24" style={{ background: C.ink }}>
        <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <div className="overflow-hidden" style={{ borderTopLeftRadius: 9999, borderTopRightRadius: 9999, background: C.inkSoft }}>
              <Image
                src={LYFE_SURGEON.portrait}
                alt={`${LYFE_SURGEON.name}, board certified plastic surgeon`}
                width={LYFE_SURGEON.portraitWidth}
                height={LYFE_SURGEON.portraitHeight}
                sizes="(max-width: 768px) 70vw, 340px"
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
            <p className="mt-5 text-[15px] font-semibold" style={{ color: C.ground }}>
              {LYFE_SURGEON.name}
            </p>
            <ul className="mt-2.5 space-y-1">
              {LYFE_SURGEON.credentials.map((c) => (
                <li key={c} className="text-[13.5px] leading-snug" style={{ color: "#B6B8C0" }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase" style={{ color: C.bronze, letterSpacing: "0.2em" }}>
              Plastic surgery at MedLYFE
            </p>
            <h2 className="mt-5 text-[30px] leading-tight md:text-[40px]" style={{ fontFamily: display, fontWeight: 600, color: C.ground }}>
              Thirty minutes with a plastic surgeon.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed" style={{ color: "#C9CBD2" }}>
              {LYFE_CONSULT.blurb}
            </p>
            <p className="mt-5 text-[15px]" style={{ color: C.bronze }}>
              {LYFE_CONSULT.feeDisplay}, in person or by video. {LYFE_CONSULT.feeNote}{" "}
              {open > 0
                ? `${open} appointment${open === 1 ? "" : "s"} open. ${LYFE_CONSULT_SCHEDULE}.`
                : "Her diary is full. Ask to be told when a half hour is released."}
            </p>
            <div className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {LYFE_PROCEDURES.map((p) => (
                <div key={p.group} className="border-t pt-4" style={{ borderColor: "#3A3C44" }}>
                  <h3 className="text-[16px] font-semibold" style={{ color: C.ground }}>
                    {p.group}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "#B6B8C0" }}>
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
            <a href="#book" className="mt-10 inline-block px-8 py-4 text-[15px] font-semibold" style={{ background: C.bronze, color: C.ink }}>
              Book with Dr Kpaduwa
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <h2
            className="text-[28px] leading-tight md:text-[38px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            Questions about surgery
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
            <a href="#book" className="rounded-xl px-8 py-4 text-[15px] font-semibold" style={{ background: MB.greenDeep, color: "#fff" }}>
              Request a consultation
            </a>
            <a
              href={whatsappLink("Hello MedLYFE, I would like to book a consultation.")}
              className="text-[15px] font-semibold underline underline-offset-4"
              style={{ color: MB.greenDeep }}
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
            {MEDLYFE_NAME} &middot; {LYFE_PHONE_DISPLAY}
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
