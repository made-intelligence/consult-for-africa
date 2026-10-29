import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CURRENT_INTAKE, INTAKE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { QUESTION_COUNT, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/paper";
import { PROGRAMME_EMAIL, PROGRAMME_LEAD } from "@/lib/cadreHealth/internship/outreach";
import ClaimForm from "./ClaimForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim your centre | CadreHealth",
  robots: { index: false, follow: false },
};

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const card = { border: "1px solid #E8EBF0" };

/** The private page a centre uses to claim its account and agree to be listed. */
export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const centre = await prisma.cadreInternshipCentre.findUnique({
    where: { claimToken: token },
    select: { id: true, name: true, listed: true, employerOrgId: true, contactName: true, contactRole: true, contactEmail: true, contactPhone: true },
  });
  if (!centre) notFound();
  const applicants = await prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } });
  const claimed = centre.listed && !!centre.employerOrgId;

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <section style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #072A42 100%)` }}>
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>Nursing internship, {INTAKE_LABEL}</p>
          <h1 className="mt-3 font-bold leading-tight text-white" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {claimed ? `${centre.name} is taking part` : `Claim ${centre.name}'s account`}
          </h1>
          <p className="mt-3 text-white/80">
            {claimed
              ? "This centre has already been claimed and is listed for graduates."
              : "Five minutes. Graduates cannot choose your centre until you claim it, and nothing is published without your agreement."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        {claimed ? (
          <div className="rounded-2xl bg-white p-6" style={card}>
            <p className="text-sm text-gray-700">If you claimed it, log in to see your list of candidates. If a colleague claimed it, ask them to add you, or write to {PROGRAMME_EMAIL}.</p>
            <Link href="/oncadre/employer/login" className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: NAVY }}>Log in</Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-6" style={card}>
              <p className="text-sm font-semibold text-gray-900">What claiming does</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li><span className="font-semibold text-gray-900">Lists your centre: </span>BNSc graduates applying for the {INTAKE_LABEL} can choose {centre.name}.</li>
                <li><span className="font-semibold text-gray-900">Gives you a login: </span>your list shows each graduate who chose you and reached your minimum score, ranked, with section scores from a {QUESTION_COUNT}-question, {TIME_LIMIT_MINUTES}-minute assessment.</li>
                <li><span className="font-semibold text-gray-900">Leaves the decision with you: </span>you invite, offer or decline. We tell each candidate.</li>
                <li><span className="font-semibold text-gray-900">Costs nothing: </span>no fee to the centre for the {INTAKE_LABEL}.</li>
                <li><span className="font-semibold text-gray-900">Can be undone: </span>write to us and we take the centre off the list.</li>
              </ul>
              {applicants >= 25 && <p className="mt-4 text-sm font-semibold" style={{ color: NAVY }}>{applicants} graduates have applied for the {INTAKE_LABEL} so far.</p>}
            </div>
            <div className="rounded-3xl bg-white p-6 sm:p-8" style={{ ...card, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(11,60,93,0.08)" }}>
              <ClaimForm
                token={token}
                centreName={centre.name}
                initial={{ name: centre.contactName ?? "", role: centre.contactRole ?? "", email: centre.contactEmail?.includes("info") ? "" : centre.contactEmail ?? "", phone: centre.contactPhone ?? "" }}
              />
            </div>
            <p className="text-center text-xs text-gray-500">
              Questions: {PROGRAMME_LEAD.name}, {PROGRAMME_LEAD.role}, {PROGRAMME_EMAIL}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
