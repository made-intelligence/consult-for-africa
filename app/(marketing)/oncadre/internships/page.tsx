import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { INTAKE_LABEL, MAX_PREFERENCES } from "@/lib/cadreHealth/internship/programme";
import { PER_SECTION, SECTIONS, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/questionBank";
import InternshipApplyForm from "./InternshipApplyForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nursing internship places in Lagos | CadreHealth",
  description:
    "One application and one assessment for BNSc graduates seeking an NMCN internship place at approved centres in Lagos. Free for nurses.",
};

export default async function InternshipsPage() {
  const centres = await prisma.cadreInternshipCentre.findMany({
    where: { stage: { not: "DECLINED" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, area: true, stage: true },
  });
  const participating = centres.filter((c) => c.stage === "COMMITTED").length;
  const questions = PER_SECTION * Object.keys(SECTIONS).length;

  return (
    <main className="bg-[#F8F9FB] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Nursing internship, {INTAKE_LABEL}</p>
        <h1 className="mt-2 font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)" }}>
          One application for internship places at approved centres in Lagos
        </h1>
        <p className="mt-3 text-gray-600">
          Every BNSc graduate needs a year of internship at an NMCN-approved centre before full registration, and the places are few. Today you apply to each hospital separately and sit each hospital&apos;s exam. Here you apply once, sit one assessment, and your result goes to every centre you choose. The centre still interviews you and makes the decision.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Free", "CadreHealth charges nurses nothing. No one may ask you for money for a place."],
            [`${questions} questions, ${TIME_LIMIT_MINUTES} minutes`, "Fundamentals, drug calculations, maternal and child health, infection prevention, ethics and emergencies."],
            [`Up to ${MAX_PREFERENCES} centres`, "Rank the centres you want. Each sees only the people who chose it."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-xl bg-white p-4" style={{ border: "1px solid #E8EBF0" }}>
              <p className="text-sm font-semibold text-gray-900">{h}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8" style={{ border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <p className="text-base font-semibold text-gray-900">Apply</p>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Two minutes. We email you a private link to sit the assessment when you are ready.
            {participating > 0
              ? ` ${participating} of these centres take their intern lists through CadreHealth now; the others receive your result if they join this intake.`
              : " Centres receive your result as they join this intake."}
          </p>
          <InternshipApplyForm centres={centres.map((c) => ({ id: c.id, name: c.name, area: c.area, participating: c.stage === "COMMITTED" }))} />
        </div>

        <div className="mt-10 rounded-2xl p-6 sm:p-8" style={{ background: "#0B3C5D" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">For approved centres</p>
          <p className="mt-2 text-lg font-semibold text-white">Receive a ranked, verified shortlist instead of setting your own exam</p>
          <p className="mt-2 text-sm text-white/75 leading-relaxed">
            Tell us how many places you have and the score you want. We run the assessment, check each applicant&apos;s licence and degree, and give you a ranked list of the people who chose you. You interview and decide. Joining the first intake costs the centre nothing.
          </p>
          <p className="mt-4 text-sm text-white">hello@consultforafrica.com</p>
        </div>
      </div>
    </main>
  );
}
