import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { KENYA_FACILITY_SLUG, KENYA_ROLES } from "@/lib/cadreHealth/kenyaScreen";
import { candidateQuestions, readFitProfile } from "@/lib/cadreHealth/fitProfile";
import KenyaScreenForm from "./KenyaScreenForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultant roles in Nairobi, Kenya | CadreHealth",
  description: "Zuri Health is hiring a consultant obstetrician and gynaecologist, physician and paediatrician to relocate to Nairobi. Two minutes to tell us whether it suits you.",
  robots: { index: false, follow: false },
};

export default async function KenyaPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const jobs = await prisma.cadreMandate.findMany({
    where: { facility: { slug: KENYA_FACILITY_SLUG }, status: "OPEN", isPublished: true },
    select: { slug: true, id: true, title: true, subSpecialty: true, fitProfile: true },
  });
  // The client's own questions, once they have answered the fit request.
  const questionsByRole = Object.fromEntries(
    KENYA_ROLES.map((r) => [r.value, candidateQuestions(readFitProfile(jobs.find((j) => j.subSpecialty === r.subSpecialty)?.fitProfile))]),
  );
  const linkFor = (sub: string) => {
    const j = jobs.find((x) => x.subSpecialty === sub);
    return j ? `/oncadre/jobs/${j.slug ?? j.id}` : null;
  };

  return (
    <main className="bg-[#F8F9FB] min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Zuri Health, Nairobi</p>
        <h1 className="mt-2 font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>
          Three consultant roles for doctors ready to relocate to Kenya
        </h1>
        <p className="mt-3 text-gray-600">
          Zuri Health runs telemedicine, embedded clinics and home care across Africa from Nairobi. They have asked us to find a consultant obstetrician and gynaecologist, a consultant physician and a consultant paediatrician. Each role needs specialist registration with the Kenya Medical Practitioners and Dentists Council; if you are not registered yet, we will take you through it.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {KENYA_ROLES.map((r) => {
            const href = linkFor(r.subSpecialty);
            return (
              <li key={r.value} className="text-gray-700">
                {r.label}
                {href && (
                  <>
                    {" "}
                    <Link href={href} className="text-[#0B3C5D] font-medium hover:underline">read the brief</Link>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8" style={{ border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <p className="text-base font-semibold text-gray-900">A few questions, two minutes</p>
          <p className="mt-1 mb-6 text-sm text-gray-500">This tells us whether to put you forward. We ask for your CV afterwards.</p>
          <KenyaScreenForm defaultRole={role} questionsByRole={questionsByRole} />
        </div>
      </div>
    </main>
  );
}
