import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { KINSHIP_ROLES } from "@/lib/cadreHealth/kinshipScreen";
import KinshipScreenForm from "./KinshipScreenForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nursing roles with Kinship | CadreHealth",
  description: "Kinship is hiring two visiting nurses and a Kinkeeper in Lagos. Five minutes of questions decide who goes forward.",
  robots: { index: false, follow: false },
};

export default async function KinshipPage({ searchParams }: { searchParams: Promise<{ role?: string; ref?: string }> }) {
  const { role, ref } = await searchParams;
  // The link in the invitation carries the applicant's id, so they do not retype what the first form took.
  const known = ref
    ? await prisma.cadreProfessional.findUnique({ where: { id: ref }, select: { firstName: true, lastName: true, email: true, phone: true } })
    : null;
  const prefill = known ? { name: `${known.firstName} ${known.lastName}`.trim(), email: known.email, phone: known.phone ?? "" } : {};

  return (
    <main className="bg-[#F8F9FB] min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Kinship, through CadreHealth</p>
        <h1 className="mt-2 font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>
          Nursing roles caring for older members at home
        </h1>
        <p className="mt-3 text-gray-600">
          Kinship helps families abroad, most of them in the UK, look after someone they love in Lagos: nurse visits at home, a shared record, and a named Kinkeeper who holds that person&apos;s care over time. They have asked us to find two visiting nurses and one Kinkeeper.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
          {KINSHIP_ROLES.map((r) => (
            <li key={r.value}>{r.label}</li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8" style={{ border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <p className="text-base font-semibold text-gray-900">Fourteen questions, about five minutes</p>
          <p className="mt-1 mb-6 text-sm text-gray-500">Three of them are situations you would meet on a home visit. Answer as you would act, not as you think we want.</p>
          <KinshipScreenForm defaultRole={role} prefill={prefill} />
        </div>
      </div>
    </main>
  );
}
