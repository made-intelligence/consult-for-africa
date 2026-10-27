import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { displayNameFor } from "@/lib/cadreSalutation";
import { KENYA_FACILITY_SLUG } from "@/lib/cadreHealth/kenyaScreen";
import { FORM_QUESTIONS, NOTE_QUESTION, UNSCORED_QUESTIONS, matchFromRelocationToken, readRelocationFit } from "@/lib/cadreHealth/zuriRelocationFit";
import RelocationForm from "./RelocationForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A move to Nairobi | CadreHealth", robots: { index: false, follow: false } };

export default async function RelocationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const matchId = matchFromRelocationToken(token);
  if (!matchId) notFound();

  const match = await prisma.cadreMandateMatch.findUnique({
    where: { id: matchId },
    select: {
      notes: true,
      mandate: { select: { title: true, facility: { select: { slug: true } } } },
      professional: { select: { firstName: true, lastName: true, subSpecialty: true, specialtyConfirmedAt: true, cadre: true } },
    },
  });
  if (!match || match.mandate.facility?.slug !== KENYA_FACILITY_SLUG) notFound();

  const answered = readRelocationFit(match.notes);
  // Points and flags stay on the server, so the form cannot be answered to the scoring.
  const questions = FORM_QUESTIONS.map((q) => ({
    key: q.key,
    label: q.label,
    hint: q.hint,
    unscored: UNSCORED_QUESTIONS.some((u) => u.key === q.key),
    options: q.options.map((o) => ({ value: o.value, label: o.label })),
  }));

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <p>
        <span className="text-lg font-bold text-[#0B3C5D]">Cadre</span>
        <span className="text-lg font-bold text-[#D4AF37]">Health</span>
      </p>
      <h1 className="mt-6 font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)" }}>
        What a move to Nairobi would involve for you
      </h1>
      <p className="mt-3 text-gray-600">
        {displayNameFor(match.professional)}, thank you for applying for the {match.mandate.title.replace(/\s*\(Nairobi, Kenya\)\s*$/, "")} role
        with Zuri Health. Before we introduce you, a few questions on the move itself. It takes about two minutes.
      </p>
      {answered && (
        <p className="mt-3 rounded-lg px-3 py-2 text-sm text-gray-600" style={{ background: "#F8F9FB", border: "1px solid #E8EBF0" }}>
          You answered these on {answered.answeredAt}. Sending again replaces your earlier answers.
        </p>
      )}
      <div className="mt-8 rounded-2xl bg-white p-5 sm:p-7" style={{ border: "1px solid #E8EBF0" }}>
        <RelocationForm token={token} questions={questions} noteQuestion={NOTE_QUESTION} />
      </div>
    </main>
  );
}
