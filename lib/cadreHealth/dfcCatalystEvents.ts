/**
 * The DFC Catalyst Series.
 *
 * Doctors Foundation for Care runs a monthly session for practising clinicians.
 * The weekly digest carries the next one, and carries nothing once the date has
 * passed, so nobody is invited to a meeting that already happened.
 *
 * A table would be overkill while this is one entry a month typed by hand. Add
 * the next session here when it is confirmed; the digest picks it up on the
 * following Friday with no other change.
 */

export interface DfcCatalystEvent {
  /** Start of the session, with the WAT offset written in so it is unambiguous. */
  startsAt: Date;
  speaker: string;
  /** How the speaker should be described in one line, in their own register. */
  speakerBio: string;
  topic: string;
  /** Human form of the date and time, as it should read in the email. */
  when: string;
  venue: string;
  registerUrl: string;
}

export const DFC_SITE_URL = "https://www.dfcare.org";

export const DFC_CATALYST_EVENTS: DfcCatalystEvent[] = [
  {
    startsAt: new Date("2026-09-26T12:00:00+01:00"),
    speaker: "Dr. Folake Kofo-Idowu",
    speakerBio:
      "Double board-certified physician, founder and Medical Director of Nelia and its women's health service line Nelia Oasi. She practises across internal medicine, metabolic health and infectious diseases, and her work is in evidence-based menopause care, hormone optimisation and preventative women's medicine.",
    topic: "The Biological Runway: Why The Future Depends on Today, How to Reclaim the Present",
    when: "Saturday 26 September 2026, 12:00 PM WAT",
    venue: "Zoom",
    registerUrl: "https://us06web.zoom.us/meeting/register/Kt7gU0vmRKS8npHFEVDNvQ",
  },
  {
    startsAt: new Date("2026-10-24T12:00:00+01:00"),
    speaker: "Dr Tare Biu",
    speakerBio:
      "MRCP FRCPCH FRSM FWACP FMCPAED DCH, Consultant Neurodevelopmental Paediatrician in Bristol, United Kingdom.",
    topic: "Identifying and managing children with ADHD",
    when: "Saturday 24 October 2026, 12:00 PM WAT",
    venue: "Zoom",
    registerUrl: "https://www.dfcare.org/events/dfc-catalyst-series-featuring-dr-tare-biu",
  },
  {
    startsAt: new Date("2026-10-31T10:00:00+01:00"),
    speaker: "Dr. Richardson Ajayi",
    speakerBio:
      "Obstetrician and gynaecologist, healthcare entrepreneur and director. He graduated with distinction from King's College London in 1988, holds fellowships from leading medical institutions in the UK and West Africa, and founded Bridge Clinic in 1999, growing it into a leading fertility centre in West Africa.",
    topic:
      "Management of Infertility: The African Perspective. Building IVF in Nigeria: From First Cycle to Ecosystem",
    when: "Saturday 31 October 2026, 10:00 AM WAT",
    venue: "Zoom",
    registerUrl: "https://www.dfcare.org/events/dfc-october-physical-edition",
  },
];

/**
 * The next session still to come, or null when there is none on the books. The
 * digest hides the slot entirely rather than showing a stale date.
 */
export function nextCatalystEvent(now: Date = new Date()): DfcCatalystEvent | null {
  const upcoming = DFC_CATALYST_EVENTS.filter((e) => e.startsAt.getTime() > now.getTime()).sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
  return upcoming[0] ?? null;
}
