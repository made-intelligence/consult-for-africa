import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, href } from "@/lib/drbola";
import { Button, Confirm, Container, Eyebrow, H2, serif } from "@/components/drbola/ui";
import { Faqs, JsonLd, PageHero, faqSchema } from "@/components/drbola/blocks";

/**
 * The diaspora page. The buyer is usually a son or daughter in the UK, US or
 * Canada paying for a parent at home, or a Nigerian abroad timing surgery
 * around a trip. They search from abroad, decide from abroad, and need to be
 * kept informed from abroad.
 */

export const metadata: Metadata = {
  title: "Hip and Knee Surgery in Nigeria for Diaspora Families, Arranged from the UK or US",
  description:
    "Arrange a hip or knee replacement or revision for a parent in Nigeria from the UK, US or Canada. Remote X-ray review, video consultation, written plan and cost, and updates without chasing.",
};

const STEPS = [
  ["Send the X-rays", "From wherever you are. A recent local X-ray and a short summary."],
  ["Video consultation", "Your parent in the room, you on the line. Their GP too, if they like."],
  ["Plan and cost, in writing", "Surgeon, hospital, implant, stay. Itemised, before anything is booked."],
  ["Surgery near family", "In Lagos or Abuja, to the standard I trained to in the UK."],
  ["Updates you don't chase", "After the operation, at discharge, at every review."],
];

const TRIP = [
  ["Days 1 to 2", "Arrive, settle, final assessment."],
  ["Day 3", "Surgery."],
  ["Days 4 to 7", "Inpatient recovery."],
  ["Days 8 to 14", "Physiotherapy, then cleared to fly."],
];

const FAQS = [
  {
    q: "Can I arrange a knee replacement for my mother in Nigeria from the UK?",
    a: "Yes. Most of it happens remotely: X-rays reviewed, a video consultation with you on the line, a written plan and cost. You only need to be there if you want to be.",
  },
  {
    q: "How will I know how the operation went?",
    a: "We agree a family contact and how you want to hear from us before surgery. You hear after the operation, at discharge and at each review.",
  },
  {
    q: "Is it cheaper than surgery abroad?",
    a: "Usually, once flights, accommodation and time away are counted. More importantly, your parent recovers at home, near the people who will look after them.",
  },
  {
    q: "I live abroad. Can I have my own surgery while I visit?",
    a: "Yes. Plan around two weeks in the country. I review your imaging before you book flights so the trip is worth making.",
  },
];

export default function FromAbroadPage() {
  const guide = ARTICLES.find((a) => a.slug === "arranging-joint-surgery-for-a-parent-in-nigeria");
  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <PageHero
        eyebrow="Care from abroad"
        title="Mum is in Lagos. You are in London."
        lead="You do not need to fly home to get her the right surgeon. Most of it can be done from where you are."
      >
        <Button to="/second-opinion">Send her X-rays</Button>
        <Button to="/book" variant="ghost">
          Book a video consultation
        </Button>
      </PageHero>

      <section className="py-16">
        <Container>
          <H2>How it works</H2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-(--db-line) bg-white p-6">
                <div style={serif} className="text-2xl text-(--db-gold)">
                  {i + 1}
                </div>
                <div className="mt-3 font-medium text-(--db-ink)">{t}</div>
                <div className="mt-1 text-[14px] leading-relaxed text-(--db-body)">{d}</div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-(--db-bone) py-16">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Coming home for it</Eyebrow>
            <H2 className="mt-3">Two weeks.</H2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-(--db-body)">
              For a joint replacement, if you are travelling in yourself.{" "}
              <Confirm note="the typical itinerary, and whether airport pickup and accommodation are arranged">
                We help with the logistics.
              </Confirm>
            </p>
          </div>
          <ol className="divide-y divide-(--db-line) rounded-2xl border border-(--db-line) bg-white">
            {TRIP.map(([d, t]) => (
              <li key={d} className="flex items-baseline gap-6 px-6 py-4">
                <span className="w-28 shrink-0 text-sm font-medium text-(--db-gold-deep)">{d}</span>
                <span className="text-[15px] text-(--db-ink)">{t}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <H2>Questions families ask</H2>
          <div className="mt-8">
            <Faqs items={FAQS} />
          </div>
          {guide && (
            <Link href={href(`/insights/${guide.slug}`)} className="mt-8 block rounded-2xl border border-(--db-line) bg-white p-6 hover:border-(--db-gold)/60">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">Guide</div>
              <div style={serif} className="mt-2 text-xl text-(--db-ink)">
                {guide.title}
              </div>
            </Link>
          )}
        </Container>
      </section>
    </>
  );
}
