import Link from "next/link";
import { DRBOLA, LOCATIONS, SERVICES, href, mapsLink } from "@/lib/drbola";
import { Container, serif } from "./ui";

export default function Footer() {
  return (
    <footer className="mt-24 bg-(--db-ink) text-white/70">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div style={serif} className="text-xl text-white">
            {DRBOLA.name}
          </div>
          <div className="mt-1 text-sm">{DRBOLA.postnominals}</div>
          <p className="mt-4 text-sm leading-relaxed">
            Consultant orthopaedic and reconstructive surgeon. Founder of Osteon Clinics, Lagos.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Treatment</div>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={href(`/${s.slug}`)} className="hover:text-white">
                  {s.nav}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href("/second-opinion")} className="hover:text-white">
                Free second opinion
              </Link>
            </li>
            <li>
              <Link href={href("/from-abroad")} className="hover:text-white">
                Care from abroad
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Where I see patients</div>
          <ul className="mt-3 space-y-2 text-sm">
            {LOCATIONS.map((l) => (
              <li key={l.name}>
                <a href={mapsLink(l)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {l.name}
                  <span className="block text-xs text-white/50">{l.area}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Contact</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`https://wa.me/${DRBOLA.whatsapp}`} className="hover:text-white">
                WhatsApp {DRBOLA.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${DRBOLA.email}`} className="break-all hover:text-white">
                {DRBOLA.email}
              </a>
            </li>
            <li>
              <Link href={href("/refer")} className="hover:text-white">
                Doctors: refer a patient
              </Link>
            </li>
            <li>
              <Link href={href("/refer/track")} className="hover:text-white">
                Track a referral
              </Link>
            </li>
            <li>
              <a href={DRBOLA.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-5 text-xs text-white/40">
          © {new Date().getFullYear()} {DRBOLA.name}. Information on this site does not replace a consultation.
        </Container>
      </div>
    </footer>
  );
}
