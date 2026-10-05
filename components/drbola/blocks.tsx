import { Container, Eyebrow, serif } from "./ui";
import { OSTEON_FIELD } from "./Osteon";

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="border-b border-(--db-line)" style={{ backgroundImage: OSTEON_FIELD }}>
      <Container className="py-14 sm:py-20">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 style={serif} className="mt-4 max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-(--db-ink) sm:text-6xl">
          {title}
        </h1>
        {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-(--db-body)">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </section>
  );
}

export function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-(--db-line) rounded-2xl border border-(--db-line) bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-(--db-ink) [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="text-(--db-gold) transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[15px] leading-relaxed text-(--db-body)">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
