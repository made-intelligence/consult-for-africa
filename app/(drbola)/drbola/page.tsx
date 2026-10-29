import Image from "next/image";
import Link from "next/link";
import {
  CREDENTIALS,
  DOCTOR_HEADLINE,
  DOCTOR_PROMISES,
  DRBOLA,
  DRBOLA_SITE_URL,
  LOCATIONS,
  OUTCOME_NOTE,
  SERVICES,
  TESTIMONIAL,
  XRAYS,
  href,
  mapsLink,
} from "@/lib/drbola";
import { Button, Confirm, Container, Eyebrow, H2, serif } from "@/components/drbola/ui";
import { OSTEON_FIELD, OSTEON_FIELD_LIGHT, OsteonRings } from "@/components/drbola/Osteon";

/**
 * Home. One claim, proved fast: he fixes what others could not. The X-rays do
 * the proving. The warmth is in the second voice on the page, the patient who
 * was told amputation and walked out instead.
 */

const schema = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: DRBOLA.name,
  url: DRBOLA_SITE_URL,
  image: `${DRBOLA_SITE_URL}/drbola/portrait.webp`,
  medicalSpecialty: ["Orthopedic", "Surgical"],
  description:
    "President of the Arthroplasty Society of Nigeria. Consultant orthopaedic and reconstructive surgeon specialising in revision hip and knee replacement, bone and joint infection and complex trauma in Lagos and Abuja.",
  telephone: `+${DRBOLA.whatsapp}`,
  email: DRBOLA.email,
  sameAs: [DRBOLA.linkedin],
  hasCredential: ["FRCS (Tr. & Orth.)", "MPH", "MBBS"],
  location: LOCATIONS.map((l) => ({
    "@type": "MedicalClinic",
    name: l.name,
    address: { "@type": "PostalAddress", streetAddress: l.address, addressCountry: "NG" },
  })),
};

