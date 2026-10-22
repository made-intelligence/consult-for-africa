import Image from "next/image";
import {
  LYFE_EVENT,
  LYFE_EVENT_TAKEAWAYS,
  LYFE_PANEL,
  MEDLYFE_NAME,
  MEDLYFE_BRAND as MB,
} from "@/lib/lyfe";
import {
  AGELESS_FILMS,
  AGELESS_VOUCHER,
  MEDLYFE_FIND_US as F,
  agelessBookLink,
} from "@/lib/ageless-followup";
import FollowupForm from "./FollowupForm";

/**
 * AGELESS, the morning after.
 *
 * The invitation page had one job, filling a room. This one has three, in
 * order of what they are worth: turn the voucher in every pack into a booked
 * appointment, put The Lyfe Place in front of people who have just spent an
 * evening on why it should exist, and find out what to do better next time.
 * The booking is the dominant action at every scroll depth; the other two
 * have a section each and no more.
 *
 * The films are the only heavy thing on the page, so neither autoplays and
 * both carry a poster: most guests are on a phone, on data.
 */

const display = "var(--lyfe-display), Georgia, serif";

export default function After({ token, firstName }: { token: string | null; firstName: string | null }) {
  const speakers = LYFE_PANEL.filter((s) => s.portrait && s.name);
  return (
    <div style={{ background: MB.green, color: MB.mist }}>
      {/* ── thank you ────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(168deg, ${MB.green} 0%, ${MB.greenDeep} 65%, #0E1C15 100%)` }}>
        <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
          <p className="text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.18em" }}>
            MedLYFE presents AGELESS &middot; {LYFE_EVENT.date}
          </p>
          <h1
            className="mt-6 text-[44px] leading-[1.02] md:text-[76px]"
            style={{ fontFamily: display, fontWeight: 500, color: MB.white }}
          >
            {firstName ? `Thank you for attending, ${firstName}.` : "Thank you for attending AGELESS."}
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed md:text-[20px]" style={{ color: MB.limeSoft }}>
            This page has the event films, details of your MedLYFE voucher, the waiting list
            for The Lyfe Place and a short feedback form.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Primary href={agelessBookLink()}>Book your consultation</Primary>
            <a href="#lyfeplace" className="text-[15px] font-semibold underline underline-offset-4" style={{ color: MB.lime }}>
              Join The Lyfe Place waiting list
            </a>
            <a href="#feedback" className="text-[15px] font-semibold underline underline-offset-4" style={{ color: MB.lime }}>
              Give feedback
            </a>
          </div>
        </div>
      </section>

      {/* ── the voucher and the centre ───────────────────────────────── */}
      <section style={{ background: MB.white, color: MB.greenDeep }}>
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-24">
          <div>
            <Film film={AGELESS_FILMS.medlyfe} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase" style={{ color: MB.greenSoft, letterSpacing: "0.18em" }}>
              Your voucher
            </p>
            <h2 className="mt-4 text-[32px] leading-tight md:text-[40px]" style={{ fontFamily: display, fontWeight: 500 }}>
              {AGELESS_VOUCHER.offer ? `Your gift pack includes ${AGELESS_VOUCHER.offer}.` : "Your gift pack includes a MedLYFE voucher."}
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed" style={{ color: "#3A4A40" }}>
              To use it, book a consultation online or call {F.phoneDisplay}, and mention the
              voucher when you book
              {AGELESS_VOUCHER.validUntil ? `. It is valid until ${AGELESS_VOUCHER.validUntil}.` : "."}
            </p>
            <ul className="mt-6 space-y-2 text-[15px]" style={{ color: "#3A4A40" }}>
              <li>Longevity and preventive health assessments</li>
              <li>Metabolic health, weight and hormones</li>
              <li>Skin and regenerative aesthetics</li>
              <li>Plastic surgery consultations with Dr Chinwe Kpaduwa</li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Primary href={agelessBookLink()} dark>
                Book your consultation
              </Primary>
              <a
                href={`https://wa.me/${F.whatsapp}?text=${encodeURIComponent("Hello MedLYFE, I was at AGELESS and would like to use my voucher.")}`}
                className="text-[15px] font-semibold underline underline-offset-4"
                style={{ color: MB.greenDeep }}
              >
                Or WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── what we heard ────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.18em" }}>
            Key points from the evening
          </p>
          <h2 className="mt-4 text-[32px] leading-tight md:text-[42px]" style={{ fontFamily: display, fontWeight: 500, color: MB.white }}>
            Five key points from the panel.
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {LYFE_EVENT_TAKEAWAYS.map((t, i) => (
              <div key={t.title} className="border-t pt-5" style={{ borderColor: "rgba(196,215,166,0.25)" }}>
                <p className="text-[13px] font-semibold" style={{ color: MB.lime }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[19px] font-semibold" style={{ color: MB.white }}>
                  {t.title}
                </h3>
                <p className="mt-2 text-[15.5px] leading-relaxed" style={{ color: MB.mist }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-16 text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.18em" }}>
            Our speakers
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
            {speakers.map((s) => (
              <figure key={s.name} className="m-0">
                <div
                  className="overflow-hidden"
                  style={{ borderTopLeftRadius: 9999, borderTopRightRadius: 9999, background: MB.greenDark, aspectRatio: "0.78" }}
                >
                  <Image
                    src={s.portrait!}
                    alt={s.name!}
                    width={s.portraitWidth ?? 800}
                    height={s.portraitHeight ?? 1000}
                    sizes="(max-width: 768px) 30vw, 150px"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }}
                  />
                </div>
                <figcaption className="mt-2 text-[12px] leading-tight" style={{ color: MB.white }}>
                  {s.name!.replace(/, MD FACS$/, "")}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed" style={{ color: MB.greenSoft }}>
            Vote of thanks by Dr Itunu Akinware, Group Chief Executive, Medbury Healthcare Group.
            Hosted by Olive Emodi at Capital Club, Lagos.
          </p>
        </div>
      </section>

      {/* ── The Lyfe Place ───────────────────────────────────────────── */}
      <section id="lyfeplace" style={{ background: MB.greenDeep }}>
        <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-[11px] font-semibold uppercase" style={{ color: MB.lime, letterSpacing: "0.18em" }}>
            Coming soon
          </p>
          <h2 className="mt-4 text-[32px] leading-tight md:text-[42px]" style={{ fontFamily: display, fontWeight: 500, color: MB.white }}>
            The Lyfe Place waiting list
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed" style={{ color: MB.mist }}>
            The Lyfe Place is Medbury Healthcare Group&apos;s planned wellness park in Lagos, bringing
            longevity medicine, fitness, nutrition, aesthetics and recovery together in one place.
            MedLYFE will move in when it opens. Join the waiting list to receive updates on
            membership and the opening date.
          </p>
          <div className="mt-10">
            <Film film={AGELESS_FILMS.lyfeplace} />
          </div>
          <div className="mt-10 max-w-3xl">
            <FollowupForm kind="lyfeplace-waitlist" token={token} firstName={firstName} />
          </div>
        </div>
      </section>

      {/* ── feedback ─────────────────────────────────────────────────── */}
      <section id="feedback" style={{ background: MB.limeSoft, color: MB.greenDeep }}>
        <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <h2 className="text-[32px] leading-tight md:text-[42px]" style={{ fontFamily: display, fontWeight: 500 }}>
            Your feedback on AGELESS
          </h2>
          <div className="mt-10 max-w-3xl">
            <FollowupForm kind="ageless-feedback" token={token} firstName={firstName} />
          </div>
        </div>
      </section>

      {/* ── find us ──────────────────────────────────────────────────── */}
      <section style={{ background: MB.white, color: MB.greenDeep }}>
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase" style={{ color: MB.greenSoft, letterSpacing: "0.18em" }}>
              Find MedLYFE
            </p>
            <h2 className="mt-4 text-[30px] leading-tight" style={{ fontFamily: display, fontWeight: 500 }}>
              {MEDLYFE_NAME}
            </h2>
            <p className="mt-4 text-[16.5px]">
              <a href={F.mapUrl} target="_blank" rel="noopener" className="underline underline-offset-4">
                {F.address}
              </a>
            </p>
          </div>
          <dl className="grid gap-4 text-[16px] sm:grid-cols-2">
            <Contact k="Call" v={F.phoneDisplay} href={`tel:${F.phoneTel}`} />
            <Contact k="WhatsApp" v={F.phoneDisplay} href={`https://wa.me/${F.whatsapp}`} />
            <Contact k="Email" v={F.email} href={`mailto:${F.email}`} />
            <Contact k="Instagram" v={F.instagramHandle} href={F.instagram} />
            <Contact k="Website" v={F.websiteDisplay} href={F.website} />
            <Contact k="Book online" v="consultforafrica.com/lyfe/consult" href={agelessBookLink()} />
          </dl>
        </div>
      </section>

      <footer className="px-5 py-10 md:px-8" style={{ background: MB.greenDark }}>
        <p className="mx-auto w-full max-w-5xl text-[12px] leading-relaxed" style={{ color: MB.greenSoft }}>
          {MEDLYFE_NAME}, part of Medbury Healthcare Group. Nothing on this page is clinical advice,
          a diagnosis or a promise of a result.
        </p>
      </footer>
    </div>
  );
}

function Primary({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <a
      href={href}
      className="inline-block rounded-xl px-9 text-[15px] font-semibold transition hover:opacity-90"
      style={{
        background: dark ? MB.greenDeep : MB.lime,
        color: dark ? MB.white : MB.greenDeep,
        paddingTop: 17,
        paddingBottom: 17,
      }}
    >
      {children}
    </a>
  );
}

function Film({ film }: { film: { title: string; line: string; src: string; poster: string } }) {
  return (
    <figure className="m-0">
      <video
        controls
        playsInline
        preload="none"
        poster={film.poster}
        className="w-full rounded-2xl"
        style={{ aspectRatio: "16 / 9", background: "#000" }}
      >
        <source src={film.src} type="video/mp4" />
      </video>
      <figcaption className="mt-3 text-[14px] leading-snug" style={{ opacity: 0.85 }}>
        <strong>{film.title}.</strong> {film.line}
      </figcaption>
    </figure>
  );
}

function Contact({ k, v, href }: { k: string; v: string; href: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase" style={{ color: MB.greenSoft, letterSpacing: "0.15em" }}>
        {k}
      </dt>
      <dd className="mt-1">
        <a href={href} className="font-semibold underline underline-offset-4" target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">
          {v}
        </a>
      </dd>
    </div>
  );
}
