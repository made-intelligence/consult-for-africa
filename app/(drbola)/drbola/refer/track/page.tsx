import type { Metadata } from "next";
import { Container } from "@/components/drbola/ui";
import { PageHero } from "@/components/drbola/blocks";
import TrackForm from "@/components/drbola/TrackForm";

export const metadata: Metadata = {
  title: "Track a Referral",
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <>
      <PageHero eyebrow="For doctors" title="Track a referral." lead="Your reference and the email you referred with." />
      <section className="py-14">
        <Container className="max-w-3xl">
          <TrackForm />
        </Container>
      </section>
    </>
  );
}
