import type { Metadata } from "next";
import Image from "next/image";
import {
  LYFE_BRAND as C,
  LYFE_NAME,
  LYFE_PHONE_DISPLAY,
  LYFE_SURGEON,
  LYFE_VISIT,
} from "@/lib/lyfe";
import LyfeNav from "../LyfeNav";
import VisitForm from "./VisitForm";

export const metadata: Metadata = {
  title: "Facility Rounds",
  description:
    "Dr Chinwe Kpaduwa, MD FACS, is visiting clinics and hospitals across Lekki and Victoria Island to meet the doctors who would refer to her. Thirty minutes, at your facility, at a time that suits your list.",
  robots: { index: false, follow: true },
};

const display = "var(--lyfe-display), Georgia, serif";
const sans = "var(--lyfe-sans), system-ui, sans-serif";

/**
 * The facility tour, for clinicians only.
 *
 * Noindex on purpose. This is not a page for patients, and a patient landing
 * on it reads a surgeon touting for work, which is the opposite of what a
 * doctor to doctor approach is worth. It is reached from a flyer, a WhatsApp
 * message or a conversation, and from nowhere else.
 */
export default function VisitPage() {
  return (
    <div style={{ background: C.ground, color: C.body, fontFamily: sans }}>
      <LyfeNav on="visit" />

      <section className="px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
        <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <p className="text-[10.5px] font-semibold uppercase" style={{ color: C.bronze, letterSpacing: "0.2em" }}>
              {LYFE_VISIT.name} &middot; Lekki and Victoria Island
            </p>
            <h1
              className="mt-6 text-[36px] leading-[1.06] md:text-[52px]"
              style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.025em" }}
            >
              She is doing rounds.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: C.body }}>
              {LYFE_SURGEON.name} is visiting practices across Lekki and Victoria Island to meet
              the doctors who would refer to her, and to say in person what she does, what she will
              not do, and where the line sits.
            </p>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed" style={{ color: C.body }}>
              {LYFE_VISIT.minutes} minutes at your facility, at a time that suits your list. No
              presentation and nothing to sign.
            </p>
            <a
              href="#ask"
              className="mt-8 inline-block px-8 py-4 text-[15px] font-semibold"
              style={{ background: C.ink, color: C.ground }}
            >
              Ask her to visit
            </a>
          </div>

          <div>
            <div
              className="overflow-hidden"
              style={{ borderTopLeftRadius: 9999, borderTopRightRadius: 9999, background: C.groundDeep }}
            >
              <Image
                src={LYFE_SURGEON.portrait}
                alt={LYFE_SURGEON.name}
                width={LYFE_SURGEON.portraitWidth}
                height={LYFE_SURGEON.portraitHeight}
                priority
                sizes="(max-width: 768px) 60vw, 300px"
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
            <ul className="mt-5 space-y-1.5">
              {LYFE_SURGEON.credentials.slice(0, 3).map((c) => (
                <li key={c} className="text-[13.5px] leading-snug" style={{ color: C.body }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10" style={{ background: C.groundWarm }}>
        <div className="mx-auto grid w-full max-w-5xl gap-x-10 gap-y-8 md:grid-cols-3">
          {LYFE_VISIT.whatHappens.map((w, i) => (
            <div key={w.t}>
              <p className="text-[13px] font-semibold" style={{ color: C.bronze, letterSpacing: "0.1em" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-[17.5px] font-semibold" style={{ color: C.ink }}>
                {w.t}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.body }}>
                {w.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="ask" className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-xl">
          <h2
            className="text-[28px] leading-tight md:text-[36px]"
            style={{ fontFamily: display, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}
          >
            Put your practice on the round.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: C.body }}>
            Five questions. Her diary in Lagos is short and the visits are planned area by area,
            so the sooner you are on the list the easier it is to fit you in.
          </p>
          <div className="mt-9">
            <VisitForm />
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 md:px-10" style={{ background: C.ink }}>
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[13px]" style={{ color: "#8C8A84" }}>
            {LYFE_NAME} &middot; {LYFE_PHONE_DISPLAY}
          </p>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed" style={{ color: "#6F6D68" }}>
            For clinicians. Nothing on this page is an offer of inducement for referrals, and no
            fee is paid for a referral in either direction.
          </p>
        </div>
      </footer>
    </div>
  );
}
