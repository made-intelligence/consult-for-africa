import type { Metadata } from "next";
import { LOCATIONS, mapsLink } from "@/lib/drbola";
import { Container, serif } from "@/components/drbola/ui";
import { PageHero } from "@/components/drbola/blocks";
import PatientForm from "@/components/drbola/PatientForm";

export const metadata: Metadata = {
  title: "Book a Consultation with an Orthopaedic Surgeon in Lagos or Abuja",
  description:
    "Book a consultation with Dr Bola Akinola at Osteon Clinics, Duchess, Diamed, Q-Life in Lagos or Dover Hospital, Abuja. Itemised costs in writing before anything is booked.",
};

export default function BookPage() {
  return (
    <>
      <PageHero eyebrow="Plan your care" title="Book a consultation." lead="A proper assessment. An honest answer. The cost in writing before you commit." />
      <section className="py-14">
        <Container className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-3xl border border-(--db-line) bg-(--db-bone)/50 p-5 sm:p-8">
            <PatientForm kind="consultation" />
          </div>
          <aside className="space-y-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">Fees</div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-(--db-body)">
                Costs depend on the hospital, the implant and your case. You get an itemised quote after assessment, before
                anything is booked.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">Bring</div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-(--db-body)">
                X-rays and scans, recent blood results, and a list of your medicines.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-(--db-muted)">Locations</div>
              <ul className="mt-3 space-y-3">
                {LOCATIONS.map((l) => (
                  <li key={l.name}>
                    <a href={mapsLink(l)} target="_blank" rel="noopener noreferrer" className="group">
                      <span style={serif} className="block text-[17px] text-(--db-ink) group-hover:underline">
                        {l.name}
                      </span>
                      <span className="block text-[13px] text-(--db-muted)">{l.address}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
