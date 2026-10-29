import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DRBOLA_LIVE, DRBOLA_SITE_URL, SERVICES, serviceBySlug } from "@/lib/drbola";
import { Button, Container, H2, serif } from "@/components/drbola/ui";
import { Faqs, JsonLd, PageHero, faqSchema } from "@/components/drbola/blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).service);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: DRBOLA_LIVE ? { canonical: `${DRBOLA_SITE_URL}/${s.slug}` } : undefined,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const s = serviceBySlug((await params).service);
  if (!s) notFound();
  const toSecond = s.cta.toLowerCase().includes("second");

  return (
    <>
      <JsonLd data={faqSchema(s.faqs)} />
      <PageHero eyebrow={s.nav} title={s.title} lead={s.lead}>
        <Button to={toSecond ? "/second-opinion" : "/book"}>{s.cta}</Button>
      </PageHero>

      <section className="py-16">
        <Container className={`grid gap-12 ${s.image ? "lg:grid-cols-[1fr_20rem]" : ""}`}>
          <div>
            {s.intro.map((p) => (
              <p key={p} style={serif} className="max-w-2xl text-2xl leading-snug text-(--db-ink)">
                {p}
              </p>
            ))}

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {s.treats.map((t) => (
                <div key={t.name} className="rounded-2xl border border-(--db-line) bg-white p-6">
                  <div className="text-[16px] font-medium text-(--db-ink)">{t.name}</div>
                  <div className="mt-1 text-[14.5px] text-(--db-body)">{t.detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">Procedures</div>
                <ul className="mt-3 space-y-2">
                  {s.procedures.map((p) => (
                    <li key={p} className="flex gap-3 text-[15px] text-(--db-ink)">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--db-gold)" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">How I work</div>
                {s.approach.map((p) => (
                  <p key={p} className="mt-3 text-[15px] leading-relaxed text-(--db-body)">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
          {s.image && (
            <div className="overflow-hidden rounded-2xl bg-black lg:sticky lg:top-24 lg:self-start">
              <Image src={s.image.src} alt={s.image.alt} width={s.image.w} height={s.image.h} sizes="320px" className="max-h-[560px] w-full object-cover" />
            </div>
          )}
        </Container>
      </section>

      <section className="bg-(--db-bone) py-16">
        <Container className="max-w-3xl">
          <H2>Questions</H2>
          <div className="mt-8">
            <Faqs items={s.faqs} />
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/second-opinion">Free second opinion</Button>
            <Button to="/book" variant="ghost">
              Book a consultation
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
