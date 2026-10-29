import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CURRENT_INTAKE, INTAKE_LABEL, MAX_PREFERENCES } from "@/lib/cadreHealth/internship/programme";
import { QUESTION_COUNT, SECTIONS, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/paper";
import { PROGRAMME_EMAIL, PROGRAMME_LEAD } from "@/lib/cadreHealth/internship/outreach";
import InternshipApplyForm from "./InternshipApplyForm";
import PracticeQuestions from "./PracticeQuestions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nursing internship places in Lagos | CadreHealth",
  description:
    "One application and one assessment for BNSc graduates seeking an NMCN internship place at approved centres in Lagos. Free for nurses.",
};

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const card = { border: "1px solid #E8EBF0" };

const STEPS: [string, string][] = [
  ["Apply", `Two minutes. Your details, your university, and up to ${MAX_PREFERENCES} centres in the order you want them.`],
  ["Sit the assessment", `A private link comes to your email. ${QUESTION_COUNT} questions in ${TIME_LIMIT_MINUTES} minutes, once, on your phone or a laptop, when you are ready.`],
  ["Centres see your result", "Each centre you chose sees your score on a ranked list. No centre sees you unless you chose it."],
  ["Interview and offer", "A centre invites you to interview and makes the decision. We email you at every step, and you accept your offer on your page."],
];

const FAQS: [string, string][] = [
  ["Who can apply?", "Graduates of a university BNSc programme who need their NMCN internship year. HND graduates from colleges of nursing follow a different route that NMCN has not finalised, so they cannot apply here yet."],
  ["Does it cost anything?", "No. CadreHealth charges nurses nothing, and no centre may ask you for money for a place. If anyone does, tell us."],
  ["Can I sit the assessment again?", "No. You sit it once for this intake, so start when you have a quiet place and a steady connection."],
  ["What if my connection drops?", "Your answers save as you go. The clock keeps running if you close the page, so reopen your link as soon as you can."],
  ["Do I still apply to each hospital?", "Not for centres taking part. The centre interviews you and may ask for your documents, but you do not sit its exam."],
  ["What if a centre does not take me?", "Your other choices are not affected. Rank more than one centre to give yourself the best chance."],
  ["Is this an NMCN scheme?", "No. CadreHealth works alongside NMCN's rules: the internship, its length and its approval of centres are all NMCN's. We make the application and selection simpler."],
  ["What happens to my details?", "Only the centres you chose see them, and only after you agree. Your phone and email reach a centre once it invites you to interview."],
];

