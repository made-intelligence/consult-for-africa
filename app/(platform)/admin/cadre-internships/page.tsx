import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";
import { CURRENT_INTAKE, INTAKE_LABEL, STAGE_LABEL } from "@/lib/cadreHealth/internship/programme";
import CentreRow from "./CentreRow";

export const dynamic = "force-dynamic";

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];
const STAGES = ["PROSPECT", "CONTACTED", "MEETING", "COMMITTED", "DECLINED"] as const;

/**
 * The internship centres and our engagement with each, plus the applicant
 * pool. One page for the people working the list: who owns which centre, what
 * happens next, and how many nurses have already chosen it, which is the
 * strongest thing to say to a centre that has not yet joined.
 */
export default async function CadreInternshipsAdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");

  const [centres, staff, orgs, apps, assessed, scoreAgg, choiceCounts, recent] = await Promise.all([
    prisma.cadreInternshipCentre.findMany({ orderBy: [{ stage: "desc" }, { name: "asc" }] }),
    prisma.user.findMany({
      where: { role: { in: [...ALLOWED] as never } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.cadreEmployerOrg.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE, status: { in: ["ASSESSED", "PLACED"] } } }),
    prisma.cadreInternshipAttempt.aggregate({ where: { submittedAt: { not: null }, application: { intake: CURRENT_INTAKE } }, _avg: { score: true } }),
    prisma.cadreInternshipPreference.groupBy({ by: ["centreId"], where: { application: { intake: CURRENT_INTAKE } }, _count: { _all: true } }),
    prisma.cadreInternshipApplication.findMany({
      where: { intake: CURRENT_INTAKE },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        school: true,
        status: true,
        createdAt: true,
        professional: { select: { firstName: true, lastName: true } },
        attempt: { select: { score: true } },
        _count: { select: { preferences: true } },
      },
    }),
  ]);

  const choices = new Map(choiceCounts.map((c) => [c.centreId, c._count._all]));
  const byStage = Object.fromEntries(STAGES.map((s) => [s, centres.filter((c) => c.stage === s).length]));
  const slots = centres.filter((c) => c.stage === "COMMITTED").reduce((n, c) => n + (c.slotsOffered ?? 0), 0);
  const staffName = new Map(staff.map((u) => [u.id, u.name]));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <Link href="/admin/cadrehealth" className="text-xs text-gray-500 hover:text-gray-800">CadreHealth admin</Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Nurse internship placement, {INTAKE_LABEL}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Applicants apply at <Link href="/oncadre/internships" className="underline">/oncadre/internships</Link>. A centre sees its list once it is Committed and linked to an employer login.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Centres committed", `${byStage.COMMITTED} of ${centres.length}`],
          ["In conversation", String(byStage.MEETING + byStage.CONTACTED)],
          ["Places committed", String(slots)],
          ["Applicants", String(apps)],
          ["Assessed", String(assessed)],
          ["Average score", scoreAgg._avg.score != null ? `${Math.round(scoreAgg._avg.score)}%` : "None yet"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white p-4" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-xs text-gray-500">{k}</p>
            <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-base font-semibold text-gray-900">Centres</h2>
        <p className="mt-0.5 text-xs text-gray-500">{STAGES.map((s) => `${STAGE_LABEL[s]} ${byStage[s]}`).join(" · ")}</p>
        <div className="mt-3 space-y-2">
          {centres.map((c) => (
            <CentreRow
              key={c.id}
              centre={{
                id: c.id,
                name: c.name,
                area: c.area,
                ownership: c.ownership,
                stage: c.stage,
                ownerUserId: c.ownerUserId,
                contactName: c.contactName,
                contactRole: c.contactRole,
                contactEmail: c.contactEmail,
                contactPhone: c.contactPhone,
                nextAction: c.nextAction,
                nextActionDue: c.nextActionDue?.toISOString().slice(0, 10) ?? null,
                notes: c.notes,
                slotsOffered: c.slotsOffered,
                minScore: c.minScore,
                intakeNote: c.intakeNote,
                employerOrgId: c.employerOrgId,
              }}
              ownerName={c.ownerUserId ? staffName.get(c.ownerUserId) ?? "Unknown" : null}
              choices={choices.get(c.id) ?? 0}
              staff={staff}
              orgs={orgs}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900">Latest applicants</h2>
        <div className="mt-3 overflow-x-auto rounded-xl bg-white" style={{ border: "1px solid #E8EBF0" }}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">University</th>
                <th className="px-4 py-2 font-medium">Centres chosen</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No applications yet.</td>
                </tr>
              )}
              {recent.map((a) => (
                <tr key={a.id} style={{ borderTop: "1px solid #F1F3F6" }}>
                  <td className="px-4 py-2 text-gray-900">{a.professional.firstName} {a.professional.lastName}</td>
                  <td className="px-4 py-2 text-gray-600">{a.school}</td>
                  <td className="px-4 py-2 text-gray-600 tabular-nums">{a._count.preferences}</td>
                  <td className="px-4 py-2 text-gray-600">{a.status.toLowerCase()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-900">{a.attempt?.score != null ? `${a.attempt.score}%` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
