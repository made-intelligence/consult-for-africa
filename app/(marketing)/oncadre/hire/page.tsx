import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";

/**
 * Where a hospital arrives.
 *
 * The employer side had no front door: the only route in was a strip in the
 * footer of the CadreHealth homepage, under eleven features aimed at
 * professionals. This page is reachable as oncadre.com/hire, which is a thing a
 * person can be told on a call.
 *
 * It opens with counts queried live from the register rather than claims. The
 * product's problem was never that hospitals disbelieved the pitch; it was that
 * they signed up, searched, and were shown thirty people out of ten thousand.
 * Proof first, account afterwards.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Hire clinical staff in Nigeria | CadreHealth",
  description:
    "Search a register of verified Nigerian healthcare professionals by cadre, specialty and state. Post roles, build shortlists, and approach people directly.",
};

const SPOTLIGHT = [
  "Paediatrics",
  "Obstetrics",
  "Anaesthesia",
  "Radiology",
  "Cardiology",
  "Emergency Medicine",
];

export default async function HirePage() {
  const [total, byCadre, verified, byState, specialtyCounts] = await Promise.all([
    prisma.cadreProfessional.count({ where: { accountStatus: { not: "SUSPENDED" } } }),
    prisma.cadreProfessional.groupBy({
      by: ["cadre"],
      where: { accountStatus: { not: "SUSPENDED" } },
      _count: true,
      orderBy: { _count: { cadre: "desc" } },
      take: 6,
    }),
    prisma.cadreProfessional.count({ where: { accountStatus: "VERIFIED" } }),
    prisma.cadreProfessional.groupBy({
      by: ["state"],
      where: { accountStatus: { not: "SUSPENDED" }, state: { not: null } },
      _count: true,
      orderBy: { _count: { state: "desc" } },
      take: 6,
    }),
    Promise.all(
      SPOTLIGHT.map(async (term) => ({
        term,
        count: await prisma.cadreProfessional.count({
          where: {
            accountStatus: { not: "SUSPENDED" },
            subSpecialty: { contains: term, mode: "insensitive" },
          },
        }),
      })),
    ),
  ]);

  return (
    <main className="bg-white">
      <section
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        style={{
          background: "linear-gradient(135deg, #0B3C5D 0%, #0E4D6E 55%, #0B3C5D 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 70% at 85% 15%, rgba(212,175,55,0.16) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            For hospitals and clinics
          </p>
          <h1
            className="mt-4 font-bold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.1 }}
          >
            {total.toLocaleString()} Nigerian healthcare professionals, in one place
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base sm:text-lg"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Search by cadre, specialty and state. See who holds a verified licence and
            who does not. Approach people directly, with their agreement, instead of
            posting into the dark and waiting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/oncadre/employer/register"
              className="rounded-xl px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "#D4AF37", color: "#0B3C5D", minHeight: "44px" }}
            >
              Create an employer account
            </Link>
            <Link
              href="/oncadre/employer/login"
              className="rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.25)", minHeight: "44px" }}
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Searching and posting roles are free. {verified.toLocaleString()} of these
            professionals have had a licence checked against their regulatory body.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center font-bold text-gray-900"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}
          >
            Who is on the register today
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            These are live counts, not a brochure figure.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byCadre.map((c) => (
              <div
                key={c.cadre}
                className="rounded-2xl bg-white p-6"
                style={{
                  border: "1px solid #E8EBF0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <div className="text-3xl font-bold" style={{ color: "#0B3C5D" }}>
                  {c._count.toLocaleString()}
                </div>
                <p className="mt-1 text-sm text-gray-600">{getCadreLabel(c.cadre)}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">By specialty</h3>
              <ul className="mt-3 space-y-2">
                {specialtyCounts
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <li
                      key={s.term}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{s.term}</span>
                      <span className="font-semibold" style={{ color: "#0B3C5D" }}>
                        {s.count.toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Where they have told us they are
              </h3>
              <ul className="mt-3 space-y-2">
                {byState.map((s) => (
                  <li key={s.state} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.state}</span>
                    <span className="font-semibold" style={{ color: "#0B3C5D" }}>
                      {s._count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                Location is on file for some of the register and not all of it, so these
                are a floor rather than a total.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: "#F8F9FB" }}>
        <div className="mx-auto max-w-4xl">
          <h2
            className="text-center font-bold text-gray-900"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}
          >
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Step
              n="1"
              title="Search"
              body="Filter the register by cadre, specialty, state and experience. Every person carries where our information about them came from, so you know what is confirmed and what is not."
            />
            <Step
              n="2"
              title="Shortlist"
              body="Keep the people worth keeping. Lists belong to your hospital, not to whoever built them, so a colleague picks up where you left off."
            />
            <Step
              n="3"
              title="Approach"
              body="We put your message to them and they decide. You get an answer either way, and nobody is asked twice."
            />
          </div>

          <div
            className="mt-10 rounded-2xl bg-white p-6 sm:p-8"
            style={{ border: "1px solid #E8EBF0" }}
          >
            <h3 className="font-semibold text-gray-900">
              Why we ask before handing over a phone number
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Most people on this register were listed by their regulatory body. They
              did not sign up to be called by hospitals, and a network that sells their
              details without asking is one they leave. So you can see who exists from
              the day you join, and contact runs through their consent. In practice it
              is also the reason our replies get answered.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-bold text-gray-900"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}
          >
            Start with a search, not a form
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            An account takes a minute and costs nothing. You will be looking at real
            people on the other side of it.
          </p>
          <Link
            href="/oncadre/employer/register"
            className="mt-7 inline-block rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0B3C5D, #0E4D6E)",
              boxShadow: "0 2px 8px rgba(11,60,93,0.25)",
              minHeight: "44px",
            }}
          >
            Create an employer account
          </Link>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
        style={{ background: "rgba(11,60,93,0.06)", color: "#0B3C5D" }}
      >
        {n}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}
