import type { Metadata } from "next";
import Link from "next/link";
import { DOCTOR_HEADLINE, DOCTOR_PROMISES, DRBOLA, href } from "@/lib/drbola";
import { Container } from "@/components/drbola/ui";
import { PageHero } from "@/components/drbola/blocks";
import ReferralForm from "@/components/drbola/ReferralForm";

export const metadata: Metadata = {
  title: "Refer a Patient: Revision, Infection and Complex Orthopaedic Cases",
  description:
    "For doctors: refer revision joint replacement, infected implants, periprosthetic fractures, non-unions and complex trauma to Dr Bola Akinola. Reviewed personally within two working days, tracked online.",
};

export default function ReferPage() {
  return (
    <>
      <PageHero eyebrow="For colleagues" title={DOCTOR_HEADLINE} />
      <section className="py-14">
        <Container className="grid gap-12 lg:grid-cols-[18rem_1fr]">
          <aside className="space-y-8">
            <ul className="space-y-5">
              {DOCTOR_PROMISES.map((d) => (
                <li key={d.title}>
                  <div className="font-medium text-(--db-ink)">{d.title}</div>
                  <div className="mt-0.5 text-[14.5px] text-(--db-body)">{d.detail}</div>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-(--db-line) bg-white p-5 text-[14px] text-(--db-body)">
              <div className="font-medium text-(--db-ink)">Best for</div>
              Revision arthroplasty, failed or infected implants, periprosthetic fractures, non-union, complex trauma,
              deformity.
            </div>
            <div className="text-[14px] text-(--db-body)">
              Urgent? WhatsApp{" "}
              <a href={`https://wa.me/${DRBOLA.whatsapp}`} className="font-medium text-(--db-ink) underline">
                {DRBOLA.phoneDisplay}
              </a>
              <br />
              Already referred?{" "}
              <Link href={href("/refer/track")} className="font-medium text-(--db-ink) underline">
                Track it
              </Link>
            </div>
          </aside>
          <div className="rounded-3xl border border-(--db-line) bg-(--db-bone)/50 p-5 sm:p-8">
            <ReferralForm />
          </div>
        </Container>
      </section>
    </>
  );
}
