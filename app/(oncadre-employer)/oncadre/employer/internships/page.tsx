import { redirect } from "next/navigation";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { INTAKE_LABEL, MATCH_LABEL } from "@/lib/cadreHealth/internship/programme";
import { SECTIONS, type SectionKey } from "@/lib/cadreHealth/internship/questionBank";
import InternActions from "./InternActions";

export const dynamic = "force-dynamic";

/**
 * A centre's intern list: everyone who chose this centre, sat the assessment
 * and reached the centre's minimum score, best first. Contact details appear
 * once the centre invites, which is the point at which it needs them.
 */
export default async function EmployerInternshipsPage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const centre = await prisma.cadreInternshipCentre.findUnique({
    where: { employerOrgId: ctx.org.id },
    select: { id: true, name: true, slotsOffered: true, minScore: true, stage: true },
  });
  if (!centre) redirect("/oncadre/employer/dashboard");

  const prefs = await prisma.cadreInternshipPreference.findMany({
    where: {
      centreId: centre.id,
      application: { status: { in: ["ASSESSED", "PLACED"] }, attempt: { score: { gte: centre.minScore ?? 0 } } },
    },
    select: {
      id: true,
      rank: true,
      status: true,
      application: {
        select: {
          school: true,
          graduationYear: true,
          nmcnNumber: true,
          phone: true,
          professional: { select: { firstName: true, lastName: true, email: true } },
          attempt: { select: { score: true, sectionScores: true } },
        },
      },
    },
  });
  prefs.sort((a, b) => (b.application.attempt?.score ?? 0) - (a.application.attempt?.score ?? 0) || a.rank - b.rank);

  const below = await prisma.cadreInternshipPreference.count({
    where: { centreId: centre.id, application: { status: "ASSESSED", attempt: { score: { lt: centre.minScore ?? 0 } } } },
  });
  const accepted = prefs.filter((p) => p.status === "ACCEPTED").length;
  const canAct = ctx.role !== "VIEWER";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Interns, {INTAKE_LABEL}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{centre.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {prefs.length} candidates at or above your minimum of {centre.minScore ?? 0}%{below > 0 ? `, ${below} below it` : ""}.
          {centre.slotsOffered ? ` ${accepted} of ${centre.slotsOffered} places filled.` : ""}
        </p>
      </div>

      {prefs.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500" style={{ border: "1px solid #E8EBF0" }}>
          Nobody has reached your list yet. Candidates appear here as they finish the assessment.
        </div>
      ) : (
        <div className="space-y-3">
          {prefs.map((p, i) => {
            const a = p.application;
            const sections = (a.attempt?.sectionScores ?? {}) as Record<string, { correct: number; total: number }>;
            const showContact = ["INVITED", "OFFERED", "ACCEPTED"].includes(p.status);
            return (
              <div key={p.id} className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      <span className="mr-2 text-xs text-gray-400 tabular-nums">#{i + 1}</span>
                      {a.professional.firstName} {a.professional.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      BNSc, {a.school}, {a.graduationYear} · their choice {p.rank} · intern licence {a.nmcnNumber || "not yet given"}
                    </p>
                    {showContact && (
                      <p className="mt-1 text-xs text-gray-700">
                        {a.professional.email} · {a.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0B3C5D] tabular-nums">{a.attempt?.score}%</p>
                    <p className="text-xs text-gray-500">{MATCH_LABEL[p.status]}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                  {Object.entries(sections).map(([k, v]) => (
                    <span key={k} className="tabular-nums">
                      {SECTIONS[k as SectionKey] ?? k}: {v.correct}/{v.total}
                    </span>
                  ))}
                </div>
                {canAct && <InternActions preferenceId={p.id} status={p.status} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
