import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, href } from "@/lib/drbola";
import { Container, serif } from "@/components/drbola/ui";
import { PageHero } from "@/components/drbola/blocks";

export const metadata: Metadata = {
  title: "Insights: Honest Answers on Joint Replacement and Revision",
  description: "Plain answers from an orthopaedic surgeon on knee and hip replacement, failed replacements, infection and arranging care in Nigeria from abroad.",
};

export default function InsightsPage() {
  return (
    <>
      <PageHero eyebrow="Insights" title="Straight answers." />
      <section className="py-14">
        <Container className="grid gap-5 md:grid-cols-2">
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={href(`/insights/${a.slug}`)} className="group rounded-2xl border border-(--db-line) bg-white p-7 transition hover:border-(--db-gold)/60">
              <div className="text-xs text-(--db-muted)">{a.minutes} min read</div>
              <div style={serif} className="mt-2 text-2xl leading-snug text-(--db-ink)">
                {a.title}
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-(--db-body)">{a.description}</p>
            </Link>
          ))}
        </Container>
      </section>
    </>
  );
}