export default function DrBolaHome() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundImage: OSTEON_FIELD }}>
        <Container className="grid items-center gap-10 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:pb-20">
            <Eyebrow>Revision hip and knee surgeon · Lagos and Abuja</Eyebrow>
            <h1
              style={serif}
              className="mt-5 text-[44px] font-medium leading-[1.02] tracking-tight text-(--db-ink) sm:text-6xl lg:text-7xl"
            >
              I fix what others can&rsquo;t.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-(--db-body)">
              Failed replacements. Infected joints. Fractures that won&rsquo;t heal. UK trained. President of the
              Arthroplasty Society of Nigeria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/second-opinion">
                <Confirm note="that second opinions on X-rays are free, and who reviews them">Free second opinion</Confirm>
              </Button>
              <Button to="/book" variant="ghost">
                Book a consultation
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md self-end">
            <OsteonRings className="absolute left-1/2 top-[42%] w-[130%] -translate-x-1/2 -translate-y-1/2 text-(--db-gold) opacity-25" />
            <Image
              src="/drbola/portrait.webp"
              alt={DRBOLA.name}
              width={900}
              height={837}
              priority
              sizes="(min-width: 1024px) 448px, 90vw"
              className="relative"
            />
          </div>
        </Container>
      </section>

      {/* Credentials */}
      <section className="border-y border-(--db-line) bg-white">
        <Container className="grid grid-cols-2 gap-x-6 gap-y-5 py-7 sm:grid-cols-3 lg:grid-cols-5">
          {CREDENTIALS.map((c) => (
            <div key={c.title}>
              <div style={serif} className="text-lg text-(--db-ink)">
                {c.title}
              </div>
              <div className="mt-0.5 text-[12.5px] leading-snug text-(--db-muted)">{c.detail}</div>
            </div>
          ))}
        </Container>
      </section>

      {/* Proof */}
      <section className="py-20">
        <Container>
          <Eyebrow>Before and after</Eyebrow>
          <H2 className="mt-3">Put right.</H2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {XRAYS.map((x) => (
              <figure key={x.src} className="flex flex-col overflow-hidden rounded-2xl bg-(--db-ink)">
                <Image src={x.src} alt={`${x.title}, before and after`} width={x.w} height={x.h} sizes="(min-width: 768px) 33vw, 100vw" />
                <figcaption className="flex-1 px-5 py-4">
                  <div className="text-[15px] font-medium text-white">{x.title}</div>
                  <div className="mt-0.5 text-[13px] text-white/60">{x.caption}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-xs text-(--db-muted)">
            <Confirm note="patients consented to these images being published">Images shared with patient consent.</Confirm>
          </p>
        </Container>
      </section>

      {/* The patient's voice */}
      <section className="relative overflow-hidden bg-(--db-ink) py-20 text-white" style={{ backgroundImage: OSTEON_FIELD_LIGHT }}>
        <Container className="max-w-4xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-(--db-gold)">Told amputation</div>
          <blockquote style={serif} className="mt-6 text-white text-2xl leading-snug sm:text-[34px]">
            &ldquo;{TESTIMONIAL.quote}&rdquo;
          </blockquote>
          <div className="mt-6 text-sm text-white/70">
            {TESTIMONIAL.name}, {TESTIMONIAL.place} · {TESTIMONIAL.procedure}
          </div>
          <div className="mt-2 text-[11px] text-white/40">{OUTCOME_NOTE}</div>
        </Container>
      </section>

      {/* What you get */}
      <section className="py-20">
        <Container>
          <H2>Hard cases. Gentle hands.</H2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-(--db-line) bg-(--db-line) md:grid-cols-3">
            {[
              ["Time.", "Bring your questions and your family. Nobody is rushed."],
              ["The truth.", "Including when surgery is not the answer."],
              [
                "Someone who answers.",
                <Confirm key="a" note="how patients reach him or his team after surgery">
                  Before and long after you go home.
                </Confirm>,
              ],
            ].map(([t, d], i) => (
              <div key={i} className="bg-white p-8">
                <div style={serif} className="text-2xl text-(--db-ink)">
                  {t}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-(--db-body)">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What I treat */}
      <section className="bg-(--db-bone) py-20">
        <Container>
          <H2>What I treat</H2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Link
                key={s.slug}
                href={href(`/${s.slug}`)}
                className="group flex flex-col justify-between rounded-2xl border border-(--db-line) bg-white p-7 transition hover:border-(--db-gold)/60"
              >
                <div>
                  <div className="text-xs text-(--db-muted)">0{i + 1}</div>
                  <div style={serif} className="mt-2 text-2xl text-(--db-ink)">
                    {s.title}
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-(--db-body)">{s.lead}</p>
                </div>
                <div className="mt-6 text-sm font-medium text-(--db-gold-deep) group-hover:text-(--db-ink)">More →</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Diaspora */}
      <section className="py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>From abroad</Eyebrow>
            <H2 className="mt-3">Mum is in Lagos. You are in London.</H2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-(--db-body)">
              Send the X-rays. Join the video call. Get the plan and the cost in writing before anything is booked.
              Hear from us after surgery without chasing.
            </p>
            <div className="mt-7">
              <Button to="/from-abroad">Arrange care from abroad</Button>
            </div>
          </div>
          <ol className="space-y-3">
            {["X-rays sent from anywhere", "Video consultation, family on the line", "Written plan and itemised cost", "Surgery near home", "Updates at every step"].map(
              (s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-xl border border-(--db-line) bg-white px-5 py-4">
                  <span style={serif} className="text-xl text-(--db-gold)">
                    {i + 1}
                  </span>
                  <span className="text-[15px] text-(--db-ink)">{s}</span>
                </li>
              ),
            )}
          </ol>
        </Container>
      </section>

      {/* Doctors */}
      <section className="relative overflow-hidden bg-(--db-ink) py-20 text-white" style={{ backgroundImage: OSTEON_FIELD_LIGHT }}>
        <Container>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-(--db-gold)">For colleagues</div>
          <h2 style={serif} className="mt-3 max-w-2xl text-3xl font-medium leading-tight text-white sm:text-5xl">
            {DOCTOR_HEADLINE}
          </h2>
          <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-3">
            {DOCTOR_PROMISES.map((d) => (
              <div key={d.title}>
                <div style={serif} className="text-2xl text-white">
                  {d.title}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{d.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={href("/refer")} className="rounded-full bg-white px-6 py-3 text-[15px] font-medium text-(--db-ink) hover:bg-(--db-bone)">
              Refer a patient
            </Link>
            <Link href={href("/refer/track")} className="rounded-full border border-white/30 px-6 py-3 text-[15px] font-medium text-white hover:border-white/60">
              Track a referral
            </Link>
          </div>
        </Container>
      </section>

      {/* Where */}
      <section className="py-20">
        <Container>
          <H2>Where I see patients</H2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((l) => (
              <a
                key={l.name}
                href={mapsLink(l)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-(--db-line) bg-white p-6 transition hover:border-(--db-gold)/60"
              >
                {l.hq && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--db-gold-deep)">My clinic</div>}
                <div style={serif} className="text-xl text-(--db-ink)">
                  {l.name}
                </div>
                <div className="mt-1 text-sm text-(--db-body)">{l.area}</div>
                {l.note && <div className="mt-1 text-xs text-(--db-muted)">{l.note}</div>}
                <div className="mt-4 text-xs font-medium text-(--db-gold-deep)">Map →</div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Close */}
      <section>
        <Container className="max-w-3xl text-center">
          <H2>Told nothing more can be done?</H2>
          <p className="mt-4 text-lg text-(--db-body)">Let me look first.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/second-opinion">Free second opinion</Button>
            <Button to={`https://wa.me/${DRBOLA.whatsapp}`} variant="ghost" external>
              WhatsApp
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