export default async function InternshipsPage() {
  const [centres, applicants] = await Promise.all([
    prisma.cadreInternshipCentre.findMany({
      where: { stage: { not: "DECLINED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, area: true, stage: true },
    }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } }),
  ]);
  const participating = centres.filter((c) => c.stage === "COMMITTED").length;
  const byArea = new Map<string, typeof centres>();
  for (const c of centres) {
    const a = c.area && c.area !== "Lagos" ? c.area : "Across Lagos";
    byArea.set(a, [...(byArea.get(a) ?? []), c]);
  }
  const areas = [...byArea.entries()].sort((a, b) => (a[0] === "Across Lagos" ? 1 : b[0] === "Across Lagos" ? -1 : b[1].length - a[1].length));

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #072A42 100%)` }}>
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Nursing internship, {INTAKE_LABEL}, Lagos</p>
          <h1 className="mt-3 max-w-3xl font-bold leading-[1.1] text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Apply once. Reach every approved centre you choose.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            One application and one assessment for your NMCN internship year, in place of a letter and an exam at every hospital.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="rounded-xl px-6 py-3 text-sm font-semibold" style={{ background: GOLD, color: NAVY }}>Apply now, free</a>
            <a href="#try" className="rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ border: "1px solid rgba(255,255,255,0.35)" }}>Try three questions</a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4" style={{ background: "rgba(255,255,255,0.12)" }}>
            {[
              [String(centres.length || 31), "approved centres"],
              [`Up to ${MAX_PREFERENCES}`, "centres, ranked by you"],
              [`${QUESTION_COUNT} in ${TIME_LIMIT_MINUTES}`, "questions, minutes"],
              ["₦0", "to apply, always"],
            ].map(([k, v]) => (
              <div key={v} className="p-4 sm:p-5" style={{ background: "rgba(7,42,66,0.6)" }}>
                <dt className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{k}</dt>
                <dd className="mt-0.5 text-xs text-white/70">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-14 sm:px-6">
        {/* Before and after */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6" style={card}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Until now</p>
            <ul className="mt-3 space-y-2.5 text-gray-600">
              <li>A letter to every hospital, one at a time</li>
              <li>A separate exam at each, often on the same days</li>
              <li>Weeks of waiting with no word either way</li>
            </ul>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: `2px solid ${NAVY}` }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: NAVY }}>Here</p>
            <ul className="mt-3 space-y-2.5 font-medium text-gray-900">
              <li>One application, two minutes</li>
              <li>One assessment, sat once, when you are ready</li>
              <li>Your result to every centre you choose, and an email at every step</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
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
          <p className="mt-4 text-sm text-gray-500">The centre still interviews you and makes the decision. The assessment replaces its written exam, not its judgement.</p>
        </section>

        {/* The paper */}
        <section id="try" className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What the assessment covers</h2>
            <p className="mt-2 text-gray-600">What a ward needs from an intern on day one. Seven sections, six questions each.</p>
            <ul className="mt-5 space-y-2">
              {Object.values(SECTIONS).map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm text-gray-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold" style={{ background: "rgba(11,60,93,0.08)", color: NAVY }}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-gray-500">When you finish you see your score by section, so you know where you stand before any interview.</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-900">Try three practice questions</p>
            <PracticeQuestions />
          </div>
        </section>

        {/* Centres */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900">The approved centres</h2>
            <p className="text-sm text-gray-500">
              {participating > 0 ? `${participating} taking their intern lists through CadreHealth now` : "Centres receive your result as they join this intake"}
            </p>
          </div>
          <p className="mt-2 text-gray-600">Every centre here is on NMCN&apos;s list of approved internship centres in Lagos. You choose up to {MAX_PREFERENCES} on the form.</p>
          {centres.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-gray-500" style={card}>The list of centres is being loaded. Please check back shortly.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map(([area, list]) => (
                <div key={area} className="rounded-2xl bg-white p-5" style={card}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{area}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
                    {list.map((c) => (
                      <li key={c.id} className="flex items-start justify-between gap-2">
                        <span>{c.name}</span>
                        {c.stage === "COMMITTED" && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#ecfdf5", color: "#065f46" }}>Taking part</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Apply */}
        <section id="apply" className="scroll-mt-24">
          <div className="rounded-3xl bg-white p-6 sm:p-10" style={{ ...card, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(11,60,93,0.08)" }}>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Apply for the {INTAKE_LABEL}</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">Two minutes now. The assessment when you are ready.</h2>
              <p className="mt-2 mb-8 text-sm text-gray-500">
                We email you a private link. Nothing goes to a centre until you finish the assessment{applicants >= 25 ? `, and ${applicants} graduates have applied so far` : ""}.
              </p>
            </div>
            <InternshipApplyForm centres={centres.map((c) => ({ id: c.id, name: c.name, area: c.area, participating: c.stage === "COMMITTED" }))} />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
          <div className="mt-6 divide-y rounded-2xl bg-white" style={card}>
            {FAQS.map(([q, a]) => (
              <details key={q} className="group px-5 py-4" style={{ borderColor: "#F1F3F6" }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
                  {q}
                  <span className="text-xl leading-none text-gray-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Who runs it */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6" style={card}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Who runs this</p>
            <p className="mt-2 font-semibold text-gray-900">{PROGRAMME_LEAD.name}</p>
            <p className="text-sm text-gray-500">{PROGRAMME_LEAD.role}, CadreHealth</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              CadreHealth is the health workforce platform of Consult For Africa. We run this as health systems work: internship places filled on merit, and a clear picture of what new nurses are ready for.
            </p>
            <a href={`mailto:${PROGRAMME_EMAIL}?subject=Nursing internship`} className="mt-3 inline-block text-sm font-semibold" style={{ color: NAVY }}>{PROGRAMME_EMAIL}</a>
          </div>
          <div className="rounded-2xl p-6" style={{ background: NAVY }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>For approved centres</p>
            <p className="mt-2 text-lg font-semibold text-white">A ranked shortlist instead of setting your own exam</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">You set the places and the minimum score. You interview and decide. No fee for the {INTAKE_LABEL}.</p>
            <Link href="/oncadre/internships/centres" className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ background: GOLD, color: NAVY }}>
              How it works for centres
            </Link>
          </div>
        </section>
      </div>

      {/* Mobile apply bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 p-3 pr-20 sm:hidden" style={{ background: "linear-gradient(to top, #F8F9FB 60%, transparent)" }}>
        <a href="#apply" className="block rounded-xl py-3 text-center text-sm font-semibold text-white shadow-lg" style={{ background: NAVY }}>Apply now, free</a>
      </div>
    </main>
  );
}
