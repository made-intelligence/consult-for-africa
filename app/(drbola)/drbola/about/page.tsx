import type { Metadata } from "next";
import Image from "next/image";
import { DRBOLA } from "@/lib/drbola";
import { Button, Container, H2, serif } from "@/components/drbola/ui";
import { OsteonRings } from "@/components/drbola/Osteon";

export const metadata: Metadata = {
  title: "About Dr Bolarinwa Akinola, FRCS (Tr. & Orth.)",
  description:
    "Ibadan medical school, UK orthopaedic training on the East of England rotation, fellowships at Groote Schuur, Cape Town and James Cook, Middlesbrough, MPH from LSHTM. President, Arthroplasty Society of Nigeria.",
};

const TRAINING = [
  ["MBBS", "University of Ibadan"],
  ["Orthopaedic training", "East of England rotation, including Addenbrooke's, Cambridge and Norfolk and Norwich"],
  ["FRCS (Tr. & Orth.)", "Royal College of Surgeons of Edinburgh"],
  ["Trauma and reconstruction fellowship", "Groote Schuur Hospital, Cape Town"],
  ["Arthroplasty and revision fellowship", "James Cook University Hospital, Middlesbrough"],
  ["MPH", "London School of Hygiene and Tropical Medicine"],
];

const NOW = [
  "President, Arthroplasty Society of Nigeria",
  "Founder, Osteon Clinics, Lagos",
  "15+ peer-reviewed papers in Injury, JBJS (Br) and Hip International",
  "Contributor, Orthopaedic Biomechanics Made Easy, Cambridge University Press",
  "Member, AO Spine and EBJIS",
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-(--db-line)">
        <Container className="grid items-end gap-10 pt-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="pb-14">
            <h1 style={serif} className="text-4xl font-medium leading-[1.05] tracking-tight text-(--db-ink) sm:text-6xl">
              {DRBOLA.name}
            </h1>
            <div className="mt-3 text-(--db-muted)">{DRBOLA.postnominals}</div>
            <p style={serif} className="mt-8 max-w-xl text-2xl leading-snug text-(--db-ink)">
              &ldquo;Surgery should be the final step, not the first.&rdquo;
            </p>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-(--db-body)">
              Trained in Ibadan, then the UK and South Africa. Twenty years in three countries, most of it on the hip and
              knee, and the revision work many surgeons would rather not do. Now home, at Osteon Clinics and partner
              hospitals in Lagos and Abuja.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <OsteonRings className="absolute left-1/2 top-1/2 w-[130%] -translate-x-1/2 -translate-y-1/2 text-(--db-gold) opacity-25" />
            <Image src="/drbola/portrait-close.webp" alt={DRBOLA.name} width={800} height={597} className="relative" />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <H2>Training</H2>
            <ol className="mt-8 space-y-5 border-l border-(--db-line) pl-6">
              {TRAINING.map(([t, d]) => (
                <li key={t} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-(--db-gold) bg-(--db-ground)" />
                  <div className="font-medium text-(--db-ink)">{t}</div>
                  <div className="text-[14.5px] text-(--db-body)">{d}</div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <H2>Now</H2>
            <ul className="mt-8 space-y-4">
              {NOW.map((n) => (
                <li key={n} className="flex gap-3 text-[15.5px] text-(--db-ink)">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--db-gold)" />
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/book">Book a consultation</Button>
              <Button to={DRBOLA.linkedin} variant="ghost" external>
                LinkedIn
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
