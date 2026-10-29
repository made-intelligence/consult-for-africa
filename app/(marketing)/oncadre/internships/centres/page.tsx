import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CURRENT_INTAKE, INTAKE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { QUESTION_COUNT, SECTIONS, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/paper";
import { PROGRAMME_EMAIL, PROGRAMME_LEAD } from "@/lib/cadreHealth/internship/outreach";
import { PUBLIC_CENTRE } from "@/lib/cadreHealth/internship/listing";
import CentreJoinForm from "./CentreJoinForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nursing interns for approved centres in Lagos | CadreHealth",
  description:
    "A ranked, assessed shortlist of the BNSc graduates who chose your centre, filtered by the minimum score you set. No fee for the 2027 intake.",
};

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const card = { border: "1px solid #E8EBF0" };

const GIVES: [string, string][] = [
  ["No exam to set or mark", `Every candidate has sat the same ${QUESTION_COUNT}-question, ${TIME_LIMIT_MINUTES}-minute paper across seven sections of day-one practice.`],
  ["Only people who chose you", "Your list holds the graduates who ranked your centre and reached the minimum score you set, best first."],
  ["The detail behind the score", "Section scores for each candidate, so you can see who is strong on drug calculations and who on maternal care."],
  ["You keep the decision", "Invite, offer or decline from your CadreHealth login. We tell each candidate, so your team writes no letters."],
];

const STEPS: [string, string][] = [
  ["Tell us your terms", "How many places, the minimum score, when your intake starts, and who reviews candidates."],
  ["Graduates apply", "They choose up to five centres and sit the assessment on a private link."],
  ["Your list fills", "Candidates appear, ranked, as they finish. Contact details open when you invite."],
  ["Interview and offer", "Your usual interview. Offers and acceptances are recorded, so a place never sits unfilled."],
];

/** The example card is illustrative and says so. */
const EXAMPLE = {
  score: 81,
  sections: [
    ["Fundamentals", 6], ["Medical and surgical", 5], ["Drug calculations", 6], ["Maternal and child", 4], ["Infection prevention", 5], ["Ethics", 5], ["Emergency", 3],
  ] as [string, number][],
};

export default async function CentresPage() {
  const [centres, applicants] = await Promise.all([
    prisma.cadreInternshipCentre.findMany({ where: PUBLIC_CENTRE, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } }),
  ]);

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <section style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #072A42 100%)` }}>
        <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>For NMCN-approved internship centres, Lagos</p>
            <h1 className="mt-3 font-bold leading-[1.1] text-white" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
              Your interns, assessed and ranked before they reach you.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Stop setting your own exam for a pile of letters. Receive a shortlist of the BNSc graduates who chose your centre, at the score you set.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#join" className="rounded-xl px-6 py-3 text-sm font-semibold" style={{ background: GOLD, color: NAVY }}>Ask to join the {INTAKE_LABEL}</a>
              <span className="self-center text-sm text-white/70">No fee to the centre for this intake</span>
            </div>
          </div>

          {/* What a centre sees */}
          <div className="rounded-2xl bg-white p-5 shadow-2xl" aria-label="Example of a candidate on a centre's list">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Example candidate</p>
                <p className="mt-1 text-sm font-semibold text-gray-900"><span className="mr-1.5 text-xs text-gray-400">#1</span>BNSc graduate, 2026</p>
                <p className="text-xs text-gray-500">Chose your centre first</p>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: NAVY }}>{EXAMPLE.score}%</p>
            </div>
            <div className="mt-4 space-y-1.5">
              {EXAMPLE.sections.map(([s, n]) => (
                <div key={s} className="grid grid-cols-[7.5rem_1fr_1.75rem] items-center gap-2 text-[11px] text-gray-600">
                  <span className="truncate">{s}</span>
                  <span className="h-1.5 rounded-full bg-gray-100"><span className="block h-1.5 rounded-full" style={{ width: `${(n / 6) * 100}%`, background: NAVY }} /></span>
                  <span className="text-right tabular-nums">{n}/6</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {["Invite to interview", "Offer a place", "Decline"].map((b, i) => (
                <span key={b} className="flex-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold" style={i === 0 ? { background: NAVY, color: "#fff" } : { border: "1px solid #E8EBF0", color: "#4B5563" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-14 sm:px-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">What your centre gets</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {GIVES.map(([h, b]) => (
              <div key={h} className="rounded-2xl bg-white p-6" style={card}>
                <p className="font-semibold text-gray-900">{h}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{b}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([h, b], i) => (
              <li key={h} className="rounded-2xl bg-white p-5" style={card}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: NAVY }}>{i + 1}</span>
                <p className="mt-3 font-semibold text-gray-900">{h}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl p-6" style={{ background: NAVY }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Your nursing pipeline</p>
            <p className="mt-2 text-lg font-semibold text-white">The year ends. The relationship does not.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Every applicant joins CadreHealth as a nurse. When you hire staff nurses, the interns you trained, and the strong candidates you had no place for, are already on the platform.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6" style={card}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nursing development</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">A picture of what new graduates are ready for</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Across the intake we see where graduates are strong and where they are not, section by section: {Object.values(SECTIONS).slice(0, 3).join(", ").toLowerCase()} and four more. Taking part puts your centre in the conversation with nursing schools about closing those gaps.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Fee", `None to the centre for the ${INTAKE_LABEL}. Nothing to graduates, ever.`],
            ["Data", "Each centre sees only the graduates who chose it and agreed to share. Handled under the Nigeria Data Protection Act."],
            ["NMCN", "The internship, its rules and the approval of centres stay with NMCN. We make application and selection simpler."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-2xl bg-white p-5" style={card}>
              <p className="text-sm font-semibold text-gray-900">{h}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{b}</p>
            </div>
          ))}
        </section>

        <section id="join" className="scroll-mt-24 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ask to join</h2>
            <p className="mt-2 text-gray-600">Your centre is listed for graduates only once you agree. Tell us who to talk to and we send your private link to claim the account. We reply within one working day.</p>
            {applicants >= 25 && <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>{applicants} graduates have applied for the {INTAKE_LABEL} so far.</p>}
            <div className="mt-6 rounded-2xl bg-white p-5" style={card}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your contact</p>
              <p className="mt-2 font-semibold text-gray-900">{PROGRAMME_LEAD.name}</p>
              <p className="text-sm text-gray-500">{PROGRAMME_LEAD.role}</p>
              <a href={`mailto:${PROGRAMME_EMAIL}?subject=Internship centre`} className="mt-2 inline-block text-sm font-semibold" style={{ color: NAVY }}>{PROGRAMME_EMAIL}</a>
            </div>
            {centres.length > 0 && (
              <div className="mt-4 rounded-2xl bg-white p-5" style={card}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Taking part</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-800">
                  {centres.map((c) => <li key={c.id}>{c.name}</li>)}
                </ul>
              </div>
            )}
            <Link href="/oncadre/internships" className="mt-4 inline-block text-sm text-gray-500 underline">See the page graduates apply on</Link>
          </div>
          <div className="rounded-3xl bg-white p-6 sm:p-8" style={{ ...card, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(11,60,93,0.08)" }}>
            <CentreJoinForm />
          </div>
        </section>
      </div>
    </main>
  );
}
