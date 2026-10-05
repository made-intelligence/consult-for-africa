import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES, DRBOLA, DRBOLA_LIVE, DRBOLA_SITE_URL, articleBySlug } from "@/lib/drbola";
import { Button, Container, serif } from "@/components/drbola/ui";
import { JsonLd } from "@/components/drbola/blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: DRBOLA_LIVE ? { canonical: `${DRBOLA_SITE_URL}/insights/${a.slug}` } : undefined,
    openGraph: { type: "article", title: a.title, description: a.description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  return (
    <article className="py-14 sm:py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          headline: a.title,
          description: a.description,
          author: { "@type": "Physician", name: DRBOLA.name },
          reviewedBy: { "@type": "Physician", name: DRBOLA.name },
        }}
      />
      <Container className="max-w-2xl">
        <div className="text-xs text-(--db-muted)">
          {DRBOLA.short} · {a.minutes} min read
        </div>
        <h1 style={serif} className="mt-3 text-4xl font-medium leading-[1.1] tracking-tight text-(--db-ink) sm:text-5xl">
          {a.title}
        </h1>
        <div className="mt-10 space-y-8">
          {a.body.map((b, i) => (
            <section key={i}>
              {b.h && (
                <h2 style={serif} className="mb-3 text-2xl text-(--db-ink)">
                  {b.h}
                </h2>
              )}
              {b.p.map((p) => (
                <p key={p} className="mb-4 text-[17px] leading-[1.75] text-(--db-body)">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-(--db-bone) p-7">
          <div style={serif} className="text-2xl text-(--db-ink)">
            Want me to look at yours?
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button to="/second-opinion">Free second opinion</Button>
            <Button to="/book" variant="ghost">
              Book a consultation
            </Button>
          </div>
        </div>
      </Container>
    </article>
  );
}
